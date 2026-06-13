import type { BusinessCardTemplate } from '@/types/businessCardTemplate';
import { getCardAccentColor } from '@/types/businessCardTemplate';
import { mixHex } from '@/services/pdf/cardColorUtils';
import type { AppSettings } from '@/types/settings';

import {
  buildCardContactPills,
  buildCardContactRows,
  buildCardLogo,
  buildCardQrCode,
  buildPrestigeIconStrip,
  cardDisplayName,
  buildCardContactBadgeRows,
  cardFrontWebsite,
  getContactRows,
  getSplitBackContactRows,
  cardPersonName,
  cardPersonTitle,
  cardTagline,
  cardWebsite,
  type CardLogoContext,
} from '@/services/pdf/businessCardHtmlUtils';
import { escapeHtml } from '@/services/pdf/pdfHtmlUtils';

export interface BusinessCardPdfContext {
  settings: AppSettings;
  showWatermark: boolean;
  forPrint?: boolean;
  logoDataUri?: string | null;
}

const NAVY_DEEP = '#0D1F3C';
const PRESTIGE_NAVY = '#1B2A41';
const EXECUTIVE_GOLD = '#C9A227';
const EXEC_TEXT_WRAP = 'overflow-wrap:normal;word-break:normal;';
const ORBIT_TEXT_WRAP = 'overflow-wrap:normal;word-break:normal;';
const ROYAL_TEXT_WRAP = 'overflow-wrap:normal;word-break:normal;';
const ROYAL_GOLD = '#C5A059';
const ROYAL_PAPER = '#FBFAF8';

const CARD_PRINT_WIDTH = '3.5in';
const CARD_PRINT_HEIGHT = '2in';
const CARD_PREVIEW_WIDTH = 340;
const CARD_PREVIEW_HEIGHT = 204;

interface CardPalette {
  accent: string;
  accentDark: string;
  navy: string;
  gold: string;
  purple: string;
  purpleDark: string;
}

function logoCtx(ctx: BusinessCardPdfContext): CardLogoContext {
  return { settings: ctx.settings, logoDataUri: ctx.logoDataUri };
}

function palette(settings: AppSettings): CardPalette {
  const accent = getCardAccentColor(settings.businessCardTemplate, settings.businessCardAccentColors);
  return {
    accent,
    accentDark: accent,
    navy: accent,
    gold: accent,
    purple: accent,
    purpleDark: accent,
  };
}

function printWatermark(): string {
  return `<span style="position:absolute;bottom:3px;right:5px;font-size:5pt;color:#B0B8C4;z-index:20;">Accvo</span>`;
}

function previewCardFace(content: string): string {
  return `<div style="width:${CARD_PREVIEW_WIDTH}px;height:${CARD_PREVIEW_HEIGHT}px;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.12);flex-shrink:0;">${content}</div>`;
}

const CARD_FONT_LINK =
  '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&display=swap" rel="stylesheet">';

