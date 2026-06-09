# Accvo Design System

## Brand

Accvo uses a professional blue derived from the logo — trustworthy, clean, and suited for business tools.

## Color palette

| Token | Hex | Usage |
|-------|-----|--------|
| Primary | `#0056B3` | Buttons, active tabs, links |
| Primary Dark | `#004494` | Pressed states |
| Primary Light | `#E8F1FB` | Selected rows, subtle backgrounds |
| Accent / AI | `#3B9BFF` | AI features, sparkle badge |
| Success | `#16A34A` | Paid status, income |
| Warning | `#F59E0B` | Pending, due soon |
| Error | `#DC2626` | Overdue, validation |
| Neutral 900 | `#111827` | Primary text (light) |
| Neutral 600 | `#4B5563` | Secondary text |
| Neutral 200 | `#E5E7EB` | Borders |
| Neutral 50 | `#F9FAFB` | Screen background (light) |
| Surface | `#FFFFFF` | Cards |
| Dark BG | `#0B1220` | Dark mode background |
| Dark Surface | `#151D2E` | Dark mode cards |

Implementation: `mobile/src/theme/colors.ts`

## Typography

- **Font:** Inter (400, 500, 600, 700)
- **Scale:** 12 / 14 / 16 / 20 / 24 / 32 px

## Spacing

4px base grid: 4, 8, 16, 24, 32

## Components

| Component | Usage |
|-----------|-------|
| `Button` | Primary, secondary, ghost, danger variants |
| `Input` | Form fields with label and error |
| `Card` | Content containers, 12px radius |
| `InvoiceCard` | Invoice list item |
| `CustomerCard` | Customer list item |
| `StatusChip` | Invoice status badge |
| `EmptyState` | Logo + message + CTA |
| `ScreenHeader` | Page title + subtitle |
| `HeaderMenuButton` | Top-left hamburger → opens slide-out menu |
| `AppMenuDrawer` | Slide-out menu panel (Settings, Business Card, Upgrade) |
| `AnalyticsDashboard` | Local revenue charts and business metrics (free tier) |
| `SearchBar` / `FilterChips` | List search and status filters |

## Invoice PDF templates

Users choose a default template in Settings. Applied to all shared PDFs.

| Template | Style |
|----------|--------|
| **Classic** | Accvo blue header, light blue table header (default) |
| **Minimal** | Serif type, black rules, lots of whitespace |
| **Modern** | Blue header band with accent stripe, card-style table |
| **Elegant** | Refined serif layout with subtle accents |

Implementation: `mobile/src/services/pdf/invoicePdfTemplates.ts`

## Recurring invoices

- Schedules stored locally in SQLite (`recurring_invoices`, `recurring_line_items`)
- Frequencies: weekly, monthly, quarterly, yearly
- When due, draft invoices are created automatically on dashboard focus
- Manage from Invoices tab → **Recurring schedules** or Home → **Recurring invoices**

## Navigation

- **Bottom tabs:** Home (business name in header), Invoices, Customers
- **Top-left hamburger** on all tab screens → opens `AppMenuDrawer` slide-out panel
- **Menu items:** Settings (`/settings`), Business Card (`/business-card`), Upgrade to Pro (`/upgrade`, free tier only)
- Settings and Upgrade are stack screens (back button), not tabs

## Welcome and auth flow (post-splash)

```mermaid
flowchart TD
  Splash[Splash ~2.5s] --> Welcome{hasSeenWelcome?}
  Welcome -->|No| WelcomeScreen[welcome.tsx]
  Welcome -->|Yes| Tabs[Dashboard tabs]
  WelcomeScreen -->|Continue as Guest| Tabs
  WelcomeScreen -->|Sign in| Auth[auth placeholder]
  WelcomeScreen -->|Upgrade link| Upgrade[/upgrade]
  Auth -->|Continue as Guest| Tabs
```

- **Welcome screen** (`app/welcome.tsx`): shown once on first install
  - Primary: **Continue as Guest** → dashboard, local SQLite, no login
  - Secondary: **Sign in / Sign up** → Phase 2 auth placeholder
  - Link: **Upgrade to Pro**
- **Auth stub** (`app/auth/index.tsx`): Firebase auth in Phase 2; guest escape hatch always available
- **Guest banner** on Home: dismissible prompt to sign in later (does not block PDF or invoices)
- **Business setup card** on Home: optional link to Settings if business name is still default
- Settings fields: `authMode`, `hasSeenWelcome`, `hasDismissedGuestBanner`

## Splash screen

- **Style:** Full Accvo logo (icon + wordmark) centered on white
- **Background:** `#FFFFFF`
- **Center graphic:** `logo-transparent.png` — original full logo, no cropping
- **Size:** 300×200dp (native splash via `expo-splash-screen`, `imageWidth: 300`)
- **Status bar:** Dark content during splash
- **Assets:**
  - `logo-transparent.png` — full logo for splash, empty states, and upgrade screen
  - `logo-icon-only.png` — blue icon crop (app icon generation)
  - `icon.png` — 1024×1024 app icon (white icon on brand blue)
- **Tagline:** "Create invoices in seconds" under logo during in-app splash overlay
- **Regenerate assets:** `python mobile/scripts/generate_splash_assets.py`

## Theme

- Light mode only (Phase 1)
- All screens use `useTheme()` for colors

## Touch targets

Minimum 48dp height for buttons and inputs.

## PDF (free tier)

Footer watermark: *"Created with Accvo — Upgrade to Pro to remove this watermark"*

## AI features (Phase 3 — planned)

- **Accent color** `#3B9BFF` for AI actions, sparkle badge, and “Generate with AI” buttons
- **Free tier:** Show AI entry points on invoice create/edit; display remaining monthly uses (e.g. “12 AI assists left”)
- **Pro tier:** No usage badge; unlock voice input and advanced pricing UI
- **UX rule:** AI never auto-saves — user always reviews and confirms before persisting to SQLite

## Freemium positioning

| Free | Pro |
|------|-----|
| Core invoicing + local analytics + **limited AI** | Unlimited AI + no watermark + cloud sync |

AI on free is a **growth feature**, not a paywall — Pro sells convenience, scale, and business polish.
