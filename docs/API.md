# Accvo API & Data Schema

## Phase 1 — Local SQLite

All data is stored on-device. No REST API in Phase 1.

### Tables

#### `customers`

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID-style string |
| name | TEXT | Required |
| email | TEXT | Optional |
| phone | TEXT | Optional |
| notes | TEXT | Optional |
| createdAt | TEXT | ISO 8601 |
| updatedAt | TEXT | ISO 8601 |

#### `invoices`

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | |
| invoiceNumber | TEXT | e.g. INV-0001 |
| customerId | TEXT FK | Nullable |
| status | TEXT | draft, sent, paid, overdue |
| issueDate | TEXT | YYYY-MM-DD |
| dueDate | TEXT | Nullable |
| currency | TEXT | ISO 4217 code |
| taxRate | REAL | Percentage |
| subtotal | REAL | |
| taxAmount | REAL | |
| total | REAL | |
| notes | TEXT | Nullable |
| createdAt | TEXT | ISO 8601 |
| updatedAt | TEXT | ISO 8601 |

#### `invoice_line_items`

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | |
| invoiceId | TEXT FK | CASCADE delete |
| description | TEXT | |
| quantity | REAL | |
| unitPrice | REAL | |
| sortOrder | INTEGER | |

#### `settings`

| Column | Type | Notes |
|--------|------|-------|
| key | TEXT PK | e.g. app_settings, last_invoice_number |
| value | TEXT | JSON string for app_settings |

### Repository functions

| Function | File | Description |
|----------|------|-------------|
| `createInvoice` | invoiceRepository | Create invoice + line items |
| `getAllInvoices` | invoiceRepository | List with customer names |
| `getInvoiceById` | invoiceRepository | Single invoice with line items |
| `updateInvoice` | invoiceRepository | Update fields and/or line items |
| `deleteInvoice` | invoiceRepository | Delete invoice and line items |
| `getDashboardStats` | invoiceRepository | Income and counts |
| `createCustomer` | customerRepository | Create customer |
| `getAllCustomers` | customerRepository | List customers |
| `getSettings` | settingsRepository | Load app settings |
| `saveSettings` | settingsRepository | Persist settings |
| `exportAndShareInvoice` | pdfService | Generate PDF and open share sheet |

---

## Phase 2+ — Firestore (planned)

Collections will mirror SQLite tables under `users/{uid}/`:

- `customers/{id}`
- `invoices/{id}`
- `quotes/{id}`
- `services/{id}`

### Cloud Functions (planned)

| Endpoint | Method | Free tier | Pro |
|----------|--------|-----------|-----|
| `generateInvoiceFromText` | POST | Yes (limited/month) | Unlimited |
| `improveLineItemText` | POST | Yes (limited/month) | Unlimited |
| `suggestPricing` | POST | Basic suggestions | Advanced |
| `voiceToInvoice` | POST | — | Yes |
| `createPaymentLink` | POST | — | Stripe link for invoice |
| `sendReminder` | Scheduled | — | FCM for unpaid invoices |

All AI endpoints enforce **server-side rate limits** by `subscriptionTier` and monthly usage. Guests use device-scoped counters in local settings until sign-in.

### Settings fields (planned — AI usage)

| Field | Type | Notes |
|-------|------|-------|
| `aiCreditsUsedThisMonth` | number | Resets monthly |
| `aiCreditsMonthKey` | string | e.g. `2026-06` |
| `subscriptionTier` | `free` \| `pro` | Already in app settings |

Request/response schemas will be added when Phase 2/3 is implemented.
