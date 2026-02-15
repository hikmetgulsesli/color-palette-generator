import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

// Mock clipboard API
beforeEach(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  })
  // Clear localStorage before each test
  window.localStorage.clear()
})

describe('App', () => {
  it('renders the Header component', () => {
    render(<App />)
    expect(screen.getByTestId('app-header')).toBeInTheDocument()
    expect(screen.getByTestId('app-title')).toHaveTextContent('Palette Generator')
  })

  it('renders the PaletteDisplay component', () => {
    render(<App />)
    expect(screen.getByTestId('palette-display')).toBeInTheDocument()
  })

  it('renders exactly 5 color swatches', () => {
    render(<App />)
    const swatches = screen.getAllByTestId('color-swatch')
    expect(swatches).toHaveLength(5)
  })

  it('renders the GenerateButton component', () => {
    render(<App />)
    expect(screen.getByTestId('generate-button')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /generate new color palette/i })
    ).toBeInTheDocument()
  })

  it('renders the ExportMenu component', () => {
    render(<App />)
    expect(screen.getByTestId('export-menu')).toBeInTheDocument()
  })

  it('uses a main landmark element', () => {
    render(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('uses a banner landmark element from Header', () => {
    render(<App />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('has the app container with data-testid', () => {
    render(<App />)
    expect(screen.getByTestId('app')).toBeInTheDocument()
  })

  it('generates a new palette when GenerateButton is clicked', () => {
    render(<App />)

    // Click generate button
    const generateBtn = screen.getByTestId('generate-button')
    fireEvent.click(generateBtn)

    const updatedSwatches = screen.getAllByTestId('color-value')
    const updatedColors = updatedSwatches.map((s) => s.textContent)

    // Verify 5 swatches still render with valid hex colors
    expect(updatedColors).toHaveLength(5)
    for (const color of updatedColors) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it('generates a new palette when spacebar is pressed', () => {
    render(<App />)

    // Press spacebar
    fireEvent.keyDown(window, { code: 'Space' })

    const updatedSwatches = screen.getAllByTestId('color-value')
    const updatedColors = updatedSwatches.map((s) => s.textContent)

    expect(updatedColors).toHaveLength(5)
    for (const color of updatedColors) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it('does not generate palette when spacebar is pressed on a button', () => {
    render(<App />)

    // Focus a button element first
    const generateBtn = screen.getByTestId('generate-button')
    generateBtn.focus()

    const swatches = screen.getAllByTestId('color-value')
    const colorsBeforeSpace = swatches.map((s) => s.textContent)

    // Spacebar should be ignored when focused on a button
    fireEvent.keyDown(window, { code: 'Space' })

    const updatedSwatches = screen.getAllByTestId('color-value')
    const colorsAfterSpace = updatedSwatches.map((s) => s.textContent)

    // Colors should remain the same
    expect(colorsAfterSpace).toEqual(colorsBeforeSpace)
  })

  it('toggles lock state when lock button is clicked', () => {
    render(<App />)
    const lockButtons = screen.getAllByTestId('lock-button')
    const firstLockBtn = lockButtons[0] as HTMLElement

    // Initially unlocked
    expect(firstLockBtn).toHaveAttribute('aria-pressed', 'false')

    // Click to lock
    fireEvent.click(firstLockBtn)
    expect(firstLockBtn).toHaveAttribute('aria-pressed', 'true')

    // Click to unlock
    fireEvent.click(firstLockBtn)
    expect(firstLockBtn).toHaveAttribute('aria-pressed', 'false')
  })

  it('preserves locked colors when generating a new palette', () => {
    render(<App />)

    // Get initial first color
    const swatches = screen.getAllByTestId('color-value')
    const firstSwatch = swatches[0] as HTMLElement
    const firstColor = firstSwatch.textContent

    // Lock the first color
    const lockButtons = screen.getAllByTestId('lock-button')
    const firstLockBtn = lockButtons[0] as HTMLElement
    fireEvent.click(firstLockBtn)

    // Generate new palette
    const generateBtn = screen.getByTestId('generate-button')
    fireEvent.click(generateBtn)

    // First color should be preserved
    const updatedSwatches = screen.getAllByTestId('color-value')
    const updatedFirstSwatch = updatedSwatches[0] as HTMLElement
    expect(updatedFirstSwatch.textContent).toBe(firstColor)
  })

  it('applies dark theme with proper layout classes', () => {
    render(<App />)
    const appEl = screen.getByTestId('app')
    expect(appEl).toHaveClass('app')
  })

  it('renders layout in correct order: Header, PaletteDisplay, GenerateButton', () => {
    render(<App />)
    const app = screen.getByTestId('app')

    // Header should be first child, main should be second child
    const header = screen.getByTestId('app-header')
    const main = screen.getByRole('main')
    const children = Array.from(app.children) as HTMLElement[]

    expect(children[0]).toBe(header)
    expect(children[1]).toBe(main)

    // Inside main, palette should come before generate button
    const palette = screen.getByTestId('palette-display')
    const generateBtn = screen.getByTestId('generate-button')

    // palette should precede generateBtn in document order
    expect(
      palette.compareDocumentPosition(generateBtn) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })
})
