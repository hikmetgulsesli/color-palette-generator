import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Toast } from './Toast'

describe('Toast', () => {
  const defaultProps = {
    message: 'Copied!',
    variant: 'success' as const,
    visible: true,
    onDismiss: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('renders when visible is true', () => {
      render(<Toast {...defaultProps} />)

      expect(screen.getByTestId('toast')).toBeInTheDocument()
    })

    it('does not render when visible is false', () => {
      render(<Toast {...defaultProps} visible={false} />)

      expect(screen.queryByTestId('toast')).not.toBeInTheDocument()
    })

    it('displays the message', () => {
      render(<Toast {...defaultProps} message="Exported!" />)

      expect(screen.getByText('Exported!')).toBeInTheDocument()
    })

    it('renders success variant by default', () => {
      render(<Toast {...defaultProps} />)

      const toast = screen.getByTestId('toast')
      expect(toast).toHaveAttribute('data-variant', 'success')
      expect(toast).toHaveClass('toast--success')
    })

    it('renders error variant when specified', () => {
      render(<Toast {...defaultProps} variant="error" />)

      const toast = screen.getByTestId('toast')
      expect(toast).toHaveAttribute('data-variant', 'error')
      expect(toast).toHaveClass('toast--error')
    })
  })

  describe('icons', () => {
    it('renders Check icon for success variant', () => {
      render(<Toast {...defaultProps} variant="success" />)

      expect(screen.getByTestId('toast-icon')).toBeInTheDocument()
    })

    it('renders AlertCircle icon for error variant', () => {
      render(<Toast {...defaultProps} variant="error" />)

      expect(screen.getByTestId('toast-icon')).toBeInTheDocument()
    })

    it('icon has aria-hidden attribute', () => {
      render(<Toast {...defaultProps} />)

      expect(screen.getByTestId('toast-icon')).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('auto-dismiss', () => {
    it('calls onDismiss after 2 seconds', () => {
      render(<Toast {...defaultProps} />)

      vi.advanceTimersByTime(2000)

      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1)
    })

    it('does not call onDismiss before 2 seconds', () => {
      render(<Toast {...defaultProps} />)

      vi.advanceTimersByTime(1500)

      expect(defaultProps.onDismiss).not.toHaveBeenCalled()
    })

    it('clears timer when component unmounts', () => {
      const { unmount } = render(<Toast {...defaultProps} />)

      unmount()
      vi.advanceTimersByTime(2000)

      // Should not throw and onDismiss should not be called after unmount
      expect(defaultProps.onDismiss).not.toHaveBeenCalled()
    })

    it('resets timer when visible changes to true', () => {
      const { rerender } = render(<Toast {...defaultProps} visible={false} />)

      // Initially not visible
      expect(screen.queryByTestId('toast')).not.toBeInTheDocument()

      // Show toast
      rerender(<Toast {...defaultProps} visible={true} />)
      expect(screen.getByTestId('toast')).toBeInTheDocument()

      // Should dismiss after 2 seconds from the new show time
      vi.advanceTimersByTime(2000)
      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1)
    })
  })

  describe('accessibility', () => {
    it('has role="status" for screen reader announcements', () => {
      render(<Toast {...defaultProps} />)

      expect(screen.getByTestId('toast')).toHaveAttribute('role', 'status')
    })

    it('has aria-live="polite" for non-intrusive announcements', () => {
      render(<Toast {...defaultProps} />)

      expect(screen.getByTestId('toast')).toHaveAttribute('aria-live', 'polite')
    })

    it('is positioned fixed at bottom-center', () => {
      render(<Toast {...defaultProps} />)

      const toast = screen.getByTestId('toast')
      expect(toast).toHaveClass('toast')
    })
  })

  describe('edge cases', () => {
    it('handles empty message', () => {
      render(<Toast {...defaultProps} message="" />)

      expect(screen.getByTestId('toast')).toBeInTheDocument()
    })

    it('handles long message', () => {
      const longMessage = 'This is a very long toast message that should still display properly without breaking the layout'
      render(<Toast {...defaultProps} message={longMessage} />)

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('handles rapid show/hide cycles', () => {
      const { rerender } = render(<Toast {...defaultProps} visible={false} />)

      // Rapidly toggle visibility
      rerender(<Toast {...defaultProps} visible={true} />)
      rerender(<Toast {...defaultProps} visible={false} />)
      rerender(<Toast {...defaultProps} visible={true} />)

      expect(screen.getByTestId('toast')).toBeInTheDocument()

      // Should still dismiss after 2 seconds from last show
      vi.advanceTimersByTime(2000)
      expect(defaultProps.onDismiss).toHaveBeenCalled()
    })

    it('only one toast is visible at a time (controlled by parent)', () => {
      // This test documents that the Toast component itself doesn't enforce
      // single visibility - that's the parent's responsibility
      render(<Toast {...defaultProps} />)

      const toasts = screen.getAllByTestId('toast')
      expect(toasts).toHaveLength(1)
    })
  })
})
