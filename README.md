# Accvo

AI-powered business assistant for small service businesses — invoicing, CRM, and finance tracking.

## Overview

Accvo helps freelancers, service providers, and small agencies create invoices, manage customers, and track income — all from their phone. **Phase 1 (MVP)** runs fully **local-first** with no sign-up required.

### Phase 1 features (current)

- Invoice generator with line items, tax, and auto totals
- PDF export and share (Accvo watermark on free tier)
- Customer records
- Income dashboard (from paid invoices)
- Offline mode (SQLite on device)
- Multi-currency support
- Tax calculations
- Dark mode
- Invoice edit, due dates, and notes on detail screen
- 3 PDF templates (Classic, Minimal, Modern) — choose in Settings
- First-launch onboarding (business name & currency)
- Slide-out hamburger menu → Settings

### Build standalone APK (EAS)

```bash
cd mobile
npx eas build --platform android --profile preview
```

For local dev build: `npx expo run:android` (USB device required).

### Coming soon

- **Phase 2:** Pro sign-up, cloud sync, CRM, quotes, WhatsApp share, Stripe payment links
- **Phase 3:** AI invoice generation, voice input, smart pricing
- **Phase 4:** Scheduling, analytics, expenses, notifications

## Tech stack

| Layer | Technology |
|-------|------------|
| Mobile | Expo SDK 56, React Native, TypeScript |
| Navigation | Expo Router |
| Local DB | expo-sqlite |
| State | Zustand + React Context (theme) |
| PDF | expo-print + expo-sharing |
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
- Android Studio or Expo Go on a physical device

### Run the app

```bash
cd mobile
npm install
npm start
```

Press `a` for Android emulator, or scan the QR code with Expo Go.

### Build for Android (EAS)

```bash
cd mobile
npx eas build --platform android
```

## Freemium model

| Free | Pro (Phase 2+) |
|------|----------------|
| Unlimited invoices | No PDF watermark |
| Basic PDF + share | AI features |
| Local storage | Cloud backup & sync |
| Accvo watermark on PDF | Analytics, Stripe links, reminders |

No account required for free tier. Sign-up only when upgrading to Pro.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API & Data Schema](docs/API.md)
- [Design System](docs/DESIGN.md)
- [Coding Standards](docs/CODING_STANDARDS.md)
- [Git Workflow](docs/GIT_WORKFLOW.md)

## License

Private — All rights reserved.
