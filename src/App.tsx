import { useCallback } from 'react'
import { Header } from './components/Header'
import { PaletteDisplay } from './components/PaletteDisplay'
import { GenerateButton } from './components/GenerateButton'
import { usePalette } from './hooks/usePalette'
import { useSpacebarShortcut } from './hooks/useSpacebarShortcut'
import './App.css'

/**
 * Main application component.
 *
 * Composes Header, PaletteDisplay, and GenerateButton into a centered layout
 * with dark theme. Registers a global spacebar shortcut for palette generation.
 */
function App() {
  const { colors, generatePalette, lockColor, unlockColor } = usePalette()

  // Global spacebar shortcut to generate a new palette
  useSpacebarShortcut({
    onPress: generatePalette,
    enabled: true,
  })

  // Map ColorSlot[] to the shape PaletteDisplay expects
  const paletteColors = colors.map((slot) => ({
    color: slot.hex,
    locked: slot.locked,
  }))

  // Map ColorSlot[] to hex strings for Header/ExportMenu
  const hexColors = colors.map((slot) => slot.hex)

  const handleLockToggle = useCallback(
    (index: number) => {
      if (colors[index]?.locked) {
        unlockColor(index)
      } else {
        lockColor(index)
      }
    },
    [colors, lockColor, unlockColor]
  )

  return (
    <div className="app" data-testid="app">
      <Header colors={hexColors} />
      <main className="app-main">
        <div className="app-container">
          <PaletteDisplay
            colors={paletteColors}
            onLockToggle={handleLockToggle}
          />
          <div className="app-actions">
            <GenerateButton onGenerate={generatePalette} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
