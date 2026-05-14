# Twirly Design System

Riso-zine aesthetic. Cream paper, hand-stamped marks, a little chaos — on purpose.
This doc is the single source of truth for building, editing, or redesigning any page.

---

## Platform targets

Twirly ships to three surfaces from one React codebase:

| Surface | How | Priority |
|---|---|---|
| **iOS / Android** | Capacitor wraps the web bundle | Primary — design here first |
| **Mobile web** | Same bundle, browser | Secondary — same layout as native |
| **Desktop web** | Same bundle, wider viewport | Supported — must look good, not perfectly crafted |

**Mobile-first means:** design for ~390 px wide, then use `sm:` / `lg:` breakpoints to add breathing room for wider screens. Never design desktop-first and try to squish it down.

**Capacitor notes:**
- Safe-area insets are handled per-component; use `env(safe-area-inset-*)` where needed (especially top nav and bottom CTAs).
- Touch targets must be at least 44×44 px — use generous `padding` on tappable elements.
- Avoid hover-only interactions; every action must be reachable by tap.

**Interaction differences by surface.** Some patterns only make sense on one surface:

| Interaction | Mobile / native | Desktop web |
|---|---|---|
| Navigate between items | Swipe (TikTok-style scroll) | Click arrows / scroll |
| Vote | Tap card or swipe | Click |
| Context menu | Long-press | Right-click or hover menu |

When a feature has different surface implementations, keep the components separate and composable — don't hide desktop behaviour behind `display: none` on narrow screens.

---

## Themes

All colour tokens live in **`src/styles/themes.js`**. Every component receives a `t` prop (the resolved theme object) — nothing imports raw hex strings directly.

```js
import { themes } from '@styles/themes';

// Inside a page or component:
const [mode, setMode] = useState('light');
const t = themes[mode]; // t.ink, t.red, t.bg, etc.
```

### Adding a new theme

Add one entry to `themes` in `src/styles/themes.js`. Nothing else changes.

```js
// Example: "newsprint" theme
newsprint: {
  bg:      '#F0EDE6',
  bgDeep:  '#E4E0D8',
  ink:     '#2B2620',
  red:     '#C0392B',
  blue:    '#2471A3',
  purple:  '#6C3483',
  mustard: '#D4AC0D',
  blend:   'multiply',
},
```

---

## Palette tokens

| Token | Light | Dark | Role |
|---|---|---|---|
| `t.bg` | `#F4ECD8` cream | `#1C1710` dark kraft | Page background |
| `t.bgDeep` | `#E9DFC5` | `#130E09` | Inset surfaces, progress bars |
| `t.ink` | `#1A1410` near-black | `#F0E6D0` off-white | All text, borders, icons |
| `t.red` | `#E63946` | `#E63946` | Primary accent — CTAs, underlines |
| `t.blue` | `#1D4E89` navy | `#5A9FD4` cornflower | Secondary accent — links, labels |
| `t.purple` | `#6A3270` | `#A668BE` | Tertiary accent — overprint effect |
| `t.mustard` | `#E8B84B` | `#F0C84C` | Tape, warm highlights |
| `t.blend` | `'multiply'` | `'screen'` | Blend mode for colour washes on tiles |

**The rule:** `multiply` darkens overlays on light backgrounds. `screen` lightens them on dark. Always use `t.blend` — never hardcode a blend mode.

---

## Typography

Three fonts. Each has a role. Don't mix them up.

| Font | Import | Use for |
|---|---|---|
| **DM Serif Display** | Google Fonts | Headlines, numbers, labels — the "ink-stamped" voice |
| **Fraunces** | Google Fonts | Body copy, nav, footer — readable serif |
| **Caveat** | Google Fonts | Handwritten notes, tags, asides — the margin-scribble voice |

```jsx
// Headline
fontFamily: '"DM Serif Display", serif'
fontStyle: 'italic'

// Body
fontFamily: '"Fraunces", serif'

// Handwritten aside
fontFamily: '"Caveat", cursive'
```

Font sizes use `clamp()` for fluid scaling:
```css
font-size: clamp(48px, 11vw, 92px);  /* hero h1 */
font-size: clamp(28px, 6vw, 44px);   /* section heading */
```

---

## Primitive components

