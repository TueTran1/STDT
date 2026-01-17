import React from 'react'

export interface RegulationGridItemProps {
  title: string
  subtitle?: string
  icon: React.ReactNode
  onClick: () => void
}

/**
 * RegulationGridItem Component
 * 
 * PURPOSE: Grid-style button for regulations, matching HomeScreen military-button style
 * 
 * WHEN TO USE:
 * - Regulations page main grid
 * - Any regulation navigation grid
 * 
 * PROPS:
 * - title: Regulation title (uppercase)
 * - subtitle: Optional subtitle (single line)
 * - icon: Lucide-react icon with size={32}
 * - onClick: Click handler
 * 
 * USAGE:
 * <RegulationGridItem
 *   title="10 LỜI THỀ DANH DỰ"
 *   subtitle="Lời thề danh dự quân đội"
 *   icon={<Shield size={32} />}
 *   onClick={handleClick}
 * />
 */
export const RegulationGridItem: React.FC<RegulationGridItemProps> = ({
  title,
  subtitle,
  icon,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className="military-button"
    >
      <div className="icon-large">
        {icon}
      </div>
      <div>
        <div>{title}</div>
        {subtitle && (
          <div className="text-sm opacity-75">{subtitle}</div>
        )}
      </div>
    </button>
  )
}
