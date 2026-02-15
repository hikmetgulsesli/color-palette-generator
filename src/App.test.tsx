import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the application heading', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /color palette generator/i })
    ).toBeInTheDocument()
  })

  it('renders the subtitle text', () => {
    render(<App />)
    expect(
      screen.getByText(/generate, lock, and export beautiful color palettes/i)
    ).toBeInTheDocument()
  })

  it('uses a main landmark element', () => {
    render(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})
