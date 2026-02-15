import { useEffect, useCallback } from 'react'

export interface UseSpacebarShortcutOptions {
  /** Callback function to execute when spacebar is pressed */
  onPress: () => void
  /** Whether the shortcut is enabled (default: true) */
  enabled?: boolean
  /** Elements to exclude - shortcut won't trigger when these elements are focused */
  excludeTags?: string[]
}

/**
 * A hook that triggers a callback when the spacebar is pressed globally.
 * Ignores spacebar when user is focused on input elements (input, textarea, select, etc.)
 * 
 * @example
 * ```tsx
 * useSpacebarShortcut({
 *   onPress: () => generatePalette(),
 *   enabled: true,
 * })
 * ```
 */
export function useSpacebarShortcut({
  onPress,
  enabled = true,
  excludeTags = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'],
}: UseSpacebarShortcutOptions): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Only respond to spacebar
      if (event.code !== 'Space') return

      // Don't trigger if user is typing in an input element
      const activeElement = document.activeElement
      if (activeElement && excludeTags.includes(activeElement.tagName)) {
        return
      }

      // Don't trigger if user is typing in a contenteditable element
      if (activeElement?.getAttribute('contenteditable') === 'true') {
        return
      }

      // Prevent default spacebar behavior (page scroll)
      event.preventDefault()

      // Trigger the callback
      onPress()
    },
    [onPress, excludeTags]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handleKeyDown])
}
