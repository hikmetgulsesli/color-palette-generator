import { ColorSwatch } from './ColorSwatch'
import './PaletteDisplay.css'

export interface PaletteColor {
  /** Unique identifier for the color */
  id: string
  /** Hex color value */
  color: string
  /** Whether the color is locked */
  locked: boolean
}

export interface PaletteDisplayProps {
  /** Array of 5 palette colors */
  palette: PaletteColor[]
  /** Callback when a color's lock state is toggled */
  onLockToggle: (id: string) => void
  /** Optional callback when a color is copied */
  onCopy?: (color: string) => void
}

/**
 * Displays a palette of 5 color swatches in a responsive layout.
 * - Horizontal on desktop (min-width: 768px)
 * - Vertical on mobile (< 768px)
 */
export function PaletteDisplay({
  palette,
  onLockToggle,
  onCopy,
}: PaletteDisplayProps) {
  // Ensure we have exactly 5 colors, pad with defaults if needed
  const displayPalette = [...palette]
  while (displayPalette.length < 5) {
    displayPalette.push({
      id: `default-${displayPalette.length}`,
      color: '#3f3f46',
      locked: false,
    })
  }
  // Only show first 5 if more provided
  const colors = displayPalette.slice(0, 5)

  return (
    <div 
      className="palette-display"
      role="region"
      aria-label="Color palette"
      data-testid="palette-display"
    >
      {colors.map((paletteColor) => (
        <div 
          key={paletteColor.id}
          className="palette-display-swatch-wrapper"
          data-testid={`palette-swatch-${paletteColor.id}`}
        >
          <ColorSwatch
            color={paletteColor.color}
            locked={paletteColor.locked}
            onLockToggle={() => onLockToggle(paletteColor.id)}
            onCopy={onCopy}
          />
        </div>
      ))}
    </div>
  )
}
