# Accvo image assets

## Your original logos (do not delete)

| File | What it is |
|------|------------|
| `logo-full.png` | Full Accvo logo (icon + wordmark) on white background |
| `logo-transparent.png` | Full Accvo logo on transparent background — **source for generated icons** |

## Generated from your logo (auto-created)

Run `python mobile/scripts/generate_splash_assets.py` to regenerate.

| File | Used for |
|------|----------|
| `logo-icon-only.png` | Icon mark only (no "Accvo" text) — blue |
| `splash-icon.png` | Legacy cropped icon (not used for splash) |
| `icon.png` | App icon (1024×1024) |
| `android-icon-foreground.png` | Android launcher foreground |
| `android-icon-monochrome.png` | Android themed icon |
| `android-icon-background.png` | Solid `#0056B3` (fallback; app.json uses `backgroundColor`) |
| `favicon.png` | Web favicon |

## In-app usage

| Screen | Logo file |
|--------|-----------|
| Splash (native + loading) | `logo-transparent.png` (full logo, no crop) |
| Empty states, Upgrade | `logo-transparent.png` (full wordmark) |

## Important

- **Expo Go** shows the Expo Go app icon on your home screen — not Accvo. Your splash appears **inside** Expo Go when the project loads.
- For a real Accvo home-screen icon, build a standalone APK/AAB with EAS Build.