function singleCardPrintDocument(face: string, ctx: BusinessCardPdfContext): string {
  const wm = ctx.showWatermark ? printWatermark() : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8" />${CARD_FONT_LINK}
  <style>
    @page { size: ${CARD_PRINT_WIDTH} ${CARD_PRINT_HEIGHT}; margin: 0; }
    html, body { margin: 0; padding: 0; }
    .card-page {
      width: ${CARD_PRINT_WIDTH};
      height: ${CARD_PRINT_HEIGHT};
      position: relative;
      overflow: hidden;
    }
  </style></head><body>
  <div class="card-page">${face}${wm}</div>
  </body></html>`;
}

function dualCardDocument(front: string, back: string, ctx: BusinessCardPdfContext): string {
  if (ctx.forPrint) {
    const wm = ctx.showWatermark ? printWatermark() : '';
    return `<!DOCTYPE html><html><head><meta charset="utf-8" />${CARD_FONT_LINK}
    <style>
      @page { size: ${CARD_PRINT_WIDTH} ${CARD_PRINT_HEIGHT}; margin: 0; }
      html, body { margin: 0; padding: 0; }
      .card-page {
        width: ${CARD_PRINT_WIDTH};
        height: ${CARD_PRINT_HEIGHT};
        position: relative;
        overflow: hidden;
        page-break-after: always;
      }
      .card-page:last-child { page-break-after: auto; }
    </style></head><body>
    <div class="card-page">${front}${wm}</div>
    <div class="card-page">${back}${wm}</div>
    </body></html>`;
  }

  const watermark = ctx.showWatermark
    ? `<p style="margin:8px 0 0;font-size:10px;color:#94A3B8;text-align:center;">Created with Accvo</p>`
    : '';

  return `<!DOCTYPE html><html><head><meta charset="utf-8" />${CARD_FONT_LINK}
  <style>body{margin:0;padding:12px;font-family:Helvetica,Arial,sans-serif;background:transparent;}</style></head><body>
  <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
    <p style="margin:0;font-size:10px;font-weight:600;color:#6B7280;letter-spacing:0.06em;text-transform:uppercase;">Front</p>
    ${previewCardFace(front)}
    <p style="margin:4px 0 0;font-size:10px;font-weight:600;color:#6B7280;letter-spacing:0.06em;text-transform:uppercase;">Back</p>
    ${previewCardFace(back)}
  </div>
  ${watermark}
  </body></html>`;
}

function singleFacePreviewDocument(face: string, label: string, ctx: BusinessCardPdfContext): string {
  const watermark = ctx.showWatermark
    ? `<p style="margin:8px 0 0;font-size:10px;color:#94A3B8;text-align:center;">Created with Accvo</p>`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8" />${CARD_FONT_LINK}
  <style>body{margin:0;padding:12px;font-family:Helvetica,Arial,sans-serif;background:transparent;}</style></head><body>
  <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
    <p style="margin:0;font-size:10px;font-weight:600;color:#6B7280;letter-spacing:0.06em;text-transform:uppercase;">${label}</p>
    ${previewCardFace(face)}
  </div>
  ${watermark}
  </body></html>`;
}

/* ─── Split (default card — diagonal navy / white) ─── */
const SPLIT_FONT = "'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif";

interface SplitPalette {
  navy: string;
  lineAccent: string;
  onWhite: string;
}

function splitPalette(settings: AppSettings): SplitPalette {
  const navy = getCardAccentColor(settings.businessCardTemplate, settings.businessCardAccentColors);
  const lineAccent = mixHex(navy, '#ffffff', 0.62);
  return { navy, lineAccent, onWhite: navy };
}

function splitBrandText(
  settings: AppSettings,
  options: {
    onDark: boolean;
    navy: string;
    nameSize?: string;
    tagSize?: string;
    align?: 'left' | 'center';
  },
): string {
  const nameColor = options.onDark ? '#fff' : options.navy;
  const tagColor = options.onDark ? 'rgba(255,255,255,0.8)' : options.navy;
  const nameSize = options.nameSize ?? '13px';
  const tagSize = options.tagSize ?? '6.5px';
  const tagExtra = options.onDark ? '' : 'opacity:0.62;';
  const align = options.align ?? 'center';
  const wrap = 'overflow-wrap:normal;word-break:normal;';
  return `
    <p style="margin:0;font-family:${SPLIT_FONT};font-size:${nameSize};font-weight:700;color:${nameColor};letter-spacing:0.14em;text-transform:uppercase;line-height:1.12;text-align:${align};${wrap}">${cardDisplayName(settings)}</p>
    <p style="margin:5px 0 0;font-family:${SPLIT_FONT};font-size:${tagSize};font-weight:500;color:${tagColor};letter-spacing:0.18em;text-transform:uppercase;${tagExtra}line-height:1.35;text-align:${align};${wrap}">${cardTagline(settings)}</p>`;
}

function splitWebsiteFooter(site: string, navy: string, lineAccent: string): string {
  return `
    <div style="position:absolute;bottom:13px;left:8px;right:8px;box-sizing:border-box;">
      <div style="display:flex;align-items:center;width:100%;">
        <div style="flex:1 1 0;height:1.5px;background:${lineAccent};min-width:0;"></div>
        <span style="flex:0 0 auto;margin:0 10px;padding:3px 10px;background:${navy};font-family:${SPLIT_FONT};font-size:6px;font-weight:500;color:#fff;letter-spacing:0.06em;white-space:nowrap;line-height:1.4;">${site}</span>
        <div style="flex:1 1 0;height:1.5px;background:${lineAccent};min-width:0;"></div>
      </div>
    </div>`;
}

