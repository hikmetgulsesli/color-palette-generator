import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExportMenu } from './ExportMenu'

describe('ExportMenu', () => {
  const mockColors = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3']

  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the export button', () => {
    render(<ExportMenu colors={mockColors} />)

    const button = screen.getByTestId('export-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Export')
  })

  it('has correct accessibility attributes', () => {
    render(<ExportMenu colors={mockColors} />)

    const button = screen.getByRole('button', { name: /export palette/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveAttribute('aria-haspopup', 'menu')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('opens dropdown when button is clicked', async () => {
    render(<ExportMenu colors={mockColors} />)

    const button = screen.getByTestId('export-button')
    await userEvent.click(button)

    const dropdown = screen.getByTestId('export-dropdown')
    expect(dropdown).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('shows all 4 export format options', async () => {
    render(<ExportMenu colors={mockColors} />)

    const button = screen.getByTestId('export-button')
    await userEvent.click(button)

    expect(screen.getByTestId('export-option-css')).toBeInTheDocument()
    expect(screen.getByTestId('export-option-json')).toBeInTheDocument()
    expect(screen.getByTestId('export-option-tailwind')).toBeInTheDocument()
    expect(screen.getByTestId('export-option-ase')).toBeInTheDocument()
  })

  it('displays correct labels for each format', async () => {
    render(<ExportMenu colors={mockColors} />)

    const button = screen.getByTestId('export-button')
    await userEvent.click(button)

    expect(screen.getByText('CSS Variables')).toBeInTheDocument()
    expect(screen.getByText('JSON')).toBeInTheDocument()
    expect(screen.getByText('Tailwind Config')).toBeInTheDocument()
    expect(screen.getByText('ASE (Adobe)')).toBeInTheDocument()
  })

  it('displays descriptions for each format', async () => {
    render(<ExportMenu colors={mockColors} />)

    const button = screen.getByTestId('export-button')
    await userEvent.click(button)

    expect(screen.getByText('Export as CSS custom properties')).toBeInTheDocument()
    expect(screen.getByText('Export as JSON array')).toBeInTheDocument()
    expect(screen.getByText('Export as Tailwind colors config')).toBeInTheDocument()
    expect(screen.getByText('Export as Adobe Swatch Exchange')).toBeInTheDocument()
  })

  it('copies CSS format to clipboard when clicked', async () => {
    render(<ExportMenu colors={mockColors} />)

    const button = screen.getByTestId('export-button')
    await userEvent.click(button)

    const cssOption = screen.getByTestId('export-option-css')
    await userEvent.click(cssOption)

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
    const clipboardContent = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]
    if (!clipboardContent) throw new Error('Clipboard content is undefined')
    
    // Check CSS format includes all 5 colors as --color-1 through --color-5
    expect(clipboardContent).toContain('--color-1: #ff5733')
    expect(clipboardContent).toContain('--color-2: #33ff57')
    expect(clipboardContent).toContain('--color-3: #3357ff')
    expect(clipboardContent).toContain('--color-4: #f3ff33')
    expect(clipboardContent).toContain('--color-5: #ff33f3')
    expect(clipboardContent).toContain(':root')
  })

  it('copies JSON format to clipboard when clicked', async () => {
    render(<ExportMenu colors={mockColors} />)

    const button = screen.getByTestId('export-button')
    await userEvent.click(button)

    const jsonOption = screen.getByTestId('export-option-json')
    await userEvent.click(jsonOption)

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
    const clipboardContent = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]
    if (!clipboardContent) throw new Error('Clipboard content is undefined')
    
    const parsed = JSON.parse(clipboardContent)
    expect(parsed).toHaveLength(5)
    expect(parsed[0]).toEqual({ name: 'color-1', hex: '#ff5733' })
    expect(parsed[4]).toEqual({ name: 'color-5', hex: '#ff33f3' })
  })

  it('copies Tailwind format to clipboard when clicked', async () => {
    render(<ExportMenu colors={mockColors} />)

    const button = screen.getByTestId('export-button')
    await userEvent.click(button)

    const tailwindOption = screen.getByTestId('export-option-tailwind')
    await userEvent.click(tailwindOption)

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
    const clipboardContent = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]
    if (!clipboardContent) throw new Error('Clipboard content is undefined')
    
    expect(clipboardContent).toContain('module.exports')
    expect(clipboardContent).toContain("1: '#ff5733'")
    expect(clipboardContent).toContain("5: '#ff33f3'")
    expect(clipboardContent).toContain('colors:')
    expect(clipboardContent).toContain('palette:')
  })

  it('copies ASE format to clipboard when clicked', async () => {
    render(<ExportMenu colors={mockColors} />)

    const button = screen.getByTestId('export-button')
    await userEvent.click(button)

    const aseOption = screen.getByTestId('export-option-ase')
    await userEvent.click(aseOption)

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
    const clipboardContent = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]
    if (!clipboardContent) throw new Error('Clipboard content is undefined')
    
    expect(clipboardContent).toContain('Adobe Swatch Exchange')
    expect(clipboardContent).toContain('Color 1: #ff5733')
    expect(clipboardContent).toContain('Color 5: #ff33f3')
  })

  it('shows success feedback after export', async () => {
    render(<ExportMenu colors={mockColors} />)

    const button = screen.getByTestId('export-button')
    await userEvent.click(button)

    const cssOption = screen.getByTestId('export-option-css')
    await userEvent.click(cssOption)

    // Should show "Copied!" text
    expect(screen.getByText('Copied!')).toBeInTheDocument()
    
    // Should show check icon
    expect(screen.getByTestId('check-icon')).toBeInTheDocument()
  })

  it('closes dropdown after selecting an option', async () => {
    render(<ExportMenu colors={mockColors} />)

    const button = screen.getByTestId('export-button')
    await userEvent.click(button)

    const cssOption = screen.getByTestId('export-option-css')
    await userEvent.click(cssOption)

    await waitFor(() => {
      expect(screen.queryByTestId('export-dropdown')).not.toBeInTheDocument()
    })
  })

  it('closes dropdown when clicking outside', async () => {
    render(
      <div>
        <ExportMenu colors={mockColors} />
        <div data-testid="outside">Outside</div>
      </div>
    )

    const button = screen.getByTestId('export-button')
    await userEvent.click(button)

    expect(screen.getByTestId('export-dropdown')).toBeInTheDocument()

    const outside = screen.getByTestId('outside')
    await userEvent.click(outside)

    await waitFor(() => {
      expect(screen.queryByTestId('export-dropdown')).not.toBeInTheDocument()
    })
  })

  it('closes dropdown on Escape key', async () => {
    render(<ExportMenu colors={mockColors} />)

    const button = screen.getByTestId('export-button')
    await userEvent.click(button)

    expect(screen.getByTestId('export-dropdown')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByTestId('export-dropdown')).not.toBeInTheDocument()
    })
  })

  it('resets success state after 2 seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    
    render(<ExportMenu colors={mockColors} />)

    const button = screen.getByTestId('export-button')
    await userEvent.click(button)

    const cssOption = screen.getByTestId('export-option-css')
    await userEvent.click(cssOption)

    expect(screen.getByText('Copied!')).toBeInTheDocument()

    // Advance time by 2 seconds
    vi.advanceTimersByTime(2000)

    await waitFor(() => {
      expect(screen.getByText('Export')).toBeInTheDocument()
    })

    vi.useRealTimers()
  })

  it('applies custom className when provided', () => {
    render(<ExportMenu colors={mockColors} className="custom-class" />)

    const menu = screen.getByTestId('export-menu')
    expect(menu).toHaveClass('custom-class')
    expect(menu).toHaveClass('export-menu')
  })

  it('has correct role and aria-label on dropdown', async () => {
    render(<ExportMenu colors={mockColors} />)

    const button = screen.getByTestId('export-button')
    await userEvent.click(button)

    const dropdown = screen.getByTestId('export-dropdown')
    expect(dropdown).toHaveAttribute('role', 'menu')
    expect(dropdown).toHaveAttribute('aria-label', 'Export format options')
  })

  it('has correct role on menu items', async () => {
    render(<ExportMenu colors={mockColors} />)

    const button = screen.getByTestId('export-button')
    await userEvent.click(button)

    const cssOption = screen.getByTestId('export-option-css')
    expect(cssOption).toHaveAttribute('role', 'menuitem')
  })

  it('handles clipboard errors gracefully', async () => {
    // Mock clipboard to reject
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard failed')),
      },
    })

    // Spy on console.error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<ExportMenu colors={mockColors} />)

    const button = screen.getByTestId('export-button')
    await userEvent.click(button)

    const cssOption = screen.getByTestId('export-option-css')
    await userEvent.click(cssOption)

    // Should log error but not throw
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to copy export:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('converts hex colors to lowercase in exports', async () => {
    const upperCaseColors = ['#FF5733', '#AB12CD']
    render(<ExportMenu colors={[...upperCaseColors, '#33ff57', '#3357ff', '#f3ff33']} />)

    const button = screen.getByTestId('export-button')
    await userEvent.click(button)

    const cssOption = screen.getByTestId('export-option-css')
    await userEvent.click(cssOption)

    const clipboardContent = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]
    if (!clipboardContent) throw new Error('Clipboard content is undefined')
    
    expect(clipboardContent).toContain('--color-1: #ff5733')
    expect(clipboardContent).toContain('--color-2: #ab12cd')
  })

  it('toggles dropdown on repeated button clicks', async () => {
    render(<ExportMenu colors={mockColors} />)

    const button = screen.getByTestId('export-button')

    // Open
    await userEvent.click(button)
    expect(screen.getByTestId('export-dropdown')).toBeInTheDocument()

    // Close
    await userEvent.click(button)
    await waitFor(() => {
      expect(screen.queryByTestId('export-dropdown')).not.toBeInTheDocument()
    })

    // Open again
    await userEvent.click(button)
    expect(screen.getByTestId('export-dropdown')).toBeInTheDocument()
  })
})
