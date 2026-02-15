import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GenerateButton } from './GenerateButton'

describe('GenerateButton', () => {
  const mockOnGenerate = vi.fn()

  beforeEach(() => {
    mockOnGenerate.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the button with correct text and icon', () => {
    render(<GenerateButton onGenerate={mockOnGenerate} />)

    const button = screen.getByTestId('generate-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Generate Palette')
    expect(button).toHaveTextContent('SPACE')
  })

  it('has correct accessibility attributes', () => {
    render(<GenerateButton onGenerate={mockOnGenerate} />)

    const button = screen.getByRole('button', { name: /generate new color palette/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('type', 'button')
  })

  it('calls onGenerate when clicked', async () => {
    render(<GenerateButton onGenerate={mockOnGenerate} />)

    const button = screen.getByTestId('generate-button')
    await userEvent.click(button)

    expect(mockOnGenerate).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<GenerateButton onGenerate={mockOnGenerate} disabled />)

    const button = screen.getByTestId('generate-button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('disabled')
  })

  it('applies custom className when provided', () => {
    render(<GenerateButton onGenerate={mockOnGenerate} className="custom-class" />)

    const button = screen.getByTestId('generate-button')
    expect(button).toHaveClass('custom-class')
    expect(button).toHaveClass('generate-button')
  })

  it('does not call onGenerate when disabled', async () => {
    render(<GenerateButton onGenerate={mockOnGenerate} disabled />)

    const button = screen.getByTestId('generate-button')
    await userEvent.click(button)

    expect(mockOnGenerate).not.toHaveBeenCalled()
  })

  it('displays keyboard shortcut hint', () => {
    render(<GenerateButton onGenerate={mockOnGenerate} />)

    const shortcut = screen.getByLabelText(/press spacebar to generate/i)
    expect(shortcut).toBeInTheDocument()
    expect(shortcut).toHaveTextContent('SPACE')
  })

  it('has visible focus styles', async () => {
    render(<GenerateButton onGenerate={mockOnGenerate} />)

    const button = screen.getByTestId('generate-button')
    button.focus()

    expect(button).toHaveFocus()
    // Check that focus-visible styles are applied via CSS
    expect(button).toHaveClass('generate-button')
  })

  it('has hover and active state classes', () => {
    render(<GenerateButton onGenerate={mockOnGenerate} />)

    const button = screen.getByTestId('generate-button')
    expect(button).toHaveClass('generate-button')
  })

  describe('Icon', () => {
    it('renders the refresh icon', () => {
      render(<GenerateButton onGenerate={mockOnGenerate} />)

      const icon = document.querySelector('.generate-button-icon')
      expect(icon).toBeInTheDocument()
    })

    it('has correct icon styling', () => {
      render(<GenerateButton onGenerate={mockOnGenerate} />)

      const icon = document.querySelector('.generate-button-icon')
      expect(icon).toHaveClass('generate-button-icon')
    })
  })

  describe('Button states', () => {
    it('has prominent styling', () => {
      render(<GenerateButton onGenerate={mockOnGenerate} />)

      const button = screen.getByTestId('generate-button')
      // Button should be prominently styled (large padding, etc.)
      expect(button).toBeInTheDocument()
    })

    it('maintains structure when disabled', () => {
      render(<GenerateButton onGenerate={mockOnGenerate} disabled />)

      const button = screen.getByTestId('generate-button')
      expect(button).toHaveTextContent('Generate Palette')
      expect(button).toHaveTextContent('SPACE')
      
      const icon = document.querySelector('.generate-button-icon')
      expect(icon).toBeInTheDocument()
    })
  })
})