function buildSplitDiagonalArt(navy: string): string {
  return `
    <svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;" viewBox="0 0 340 204" preserveAspectRatio="none">
      <rect width="340" height="204" fill="#fff"/>
      <path d="M0,0 L208,0 L238,102 L208,204 L0,204 Z" fill="${navy}"/>
    </svg>`;
}

function buildWaveFront(ctx: BusinessCardPdfContext): string {
  const { settings } = ctx;
  const lctx = logoCtx(ctx);
  const { navy, lineAccent } = splitPalette(settings);
  const logo = buildCardLogo(lctx, 40, { onDark: true });
  const site = cardFrontWebsite(settings);
  const footer = site ? splitWebsiteFooter(site, navy, lineAccent) : '';
  return `
  <div style="height:100%;width:100%;background:${navy};position:relative;overflow:hidden;box-sizing:border-box;font-family:${SPLIT_FONT};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px 16px ${site ? '36px' : '20px'};">
    <div style="display:flex;align-items:center;justify-content:center;gap:12px;max-width:86%;margin:0 auto;padding:0 8px;box-sizing:border-box;">
      ${logo}
      <div style="min-width:0;flex:1 1 auto;">
        ${splitBrandText(settings, { onDark: true, navy, align: 'left' })}
      </div>
    </div>
    ${footer}
  </div>`;
}

function buildWaveBack(ctx: BusinessCardPdfContext): string {
  const { settings } = ctx;
  const lctx = logoCtx(ctx);
  const { navy, lineAccent, onWhite } = splitPalette(settings);
  const logo = buildCardLogo(lctx, 34, { onDark: false });
  const contactRows = buildCardContactBadgeRows(getSplitBackContactRows(settings), {
    textColor: '#fff',
    badgeBg: '#fff',
    iconColor: navy,
    fontSize: '6px',
    iconSize: 8,
    badgeSize: 15,
    iconColumnWidth: 15,
    gap: '5px',
    fontFamily: SPLIT_FONT,
    fillWidth: true,
  });
  return `
  <div style="height:100%;width:100%;background:#fff;position:relative;overflow:hidden;box-sizing:border-box;font-family:${SPLIT_FONT};">
    ${buildSplitDiagonalArt(navy)}
    <div style="position:absolute;top:0;left:0;width:61%;height:100%;z-index:1;box-sizing:border-box;padding:16px 10px 14px 14px;display:flex;flex-direction:column;">
      <div>
        <p style="margin:0;font-family:${SPLIT_FONT};font-size:11px;font-weight:700;color:#fff;letter-spacing:0.08em;text-transform:uppercase;line-height:1.2;">${cardPersonName(settings)}</p>
        <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
          <p style="margin:0;font-family:${SPLIT_FONT};font-size:6.5px;font-weight:400;color:rgba(255,255,255,0.9);letter-spacing:0.04em;line-height:1.3;">${cardPersonTitle(settings)}</p>
          <div style="width:30px;height:1.5px;background:${lineAccent};flex-shrink:0;"></div>
        </div>
      </div>
      <div style="margin-top:12px;flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0;overflow:hidden;">
        ${contactRows}
      </div>
    </div>
    <div style="position:absolute;top:0;bottom:0;left:70%;right:0;z-index:2;box-sizing:border-box;display:flex;align-items:center;justify-content:center;padding:10px 6px;">
      <div style="display:flex;flex-direction:column;align-items:center;text-align:center;width:100%;min-width:0;">
        ${logo}
        <div style="margin-top:${logo ? '8px' : '0'};width:100%;min-width:0;box-sizing:border-box;">
          ${splitBrandText(settings, { onDark: false, navy: onWhite, nameSize: '9.5px', tagSize: '5.5px', align: 'center' })}
        </div>
      </div>
    </div>
  </div>`;
}

