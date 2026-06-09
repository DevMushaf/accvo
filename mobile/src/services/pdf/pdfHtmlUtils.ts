import type { AppSettings } from '@/types/settings';

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildBusinessContactLines(settings: AppSettings): string[] {
  const lines: string[] = [];
  if (settings.businessEmail) lines.push(settings.businessEmail);
  if (settings.businessPhone) lines.push(settings.businessPhone);
  if (settings.businessWebsite) lines.push(settings.businessWebsite);
  if (settings.businessAddress) lines.push(settings.businessAddress);
  return lines;
}

export function buildBusinessContactHtml(
  settings: AppSettings,
  style = 'margin:0;font-size:13px;line-height:1.6;color:#4B5563;',
): string {
  const lines = buildBusinessContactLines(settings);
  if (lines.length === 0) return '';
  return lines.map((line) => `<p style="${style}">${escapeHtml(line)}</p>`).join('');
}

export function buildLogoImg(
  logoDataUri: string | null | undefined,
  size: number,
  extraStyle = '',
): string {
  if (!logoDataUri) return '';
  return `<img src="${logoDataUri}" alt="Logo" style="width:${size}px;height:${size}px;object-fit:contain;border-radius:8px;flex-shrink:0;${extraStyle}" />`;
}

export function buildBusinessHeaderBlock(
  settings: AppSettings,
  options: {
    nameColor?: string;
    taglineColor?: string;
    contactColor?: string;
    align?: 'left' | 'right';
    logoDataUri?: string | null;
    showLogo?: boolean;
    logoSize?: number;
  } = {},
): string {
  const align = options.align ?? 'left';
  const nameColor = options.nameColor ?? '#111827';
  const taglineColor = options.taglineColor ?? '#6B7280';
  const contactStyle = `margin:0;font-size:13px;line-height:1.6;color:${options.contactColor ?? '#4B5563'};text-align:${align};`;

  const tagline = settings.businessTagline
    ? `<p style="margin:4px 0 8px;font-size:14px;color:${taglineColor};text-align:${align};">${escapeHtml(settings.businessTagline)}</p>`
    : '';

  const textBlock = `
    <div style="text-align:${align};flex:1;min-width:0;">
      <h1 style="margin:0;font-size:26px;font-weight:700;color:${nameColor};">${escapeHtml(settings.businessName)}</h1>
      ${tagline}
      ${buildBusinessContactHtml(settings, contactStyle)}
    </div>`;

  const logo =
    options.showLogo && options.logoDataUri
      ? buildLogoImg(options.logoDataUri, options.logoSize ?? 56)
      : '';

  if (logo) {
    return `<div style="display:flex;align-items:flex-start;gap:16px;">${logo}${textBlock}</div>`;
  }

  return textBlock;
}

export function buildWatermark(show: boolean): string {
  if (!show) return '';
  return `<div style="margin-top:40px;padding-top:16px;border-top:1px dashed #CBD5E1;text-align:center;color:#94A3B8;font-size:11px;">
    Created with Accvo — Upgrade to Pro to remove this watermark
  </div>`;
}

export function buildBusinessContactRows(
  settings: AppSettings,
  color: string,
  align: 'left' | 'center' = 'left',
  compact = false,
): string {
  const rows: { icon: string; text: string }[] = [];
  if (settings.businessEmail) rows.push({ icon: '✉', text: settings.businessEmail });
  if (settings.businessPhone) rows.push({ icon: '☎', text: settings.businessPhone });
  if (settings.businessWebsite) rows.push({ icon: '◆', text: settings.businessWebsite });
  if (settings.businessAddress) rows.push({ icon: '◎', text: settings.businessAddress });

  const textSize = compact ? '8px' : '12px';
  const iconSize = compact ? '8px' : '11px';
  const rowGap = compact ? '2px' : '4px';

  if (rows.length === 0) {
    return `<p style="margin:0;font-size:${textSize};color:${color};opacity:0.65;text-align:${align};">Add contact details in Settings</p>`;
  }

  return rows
    .map(
      (row) => `
      <div style="display:flex;align-items:flex-start;gap:5px;margin:${rowGap} 0;text-align:${align};">
        <span style="color:${color};opacity:0.75;font-size:${iconSize};line-height:1.4;min-width:12px;">${row.icon}</span>
        <span style="color:${color};font-size:${textSize};line-height:1.4;">${escapeHtml(row.text)}</span>
      </div>`,
    )
    .join('');
}

export function businessInitial(settings: AppSettings): string {
  const name = settings.businessName.trim();
  return escapeHtml(name ? name.charAt(0).toUpperCase() : 'A');
}

function extractBodyContent(fullHtml: string): string {
  const match = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return match?.[1] ?? fullHtml;
}

export function wrapHtmlForScreenPreview(fullHtml: string, kind: 'invoice' | 'card'): string {
  const body = extractBodyContent(fullHtml);

  if (kind === 'card') {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
      <style>html,body{margin:0;padding:0;background:#E8EDF4;}
      .shell{padding:12px;display:flex;justify-content:center;align-items:flex-start;}</style>
      </head><body><div class="shell">${body}</div></body></html>`;
  }

  const scale = 0.34;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
    <style>
      html,body{margin:0;padding:0;background:#E8EDF4;overflow-x:hidden;}
      .frame{width:${100 / scale}%;transform:scale(${scale});transform-origin:top left;padding-bottom:24px;}
    </style></head><body><div class="frame">${body}</div></body></html>`;
}
