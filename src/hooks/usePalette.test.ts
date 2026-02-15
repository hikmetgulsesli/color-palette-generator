import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  usePalette,
  STORAGE_KEY,
  isValidPalette,
  loadPalette,
  savePalette,
  isStorageAvailable,
  type ColorSlot,
} from './usePalette'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

let colorIndex = 0
const COLOR_SEQUENCE = [
  '#aabbcc', '#ddeeff', '#112233', '#445566', '#778899',
  '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff',
  '#aa1122', '#bb3344', '#cc5566', '#dd7788', '#ee99aa',
  '#110011', '#220022', '#330033', '#440044', '#550055',
  '#660066', '#770077', '#880088', '#990099', '#aa00aa',
]

vi.mock('../lib/colorUtils', () => ({
  generateRandomColor: vi.fn(() => {
    const color = COLOR_SEQUENCE[colorIndex % COLOR_SEQUENCE.length]
    colorIndex++
    return color
  }),
}))

// ---------------------------------------------------------------------------
// Setup & Teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  colorIndex = 0
  vi.clearAllMocks()
  window.localStorage.clear()
})

afterEach(() => {
  window.localStorage.clear()
})

// ---------------------------------------------------------------------------
// isValidPalette
// ---------------------------------------------------------------------------

describe('isValidPalette', () => {
  it('returns true for a valid 5-slot palette', () => {
    const palette: ColorSlot[] = [
      { hex: '#aabbcc', locked: false },
      { hex: '#ddeeff', locked: true },
      { hex: '#112233', locked: false },
      { hex: '#445566', locked: false },
      { hex: '#778899', locked: true },
    ]
    expect(isValidPalette(palette)).toBe(true)
  })

  it('returns false for non-array', () => {
    expect(isValidPalette('not an array')).toBe(false)
    expect(isValidPalette(42)).toBe(false)
    expect(isValidPalette(null)).toBe(false)
    expect(isValidPalette(undefined)).toBe(false)
    expect(isValidPalette({})).toBe(false)
  })

  it('returns false for wrong array length', () => {
    expect(isValidPalette([])).toBe(false)
    expect(isValidPalette([{ hex: '#aabbcc', locked: false }])).toBe(false)
  })

  it('returns false for invalid hex format', () => {
    const palette = [
      { hex: 'invalid', locked: false },
      { hex: '#ddeeff', locked: false },
      { hex: '#112233', locked: false },
      { hex: '#445566', locked: false },
      { hex: '#778899', locked: false },
    ]
    expect(isValidPalette(palette)).toBe(false)
  })

  it('returns false for missing properties', () => {
    const palette = [
      { hex: '#aabbcc' },
      { hex: '#ddeeff', locked: false },
      { hex: '#112233', locked: false },
      { hex: '#445566', locked: false },
      { hex: '#778899', locked: false },
    ]
    expect(isValidPalette(palette)).toBe(false)
  })

  it('returns false for wrong property types', () => {
    const palette = [
      { hex: '#aabbcc', locked: 'yes' },
      { hex: '#ddeeff', locked: false },
      { hex: '#112233', locked: false },
      { hex: '#445566', locked: false },
      { hex: '#778899', locked: false },
    ]
    expect(isValidPalette(palette)).toBe(false)
  })

  it('returns false for 3-char hex codes', () => {
    const palette = [
      { hex: '#abc', locked: false },
      { hex: '#ddeeff', locked: false },
      { hex: '#112233', locked: false },
      { hex: '#445566', locked: false },
      { hex: '#778899', locked: false },
    ]
    expect(isValidPalette(palette)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isStorageAvailable
// ---------------------------------------------------------------------------

describe('isStorageAvailable', () => {
  it('returns true when localStorage works', () => {
    expect(isStorageAvailable()).toBe(true)
  })

  it('returns false when localStorage throws on setItem', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    setItemSpy.mockImplementation(() => {
      throw new Error('QuotaExceeded')
    })

    expect(isStorageAvailable()).toBe(false)

    setItemSpy.mockRestore()
  })
})

// ---------------------------------------------------------------------------
// savePalette / loadPalette
// ---------------------------------------------------------------------------

describe('savePalette', () => {
  it('saves palette to localStorage', () => {
    const palette: ColorSlot[] = [
      { hex: '#aabbcc', locked: false },
      { hex: '#ddeeff', locked: true },
      { hex: '#112233', locked: false },
      { hex: '#445566', locked: false },
      { hex: '#778899', locked: true },
    ]

    savePalette(palette)

    const stored = window.localStorage.getItem(STORAGE_KEY)
    expect(stored).toBe(JSON.stringify(palette))
  })

  it('fails silently when localStorage is unavailable', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    setItemSpy.mockImplementation(() => {
      throw new Error('QuotaExceeded')
    })

    expect(() => {
      savePalette([
        { hex: '#aabbcc', locked: false },
        { hex: '#ddeeff', locked: false },
        { hex: '#112233', locked: false },
        { hex: '#445566', locked: false },
        { hex: '#778899', locked: false },
      ])
    }).not.toThrow()

    setItemSpy.mockRestore()
  })
})

describe('loadPalette', () => {
  it('returns saved palette from localStorage', () => {
    const palette: ColorSlot[] = [
      { hex: '#aabbcc', locked: false },
      { hex: '#ddeeff', locked: true },
      { hex: '#112233', locked: false },
      { hex: '#445566', locked: false },
      { hex: '#778899', locked: true },
    ]

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(palette))
    const loaded = loadPalette()

    expect(loaded).toEqual(palette)
  })

  it('returns null when nothing is stored', () => {
    expect(loadPalette()).toBeNull()
  })

  it('returns null for invalid JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, 'not valid json{{{')
    expect(loadPalette()).toBeNull()
  })

  it('returns null for valid JSON with wrong structure', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 'bar' }))
    expect(loadPalette()).toBeNull()
  })

  it('returns null for array with wrong length', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ hex: '#aabbcc', locked: false }])
    )
    expect(loadPalette()).toBeNull()
  })

  it('returns null when localStorage getItem throws', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')
    getItemSpy.mockImplementation(() => {
      throw new Error('SecurityError')
    })

    expect(loadPalette()).toBeNull()

    getItemSpy.mockRestore()
  })
})

