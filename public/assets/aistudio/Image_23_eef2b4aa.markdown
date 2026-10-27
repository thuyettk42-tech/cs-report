---
name: Customer Care Enterprise
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
  on-surface-variant: '#3f4851'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6f7882'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006195'
  on-primary: '#ffffff'
  primary-container: '#007aba'
  on-primary-container: '#fdfcff'
  inverse-primary: '#94ccff'
  secondary: '#006e2c'
  on-secondary: '#ffffff'
  secondary-container: '#66fc88'
  on-secondary-container: '#00722f'
  tertiary: '#385e8c'
  on-tertiary: '#ffffff'
  tertiary-container: '#5276a6'
  on-tertiary-container: '#fdfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cde5ff'
  primary-fixed-dim: '#94ccff'
  on-primary-fixed: '#001d32'
  on-primary-fixed-variant: '#004b74'
  secondary-fixed: '#69ff8b'
  secondary-fixed-dim: '#48e171'
  on-secondary-fixed: '#002108'
  on-secondary-fixed-variant: '#005320'
  tertiary-fixed: '#d3e3ff'
  tertiary-fixed-dim: '#a4c9fd'
  on-tertiary-fixed: '#001c39'
  on-tertiary-fixed-variant: '#204875'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Be Vietnam Pro
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
  code-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-dense: 0.75rem
  margin: 1.5rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

This design system delivers a high-efficiency enterprise customer care ecosystem tailored for high-volume retail operations, multi-channel support, and CRM workflows. Engineered specifically for complex information processing, it balances rapid operational utility with visual clarity.

The visual style is **Corporate / Modern High-Density SaaS**:
- **Clarity & Trust:** Crisp white surfaces, deep navy structural framing, and deliberate brand blue highlights instill confidence and dependability.
- **Cognitive Ergonomics:** High data density designed to prevent eye strain during extended operator shifts. UI boundaries are defined by delicate structural dividers rather than overwhelming backgrounds.
- **Purposeful Accents:** Vibrant status colors (success green, alert amber, critical red, working blue) provide immediate visual triage across ticket queues, customer records, and SLA monitors.

## Colors

The palette is tuned for high-contrast enterprise accessibility and long-duration screen ergonomics:

- **Primary (`#0090DA`):** The signature brand blue drives primary calls to action, active navigation tabs, interactive state borders, and focal selection rings.
- **Secondary (`#20C65A`):** The vibrant growth green acts as an accent for resolution milestones, verified store tags, success notifications, and positive trend indicators.
- **Tertiary / Headings (`#073763`):** Deep navy forms the backbone of content hierarchy, delivering authoritative headers, modal titles, and high-emphasis data figures.
- **Neutral & Structural (`#64748B`):** Cool slate governs supporting body text, secondary labels, and meta captions.
- **Surfaces & Canvas:** The background sits on an airy cool tone (`#F5F8FC` / `#F8FAFC`), framing foreground cards and tables in pure white (`#FFFFFF`) with subtle cool gray outlines (`#E2E8F0`).
- **Semantic Badging:**
  - *Success:* `#20C65A` with background `#ECFDF5`
  - *Warning / Pending:* `#F59E0B` with background `#FFFBEB`
  - *Critical / Escalated:* `#EF4444` with background `#FEF2F2`
  - *In-Progress / Info:* `#0090DA` with background `#F0F9FF`

## Typography

Typography focuses on flawless rendering of Vietnamese diacritics, numerals, and compact tabular arrangements.

- **Primary Family (Be Vietnam Pro):** Powers all typographic headers and conversational UI (ticket responses, notes, knowledge-base summaries) with balanced letterforms and open apertures.
- **Secondary Family (Inter):** Deployed for compact data tags, form labels, table cells, timestamps, and order identifiers, maximizing legibility at 11px to 13px sizes.
- **Numerical Alignment:** Monospaced figures (`tabular-nums`) are mandatory across financial ledgers, inventory counts, and support ticket counters to maintain visual alignment across dense listings.

## Layout & Spacing

The layout is built around a flexible 12-column grid designed for desktop-first enterprise consoles, scaling cleanly to tablet and field inspection views:

