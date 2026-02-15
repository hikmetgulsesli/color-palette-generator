import { RefreshCw } from 'lucide-react'
import './GenerateButton.css'

export interface GenerateButtonProps {
  /** Callback when the button is clicked or spacebar is pressed */
  onGenerate: () => void
  /** Whether the button is disabled */
  disabled?: boolean
  /** Optional additional class name */
  className?: string
}

/**
 * A prominent generate button with keyboard shortcut hint.
 * - Click triggers palette generation
 * - Spacebar triggers generation globally (when not focused on input)
 */
export function GenerateButton({
  onGenerate,
  disabled = false,
  className = '',
}: GenerateButtonProps) {
  return (
    <button
      type="button"
      className={`generate-button ${className}`}
      onClick={onGenerate}
      disabled={disabled}
      aria-label="Generate new color palette"
      data-testid="generate-button"
    >
      <RefreshCw className="generate-button-icon" aria-hidden="true" />
      <span className="generate-button-text">Generate Palette</span>
      <kbd className="generate-button-shortcut" aria-label="Press spacebar to generate">
        SPACE
      </kbd>
    </button>
  )
}
