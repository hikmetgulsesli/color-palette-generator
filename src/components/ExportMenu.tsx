import { useState, useRef, useCallback, useEffect } from 'react'
import { Download, Check, FileCode, FileJson, Palette, FileType } from 'lucide-react'
import './ExportMenu.css'

export interface ExportMenuProps {
  /** Array of 5 hex colors to export */
  colors: string[]
  /** Optional additional class name */
  className?: string
}

export type ExportFormat = 'css' | 'json' | 'tailwind' | 'ase'

interface ExportOption {
  id: ExportFormat
  label: string
  icon: typeof FileCode
  description: string
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'css',
    label: 'CSS Variables',
    icon: FileCode,
    description: 'Export as CSS custom properties',
  },
  {
    id: 'json',
    label: 'JSON',
    icon: FileJson,
    description: 'Export as JSON array',
  },
  {
    id: 'tailwind',
    label: 'Tailwind Config',
    icon: Palette,
    description: 'Export as Tailwind colors config',
  },
  {
    id: 'ase',
    label: 'ASE (Adobe)',
    icon: FileType,
    description: 'Export as Adobe Swatch Exchange',
  },
]

/**
 * Generate CSS variables export format.
 * Returns CSS with --color-1 through --color-5 variables.
 */
function generateCssExport(colors: string[]): string {
  const lines = colors.map((color, index) => `  --color-${index + 1}: ${color.toLowerCase()};`)
  return `:root {\n${lines.join('\n')}\n}`
}

/**
 * Generate JSON export format.
 */
function generateJsonExport(colors: string[]): string {
  const colorData = colors.map((color, index) => ({
    name: `color-${index + 1}`,
    hex: color.toLowerCase(),
  }))
  return JSON.stringify(colorData, null, 2)
}

/**
 * Generate Tailwind config export format.
 */
function generateTailwindExport(colors: string[]): string {
  const lines = colors.map((color, index) => `      ${index + 1}: '${color.toLowerCase()}',`)
  return `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n        palette: {\n${lines.join('\n')}\n        }\n      }\n    }\n  }\n}`
}

/**
 * Generate ASE (Adobe Swatch Exchange) format.
 * Note: This is a simplified text representation. True ASE is binary.
 */
function generateAseExport(colors: string[]): string {
  // ASE format is binary, but we provide a text representation for reference
  const lines = colors.map((color, index) => `Color ${index + 1}: ${color.toLowerCase()}`)
  return `Adobe Swatch Exchange (ASE)\n${'='.repeat(30)}\n${lines.join('\n')}\n\nNote: For actual ASE file, use a design tool export.`
}

/**
 * Generate export content based on format.
 */
function generateExport(colors: string[], format: ExportFormat): string {
  switch (format) {
    case 'css':
      return generateCssExport(colors)
    case 'json':
      return generateJsonExport(colors)
    case 'tailwind':
      return generateTailwindExport(colors)
    case 'ase':
      return generateAseExport(colors)
    default:
      return ''
  }
}

/**
 * A dropdown menu component for exporting color palettes in various formats.
 * - CSS Variables: Exports as --color-1 through --color-5
 * - JSON: Exports as structured JSON array
 * - Tailwind Config: Exports as Tailwind theme extension
 * - ASE: Adobe Swatch Exchange format (text representation)
 */
export function ExportMenu({ colors, className = '' }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [exportedFormat, setExportedFormat] = useState<ExportFormat | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close menu on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      const content = generateExport(colors, format)

      try {
        await navigator.clipboard.writeText(content)
        setExportedFormat(format)
        setIsOpen(false)

        // Reset feedback after 2 seconds
        setTimeout(() => {
          setExportedFormat(null)
        }, 2000)
      } catch (err) {
        // Silently fail if clipboard is not available
        console.error('Failed to copy export:', err)
      }
    },
    [colors]
  )

  const isExporting = exportedFormat !== null

  return (
    <div className={`export-menu ${className}`} ref={menuRef} data-testid="export-menu">
      <button
        ref={buttonRef}
        type="button"
        className="export-menu-button"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Export palette"
        data-testid="export-button"
      >
        {isExporting ? (
          <Check className="export-menu-icon" aria-hidden="true" data-testid="check-icon" />
        ) : (
          <Download className="export-menu-icon" aria-hidden="true" />
        )}
        <span className="export-menu-text">
          {isExporting ? 'Copied!' : 'Export'}
        </span>
      </button>

      {isOpen && (
        <div
          className="export-menu-dropdown"
          role="menu"
          aria-label="Export format options"
          data-testid="export-dropdown"
        >
          {EXPORT_OPTIONS.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.id}
                type="button"
                className="export-menu-option"
                role="menuitem"
                onClick={() => handleExport(option.id)}
                data-testid={`export-option-${option.id}`}
              >
                <Icon className="export-menu-option-icon" aria-hidden="true" />
                <div className="export-menu-option-content">
                  <span className="export-menu-option-label">{option.label}</span>
                  <span className="export-menu-option-description">{option.description}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