Shared primitives live in **`src/components/riso/`** — import from there. The barrel export is `@components/riso`.

```js
import { PaperGrain } from '@components/riso';
```

### `<PaperGrain blend={t.blend} />`
Fixed SVG texture overlay that simulates paper grain. `blend` should be `t.blend`. Use once per page, directly inside the outermost div.

### `<Halftone color={t.red} opacity={0.18} rotate={12} blend={t.blend} />`
Halftone dot pattern. `absolute inset-0`, so parent needs `position: relative`. Used to add riso texture to tiles and the closer section.

### `<HandUnderline color={t.red} className="..." />`
Wobbly SVG underline. Use with `position: relative` on the parent text span and `absolute` positioning via className.

```jsx
<span style={{ position: 'relative', display: 'inline-block' }}>
  some text
  <HandUnderline color={t.red} className="absolute left-0 -bottom-2 w-full h-3" />
</span>
```

### `<HandArrow color={t.ink} />`
44×20 SVG arrow. Goes inside CTA buttons next to label text.

### `<Tape rotate={-14} color={t.blue} className="-top-2 -left-2" />`
Masking-tape strip. Positioned absolutely on a card corner. Vary `rotate` between −18 and +18 for natural look.

### `<StarStamp color={t.red} size={22} />`
8-point star. Used as a bullet or decoration next to eyebrow text.

---

## Layout conventions

- **Max width:** `max-w-screen-xl mx-auto` on every section.
- **Horizontal padding:** `px-5` mobile, `sm:px-10` desktop.
- **Hero grid:** `lg:grid lg:grid-cols-12 lg:gap-12` — headline gets `col-span-6`, tiles get `col-span-6`.
- **Tile grid:** `grid grid-cols-2 gap-3 sm:gap-4` — always 2 columns.
- **Section spacing:** `pt-24 pb-10` between major sections.

---

## Motion

Framer Motion. All entrance animations use the same two patterns:

```jsx
// Fade + slide up (text, sections)
initial={{ opacity: 0, y: 14 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}

// Staggered children (use index * 0.08 as delay offset)
transition={{ duration: 0.6, delay: 0.15 + index * 0.08 }}
```

Keep animations subtle. No bounces, no spins. The tilt on hero tiles (`rotate: tilt`) is the most dramatic thing on the page — intentionally.

---

## Building a new page

Copy this shell. Replace the sections.

```jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { themes } from '@styles/themes';
import { PaperGrain } from '../components/riso'; // extract when needed

const MyPage = () => {
  const [mode, setMode] = useState('light');
  const t = themes[mode];

  return (
    <div style={{ background: t.bg, color: t.ink, minHeight: '100vh', fontFamily: '"Fraunces", serif' }} className="relative overflow-x-hidden">
      <PaperGrain blend={t.blend} />

      <section className="relative z-10 px-5 sm:px-10 pt-14 max-w-screen-xl mx-auto">

        {/* Eyebrow */}
        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 20, color: t.ink, opacity: 0.7 }}>
          short context line here
        </p>

        {/* Headline */}
        <h1 style={{ fontFamily: '"DM Serif Display", serif', fontStyle: 'italic', color: t.ink, fontSize: 'clamp(48px, 11vw, 92px)', lineHeight: 0.94 }}>
          your headline.
          <br />
          <span style={{ color: t.blue }}>second line.</span>
        </h1>

        {/* Body */}
        <p style={{ fontFamily: '"Fraunces", serif', fontSize: 18, lineHeight: 1.45, color: t.ink, opacity: 0.82, maxWidth: 520 }}>
          One or two sentences. Benefit-focused. Not a feature list.
        </p>

      </section>
    </div>
  );
};

export default MyPage;
```

---

## Copy principles

These apply to every page, not just landing.

- **Headline:** one emotion or challenge. Not a feature description.
- **Subhead:** one sentence max. What the user *gets*, not what the product *does*.
- **Eyebrow/tag:** action loop or vibe. (`"vote. argue. repeat."` not `"comparison platform"`)
- **CTA:** specific and active. (`"see what's live"` not `"get started"`)
- **Handwritten notes:** the page's inner monologue. Wry, brief, human.
- **No number "4" in copy** — keep comparisons generic; the tiles speak for themselves.
