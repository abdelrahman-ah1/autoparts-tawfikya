---
name: Technical Precision Auto System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006329'
  on-tertiary: '#ffffff'
  tertiary-container: '#007f36'
  on-tertiary-container: '#c7ffca'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-xl:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.005em
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  data-mono-lg:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  data-mono-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  data-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system is engineered for an automotive spare parts catalog and marketplace where technical precision, compatibility confidence, and operational clarity are paramount. The target audience comprises commercial fleet managers, certified mechanics, automotive enthusiasts, and everyday vehicle owners seeking exact-replacement parts. 

The aesthetic is Modern High-Contrast Utilitarian, blending corporate reliability with technical catalog discipline. Visual noise is minimized to prioritize critical technical attributes: Part OEM numbers, cross-compatibility indices, fitment guarantees, multi-vendor availability, and dispatch logistics. The interface communicates zero-margin-for-error precision through crisp structure, sharp information hierarchy, high-contrast text rendering, and unambiguous fitment signaling.

## Colors

The palette establishes an immediate sense of technical accuracy, industrial reliability, and unambiguous decision-making.

- **Primary (`#2563EB` - Technical Blue):** Applied to core interactive touchpoints, primary actions, active navigation states, selected fitment selectors, and active filters. It signals mechanical reliability and digital authority.
- **Dark Neutral (`#0F172A` - Slate Black):** Anchors high-contrast typography, high-priority data points (SKU, price, technical specifications), prominent icons, and header chrome.
- **Surfaces & Canvases:** Base app canvas uses `#FAFAFA`, while active cards, sheet panels, data tables, and input elements sit cleanly on `#FFFFFF` surfaces to maximize visual separation without harsh tinting.
- **Structural Outlines:** Divided across `#E2E8F0` for primary element separation, form inputs, and structural grid rules, and `#F1F5F9` for secondary cell divisions, subtle card borders, and zebra striping.
- **Fitment & Verification Tiers (Semantic):**
  - **Exact Fit (`#16A34A` Emerald):** Vehicle confirmed compatible. Accompanied by `#DCFCE7` background tint for instant visual clearance.
  - **Fitment Warning / Universal Fit (`#EA580C` Amber Rust):** Potential vehicle modification required, engine-subcode-dependent, or universal fitment. Accompanied by `#FFEDD5` tint.
  - **Non-Fit (`#DC2626` Crimson):** Confirmed incompatible with selected vehicle profile. Paired with `#FEE2E2` tint for high-contrast error prevention.
- **Marketplace Vendor Accents:** Slate neutral tones (`#475569`, `#334155`) paired with Technical Blue accents structure multi-vendor packages, shipment grouping indicators, and fulfillment badges.

## Typography

The typographic hierarchy prioritizes rapid scanability, alphanumeric legibility, and unmistakable separation between descriptive copy and technical attributes.

- **Primary UI & Narrative (Inter):** Leveraged for layout headers, descriptive product summaries, interactive labels, and general copy. Set with subtle negative tracking on large weights to maintain compact precision.
- **Technical & Catalog Data (JetBrains Mono):** Reserved for technical identifiers: Part Numbers (MPN, OEM), VIN validation fields, cross-reference codes, technical specification tables, pricing data, and stock/dimension measurements. This eliminates confusion between ambiguous glyphs like `0` vs `O` and `1` vs `I`.
- **Contrast Ratios:** All body, title, and data labels exceed WCAG AAA requirements against `#FFFFFF` surfaces using Slate Black (`#0F172A`) for primary hierarchy and `#475569` for secondary technical descriptors.

## Layout & Spacing

The layout model is anchored on an 8pt base grid rhythm with high-density data concessions using 4px micro-increments.

- **Canvas Structure:**
  - **Desktop (>= 1280px):** 12-column grid system with 24px (`1.5rem`) gutters and dynamic margins clamped to a 1440px max-width container. Provides dedicated left-rail filtering (280px) and a dense 3-to-4 column product matrix.
  - **Tablet (768px - 1279px):** 8-column layout with 16px (`1rem`) gutters and 24px (`1.5rem`) margins. Filters condense into a horizontally scrollable drawer or sticky sub-bar.
  - **Mobile (< 768px):** 4-column layout with 12px (`0.75rem`) gutters and 16px (`1rem`) outer canvas margins. Components collapse into full-width stacked configurations.
- **Rhythm & Gaps:**
  - `space-2xs` (4px) and `space-xs` (8px) for micro-spacing: icon-to-label offsets, fitment pill insets, and technical data point groupings.
  - `space-sm` (12px) and `space-md` (16px) for interior card padding, stack item separators, and input container padding.
  - `space-lg` (24px) and `space-xl` (32px) for card-to-card module offsets and categorical section demarcations.

