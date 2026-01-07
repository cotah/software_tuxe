'use client'

import { useEffect, useCallback } from 'react'

type KeyboardHandler = (event: KeyboardEvent) => void

interface ShortcutOptions {
  meta?: boolean
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
}

export function useKeyboardShortcut(
  key: string,
  handler: KeyboardHandler,
  options: ShortcutOptions = {}
) {
  const { meta = false, ctrl = false, shift = false, alt = false } = options

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check if the key matches
      if (event.key.toLowerCase() !== key.toLowerCase()) return

      // Check modifiers
      const metaMatches = meta ? event.metaKey : !event.metaKey
      const ctrlMatches = ctrl ? event.ctrlKey : !event.ctrlKey
      const shiftMatches = shift ? event.shiftKey : !event.shiftKey
      const altMatches = alt ? event.altKey : !event.altKey

      // For Cmd+K style shortcuts, accept either meta or ctrl
      const isModifierShortcut = meta || ctrl
      const modifierPressed = event.metaKey || event.ctrlKey

      if (isModifierShortcut) {
        if (modifierPressed && shiftMatches && altMatches) {
          event.preventDefault()
          handler(event)
        }
      } else if (metaMatches && ctrlMatches && shiftMatches && altMatches) {
        handler(event)
      }
    },
    [key, meta, ctrl, shift, alt, handler]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
