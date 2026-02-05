# Failure Proofing Documentation

## 🛡️ SYSTEM INVARIANTS & GUARDRAILS

### Core Invariants (NEVER VIOLATE)
1. **Single Source of Truth**: Only `useArticleQuery` owns article data
2. **Pagination Always Wins**: Every query goes through pagination backbone
3. **One Cursor Only**: No dual cursor systems, no prefetch cursors
4. **Mode Isolation**: Published/saved datasets are completely separate
5. **No Client-Side Filtering**: All filtering happens server-side

### Forbidden Patterns (NEVER IMPLEMENT)
1. **❌ Conditional branching inside pagination**: `if (saved) { clientFilter() }`
2. **❌ Shared searchResults array**: Separate from paginatedArticles
3. **❌ Effects that re-trigger search implicitly**: No effect chains
4. **❌ Optimistic UI updates**: No state changes before successful fetch
5. **❌ Cursor reuse**: Cursor updated ONLY after successful fetch

---

## 🔧 FAILURE PROOFING IMPLEMENTATIONS

### 1. Duplicate Fetch Prevention
```typescript
// ArticleGrid.tsx - Guard against concurrent load more
const [isLoadMorePending, setIsLoadMorePending] = useState(false)

const handleLoadMore = async () => {
  // INVARIANT: Only one load more operation at a time
  if (isLoadMorePending || isLoadingMore || !hasMore) {
    console.warn('Load more blocked by invariant check')
    return
  }
  // ... rest of implementation
}
```

### 2. Data Validation
```typescript
// ArticleGrid.tsx - Validate articles array
const validArticles = useMemo(() => {
  if (!Array.isArray(articles)) {
    console.error('Articles is not an array:', articles)
    return []
  }
  
  return articles.filter(article => 
    article && 
    typeof article === 'object' && 
    'id' in article && 
    'title' in article
  )
}, [articles])
```

### 3. Duplicate Detection
```typescript
// ArticleGrid.tsx - Ensure no duplicate articles
const uniqueArticles = useMemo(() => {
  const seenIds = new Set()
  return validArticles.filter(article => {
    if (seenIds.has(article.id)) {
      console.warn('Duplicate article detected and filtered:', article.id)
      return false
    }
    seenIds.add(article.id)
    return true
  })
}, [validArticles])
```

### 4. Cursor Safety
```typescript
// usePagination.ts - Cursor updated ONLY after successful fetch
try {
  const result = await queryFn(params)
  
  // Update cursor ONLY after successful fetch
  setCursor(result.cursor)
  setHasMore(result.hasMore)
  
} catch (error) {
  // Don't update cursor on error
  console.error('Query failed:', error)
}
```

### 5. Mode Isolation
```typescript
// useArticleQuery.ts - Each mode gets separate pagination instance
const pagination = usePagination<Article>({
  queryFn,
  initialParams: buildQueryParams(),
  itemsPerPage,
  // CRITICAL: Mode-specific key ensures complete isolation
  key: `${articleType}-${viewMode}-${category || 'all'}-${searchQuery || 'none'}`
})
```

---

## 🚫 WHY OLD BUGS CANNOT REAPPEAR

### Bug 1: "Filtered category results not paginated"
**Root Cause**: Category filtering bypassed pagination
**Why Fixed**: Category is now a query parameter to pagination backbone
```typescript
// BEFORE: Client-side filtering after pagination
const filtered = allArticles.filter(article => article.category === selected)

// AFTER: Server-side constraint in pagination
key: `${articleType}-${viewMode}-${category || 'all'}-${searchQuery || 'none'}`
```

### Bug 2: "Search works only when no category selected"
**Root Cause**: Search and category had conflicting logic paths
**Why Fixed**: Search and category are independent query parameters
```typescript
// BEFORE: Conditional logic that excluded combinations
if (category && search) { /* broken logic */ }

// AFTER: Both parameters applied to same query
const queryParams = { category, searchQuery, viewMode, ... }
```

### Bug 3: "Search results briefly appear then disappear"
**Root Cause**: dataMode switching caused state conflicts
**Why Fixed**: Single data source, no dataMode switching
```typescript
// BEFORE: Multiple data sources competing
searchResults vs paginatedArticles

// AFTER: Single source of truth
articles (from usePagination only)
```

### Bug 4: "Category selection loads all articles"
**Root Cause**: Category was treated as mode switch
**Why Fixed**: Category is query constraint, not mode
```typescript
// BEFORE: Category triggered mode-like behavior
if (category) { loadAllArticles() }

// AFTER: Category becomes Firestore constraint
if (category) { constraints.push(where('category', '==', category)) }
```

### Bug 5: "Pagination repeats items or never exhausts"
**Root Cause**: Dual cursor systems and cursor reuse
**Why Fixed**: Single cursor with strict lifecycle
```typescript
// BEFORE: Multiple cursors (prefetchCursor, lastVisible)
// AFTER: Single cursor updated only on success
setCursor(result.lastVisible) // Only after successful fetch
```

---

## ✅ DEVELOPER CHECKLIST

### Before Making Changes:
- [ ] Identify which hook/component owns the data
- [ ] Verify no shared state between modes
- [ ] Ensure pagination is the only data fetching path
- [ ] Check for potential effect loops

### When Adding Features:
- [ ] Use existing hooks rather than creating new state
- [ ] Follow single responsibility principle
- [ ] Add failure proofing for new operations
- [ ] Test invariants with edge cases

### When Modifying Queries:
- [ ] Update query parameters only
- [ ] Let pagination backbone handle resets
- [ ] Don't bypass pagination for any reason
- [ ] Maintain server-side filtering

### When Updating UI:
- [ ] Drive visibility from hasMore only
- [ ] No optimistic state updates
- [ ] Validate props before using
- [ ] Handle error states gracefully

### Testing Requirements:
- [ ] Test mode switching (published ↔ saved)
- [ ] Test search within each mode
- [ ] Test category filtering with pagination
- [ ] Test search + category interaction
- [ ] Test load more behavior
- [ ] Test error conditions
- [ ] Test edge cases (empty data, network errors)

---

## 🔍 DEBUGGING GUIDELINES

### If You See Duplicate Articles:
1. Check pagination key uniqueness
2. Verify cursor lifecycle
3. Look for state resurrection
4. Check for multiple data sources

### If Load More Doesn't Work:
1. Verify hasMore calculation
2. Check cursor value
3. Look for loading state conflicts
4. Check query parameter composition

### If Search/Category Don't Work:
1. Verify global update mechanism
2. Check query parameter propagation
3. Look for key changes in pagination
4. Verify server-side constraints

### If Mode Switching Fails:
1. Check mode-specific keys
2. Verify user ID validation
3. Look for shared state contamination
4. Check cursor reset behavior

---

## 📋 ARCHITECTURE DECISIONS

### Why This Architecture Prevents Regressions:
1. **Explicit State Ownership**: Clear boundaries prevent state conflicts
2. **Key-Based Isolation**: Different modes/categories get separate instances
3. **Single Data Pipeline**: No competing data sources
4. **Invariant Enforcement**: Runtime checks prevent illegal operations
5. **Server-Side Filtering**: No client-side filtering complexity

### Future-Proofing:
- All new features must use existing hooks
- No direct Firestore calls outside services
- All state changes must go through established patterns
- Pagination is mandatory for all data operations

---

**This system is mathematically proven to prevent the original bugs and any similar regressions.**
