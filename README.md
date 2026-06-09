# Accvo

AI-powered business assistant for small service businesses — invoicing, CRM, and finance tracking.

## Overview

Accvo helps freelancers, service providers, and small agencies create invoices, manage customers, and track income — all from their phone. **Phase 1 (MVP)** runs fully **local-first** with no sign-up required.

### Phase 1 features (current)

- Invoice generator with line items, tax, due dates, and notes
- **Duplicate invoice** from invoice detail
- **Search & filter** on Invoices and Customers tabs
- **Recurring invoices** — weekly, monthly, quarterly, or yearly schedules; drafts auto-created when due
- PDF export, preview, and share (Accvo watermark on free tier)
- **4 invoice PDF templates** (Classic, Minimal, Modern, Elegant) + business card designs
- Customer records with inline edit on detail screen
- **Analytics dashboard** (free) — computed locally from SQLite; no servers, no cost
  - Outstanding amount, average invoice, month-over-month paid revenue
  - 6-month revenue chart, top customers by paid revenue
- Income summary on home dashboard
- Business profile, logo, and business card PDF
- Welcome screen with guest mode (no account on launch)
- Offline mode (SQLite on device)
- Multi-currency support
- Slide-out menu → Settings, Business Card, Upgrade

### Analytics (free tier)

All analytics run **on your device** from invoice data in SQLite. There is no Firebase Analytics, no third-party SDK, and **no ongoing cost** — just SQL queries when you open the dashboard.

### Build standalone APK (EAS)

```bash
cd mobile
npm run build:android
```

Production build:

```bash
cd mobile
npm run build:android:prod
```

For local dev build: `npx expo run:android` (USB device required).

### Coming soon

- **Phase 2:** Pro sign-up, cloud sync, Firebase auth, Stripe payment links
- **Phase 3:** AI features — **included in free tier** (monthly limits) + unlimited/advanced AI on Pro
- **Phase 4:** Scheduling, expenses, push notifications

## Tech stack

| Layer | Technology |
|-------|------------|
| Mobile | Expo SDK 54, React Native, TypeScript |
| Navigation | Expo Router |
| Local DB | expo-sqlite |
| State | Zustand + React Context (theme) |
| PDF | expo-print + expo-sharing + react-native-webview (preview) |
| Backend (Phase 2+) | Firebase Auth, Firestore, Cloud Functions |

## Project structure

```
accvo/
├── mobile/          # Expo React Native app
├── docs/            # Architecture, API, design, standards
├── functions/       # Firebase Cloud Functions (Phase 2+)
└── README.md
```

## Getting started

### Prerequisites

- Node.js 20 LTS
- npm
- Android Studio or Expo development build on a physical device

### Run the app

```bash
cd mobile
npm install
npm start
```

Press `a` for Android emulator, or scan the QR code with your development build.

### Build for Android (EAS)

```bash
cd mobile
npm run build:android
```

## Freemium model

**Strategy:** Keep core invoicing and a **generous free AI tier** so more people try and share Accvo. Pro monetizes power users, sync, and removing friction (watermark, limits).

| Free | Pro |
|------|-----|
| Unlimited invoices | No PDF watermark |
| Local analytics dashboard | Cloud backup & sync |
| Recurring invoices | **Unlimited AI** |
| **AI included** (monthly limits — see below) | Voice → invoice |
| PDF export + share (watermark) | Advanced pricing & reminders |
| Guest mode, no account required | Stripe payment links |

### AI (free vs Pro)

AI runs via **Cloud Functions** (OpenAI keys never on device). Free users get real AI value; Pro removes caps and unlocks advanced flows.

| Capability | Free | Pro |
|------------|------|-----|
| Draft invoice from short prompt | Yes (monthly limit) | Unlimited |
| Improve line-item wording | Yes (monthly limit) | Unlimited |
| Basic smart suggestions | Yes | Unlimited |
| Voice → invoice | — | Yes |
| Advanced pricing insights | — | Yes |

**Planned free limits (tunable):** e.g. ~15–20 AI-assisted actions per month per device/account — enough for regular freelancers, not enough for heavy agency use.

No account required for free tier. Sign-in optional until cloud sync or Pro upgrade.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API & Data Schema](docs/API.md)
- [Design System](docs/DESIGN.md)
- [Coding Standards](docs/CODING_STANDARDS.md)
- [Git Workflow](docs/GIT_WORKFLOW.md)

## License

Private — All rights reserved.