/* ─── Executive (gold on navy) ─── */
function executiveColors(settings: AppSettings): { navy: string; gold: string } {
  const navy = getCardAccentColor(settings.businessCardTemplate, settings.businessCardAccentColors);
  return { navy, gold: EXECUTIVE_GOLD };
}

function buildExecutiveFront(ctx: BusinessCardPdfContext): string {
  const { settings } = ctx;
  const lctx = logoCtx(ctx);
  const { navy, gold } = executiveColors(settings);
  const site = cardFrontWebsite(settings);
  const footer = site
    ? `<div style="height:24px;background:${gold};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <p style="margin:0;font-family:${SPLIT_FONT};font-size:6.5px;font-weight:700;color:${navy};letter-spacing:0.08em;text-transform:uppercase;${EXEC_TEXT_WRAP}">${site}</p>
      </div>`
    : '';
  return `
  <div style="height:100%;width:100%;background:${navy};position:relative;overflow:hidden;box-sizing:border-box;font-family:${SPLIT_FONT};display:flex;flex-direction:column;">
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px 16px ${site ? '10px' : '16px'};text-align:center;min-height:0;">
      ${buildCardLogo(lctx, 44, { onDark: true })}
      <p style="margin:11px 0 0;font-family:${SPLIT_FONT};font-size:12px;font-weight:700;color:${gold};letter-spacing:0.12em;text-transform:uppercase;line-height:1.15;${EXEC_TEXT_WRAP}">${cardDisplayName(settings)}</p>
      <p style="margin:4px 0 0;font-family:${SPLIT_FONT};font-size:7px;font-weight:500;color:${gold};letter-spacing:0.12em;text-transform:uppercase;opacity:0.75;line-height:1.35;${EXEC_TEXT_WRAP}">${cardTagline(settings)}</p>
    </div>
    ${footer}
  </div>`;
}

function buildExecutiveBack(ctx: BusinessCardPdfContext): string {
  const { settings } = ctx;
  const lctx = logoCtx(ctx);
  const { navy, gold } = executiveColors(settings);
  return `
  <div style="height:100%;width:100%;position:relative;overflow:hidden;box-sizing:border-box;font-family:${SPLIT_FONT};display:flex;">
    <div style="width:42%;background:${navy};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px 8px;box-sizing:border-box;min-width:0;">
      ${buildCardLogo(lctx, 28, { onDark: true })}
      <p style="margin:6px 0 0;font-family:${SPLIT_FONT};font-size:6px;font-weight:700;color:${gold};letter-spacing:0.08em;text-transform:uppercase;text-align:center;line-height:1.3;${EXEC_TEXT_WRAP}">${cardDisplayName(settings)}</p>
      <div style="margin-top:8px;">${buildCardQrCode(settings, 34, '#fff', navy)}</div>
    </div>
    <div style="width:2px;background:${gold};flex-shrink:0;"></div>
    <div style="flex:1;background:#fff;padding:14px 12px 10px 14px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;min-width:0;">
      <p style="margin:0;font-family:${SPLIT_FONT};font-size:11px;font-weight:700;color:${navy};letter-spacing:0.05em;text-transform:uppercase;line-height:1.2;${EXEC_TEXT_WRAP}">${cardPersonName(settings)}</p>
      <p style="margin:2px 0 10px;font-family:${SPLIT_FONT};font-size:7px;font-weight:500;color:${navy};opacity:0.7;letter-spacing:0.02em;line-height:1.3;${EXEC_TEXT_WRAP}">${cardPersonTitle(settings)}</p>
      ${buildCardContactRows(settings, navy, {
        fontSize: '6.5px',
        iconSize: '7px',
        svgIcons: true,
        fillWidth: true,
        fontFamily: SPLIT_FONT,
      })}
    </div>
  </div>`;
}

/* ─── Orbit (concentric navy) ─── */
function orbitPalette(settings: AppSettings): { navy: string; lineAccent: string } {
  const navy = getCardAccentColor(settings.businessCardTemplate, settings.businessCardAccentColors);
  const lineAccent = mixHex(navy, '#ffffff', 0.62);
  return { navy, lineAccent };
}

