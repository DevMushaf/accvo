import type { Invoice } from '@/types/invoice';
import type { InvoiceTemplate } from '@/types/invoiceTemplate';
import type { AppSettings } from '@/types/settings';
import { formatDisplayDate } from '@/utils/dates';

import {
  buildAccountDueBox,
  buildBillToBlock,
  buildCompactBusinessHeader,
  buildContactFooterBar,
  buildGeometricHeaderSvg,
  buildInvoiceLogo,
  buildInvoiceMetaRow,
  buildLineItemsTable,
  buildPaymentBlock,
  buildStudioFooter,
  buildStudioMinimalTable,
  buildSubtotalsBreakdown,
  buildTermsFooterWithLogo,
  buildTotalsSection,
  buildWatermark,
  escapeHtml,
  INVOICE_PAGE_STYLE,
  wrapInvoiceBottom,
} from '@/services/pdf/pdfHtmlUtils';

export interface InvoicePdfContext {
  invoice: Invoice;
  settings: AppSettings;
  showWatermark: boolean;
  logoDataUri?: string | null;
}

function wrapPage(body: string, extraStyle = ''): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
  <style>${INVOICE_PAGE_STYLE}${extraStyle}</style></head><body>${body}</body></html>`;
}

/** Logo beside Notes — no white plate, slightly larger. */
function invoiceLogoFooter(ctx: InvoicePdfContext): string {
  if (!ctx.settings.showLogoOnInvoice || !ctx.logoDataUri) return '';
  return buildInvoiceLogo(ctx.logoDataUri, {
    variant: 'plain',
    shape: ctx.settings.businessLogoShape ?? 'square',
    size: 'footer',
    naturalWidth: ctx.settings.businessLogoWidth,
    naturalHeight: ctx.settings.businessLogoHeight,
    scale: ctx.settings.businessLogoScale ?? 1,
  });
}

function buildCorporate(ctx: InvoicePdfContext): string {
  const { invoice, settings, showWatermark } = ctx;
  const teal = '#0F766E';
  const tealLight = '#14B8A6';
  const navy = '#134E4A';
  const logo = invoiceLogoFooter(ctx);

  const body = `
  <div class="invoice-main">
  <div style="position:relative;margin:-36px -40px 28px;padding:28px 40px 24px;background:${navy};overflow:hidden;min-height:100px;">
    ${buildGeometricHeaderSvg(teal, tealLight)}
    <div style="position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
      <div>
        <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.85);">${escapeHtml(settings.businessName)}</p>
        ${settings.businessTagline ? `<p style="margin:2px 0 0;font-size:11px;color:rgba(255,255,255,0.65);">${escapeHtml(settings.businessTagline)}</p>` : ''}
      </div>
      <p style="margin:0;font-size:42px;font-weight:800;color:#fff;letter-spacing:0.06em;">INVOICE</p>
    </div>
  </div>
  ${buildInvoiceMetaRow(invoice, { labelColor: '#9CA3AF', valueColor: '#111827' })}
  <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:24px;margin:28px 0;">
    ${buildBillToBlock(invoice)}
    ${buildPaymentBlock(settings)}
  </div>
  ${buildLineItemsTable({ invoice, headerBg: teal, rowStyle: 'plain' })}
  ${buildTotalsSection({ invoice, accentColor: teal, layout: 'bar', align: 'full' })}
  </div>
  ${wrapInvoiceBottom(
    buildTermsFooterWithLogo(invoice.notes, logo, { businessName: settings.businessName, accentColor: teal }),
    buildWatermark(showWatermark),
    buildContactFooterBar(settings, navy),
  )}`;

  return wrapPage(body);
}

function buildBold(ctx: InvoicePdfContext): string {
  const { invoice, settings, showWatermark } = ctx;
  const navy = '#1E293B';
  const accent = '#3B9BFF';
  const lime = '#84CC16';
  const logo = invoiceLogoFooter(ctx);

  const body = `
  <div class="invoice-main">
  <div style="position:relative;margin:-36px -40px 28px;padding:32px 40px;background:${navy};overflow:hidden;">
    <div style="position:absolute;top:0;right:0;width:45%;height:100%;background:linear-gradient(135deg,${accent} 0%,${lime} 100%);clip-path:polygon(30% 0, 100% 0, 100% 100%, 0 100%);opacity:0.9;"></div>
    <div style="position:relative;z-index:1;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;">
      ${buildCompactBusinessHeader(settings, {
        nameColor: '#fff',
        taglineColor: 'rgba(255,255,255,0.75)',
        nameSize: '22px',
      })}
      <div style="text-align:right;">
        <p style="margin:0;font-size:36px;font-weight:800;color:#fff;letter-spacing:0.04em;">INVOICE</p>
        <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">${escapeHtml(invoice.invoiceNumber)}</p>
      </div>
    </div>
  </div>
  <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:20px;margin-bottom:24px;">
    ${buildBillToBlock(invoice)}
    <div style="text-align:right;">
      <p style="margin:0;font-size:13px;color:#4B5563;">Issued ${formatDisplayDate(invoice.issueDate)}</p>
      ${invoice.dueDate ? `<p style="margin:4px 0 0;font-size:13px;color:#4B5563;">Due ${formatDisplayDate(invoice.dueDate)}</p>` : ''}
    </div>
  </div>
  ${buildLineItemsTable({
    invoice,
    headerBg: navy,
    headerBgLeft: lime,
    headerBgRight: navy,
    rowStyle: 'zebra',
    rowEvenBg: '#fff',
    rowOddBg: '#F3F4F6',
  })}
  ${buildTotalsSection({ invoice, accentColor: lime, accentTextColor: navy, layout: 'pill' })}
  ${buildPaymentBlock(settings)}
  </div>
  ${wrapInvoiceBottom(
    buildTermsFooterWithLogo(invoice.notes, logo, { businessName: settings.businessName, accentColor: navy }),
    buildWatermark(showWatermark),
  )}`;

  return wrapPage(body);
}

function buildRounded(ctx: InvoicePdfContext): string {
  const { invoice, settings, showWatermark } = ctx;
  const teal = '#0D9488';
  const mint = '#CCFBF1';
  const logo = invoiceLogoFooter(ctx);

  const body = `
  <div class="invoice-main">
  <div style="background:${teal};border-radius:20px;padding:28px 32px;margin-bottom:28px;color:#fff;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;">
      <div>
        <p style="margin:0;font-size:13px;opacity:0.85;">${escapeHtml(settings.businessName)}</p>
        <p style="margin:8px 0 0;font-size:32px;font-weight:800;letter-spacing:0.04em;">INVOICE</p>
      </div>
      <div style="text-align:right;">
        <p style="margin:0;font-size:13px;opacity:0.85;">${escapeHtml(invoice.invoiceNumber)}</p>
        <p style="margin:6px 0 0;font-size:12px;opacity:0.75;">${formatDisplayDate(invoice.issueDate)}</p>
        ${invoice.dueDate ? `<p style="margin:2px 0 0;font-size:12px;opacity:0.75;">Due ${formatDisplayDate(invoice.dueDate)}</p>` : ''}
      </div>
    </div>
  </div>
  <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:24px;margin-bottom:24px;">
    ${buildBillToBlock(invoice, { labelColor: teal })}
    ${buildPaymentBlock(settings, { labelColor: teal })}
  </div>
  ${buildLineItemsTable({
    invoice,
    headerBg: teal,
    rowStyle: 'rounded',
    rowEvenBg: mint,
    rowOddBg: '#fff',
  })}
  ${buildTotalsSection({ invoice, accentColor: teal, layout: 'stacked' })}
  </div>
  ${wrapInvoiceBottom(
    buildTermsFooterWithLogo(invoice.notes, logo, { businessName: settings.businessName, accentColor: teal }),
    buildWatermark(showWatermark),
  )}`;

  return wrapPage(body);
}

function buildVivid(ctx: InvoicePdfContext): string {
  const { invoice, settings, showWatermark } = ctx;
  const purple = '#5B21B6';
  const orange = '#F97316';
  const logo = invoiceLogoFooter(ctx);

  const body = `
  <div class="invoice-main">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:20px;padding-bottom:20px;border-bottom:3px solid ${purple};margin-bottom:24px;">
    ${buildCompactBusinessHeader(settings, {
      nameColor: purple,
      taglineColor: '#6B7280',
      nameSize: '24px',
    })}
    <p style="margin:0;font-size:40px;font-weight:800;color:${purple};letter-spacing:0.04em;">INVOICE</p>
  </div>
  ${buildInvoiceMetaRow(invoice, { labelColor: purple, layout: 'inline' })}
  <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:24px;margin:24px 0;">
    ${buildBillToBlock(invoice, { labelColor: purple })}
    ${buildPaymentBlock(settings, { labelColor: purple })}
  </div>
  ${buildLineItemsTable({
    invoice,
    headerBg: purple,
    rowStyle: 'zebra',
    rowEvenBg: '#fff',
    rowOddBg: '#F3F4F6',
  })}
  ${buildTotalsSection({ invoice, accentColor: orange, layout: 'bar', align: 'full' })}
  </div>
  ${wrapInvoiceBottom(
    buildTermsFooterWithLogo(invoice.notes, logo, {
      businessName: settings.businessName,
      accentColor: purple,
    }),
    buildWatermark(showWatermark),
  )}`;

  return wrapPage(body);
}

function buildStudio(ctx: InvoicePdfContext): string {
  const { invoice, settings, showWatermark } = ctx;
  const blue = '#0056B3';
  const navy = '#1E3A8A';
  const sky = '#93C5FD';
  const logo = invoiceLogoFooter(ctx);
  const tagline = settings.businessTagline
    ? `<p style="margin:2px 0 0;font-size:12px;color:#6B7280;">${escapeHtml(settings.businessTagline)}</p>`
    : '';

  const totalBox = buildAccountDueBox(invoice, {
    bgColor: '#F0F7FF',
    borderColor: sky,
    accentColor: blue,
    compact: true,
    label: 'Total',
  });

  const body = `
  <div class="invoice-main">
  <div style="position:relative;margin:-36px -40px 32px;padding:32px 40px 28px;overflow:hidden;border-bottom:1px solid #E5E7EB;">
    <div style="position:absolute;top:-40px;left:-60px;width:300px;height:180px;border-radius:50%;background:linear-gradient(135deg,rgba(0,86,179,0.1),rgba(147,197,253,0.22));pointer-events:none;"></div>
    <div style="position:absolute;top:0;right:0;width:200px;height:110px;border-radius:0 0 0 90px;background:rgba(147,197,253,0.14);pointer-events:none;"></div>
    <div style="position:relative;z-index:1;display:grid;grid-template-columns:1fr auto;grid-template-rows:auto auto;gap:16px 24px;align-items:start;">
      <div style="grid-column:1;grid-row:1;min-width:0;">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${blue};">Invoice from</p>
        <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#111827;">${escapeHtml(settings.businessName)}</p>
        ${tagline}
        <p style="margin:20px 0 0;font-size:34px;font-weight:800;color:${blue};letter-spacing:0.03em;line-height:1;">INVOICE</p>
      </div>
      <div style="grid-column:2;grid-row:1;justify-self:end;align-self:start;">
        ${totalBox}
      </div>
      <div style="grid-column:1;grid-row:2;min-width:0;">
        ${buildInvoiceMetaRow(invoice, { labelColor: blue, valueColor: '#111827', layout: 'inline' })}
      </div>
      <div style="grid-column:2;grid-row:2;justify-self:end;align-self:start;">
        ${logo}
      </div>
    </div>
  </div>

  <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:28px;margin-bottom:28px;padding:20px 22px;background:#F9FAFB;border-radius:12px;border:1px solid #E5E7EB;">
    <div style="flex:1;min-width:200px;">
      ${buildBillToBlock(invoice, { label: 'Bill to', labelColor: blue, nameColor: '#111827' })}
    </div>
    <div style="flex:1;min-width:200px;">
      ${buildPaymentBlock(settings, { labelColor: blue, textColor: '#374151' })}
    </div>
  </div>

  ${buildStudioMinimalTable(invoice)}
  ${buildSubtotalsBreakdown(invoice)}
  </div>
  ${wrapInvoiceBottom(
    buildWatermark(showWatermark),
    buildStudioFooter(settings, invoice.notes, { navy, blue }),
  )}`;

  return wrapPage(body, ' body { padding-bottom: 0; } ');
}

export function buildInvoiceHtml(ctx: InvoicePdfContext): string {
  switch (ctx.settings.invoiceTemplate) {
    case 'bold':
      return buildBold(ctx);
    case 'rounded':
      return buildRounded(ctx);
    case 'vivid':
      return buildVivid(ctx);
    case 'studio':
      return buildStudio(ctx);
    case 'corporate':
    default:
      return buildCorporate(ctx);
  }
}

export function getTemplatePreviewColor(template: InvoiceTemplate): string {
  const colors: Record<InvoiceTemplate, string> = {
    corporate: '#0F766E',
    bold: '#1E293B',
    rounded: '#0D9488',
    vivid: '#5B21B6',
    studio: '#0056B3',
  };
  return colors[template] ?? colors.corporate;
}
