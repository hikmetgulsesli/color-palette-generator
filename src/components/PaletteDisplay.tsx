import { ColorSwatch } from './ColorSwatch'
import './PaletteDisplay.css'

export interface PaletteColor {
  /** The hex color value */
  color: string
  /** Whether the color is locked */
  locked: boolean
}

export interface PaletteDisplayProps {
  /** Array of 5 palette colors */
  colors: PaletteColor[]
  /** Callback when a color's lock state is toggled */
  onLockToggle: (index: number) => void
  /** Callback when a color is copied */
  onCopy?: (color: string) => void
}

/**
 * Displays a palette of 5 color swatches in a horizontal row on desktop
 * and vertically stacked on mobile devices.
 */
export function PaletteDisplay({
  colors,
  onLockToggle,
  onCopy,
}: PaletteDisplayProps) {
  return (
    <div className="palette-display" data-testid="palette-display">
      {colors.map((paletteColor, index) => (
        <ColorSwatch
          key={`${index}-${paletteColor.color}`}
          color={paletteColor.color}
          locked={paletteColor.locked}
          onLockToggle={() => onLockToggle(index)}
          onCopy={onCopy}
        />
      ))}
    </div>
  )
}
