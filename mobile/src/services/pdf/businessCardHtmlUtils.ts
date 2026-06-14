import QRCode from 'qrcode';

import type { AppSettings } from '@/types/settings';

import { escapeHtml } from '@/services/pdf/pdfHtmlUtils';

export interface CardLogoContext {
  settings: AppSettings;
  logoDataUri?: string | null;
}

export type ContactIconType = 'phone' | 'email' | 'web' | 'location' | 'person';

export interface ContactRow {
  type: ContactIconType;
  lines: string[];
}

/** Wrap phone/email/address inside narrow flex columns on business cards. */
const CARD_CONTACT_LINE_WRAP =
  'overflow-wrap:break-word;word-break:break-word;white-space:normal;max-width:100%;';

function cardContactTextStyle(
  color: string,
  fontSize: string,
  lineHeight: number,
  fontFamily: string,
  fillWidth: boolean,
): string {
  const base = `color:${color};font-size:${fontSize};line-height:${lineHeight};${fontFamily}${CARD_CONTACT_LINE_WRAP}`;
  return fillWidth
    ? `flex:1 1 0%;min-width:0;max-width:100%;${base}`
    : `min-width:0;max-width:100%;${base}`;
}

function cardContactRowWrap(fillWidth: boolean, extra = ''): string {
  return fillWidth ? `width:100%;max-width:100%;min-width:0;box-sizing:border-box;${extra}` : extra;
}