function buildOrbitFront(ctx: BusinessCardPdfContext): string {
  const { settings } = ctx;
  const lctx = logoCtx(ctx);
  const { navy } = orbitPalette(settings);
  const site = cardFrontWebsite(settings);
  const websitePill = site
    ? `<div style="position:absolute;bottom:18px;left:50%;transform:translateX(-50%);background:#fff;border-radius:999px;padding:4px 18px;z-index:2;">
        <p style="margin:0;font-family:${SPLIT_FONT};font-size:6.5px;font-weight:600;color:${navy};letter-spacing:0.04em;${ORBIT_TEXT_WRAP}">${site}</p>
      </div>`
    : '';
  return `
  <div style="height:100%;width:100%;background:${navy};position:relative;overflow:hidden;box-sizing:border-box;font-family:${SPLIT_FONT};">
    <svg style="position:absolute;inset:0;width:100%;height:100%;opacity:0.15;" viewBox="0 0 340 204">
      <circle cx="170" cy="102" r="40" fill="none" stroke="#fff" stroke-width="1"/>
      <circle cx="170" cy="102" r="70" fill="none" stroke="#fff" stroke-width="1"/>
      <circle cx="170" cy="102" r="100" fill="none" stroke="#fff" stroke-width="1"/>
      <circle cx="170" cy="102" r="130" fill="none" stroke="#fff" stroke-width="0.5"/>
    </svg>
    <div style="position:relative;z-index:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:14px 14px ${site ? '32px' : '14px'};box-sizing:border-box;">
      ${buildCardLogo(lctx, 42, { onDark: true })}
      <p style="margin:10px 0 0;font-family:${SPLIT_FONT};font-size:12px;font-weight:700;color:#fff;letter-spacing:0.08em;text-transform:uppercase;line-height:1.15;${ORBIT_TEXT_WRAP}">${cardDisplayName(settings)}</p>
      <p style="margin:3px 0 0;font-family:${SPLIT_FONT};font-size:7px;font-weight:500;color:rgba(255,255,255,0.8);letter-spacing:0.1em;text-transform:uppercase;line-height:1.35;${ORBIT_TEXT_WRAP}">${cardTagline(settings)}</p>
    </div>
    ${websitePill}
  </div>`;
}

function buildOrbitBack(ctx: BusinessCardPdfContext): string {
  const { settings } = ctx;
  const lctx = logoCtx(ctx);
  const { navy, lineAccent } = orbitPalette(settings);
  return `
  <div style="height:100%;width:100%;background:#fff;display:flex;box-sizing:border-box;overflow:hidden;font-family:${SPLIT_FONT};">
    <div style="width:38%;padding:12px 8px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-right:1px solid ${lineAccent};box-sizing:border-box;">
      ${buildCardLogo(lctx, 30, { onDark: false })}
      <p style="margin:6px 0 0;font-family:${SPLIT_FONT};font-size:6px;font-weight:700;color:${navy};letter-spacing:0.06em;text-transform:uppercase;text-align:center;line-height:1.3;${ORBIT_TEXT_WRAP}">${cardDisplayName(settings)}</p>
      <p style="margin:2px 0 8px;font-family:${SPLIT_FONT};font-size:5.5px;font-weight:500;color:${navy};opacity:0.7;text-align:center;line-height:1.35;${ORBIT_TEXT_WRAP}">${cardTagline(settings)}</p>
      <div style="width:80%;height:1px;background:${lineAccent};"></div>
      <div style="margin-top:8px;">${buildCardQrCode(settings, 32, navy)}</div>
    </div>
    <div style="flex:1;padding:10px 10px 8px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;min-width:0;">
      <div style="background:${navy};border-radius:999px;padding:5px 10px;display:flex;align-items:center;gap:6px;margin-bottom:6px;">
        <div style="width:18px;height:18px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="2.2" stroke="${navy}" stroke-width="1.3"/><path d="M3.5 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="${navy}" stroke-width="1.3" stroke-linecap="round"/></svg>
        </div>
        <div style="min-width:0;">
          <p style="margin:0;font-family:${SPLIT_FONT};font-size:8px;font-weight:700;color:#fff;letter-spacing:0.04em;text-transform:uppercase;line-height:1.2;${ORBIT_TEXT_WRAP}">${cardPersonName(settings)}</p>
          <p style="margin:0;font-family:${SPLIT_FONT};font-size:6px;font-weight:500;color:rgba(255,255,255,0.8);text-transform:uppercase;line-height:1.3;${ORBIT_TEXT_WRAP}">${cardPersonTitle(settings)}</p>
        </div>
      </div>
      ${buildCardContactPills(settings, {
        barBg: '#F3F4F6',
        textColor: navy,
        iconBg: navy,
        svgIcons: true,
        fontFamily: SPLIT_FONT,
        fillWidth: true,
      })}
    </div>
  </div>`;
}

