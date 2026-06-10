import type { Invoice } from '@/types/invoice';
import type { AppSettings } from '@/types/settings';
import { formatCurrency } from '@/utils/currency';
import { formatDisplayDate } from '@/utils/dates';

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

export type InvoiceLogoVariant = 'onDark' | 'onColor' | 'onLight';
export type InvoiceLogoShape = 'square' | 'wide';

const INVOICE_LOGO_PLATE: Record<
  InvoiceLogoVariant,
  { background: string; border: string; shadow: string }
> = {
  onDark: {
    background: 'rgba(255,255,255,0.95)',
    border: 'none',
    shadow: '0 2px 8px rgba(0,0,0,0.18)',
  },
  onColor: {
    background: 'rgba(255,255,255,0.92)',
    border: 'none',
    shadow: '0 2px 6px rgba(0,0,0,0.12)',
  },
  onLight: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    shadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
};

const INVOICE_LOGO_BOUNDS: Record<
  InvoiceLogoShape,
  { imgW: number; imgH: number; pad: number }
> = {
  square: { imgW: 52, imgH: 52, pad: 6 },
  wide: { imgW: 140, imgH: 48, pad: 6 },
};

const INVOICE_LOGO_BOUNDS_LARGE: Record<
  InvoiceLogoShape,
  { imgW: number; imgH: number; pad: number }
> = {
  square: { imgW: 72, imgH: 72, pad: 8 },
  wide: { imgW: 180, imgH: 56, pad: 8 },
};

export function buildInvoiceLogo(
  logoDataUri: string,
  options: {
    variant: InvoiceLogoVariant;
    shape?: InvoiceLogoShape;
    size?: 'normal' | 'large';
  },
): string {
  const shape = options.shape ?? 'square';
  const plate = INVOICE_LOGO_PLATE[options.variant];
  const bounds = (options.size === 'large' ? INVOICE_LOGO_BOUNDS_LARGE : INVOICE_LOGO_BOUNDS)[shape];
  const outerW = bounds.imgW + bounds.pad * 2;
  const outerH = bounds.imgH + bounds.pad * 2;

  return `<div style="display:inline-flex;align-items:center;justify-content:center;width:${outerW}px;height:${outerH}px;padding:${bounds.pad}px;background:${plate.background};border:${plate.border};border-radius:10px;box-shadow:${plate.shadow};flex-shrink:0;box-sizing:border-box;">
    <img src="${logoDataUri}" alt="Logo" style="display:block;width:${bounds.imgW}px;height:${bounds.imgH}px;object-fit:contain;" />
  </div>`;
}

export function buildHeaderTotalHighlight(
  invoice: Invoice,
  options: {
    label?: string;
    labelColor?: string;
    amountColor?: string;
    align?: 'left' | 'right';
  } = {},
): string {
  const label = options.label ?? 'Total';
  const labelColor = options.labelColor ?? 'rgba(255,255,255,0.75)';
  const amountColor = options.amountColor ?? '#fff';
  const align = options.align ?? 'right';

  return `<div style="text-align:${align};margin-top:10px;">
    <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${labelColor};">${label}</p>
    <p style="margin:4px 0 0;font-size:22px;font-weight:800;color:${amountColor};line-height:1.1;">${formatCurrency(invoice.total, invoice.currency)}</p>
  </div>`;
}

/** Right header column: optional top block, total, logo stacked below the amount. */
export function buildHeaderRightColumn(
  options: {
    topHtml?: string;
    totalHtml?: string;
    logoHtml?: string;
    align?: 'left' | 'right';
  },
): string {
  const align = options.align ?? 'right';
  const logoSlot = options.logoHtml
    ? `<div style="margin-top:14px;display:flex;justify-content:${align === 'right' ? 'flex-end' : 'flex-start'};">${options.logoHtml}</div>`
    : '';

  return `<div style="text-align:${align};flex-shrink:0;">
    ${options.topHtml ?? ''}
    ${options.totalHtml ?? ''}
    ${logoSlot}
  </div>`;
}

