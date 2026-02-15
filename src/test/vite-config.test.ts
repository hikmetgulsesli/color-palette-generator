// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))

describe('Vite Configuration', () => {
  let viteConfig: string
  beforeAll(() => {
    viteConfig = readFileSync(resolve(currentDir, '../../vite.config.ts'), 'utf-8')
  })

  it('configures port 3510', () => { expect(viteConfig).toContain('port: 3510') })
  it('uses strictPort', () => { expect(viteConfig).toContain('strictPort: true') })
  it('includes react plugin', () => {
    expect(viteConfig).toContain("from '@vitejs/plugin-react'")
    expect(viteConfig).toContain('react()')
  })
})
