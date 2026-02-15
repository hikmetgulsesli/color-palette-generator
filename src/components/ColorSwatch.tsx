import { useState, useCallback } from 'react'
import { Lock, Unlock, Copy, Check } from 'lucide-react'
import { isDarkColor } from '../lib/colorUtils'
import './ColorSwatch.css'

export interface ColorSwatchProps {
  /** The hex color value (e.g., "#22d3ee") */
  color: string
  /** Whether the color is locked */
  locked: boolean
  /** Callback when lock state is toggled */
  onLockToggle: () => void
  /** Callback when color is copied (receives the hex value) */
  onCopy?: (color: string) => void
}

/**
 * A reusable color swatch component that displays a color with its hex value,
 * a lock toggle button, and a copy-to-clipboard button.
 */
export function ColorSwatch({
  color,
  locked,
  onLockToggle,
  onCopy,
}: ColorSwatchProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(color)
      setCopied(true)
      onCopy?.(color)
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      // Silently fail if clipboard is not available
      console.error('Failed to copy color:', err)
    }
  }, [color, onCopy])

  // Determine text color based on background luminance
  const textColor = isDarkColor(color) ? '#fafafa' : '#18181b'
  const isDark = isDarkColor(color)

  return (
    <div 
      className="color-swatch"
      style={{ backgroundColor: color }}
      data-locked={locked}
      data-testid="color-swatch"
    >
      <div 
        className="color-swatch-content"
        style={{ color: textColor }}
      >
        <span className="color-swatch-value" data-testid="color-value">
          {color.toLowerCase()}
        </span>
        
        <div className="color-swatch-actions">
          <button
            type="button"
            className="color-swatch-button"
            onClick={onLockToggle}
            aria-label={locked ? 'Unlock color' : 'Lock color'}
            aria-pressed={locked}
            data-testid="lock-button"
            style={{ 
              color: textColor,
              '--hover-bg': isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
            } as React.CSSProperties}
          >
            {locked ? (
              <Lock className="color-swatch-icon" aria-hidden="true" />
            ) : (
              <Unlock className="color-swatch-icon" aria-hidden="true" />
            )}
          </button>
          
          <button
            type="button"
            className="color-swatch-button"
            onClick={handleCopy}
            aria-label={copied ? 'Color copied' : 'Copy color to clipboard'}
            data-testid="copy-button"
            style={{ 
              color: textColor,
              '--hover-bg': isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
            } as React.CSSProperties}
          >
            {copied ? (
              <Check 
                className="color-swatch-icon color-swatch-icon-check" 
                aria-hidden="true" 
                data-testid="check-icon"
              />
            ) : (
              <Copy className="color-swatch-icon" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      
      {/* Lock indicator overlay */}
      {locked && (
        <div 
          className="color-swatch-lock-indicator"
          aria-hidden="true"
          data-testid="lock-indicator"
        />
      )}
    </div>
  )
}
