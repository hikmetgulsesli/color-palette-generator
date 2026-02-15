import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSpacebarShortcut } from './useSpacebarShortcut'

describe('useSpacebarShortcut', () => {
  const mockOnPress = vi.fn()

  beforeEach(() => {
    mockOnPress.mockClear()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('triggers callback when spacebar is pressed', () => {
    renderHook(() =>
      useSpacebarShortcut({ onPress: mockOnPress, enabled: true })
    )

    const event = new KeyboardEvent('keydown', { code: 'Space' })
    window.dispatchEvent(event)

    expect(mockOnPress).toHaveBeenCalledTimes(1)
  })

  it('prevents default spacebar behavior', () => {
    renderHook(() =>
      useSpacebarShortcut({ onPress: mockOnPress, enabled: true })
    )

    const event = new KeyboardEvent('keydown', { code: 'Space', cancelable: true })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
    
    window.dispatchEvent(event)

    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('does not trigger for other keys', () => {
    renderHook(() =>
      useSpacebarShortcut({ onPress: mockOnPress, enabled: true })
    )

    const keys = ['Enter', 'Escape', 'KeyA', 'ArrowDown']
    keys.forEach((code) => {
      const event = new KeyboardEvent('keydown', { code })
      window.dispatchEvent(event)
    })

    expect(mockOnPress).not.toHaveBeenCalled()
  })

  it('does not trigger when disabled', () => {
    renderHook(() =>
      useSpacebarShortcut({ onPress: mockOnPress, enabled: false })
    )

    const event = new KeyboardEvent('keydown', { code: 'Space' })
    window.dispatchEvent(event)

    expect(mockOnPress).not.toHaveBeenCalled()
  })

  it('does not trigger when input is focused', () => {
    // Create and focus an input element
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    renderHook(() =>
      useSpacebarShortcut({ onPress: mockOnPress, enabled: true })
    )

    const event = new KeyboardEvent('keydown', { code: 'Space' })
    window.dispatchEvent(event)

    expect(mockOnPress).not.toHaveBeenCalled()

    document.body.removeChild(input)
  })

  it('does not trigger when textarea is focused', () => {
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    textarea.focus()

    renderHook(() =>
      useSpacebarShortcut({ onPress: mockOnPress, enabled: true })
    )

    const event = new KeyboardEvent('keydown', { code: 'Space' })
    window.dispatchEvent(event)

    expect(mockOnPress).not.toHaveBeenCalled()

    document.body.removeChild(textarea)
  })

  it('does not trigger when select is focused', () => {
    const select = document.createElement('select')
    document.body.appendChild(select)
    select.focus()

    renderHook(() =>
      useSpacebarShortcut({ onPress: mockOnPress, enabled: true })
    )

    const event = new KeyboardEvent('keydown', { code: 'Space' })
    window.dispatchEvent(event)

    expect(mockOnPress).not.toHaveBeenCalled()

    document.body.removeChild(select)
  })

  it('does not trigger when button is focused', () => {
    const button = document.createElement('button')
    document.body.appendChild(button)
    button.focus()

    renderHook(() =>
      useSpacebarShortcut({ onPress: mockOnPress, enabled: true })
    )

    const event = new KeyboardEvent('keydown', { code: 'Space' })
    window.dispatchEvent(event)

    expect(mockOnPress).not.toHaveBeenCalled()

    document.body.removeChild(button)
  })

  it('triggers when div is focused (not in exclude list)', () => {
    const div = document.createElement('div')
    div.tabIndex = 0
    document.body.appendChild(div)
    div.focus()

    renderHook(() =>
      useSpacebarShortcut({ onPress: mockOnPress, enabled: true })
    )

    const event = new KeyboardEvent('keydown', { code: 'Space' })
    window.dispatchEvent(event)

    expect(mockOnPress).toHaveBeenCalledTimes(1)

    document.body.removeChild(div)
  })

  it('triggers when no element is focused', () => {
    // Blur any focused element
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    renderHook(() =>
      useSpacebarShortcut({ onPress: mockOnPress, enabled: true })
    )

    const event = new KeyboardEvent('keydown', { code: 'Space' })
    window.dispatchEvent(event)

    expect(mockOnPress).toHaveBeenCalledTimes(1)
  })

  it('does not trigger when contenteditable element is focused', () => {
    const editable = document.createElement('div')
    editable.setAttribute('contenteditable', 'true')
    document.body.appendChild(editable)
    editable.focus()

    // Ensure the element is actually focused and has contenteditable
    expect(document.activeElement).toBe(editable)
    expect(editable.getAttribute('contenteditable')).toBe('true')

    renderHook(() =>
      useSpacebarShortcut({ onPress: mockOnPress, enabled: true })
    )

    const event = new KeyboardEvent('keydown', { code: 'Space' })
    window.dispatchEvent(event)

    expect(mockOnPress).not.toHaveBeenCalled()

    document.body.removeChild(editable)
  })

  it('respects custom excludeTags', () => {
    const div = document.createElement('div')
    div.setAttribute('tabindex', '0')
    document.body.appendChild(div)
    div.focus()

    // Verify div is focused
    expect(document.activeElement).toBe(div)

    renderHook(() =>
      useSpacebarShortcut({
        onPress: mockOnPress,
        enabled: true,
        excludeTags: ['DIV'],
      })
    )

    const event = new KeyboardEvent('keydown', { code: 'Space' })
    window.dispatchEvent(event)

    expect(mockOnPress).not.toHaveBeenCalled()

    document.body.removeChild(div)
  })

  it('cleans up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() =>
      useSpacebarShortcut({ onPress: mockOnPress, enabled: true })
    )

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('handles multiple spacebar presses', () => {
    renderHook(() =>
      useSpacebarShortcut({ onPress: mockOnPress, enabled: true })
    )

    // Press spacebar 5 times
    for (let i = 0; i < 5; i++) {
      const event = new KeyboardEvent('keydown', { code: 'Space' })
      window.dispatchEvent(event)
    }

    expect(mockOnPress).toHaveBeenCalledTimes(5)
  })
})
