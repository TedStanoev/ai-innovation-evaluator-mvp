---
name: Aura Acrylic / Hyper-Modern Glass
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
  on-surface-variant: '#3d4947'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#545c72'
  on-tertiary: '#ffffff'
  tertiary-container: '#6c748b'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  canvas-bg: '#f1f6fc'
  acrylic-bg: rgba(255, 255, 255, 0.88)
  teal-accent: '#0d9488'
  teal-glow: rgba(13, 148, 136, 0.35)
  sky-accent: '#0ea5e9'
  cyan-accent: '#06b6d4'
  emerald-accent: '#10b981'
  purple-subtle: '#9333ea'
  amber-status: '#d97706'
  amber-status-bg: rgba(254, 243, 199, 0.9)
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: '800'
    lineHeight: 2rem
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: '700'
    lineHeight: 1.75rem
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '700'
    lineHeight: 1.5rem
  body-base:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  body-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '700'
    lineHeight: 1.25rem
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
  label-xs:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 0.875rem
  metric-num:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: '800'
    lineHeight: 2rem
  micro-badge:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '800'
    lineHeight: 0.75rem
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
---

## Brand & Style
The system embodies a high-tech, futuristic evaluation cockpit built for academic, hackathon, and innovation governance platforms. Blending refined **Glassmorphism** with an ambient "aurora" glow aesthetic, it projects clarity, optimism, and computational intelligence. The interface leverages layered translucent acrylic planes (`backdrop-blur-xl`), fine light-catching gradient borders, and saturated cyan/teal chromatic energy against an airy cool slate canvas (`#f1f6fc`). The emotional tone is visionary, highly structured, clean, and energizing.

## Colors
The palette pairs an ethereal cool off-white foundation (`#f1f6fc`) with saturated chromatic gradients shifting from sky blue (`#0ea5e9`), cyan (`#06b6d4`), and teal (`#0d9488`) into emerald (`#10b981`).

- **Primary (`#0d9488`)**: Teal tone used for focused states, progress gauges, and key calls-to-action.
- **Secondary (`#0284c7`)**: Sky blue supporting metric highlights, iconography, and multi-tone linear gradients.
- **Tertiary (`#0f172a`)**: Slate navy anchors typography for maximum legible contrast against frosted layers.
- **Atmospheric Aurora**: Behind surfaces sit massive blurred radial light fields (cyan/teal/emerald) creating tinted translucent refraction.
- **Role Tags**: Distinct micro-badges for multidisciplinary profiles (e.g., Purple for UI/Design, Sky for Dev, Amber for Product, Emerald for Finance).

## Typography
Typography is exclusively rendered in **Plus Jakarta Sans**, offering geometric clarity, distinct numerals, and modern legibility. Tight letter spacing (`tracking-tight`) is paired with high-impact weights (`700`, `800`) for headers and numeric metrics. Body levels balance medium weights (`500`) with slate muted tones (`#64748b`) to prevent eye fatigue amidst frosted acrylic cards.

## Layout & Spacing
The layout employs an app-shell architecture:
- **Sidebar**: Fixed 18rem (`w-72`) acrylic column housing branding, navigation tree, and profile utility.
- **Main Viewport**: Fluid, scrollable flex container capped at `max-w-7xl` centered internally.
- **Breakpoints**: 
  - Desktop (`lg` / `xl`): Multi-column side-by-side team comparisons and triple KPI headers.
  - Tablet/Mobile: Cards reflow into a single column; sidebar collapses to an overlay/drawer navigation.
- **Rhythm**: Standard 4px baseline rhythm (`space-xs` = 4px, `space-sm` = 8px, `space-md` = 16px, `space-lg` = 20px, `space-xl` = 24px).

## Elevation & Depth
Depth is constructed through frosted **Acrylic Glass Panels** and multi-stop tinted shadows rather than heavy grayscale drop shadows:
- **Base Plate Glass (`plate-acrylic`)**: `rgba(255, 255, 255, 0.88)` with `backdrop-filter: blur(20px)`, top/left borders lit with white highlights (`rgba(255, 255, 255, 0.95)`), and bottom/right borders bordered with faint cyan tint (`rgba(186, 230, 253, 0.6)`).
- **Shadow Stack**: Composite colored ambient glow:
  `box-shadow: 0 24px 50px -12px rgba(13, 148, 136, 0.16), 0 10px 24px -6px rgba(14, 165, 233, 0.13), 0 0 0 1px rgba(255, 255, 255, 0.6) inset`.
- **Card Hover Elevation**: Scales up tinted Teal/Sky shadow dispersion up to `58px`.
- **Glow Accents**: Primary action buttons and progress gauges utilize concentrated `box-shadow` cyan-teal glows (`rgba(45, 212, 191, 0.55)`).

## Shapes
The structural language leans into expansive, hyper-smooth curves:
- **Outer Shell & Major Plates**: Ultra-rounded corners at `1.5rem` to `2rem` (`rounded-3xl` / `rounded-2xl`).
- **Cards & Inner Modules**: `1rem` (`rounded-2xl` to `rounded-xl`).
- **Interactive Pills & Badges**: Fully pill-shaped (`rounded-full`) for status indicators and active count chips.
- **Corner Accent Trim**: Acrylic cards feature an edge-to-edge 6px high gradient line spanning the top border radius.

## Components

### Buttons & Interactive Controls
- **Gradient Action Button**: Vibrant linear gradient (`from-sky-500 via-teal-500 to-emerald-500`), crisp top inner specular highlight (`border-t border-white/40`), white bold label, and ambient colored drop glow (`rgba(13, 148, 136, 0.38)`).
- **Secondary Ghost Button**: Translucent white (`bg-white/90`), subtle border (`border-slate-200`), dark slate text with soft teal/sky hover transition.
- **Segmented Control Tabs**: Floating frosted pill cradle housing inactive grey-slate tabs and an active gradient pill with illuminated teal/cyan glow.

### Cards & Panels
- **Team Comparison Card**: Glass acrylic container topped with a multi-hue chromatic stripe. Features split sections: header metrics (compatibility bar with neon teal glow), stacked member roster, and translucent bottom action toolbar.
- **Metric KPI Cards**: Minimal frosted tiles featuring an icon bucket in a saturated gradient square with an elevated colored shadow.

### Member Rows & Chips
- **Participant Rows**: Soft-tinted ambient backgrounds matching the member's discipline (Sky for dev, Violet for design, Amber for lead, Emerald for finance) paired with micro-badges presenting scores (e.g. `TPS`) in white pill inserts.
- **Status Indicators**: Pill badges featuring a 6px glowing animated pulsating dot for pending and confirmed system states.