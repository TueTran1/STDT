// ========================================
//   COMPONENT UTILITY HELPERS
// ========================================

// CSS Class Combinations for Common Patterns
export const cssClasses = {
  // Layout Containers
  mainContainer: 'main-container',
  contentPanel: 'content-panel',
  articleContentPanel: 'article-content-panel',
  
  // Typography
  textPrimary: 'text-primary',
  textSecondary: 'text-secondary',
  textMuted: 'text-muted',
  textGold: 'text-gold',
  textGoldLight: 'text-gold-light',
  textGreen700: 'text-green-700',
  textRed700: 'text-red-700',
  
  // Font Sizes
  textXs: 'text-xs',
  textSm: 'text-sm',
  textBase: 'text-base',
  textLg: 'text-lg',
  textXl: 'text-xl',
  text2xl: 'text-2xl',
  text3xl: 'text-3xl',
  
  // Font Weights
  fontMedium: 'font-medium',
  fontSemibold: 'font-semibold',
  fontBold: 'font-bold',
  
  // Text Alignment & Transform
  textCenter: 'text-center',
  textLeft: 'text-left',
  uppercase: 'uppercase',
  trackingWide: 'tracking-wide',
  trackingWider: 'tracking-wider',
  
  // Layout
  flex: 'flex',
  flexCol: 'flex-col',
  itemsCenter: 'items-center',
  justifyCenter: 'justify-center',
  justifyBetween: 'justify-between',
  
  // Spacing
  spaceX2: 'space-x-2',
  spaceX3: 'space-x-3',
  spaceX6: 'space-x-6',
  spaceY4: 'space-y-4',
  
  // Grid
  grid: 'grid',
  gridCols1: 'grid-cols-1',
  gridCols2: 'grid-cols-2',
  gridCols4: 'grid-cols-4',
  gap6: 'gap-6',
  
  // Sizing
  w64: 'w-64',
  w8: 'w-8',
  h8: 'h-8',
  hFull: 'h-full',
  minHScreen: 'min-h-screen',
  flex1: 'flex-1',
  
  // Colors
  bgRed900: 'bg-red-900',
  bgRed950: 'bg-red-950',
  bgRed90050: 'bg-red-900-50',
  bgRed100: 'bg-red-100',
  bgYellow500: 'bg-yellow-500',
  bgGray50: 'bg-gray-50',
  bgWhite95: 'bg-white-95',
  bgGreen100: 'bg-green-100',
  
  borderRed900: 'border-red-900',
  borderYellow600: 'border-yellow-600',
  borderYellow700: 'border-yellow-700',
  borderGray200: 'border-gray-200',
  borderGray300: 'border-gray-300',
  borderGreen300: 'border-green-300',
  borderRed300: 'border-red-300',
  borderTransparent: 'border-transparent',
  
  border: 'border',
  border2: 'border-2',
  borderR: 'border-r',
  borderB: 'border-b',
  borderT: 'border-t',
  
  roundedLg: 'rounded-lg',
  roundedFull: 'rounded-full',
  
  // Spacing Utilities
  p4: 'p-4',
  p6: 'p-6',
  p8: 'p-8',
  px4: 'px-4',
  px6: 'px-6',
  px3: 'px-3',
  py2: 'py-2',
  py3: 'py-3',
  py4: 'py-4',
  py1: 'py-1',
  py8: 'py-8',
  
  mb2: 'mb-2',
  mb3: 'mb-3',
  mb4: 'mb-4',
  mb6: 'mb-6',
  mb8: 'mb-8',
  mt4: 'mt-4',
  mt8: 'mt-8',
  pt6: 'pt-6',
  
  // Effects
  shadowLg: 'shadow-lg',
  transitionAll: 'transition-all',
  duration200: 'duration-200',
  hoverBgRed800: 'hover-bg-red-800',
  
  // Additional utility classes
  flexShrink0: 'flex-shrink-0',
  textRed400: 'text-red-400',
  wFull: 'w-full',
  
  // Table classes
  overflowXAuto: 'overflow-x-auto',
  borderCollapse: 'border-collapse',
  
  // Component Specific
  adminSidebar: 'admin-sidebar',
  adminHeader: 'admin-header',
  adminTitle: 'admin-title',
  adminIdentity: 'admin-identity',
  adminAvatar: 'admin-avatar',
  adminAvatarText: 'admin-avatar-text',
  adminName: 'admin-name',
  adminEmail: 'admin-email',
  
  metricCard: 'metric-card',
  metricNumber: 'metric-number',
  metricLabel: 'metric-label',
  metricSublabel: 'metric-sublabel',
  
  statusSuccess: 'status-success',
  statusRow: 'status-row',
  
  articleHeader: 'article-header',
  articleTypeLabel: 'article-type-label',
  articleTitle: 'article-title',
  articleMetaRow: 'article-meta-row',
  articleMetaItem: 'article-meta-item',
}

// Utility function for combining classes
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}

// Common component patterns
export const patterns = {
  // Flex with center alignment
  flexCenter: () => cn(cssClasses.flex, cssClasses.itemsCenter, cssClasses.justifyCenter),
  
  // Flex with space between
  flexBetween: () => cn(cssClasses.flex, cssClasses.itemsCenter, cssClasses.justifyBetween),
  
  // Flex column with center alignment
  flexColCenter: () => cn(cssClasses.flex, cssClasses.flexCol, cssClasses.itemsCenter),
  
  // Content panel wrapper
  panel: () => cssClasses.contentPanel,
  
  // Metric card
  metricCard: () => cssClasses.metricCard,
  
  // Status row
  statusRow: () => cssClasses.statusRow,
  
  // Admin sidebar
  adminSidebar: () => cssClasses.adminSidebar,
  
  // Article header
  articleHeader: () => cssClasses.articleHeader,
}