/* ─── Royal (purple) ─── */
function royalPalette(settings: AppSettings): { purple: string; lineAccent: string; purpleDeep: string } {
  const purple = getCardAccentColor(settings.businessCardTemplate, settings.businessCardAccentColors);
  return {
    purple,
    lineAccent: mixHex(purple, '#ffffff', 0.62),
    purpleDeep: mixHex(purple, '#000000', 0.14),
  };
}

function buildRoyalFront(ctx: BusinessCardPdfContext): string {
  const { settings } = ctx;
  const lctx = logoCtx(ctx);
  const { purple, purpleDeep } = royalPalette(settings);
  const site = cardFrontWebsite(settings);
  const websiteCapsule = site
    ? `<div style="position:absolute;bottom:14px;left:50%;transform:translateX(-50%);background:#fff;border-radius:999px;padding:4px 16px;z-index:2;max-width:86%;box-sizing:border-box;">
        <p style="margin:0;font-family:${SPLIT_FONT};font-size:6.5px;font-weight:600;color:${purple};letter-spacing:0.06em;text-align:center;${ROYAL_TEXT_WRAP}">${site}</p>
      </div>`
    : '';
  return `
  <div style="height:100%;width:100%;background:linear-gradient(180deg, ${purple} 0%, ${purpleDeep} 100%);position:relative;overflow:hidden;box-sizing:border-box;font-family:${SPLIT_FONT};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:16px 16px ${site ? '32px' : '16px'};">
    <div style="box-sizing:border-box;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.12);position:absolute;inset:8px;pointer-events:none;border-radius:2px;"></div>
    <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;max-width:88%;min-width:0;">
      <div style="width:72px;height:1px;background:${ROYAL_GOLD};opacity:0.85;margin-bottom:5px;"></div>
      <div style="width:100px;height:1px;background:rgba(255,255,255,0.38);"></div>
      <div style="padding:14px 16px 12px;min-width:0;width:100%;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;">
        <div style="display:flex;justify-content:center;width:100%;">${buildCardLogo(lctx, 42, { onDark: true })}</div>
        <p style="margin:11px 0 0;font-family:${SPLIT_FONT};font-size:12px;font-weight:700;color:#fff;letter-spacing:0.12em;text-transform:uppercase;line-height:1.15;text-align:center;width:100%;${ROYAL_TEXT_WRAP}">${cardDisplayName(settings)}</p>
        <p style="margin:4px 0 0;font-family:${SPLIT_FONT};font-size:7px;font-weight:500;color:rgba(255,255,255,0.8);letter-spacing:0.14em;text-transform:uppercase;line-height:1.35;text-align:center;width:100%;${ROYAL_TEXT_WRAP}">${cardTagline(settings)}</p>
      </div>
      <div style="width:100px;height:1px;background:rgba(255,255,255,0.38);"></div>
      <div style="width:72px;height:1px;background:rgba(255,255,255,0.22);margin-top:5px;"></div>
    </div>
    ${websiteCapsule}
  </div>`;
}

