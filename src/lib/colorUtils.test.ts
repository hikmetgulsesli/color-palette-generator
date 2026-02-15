import { describe, it, expect } from 'vitest'
import {
  isValidHex,
  expandShortHex,
  generateRandomColor,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hexToHsl,
  hslToHex,
  formatRgb,
  formatHsl,
  relativeLuminance,
  isDarkColor,
} from './colorUtils'

// ---------------------------------------------------------------------------
// isValidHex
// ---------------------------------------------------------------------------

describe('isValidHex', () => {
  it('accepts 6-digit hex with #', () => {
    expect(isValidHex('#FF5733')).toBe(true)
    expect(isValidHex('#000000')).toBe(true)
    expect(isValidHex('#ffffff')).toBe(true)
    expect(isValidHex('#a3e635')).toBe(true)
  })

  it('accepts 3-digit hex with #', () => {
    expect(isValidHex('#abc')).toBe(true)
    expect(isValidHex('#FFF')).toBe(true)
  })

  it('rejects invalid strings', () => {
    expect(isValidHex('')).toBe(false)
    expect(isValidHex('FF5733')).toBe(false)
    expect(isValidHex('#GG5733')).toBe(false)
    expect(isValidHex('#12345')).toBe(false)
    expect(isValidHex('#1234567')).toBe(false)
    expect(isValidHex('#ab')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// expandShortHex
// ---------------------------------------------------------------------------

describe('expandShortHex', () => {
  it('expands 3-digit to 6-digit', () => {
    expect(expandShortHex('#abc')).toBe('#aabbcc')
    expect(expandShortHex('#f0c')).toBe('#ff00cc')
  })

  it('lowercases 6-digit hex', () => {
    expect(expandShortHex('#AABBCC')).toBe('#aabbcc')
  })

  it('throws for invalid hex', () => {
    expect(() => expandShortHex('not-hex')).toThrow(TypeError)
    expect(() => expandShortHex('#GGGGGG')).toThrow(TypeError)
  })
})

// ---------------------------------------------------------------------------
// generateRandomColor
// ---------------------------------------------------------------------------

describe('generateRandomColor', () => {
  it('returns a valid 7-char hex string', () => {
    const color = generateRandomColor()
    expect(color).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('returns different colors across calls (statistical)', () => {
    const colors = new Set(Array.from({ length: 20 }, generateRandomColor))
    expect(colors.size).toBeGreaterThan(1)
  })

  it('is a pure function with respect to output format', () => {
    for (let i = 0; i < 50; i++) {
      const c = generateRandomColor()
      expect(c).toHaveLength(7)
      expect(c[0]).toBe('#')
      expect(isValidHex(c)).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// hexToRgb
// ---------------------------------------------------------------------------

describe('hexToRgb', () => {
  it('converts #FF5733 to { r: 255, g: 87, b: 51 }', () => {
    expect(hexToRgb('#FF5733')).toEqual({ r: 255, g: 87, b: 51 })
  })

  it('converts #000000 to { r: 0, g: 0, b: 0 }', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
  })

  it('converts #ffffff to { r: 255, g: 255, b: 255 }', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('handles 3-digit shorthand', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 })
    expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('is case-insensitive', () => {
    expect(hexToRgb('#ff5733')).toEqual(hexToRgb('#FF5733'))
  })

  it('throws for invalid hex', () => {
    expect(() => hexToRgb('')).toThrow(TypeError)
    expect(() => hexToRgb('nope')).toThrow(TypeError)
    expect(() => hexToRgb('#zzzzzz')).toThrow(TypeError)
  })
})

// ---------------------------------------------------------------------------
// rgbToHex
// ---------------------------------------------------------------------------

describe('rgbToHex', () => {
  it('converts { r: 255, g: 87, b: 51 } to #ff5733', () => {
    expect(rgbToHex({ r: 255, g: 87, b: 51 })).toBe('#ff5733')
  })

  it('converts black', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000')
  })

  it('converts white', () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff')
  })

  it('clamps out-of-range values', () => {
    expect(rgbToHex({ r: 300, g: -10, b: 128 })).toBe('#ff0080')
  })

  it('rounds fractional values', () => {
    expect(rgbToHex({ r: 127.6, g: 0.4, b: 255 })).toBe('#8000ff')
  })

  it('roundtrips with hexToRgb', () => {
    const original = '#a3e635'
    expect(rgbToHex(hexToRgb(original))).toBe(original)
  })
})

// ---------------------------------------------------------------------------
// rgbToHsl
// ---------------------------------------------------------------------------

describe('rgbToHsl', () => {
  it('converts pure red', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 })
  })

  it('converts pure green', () => {
    expect(rgbToHsl({ r: 0, g: 255, b: 0 })).toEqual({ h: 120, s: 100, l: 50 })
  })

  it('converts pure blue', () => {
    expect(rgbToHsl({ r: 0, g: 0, b: 255 })).toEqual({ h: 240, s: 100, l: 50 })
  })

  it('converts white', () => {
    expect(rgbToHsl({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, l: 100 })
  })

  it('converts black', () => {
    expect(rgbToHsl({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, l: 0 })
  })

  it('converts a mid-range color (#FF5733)', () => {
    const hsl = rgbToHsl({ r: 255, g: 87, b: 51 })
    expect(hsl.h).toBe(11)
    expect(hsl.s).toBe(100)
    expect(hsl.l).toBe(60)
  })

  it('converts grey (no saturation)', () => {
    const hsl = rgbToHsl({ r: 128, g: 128, b: 128 })
    expect(hsl.s).toBe(0)
    expect(hsl.l).toBe(50)
  })
})

// ---------------------------------------------------------------------------
// hslToRgb
// ---------------------------------------------------------------------------

describe('hslToRgb', () => {
  it('converts pure red', () => {
    expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('converts pure green', () => {
    expect(hslToRgb({ h: 120, s: 100, l: 50 })).toEqual({ r: 0, g: 255, b: 0 })
  })

  it('converts pure blue', () => {
    expect(hslToRgb({ h: 240, s: 100, l: 50 })).toEqual({ r: 0, g: 0, b: 255 })
  })

  it('converts white', () => {
    expect(hslToRgb({ h: 0, s: 0, l: 100 })).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('converts black', () => {
    expect(hslToRgb({ h: 0, s: 0, l: 0 })).toEqual({ r: 0, g: 0, b: 0 })
  })

  it('converts grey', () => {
    const rgb = hslToRgb({ h: 0, s: 0, l: 50 })
    expect(rgb.r).toBe(128)
    expect(rgb.g).toBe(128)
    expect(rgb.b).toBe(128)
  })

  it('roundtrips with rgbToHsl for primary colors', () => {
    const colors = [
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 255, b: 0 },
      { r: 0, g: 0, b: 255 },
      { r: 255, g: 255, b: 0 },
      { r: 0, g: 255, b: 255 },
      { r: 255, g: 0, b: 255 },
    ]
    for (const rgb of colors) {
      expect(hslToRgb(rgbToHsl(rgb))).toEqual(rgb)
    }
  })
})

// ---------------------------------------------------------------------------
// hexToHsl / hslToHex convenience wrappers
// ---------------------------------------------------------------------------

describe('hexToHsl', () => {
  it('converts #ff0000 to red hsl', () => {
    expect(hexToHsl('#ff0000')).toEqual({ h: 0, s: 100, l: 50 })
  })

  it('throws for invalid input', () => {
    expect(() => hexToHsl('invalid')).toThrow(TypeError)
  })
})

describe('hslToHex', () => {
  it('converts red hsl to #ff0000', () => {
    expect(hslToHex({ h: 0, s: 100, l: 50 })).toBe('#ff0000')
  })

  it('converts green hsl to #00ff00', () => {
    expect(hslToHex({ h: 120, s: 100, l: 50 })).toBe('#00ff00')
  })
})

// ---------------------------------------------------------------------------
// formatRgb / formatHsl
// ---------------------------------------------------------------------------

describe('formatRgb', () => {
  it('formats standard rgb', () => {
    expect(formatRgb({ r: 255, g: 87, b: 51 })).toBe('rgb(255, 87, 51)')
  })

  it('clamps values', () => {
    expect(formatRgb({ r: 300, g: -5, b: 0 })).toBe('rgb(255, 0, 0)')
  })
})

describe('formatHsl', () => {
  it('formats standard hsl', () => {
    expect(formatHsl({ h: 11, s: 100, l: 60 })).toBe('hsl(11, 100%, 60%)')
  })
})

// ---------------------------------------------------------------------------
// relativeLuminance / isDarkColor
// ---------------------------------------------------------------------------

describe('relativeLuminance', () => {
  it('returns 0 for black', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 4)
  })

  it('returns 1 for white', () => {
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 4)
  })

  it('returns ~0.2126 for pure red', () => {
    expect(relativeLuminance({ r: 255, g: 0, b: 0 })).toBeCloseTo(0.2126, 3)
  })
})

describe('isDarkColor', () => {
  it('returns true for black', () => {
    expect(isDarkColor('#000000')).toBe(true)
  })

  it('returns false for white', () => {
    expect(isDarkColor('#ffffff')).toBe(false)
  })

  it('returns true for dark blue', () => {
    expect(isDarkColor('#00008b')).toBe(true)
  })

  it('returns false for yellow', () => {
    expect(isDarkColor('#ffff00')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Purity checks
// ---------------------------------------------------------------------------

describe('purity: no side effects', () => {
  it('hexToRgb returns consistent results', () => {
    const hex = '#FF5733'
    const result1 = hexToRgb(hex)
    const result2 = hexToRgb(hex)
    expect(result1).toEqual(result2)
  })

  it('rgbToHex does not mutate input', () => {
    const rgb = { r: 100, g: 200, b: 50 }
    const original = { ...rgb }
    rgbToHex(rgb)
    expect(rgb).toEqual(original)
  })

  it('rgbToHsl does not mutate input', () => {
    const rgb = { r: 100, g: 200, b: 50 }
    const original = { ...rgb }
    rgbToHsl(rgb)
    expect(rgb).toEqual(original)
  })

  it('hslToRgb does not mutate input', () => {
    const hsl = { h: 120, s: 50, l: 50 }
    const original = { ...hsl }
    hslToRgb(hsl)
    expect(hsl).toEqual(original)
  })
})
