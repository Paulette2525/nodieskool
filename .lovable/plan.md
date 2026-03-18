

## Problem

The current PWA icon (`tribbue-logo.png`) is a **landscape wordmark** (full "tribbue" text) used for all icon sizes. When displayed as a square app icon on mobile home screens, the text becomes tiny and illegible — as visible in your screenshot.

Per the branding guidelines, mobile icons should use a **square icon with only the blue infinity symbol on white background**, not the full wordmark.

## Plan

### 1. Generate proper square PWA icons using AI

Use the existing `generate-icon` edge function (or a similar approach) to create a clean square icon:
- **512x512** icon: blue infinity symbol centered on white background
- **192x192** icon: same design, smaller size
- **Maskable variant**: same icon with extra padding (safe zone) for Android adaptive icons

The infinity symbol should be extracted from the "bb" ligature in the Tribbue logo — thick, modern, rounded, blue (#2563EB) on pure white.

### 2. Update PWA manifest in `vite.config.ts`

Update the manifest icons array to reference properly sized and named files:
- `pwa-192x192.png` — 192x192 standard icon
- `pwa-512x512.png` — 512x512 standard icon  
- `pwa-512x512-maskable.png` — 512x512 maskable icon (with `purpose: "maskable"`)

Currently all three entries point to `tribbue-logo.png`. They need to point to the new square icons.

### 3. Update `index.html` references

- `apple-touch-icon` → point to the new 192x192 square icon
- `favicon` → point to the new square icon

### 4. Keep full wordmark for in-app use

`tribbue-logo.png` and `src/assets/tribbue-logo.png` remain unchanged for in-app header/sidebar branding.

### Summary of files changed

| File | Change |
|------|--------|
| `public/pwa-192x192.png` | Replace with square infinity icon |
| `public/pwa-512x512.png` | Replace with square infinity icon |
| `vite.config.ts` | Update manifest icon paths and sizes |
| `index.html` | Update favicon and apple-touch-icon to use square icon |