export function cardWebsite(settings: AppSettings): string {
  const raw = settings.businessWebsite?.trim();
  if (raw) return raw.replace(/^https?:\/\//i, '');
  return 'www.yourwebsite.com';
}

export function cardQrUrl(settings: AppSettings): string {
  const raw = settings.businessWebsite?.trim();
  if (!raw) return 'https://example.com';
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

export function cardDisplayName(settings: AppSettings): string {
  return escapeHtml(settings.businessName.trim() || 'Company Name');
}

export function cardTagline(settings: AppSettings): string {
  return settings.businessTagline?.trim()
    ? escapeHtml(settings.businessTagline.trim())
    : 'Slogan here';
}

export function cardPersonName(settings: AppSettings): string {
  const name = settings.businessCardPersonName?.trim();
  if (name) return escapeHtml(name);
  return 'Your Name';
}

export function cardPersonTitle(settings: AppSettings): string {
  const title = settings.businessCardPersonTitle?.trim();
  if (title) return escapeHtml(title);
  return 'Your Title';
}

export function buildCardLogo(
  ctx: CardLogoContext,
  size: number,
  options: { onDark?: boolean; rounded?: number; plate?: boolean } = {},
): string {
  const { settings, logoDataUri } = ctx;
  if (!settings.showLogoOnBusinessCard || !logoDataUri) {
    return '';
  }

  const rounded = options.rounded ?? 0;
  const radius = rounded > 0 ? `border-radius:${rounded}px;` : '';
  const onDark = options.onDark ?? false;
  const inner = `<img src="${logoDataUri}" alt="" style="width:${size}px;height:${size}px;object-fit:contain;${radius}display:block;" />`;

  if (options.plate && !onDark) {
    return `<div style="display:inline-block;padding:6px 10px;background:#F3F4F6;border-radius:10px;border:1px solid #E5E7EB;">${inner}</div>`;
  }

  return inner;
}

/** Website label for the card front — omitted when empty (no placeholder). */
export function cardFrontWebsite(settings: AppSettings): string | null {
  const raw = settings.businessWebsite?.trim();
  if (!raw) return null;
  return escapeHtml(raw.replace(/^https?:\/\//i, ''));
}

export function buildCardQrCode(
  settings: AppSettings,
  size: number,
  fg: string,
  bg = '#fff',
): string {
  try {
    const qr = QRCode.create(cardQrUrl(settings), { errorCorrectionLevel: 'M' });
    const modules = qr.modules;
    const count = modules.size;
    const margin = 1;
    const dim = count + margin * 2;
    const cell = size / dim;
    let rects = '';
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (modules.get(row, col)) {
          rects += `<rect x="${(col + margin) * cell}" y="${(row + margin) * cell}" width="${cell}" height="${cell}" fill="${fg}"/>`;
        }
      }
    }
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="display:block;background:${bg};">${rects}</svg>`;
  } catch {
    return buildQrPlaceholder(size, fg, bg);
  }
}

/** @deprecated Use buildCardQrCode for scannable codes. */
export function buildQrPlaceholder(size: number, fg = '#111', bg = '#fff'): string {
  const cell = size / 7;
  let cells = '';
  const pattern = [
    [1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 0],
    [1, 1, 1, 0, 1, 1, 1],
    [0, 1, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [0, 1, 0, 0, 1, 1, 0],
    [1, 1, 1, 0, 1, 0, 1],
  ];
  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 7; x++) {
      if (pattern[y][x]) {
        cells += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="${fg}"/>`;
      }
    }
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="display:block;background:${bg};border:1px solid ${fg}22;">
    ${cells}
  </svg>`;
}

function contactLinePx(fontSize: string, lineHeight: number): number {
  return (parseFloat(fontSize) || 7) * lineHeight;
}

/** Fixed-width column; icon vertically centered within one text line. */
function contactIconColumnStyle(fontSize: string, lineHeight: number, cellWidth: number): string {
  const linePx = contactLinePx(fontSize, lineHeight);
  return `width:${cellWidth}px;min-width:${cellWidth}px;flex-shrink:0;height:${linePx.toFixed(2)}px;display:flex;align-items:center;justify-content:center;`;
}

/** Single-line rows: center icon with the text block. */
function contactIconColumnCentered(cellWidth: number): string {
  return `width:${cellWidth}px;min-width:${cellWidth}px;flex-shrink:0;display:flex;align-items:center;justify-content:center;align-self:center;`;
}

function contactRowAlign(lineCount: number): string {
  return lineCount === 1 ? 'center' : 'flex-start';
}

/** Badge icons (Split): keep column width fixed; center with text on single-line rows. */
function contactBadgeColumnStyle(
  fontSize: string,
  lineHeight: number,
  cellWidth: number,
  badgeSize: number,
  lineCount: number,
): string {
  if (lineCount === 1) {
    return contactIconColumnCentered(cellWidth);
  }
  const linePx = contactLinePx(fontSize, lineHeight);
  const offset = Math.max(0, (linePx - badgeSize) / 2);
  return `width:${cellWidth}px;min-width:${cellWidth}px;flex-shrink:0;display:flex;justify-content:center;padding-top:${offset.toFixed(2)}px;`;
}

export function cardContactIconCell(
  type: ContactIconType,
  iconPx: number,
  color: string,
  options: {
    fontSize?: string;
    lineHeight?: number;
    cellWidth?: number;
    lineCount?: number;
  } = {},
): string {
  const fontSize = options.fontSize ?? '7px';
  const lineHeight = options.lineHeight ?? 1.35;
  const cellWidth = options.cellWidth ?? 14;
  const lineCount = options.lineCount ?? 1;
  const col =
    lineCount === 1
      ? contactIconColumnCentered(cellWidth)
      : contactIconColumnStyle(fontSize, lineHeight, cellWidth);
  return `<div style="${col}">${cardContactIconSvg(type, iconPx, color)}</div>`;
}

export function cardContactIconSvg(type: ContactIconType, size: number, color: string): string {
  const s = size;
  switch (type) {
    case 'phone':
      return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;flex-shrink:0;">
        <path d="M3.5 2h2l1 3.5-1.5 1a7 7 0 003.5 3.5l1-1.5L13 9.5V11.5a1 1 0 01-1 1C6.5 12.5 3.5 9.5 2.5 4.5a1 1 0 011-1z" stroke="${color}" stroke-width="1.2" stroke-linejoin="round"/>
      </svg>`;
    case 'email':
      return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;flex-shrink:0;">
        <rect x="2" y="3.5" width="12" height="9" rx="1.2" stroke="${color}" stroke-width="1.2"/>
        <path d="M2 4.5 L8 9 L14 4.5" stroke="${color}" stroke-width="1.2" stroke-linejoin="round"/>
      </svg>`;
    case 'web':
      return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;flex-shrink:0;">
        <circle cx="8" cy="8" r="5.5" stroke="${color}" stroke-width="1.2"/>
        <path d="M2.5 8h11M8 2.5c1.5 1.8 2.3 4 2.3 5.5S9.5 11.2 8 13M8 2.5C6.5 4.3 5.7 6.5 5.7 8s.8 3.7 2.3 5.5" stroke="${color}" stroke-width="1.1"/>
      </svg>`;
    case 'location':
      return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;flex-shrink:0;">
        <path d="M8 14s4-4.2 4-7.5a4 4 0 10-8 0C4 9.8 8 14 8 14z" stroke="${color}" stroke-width="1.2" stroke-linejoin="round"/>
        <circle cx="8" cy="6.5" r="1.3" fill="${color}"/>
      </svg>`;
    case 'person':
      return `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;flex-shrink:0;">
        <circle cx="8" cy="5" r="2.2" stroke="${color}" stroke-width="1.2"/>
        <path d="M3.5 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="${color}" stroke-width="1.2" stroke-linecap="round"/>
      </svg>`;
  }
}

export function hasCardWebsite(settings: AppSettings): boolean {
  return Boolean(settings.businessWebsite?.trim());
}

export function getContactRows(settings: AppSettings): ContactRow[] {
  const rows: ContactRow[] = [];
  const phone = settings.businessPhone?.trim();
  const email = settings.businessEmail?.trim();

  if (phone) rows.push({ type: 'phone', lines: [phone] });
  if (email) rows.push({ type: 'email', lines: [email] });
  const address = settings.businessAddress?.trim();
  if (address) {
    const lines = address
      .split(/\n/)
      .map((part) => part.trim())
      .filter(Boolean);
    rows.push({
      type: 'location',
      lines: lines.length > 0 ? lines : [address],
    });
  }
  return rows;
}

/** Split-card back: phone, email, address (website lives on the front footer only). */
export function getSplitBackContactRows(settings: AppSettings): ContactRow[] {
  const rows: ContactRow[] = [];
  const phone = settings.businessPhone?.trim();
  if (phone) rows.push({ type: 'phone', lines: [phone] });

  const email = settings.businessEmail?.trim();
  if (email) rows.push({ type: 'email', lines: [email] });

  const address = settings.businessAddress?.trim();
  if (address) {
    const lines = address
      .split(/\n/)
      .map((part) => part.trim())
      .filter(Boolean);
    rows.push({
      type: 'location',
      lines: lines.length > 0 ? lines : [address],
    });
  }
  return rows;
}

export function buildCardContactBadgeRows(
  rows: ContactRow[],
  options: {
    textColor: string;
    badgeBg: string;
    iconColor: string;
    fontSize?: string;
    iconSize?: number;
    badgeSize?: number;
    badgeRadius?: string;
    badgeBorder?: string;
    gap?: string;
    iconColumnWidth?: number;
    fontFamily?: string;
    /** Keep each line on one row until the container edge, then wrap. */
    fillWidth?: boolean;
  },
): string {
  const fontSize = options.fontSize ?? '6px';
  const iconSize = options.iconSize ?? 9;
  const badgeSize = options.badgeSize ?? 16;
  const badgeRadius = options.badgeRadius ?? '50%';
  const badgeBorder = options.badgeBorder ? `border:1px solid ${options.badgeBorder};` : '';
  const iconColumnWidth = options.iconColumnWidth ?? badgeSize;
  const gap = options.gap ?? '5px';
  const lineHeight = 1.38;
  const fontFamily = options.fontFamily ? `font-family:${options.fontFamily};` : '';
  const textStyle = cardContactTextStyle(options.textColor, fontSize, lineHeight, fontFamily, Boolean(options.fillWidth));

  if (rows.length === 0) {
    return `<p style="margin:0;font-size:${fontSize};color:${options.textColor};opacity:0.75;${fontFamily}">Add contact in Settings</p>`;
  }

  return rows
    .map((row) => {
      const rowAlign = contactRowAlign(row.lines.length);
      const iconCol = contactBadgeColumnStyle(
        fontSize,
        lineHeight,
        iconColumnWidth,
        badgeSize,
        row.lines.length,
      );
      return `
    <div style="display:flex;align-items:${rowAlign};gap:6px;margin:${gap} 0;${cardContactRowWrap(Boolean(options.fillWidth))}">
      <div style="${iconCol}">
        <div style="width:${badgeSize}px;height:${badgeSize}px;border-radius:${badgeRadius};background:${options.badgeBg};${badgeBorder}display:flex;align-items:center;justify-content:center;flex-shrink:0;box-sizing:border-box;">
          ${cardContactIconSvg(row.type, iconSize, options.iconColor)}
        </div>
      </div>
      <div style="${textStyle}">
        ${row.lines.map((line) => `<div style="${CARD_CONTACT_LINE_WRAP}">${escapeHtml(line)}</div>`).join('')}
      </div>
    </div>`;
    })
    .join('');
}

export function buildCardContactRows(
  settings: AppSettings,
  color: string,
  options: {
    fontSize?: string;
    iconSize?: string;
    gap?: string;
    iconColumnWidth?: number;
    fontFamily?: string;
    svgIcons?: boolean;
    fillWidth?: boolean;
    iconColor?: string;
  } = {},
): string {
  const rows = getContactRows(settings);
  const fontSize = options.fontSize ?? '7px';
  const iconSize = options.iconSize ?? '8px';
  const gap = options.gap ?? '5px';
  const iconPx = parseFloat(iconSize) || 8;
  const lineHeight = 1.35;
  const iconColumnWidth = options.iconColumnWidth ?? 14;
  const iconColor = options.iconColor ?? color;
  const fontFamily = options.fontFamily ? `font-family:${options.fontFamily};` : '';
  const textStyle = cardContactTextStyle(color, fontSize, lineHeight, fontFamily, Boolean(options.fillWidth));

  if (rows.length === 0) {
    return `<p style="margin:0;font-size:${fontSize};color:${color};opacity:0.7;${fontFamily}">Add contact in Settings</p>`;
  }

  return rows
    .map((row) => {
      const rowAlign = contactRowAlign(row.lines.length);
      const iconCol =
        row.lines.length === 1
          ? contactIconColumnCentered(iconColumnWidth)
          : contactIconColumnStyle(fontSize, lineHeight, iconColumnWidth);
      const iconMarkup = options.svgIcons
        ? cardContactIconCell(row.type, iconPx, iconColor, {
            fontSize,
            lineHeight,
            cellWidth: iconColumnWidth,
            lineCount: row.lines.length,
          })
        : `<div style="${iconCol}"><span style="color:${iconColor};font-size:${iconSize};line-height:1;opacity:0.85;">${legacyEmoji(row.type)}</span></div>`;
      return `
    <div style="display:flex;align-items:${rowAlign};gap:6px;margin:${gap} 0;${cardContactRowWrap(Boolean(options.fillWidth))}">
      ${iconMarkup}
      <div style="${textStyle}">
        ${row.lines.map((line) => `<div style="${CARD_CONTACT_LINE_WRAP}">${escapeHtml(line)}</div>`).join('')}
      </div>
    </div>`;
    })
    .join('');
}

function legacyEmoji(type: ContactIconType): string {
  switch (type) {
    case 'phone':
      return '☎';
    case 'email':
      return '✉';
    case 'web':
      return '◆';
    case 'location':
      return '◎';
    case 'person':
      return '👤';
  }
}

export function buildCardContactPills(
  settings: AppSettings,
  options: {
    barBg: string;
    textColor: string;
    iconBg: string;
    svgIcons?: boolean;
    fontFamily?: string;
    fillWidth?: boolean;
  },
): string {
  const rows = getContactRows(settings);
  const fontFamily = options.fontFamily ? `font-family:${options.fontFamily};` : '';
  const textStyle = cardContactTextStyle(
    options.textColor,
    '6.5px',
    1.3,
    fontFamily,
    Boolean(options.fillWidth),
  );

  if (rows.length === 0) {
    return `<p style="margin:0;font-size:7px;color:${options.textColor};opacity:0.7;${fontFamily}">Add contact in Settings</p>`;
  }

  return rows
    .map(
      (row) => `
    <div style="display:flex;align-items:center;gap:6px;margin:4px 0;background:${options.barBg};border-radius:999px;padding:4px 8px 4px 4px;${cardContactRowWrap(Boolean(options.fillWidth))}">
      <div style="width:16px;height:16px;border-radius:50%;background:${options.iconBg};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        ${
          options.svgIcons
            ? cardContactIconSvg(row.type, 9, '#fff')
            : `<span style="color:#fff;font-size:7px;">${legacyEmoji(row.type)}</span>`
        }
      </div>
      <div style="${textStyle}">
        ${row.lines.map((line) => `<div style="${CARD_CONTACT_LINE_WRAP}">${escapeHtml(line)}</div>`).join('')}
      </div>
    </div>`,
    )
    .join('');
}

