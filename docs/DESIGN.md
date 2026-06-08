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
- **Startup flow:** Native splash stays visible until fonts + SQLite/settings load; `SplashOverlay` matches native splash (no spinner flash)
- **Regenerate assets:** `python mobile/scripts/generate_splash_assets.py`

## Dark mode

- Respects system preference by default
- User can override in Settings → Appearance
- All screens use `useTheme()` for colors

## Touch targets

Minimum 48dp height for buttons and inputs.

## PDF (free tier)

Footer watermark: *"Created with Accvo — Upgrade to Pro to remove this watermark"*
