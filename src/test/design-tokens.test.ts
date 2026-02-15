// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))

describe('Design Tokens', () => {
  let indexCss: string

  beforeAll(() => {
    indexCss = readFileSync(resolve(currentDir, '../index.css'), 'utf-8')
  })

  describe('color palette (DevTool/CLI Dashboard)', () => {
    const requiredColors = [
      '--primary: #22d3ee',
      '--primary-hover: #06b6d4',
      '--accent: #a3e635',
      '--surface: #18181b',
      '--surface-alt: #27272a',
      '--text: #fafafa',
      '--text-muted: #a1a1aa',
      '--border: #3f3f46',
      '--success: #4ade80',
      '--error: #f87171',
      '--warning: #fbbf24',
    ]
    requiredColors.forEach((token) => {
      it('defines ' + (token.split(':')[0] || '').trim(), () => {
        expect(indexCss).toContain(token)
      })
    })
  })

  describe('typography tokens', () => {
    it('defines heading font as Space Grotesk', () => {
      expect(indexCss).toContain("--font-heading: 'Space Grotesk'")
    })
    it('defines body font as DM Sans', () => {
      expect(indexCss).toContain("--font-body: 'DM Sans'")
    })
  })

  describe('spacing tokens', () => {
    const s = ['--space-xs','--space-sm','--space-md','--space-lg','--space-xl','--space-2xl']
    s.forEach((token) => {
      it('defines ' + token, () => { expect(indexCss).toContain(token) })
    })
  })

  describe('radius tokens', () => {
    const r = ['--radius-sm','--radius-md','--radius-lg']
    r.forEach((token) => {
      it('defines ' + token, () => { expect(indexCss).toContain(token) })
    })
  })

  describe('shadow tokens', () => {
    it('defines --shadow-sm', () => { expect(indexCss).toContain('--shadow-sm') })
    it('defines --shadow-md', () => { expect(indexCss).toContain('--shadow-md') })
  })

  describe('accessibility', () => {
    it('includes prefers-reduced-motion media query', () => {
      expect(indexCss).toContain('prefers-reduced-motion: reduce')
    })
    it('includes focus-visible styles', () => {
      expect(indexCss).toContain(':focus-visible')
    })
    it('includes sr-only utility class', () => {
      expect(indexCss).toContain('.sr-only')
    })
  })

  describe('dark theme base', () => {
    it('sets dark color-scheme on html', () => {
      expect(indexCss).toContain('color-scheme: dark')
    })
    it('applies dark background on body', () => {
      expect(indexCss).toContain('background-color: var(--surface)')
    })
    it('applies light text color on body', () => {
      expect(indexCss).toContain('color: var(--text)')
    })
  })
})