function buildRoyalBack(ctx: BusinessCardPdfContext): string {
  const { settings } = ctx;
  const { purple, lineAccent } = royalPalette(settings);
  const qrPlateBg = mixHex(purple, ROYAL_PAPER, 0.88);
  const site = cardFrontWebsite(settings);
  const contactRows = buildCardContactBadgeRows(getContactRows(settings), {
    textColor: purple,
    badgeBg: purple,
    iconColor: '#fff',
    fontSize: '6.5px',
    iconSize: 7,
    badgeSize: 14,
    badgeRadius: '3px',
    iconColumnWidth: 14,
    gap: '5px',
    fontFamily: SPLIT_FONT,
    fillWidth: true,
  });
  const footer = site
    ? `<div style="height:18px;background:${purple};display:flex;align-items:center;justify-content:center;padding:0 12px;flex-shrink:0;">
        <p style="margin:0;font-family:${SPLIT_FONT};font-size:6px;font-weight:500;color:#fff;letter-spacing:0.08em;${ROYAL_TEXT_WRAP}">${site}</p>
      </div>`
    : '';
  return `
  <div style="height:100%;width:100%;background:${ROYAL_PAPER};position:relative;overflow:hidden;box-sizing:border-box;font-family:${SPLIT_FONT};display:flex;flex-direction:column;">
    <div style="flex:1;display:flex;min-height:0;overflow:hidden;">
      <div style="width:9px;background:${purple};flex-shrink:0;"></div>
      <div style="flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden;">
        <div style="flex:1;padding:14px 12px 10px 12px;box-sizing:border-box;display:flex;align-items:stretch;min-height:0;overflow:hidden;">
          <div style="flex:1;min-width:0;padding-right:10px;overflow:hidden;display:flex;flex-direction:column;">
            <p style="margin:0;font-family:${SPLIT_FONT};font-size:11px;font-weight:700;color:${purple};letter-spacing:0.06em;text-transform:uppercase;line-height:1.2;${ROYAL_TEXT_WRAP}">${cardPersonName(settings)}</p>
            <p style="margin:3px 0 0;font-family:${SPLIT_FONT};font-size:7px;font-weight:500;color:${purple};opacity:0.7;letter-spacing:0.03em;line-height:1.3;${ROYAL_TEXT_WRAP}">${cardPersonTitle(settings)}</p>
            <div style="width:100%;height:1px;background:${purple};opacity:0.35;margin:8px 0;flex-shrink:0;"></div>
            <div style="flex:1;min-height:0;overflow:hidden;">${contactRows}</div>
          </div>
          <div style="width:72px;flex-shrink:0;display:flex;align-items:center;justify-content:center;padding:0 2px;box-sizing:border-box;">
            <div style="padding:5px;background:${qrPlateBg};border:1px solid ${lineAccent};border-radius:6px;box-sizing:border-box;">
              ${buildCardQrCode(settings, 34, purple, ROYAL_PAPER)}
            </div>
          </div>
        </div>
        ${footer}
      </div>
    </div>
  </div>`;
}

/* ─── Prestige (white & gold / navy back) ─── */
function buildPrestigeFront(ctx: BusinessCardPdfContext): string {
  const { settings } = ctx;
  const lctx = logoCtx(ctx);
  const { gold } = palette(settings);
  const site = escapeHtml(cardWebsite(settings));
  return `
  <div style="height:100%;width:100%;background:#fff;position:relative;overflow:hidden;box-sizing:border-box;display:flex;flex-direction:column;">
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:14px;position:relative;">
      <div style="position:absolute;top:42%;left:8%;right:8%;height:1px;background:linear-gradient(90deg,transparent,${gold},transparent);"></div>
      ${buildCardLogo(lctx, 38, { onDark: false })}
      <p style="margin:10px 0 0;font-size:12px;font-weight:700;color:#111;letter-spacing:0.08em;text-transform:uppercase;">${cardDisplayName(settings)}</p>
      <p style="margin:3px 0 0;font-size:7px;color:#6B7280;letter-spacing:0.12em;text-transform:uppercase;">${cardTagline(settings)}</p>
    </div>
    <div style="height:24px;background:${PRESTIGE_NAVY};display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0;">
      <div style="position:absolute;top:-3px;width:36px;height:4px;background:${gold};border-radius:2px;"></div>
      <p style="margin:0;font-size:6.5px;color:#fff;letter-spacing:0.06em;">${site}</p>
    </div>
  </div>`;
}

