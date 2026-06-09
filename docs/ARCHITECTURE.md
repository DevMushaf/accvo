# Accvo Architecture

## Overview

Accvo is a **local-first** mobile app. Phase 1 stores all data on-device in SQLite. Firebase, authentication, and AI backends are introduced in Phase 2+. **AI is available on the free tier** with monthly limits; Pro removes caps and adds advanced AI (voice, pricing).

## System diagram

```
┌─────────────────────────────────────┐
│         Expo Mobile App             │
│  ┌─────────┐  ┌─────────────────┐  │
│  │   UI    │→ │ Hooks / Zustand │  │
│  └─────────┘  └────────┬────────┘  │
│                        ↓            │
│              ┌─────────────────┐  │
│              │    Services     │  │
│              └────────┬────────┘  │
│                       ↓           │
│              ┌─────────────────┐  │
│              │  expo-sqlite    │  │
│              └─────────────────┘  │
└─────────────────────────────────────┘
         ↓ (Phase 2+ — network optional)
┌─────────────────────────────────────┐
│  Firebase Auth + Firestore + CF     │
│  OpenAI (free + Pro tiers)          │
│  Stripe · FCM (Pro)                 │
└─────────────────────────────────────┘
```

## Layer responsibilities

| Layer | Location | Responsibility |
|-------|----------|----------------|
| UI | `app/`, `src/components/` | Screens, layout, user input |
| Hooks / Store | `src/hooks/`, `src/store/` | Screen state, settings |
| Services | `src/services/` | Database, PDF, future API calls |
| Utils | `src/utils/` | Currency, tax, dates |
| Types | `src/types/` | TypeScript interfaces |

**Rule:** No API or database calls inside presentational components.

## Data flow (invoice creation)

1. User fills form in `app/invoices/create.tsx`
2. Screen calls `createInvoice()` in `invoiceRepository.ts`
3. Repository calculates totals, assigns invoice number, writes to SQLite
4. Screen navigates to detail view
5. Share PDF: `pdfService` builds HTML → `expo-print` → `expo-sharing`

## Offline strategy

- All Phase 1 data lives in `accvo.db` (SQLite)
- No network required
- Phase 2 Pro migration: one-time upload of local data to Firestore on first sign-up

## AI architecture (Phase 3 — planned)

1. Mobile sends prompt + context (line items, customer name) to a Cloud Function
2. Function checks **tier + monthly usage** (free limit vs Pro unlimited)
3. OpenAI returns structured invoice JSON or text suggestions
4. Mobile applies result locally to SQLite (user confirms before save)
5. Usage counter stored in Firestore (signed-in) or device settings (guest)

**Cost control:** Rate limits on free tier; no raw API keys on device.

## Security (Phase 2+)

- Firestore rules: users read/write only their `uid`-scoped documents
- API keys (OpenAI, Stripe) live in Cloud Functions only — never on device

## Folder structure

See [README](../README.md#project-structure).
