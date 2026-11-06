# Janmabhoomi Brand Asset Placeholders & Specification

This directory holds the master vector and high-resolution raster branding assets for Janmabhoomi and sister publications under Saurashtra Trust.

## Required Official Assets for Future Drop-In:

1. **Janmabhoomi Primary Masthead / Crest**
   - File target: `janmabhoomi-logo.svg` / `janmabhoomi-logo.png`
   - Purpose: Master vector for `BrandLogo.tsx`. The component currently renders an SVG recreation of the official crest and Gujarati script logotype.
   - Dimensions: Vector SVG (viewBox 64x32 or 256x128) or transparent PNG at least 600px wide.

2. **Sister Publication Logos (Phase 2 Multi-Publication Expansion)**
   - `phulchhab-logo.svg` / `phulchhab-logo.png` (Rajkot daily)
   - `kutchmitra-logo.svg` / `kutchmitra-logo.png` (Bhuj / Kutch daily)
   - `vyapar-logo.svg` / `vyapar-logo.png` (Bi-weekly financial newspaper)
   - `janmabhoomi-pravasi-logo.svg` / `janmabhoomi-pravasi-logo.png` (Sunday flagship)
   - `khagol-siddha-panchang-logo.svg` / `khagol-siddha-panchang-logo.png` (Astronomical almanac)

When official vectors are delivered by the client/management, place them in this folder. Components will seamlessly reference them without changing layout structures.
