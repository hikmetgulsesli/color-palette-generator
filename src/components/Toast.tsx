import { useEffect } from 'react'
import { Check, AlertCircle } from 'lucide-react'
import './Toast.css'

export type ToastVariant = 'success' | 'error'

export interface ToastProps {
  /** The message to display in the toast */
  message: string
  /** The variant of the toast (success or error) */
  variant?: ToastVariant
  /** Whether the toast is visible */
  visible: boolean
  /** Callback when the toast should be dismissed */
  onDismiss: () => void
}

/**
 * A toast notification component for user feedback.
 * - Auto-dismisses after 2 seconds
 * - Supports success and error variants
 * - Positioned at bottom-center of the screen
 * - Uses CSS animations for entrance and exit
 */
export function Toast({ message, variant = 'success', visible, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!visible) return

    const timer = setTimeout(() => {
      onDismiss()
    }, 2000)

    return () => {
      clearTimeout(timer)
    }
  }, [visible, onDismiss])

  if (!visible) return null

  const Icon = variant === 'success' ? Check : AlertCircle

  return (
    <div
      className={`toast toast--${variant}`}
      role="status"
      aria-live="polite"
      data-testid="toast"
      data-variant={variant}
    >
      <Icon className="toast-icon" aria-hidden="true" data-testid="toast-icon" />
      <span className="toast-message">{message}</span>
    </div>
  )
}