export function buildCompactBusinessHeader(
  settings: AppSettings,
  options: {
    nameColor?: string;
    taglineColor?: string;
    nameSize?: string;
    align?: 'left' | 'right';
  } = {},
): string {
  const align = options.align ?? 'left';
  const nameColor = options.nameColor ?? '#111827';
  const taglineColor = options.taglineColor ?? '#6B7280';
  const nameSize = options.nameSize ?? '26px';

  const tagline = settings.businessTagline
    ? `<p style="margin:4px 0 0;font-size:14px;color:${taglineColor};text-align:${align};">${escapeHtml(settings.businessTagline)}</p>`
    : '';

  return `<div style="text-align:${align};flex:1;min-width:0;">
    <h1 style="margin:0;font-size:${nameSize};font-weight:700;color:${nameColor};line-height:1.2;">${escapeHtml(settings.businessName)}</h1>
    ${tagline}
  </div>`;
}

export function buildLogoHeaderRow(
  logoHtml: string,
  headerHtml: string,
  gap = 14,
): string {
  if (!logoHtml) return headerHtml;
  return `<div style="display:flex;align-items:center;gap:${gap}px;">${logoHtml}${headerHtml}</div>`;
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
    Created with Accvo
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

export const INVOICE_PAGE_STYLE = `
  @page { margin: 24px; }
  body {
    font-family: Helvetica, Arial, sans-serif;
    color: #111827;
    margin: 0;
    padding: 36px 40px 48px;
    background: #fff;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
`;

export function buildGeometricHeaderSvg(primary: string, secondary: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 120" preserveAspectRatio="none" style="position:absolute;top:0;left:0;width:100%;height:120px;z-index:0;">
    <polygon points="0,0 800,0 800,80 520,120 0,120" fill="${primary}"/>
    <polygon points="520,120 800,80 800,120" fill="${secondary}"/>
    <polygon points="0,0 180,0 0,90" fill="${secondary}" opacity="0.35"/>
  </svg>`;
}

export function buildWaveFooterSvg(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 48" preserveAspectRatio="none" style="position:absolute;bottom:0;left:0;width:100%;height:48px;">
    <path d="M0,24 Q200,0 400,24 T800,24 L800,48 L0,48 Z" fill="${color}"/>
  </svg>`;
}

export interface BillToBlockOptions {
  label?: string;
  labelColor?: string;
  nameColor?: string;
  detailColor?: string;
}

export function buildBillToBlock(invoice: Invoice, options: BillToBlockOptions = {}): string {
  const label = options.label ?? 'Invoice to';
  const labelColor = options.labelColor ?? '#6B7280';
  const nameColor = options.nameColor ?? '#111827';
  const detailColor = options.detailColor ?? '#4B5563';

  const lines: string[] = [];
  if (invoice.customerName) lines.push(`<p style="margin:0;font-size:16px;font-weight:700;color:${nameColor};">${escapeHtml(invoice.customerName)}</p>`);
  if (invoice.customerEmail) lines.push(`<p style="margin:4px 0 0;font-size:13px;color:${detailColor};">${escapeHtml(invoice.customerEmail)}</p>`);
  if (invoice.customerPhone) lines.push(`<p style="margin:2px 0 0;font-size:13px;color:${detailColor};">${escapeHtml(invoice.customerPhone)}</p>`);

  if (lines.length === 0) {
    return `<div>
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${labelColor};">${label}</p>
      <p style="margin:0;font-size:13px;color:${detailColor};">—</p>
    </div>`;
  }

  return `<div>
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${labelColor};">${label}</p>
    ${lines.join('')}
  </div>`;
}

export interface InvoiceFromBlockOptions {
  settings: AppSettings;
  logoDataUri?: string | null;
  showLogo?: boolean;
  logoSize?: number;
  nameColor?: string;
  taglineColor?: string;
  contactColor?: string;
  label?: string;
  labelColor?: string;
}

export function buildInvoiceFromBlock(options: InvoiceFromBlockOptions): string {
  const label = options.label ?? 'Invoice from';
  const labelColor = options.labelColor ?? '#6B7280';

  const header = buildBusinessHeaderBlock(options.settings, {
    logoDataUri: options.logoDataUri,
    showLogo: options.showLogo,
    logoSize: options.logoSize ?? 52,
    nameColor: options.nameColor ?? '#111827',
    taglineColor: options.taglineColor ?? '#6B7280',
    contactColor: options.contactColor ?? '#4B5563',
  });

  return `<div>
    <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${labelColor};">${label}</p>
    ${header}
  </div>`;
}

export function buildPaymentBlock(settings: AppSettings, options: { labelColor?: string; textColor?: string } = {}): string {
  const labelColor = options.labelColor ?? '#6B7280';
  const textColor = options.textColor ?? '#374151';

  const lines: string[] = [];
  if (settings.paymentNote?.trim()) {
    lines.push(`<p style="margin:0;font-size:13px;color:${textColor};line-height:1.6;white-space:pre-wrap;">${escapeHtml(settings.paymentNote.trim())}</p>`);
  } else {
    if (settings.businessEmail) lines.push(`<p style="margin:0 0 4px;font-size:13px;color:${textColor};">${escapeHtml(settings.businessEmail)}</p>`);
    if (settings.businessWebsite) lines.push(`<p style="margin:0 0 4px;font-size:13px;color:${textColor};">${escapeHtml(settings.businessWebsite)}</p>`);
    if (settings.businessPhone) lines.push(`<p style="margin:0;font-size:13px;color:${textColor};">${escapeHtml(settings.businessPhone)}</p>`);
    if (lines.length === 0) {
      lines.push(`<p style="margin:0;font-size:13px;color:${textColor};">Contact for payment details</p>`);
    }
  }

  return `<div>
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${labelColor};">Payment method</p>
    ${lines.join('')}
  </div>`;
}

export interface LineItemsTableOptions {
  invoice: Invoice;
  headerBg: string;
  headerColor?: string;
  headerBgLeft?: string;
  headerBgRight?: string;
  rowStyle?: 'plain' | 'zebra' | 'rounded';
  rowEvenBg?: string;
  rowOddBg?: string;
  showIndex?: boolean;
  borderColor?: string;
  compact?: boolean;
}

export function buildLineItemsTable(options: LineItemsTableOptions): string {
  const {
    invoice,
    headerBg,
    headerColor = '#fff',
    headerBgLeft,
    headerBgRight,
    rowStyle = 'plain',
    rowEvenBg = '#fff',
    rowOddBg = '#F9FAFB',
    showIndex = true,
    borderColor = '#E5E7EB',
    compact = false,
  } = options;

  const pad = compact ? '10px 8px' : '12px 10px';
  const fontSize = compact ? '12px' : '14px';

  const thBase = `padding:${pad};font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${headerColor};`;
  const thLeft = headerBgLeft ? `${thBase}background:${headerBgLeft};` : `${thBase}background:${headerBg};`;
  const thRight = headerBgRight ? `${thBase}background:${headerBgRight};` : `${thBase}background:${headerBg};`;

  const indexCol = showIndex
    ? `<th style="${thLeft} text-align:center;width:36px;">#</th>`
    : '';
  const descThStyle = headerBgLeft && headerBgRight ? thLeft : `${thBase}background:${headerBg};`;

  const rows = invoice.lineItems
    .map((item, index) => {
      const bg = rowStyle === 'zebra' ? (index % 2 === 0 ? rowEvenBg : rowOddBg) : rowEvenBg;
      const lineTotal = formatCurrency(item.quantity * item.unitPrice, invoice.currency);

      let rowStyleStr = `padding:${pad};font-size:${fontSize};color:#374151;border-bottom:1px solid ${borderColor};`;
      if (rowStyle === 'rounded') {
        rowStyleStr = `padding:${pad};font-size:${fontSize};color:#374151;background:${bg};`;
      } else if (rowStyle === 'zebra') {
        rowStyleStr += `background:${bg};`;
      }

      const indexCell = showIndex
        ? `<td style="${rowStyleStr} text-align:center;font-weight:600;">${index + 1}</td>`
        : '';

      if (rowStyle === 'rounded') {
        return `<tr>
          <td colspan="${showIndex ? 5 : 4}" style="padding:4px 0;border:none;">
            <table style="width:100%;border-collapse:separate;border-spacing:0;background:${bg};border-radius:999px;overflow:hidden;">
              <tr>
                ${showIndex ? `<td style="padding:${pad};font-size:${fontSize};width:36px;text-align:center;font-weight:600;">${index + 1}</td>` : ''}
                <td style="padding:${pad};font-size:${fontSize};">${escapeHtml(item.description)}</td>
                <td style="padding:${pad};font-size:${fontSize};text-align:center;width:50px;">${item.quantity}</td>
                <td style="padding:${pad};font-size:${fontSize};text-align:right;width:80px;">${formatCurrency(item.unitPrice, invoice.currency)}</td>
                <td style="padding:${pad};font-size:${fontSize};text-align:right;width:80px;font-weight:700;">${lineTotal}</td>
              </tr>
            </table>
          </td>
        </tr>`;
      }

      return `<tr>
        ${indexCell}
        <td style="${rowStyleStr}">${escapeHtml(item.description)}</td>
        <td style="${rowStyleStr} text-align:center;">${item.quantity}</td>
        <td style="${rowStyleStr} text-align:right;">${formatCurrency(item.unitPrice, invoice.currency)}</td>
        <td style="${rowStyleStr} text-align:right;font-weight:700;">${lineTotal}</td>
      </tr>`;
    })
    .join('');

  const qtyThStyle = headerBgLeft && headerBgRight ? thRight : `${thBase}background:${headerBg};`;

  return `<table style="width:100%;border-collapse:collapse;margin-top:8px;${rowStyle === 'rounded' ? 'border-spacing:0 6px;' : ''}">
    <thead><tr>
      ${indexCol}
      <th style="${descThStyle} text-align:left;">Description</th>
      <th style="${qtyThStyle} text-align:center;width:50px;">Qty</th>
      <th style="${qtyThStyle} text-align:right;width:80px;">Price</th>
      <th style="${qtyThStyle} text-align:right;width:80px;">Total</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export interface TotalsSectionOptions {
  invoice: Invoice;
  accentColor: string;
  accentTextColor?: string;
  showDiscount?: boolean;
  layout?: 'bar' | 'stacked' | 'pill';
  align?: 'right' | 'full';
}

export function buildTotalsSection(options: TotalsSectionOptions): string {
  const {
    invoice,
    accentColor,
    accentTextColor = '#fff',
    layout = 'bar',
    align = 'right',
  } = options;

  const rows = `
    <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#4B5563;">
      <span>Subtotal</span><span>${formatCurrency(invoice.subtotal, invoice.currency)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#4B5563;">
      <span>Tax (${invoice.taxRate}%)</span><span>${formatCurrency(invoice.taxAmount, invoice.currency)}</span>
    </div>`;

  const totalLabel = layout === 'stacked' ? 'Grand Total' : 'Total';
  const totalAmount = formatCurrency(invoice.total, invoice.currency);

  if (layout === 'bar') {
    const wrapperStyle = align === 'full'
      ? 'margin-top:20px;'
      : 'margin-top:20px;margin-left:auto;max-width:320px;';

    return `<div style="${wrapperStyle}">
      ${rows}
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding:14px 18px;background:${accentColor};color:${accentTextColor};font-size:18px;font-weight:700;border-radius:4px;">
        <span>${totalLabel}</span><span>${totalAmount}</span>
      </div>
    </div>`;
  }

  if (layout === 'pill') {
    return `<div style="margin-top:20px;margin-left:auto;max-width:320px;">
      ${rows}
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding:12px 20px;background:${accentColor};color:${accentTextColor};font-size:17px;font-weight:700;border-radius:999px;">
        <span>${totalLabel}</span><span>${totalAmount}</span>
      </div>
    </div>`;
  }

  return `<div style="margin-top:20px;margin-left:auto;max-width:320px;text-align:right;">
    ${rows}
    <p style="margin:12px 0 0;font-size:13px;color:#6B7280;">Grand Total</p>
    <p style="margin:4px 0 0;font-size:28px;font-weight:800;color:${accentColor};">${totalAmount}</p>
  </div>`;
}

export function buildTermsFooter(
  notes: string | null,
  options: { businessName?: string; accentColor?: string; showThankYou?: boolean; showAuthorized?: boolean } = {},
): string {
  const accent = options.accentColor ?? '#374151';
  const thankYou = options.showThankYou !== false
    ? `<p style="margin:16px 0 0;font-size:13px;color:${accent};font-style:italic;">Thank you for your business!</p>`
    : '';
  const authorized = options.showAuthorized && options.businessName
    ? `<p style="margin:20px 0 0;font-size:12px;color:#6B7280;">Authorized by <strong style="color:#111827;">${escapeHtml(options.businessName)}</strong></p>`
    : '';

  const termsBlock = notes
    ? `<div style="margin-top:24px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6B7280;">Notes</p>
        <p style="margin:0;font-size:12px;color:#4B5563;line-height:1.6;white-space:pre-wrap;">${escapeHtml(notes)}</p>
      </div>`
    : '';

  return `${termsBlock}${thankYou}${authorized}`;
}

/** Terms / thank-you block with logo anchored bottom-right beside it. */
export function buildTermsFooterWithLogo(
  notes: string | null,
  logoHtml: string,
  options: { businessName?: string; accentColor?: string; showThankYou?: boolean; showAuthorized?: boolean } = {},
): string {
  const inner = buildTermsFooter(notes, options);
  if (!logoHtml) return inner;

  return `<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:28px;flex-wrap:wrap;margin-top:24px;">
    <div style="flex:1;min-width:220px;">${inner}</div>
    <div style="flex-shrink:0;">${logoHtml}</div>
  </div>`;
}

export function buildContactFooterBar(settings: AppSettings, bgColor: string, textColor = '#fff'): string {
  const parts: string[] = [];
  if (settings.businessPhone) parts.push(`☎ ${escapeHtml(settings.businessPhone)}`);
  if (settings.businessEmail) parts.push(`✉ ${escapeHtml(settings.businessEmail)}`);
  if (settings.businessAddress) parts.push(`◎ ${escapeHtml(settings.businessAddress)}`);

  const content = parts.length > 0
    ? parts.join('<span style="opacity:0.5;margin:0 12px;">|</span>')
    : escapeHtml(settings.businessName);

  return `<div style="margin-top:32px;margin-left:-40px;margin-right:-40px;margin-bottom:-48px;padding:16px 40px;background:${bgColor};color:${textColor};font-size:12px;text-align:center;">
    ${content}
  </div>`;
}

export function buildInvoiceMetaRow(
  invoice: Invoice,
  options: { labelColor?: string; valueColor?: string; layout?: 'row' | 'inline' } = {},
): string {
  const labelColor = options.labelColor ?? '#9CA3AF';
  const valueColor = options.valueColor ?? '#111827';

  const fields = [
    { label: 'Invoice No', value: invoice.invoiceNumber },
    { label: 'Date', value: formatDisplayDate(invoice.issueDate) },
    ...(invoice.dueDate ? [{ label: 'Due Date', value: formatDisplayDate(invoice.dueDate) }] : []),
  ];

  if (options.layout === 'inline') {
    return `<div style="display:flex;flex-wrap:wrap;gap:20px;margin-top:16px;">
      ${fields
        .map(
          (f) => `<div>
            <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${labelColor};">${f.label}</p>
            <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:${valueColor};">${escapeHtml(f.value)}</p>
          </div>`,
        )
        .join('')}
    </div>`;
  }

  return `<div style="display:flex;flex-wrap:wrap;gap:24px;margin-top:16px;">
    ${fields
      .map(
        (f) => `<div style="min-width:100px;">
          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${labelColor};">${f.label}</p>
          <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:${valueColor};">${escapeHtml(f.value)}</p>
        </div>`,
      )
      .join('')}
  </div>`;
}

export function buildAccountDueBox(
  invoice: Invoice,
  options: {
    bgColor?: string;
    borderColor?: string;
    accentColor?: string;
    compact?: boolean;
    label?: string;
  } = {},
): string {
  const bg = options.bgColor ?? '#EFF6FF';
  const border = options.borderColor ?? '#BFDBFE';
  const accent = options.accentColor ?? '#0056B3';
  const compact = options.compact ?? false;
  const label = options.label ?? 'Total';
  const pad = compact ? '12px 16px' : '18px 22px';
  const amountSize = compact ? '20px' : '28px';
  const minW = compact ? '150px' : '190px';

  return `<div style="padding:${pad};background:${bg};border:2px solid ${border};border-radius:${compact ? '12px' : '14px'};text-align:right;min-width:${minW};flex-shrink:0;">
    <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${accent};">${label}</p>
    <p style="margin:${compact ? '6px' : '8px'} 0 0;font-size:${amountSize};font-weight:800;color:#111827;line-height:1.1;">${formatCurrency(invoice.total, invoice.currency)}</p>
    ${invoice.dueDate ? `<p style="margin:6px 0 0;font-size:${compact ? '11px' : '12px'};color:#4B5563;">Due ${formatDisplayDate(invoice.dueDate)}</p>` : ''}
  </div>`;
}

export function buildSubtotalsBreakdown(invoice: Invoice, options: { align?: 'right' | 'full' } = {}): string {
  const wrapperStyle =
    options.align === 'full'
      ? 'margin-top:24px;max-width:100%;'
      : 'margin-top:24px;margin-left:auto;max-width:280px;';

  return `<div style="${wrapperStyle}">
    <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#6B7280;border-bottom:1px solid #E5E7EB;">
      <span>Subtotal</span><span>${formatCurrency(invoice.subtotal, invoice.currency)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#6B7280;">
      <span>Tax (${invoice.taxRate}%)</span><span>${formatCurrency(invoice.taxAmount, invoice.currency)}</span>
    </div>
  </div>`;
}

export function buildStudioMinimalTable(invoice: Invoice): string {
  const rows = invoice.lineItems
    .map((item) => {
      const lineTotal = formatCurrency(item.quantity * item.unitPrice, invoice.currency);
      const cell = 'padding:14px 8px;font-size:14px;color:#374151;border-bottom:1px solid #E5E7EB;';
      return `<tr>
        <td style="${cell}">${escapeHtml(item.description)}</td>
        <td style="${cell} text-align:center;width:56px;">${item.quantity}</td>
        <td style="${cell} text-align:right;width:88px;">${formatCurrency(item.unitPrice, invoice.currency)}</td>
        <td style="${cell} text-align:right;width:88px;font-weight:600;color:#111827;">${lineTotal}</td>
      </tr>`;
    })
    .join('');

  const th = 'padding:10px 8px;font-size:11px;font-weight:600;color:#111827;border-bottom:2px solid #111827;text-align:left;';

  return `<table style="width:100%;border-collapse:collapse;margin-top:4px;">
    <thead><tr>
      <th style="${th}">Description</th>
      <th style="${th} text-align:center;width:56px;">Qty</th>
      <th style="${th} text-align:right;width:88px;">Price</th>
      <th style="${th} text-align:right;width:88px;">Total</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export function buildStudioFooter(
  settings: AppSettings,
  notes: string | null,
  options: { navy?: string; blue?: string } = {},
): string {
  const navy = options.navy ?? '#1E3A8A';
  const blue = options.blue ?? '#0056B3';

  const contactParts: string[] = [];
  if (settings.businessPhone) {
    contactParts.push(`<span>${escapeHtml(settings.businessPhone)}</span>`);
  }
  if (settings.businessEmail) {
    contactParts.push(`<span>${escapeHtml(settings.businessEmail)}</span>`);
  }
  if (settings.businessWebsite) {
    contactParts.push(`<span>${escapeHtml(settings.businessWebsite)}</span>`);
  }
  if (settings.businessAddress) {
    contactParts.push(`<span>${escapeHtml(settings.businessAddress)}</span>`);
  }

  const contactRow =
    contactParts.length > 0
      ? `<div style="margin-top:18px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.2);display:flex;justify-content:center;flex-wrap:wrap;gap:8px 20px;font-size:12px;line-height:1.6;">
          ${contactParts.join('<span style="opacity:0.45;">·</span>')}
        </div>`
      : '';

  const termsBlock = notes
    ? `<div style="margin-bottom:14px;">
        <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;opacity:0.7;">Notes</p>
        <p style="margin:0;font-size:12px;line-height:1.65;opacity:0.92;white-space:pre-wrap;">${escapeHtml(notes)}</p>
      </div>`
    : '';

  return `<div style="margin-top:44px;margin-left:-40px;margin-right:-40px;margin-bottom:-48px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 40" preserveAspectRatio="none" style="display:block;width:100%;height:36px;">
      <path d="M0,40 L0,18 Q200,0 400,18 T800,18 L800,40 Z" fill="${navy}"/>
      <path d="M0,40 L0,22 Q200,6 400,22 T800,22 L800,40 Z" fill="${blue}" opacity="0.35"/>
    </svg>
    <div style="background:${navy};color:#fff;padding:8px 40px 28px;text-align:center;">
      ${termsBlock}
      <p style="margin:0;font-size:13px;font-style:italic;opacity:0.9;">Thank you for your business!</p>
      ${contactRow}
    </div>
  </div>`;
}
