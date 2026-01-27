// UI Components - Component-First Architecture
// 
// This directory contains reusable UI components that should be used instead of
// writing inline JSX in pages. All components follow the military theme
// and are designed for maximum reusability.
//
// COMPONENT CATEGORIES:
//
// 1. CONTENT COMPONENTS:
//    - TimelineCard: Display timeline events with year and description
//    - TimelineList: Container for multiple timeline cards
//    - InfoCard: Generic information card with title and description
//    - KnowledgeSelector: Multi-select section filter for knowledge pages
//    - ArticleList: Grid/list of article items
//    - ArticleItem: Single article display with metadata
//    - ArticleCard: Reusable article card component
//    - ArticleHeader: Article category and priority display
//    - ArticleMeta: Article title and preview
//    - ArticleTags: Article tags with overflow
//    - ArticleAttachments: Article file attachments
//    - ArticleFooter: Article views and date metadata
//
// 2. INTERACTION COMPONENTS:
//    - Accordion: Container for collapsible sections
//    - AccordionItem: Single collapsible section
//    - ToggleButton: On/off toggle switch
//    - ButtonGroup: Group of related buttons (tabs, filters)
//
// 3. FEEDBACK COMPONENTS:
//    - LoadingState: Loading spinner with message
//    - ErrorState: Error display with retry option
//    - EmptyState: Empty data state with optional action
//
// USAGE GUIDELINES:
//
// 1. ALWAYS search for existing components first
// 2. If component exists, reuse it
// 3. If no component exists, create a new reusable one
// 4. NEVER write complex JSX directly in pages
// 5. Pages should only compose components and handle logic
//
// FUTURE DEVELOPMENT:
//
// When adding new UI patterns:
// 1. Check if component already exists
// 2. If yes: reuse existing component
// 3. If no: create new component in appropriate category
// 4. Add proper TypeScript interfaces and documentation
// 5. Follow military theme styling
// 6. Make component reusable with props
//
// EXPORTS:
export { TimelineCard, type TimelineCardProps } from './TimelineCard'
export { TimelineList, type TimelineListProps } from './TimelineList'
export { InfoCard, type InfoCardProps } from './InfoCard'
export { KnowledgeSelector, type KnowledgeSelectorProps } from './KnowledgeSelector'
export { ArticleList, type ArticleListProps } from './ArticleList'
export { ArticleItem, type ArticleItemProps } from './ArticleItem'
export { 
  ArticleCard, 
  type ArticleCardProps, 
  type Article,
  ArticleHeader,
  type ArticleHeaderProps,
  ArticleMeta,
  type ArticleMetaProps,
  ArticleTags,
  type ArticleTagsProps,
  ArticleAttachments,
  type ArticleAttachmentsProps,
  type Attachment,
  ArticleFooter,
  type ArticleFooterProps
} from '../article'
export { Accordion, type AccordionProps } from './Accordion'
export { AccordionItem, type AccordionItemProps } from './AccordionItem'
export { ButtonGroup, type ButtonGroupProps, type ButtonOption } from './ButtonGroup'
export { MinistryLeadersList, type MinistryLeadersListProps, type MinistryLeader, type LeaderProfile, type PersonalInfo, type TimelineItem } from './MinistryLeadersList'
export { LeaderProfileDialog, type LeaderProfileDialogProps } from './LeaderProfileDialog'
export { LoadingState, type LoadingStateProps } from './LoadingState'
export { ErrorState, type ErrorStateProps } from './ErrorState'
export { EmptyState, type EmptyStateProps } from './EmptyState'
export { HomeButton, type HomeButtonProps } from './HomeButton'
export { RefreshButton, type RefreshButtonProps } from './RefreshButton'
export { BackButton, type BackButtonProps } from './BackButton'

// Knowledge components export
export { 
  KnowledgeSectionSelector, 
  type KnowledgeSectionSelectorProps, 
  type KnowledgeSection 
} from '../knowledge'
