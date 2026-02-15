import { ExportMenu } from './ExportMenu'
import './Header.css'

export interface HeaderProps {
  /** Array of 5 hex colors for export functionality */
  colors: string[]
  /** Optional additional class name */
  className?: string
}

/**
 * Application header with title and action buttons.
 * - Displays app title with heading font (Space Grotesk)
 * - Includes ExportMenu for palette export functionality
 * - Responsive layout with proper spacing
 */
export function Header({ colors, className = '' }: HeaderProps) {
  return (
    <header className={`app-header ${className}`} role="banner" data-testid="app-header">
      <div className="app-header-content">
        <h1 className="app-header-title" data-testid="app-title">
          Palette Generator
        </h1>
        <div className="app-header-actions">
          <ExportMenu colors={colors} />
        </div>
      </div>
    </header>
  )
}
