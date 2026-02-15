import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaletteDisplay, type PaletteColor } from './PaletteDisplay'

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
})

describe('PaletteDisplay', () => {
  const createMockPalette = (overrides?: Partial<PaletteColor>[]): PaletteColor[] => [
    { id: 'color-1', color: '#ff0000', locked: false, ...overrides?.[0] },
    { id: 'color-2', color: '#00ff00', locked: true, ...overrides?.[1] },
    { id: 'color-3', color: '#0000ff', locked: false, ...overrides?.[2] },
    { id: 'color-4', color: '#ffff00', locked: false, ...overrides?.[3] },
    { id: 'color-5', color: '#ff00ff', locked: true, ...overrides?.[4] },
  ]

  it('renders exactly 5 ColorSwatch components', () => {
    const palette = createMockPalette()
    render(<PaletteDisplay palette={palette} onLockToggle={vi.fn()} />)

    const swatches = screen.getAllByTestId('color-swatch')
    expect(swatches).toHaveLength(5)
  })

  it('renders with correct accessibility attributes', () => {
    const palette = createMockPalette()
    render(<PaletteDisplay palette={palette} onLockToggle={vi.fn()} />)

    const display = screen.getByTestId('palette-display')
    expect(display).toHaveAttribute('role', 'region')
    expect(display).toHaveAttribute('aria-label', 'Color palette')
  })

  it('displays unique color from palette state for each swatch', () => {
    const palette = createMockPalette()
    render(<PaletteDisplay palette={palette} onLockToggle={vi.fn()} />)

    // Check each color value is displayed
    expect(screen.getByText('#ff0000')).toBeInTheDocument()
    expect(screen.getByText('#00ff00')).toBeInTheDocument()
    expect(screen.getByText('#0000ff')).toBeInTheDocument()
    expect(screen.getByText('#ffff00')).toBeInTheDocument()
    expect(screen.getByText('#ff00ff')).toBeInTheDocument()
  })

  it('shows locked state for locked colors', () => {
    const palette = createMockPalette()
    render(<PaletteDisplay palette={palette} onLockToggle={vi.fn()} />)

    // Check locked colors have lock indicators
    const lockedSwatches = screen.getAllByTestId('lock-indicator')
    expect(lockedSwatches).toHaveLength(2) // color-2 and color-5 are locked
  })

  it('calls onLockToggle with correct id when lock button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnLockToggle = vi.fn()
    const palette = createMockPalette()
    
    render(<PaletteDisplay palette={palette} onLockToggle={mockOnLockToggle} />)

    // Click lock button on first color
    const lockButtons = screen.getAllByTestId('lock-button')
    await user.click(lockButtons[0]!)

    expect(mockOnLockToggle).toHaveBeenCalledTimes(1)
    expect(mockOnLockToggle).toHaveBeenCalledWith('color-1')
  })

  it('calls onLockToggle for each color independently', async () => {
    const user = userEvent.setup()
    const mockOnLockToggle = vi.fn()
    const palette = createMockPalette()
    
    render(<PaletteDisplay palette={palette} onLockToggle={mockOnLockToggle} />)

    const lockButtons = screen.getAllByTestId('lock-button')

    // Click each lock button
    for (let i = 0; i < lockButtons.length; i++) {
      await user.click(lockButtons[i]!)
      expect(mockOnLockToggle).toHaveBeenLastCalledWith(`color-${i + 1}`)
    }

    expect(mockOnLockToggle).toHaveBeenCalledTimes(5)
  })

  it('calls onCopy when a color is copied', async () => {
    const user = userEvent.setup()
    const mockOnCopy = vi.fn()
    const palette = createMockPalette()
    
    render(
      <PaletteDisplay 
        palette={palette} 
        onLockToggle={vi.fn()} 
        onCopy={mockOnCopy}
      />
    )

    // Click copy button on first color
    const copyButtons = screen.getAllByTestId('copy-button')
    await user.click(copyButtons[0]!)

    expect(mockOnCopy).toHaveBeenCalledTimes(1)
    expect(mockOnCopy).toHaveBeenCalledWith('#ff0000')
  })

  it('pads with default colors when palette has fewer than 5 colors', () => {
    const shortPalette: PaletteColor[] = [
      { id: 'color-1', color: '#ff0000', locked: false },
      { id: 'color-2', color: '#00ff00', locked: false },
    ]
    
    render(<PaletteDisplay palette={shortPalette} onLockToggle={vi.fn()} />)

    // Should still render 5 swatches
    const swatches = screen.getAllByTestId('color-swatch')
    expect(swatches).toHaveLength(5)
  })

  it('only shows first 5 colors when palette has more than 5', () => {
    const longPalette: PaletteColor[] = [
      { id: 'color-1', color: '#ff0000', locked: false },
      { id: 'color-2', color: '#00ff00', locked: false },
      { id: 'color-3', color: '#0000ff', locked: false },
      { id: 'color-4', color: '#ffff00', locked: false },
      { id: 'color-5', color: '#ff00ff', locked: false },
      { id: 'color-6', color: '#00ffff', locked: false },
      { id: 'color-7', color: '#ffffff', locked: false },
    ]
    
    render(<PaletteDisplay palette={longPalette} onLockToggle={vi.fn()} />)

    // Should only render 5 swatches
    const swatches = screen.getAllByTestId('color-swatch')
    expect(swatches).toHaveLength(5)

    // First 5 colors should be visible
    expect(screen.getByText('#ff0000')).toBeInTheDocument()
    expect(screen.getByText('#00ff00')).toBeInTheDocument()
    expect(screen.getByText('#0000ff')).toBeInTheDocument()
    expect(screen.getByText('#ffff00')).toBeInTheDocument()
    expect(screen.getByText('#ff00ff')).toBeInTheDocument()

    // 6th color should not be visible
    expect(screen.queryByText('#00ffff')).not.toBeInTheDocument()
  })

  it('renders each swatch in its own wrapper with unique key', () => {
    const palette = createMockPalette()
    render(<PaletteDisplay palette={palette} onLockToggle={vi.fn()} />)

    // Check each wrapper exists
    expect(screen.getByTestId('palette-swatch-color-1')).toBeInTheDocument()
    expect(screen.getByTestId('palette-swatch-color-2')).toBeInTheDocument()
    expect(screen.getByTestId('palette-swatch-color-3')).toBeInTheDocument()
    expect(screen.getByTestId('palette-swatch-color-4')).toBeInTheDocument()
    expect(screen.getByTestId('palette-swatch-color-5')).toBeInTheDocument()
  })

  it('maintains locked state across re-renders', () => {
    const mockOnLockToggle = vi.fn()
    const palette = createMockPalette()
    
    const { rerender } = render(
      <PaletteDisplay palette={palette} onLockToggle={mockOnLockToggle} />
    )

    // Check initial locked states
    let lockIndicators = screen.getAllByTestId('lock-indicator')
    expect(lockIndicators).toHaveLength(2)

    // Re-render with updated palette (simulating regeneration with locked colors preserved)
    const updatedPalette: PaletteColor[] = [
      { id: 'color-1', color: '#aa0000', locked: false }, // Changed color, unlocked
      { id: 'color-2', color: '#00aa00', locked: true },  // Changed color, still locked
      { id: 'color-3', color: '#0000aa', locked: false }, // Changed color, unlocked
      { id: 'color-4', color: '#aaaa00', locked: false }, // Changed color, unlocked
      { id: 'color-5', color: '#aa00aa', locked: true },  // Changed color, still locked
    ]

    rerender(<PaletteDisplay palette={updatedPalette} onLockToggle={mockOnLockToggle} />)

    // Locked colors should still show lock indicators
    lockIndicators = screen.getAllByTestId('lock-indicator')
    expect(lockIndicators).toHaveLength(2)

    // New colors should be displayed
    expect(screen.getByText('#aa0000')).toBeInTheDocument()
    expect(screen.getByText('#00aa00')).toBeInTheDocument()
  })

  it('handles empty palette gracefully', () => {
    render(<PaletteDisplay palette={[]} onLockToggle={vi.fn()} />)

    // Should render 5 default swatches
    const swatches = screen.getAllByTestId('color-swatch')
    expect(swatches).toHaveLength(5)
  })
})