// ---------------------------------------------------------------------------
// usePalette — Initial state
// ---------------------------------------------------------------------------

describe('usePalette', () => {
  describe('initial state', () => {
    it('initializes with 5 colors on mount', () => {
      const { result } = renderHook(() => usePalette())
      expect(result.current.colors).toHaveLength(5)
    })

    it('initializes with all colors unlocked', () => {
      const { result } = renderHook(() => usePalette())
      result.current.colors.forEach((color: ColorSlot) => {
        expect(color.locked).toBe(false)
      })
    })

    it('initializes with valid hex colors', () => {
      const { result } = renderHook(() => usePalette())
      result.current.colors.forEach((color: ColorSlot) => {
        expect(color.hex).toMatch(/^#[0-9a-fA-F]{6}$/)
      })
    })
  })

  // ---------------------------------------------------------------------------
  // Return value shape
  // ---------------------------------------------------------------------------

  describe('return value shape', () => {
    it('returns colors array', () => {
      const { result } = renderHook(() => usePalette())
      expect(result.current.colors).toBeDefined()
      expect(Array.isArray(result.current.colors)).toBe(true)
    })

    it('returns generatePalette function', () => {
      const { result } = renderHook(() => usePalette())
      expect(result.current.generatePalette).toBeDefined()
      expect(typeof result.current.generatePalette).toBe('function')
    })

    it('returns lockColor function', () => {
      const { result } = renderHook(() => usePalette())
      expect(result.current.lockColor).toBeDefined()
      expect(typeof result.current.lockColor).toBe('function')
    })

    it('returns unlockColor function', () => {
      const { result } = renderHook(() => usePalette())
      expect(result.current.unlockColor).toBeDefined()
      expect(typeof result.current.unlockColor).toBe('function')
    })
  })

  // ---------------------------------------------------------------------------
  // generatePalette
  // ---------------------------------------------------------------------------

  describe('generatePalette', () => {
    it('generates new colors for unlocked slots', () => {
      const { result } = renderHook(() => usePalette())
      const initialColors = [...result.current.colors]

      act(() => {
        result.current.generatePalette()
      })

      initialColors.forEach((initialColor: ColorSlot, index: number) => {
        if (!initialColor.locked) {
          expect(result.current.colors[index]?.hex).not.toBe(initialColor.hex)
        }
      })
    })

    it('keeps locked colors unchanged during generatePalette', () => {
      const { result } = renderHook(() => usePalette())

      act(() => {
        result.current.lockColor(0)
        result.current.lockColor(2)
      })

      const lockedHex0 = result.current.colors[0]?.hex
      const lockedHex2 = result.current.colors[2]?.hex

      act(() => {
        result.current.generatePalette()
      })

      expect(result.current.colors[0]?.hex).toBe(lockedHex0)
      expect(result.current.colors[2]?.hex).toBe(lockedHex2)
    })

    it('unlocked colors change after generatePalette', () => {
      const { result } = renderHook(() => usePalette())

      act(() => {
        result.current.lockColor(0)
      })

      const firstHex = result.current.colors[0]?.hex
      const secondHex = result.current.colors[1]?.hex

      act(() => {
        result.current.generatePalette()
      })

      expect(result.current.colors[0]?.hex).toBe(firstHex)
      expect(result.current.colors[1]?.hex).not.toBe(secondHex)
    })
  })

  // ---------------------------------------------------------------------------
  // lockColor
  // ---------------------------------------------------------------------------

  describe('lockColor', () => {
    it('locks a color at given index', () => {
      const { result } = renderHook(() => usePalette())

      expect(result.current.colors[2]?.locked).toBe(false)

      act(() => {
        result.current.lockColor(2)
      })

      expect(result.current.colors[2]?.locked).toBe(true)
    })

    it('does not affect other colors when locking', () => {
      const { result } = renderHook(() => usePalette())
      const initialColors = [...result.current.colors]

      act(() => {
        result.current.lockColor(2)
      })

      expect(result.current.colors[0]?.hex).toBe(initialColors[0]?.hex)
      expect(result.current.colors[1]?.hex).toBe(initialColors[1]?.hex)
      expect(result.current.colors[3]?.hex).toBe(initialColors[3]?.hex)
      expect(result.current.colors[4]?.hex).toBe(initialColors[4]?.hex)
    })

    it('ignores invalid indices for lockColor', () => {
      const { result } = renderHook(() => usePalette())
      const initialColors = [...result.current.colors]

      act(() => {
        result.current.lockColor(-1)
        result.current.lockColor(5)
        result.current.lockColor(100)
      })

      expect(result.current.colors).toEqual(initialColors)
    })
  })

  // ---------------------------------------------------------------------------
  // unlockColor
  // ---------------------------------------------------------------------------

  describe('unlockColor', () => {
    it('unlocks a color at given index', () => {
      const { result } = renderHook(() => usePalette())

      act(() => {
        result.current.lockColor(3)
      })
      expect(result.current.colors[3]?.locked).toBe(true)

      act(() => {
        result.current.unlockColor(3)
      })
      expect(result.current.colors[3]?.locked).toBe(false)
    })

    it('does not affect other colors when unlocking', () => {
      const { result } = renderHook(() => usePalette())

      act(() => {
        result.current.lockColor(0)
        result.current.lockColor(2)
        result.current.lockColor(4)
      })

      act(() => {
        result.current.unlockColor(2)
      })

      expect(result.current.colors[0]?.locked).toBe(true)
      expect(result.current.colors[2]?.locked).toBe(false)
      expect(result.current.colors[4]?.locked).toBe(true)
    })

    it('ignores invalid indices for unlockColor', () => {
      const { result } = renderHook(() => usePalette())

      act(() => {
        result.current.lockColor(0)
      })

      const lockedState = result.current.colors[0]?.locked

      act(() => {
        result.current.unlockColor(-1)
        result.current.unlockColor(5)
        result.current.unlockColor(100)
      })

      expect(result.current.colors[0]?.locked).toBe(lockedState)
    })
  })

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------

  describe('edge cases', () => {
    it('handles locking all colors', () => {
      const { result } = renderHook(() => usePalette())

      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.lockColor(i)
        }
      })

      result.current.colors.forEach((color: ColorSlot) => {
        expect(color.locked).toBe(true)
      })

      const colorsBefore = result.current.colors.map((c: ColorSlot) => c.hex)

      act(() => {
        result.current.generatePalette()
      })

      result.current.colors.forEach((color: ColorSlot, i: number) => {
        expect(color.hex).toBe(colorsBefore[i])
      })
    })

    it('handles unlocking all colors', () => {
      const { result } = renderHook(() => usePalette())

      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.lockColor(i)
        }
      })

      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.unlockColor(i)
        }
      })

      result.current.colors.forEach((color: ColorSlot) => {
        expect(color.locked).toBe(false)
      })
    })

    it('maintains color objects immutability', () => {
      const { result } = renderHook(() => usePalette())
      const initialColors = result.current.colors

      act(() => {
        result.current.generatePalette()
      })

      expect(result.current.colors).not.toBe(initialColors)

      result.current.colors.forEach((color: ColorSlot, i: number) => {
        if (!initialColors[i]?.locked) {
          expect(color).not.toBe(initialColors[i])
        }
      })
    })
  })

  // ---------------------------------------------------------------------------
  // localStorage persistence
  // ---------------------------------------------------------------------------

  describe('localStorage persistence', () => {
    it('saves palette to localStorage on mount', () => {
      renderHook(() => usePalette())

      const stored = window.localStorage.getItem(STORAGE_KEY)
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored as string) as ColorSlot[]
      expect(parsed).toHaveLength(5)
    })

    it('saves palette to localStorage when colors change', () => {
      const { result } = renderHook(() => usePalette())

      act(() => {
        result.current.generatePalette()
      })

      const stored = window.localStorage.getItem(STORAGE_KEY)
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored as string) as ColorSlot[]
      expect(parsed).toEqual(result.current.colors)
    })

    it('persists lock state changes to localStorage', () => {
      const { result } = renderHook(() => usePalette())

      act(() => {
        result.current.lockColor(1)
        result.current.lockColor(3)
      })

      const stored = window.localStorage.getItem(STORAGE_KEY)
      const parsed = JSON.parse(stored as string) as ColorSlot[]

      expect(parsed[1]?.locked).toBe(true)
      expect(parsed[3]?.locked).toBe(true)
      expect(parsed[0]?.locked).toBe(false)
    })

    it('loads palette from localStorage on mount', () => {
      const savedPalette: ColorSlot[] = [
        { hex: '#ff1111', locked: true },
        { hex: '#22ff22', locked: false },
        { hex: '#3333ff', locked: true },
        { hex: '#ff44ff', locked: false },
        { hex: '#55ffff', locked: true },
      ]

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPalette))

      const { result } = renderHook(() => usePalette())

      expect(result.current.colors).toEqual(savedPalette)
    })

    it('restores lock states from localStorage', () => {
      const savedPalette: ColorSlot[] = [
        { hex: '#ff1111', locked: true },
        { hex: '#22ff22', locked: false },
        { hex: '#3333ff', locked: true },
        { hex: '#ff44ff', locked: false },
        { hex: '#55ffff', locked: true },
      ]

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPalette))

      const { result } = renderHook(() => usePalette())

      expect(result.current.colors[0]?.locked).toBe(true)
      expect(result.current.colors[1]?.locked).toBe(false)
      expect(result.current.colors[2]?.locked).toBe(true)
      expect(result.current.colors[3]?.locked).toBe(false)
      expect(result.current.colors[4]?.locked).toBe(true)
    })

    it('generates fresh palette when localStorage is empty', () => {
      const { result } = renderHook(() => usePalette())

      expect(result.current.colors).toHaveLength(5)
      result.current.colors.forEach((color: ColorSlot) => {
        expect(color.hex).toMatch(/^#[0-9a-fA-F]{6}$/)
        expect(color.locked).toBe(false)
      })
    })

    it('generates fresh palette when localStorage has invalid JSON', () => {
      window.localStorage.setItem(STORAGE_KEY, 'invalid json{{{')

      const { result } = renderHook(() => usePalette())

      expect(result.current.colors).toHaveLength(5)
      result.current.colors.forEach((color: ColorSlot) => {
        expect(color.hex).toMatch(/^#[0-9a-fA-F]{6}$/)
        expect(color.locked).toBe(false)
      })
    })

    it('generates fresh palette when localStorage has wrong structure', () => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 2, 3, 4, 5]))

      const { result } = renderHook(() => usePalette())

      expect(result.current.colors).toHaveLength(5)
      result.current.colors.forEach((color: ColorSlot) => {
        expect(color.hex).toMatch(/^#[0-9a-fA-F]{6}$/)
        expect(color.locked).toBe(false)
      })
    })

    it('generates fresh palette when localStorage has wrong array length', () => {
      const shortPalette: ColorSlot[] = [
        { hex: '#aabbcc', locked: false },
        { hex: '#ddeeff', locked: false },
      ]
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(shortPalette))

      const { result } = renderHook(() => usePalette())

      expect(result.current.colors).toHaveLength(5)
      result.current.colors.forEach((color: ColorSlot) => {
        expect(color.locked).toBe(false)
      })
    })

    it('uses correct storage key', () => {
      expect(STORAGE_KEY).toBe('color-palette-generator-palette')
    })

    it('handles localStorage unavailability gracefully on save', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
      setItemSpy.mockImplementation(() => {
        throw new Error('QuotaExceeded')
      })

      // Should not throw
      expect(() => {
        renderHook(() => usePalette())
      }).not.toThrow()

      setItemSpy.mockRestore()
    })

    it('updates localStorage after generatePalette', () => {
      const { result } = renderHook(() => usePalette())

      act(() => {
        result.current.generatePalette()
      })

      const stored = window.localStorage.getItem(STORAGE_KEY)
      const parsed = JSON.parse(stored as string) as ColorSlot[]

      expect(parsed).toEqual(result.current.colors)
    })

    it('updates localStorage after lockColor', () => {
      const { result } = renderHook(() => usePalette())

      act(() => {
        result.current.lockColor(2)
      })

      const stored = window.localStorage.getItem(STORAGE_KEY)
      const parsed = JSON.parse(stored as string) as ColorSlot[]

      expect(parsed[2]?.locked).toBe(true)
    })

    it('updates localStorage after unlockColor', () => {
      const { result } = renderHook(() => usePalette())

      act(() => {
        result.current.lockColor(2)
      })

      act(() => {
        result.current.unlockColor(2)
      })

      const stored = window.localStorage.getItem(STORAGE_KEY)
      const parsed = JSON.parse(stored as string) as ColorSlot[]

      expect(parsed[2]?.locked).toBe(false)
    })

    it('simulates page refresh by reloading from localStorage', () => {
      // First render: generate and lock a color
      const { result: firstResult, unmount } = renderHook(() => usePalette())

      act(() => {
        firstResult.current.lockColor(1)
      })

      const paletteBeforeRefresh = [...firstResult.current.colors]

      // Unmount to simulate navigation away
      unmount()

      // Second render: should restore from localStorage
      const { result: secondResult } = renderHook(() => usePalette())

      expect(secondResult.current.colors).toEqual(paletteBeforeRefresh)
      expect(secondResult.current.colors[1]?.locked).toBe(true)
    })
  })
})
