import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useContentPermission } from '../hooks/useContentPermissions'
import { 
  getArticleById, 
  createArticle, 
  updateArticle,
  type ContentType 
} from '../services/contentService'
import { checkFirestoreUserDocument } from '../utils/debugAuth'
import { MilitaryPageLayout } from '../components/layout'
import { LoadingState, ErrorState, BackButton } from '../components/ui'
import { ArrowLeft, Save, Eye, AlertTriangle } from 'lucide-react'
import './ArticleEditorPage.css'

interface ArticleMetadata {
  author: {
    uid: string
    displayName: string
    photoURL?: string
  }
  readingTime?: number
  estimatedTime?: number
  createdAt: Date
  updatedAt: Date
}

/**
 * ArticleEditorPage Component
 * 
 * WYSIWYG-like editor with inline editing capabilities
 * Reuses MilitaryPageLayout for consistent visual identity
 */
export const ArticleEditorPage: React.FC = () => {
  const { type, id } = useParams<{ type: string; id?: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Determine content type from URL path
  const contentType: ContentType = location.pathname.startsWith('/news') ? 'news' : 'knowledge'
  const isEditMode = !!id
  
  // Form state
  const [article, setArticle] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [summary, setSummary] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [featured, setFeatured] = useState(false)
  const [status, setStatus] = useState<'saved' | 'published'>('saved')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPreview, setIsPreview] = useState(false)
  
  // Autosave state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSavedData, setLastSavedData] = useState<any>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<'save' | 'publish' | null>(null)
  
  // Check permissions
  const { canUpdate } = useContentPermission(article)
  
  // Auto-generate slug from title
  const generateSlug = (titleText: string): string => {
    return titleText
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens
      .trim()
  }
  
  // Calculate reading time based on content
  const calculateReadingTime = (textContent: string): number => {
    const wordsPerMinute = 200 // Average reading speed
    const wordCount = textContent.split(/\s+/).length
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
  }
  
  // Update metadata when content changes
  useEffect(() => {
    if (content) {
      const readingTime = calculateReadingTime(content)
      // Update reading time in state (will be saved with article)
      if (contentType === 'news') {
        // For news articles, reading time is calculated
        // This will be included in the save operation
      }
    }
  }, [content, contentType])
  
  // Autosave detection - check for unsaved changes
  useEffect(() => {
    const currentData = {
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt.trim(),
      summary: summary.trim(),
      tags: tags,
      featured,
      category,
    }
    
    // Check if current data differs from last saved data
    if (lastSavedData) {
      const hasChanges = JSON.stringify(currentData) !== JSON.stringify(lastSavedData)
      setHasUnsavedChanges(hasChanges)
    } else {
      // For new articles, check if any required fields are filled
      const hasContent = !!(title.trim() || content.trim() || excerpt.trim() || summary.trim())
      setHasUnsavedChanges(hasContent)
    }
  }, [title, content, excerpt, summary, tags, featured, category, lastSavedData])
  
  // Warn user before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'Bạn có thay đổi chưa được lưu. Bạn có chắc muốn rời đi?'
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])
  
  // Load article data if in edit mode
  useEffect(() => {
    const loadArticle = async () => {
      if (!user) {
        navigate('/login')
        return
      }
      
      try {
        setLoading(true)
        setError(null)
        
        if (isEditMode && id) {
          // Load existing article for editing
          const existingArticle = await getArticleById(
            contentType,
            id,
            user.uid,
            user.role
          )
          
          if (!existingArticle) {
            setError('Bài viết không tồn tại')
            return
          }
          
          // Pre-fill form with existing data
          setArticle(existingArticle)
          setTitle(existingArticle.title || '')
          setContent(existingArticle.content || '')
          setExcerpt(existingArticle.excerpt || '')
          setSummary((existingArticle as any).summary || '')
          setTags(existingArticle.tags || [])
          setFeatured(existingArticle.featured || false)
          setStatus(existingArticle.status || 'saved')
          setCategory(existingArticle.category || '')
        } else {
          // Create mode - reset form
          setTitle('')
          setContent('')
          setExcerpt('')
          setSummary('')
          setTags([])
          setFeatured(false)
          setStatus('saved')
          setCategory(contentType === 'news' ? 'general' : 'quan-su')
          setArticle(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải bài viết')
      } finally {
        setLoading(false)
      }
    }
    
    loadArticle()
  }, [type, id, isEditMode, contentType, user, navigate])
  
  // Handle title change and auto-generate slug
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    // Auto-generate slug from title for new articles
    if (!isEditMode && newTitle.trim()) {
      const newSlug = generateSlug(newTitle)
      // Slug will be included in the save operation
    }
  }
  
  // Handle save as draft
  const handleSaveDraft = () => {
    if (hasUnsavedChanges) {
      setPendingAction('save')
      setShowConfirmDialog(true)
    } else {
      // No changes to save
      showToast('Không có thay đổi nào để lưu', 'info')
    }
  }
  
  // Handle publish
  const handlePublish = () => {
    if (hasUnsavedChanges) {
      setPendingAction('publish')
      setShowConfirmDialog(true)
    } else {
      // No changes to publish
      showToast('Không có thay đổi nào để công bố', 'info')
    }
  }
  
  // Confirm action handler
  const handleConfirmAction = async () => {
    if (!pendingAction) return
    
    await handleSave(pendingAction === 'publish' ? 'published' : 'saved')
    setShowConfirmDialog(false)
    setPendingAction(null)
  }
  
  // Cancel confirmation
  const handleCancelConfirm = () => {
    setShowConfirmDialog(false)
    setPendingAction(null)
  }
  
  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    // Create toast element
    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
        <span class="toast-message">${message}</span>
      </div>
    `
    
    // Add to DOM
    document.body.appendChild(toast)
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 3000)
  }
  
  // Core save operation
  const handleSave = async (newStatus: 'saved' | 'published') => {
    
    if (!user || !title.trim() || !content.trim()) {
      setError('Vui lòng nhập tiêu đề và nội dung')
      return
    }
    
    // Check if user document exists in Firestore
    if (user?.uid) {
      const userDocCheck = await checkFirestoreUserDocument(user.uid)
      
      if (!userDocCheck.exists) {
        setError(`User document issue: ${userDocCheck.error}. Please contact administrator.`)
        return
      }
      
      if (userDocCheck.role !== 'editor') {
        setError(`User role is "${userDocCheck.role}". Only editors can create articles.`)
        return
      }
      
      if (!userDocCheck.isActive) {
        setError('Your account is not active. Please contact administrator.')
        return
      }
    }
    
    // Validation for knowledge articles
    if (contentType === 'knowledge') {
      const allowedCategories = ['quan-su', 'chinh-tri', 'hau-can', 'ky-thuat']
      
      if (!category) {
        setError('Vui lòng chọn danh mục cho bài viết kiến thức')
        return
      }
      
      if (!allowedCategories.includes(category)) {
        setError('Danh mục không hợp lệ. Chỉ chấp nhận: Quân sự, Chính trị, Hậu cần, Kỹ thuật')
        return
      }
    }
    
    try {
      setSaving(true)
      setError(null)
      setStatus(newStatus)
      
      
      const articleData = {
        title: title.trim(),
        slug: generateSlug(title.trim()),
        content: content.trim(),
        excerpt: excerpt.trim() || '',
        summary: summary.trim() || '',
        tags: tags,
        featured,
        status: newStatus,
        author: {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: ''
        },
        // Type-specific fields
        ...(contentType === 'news' && {
          category: category || 'general',
          readingTime: calculateReadingTime(content),
          viewCount: article?.viewCount || 0,
          metadata: {
            seoTitle: title.trim(),
            seoDescription: excerpt?.trim(),
            keywords: tags
          }
        }),
        ...(contentType === 'knowledge' && {
          category: category || 'quan-su',
          estimatedTime: calculateReadingTime(content),
          engagement: {
            views: article?.engagement?.views || 0,
            likes: article?.engagement?.likes || 0,
            shares: article?.engagement?.shares || 0,
            bookmarks: article?.engagement?.bookmarks || 0
          },
          type: 'article',
          subcategory: '',
          media: {
            images: [],
            videos: [],
            documents: []
          },
          prerequisites: [],
          relatedKnowledge: [],
          review: {
            isReviewed: false
          }
        })
      }
      
      
      if (isEditMode && id && article) {
        // Update existing article
        await updateArticle(
          contentType,
          id,
          articleData,
          user.uid,
          user.role
        )
      } else {
        // Create new article
        await createArticle(
          contentType,
          articleData,
          user.uid
        )
      }
      
      // Update last saved data and reset unsaved changes
      setLastSavedData(articleData)
      setHasUnsavedChanges(false)
      
      // Show success toast
      const successMessage = newStatus === 'published' 
        ? 'Bài viết đã được công bố thành công!' 
        : 'Bài viết đã được lưu thành công!'
      showToast(successMessage, 'success')
      
      // Navigate back to list page
      setTimeout(() => {
        navigate(`/${contentType}`)
      }, 1000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi lưu bài viết'
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setSaving(false)
    }
  }
  
  // Handle cancel
  const handleCancel = () => {
    navigate(`/${contentType}`)
  }
  
  // Get metadata for display
  const getMetadata = (): ArticleMetadata => {
    const now = new Date()
    return {
      author: {
        uid: user?.uid || '',
        displayName: user?.displayName || '',
        photoURL: ''
      },
      readingTime: calculateReadingTime(content),
      estimatedTime: calculateReadingTime(content),
      createdAt: article?.createdAt?.toDate?.() || now,
      updatedAt: now
    }
  }
  
  // Get page title
  const getPageTitle = () => {
    const typeLabel = contentType === 'news' ? 'Tin tức' : 'Kiến thức'
    return isEditMode ? `Chỉnh sửa ${typeLabel}` : `Tạo ${typeLabel} mới`
  }
  
  // Loading state
  if (loading) {
    return (
      <MilitaryPageLayout 
        title={<h2>{getPageTitle()}</h2>}
        showTopIcons={false}
      >
        <LoadingState message="Đang tải bài viết..." />
      </MilitaryPageLayout>
    )
  }
  
  // Error state
  if (error) {
    return (
      <MilitaryPageLayout 
        title={<h2>Lỗi</h2>}
        showTopIcons={false}
      >
        <ErrorState 
          message={error}
          onRetry={() => window.location.reload()}
        />
      </MilitaryPageLayout>
    )
  }
  
  // Preview mode
  if (isPreview) {
    const metadata = getMetadata()
    return (
      <MilitaryPageLayout 
        title={<h2>Xem trước: {title}</h2>}
        showTopIcons={true}
        customTopIcons={
            <button 
              onClick={() => setIsPreview(false)}
              className="preview-back-button"
            >
              <ArrowLeft size={20} />
              Quay lại chỉnh sửa
            </button>
        }
      >
        <div className="article-preview-container">
          {/* Article Header */}
          <div className="article-header">
            <div className="article-type-label">
              <span>{contentType === 'news' ? 'TIN TỨC' : 'KIẾN THỨC'}</span>
            </div>
            
            <h1 className="article-title">{title}</h1>
            
            <div className="article-meta-row">
              <div className="article-meta-item">
                <span>{metadata.author.displayName}</span>
              </div>
              <div className="article-meta-item">
                <span>{metadata.createdAt.toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="article-meta-item">
                <span>{metadata.readingTime} phút đọc</span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="article-content-panel">
            {excerpt && (
              <div className="article-summary">
                <h3 className="summary-title">TÓM TẮT</h3>
                <p className="summary-content">{excerpt}</p>
              </div>
            )}
            
            <div className="article-body">
              <div 
                className="article-text"
                dangerouslySetInnerHTML={{ 
                  __html: content?.replace(/\n/g, '<br />') || 'Nội dung đang được cập nhật...' 
                }} 
              />
            </div>
            
            {tags.length > 0 && (
              <div className="article-tags-section">
                <div className="tag-list">
                  {tags.map((tag, index) => (
                    <span key={index} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </MilitaryPageLayout>
    )
  }
  
  return (
    <MilitaryPageLayout 
      title={<h2>{getPageTitle()}</h2>}
      showTopIcons={true}
      customTopIcons={
        <>
          <div className="editor-top-actions">          
            {/* Autosave indicator */}
            {hasUnsavedChanges && (
              <div className="autosave-indicator">
                <span className="autosave-dot"></span>
                Có thay đổi chưa lưu
              </div>
            )}
            
            <button 
              onClick={() => setIsPreview(true)}
              className="preview-button"
              disabled={!title.trim() || !content.trim()}
            >
              <Eye size={16} />
              Xem trước
            </button>
          </div>
          <BackButton to={contentType === 'news' ? '/news' : '/knowledge'} />
        </>
      }
    >
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-dialog-header">
              <AlertTriangle size={24} />
              <h3>Xác nhận hành động</h3>
            </div>
            <div className="confirm-dialog-content">
              <p>
                {pendingAction === 'publish' 
                  ? 'Bạn có chắc muốn công bố bài viết này? Bài viết sẽ được hiển thị công khai.'
                  : 'Bạn có chắc muốn lưu bài viết này? Bài viết sẽ được lưu dưới dạng nháp.'
                }
              </p>
            </div>
            <div className="confirm-dialog-actions">
              <button 
                onClick={handleCancelConfirm}
                className="button-secondary"
                disabled={saving}
              >
                Hủy
              </button>
              <button 
                onClick={handleConfirmAction}
                className="button-primary"
                disabled={saving}
              >
                {saving ? 'Đang xử lý...' : pendingAction === 'publish' ? 'Công bố' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="article-editor-container">
        {/* Inline Title Input */}
        <div className="title-input-container">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Nhập tiêu đề bài viết..."
            className={`title-input ${hasUnsavedChanges ? 'unsaved' : ''}`}
            disabled={!canUpdate}
          />
        </div>

        {/* Type-specific fields */}
        {contentType === 'news' && (
          <div className="editor-field">
            <label>Tóm tắt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Nhập tóm tắt tin tức..."
              className="excerpt-textarea"
              rows={3}
              disabled={!canUpdate}
            />
          </div>
        )}

        {contentType === 'knowledge' && (
          <>
            <div className="editor-field">
              <label>Tóm tắt</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Nhập tóm tắt kiến thức..."
                className="summary-textarea"
                rows={3}
                disabled={!canUpdate}
              />
            </div>
            
            <div className="editor-row">
              <div className="editor-field">
                <label>Danh mục <span className="required">*</span></label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={!canUpdate}
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  <option value="quan-su">Quân sự</option>
                  <option value="chinh-tri">Chính trị</option>
                  <option value="hau-can">Hậu cần</option>
                  <option value="ky-thuat">Kỹ thuật</option>
                </select>
              </div>
              
            </div>
          </>
        )}

        {/* Content Textarea */}
        <div className="editor-field">
          <label>Nội dung</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập nội dung bài viết..."
            className="content-textarea"
            rows={20}
            disabled={!canUpdate}
          />
          <small>Hỗ trợ HTML. Ví dụ: &lt;p&gt;Nội dung&lt;/p&gt;</small>
        </div>

        {/* Tags Input */}
        <div className="editor-field">
          <label>Tags</label>
          <input
            type="text"
            value={tags.join(', ')}
            onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0))}
            placeholder="tag1, tag2, tag3..."
            className="tags-input"
            disabled={!canUpdate}
          />
          <small>Cách nhau bằng dấu phẩy</small>
        </div>

        {/* Options */}
        <div className="editor-field checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              disabled={!canUpdate}
            />
            Nổi bật
          </label>
        </div>

        {/* Error Display */}
      {error && (
        <div className="validation-error">
          <div className="error-icon">⚠️</div>
          <div className="error-message">{error}</div>
        </div>
      )}

      {/* Action Buttons */}
        <div className="editor-actions">
          <button 
            onClick={handleCancel}
            className="button-secondary"
            disabled={saving}
          >
            Hủy
          </button>
          
          <button 
            onClick={handleSaveDraft}
            className="button-secondary"
            disabled={saving || !canUpdate}
          >
            <Save size={16} />
            {saving ? 'Đang lưu...' : 'Lưu nháp'}
          </button>
          
          {user?.role === 'editor' && (
            <button 
              onClick={handlePublish}
              className="button-primary"
              disabled={saving || !canUpdate || !title.trim() || !content.trim()}
            >
              <Save size={16} />
              {saving ? 'Đang công bố...' : 'Công bố'}
            </button>
          )}
        </div>
      </div>
    </MilitaryPageLayout>
  )
}

export default ArticleEditorPage
