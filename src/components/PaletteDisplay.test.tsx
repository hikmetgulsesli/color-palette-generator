import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaletteDisplay } from './PaletteDisplay'

describe('PaletteDisplay', () => {
  const mockColors = [
    { color: '#22d3ee', locked: false },
    { color: '#a3e635', locked: true },
    { color: '#f87171', locked: false },
    { color: '#fbbf24', locked: true },
    { color: '#a78bfa', locked: false },
  ]

  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders exactly 5 ColorSwatch components', () => {
    render(
      <PaletteDisplay
        colors={mockColors}
        onLockToggle={() => {}}
      />
    )

    const swatches = screen.getAllByTestId('color-swatch')
    expect(swatches).toHaveLength(5)
  })

  it('renders with data-testid', () => {
    render(
      <PaletteDisplay
        colors={mockColors}
        onLockToggle={() => {}}
      />
    )

    expect(screen.getByTestId('palette-display')).toBeInTheDocument()
  })

  it('displays unique colors from palette state', () => {
    render(
      <PaletteDisplay
        colors={mockColors}
        onLockToggle={() => {}}
      />
    )

    const colorValues = screen.getAllByTestId('color-value')
    expect(colorValues).toHaveLength(5)
    
    mockColors.forEach((mockColor, index) => {
      expect(colorValues[index]).toHaveTextContent(mockColor.color.toLowerCase())
    })
  })

  it('calls onLockToggle with correct index when lock is clicked', async () => {
    const handleLockToggle = vi.fn()
    render(
      <PaletteDisplay
        colors={mockColors}
        onLockToggle={handleLockToggle}
      />
    )

    const lockButtons = screen.getAllByTestId('lock-button')
    
    // Click the third color's lock button (index 2)
    if (lockButtons[2]) await userEvent.click(lockButtons[2])
    expect(handleLockToggle).toHaveBeenCalledWith(2)
    expect(handleLockToggle).toHaveBeenCalledTimes(1)

    // Click the first color's lock button (index 0)
    if (lockButtons[0]) await userEvent.click(lockButtons[0])
    expect(handleLockToggle).toHaveBeenCalledWith(0)
    expect(handleLockToggle).toHaveBeenCalledTimes(2)
  })

  it('reflects locked state for each color', () => {
    render(
      <PaletteDisplay
        colors={mockColors}
        onLockToggle={() => {}}
      />
    )

    const swatches = screen.getAllByTestId('color-swatch')
    
    mockColors.forEach((mockColor, index) => {
      const swatch = swatches[index]
      if (swatch) expect(swatch).toHaveAttribute('data-locked', String(mockColor.locked))
    })
  })

  it('shows lock indicators for locked colors', () => {
    render(
      <PaletteDisplay
        colors={mockColors}
        onLockToggle={() => {}}
      />
    )

    const lockIndicators = screen.getAllByTestId('lock-indicator')
    // Only 2 colors are locked in mockColors
    expect(lockIndicators).toHaveLength(2)
  })

  it('calls onCopy callback when color is copied', async () => {
    const handleCopy = vi.fn()
    render(
      <PaletteDisplay
        colors={mockColors}
        onLockToggle={() => {}}
        onCopy={handleCopy}
      />
    )

    const copyButtons = screen.getAllByTestId('copy-button')
    
    if (copyButtons[0]) await userEvent.click(copyButtons[0])
    const firstColor = mockColors[0]
    if (firstColor) expect(handleCopy).toHaveBeenCalledWith(firstColor.color)
  })

  it('uses unique keys for each swatch', () => {
    const { container } = render(
      <PaletteDisplay
        colors={mockColors}
        onLockToggle={() => {}}
      />
    )

    // Verify all swatches are rendered without key warnings
    const swatches = container.querySelectorAll('.color-swatch')
    expect(swatches).toHaveLength(5)
  })

  it('handles empty colors array gracefully', () => {
    render(
      <PaletteDisplay
        colors={[]}
        onLockToggle={() => {}}
      />
    )

    expect(screen.getByTestId('palette-display')).toBeInTheDocument()
    expect(screen.queryAllByTestId('color-swatch')).toHaveLength(0)
  })

  it('applies correct CSS class for styling', () => {
    const { container } = render(
      <PaletteDisplay
        colors={mockColors}
        onLockToggle={() => {}}
      />
    )

    const paletteDisplay = container.firstChild
    if (paletteDisplay) expect(paletteDisplay).toHaveClass('palette-display')
  })

  it('renders with different color sets', () => {
    const differentColors = [
      { color: '#000000', locked: false },
      { color: '#ffffff', locked: false },
      { color: '#ff0000', locked: false },
      { color: '#00ff00', locked: false },
      { color: '#0000ff', locked: false },
    ]

    render(
      <PaletteDisplay
        colors={differentColors}
        onLockToggle={() => {}}
      />
    )

    const colorValues = screen.getAllByTestId('color-value')
    differentColors.forEach((color, index) => {
      expect(colorValues[index]).toHaveTextContent(color.color)
    })
  })
})