- **Desktop (1280px+):** Fixed 240px collapsible navigation rail, fluid main workboard, and an optional 360px contextual sidebar (customer profile / history). Standard `gutter` of 16px (`1rem`) and page outer `margin` of 24px (`1.5rem`).
- **Dense Data Panels:** High-volume data grids (call logs, transaction histories) employ `gutter-dense` (12px / `0.75rem`) to maximize visible fields without introducing visual clutter.
- **Padding Discipline:** Internal component padding operates on a 4px/8px modular rhythm (`space-xs` = 4px, `space-sm` = 8px, `space-md` = 12px, `space-lg` = 20px, `space-xl` = 28px).

## Elevation & Depth

Visual hierarchy leverages crisp border definitions combined with delicate, low-contrast drop shadows:

- **Level 0 (Flat Canvas):** The `#F8FAFC` foundation carries no shadow; separation is provided by structural layout whitespace.
- **Level 1 (Card & Module Resting):** Pure `#FFFFFF` surface bordered with 1px solid `#E2E8F0`, enhanced by a subtle shadow: `0 1px 3px 0 rgba(7, 55, 99, 0.04), 0 1px 2px -1px rgba(7, 55, 99, 0.02)`.
- **Level 2 (Hover & Filter Dropdowns):** Interactive rows and open select menus lift gently with `0 4px 6px -1px rgba(7, 55, 99, 0.07), 0 2px 4px -2px rgba(7, 55, 99, 0.05)`.
- **Level 3 (Modals & Flyouts):** Customer 360 flyout drawers and critical confirmation dialogs apply `0 20px 25px -5px rgba(7, 55, 99, 0.1), 0 8px 10px -6px rgba(7, 55, 99, 0.05)`.
- **No heavy black shadows:** All shadow tokens use a 4–10% tint of the tertiary navy (`#073763`) rather than neutral black, preserving an authentic corporate finish.

## Shapes

The design system standardizes on modern, balanced rounded geometry (level 2):

- **Default UI controls (8px / `0.5rem`):** Applied to form fields, buttons, segmented toggles, and dropdown triggers to maintain a crisp, clean contour.
- **Containers & Cards (12px / `0.75rem` / `rounded-lg`):** Dashboard tiles, modal sheets, and data table containers use a smooth 12px radius.
- **Status Pills & Avatars (Full / 9999px):** SLA badges, priority status chips, and agent avatars use fully rounded pill contours to distinguish metadata from structural containers.

## Components

### Buttons
- **Primary:** Solid `#0090DA` fill, pure white text, 8px border radius, 36px standard height (`space-sm` vertical, `space-lg` horizontal padding). Hover transitions to `#007bbd`. Focus ring displays 2px outer glow (`rgba(0, 144, 218, 0.3)`).
- **Secondary / Ghost:** White background, 1px `#CBD5E1` border, `#073763` text. Hover shifts background to `#F1F5F9`.
- **Destructive:** Solid `#EF4444` fill or soft tint with red text for irreversible actions (e.g., ticket deletion, store decoupling).

### Chips & Status Indicators
- **Layout:** Height 24px, 9999px pill radius, `Inter` 11px font weight 600, uppercase or title case.
- **Variants:**
  - *Resolved / Active:* 1px `#BBF7D0` border, `#ECFDF5` background, `#15803D` text, 6px solid `#20C65A` status dot.
  - *Pending / SLA At Risk:* 1px `#FED7AA` border, `#FFFBEB` background, `#B45309` text, 6px amber dot.
  - *Escalated:* 1px `#FECACA` border, `#FEF2F2` background, `#B91C1C` text, 6px pulse-capable red dot.

### Input Fields & Controls
- **Text Inputs & Selects:** Height 36px (compact) to 40px (standard). Surface `#FFFFFF`, border 1px `#CBD5E1`, text `#0F2744`. Focus state swaps border to `#0090DA` with a 3px soft blue halo.
- **Checkboxes & Radios:** 16x16px frame with 4px corner radius for checkboxes, full circle for radios. Active state adopts `#0090DA` fill with clean white interior checkmark.

### Cards & Data Tables
- **Cards:** Background `#FFFFFF`, 12px corner radius, 1px `#E2E8F0` border. Headers feature 16px bottom padding with subtle border separation.
- **Tables:** Dense 40px row height for listings; header row `#F8FAFC` with uppercase 11px `#64748B` labels. Subtle 1px bottom border `#F1F5F9`. Selected rows highlight with `#F0F9FF`.