import { converter } from 'culori';

const toOklch = converter('oklch');

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function shift(base, deltaLightness, deltaChroma, deltaHue) {
  return {
    l: clamp(base.l + deltaLightness, 0, 1),
    c: clamp(base.c + deltaChroma, 0, 0.37),
    h: (base.h + deltaHue + 360) % 360,
  };
}

function toCss({ l, c, h }) {
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
}

/**
 * Derives the full brand accent palette from a single hex color.
 * The deltas below reproduce this template's original hand-picked palette
 * almost exactly when given its original accent color (#e5462c).
 */
export function deriveBrandTokens(brandHex) {
  const base = toOklch(brandHex);
  if (!base || Number.isNaN(base.h)) {
    throw new Error(`brand.color "${brandHex}" could not be parsed as a color`);
  }
  const withHue = { ...base, h: base.h ?? 0 };

  return {
    accent: toCss(withHue),
    accentHi: toCss(shift(withHue, 0.08, -0.01, 8)),
    ember: toCss(shift(withHue, 0.14, -0.04, 28)),
    ctaGradFrom: toCss(shift(withHue, 0.03, 0.01, 2.5)),
    ctaGradTo: toCss(shift(withHue, -0.07, 0, -4.5)),
  };
}
