import type { Invoice } from '@/types/invoice';
import type { InvoiceTemplate } from '@/types/invoiceTemplate';
import type { AppSettings } from '@/types/settings';
import { formatCurrency } from '@/utils/currency';
import { formatDisplayDate } from '@/utils/dates';

export interface InvoicePdfContext {
  invoice: Invoice;
  settings: AppSettings;
  showWatermark: boolean;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildLineRows(invoice: Invoice, rowStyle: string): string {
  return invoice.lineItems
    .map(
      (item) => `
      <tr>
        <td style="${rowStyle}">${escapeHtml(item.description)}</td>
        <td style="${rowStyle} text-align:center;">${item.quantity}</td>
        <td style="${rowStyle} text-align:right;">${formatCurrency(item.unitPrice, invoice.currency)}</td>
        <td style="${rowStyle} text-align:right;">${formatCurrency(item.quantity * item.unitPrice, invoice.currency)}</td>
      </tr>`,
    )
    .join('');
}

function buildTotals(invoice: Invoice, accentColor: string, align: 'left' | 'right' = 'right'): string {
  const alignStyle = align === 'right' ? 'text-align:right;' : '';
  return `
    <div style="margin-top:24px;${alignStyle}">
      <p style="margin:4px 0;color:#4B5563;">Subtotal: ${formatCurrency(invoice.subtotal, invoice.currency)}</p>
      <p style="margin:4px 0;color:#4B5563;">Tax (${invoice.taxRate}%): ${formatCurrency(invoice.taxAmount, invoice.currency)}</p>
      <p style="margin:8px 0 0;font-size:20px;font-weight:bold;color:${accentColor};">
        Total: ${formatCurrency(invoice.total, invoice.currency)}
      </p>
    </div>`;
}

function buildWatermark(show: boolean): string {
  if (!show) return '';
  return `<div style="margin-top:40px;padding-top:16px;border-top:1px dashed #CBD5E1;text-align:center;color:#94A3B8;font-size:12px;">
    Created with Accvo — Upgrade to Pro to remove this watermark
  </div>`;
}

function buildMetaBlock(invoice: Invoice, statusStyle: string): string {
  return `
    <p style="margin:0 0 8px;color:#4B5563;font-size:14px;">
      Invoice <strong>${escapeHtml(invoice.invoiceNumber)}</strong>
    </p>
    <p style="margin:0 0 16px;color:#4B5563;font-size:14px;">
      <span style="${statusStyle}">${invoice.status.toUpperCase()}</span>
      &nbsp;·&nbsp; Issued ${formatDisplayDate(invoice.issueDate)}
      ${invoice.dueDate ? `&nbsp;·&nbsp; Due ${formatDisplayDate(invoice.dueDate)}` : ''}
    </p>
    ${invoice.customerName ? `<p style="margin:0 0 20px;"><strong>Bill to:</strong> ${escapeHtml(invoice.customerName)}</p>` : ''}`;
}

function buildNotes(notes: string | null): string {
  if (!notes) return '';
  return `<p style="margin-top:24px;color:#4B5563;line-height:1.5;"><strong>Notes:</strong> ${escapeHtml(notes)}</p>`;
}

function buildClassic(ctx: InvoicePdfContext): string {
  const { invoice, settings, showWatermark } = ctx;
  const rowStyle = 'padding:10px 8px;border-bottom:1px solid #E5E7EB;';
  const statusStyle =
    'display:inline-block;padding:4px 12px;border-radius:12px;background:#E8F1FB;color:#0056B3;font-size:11px;font-weight:600;';

  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
  <style>body{font-family:Helvetica,Arial,sans-serif;color:#111827;margin:40px;}</style></head><body>
  <h1 style="color:#0056B3;margin:0 0 4px;font-size:28px;">${escapeHtml(settings.businessName)}</h1>
  ${buildMetaBlock(invoice, statusStyle)}
  <table style="width:100%;border-collapse:collapse;">
    <thead><tr>
      <th style="text-align:left;padding:10px 8px;background:#E8F1FB;color:#004494;font-size:13px;">Description</th>
      <th style="text-align:center;padding:10px 8px;background:#E8F1FB;color:#004494;font-size:13px;">Qty</th>
      <th style="text-align:right;padding:10px 8px;background:#E8F1FB;color:#004494;font-size:13px;">Rate</th>
      <th style="text-align:right;padding:10px 8px;background:#E8F1FB;color:#004494;font-size:13px;">Amount</th>
    </tr></thead>
    <tbody>${buildLineRows(invoice, rowStyle)}</tbody>
  </table>
  ${buildTotals(invoice, '#0056B3')}
  ${buildNotes(invoice.notes)}
  ${buildWatermark(showWatermark)}
  </body></html>`;
}

function buildMinimal(ctx: InvoicePdfContext): string {
  const { invoice, settings, showWatermark } = ctx;
  const rowStyle = 'padding:12px 0;border-bottom:1px solid #E5E7EB;';
  const statusStyle = 'font-size:11px;letter-spacing:0.08em;color:#6B7280;';

  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
  <style>body{font-family:Georgia,'Times New Roman',serif;color:#111827;margin:48px;}</style></head><body>
  <div style="border-bottom:2px solid #111827;padding-bottom:16px;margin-bottom:24px;">
    <h1 style="margin:0;font-size:26px;font-weight:normal;letter-spacing:0.02em;">${escapeHtml(settings.businessName)}</h1>
  </div>
  ${buildMetaBlock(invoice, statusStyle)}
  <table style="width:100%;border-collapse:collapse;">
    <thead><tr>
      <th style="text-align:left;padding:8px 0;border-bottom:2px solid #111827;font-size:12px;font-weight:600;">Description</th>
      <th style="text-align:center;padding:8px 0;border-bottom:2px solid #111827;font-size:12px;">Qty</th>
      <th style="text-align:right;padding:8px 0;border-bottom:2px solid #111827;font-size:12px;">Rate</th>
      <th style="text-align:right;padding:8px 0;border-bottom:2px solid #111827;font-size:12px;">Amount</th>
    </tr></thead>
    <tbody>${buildLineRows(invoice, rowStyle)}</tbody>
  </table>
  ${buildTotals(invoice, '#111827')}
  ${buildNotes(invoice.notes)}
  ${buildWatermark(showWatermark)}
  </body></html>`;
}

function buildModern(ctx: InvoicePdfContext): string {
  const { invoice, settings, showWatermark } = ctx;
  const rowStyle = 'padding:10px 12px;border-bottom:1px solid #E5E7EB;';
  const statusStyle =
    'display:inline-block;padding:4px 10px;border-radius:4px;background:rgba(255,255,255,0.2);color:#fff;font-size:11px;font-weight:600;';

  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
  <style>body{font-family:Helvetica,Arial,sans-serif;color:#111827;margin:0;}</style></head><body>
  <div style="background:#0056B3;color:#fff;padding:32px 40px 28px;">
    <h1 style="margin:0 0 8px;font-size:26px;">${escapeHtml(settings.businessName)}</h1>
    <p style="margin:0;opacity:0.9;font-size:14px;">INVOICE ${escapeHtml(invoice.invoiceNumber)}</p>
  </div>
  <div style="height:4px;background:#3B9BFF;"></div>
  <div style="padding:32px 40px 40px;">
    <p style="margin:0 0 8px;color:#4B5563;font-size:14px;">
      <span style="display:inline-block;padding:4px 10px;border-radius:4px;background:#E8F1FB;color:#0056B3;font-size:11px;font-weight:600;">${invoice.status.toUpperCase()}</span>
      &nbsp;·&nbsp; Issued ${formatDisplayDate(invoice.issueDate)}
      ${invoice.dueDate ? `&nbsp;·&nbsp; Due ${formatDisplayDate(invoice.dueDate)}` : ''}
    </p>
    ${invoice.customerName ? `<p style="margin:0 0 24px;"><strong>Bill to:</strong> ${escapeHtml(invoice.customerName)}</p>` : '<div style="margin-bottom:24px;"></div>'}
    <table style="width:100%;border-collapse:collapse;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
      <thead><tr style="background:#F9FAFB;">
        <th style="text-align:left;padding:12px;font-size:12px;color:#374151;">Description</th>
        <th style="text-align:center;padding:12px;font-size:12px;color:#374151;">Qty</th>
        <th style="text-align:right;padding:12px;font-size:12px;color:#374151;">Rate</th>
        <th style="text-align:right;padding:12px;font-size:12px;color:#374151;">Amount</th>
      </tr></thead>
      <tbody>${buildLineRows(invoice, rowStyle)}</tbody>
    </table>
    ${buildTotals(invoice, '#0056B3')}
    ${buildNotes(invoice.notes)}
    ${buildWatermark(showWatermark)}
  </div>
  </body></html>`;
}

export function buildInvoiceHtml(ctx: InvoicePdfContext): string {
  switch (ctx.settings.invoiceTemplate) {
    case 'minimal':
      return buildMinimal(ctx);
    case 'modern':
      return buildModern(ctx);
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
    case 'classic':
    default:
      return '#0056B3';
  }
}
