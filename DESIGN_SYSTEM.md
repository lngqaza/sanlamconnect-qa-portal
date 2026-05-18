# QA Portal Design System

**Version:** 1.0  
**Status:** Active  
**Last Updated:** 2026-05-18  
**Scope:** SanlamConnect Validation Lab (QA Portal)

---

## Brand Identity

- **Name:** SanlamConnect Validation Lab
- **Tagline:** "System Health Verification & Compliance Reporting"
- **Purpose:** Execute automated checks, verify system health, generate compliance reports
- **Tone:** Professional, confident, outcomes-focused, non-technical
- **Audience:** Operations team, compliance officers, QA engineers, executives

---

## Color Palette

### Primary Colors

| Name | Hex | Usage | RGB |
|------|-----|-------|-----|
| **Deep Brand Blue** | #003478 | Main brand color, headings, primary buttons | 0, 52, 120 |
| **Brand Blue** | #0057A8 | Links, secondary actions, focus states | 0, 87, 168 |
| **Light Blue** | #0099CC | Hover states, selected items, tertiary actions | 0, 153, 204 |

### Status Colors

| Name | Hex | Usage | RGB |
|------|-----|-------|-----|
| **Success Green** | #2D9E5F | Passed checks, healthy status, positive outcomes | 45, 158, 95 |
| **Warning Amber** | #E8A200 | At-risk status, needs attention, caution | 232, 162, 0 |
| **Critical Red** | #C8002B | Failed checks, urgent action required | 200, 0, 43 |
| **Neutral Gray** | #6B7280 | Disabled states, secondary info, neutral status | 107, 114, 128 |
| **Info Purple** | #6B46C1 | Informational messages, documentation links | 107, 70, 193 |

### Background Colors

| Name | Hex | Usage | RGB |
|------|-----|-------|-----|
| **Dark Navy** | #0D1B2E | Main background (ops room feel) | 13, 27, 46 |
| **Darker Navy** | #060F1C | High-contrast areas, text overlays | 6, 15, 28 |
| **Light Gray** | #F0F4F8 | Future light mode support, card backgrounds | 240, 244, 248 |
| **Medium Gray** | #374151 | Borders, dividers, subtle contrast | 55, 65, 81 |

### Text Colors

| Name | Hex | Usage | RGB |
|------|-----|-------|-----|
| **Primary Text** | #F3F4F6 | Body copy on dark backgrounds | 243, 244, 246 |
| **Secondary Text** | #D1D5DB | Metadata, timestamps, secondary copy | 209, 213, 219 |
| **Disabled Text** | #9CA3AF | Disabled form fields, inactive states | 156, 163, 175 |

---

## Typography

### Font Family

**Primary:** Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif  
**Monospace:** Courier New (for code, technical references)

### Heading Styles

- **H1:** 32px, bold (#003478), 140% line height — Page titles
- **H2:** 24px, bold (#003478), 130% line height — Section headers
- **H3:** 18px, semi-bold (#003478), 130% line height — Card titles
- **Body Regular:** 14px, regular (#F3F4F6), 150% line height — Main copy
- **Body Small:** 12px, regular (#D1D5DB), 140% line height — Metadata
- **Label:** 12px, semi-bold (#D1D5DB), uppercase — Form labels

---

## Spacing System (8px Grid)

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon padding |
| sm | 8px | Element padding |
| md | 16px | Card padding |
| lg | 24px | Section spacing |
| xl | 32px | Page margins |
| 2xl | 48px | Hero spacing |

---

## Components

### Buttons

**Primary:** Brand Blue (#0057A8), 10px 20px padding, 4px border-radius
- Hover: Darker blue (#003478) + Level 1 shadow
- Disabled: Gray (#6B7280), not-allowed cursor

**Secondary:** Medium Gray (#374151), 10px 20px padding
- Hover: Lighter gray + Level 1 shadow

**Danger:** Critical Red (#C8002B), 10px 20px padding
- Hover: Darker red + Level 1 shadow

**Icon Button:** Transparent, 24px icon, Brand Blue color
- Hover: Light Blue 20% opacity background

### Status Badge

Padding: 6px 12px | Border radius: 20px | Font: Label (12px, semi-bold)

- **Success:** Green (#2D9E5F) + ✓
- **Warning:** Amber (#E8A200) + ⚠️
- **Critical:** Red (#C8002B) + ✕
- **Pending:** Gray (#6B7280) + ⏳
- **Info:** Purple (#6B46C1) + ℹ️

### Card

Background: Darker Navy (#060F1C) | Border: 1px Brand Blue 20% opacity | Padding: 16px | Border radius: 8px
- Hover: Border opacity 40%, slight lift

### Alert

Padding: 12px 16px | Border-left: 4px colored | Border-radius: 4px
- Info: Purple background 10%
- Warning: Amber background 10%
- Critical: Red background 10%
- Success: Green background 10%

### Form Input

Background: Darker Navy | Border: 1px Medium Gray | Padding: 8px 12px | Border-radius: 4px
- Focus: Border Brand Blue (2px), outline offset 2px
- Disabled: Gray border 50%, not-allowed cursor

---

## Shadows & Elevation

- **Level 0:** No shadow (most surfaces)
- **Level 1:** `0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)` (hover)
- **Level 2:** `0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)` (modals)

---

## Animations

- **Subtle:** 150ms ease-in-out
- **Noticeable:** 300ms ease-in-out
- **Button press:** 100ms scale(1 → 0.98)
- **Hover lift:** 150ms translateY(0 → -2px)

---

## Responsive Design

- **Mobile:** 320px–479px (stack vertically)
- **Tablet:** 480px–767px (2 columns)
- **Desktop:** 768px+ (3+ columns)

Mobile-first approach: design for 320px, enhance with media queries.

---

## Accessibility

- **Color Contrast:** WCAG AA minimum (4.5:1 normal, 3:1 large)
- **Focus States:** 2px Brand Blue outline, 2px offset
- **Interactive Elements:** Text labels, not icon-only
- **Forms:** Always associated labels
- **Keyboard Navigation:** Tab, Enter, Arrow keys
- **Screen Readers:** Semantic HTML, ARIA labels, `aria-live` regions

---

## Implementation Notes

- Use CSS variables for all colors
- Prefer semantic HTML5 (nav, main, section, button, label)
- All interactive elements must have visible focus states
- Respect `prefers-reduced-motion` media query
- Icons: SVG with inline styling
- Layouts: Flexbox/CSS Grid, avoid absolute positioning
- Mobile-first approach

---

**Last Updated:** 2026-05-18  
**Version:** 1.0
