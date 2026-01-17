// Article Components - Reusable UI for Article Display
// 
// This directory contains reusable components for displaying articles
// across different pages (News, Knowledge, etc.)
//
// COMPONENTS:
// - ArticleCard: Main wrapper component for articles
// - ArticleHeader: Category and priority badges
// - ArticleMeta: Title and content preview
// - ArticleTags: Tag display with overflow
// - ArticleAttachments: File attachments display
// - ArticleFooter: Views and date metadata
// - ArticleTopBar: Top navigation bar for article pages
// - ArticleDetailHeader: Header section for article detail pages
// - ArticleSummary: Summary/excerpt section for articles
// - ArticleContent: Main content container for articles
// - ArticleDetailTags: Tags section for article detail pages
// - ArticleFooterMeta: Footer metadata section for articles
// - ArticleErrorState: Error state for article pages
// - ArticleLoadingState: Loading state for article pages
//
// USAGE GUIDELINES:
// 1. Components are content-agnostic (no "news" assumptions)
// 2. Use generic naming (article, not NewsArticle)
// 3. All styling comes from CSS classes
// 4. Components accept props only, no internal logic
// 5. Ready for reuse across News and Knowledge pages
//
// EXPORTS:
export { ArticleCard, type ArticleCardProps, type Article } from './ArticleCard'
export { ArticleHeader, type ArticleHeaderProps } from './ArticleHeader'
export { ArticleMeta, type ArticleMetaProps } from './ArticleMeta'
export { ArticleTags, type ArticleTagsProps } from './ArticleTags'
export { ArticleAttachments, type ArticleAttachmentsProps, type Attachment } from './ArticleAttachments'
export { ArticleFooter, type ArticleFooterProps } from './ArticleFooter'

// Article Detail Page Components
export { ArticleTopBar, type ArticleTopBarProps } from './ArticleTopBar'
export { ArticleDetailHeader, type ArticleDetailHeaderProps } from './ArticleDetailHeader'
export { ArticleSummary, type ArticleSummaryProps } from './ArticleSummary'
export { ArticleContent, type ArticleContentProps } from './ArticleContent'
export { ArticleDetailTags, type ArticleDetailTagsProps } from './ArticleDetailTags'
export { ArticleFooterMeta, type ArticleFooterMetaProps } from './ArticleFooterMeta'
export { ArticleErrorState, type ArticleErrorStateProps } from './ArticleErrorState'
export { ArticleLoadingState, type ArticleLoadingStateProps } from './ArticleLoadingState'
