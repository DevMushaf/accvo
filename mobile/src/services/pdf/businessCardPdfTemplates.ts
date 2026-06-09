import type { BusinessCardTemplate } from '@/types/businessCardTemplate';
import type { AppSettings } from '@/types/settings';

import {
  buildBusinessContactRows,
  businessInitial,
  escapeHtml,
} from '@/services/pdf/pdfHtmlUtils';

export interface BusinessCardPdfContext {
  settings: AppSettings;
  showWatermark: boolean;
  forPrint?: boolean;
  logoDataUri?: string | null;
}

function buildCardAvatar(
  ctx: BusinessCardPdfContext,
  size: number,
  options: { rounded?: number; gradient?: string; textColor?: string } = {},
): string {
  const { settings, logoDataUri } = ctx;
  const rounded = options.rounded ?? 12;
  const gradient = options.gradient ?? 'linear-gradient(135deg,#0056B3,#3B9BFF)';
  const textColor = options.textColor ?? '#fff';

  if (settings.showLogoOnBusinessCard && logoDataUri) {
    return `<img src="${logoDataUri}" alt="" style="width:${size}px;height:${size}px;object-fit:cover;border-radius:${rounded}px;flex-shrink:0;background:#fff;" />`;
  }

  const initial = businessInitial(settings);
  return `<div style="width:${size}px;height:${size}px;border-radius:${rounded}px;background:${gradient};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
    <span style="color:${textColor};font-size:${Math.round(size * 0.4)}px;font-weight:700;">${initial}</span>
  </div>`;
}

/** Standard US business card: 3.5" × 2" */
const CARD_PRINT_WIDTH = '3.5in';
const CARD_PRINT_HEIGHT = '2in';

/** Screen preview size (px) */
const CARD_PREVIEW_WIDTH = 340;
const CARD_PREVIEW_HEIGHT = 204;

function printWatermark(): string {
  return `<span style="position:absolute;bottom:3px;right:5px;font-size:5pt;color:#B0B8C4;z-index:20;">Accvo</span>`;
}

