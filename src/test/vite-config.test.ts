import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Vite Configuration', () => {
  let viteConfig: string

  beforeAll(() => {
    viteConfig = readFileSync(
      resolve(__dirname, '../../vite.config.ts'),
      'utf-8'
    )
  })

  it('configures port 3510', () => {
    expect(viteConfig).toContain('port: 3510')
  })

  it('uses strictPort', () => {
    expect(viteConfig).toContain('strictPort: true')
  })

  it('includes react plugin', () => {
    expect(viteConfig).toContain("from '@vitejs/plugin-react'")
    expect(viteConfig).toContain('react()')
  })
})
