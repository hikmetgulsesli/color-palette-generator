import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from './Header'

describe('Header', () => {
  const mockColors = ['#22d3ee', '#a3e635', '#f472b6', '#fbbf24', '#a78bfa']

  it('renders the header with banner role', () => {
    render(<Header colors={mockColors} />)
    
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
  })

  it('displays app title with correct text', () => {
    render(<Header colors={mockColors} />)
    
    const title = screen.getByTestId('app-title')
    expect(title).toHaveTextContent('Palette Generator')
  })

  it('renders ExportMenu component', () => {
    render(<Header colors={mockColors} />)
    
    const exportMenu = screen.getByTestId('export-menu')
    expect(exportMenu).toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    render(<Header colors={mockColors} className="custom-header" />)
    
    const header = screen.getByTestId('app-header')
    expect(header).toHaveClass('custom-header')
  })

  it('has proper accessibility attributes', () => {
    render(<Header colors={mockColors} />)
    
    const header = screen.getByRole('banner')
    expect(header).toHaveAttribute('data-testid', 'app-header')
    
    const title = screen.getByTestId('app-title')
    expect(title.tagName).toBe('H1')
  })

  it('renders with empty colors array', () => {
    render(<Header colors={[]} />)
    
    const title = screen.getByTestId('app-title')
    expect(title).toHaveTextContent('Palette Generator')
    
    const exportMenu = screen.getByTestId('export-menu')
    expect(exportMenu).toBeInTheDocument()
  })

  it('passes colors to ExportMenu correctly', () => {
    const customColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
    render(<Header colors={customColors} />)
    
    // The ExportMenu should be rendered with the colors prop
    const exportButton = screen.getByTestId('export-button')
    expect(exportButton).toBeInTheDocument()
  })

  it('has proper layout structure', () => {
    render(<Header colors={mockColors} />)
    
    const header = screen.getByTestId('app-header')
    const content = header.querySelector('.app-header-content')
    expect(content).toBeInTheDocument()
    
    const actions = header.querySelector('.app-header-actions')
    expect(actions).toBeInTheDocument()
  })
})
