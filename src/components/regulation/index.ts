// Regulation Components - Official Military Regulation UI
// 
// This directory contains components specifically designed for displaying
// military regulations and official documents, NOT articles or news content.
//
// COMPONENTS:
//
// 1. RegulationGridItem: Grid-style button matching HomeScreen military-button
//    - Used for regulation navigation grid
//    - Same visual style as HomeScreen buttons
//    - Large icon + title + optional subtitle
//
// 2. RegulationDialog: Modal dialog for regulation content
//    - Used for displaying full regulation text
//    - Official document styling
//    - Modal behavior (no URL changes)
//
// USAGE GUIDELINES:
//
// 1. Use RegulationGridItem for regulation lists/grids
// 2. Use RegulationDialog for detailed regulation viewing
// 3. DO NOT use ArticleCard for regulations
// 4. Regulations are official documents, not content articles
//
export { RegulationGridItem, type RegulationGridItemProps } from './RegulationGridItem'
export { RegulationDialog, type RegulationDialogProps } from './RegulationDialog'
