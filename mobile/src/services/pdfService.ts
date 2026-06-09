import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { buildInvoiceHtml } from '@/services/pdf/invoicePdfTemplates';
import type { Invoice } from '@/types/invoice';
import type { AppSettings } from '@/types/settings';

export async function exportInvoicePdf(
  invoice: Invoice,
  settings: AppSettings,
): Promise<string> {
  const showWatermark = settings.subscriptionTier === 'free';
  const html = buildInvoiceHtml({ invoice, settings, showWatermark });
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
