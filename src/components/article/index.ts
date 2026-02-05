// Article Components Index
// Unified export for all article-related components

// NEW UNIFIED COMPONENTS
export { ArticleShell } from './ArticleShell'
export type { Article as ArticleShellType, ArticleMode, ContentType } from './ArticleShell'

export { ArticleTypeHeader } from './ArticleTypeHeader'
export { ArticleTitle } from './ArticleTitle'
export { ArticleMetaBar } from './ArticleMetaBar'
export { ArticleBody } from './ArticleBody'
export { ArticleSummary } from './ArticleSummary'
export { ArticleActions } from './ArticleActions'

// Legacy exports for backward compatibility
export { ArticleCard, type ArticleCardProps, type Article } from './ArticleCard'
export { ArticleHeader, type ArticleHeaderProps } from './ArticleHeader'
export { ArticleMeta, type ArticleMetaProps } from './ArticleMeta'
export { ArticleTags, type ArticleTagsProps } from './ArticleTags'
export { ArticleAttachments, type ArticleAttachmentsProps, type Attachment } from './ArticleAttachments'
export { ArticleFooter, type ArticleFooterProps } from './ArticleFooter'

// Article Detail Page Components
export { ArticleTopBar, type ArticleTopBarProps } from './ArticleTopBar'
export { ArticleDetailHeader, type ArticleDetailHeaderProps } from './ArticleDetailHeader'
export { ArticleContent, type ArticleContentProps } from './ArticleContent'
export { ArticleDetailTags, type ArticleDetailTagsProps } from './ArticleDetailTags'
export { ArticleFooterMeta, type ArticleFooterMetaProps } from './ArticleFooterMeta'
export { ArticleLoadingState, type ArticleLoadingStateProps } from './ArticleLoadingState'
