// src/styles/themes.js
//
// All visual tokens for Twirly's riso-zine aesthetic live here.
// To add a new theme: copy an existing entry, change the values, done.
// Components receive a `t` prop (the resolved theme object) — never import
// raw color strings into a component.
//
// blend — 'multiply' on light bg (darkens), 'screen' on dark bg (lightens).
// Used wherever a color wash sits on top of another colored surface.

export const themes = {
  light: {
    // Surfaces
    bg:      '#F4ECD8',   // cream paper — main background
    bgDeep:  '#E9DFC5',   // shadowed paper — inset areas, progress bars

    // Text
    ink:     '#1A1410',   // warm near-black — all body text and borders

    // Accents (riso ink colours)
    red:     '#E63946',   // riso red — primary accent, underlines, CTAs
    blue:    '#1D4E89',   // riso navy — secondary accent, links
    purple:  '#6A3270',   // overprint (red + blue bleed) — tertiary accent
    mustard: '#E8B84B',   // tape / warm highlight

    // Blend mode for colour-wash overlays (tile washes, halftone dots)
    blend:   'multiply',
  },

  dark: {
    // Surfaces — inverted: ink becomes paper
    bg:      '#1C1710',   // dark kraft — main background
    bgDeep:  '#130E09',   // deeper dark — inset areas

    // Text — inverted: cream becomes ink
    ink:     '#F0E6D0',   // warm off-white — all body text and borders

    // Accents — same hues, lifted so they read on a dark surface
    red:     '#E63946',   // riso red — unchanged, vivid on dark
    blue:    '#5A9FD4',   // cornflower — lightened from navy
    purple:  '#A668BE',   // medium violet — lightened from deep purple
    mustard: '#F0C84C',   // same mustard, reads well on dark

    // Screen lightens overlays on dark surfaces (opposite of multiply)
    blend:   'screen',
  },
};
