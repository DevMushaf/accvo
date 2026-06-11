import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { getBusinessLogoDataUri } from '@/services/businessLogoService';
import {
  buildBusinessCardFaceHtml,
  buildBusinessCardHtml,
} from '@/services/pdf/businessCardPdfTemplates';
import { buildInvoiceHtml } from '@/services/pdf/invoicePdfTemplates';
import { wrapHtmlForScreenPreview } from '@/services/pdf/pdfHtmlUtils';
import type { Invoice } from '@/types/invoice';
import type { AppSettings } from '@/types/settings';

async function resolveInvoiceLogo(settings: AppSettings): Promise<string | null> {
  if (!settings.showLogoOnInvoice || !settings.businessLogoUri) return null;
  return getBusinessLogoDataUri(settings.businessLogoUri);
}

async function resolveBusinessCardLogo(settings: AppSettings): Promise<string | null> {
  if (!settings.showLogoOnBusinessCard || !settings.businessLogoUri) return null;
  return getBusinessLogoDataUri(settings.businessLogoUri);
}

function invoiceHtml(
  invoice: Invoice,
  settings: AppSettings,
  logoDataUri: string | null,
): string {
  const showWatermark = settings.subscriptionTier === 'free';
  return buildInvoiceHtml({ invoice, settings, showWatermark, logoDataUri });
}

function businessCardHtml(
  settings: AppSettings,
  forPrint: boolean,
  logoDataUri: string | null,
): string {
  const showWatermark = settings.subscriptionTier === 'free';
  return buildBusinessCardHtml({ settings, showWatermark, forPrint, logoDataUri });
}

function businessCardFaceHtml(
  settings: AppSettings,
  side: 'front' | 'back',
  forPrint: boolean,
  logoDataUri: string | null,
): string {
  const showWatermark = settings.subscriptionTier === 'free';
  return buildBusinessCardFaceHtml({ settings, showWatermark, forPrint, logoDataUri }, side);
}

export function getInvoicePreviewHtml(
  invoice: Invoice,
  settings: AppSettings,
  logoDataUri: string | null = null,
): string {
  return wrapHtmlForScreenPreview(invoiceHtml(invoice, settings, logoDataUri), 'invoice');
}

export function getBusinessCardPreviewHtml(
  settings: AppSettings,
  logoDataUri: string | null = null,
): string {
  return wrapHtmlForScreenPreview(businessCardHtml(settings, false, logoDataUri), 'card');
}

export function getBusinessCardFacePreviewHtml(
  settings: AppSettings,
  side: 'front' | 'back',
  logoDataUri: string | null = null,
): string {
  return wrapHtmlForScreenPreview(businessCardFaceHtml(settings, side, false, logoDataUri), 'card-face');
}

export async function exportInvoicePdf(
  invoice: Invoice,
  settings: AppSettings,
): Promise<string> {
  const logoDataUri = await resolveInvoiceLogo(settings);
  const { uri } = await Print.printToFileAsync({
    html: invoiceHtml(invoice, settings, logoDataUri),
    base64: false,
  });
  return uri;
}

export async function exportBusinessCardPdf(settings: AppSettings): Promise<string> {
  const logoDataUri = await resolveBusinessCardLogo(settings);
  const { uri } = await Print.printToFileAsync({
    html: businessCardHtml(settings, true, logoDataUri),
    base64: false,
  });
  return uri;
}

export async function exportBusinessCardFacePdf(
  settings: AppSettings,
  side: 'front' | 'back',
): Promise<string> {
  const logoDataUri = await resolveBusinessCardLogo(settings);
  const { uri } = await Print.printToFileAsync({
    html: businessCardFaceHtml(settings, side, true, logoDataUri),
    base64: false,
  });
  return uri;
}

export async function sharePdf(uri: string, title: string): Promise<void> {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: title,
    UTI: 'com.adobe.pdf',
  });
}

export async function shareImage(uri: string, title: string): Promise<void> {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'image/png',
    dialogTitle: title,
    UTI: 'public.png',
  });
}

export async function exportAndShareInvoice(
  invoice: Invoice,
  settings: AppSettings,
): Promise<void> {
  const uri = await exportInvoicePdf(invoice, settings);
  await sharePdf(uri, 'Share Invoice');
}

export async function exportAndShareBusinessCard(settings: AppSettings): Promise<void> {
  const uri = await exportBusinessCardPdf(settings);
  await sharePdf(uri, 'Share Business Card');
}

export async function exportAndShareBusinessCardFacePdf(
  settings: AppSettings,
  side: 'front' | 'back',
): Promise<void> {
  const uri = await exportBusinessCardFacePdf(settings, side);
  await sharePdf(uri, side === 'front' ? 'Share Card Front' : 'Share Card Back');
}

export async function shareBusinessCardPreviewPng(uri: string): Promise<void> {
  await shareImage(uri, 'Share Business Card Preview');
}

/** @deprecated Use sharePdf */
export async function shareInvoicePdf(uri: string): Promise<void> {
  await sharePdf(uri, 'Share Invoice');
}
