import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ColorSwatch } from './ColorSwatch'

describe('ColorSwatch', () => {
  const defaultProps = {
    color: '#22d3ee',
    locked: false,
    onLockToggle: vi.fn(),
    onCopy: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  describe('rendering', () => {
    it('renders the color swatch with hex value', () => {
      render(<ColorSwatch {...defaultProps} />)
      
      expect(screen.getByTestId('color-swatch')).toBeInTheDocument()
      expect(screen.getByTestId('color-value')).toHaveTextContent('#22d3ee')
    })

    it('displays color value in lowercase', () => {
      render(<ColorSwatch {...defaultProps} color="#AABBCC" />)
      
      expect(screen.getByTestId('color-value')).toHaveTextContent('#aabbcc')
    })

    it('applies the background color to the swatch', () => {
      render(<ColorSwatch {...defaultProps} color="#ff5733" />)
      
      const swatch = screen.getByTestId('color-swatch')
      expect(swatch).toHaveStyle({ backgroundColor: '#ff5733' })
    })

    it('renders with dark background color', () => {
      render(<ColorSwatch {...defaultProps} color="#18181b" />)
      
      expect(screen.getByTestId('color-swatch')).toBeInTheDocument()
    })

    it('renders with light background color', () => {
      render(<ColorSwatch {...defaultProps} color="#ffffff" />)
      
      expect(screen.getByTestId('color-swatch')).toBeInTheDocument()
    })
  })

  describe('lock functionality', () => {
    it('renders unlock icon when not locked', () => {
      render(<ColorSwatch {...defaultProps} locked={false} />)
      
      const lockButton = screen.getByTestId('lock-button')
      expect(lockButton).toHaveAttribute('aria-pressed', 'false')
      expect(lockButton).toHaveAttribute('aria-label', 'Lock color')
    })

    it('renders lock icon when locked', () => {
      render(<ColorSwatch {...defaultProps} locked={true} />)
      
      const lockButton = screen.getByTestId('lock-button')
      expect(lockButton).toHaveAttribute('aria-pressed', 'true')
      expect(lockButton).toHaveAttribute('aria-label', 'Unlock color')
    })

    it('calls onLockToggle when lock button is clicked', () => {
      render(<ColorSwatch {...defaultProps} />)
      
      const lockButton = screen.getByTestId('lock-button')
      fireEvent.click(lockButton)
      
      expect(defaultProps.onLockToggle).toHaveBeenCalledTimes(1)
    })

    it('shows lock indicator when locked', () => {
      render(<ColorSwatch {...defaultProps} locked={true} />)
      
      expect(screen.getByTestId('lock-indicator')).toBeInTheDocument()
    })

    it('does not show lock indicator when not locked', () => {
      render(<ColorSwatch {...defaultProps} locked={false} />)
      
      expect(screen.queryByTestId('lock-indicator')).not.toBeInTheDocument()
    })

    it('applies locked data attribute when locked', () => {
      render(<ColorSwatch {...defaultProps} locked={true} />)
      
      expect(screen.getByTestId('color-swatch')).toHaveAttribute('data-locked', 'true')
    })
  })

  describe('copy functionality', () => {
    it('renders copy button with correct aria-label', () => {
      render(<ColorSwatch {...defaultProps} />)
      
      const copyButton = screen.getByTestId('copy-button')
      expect(copyButton).toHaveAttribute('aria-label', 'Copy color to clipboard')
    })

    it('copies color to clipboard when copy button is clicked', async () => {
      render(<ColorSwatch {...defaultProps} color="#ff5733" />)
      
      const copyButton = screen.getByTestId('copy-button')
      fireEvent.click(copyButton)
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('#ff5733')
      })
    })

    it('calls onCopy callback when copy succeeds', async () => {
      render(<ColorSwatch {...defaultProps} color="#ff5733" />)
      
      const copyButton = screen.getByTestId('copy-button')
      fireEvent.click(copyButton)
      
      await waitFor(() => {
        expect(defaultProps.onCopy).toHaveBeenCalledWith('#ff5733')
      })
    })

    it('shows checkmark icon after copying', async () => {
      render(<ColorSwatch {...defaultProps} />)
      
      const copyButton = screen.getByTestId('copy-button')
      fireEvent.click(copyButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('check-icon')).toBeInTheDocument()
      })
      
      // Check aria-label is updated
      expect(copyButton).toHaveAttribute('aria-label', 'Color copied')
    })

    it('handles clipboard error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const clipboardError = new Error('Clipboard access denied')
      navigator.clipboard.writeText = vi.fn().mockRejectedValue(clipboardError)
      
      render(<ColorSwatch {...defaultProps} />)
      
      const copyButton = screen.getByTestId('copy-button')
      fireEvent.click(copyButton)
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to copy color:', clipboardError)
      })
      
      consoleSpy.mockRestore()
    })

    it('works without onCopy callback', async () => {
      const propsWithoutOnCopy = { ...defaultProps, onCopy: undefined }
      render(<ColorSwatch {...propsWithoutOnCopy} />)
      
      const copyButton = screen.getByTestId('copy-button')
      
      // Should not throw
      expect(() => fireEvent.click(copyButton)).not.toThrow()
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled()
      })
    })
  })

  describe('accessibility', () => {
    it('lock button has correct aria-pressed state when unlocked', () => {
      render(<ColorSwatch {...defaultProps} locked={false} />)
      
      expect(screen.getByTestId('lock-button')).toHaveAttribute('aria-pressed', 'false')
    })

    it('lock button has correct aria-pressed state when locked', () => {
      render(<ColorSwatch {...defaultProps} locked={true} />)
      
      expect(screen.getByTestId('lock-button')).toHaveAttribute('aria-pressed', 'true')
    })

    it('buttons are focusable', () => {
      render(<ColorSwatch {...defaultProps} />)
      
      const lockButton = screen.getByTestId('lock-button')
      const copyButton = screen.getByTestId('copy-button')
      
      lockButton.focus()
      expect(document.activeElement).toBe(lockButton)
      
      copyButton.focus()
      expect(document.activeElement).toBe(copyButton)
    })

    it('icons have aria-hidden attribute', () => {
      render(<ColorSwatch {...defaultProps} />)
      
      const icons = document.querySelectorAll('.color-swatch-icon')
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true')
      })
    })

    it('lock indicator has aria-hidden', () => {
      render(<ColorSwatch {...defaultProps} locked={true} />)
      
      expect(screen.getByTestId('lock-indicator')).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('edge cases', () => {
    it('handles short hex colors', () => {
      render(<ColorSwatch {...defaultProps} color="#abc" />)
      
      expect(screen.getByTestId('color-value')).toHaveTextContent('#abc')
    })

    it('handles uppercase hex colors', () => {
      render(<ColorSwatch {...defaultProps} color="#ABCDEF" />)
      
      expect(screen.getByTestId('color-value')).toHaveTextContent('#abcdef')
    })

    it('handles black color', () => {
      render(<ColorSwatch {...defaultProps} color="#000000" />)
      
      expect(screen.getByTestId('color-swatch')).toHaveStyle({ backgroundColor: '#000000' })
    })

    it('handles white color', () => {
      render(<ColorSwatch {...defaultProps} color="#ffffff" />)
      
      expect(screen.getByTestId('color-swatch')).toHaveStyle({ backgroundColor: '#ffffff' })
    })

    it('handles multiple rapid lock toggles', () => {
      render(<ColorSwatch {...defaultProps} />)
      
      const lockButton = screen.getByTestId('lock-button')
      
      fireEvent.click(lockButton)
      fireEvent.click(lockButton)
      fireEvent.click(lockButton)
      
      expect(defaultProps.onLockToggle).toHaveBeenCalledTimes(3)
    })
  })
})
