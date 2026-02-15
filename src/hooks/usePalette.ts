/**
 * Custom hook for managing color palette state and generation.
 *
 * Provides palette management with locking functionality and localStorage
 * persistence so palette state survives page refreshes.
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { generateRandomColor } from '../lib/colorUtils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ColorSlot {
  hex: string
  locked: boolean
}

export interface UsePaletteReturn {
  colors: ColorSlot[]
  generatePalette: () => void
  lockColor: (index: number) => void
  unlockColor: (index: number) => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PALETTE_SIZE = 5
const STORAGE_KEY = 'color-palette-generator-palette'

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

/**
 * Check if localStorage is available and functional.
 *
 * Tests both existence and write/read capability, which handles cases like
 * private browsing mode where localStorage exists but throws on write.
 */
function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__'
    window.localStorage.setItem(testKey, 'test')
    window.localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Validate that a parsed value is a valid ColorSlot array.
 */
function isValidPalette(value: unknown): value is ColorSlot[] {
  if (!Array.isArray(value)) return false
  if (value.length !== PALETTE_SIZE) return false

  return value.every(
    (slot: unknown) =>
      typeof slot === 'object' &&
      slot !== null &&
      'hex' in slot &&
      'locked' in slot &&
      typeof (slot as ColorSlot).hex === 'string' &&
      typeof (slot as ColorSlot).locked === 'boolean' &&
      /^#[0-9a-fA-F]{6}$/.test((slot as ColorSlot).hex)
  )
}

/**
 * Load palette from localStorage. Returns null if unavailable or invalid.
 */
function loadPalette(): ColorSlot[] | null {
  if (!isStorageAvailable()) return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null

    const parsed: unknown = JSON.parse(raw)

    if (isValidPalette(parsed)) {
      return parsed
    }

    return null
  } catch {
    return null
  }
}

/**
 * Save palette to localStorage. Fails silently if storage is unavailable.
 */
function savePalette(colors: ColorSlot[]): void {
  if (!isStorageAvailable()) return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(colors))
  } catch {
    // Storage full or unavailable — fail silently
  }
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Generate an array of random hex colors.
 */
function generateRandomPalette(size: number): string[] {
  return Array.from({ length: size }, () => generateRandomColor())
}

/**
 * Create initial palette state — loads from localStorage first, then
 * falls back to randomly generated colors.
 */
function createInitialPalette(): ColorSlot[] {
  const saved = loadPalette()
  if (saved !== null) return saved

  const hexColors = generateRandomPalette(PALETTE_SIZE)
  return hexColors.map((hex) => ({ hex, locked: false }))
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Palette state management hook with localStorage persistence.
 *
 * On mount, attempts to load previously saved palette from localStorage.
 * On every palette change, persists the new state to localStorage.
 *
 * @returns Object containing:
 *   - colors: Array of ColorSlot objects (hex + locked state)
 *   - generatePalette: Regenerate unlocked colors
 *   - lockColor: Lock a color at given index
 *   - unlockColor: Unlock a color at given index
 */
export function usePalette(): UsePaletteReturn {
  const [colors, setColors] = useState<ColorSlot[]>(createInitialPalette)

  /**
   * Persist palette to localStorage whenever it changes.
   */
  useEffect(() => {
    savePalette(colors)
  }, [colors])

  /**
   * Generate a new palette, keeping locked colors unchanged.
   */
  const generatePalette = useCallback(() => {
    setColors((prev) =>
      prev.map((slot) =>
        slot.locked ? slot : { ...slot, hex: generateRandomColor() }
      )
    )
  }, [])

  /**
   * Lock a color at the given index.
   */
  const lockColor = useCallback((index: number) => {
    if (index < 0 || index >= PALETTE_SIZE) return

    setColors((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, locked: true } : slot))
    )
  }, [])

  /**
   * Unlock a color at the given index.
   */
  const unlockColor = useCallback((index: number) => {
    if (index < 0 || index >= PALETTE_SIZE) return

    setColors((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, locked: false } : slot))
    )
  }, [])

  return useMemo(
    () => ({
      colors,
      generatePalette,
      lockColor,
      unlockColor,
    }),
    [colors, generatePalette, lockColor, unlockColor]
  )
}

// ---------------------------------------------------------------------------
// Exported for testing
// ---------------------------------------------------------------------------

export { STORAGE_KEY, isValidPalette, loadPalette, savePalette, isStorageAvailable }