## Elevation & Depth

Visual hierarchy is primarily driven through sharp surface boundaries, subtle 1px architectural lines, and micro-diffused ambient elevations. This prevents visual muddiness in data-dense layouts.

- **Surface Base:** Level 0 base canvas sits on `#FAFAFA`. Cards, toolbars, and content modules occupy `#FFFFFF` bounded by a crisp 1px border (`#E2E8F0` or `#F1F5F9`).
- **Elevated Interactive Layer (Cards, Dropdowns):** Subtle ambient drop shadow to indicate hoverability or stacking:
  `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05);`
- **Focus & Selection States:** Raised hover card states lift slightly without layout shift:
  `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04);` coupled with border transition from `#E2E8F0` to `#2563EB`.
- **Overlays & Modals (Fitment Checker, Technical Diagrams):** 
  `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08);` with a solid background wash `#0F172A` at 60% opacity.

## Shapes

The design system standardizes on a balanced 8px to 12px corner radius (`roundedness: 2`), delivering modern ergonomics without sacrificing the industrial, structural tone required for an engineering-focused catalog.

- **Containers & Product Cards:** Built with an outer radius of `10px` to `12px` (`0.625rem` to `0.75rem`) to frame structured parts cleanly against the `#FAFAFA` base.
- **Interactive Controls (Inputs, Action Buttons, Selectors):** Standardized strictly at `8px` (`0.5rem`) for high-precision tactile recognition.
- **Technical Badges, Fitment Indicators & Status Pills:** Built with compact `6px` (`0.375rem`) corners or `9999px` full pills depending on category:
  - Exact Fit / Fitment warnings use `6px` rounded tags with internal 1px border lines to retain an authentic mechanical tag appearance.
  - Multi-vendor badge clusters and logistics delivery counters use full-pill styling (`rounded-full`) for instant grouping distinction.

## Components

### Buttons
- **Primary:** Solid `#2563EB` fill, `#FFFFFF` text (Inter SemiBold), 8px border-radius. Min-height: 40px (Desktop), 44px (Mobile). Active state `#1D4ED8`.
- **Secondary / Technical:** Crisp `#FFFFFF` surface, 1px `#E2E8F0` border, `#0F172A` text. Hover shifts to `#F8FAFC` surface with `#CBD5E1` border.
- **Fitment Selector Trigger:** Vehicle selection button housing Year / Make / Model badge with dedicated wrench icon and chevron indicator.

### Fitment Badges
- **Exact Fit Indicator:** `#DCFCE7` background, `#16A34A` text, 1px `#BBF7D0` solid border. Houses checkmark-circle icon.
- **Fitment Warning:** `#FFEDD5` background, `#EA580C` text, 1px `#FED7AA` solid border. Accompanied by exclamation-triangle icon.
- **Non-Fit Indicator:** `#FEE2E2` background, `#DC2626` text, 1px `#FECACA` solid border. Accompanied by cross-circle icon.

### Cards (Product & Part Tile)
- Flat `#FFFFFF` surface, 10px radius, 1px `#E2E8F0` border.
- **Internal Composition:**
  1. Top bar: OEM/MPN monospace tag (`data-mono-sm`) + Fitment Status badge.
  2. Center: Neutral-backed 1:1 part image with high-contrast isolation.
  3. Part title and manufacturer brand badge.
  4. Bottom bar: Multi-vendor split-pricing, delivery estimate, and Primary Technical Action.

### Input Fields & Search Bars
- Part/VIN search input: 44px height, `#FFFFFF` background, 1px `#CBD5E1` border, 8px radius. 
- Integrated leading prefix dropdown for search scope (e.g., "VIN", "OEM Part #", "Year/Make/Model").
- Active focus state: 1px border `#2563EB` with an outer ring: `0 0 0 3px rgba(37, 99, 235, 0.15)`.

### Multi-Vendor Package Grouping Indicators
- Container for cross-vendor split shipments. Framed within a `#F8FAFC` recessed box with 1px dashed `#CBD5E1` divider lines.
- Grouping badges display fulfillment origin (e.g., "Warehouse Hub East", "Direct Manufacturer Direct"), expected carrier transit window, and consolidated cart grouping.

### Selection Controls (Checkboxes & Radios)
- Square (checkboxes, 4px radius) and round (radios), 18px x 18px dimensions, 1.5px `#94A3B8` border on `#FFFFFF`.
- Checked state: `#2563EB` solid fill with crisp `#FFFFFF` checkmark/indicator.