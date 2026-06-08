import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { Invoice } from '@/types/invoice';
import type { AppSettings } from '@/types/settings';
import { formatCurrency } from '@/utils/currency';
import { formatDisplayDate } from '@/utils/dates';

function buildInvoiceHtml(
  invoice: Invoice,
  settings: AppSettings,
  showWatermark: boolean,
): string {
  const lineRows = invoice.lineItems
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #E5E7EB;">${escapeHtml(item.description)}</td>
        <td style="padding:8px;border-bottom:1px solid #E5E7EB;text-align:center;">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #E5E7EB;text-align:right;">${formatCurrency(item.unitPrice, invoice.currency)}</td>
        <td style="padding:8px;border-bottom:1px solid #E5E7EB;text-align:right;">${formatCurrency(item.quantity * item.unitPrice, invoice.currency)}</td>
      </tr>`,
    )
    .join('');

  const watermark = showWatermark
    ? `<div style="margin-top:40px;padding-top:16px;border-top:1px dashed #CBD5E1;text-align:center;color:#94A3B8;font-size:12px;">
         Created with Accvo — Upgrade to Pro to remove this watermark
       </div>`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Helvetica, Arial, sans-serif; color: #111827; margin: 40px; }
    h1 { color: #0056B3; margin-bottom: 4px; }
    .meta { color: #4B5563; font-size: 14px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { text-align: left; padding: 8px; background: #E8F1FB; color: #004494; font-size: 13px; }
    .totals { margin-top: 24px; text-align: right; }
    .totals p { margin: 4px 0; }
    .total-row { font-size: 18px; font-weight: bold; color: #0056B3; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 12px; background: #E8F1FB; color: #0056B3; font-size: 12px; text-transform: uppercase; }
  </style>
</head>
<body>
  <h1>${escapeHtml(settings.businessName)}</h1>
  <div class="meta">Invoice ${escapeHtml(invoice.invoiceNumber)}</div>
  <div class="meta">
    <span class="status">${invoice.status}</span>
    &nbsp;·&nbsp; Issued: ${formatDisplayDate(invoice.issueDate)}
    ${invoice.dueDate ? `&nbsp;·&nbsp; Due: ${formatDisplayDate(invoice.dueDate)}` : ''}
  </div>
  ${
    invoice.customerName
      ? `<p><strong>Bill to:</strong> ${escapeHtml(invoice.customerName)}</p>`
      : ''
  }
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Rate</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>${lineRows}</tbody>
  </table>
  <div class="totals">
    <p>Subtotal: ${formatCurrency(invoice.subtotal, invoice.currency)}</p>
    <p>Tax (${invoice.taxRate}%): ${formatCurrency(invoice.taxAmount, invoice.currency)}</p>
    <p class="total-row">Total: ${formatCurrency(invoice.total, invoice.currency)}</p>
  </div>
  ${invoice.notes ? `<p style="margin-top:24px;color:#4B5563;"><strong>Notes:</strong> ${escapeHtml(invoice.notes)}</p>` : ''}
  ${watermark}
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function exportInvoicePdf(
  invoice: Invoice,
  settings: AppSettings,
): Promise<string> {
  const showWatermark = settings.subscriptionTier === 'free';
  const html = buildInvoiceHtml(invoice, settings, showWatermark);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri;
}

export async function shareInvoicePdf(uri: string): Promise<void> {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Share Invoice',
    UTI: 'com.adobe.pdf',
  });
}

export async function exportAndShareInvoice(
  invoice: Invoice,
  settings: AppSettings,
): Promise<void> {
  const uri = await exportInvoicePdf(invoice, settings);
  await shareInvoicePdf(uri);
}
