import type { Invoice } from '@/types/invoice';
import type { InvoiceTemplate } from '@/types/invoiceTemplate';
import type { AppSettings } from '@/types/settings';
import { formatCurrency } from '@/utils/currency';
import { formatDisplayDate } from '@/utils/dates';

import {
  buildBusinessHeaderBlock,
  buildWatermark,
  escapeHtml,
} from '@/services/pdf/pdfHtmlUtils';

export interface InvoicePdfContext {
  invoice: Invoice;
  settings: AppSettings;
  showWatermark: boolean;
  logoDataUri?: string | null;
}

const PAGE_STYLE = `
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

function buildLineRows(invoice: Invoice, rowStyle: string): string {
  return invoice.lineItems
    .map(
      (item) => `
      <tr>
        <td style="${rowStyle}">${escapeHtml(item.description)}</td>
        <td style="${rowStyle} text-align:center;">${item.quantity}</td>
        <td style="${rowStyle} text-align:right;">${formatCurrency(item.unitPrice, invoice.currency)}</td>
        <td style="${rowStyle} text-align:right;font-weight:600;">${formatCurrency(item.quantity * item.unitPrice, invoice.currency)}</td>
      </tr>`,
    )
    .join('');
}

function buildTotals(invoice: Invoice, accentColor: string): string {
  return `
    <div style="margin-top:28px;margin-left:auto;max-width:280px;">
      <div style="display:flex;justify-content:space-between;padding:6px 0;color:#4B5563;font-size:14px;">
        <span>Subtotal</span><span>${formatCurrency(invoice.subtotal, invoice.currency)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;color:#4B5563;font-size:14px;">
        <span>Tax (${invoice.taxRate}%)</span><span>${formatCurrency(invoice.taxAmount, invoice.currency)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:12px 0 0;margin-top:8px;border-top:2px solid ${accentColor};font-size:20px;font-weight:700;color:${accentColor};">
        <span>Total</span><span>${formatCurrency(invoice.total, invoice.currency)}</span>
      </div>
    </div>`;
}

function buildInvoiceMeta(invoice: Invoice, statusStyle: string): string {
  return `
    <div style="margin:24px 0;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;">
        <div>
          <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.08em;color:#6B7280;text-transform:uppercase;">Invoice</p>
          <p style="margin:0;font-size:22px;font-weight:700;color:#111827;">${escapeHtml(invoice.invoiceNumber)}</p>
        </div>
        <div style="text-align:right;">
          <span style="${statusStyle}">${invoice.status.toUpperCase()}</span>
          <p style="margin:8px 0 0;font-size:13px;color:#4B5563;">Issued ${formatDisplayDate(invoice.issueDate)}</p>
          ${invoice.dueDate ? `<p style="margin:2px 0 0;font-size:13px;color:#4B5563;">Due ${formatDisplayDate(invoice.dueDate)}</p>` : ''}
        </div>
      </div>
      ${invoice.customerName ? `
        <div style="margin-top:20px;padding:16px;background:#F9FAFB;border-radius:8px;border:1px solid #E5E7EB;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;color:#6B7280;text-transform:uppercase;">Bill to</p>
          <p style="margin:0;font-size:16px;font-weight:600;color:#111827;">${escapeHtml(invoice.customerName)}</p>
        </div>` : ''}
    </div>`;
}

function buildNotes(notes: string | null): string {
  if (!notes) return '';
  return `<div style="margin-top:28px;padding:16px;background:#F9FAFB;border-left:4px solid #0056B3;border-radius:0 8px 8px 0;">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;color:#6B7280;text-transform:uppercase;">Notes</p>
    <p style="margin:0;color:#374151;line-height:1.6;font-size:14px;">${escapeHtml(notes)}</p>
  </div>`;
}

function tableHead(thStyle: string): string {
  return `
    <thead><tr>
      <th style="${thStyle} text-align:left;">Description</th>
      <th style="${thStyle} text-align:center;width:60px;">Qty</th>
      <th style="${thStyle} text-align:right;width:90px;">Rate</th>
      <th style="${thStyle} text-align:right;width:90px;">Amount</th>
    </tr></thead>`;
}

function headerOptions(ctx: InvoicePdfContext, overrides: Parameters<typeof buildBusinessHeaderBlock>[1] = {}) {
  return {
    logoDataUri: ctx.logoDataUri,
    showLogo: ctx.settings.showLogoOnInvoice,
    ...overrides,
  };
}

function buildClassic(ctx: InvoicePdfContext): string {
  const { invoice, settings, showWatermark } = ctx;
  const rowStyle = 'padding:12px 10px;border-bottom:1px solid #E5E7EB;font-size:14px;';
  const thStyle = 'padding:12px 10px;background:#0056B3;color:#fff;font-size:12px;font-weight:600;letter-spacing:0.04em;';
  const statusStyle =
    'display:inline-block;padding:5px 14px;border-radius:20px;background:#E8F1FB;color:#0056B3;font-size:11px;font-weight:700;';

  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
  <style>${PAGE_STYLE}</style></head><body>
  <div style="border-bottom:3px solid #0056B3;padding-bottom:20px;margin-bottom:8px;">
    ${buildBusinessHeaderBlock(settings, headerOptions(ctx, { nameColor: '#0056B3' }))}
  </div>
  ${buildInvoiceMeta(invoice, statusStyle)}
  <table style="width:100%;border-collapse:collapse;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
    ${tableHead(thStyle)}
    <tbody>${buildLineRows(invoice, rowStyle)}</tbody>
  </table>
  ${buildTotals(invoice, '#0056B3')}
  ${buildNotes(invoice.notes)}
  ${buildWatermark(showWatermark)}
  </body></html>`;
}

function buildMinimal(ctx: InvoicePdfContext): string {
  const { invoice, settings, showWatermark } = ctx;
  const rowStyle = 'padding:14px 0;border-bottom:1px solid #E5E7EB;font-size:14px;';
  const thStyle = 'padding:10px 0;border-bottom:2px solid #111827;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#374151;';
  const statusStyle = 'font-size:11px;letter-spacing:0.1em;color:#6B7280;font-weight:600;';

  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
  <style>${PAGE_STYLE} body{font-family:Georgia,'Times New Roman',serif;padding:44px 48px 52px;}</style></head><body>
  ${buildBusinessHeaderBlock(settings, headerOptions(ctx))}
  <div style="height:2px;background:#111827;margin:20px 0 0;"></div>
  ${buildInvoiceMeta(invoice, statusStyle)}
  <table style="width:100%;border-collapse:collapse;">
    ${tableHead(thStyle)}
    <tbody>${buildLineRows(invoice, rowStyle)}</tbody>
  </table>
  ${buildTotals(invoice, '#111827')}
  ${buildNotes(invoice.notes)}
  ${buildWatermark(showWatermark)}
  </body></html>`;
}

function buildModern(ctx: InvoicePdfContext): string {
  const { invoice, settings, showWatermark } = ctx;
  const rowStyle = 'padding:12px;font-size:14px;border-bottom:1px solid #E5E7EB;';
  const thStyle = 'padding:12px;background:#F3F4F6;font-size:11px;font-weight:700;color:#374151;letter-spacing:0.04em;text-transform:uppercase;';
  const statusStyle =
    'display:inline-block;padding:5px 12px;border-radius:4px;background:rgba(255,255,255,0.25);color:#fff;font-size:11px;font-weight:700;';

  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
  <style>${PAGE_STYLE} body{padding:0;}</style></head><body>
  <div style="background:linear-gradient(135deg,#0056B3 0%,#004494 100%);color:#fff;padding:36px 40px;">
    ${buildBusinessHeaderBlock(settings, headerOptions(ctx, { nameColor: '#fff', taglineColor: 'rgba(255,255,255,0.85)', contactColor: 'rgba(255,255,255,0.8)' }))}
    <div style="margin-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
      <p style="margin:0;font-size:13px;opacity:0.9;letter-spacing:0.06em;">INVOICE ${escapeHtml(invoice.invoiceNumber)}</p>
      <span style="${statusStyle}">${invoice.status.toUpperCase()}</span>
    </div>
  </div>
  <div style="height:4px;background:#3B9BFF;"></div>
  <div style="padding:32px 40px 40px;">
    <div style="margin-bottom:24px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:16px;">
      <div>
        <p style="margin:0;font-size:13px;color:#4B5563;">Issued ${formatDisplayDate(invoice.issueDate)}</p>
        ${invoice.dueDate ? `<p style="margin:4px 0 0;font-size:13px;color:#4B5563;">Due ${formatDisplayDate(invoice.dueDate)}</p>` : ''}
      </div>
      ${invoice.customerName ? `
        <div style="text-align:right;">
          <p style="margin:0 0 4px;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;">Bill to</p>
          <p style="margin:0;font-size:16px;font-weight:600;">${escapeHtml(invoice.customerName)}</p>
        </div>` : ''}
    </div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
      ${tableHead(thStyle)}
      <tbody>${buildLineRows(invoice, rowStyle)}</tbody>
    </table>
    ${buildTotals(invoice, '#0056B3')}
    ${buildNotes(invoice.notes)}
    ${buildWatermark(showWatermark)}
  </div>
  </body></html>`;
}

function buildElegant(ctx: InvoicePdfContext): string {
  const { invoice, settings, showWatermark } = ctx;
  const rowStyle = 'padding:12px 10px;border-bottom:1px solid #E8EEF4;font-size:14px;';
  const thStyle = 'padding:12px 10px;background:#F0F4F8;color:#004494;font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;border-bottom:2px solid #004494;';
  const statusStyle =
    'display:inline-block;padding:5px 14px;border-radius:6px;border:1px solid #004494;color:#004494;font-size:11px;font-weight:700;';

  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
  <style>${PAGE_STYLE} body{font-family:'Segoe UI',Helvetica,Arial,sans-serif;padding:40px 44px 52px;}</style></head><body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:20px;padding-bottom:24px;border-bottom:1px solid #D1D5DB;">
    ${buildBusinessHeaderBlock(settings, headerOptions(ctx, { nameColor: '#004494' }))}
    <div style="text-align:right;">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.1em;color:#6B7280;text-transform:uppercase;">Invoice</p>
      <p style="margin:0;font-size:24px;font-weight:700;color:#111827;">${escapeHtml(invoice.invoiceNumber)}</p>
      <div style="margin-top:10px;"><span style="${statusStyle}">${invoice.status.toUpperCase()}</span></div>
    </div>
  </div>
  <div style="display:flex;justify-content:space-between;margin:20px 0 28px;flex-wrap:wrap;gap:16px;">
    <div>
      <p style="margin:0;font-size:13px;color:#4B5563;">Issued ${formatDisplayDate(invoice.issueDate)}</p>
      ${invoice.dueDate ? `<p style="margin:4px 0 0;font-size:13px;color:#4B5563;">Due ${formatDisplayDate(invoice.dueDate)}</p>` : ''}
    </div>
    ${invoice.customerName ? `
      <div>
        <p style="margin:0 0 4px;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;">Bill to</p>
        <p style="margin:0;font-size:16px;font-weight:600;">${escapeHtml(invoice.customerName)}</p>
      </div>` : ''}
  </div>
  <table style="width:100%;border-collapse:collapse;">
    ${tableHead(thStyle)}
    <tbody>${buildLineRows(invoice, rowStyle)}</tbody>
  </table>
  ${buildTotals(invoice, '#004494')}
  ${buildNotes(invoice.notes)}
  ${buildWatermark(showWatermark)}
  </body></html>`;
}

export function buildInvoiceHtml(ctx: InvoicePdfContext): string {
  switch (ctx.settings.invoiceTemplate) {
    case 'minimal':
      return buildMinimal(ctx);
    case 'modern':
      return buildModern(ctx);
    case 'elegant':
      return buildElegant(ctx);
    case 'classic':
    default:
      return buildClassic(ctx);
  }
}

export function getTemplatePreviewColor(template: InvoiceTemplate): string {
  switch (template) {
    case 'minimal':
      return '#111827';
    case 'modern':
      return '#0056B3';
    case 'elegant':
      return '#004494';
    case 'classic':
    default:
      return '#0056B3';
  }
}