function cardWrapper(content: string, ctx: BusinessCardPdfContext): string {
  if (ctx.forPrint) {
    const watermark = ctx.showWatermark ? printWatermark() : '';
    return `<!DOCTYPE html><html><head><meta charset="utf-8" />
    <style>
      @page { size: ${CARD_PRINT_WIDTH} ${CARD_PRINT_HEIGHT}; margin: 0; }
      html, body { margin: 0; padding: 0; width: ${CARD_PRINT_WIDTH}; height: ${CARD_PRINT_HEIGHT}; overflow: hidden; }
      .card { width: ${CARD_PRINT_WIDTH}; height: ${CARD_PRINT_HEIGHT}; position: relative; overflow: hidden; }
    </style></head><body>
    <div class="card">${content}${watermark}</div>
    </body></html>`;
  }

  const watermark = ctx.showWatermark
    ? `<p style="margin-top:10px;font-size:10px;color:#94A3B8;text-align:center;">Created with Accvo</p>`
    : '';

  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
  <style>body { margin:0; padding:0; font-family:Helvetica,Arial,sans-serif; background:transparent; }</style></head><body>
  <div style="width:${CARD_PREVIEW_WIDTH}px;height:${CARD_PREVIEW_HEIGHT}px;border-radius:14px;overflow:hidden;box-shadow:0 12px 32px rgba(0,0,0,0.14);">
    ${content}
  </div>
  ${watermark}
  </body></html>`;
}

function buildClassic(ctx: BusinessCardPdfContext): string {
  const { settings } = ctx;
  const content = `
    <div style="display:flex;height:100%;width:100%;background:#fff;position:relative;overflow:hidden;">
      <div style="width:10px;background:linear-gradient(180deg,#0056B3,#3B9BFF);flex-shrink:0;"></div>
      <div style="position:absolute;top:-30px;right:-30px;width:90px;height:90px;border-radius:50%;background:#E8F1FB;opacity:0.9;"></div>
      <div style="flex:1;padding:14px 14px 12px 12px;display:flex;gap:10px;align-items:center;position:relative;z-index:1;min-width:0;">
        ${buildCardAvatar(ctx, 44)}
        <div style="flex:1;min-width:0;">
          <p style="margin:0;font-size:15px;font-weight:700;color:#0056B3;line-height:1.2;">${escapeHtml(settings.businessName)}</p>
          ${settings.businessTagline ? `<p style="margin:2px 0 0;font-size:9px;color:#6B7280;line-height:1.3;">${escapeHtml(settings.businessTagline)}</p>` : ''}
          <div style="margin-top:6px;padding-top:6px;border-top:1px solid #E5E7EB;">
            ${buildBusinessContactRows(settings, '#374151', 'left', true)}
          </div>
        </div>
      </div>
    </div>`;
  return cardWrapper(content, ctx);
}

function buildMinimal(ctx: BusinessCardPdfContext): string {
  const { settings } = ctx;
  const content = `
    <div style="height:100%;width:100%;background:linear-gradient(180deg,#FFFCF7 0%,#F8F6F2 100%);border:1.5px solid #1F2937;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14px;text-align:center;box-sizing:border-box;position:relative;">
      <div style="position:absolute;top:8px;left:10px;right:10px;height:1px;background:linear-gradient(90deg,transparent,#C9A227,transparent);"></div>
      <p style="margin:0;font-size:15px;font-weight:600;color:#111827;letter-spacing:0.03em;">${escapeHtml(settings.businessName)}</p>
      ${settings.businessTagline ? `<p style="margin:4px 0 0;font-size:9px;color:#6B7280;font-style:italic;">${escapeHtml(settings.businessTagline)}</p>` : ''}
      <div style="width:32px;height:2px;background:#C9A227;margin:10px 0;"></div>
      ${buildBusinessContactRows(settings, '#374151', 'center', true)}
      <div style="position:absolute;bottom:8px;left:10px;right:10px;height:1px;background:linear-gradient(90deg,transparent,#C9A227,transparent);"></div>
    </div>`;
  return cardWrapper(content, ctx);
}

function buildModern(ctx: BusinessCardPdfContext): string {
  const { settings } = ctx;
  const content = `
    <div style="height:100%;width:100%;background:linear-gradient(145deg,#0056B3 0%,#003D80 55%,#002B5C 100%);position:relative;overflow:hidden;box-sizing:border-box;">
      <div style="position:absolute;top:-30px;right:-15px;width:100px;height:100px;border-radius:50%;background:rgba(59,155,255,0.25);"></div>
      <div style="position:absolute;bottom:-35px;left:-20px;width:110px;height:110px;border-radius:50%;background:rgba(255,255,255,0.06);"></div>
      <div style="position:relative;z-index:1;padding:14px 14px 12px;height:100%;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:10px;">
          ${buildCardAvatar(ctx, 38, {
            rounded: 10,
            gradient: 'rgba(255,255,255,0.18)',
            textColor: '#fff',
          })}
          <div style="min-width:0;">
            <p style="margin:0;font-size:15px;font-weight:700;color:#fff;line-height:1.2;">${escapeHtml(settings.businessName)}</p>
            ${settings.businessTagline ? `<p style="margin:2px 0 0;font-size:9px;color:rgba(255,255,255,0.8);">${escapeHtml(settings.businessTagline)}</p>` : ''}
          </div>
        </div>
        <div>${buildBusinessContactRows(settings, 'rgba(255,255,255,0.92)', 'left', true)}</div>
      </div>
    </div>`;
  return cardWrapper(content, ctx);
}

function buildBold(ctx: BusinessCardPdfContext): string {
  const { settings } = ctx;
  const content = `
    <div style="height:100%;width:100%;background:#0B1220;display:flex;flex-direction:column;box-sizing:border-box;position:relative;overflow:hidden;">
      <div style="height:5px;background:linear-gradient(90deg,#3B9BFF,#0056B3,#3B9BFF);flex-shrink:0;"></div>
      <div style="position:absolute;top:0;right:0;width:0;height:0;border-style:solid;border-width:0 55px 55px 0;border-color:transparent rgba(59,155,255,0.35) transparent transparent;"></div>
      <div style="flex:1;padding:12px 14px;display:flex;gap:10px;align-items:flex-start;min-height:0;">
        ${buildCardAvatar(ctx, 40, { rounded: 999, gradient: 'linear-gradient(135deg,#3B9BFF,#0056B3)' })}
        <div style="flex:1;min-width:0;">
          <p style="margin:0;font-size:15px;font-weight:700;color:#fff;line-height:1.2;">${escapeHtml(settings.businessName)}</p>
          ${settings.businessTagline ? `<p style="margin:2px 0 0;font-size:9px;color:#94A3B8;">${escapeHtml(settings.businessTagline)}</p>` : ''}
          <div style="margin-top:8px;padding-left:8px;border-left:2px solid #3B9BFF;">
            ${buildBusinessContactRows(settings, '#CBD5E1', 'left', true)}
          </div>
        </div>
      </div>
    </div>`;
  return cardWrapper(content, ctx);
}

export function buildBusinessCardHtml(ctx: BusinessCardPdfContext): string {
  switch (ctx.settings.businessCardTemplate) {
    case 'minimal':
      return buildMinimal(ctx);
    case 'modern':
      return buildModern(ctx);
    case 'bold':
      return buildBold(ctx);
    case 'classic':
    default:
      return buildClassic(ctx);
  }
}

export function getBusinessCardPreviewColor(template: BusinessCardTemplate): string {
  switch (template) {
    case 'minimal':
      return '#C9A227';
    case 'modern':
      return '#0056B3';
    case 'bold':
      return '#0B1220';
    case 'classic':
    default:
      return '#0056B3';
  }
}