function buildPrestigeBack(ctx: BusinessCardPdfContext): string {
  const { settings } = ctx;
  const lctx = logoCtx(ctx);
  const { gold } = palette(settings);
  const contactRows = getContactRows(settings);
  const stripTypes: Array<'person' | 'phone' | 'email' | 'web' | 'location'> = [
    'person',
    ...contactRows.map((row) => row.type),
  ];
  const detailRows = getPrestigeDetailRows(settings);
  return `
  <div style="height:100%;width:100%;background:${PRESTIGE_NAVY};position:relative;overflow:hidden;box-sizing:border-box;display:flex;">
    <div style="width:38%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px 6px;box-sizing:border-box;border-right:1px solid rgba(255,255,255,0.1);">
      ${buildCardLogo(lctx, 30, { onDark: true })}
      <p style="margin:6px 0 0;font-size:6px;font-weight:700;color:${gold};letter-spacing:0.06em;text-transform:uppercase;text-align:center;">${cardDisplayName(settings)}</p>
      <p style="margin:2px 0 0;font-size:5.5px;color:rgba(255,255,255,0.7);text-align:center;">${cardTagline(settings)}</p>
    </div>
    <div style="width:14px;background:rgba(255,255,255,0.08);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:8px 0;flex-shrink:0;">
      ${buildPrestigeIconStrip([...stripTypes], gold)}
    </div>
    <div style="flex:1;padding:12px 10px 10px 6px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;position:relative;">
      <p style="margin:0;font-size:10px;font-weight:700;color:#fff;letter-spacing:0.05em;text-transform:uppercase;">${cardPersonName(settings)}</p>
      <p style="margin:2px 0 8px;font-size:7px;color:${gold};text-transform:uppercase;">${cardPersonTitle(settings)}</p>
      <div style="width:100%;height:1px;background:rgba(255,255,255,0.2);margin-bottom:6px;"></div>
      ${detailRows.map((line) => `<p style="margin:3px 0;font-size:6.5px;color:rgba(255,255,255,0.9);line-height:1.35;">${escapeHtml(line)}</p>`).join('')}
      <div style="position:absolute;bottom:8px;right:8px;">${buildCardQrCode(settings, 26, '#fff', PRESTIGE_NAVY)}</div>
    </div>
  </div>`;
}

function getPrestigeDetailRows(settings: AppSettings): string[] {
  const contactRows = getContactRows(settings);
  if (contactRows.length === 0) return ['Add contact in Settings'];
  return contactRows.flatMap((row) => row.lines);
}

type TemplateBuilder = {
  front: (ctx: BusinessCardPdfContext) => string;
  back: (ctx: BusinessCardPdfContext) => string;
};

const TEMPLATES: Record<BusinessCardTemplate, TemplateBuilder> = {
  wave: { front: buildWaveFront, back: buildWaveBack },
  executive: { front: buildExecutiveFront, back: buildExecutiveBack },
  orbit: { front: buildOrbitFront, back: buildOrbitBack },
  royal: { front: buildRoyalFront, back: buildRoyalBack },
  prestige: { front: buildPrestigeFront, back: buildPrestigeBack },
};

function getTemplateBuilder(settings: AppSettings): TemplateBuilder {
  return TEMPLATES[settings.businessCardTemplate] ?? TEMPLATES.wave;
}

export function buildBusinessCardHtml(ctx: BusinessCardPdfContext): string {
  const template = getTemplateBuilder(ctx.settings);
  return dualCardDocument(template.front(ctx), template.back(ctx), ctx);
}

export function buildBusinessCardFaceHtml(
  ctx: BusinessCardPdfContext,
  side: 'front' | 'back',
): string {
  const template = getTemplateBuilder(ctx.settings);
  const face = side === 'front' ? template.front(ctx) : template.back(ctx);
  if (ctx.forPrint) {
    return singleCardPrintDocument(face, ctx);
  }
  return singleFacePreviewDocument(face, side === 'front' ? 'Front' : 'Back', ctx);
}

export function getBusinessCardPreviewColor(settings: AppSettings): string {
  return getCardAccentColor(settings.businessCardTemplate, settings.businessCardAccentColors);
}
