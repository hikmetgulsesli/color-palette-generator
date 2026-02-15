/**
 * Color utility functions for generating random colors and converting
 * between HEX, RGB, and HSL color formats.
 *
 * All functions are pure — no side effects, no DOM access, no mutations.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RgbColor {
  r: number
  g: number
  b: number
}

export interface HslColor {
  h: number
  s: number
  l: number
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const HEX_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

/**
 * Returns `true` when `hex` is a valid 3- or 6-digit hex color string
 * (must include the leading `#`).
 */
export function isValidHex(hex: string): boolean {
  return HEX_REGEX.test(hex)
}

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function clampDegrees(value: number): number {
  return ((value % 360) + 360) % 360
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value))
}

// ---------------------------------------------------------------------------
// Random color generation
// ---------------------------------------------------------------------------

/**
 * Generate a random hex color string (e.g. `#a3f1c9`).
 *
 * Always returns a 7-character string: `#` followed by 6 lowercase hex digits.
 */
export function generateRandomColor(): string {
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  return rgbToHex({ r, g, b })
}

// ---------------------------------------------------------------------------
// HEX to/from RGB
// ---------------------------------------------------------------------------

/**
 * Expand a 3-digit hex string to its 6-digit equivalent.
 */
export function expandShortHex(hex: string): string {
  if (!isValidHex(hex)) {
    throw new TypeError(`Invalid hex color: "${hex}"`)
  }

  const stripped = hex.slice(1)
  if (stripped.length === 6) return `#${stripped.toLowerCase()}`

  const expanded = stripped
    .split('')
    .map((ch) => ch + ch)
    .join('')
  return `#${expanded.toLowerCase()}`
}

/**
 * Convert a hex color string to an `{ r, g, b }` object.
 *
 * Accepts both 3-digit (`#abc`) and 6-digit (`#aabbcc`) formats.
 *
 * @throws {TypeError} If `hex` is not a valid hex color string.
 */
export function hexToRgb(hex: string): RgbColor {
  const full = expandShortHex(hex)

  const bigint = parseInt(full.slice(1), 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

/**
 * Convert an `{ r, g, b }` object to a 7-char lowercase hex string.
 *
 * Each channel is clamped to 0-255 and rounded to the nearest integer.
 */
export function rgbToHex(rgb: RgbColor): string {
  const r = clampByte(rgb.r)
  const g = clampByte(rgb.g)
  const b = clampByte(rgb.b)

  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

// ---------------------------------------------------------------------------
// RGB to/from HSL
// ---------------------------------------------------------------------------

/**
 * Convert an `{ r, g, b }` object (0-255 each) to `{ h, s, l }`.
 *
 * - `h` is in degrees (0-360).
 * - `s` and `l` are percentages (0-100).
 *
 * Channels are clamped to valid ranges before conversion.
 */
export function rgbToHsl(rgb: RgbColor): HslColor {
  const r = clampByte(rgb.r) / 255
  const g = clampByte(rgb.g) / 255
  const b = clampByte(rgb.b) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) * 60
        break
      case g:
        h = ((b - r) / delta + 2) * 60
        break
      case b:
        h = ((r - g) / delta + 4) * 60
        break
    }
  }

  return {
    h: Math.round(clampDegrees(h)),
    s: Math.round(clampPercent(s * 100)),
    l: Math.round(clampPercent(l * 100)),
  }
}

/**
 * Convert an `{ h, s, l }` object to `{ r, g, b }`.
 *
 * - `h` is in degrees (0-360).
 * - `s` and `l` are percentages (0-100).
 */
export function hslToRgb(hsl: HslColor): RgbColor {
  const h = clampDegrees(hsl.h) / 360
  const s = clampPercent(hsl.s) / 100
  const l = clampPercent(hsl.l) / 100

  if (s === 0) {
    const v = clampByte(Math.round(l * 255))
    return { r: v, g: v, b: v }
  }

  const hueToRgb = (p: number, q: number, t: number): number => {
    let tt = t
    if (tt < 0) tt += 1
    if (tt > 1) tt -= 1
    if (tt < 1 / 6) return p + (q - p) * 6 * tt
    if (tt < 1 / 2) return q
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
    return p
  }

  const q2 = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p2 = 2 * l - q2

  return {
    r: clampByte(Math.round(hueToRgb(p2, q2, h + 1 / 3) * 255)),
    g: clampByte(Math.round(hueToRgb(p2, q2, h) * 255)),
    b: clampByte(Math.round(hueToRgb(p2, q2, h - 1 / 3) * 255)),
  }
}

// ---------------------------------------------------------------------------
// HEX to/from HSL (convenience wrappers)
// ---------------------------------------------------------------------------

/**
 * Convert a hex color string directly to `{ h, s, l }`.
 */
export function hexToHsl(hex: string): HslColor {
  return rgbToHsl(hexToRgb(hex))
}

/**
 * Convert an `{ h, s, l }` object directly to a hex string.
 */
export function hslToHex(hsl: HslColor): string {
  return rgbToHex(hslToRgb(hsl))
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/**
 * Format an RGB color as a CSS `rgb()` string.
 */
export function formatRgb(rgb: RgbColor): string {
  return `rgb(${clampByte(rgb.r)}, ${clampByte(rgb.g)}, ${clampByte(rgb.b)})`
}

/**
 * Format an HSL color as a CSS `hsl()` string.
 */
export function formatHsl(hsl: HslColor): string {
  const hClamped = Math.round(clampDegrees(hsl.h))
  const sClamped = Math.round(clampPercent(hsl.s))
  const lClamped = Math.round(clampPercent(hsl.l))
  return `hsl(${hClamped}, ${sClamped}%, ${lClamped}%)`
}

/**
 * Return the relative luminance of an RGB color (0-1), per WCAG 2.x.
 */
export function relativeLuminance(rgb: RgbColor): number {
  const toLinear = (c: number): number => {
    const srgb = c / 255
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b)
}

/**
 * Returns `true` when the given hex color is "dark" (should use light text).
 */
export function isDarkColor(hex: string): boolean {
  return relativeLuminance(hexToRgb(hex)) < 0.179
}
