import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('HTML Setup', () => {
  let indexHtml: string

  beforeAll(() => {
    indexHtml = readFileSync(
      resolve(__dirname, '../../index.html'),
      'utf-8'
    )
  })

  it('includes Google Fonts preconnect', () => {
    expect(indexHtml).toContain('fonts.googleapis.com')
    expect(indexHtml).toContain('fonts.gstatic.com')
  })

  it('loads Space Grotesk font', () => {
    expect(indexHtml).toContain('Space+Grotesk')
  })

  it('loads DM Sans font', () => {
    expect(indexHtml).toContain('DM+Sans')
  })

  it('uses font-display swap', () => {
    expect(indexHtml).toContain('display=swap')
  })

  it('sets dark theme attribute', () => {
    expect(indexHtml).toContain('data-theme="dark"')
  })

  it('sets color-scheme meta', () => {
    expect(indexHtml).toContain('color-scheme')
    expect(indexHtml).toContain('content="dark"')
  })

  it('sets theme-color meta', () => {
    expect(indexHtml).toContain('name="theme-color"')
    expect(indexHtml).toContain('content="#18181b"')
  })

  it('has proper lang attribute', () => {
    expect(indexHtml).toContain('lang="en"')
  })

  it('has viewport meta tag', () => {
    expect(indexHtml).toContain('name="viewport"')
  })

  it('has description meta tag', () => {
    expect(indexHtml).toContain('name="description"')
  })

  it('references main.tsx entry point', () => {
    expect(indexHtml).toContain('src="/src/main.tsx"')
  })

  it('has root div', () => {
    expect(indexHtml).toContain('id="root"')
  })
})
