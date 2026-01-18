import React, { useState, useEffect } from 'react'
import { Save, X, Eye } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useContentPermission } from '../hooks/useContentPermissions'
import { validateArticle } from '../services/articleService'
import { validateFirestoreRequirements, checkFirestoreUserDocument } from '../utils/debugAuth'
import type { Article, ArticleType } from '../services/articleService'
import type { NewsArticle, KnowledgeArticle } from '../types/firestore'
import './ArticleForm.css'

interface ArticleFormProps {
  article?: Article
  articleType: ArticleType
  onSave: (articleData: Partial<Article>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  className?: string
}

/**
 * ArticleForm Component
 * 
 * Type-safe form for creating and editing both News and Knowledge articles
 * Uses the shared BaseArticle interface and extends with type-specific fields
 */
export const ArticleForm: React.FC<ArticleFormProps> = ({
  article,
  articleType,
  onSave,
  onCancel,
  isLoading = false,
  className = ''
}) => {
  const { user } = useAuth()
  const { canUpdate } = useContentPermission(article)
  
  // Form state
  const [formData, setFormData] = useState<Partial<Article>>({})
  const [errors, setErrors] = useState<string[]>([])
  const [isDirty, setIsDirty] = useState(false)
  const [isPreview, setIsPreview] = useState(false)

  // Initialize form data when article changes
  useEffect(() => {
    if (article) {
      setFormData(article)
    } else if (user?.uid) {
      // Initialize with default values for new article only if user is available
      const defaultData: Partial<Article> = {
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        tags: [],
        featured: false,
        status: 'saved',
        author: {
          uid: user.uid,
          displayName: user.displayName || '',
          photoURL: ''
        },
        createdBy: user.uid,
        updatedBy: user.uid
      }
      
      // Add type-specific defaults
      if (articleType === 'news') {
        const newsDefaults: Partial<NewsArticle> = {
          ...defaultData,
          excerpt: '',
          category: 'general',
          readingTime: 5,
          viewCount: 0,
          metadata: {
            seoTitle: '',
            seoDescription: '',
            keywords: []
          }
        }
        setFormData(newsDefaults)
      } else if (articleType === 'knowledge') {
        const knowledgeDefaults: Partial<KnowledgeArticle> = {
          ...defaultData,
          summary: '',
          category: 'quan-su',
          estimatedTime: 10,
          engagement: {
            views: 0,
            likes: 0,
            shares: 0,
            bookmarks: 0
          },
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
        }
        setFormData(knowledgeDefaults)
      } else {
        setFormData(defaultData)
      }
    } else {
      // User not available, clear form data
      setFormData({})
    }
  }, [article, articleType, user])

  // Handle form field changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setIsDirty(true)
    setErrors([])
  }

  // Handle tags input
  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    handleInputChange('tags', tags)
  }

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens
      .trim()
  }

  // Auto-generate slug when title changes
  const handleTitleChange = (title: string) => {
    handleInputChange('title', title)
    if (!article && !formData.slug) { // Only auto-generate for new articles
      handleInputChange('slug', generateSlug(title))
    }
  }

  // Validate and save form
  const handleSave = async () => {
    const validation = validateArticle(formData, articleType)
    
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }
    
    // Check if user document exists in Firestore
    if (user?.uid) {
      const userDocCheck = await checkFirestoreUserDocument(user.uid)
            
      if (!userDocCheck.exists) {
        setErrors([`User document issue: ${userDocCheck.error}. Please contact administrator.`])
        return
      }
      
      if (userDocCheck.role !== 'editor') {
        setErrors([`User role is "${userDocCheck.role}". Only editors can create articles.`])
        return
      }
      
      if (!userDocCheck.isActive) {
        setErrors(['Your account is not active. Please contact administrator.'])
        return
      }
    }
    
    // Validate Firestore requirements
    const firestoreErrors = validateFirestoreRequirements(user, formData)
    if (firestoreErrors.length > 0) {
      setErrors(firestoreErrors)
            return
    }
    
    try {
      await onSave(formData)
      setIsDirty(false)
    } catch (error) {
      // Show the actual error message for debugging
      const errorMessage = error instanceof Error ? error.message : 'Lưu bài viết thất bại. Vui lòng thử lại.'
      setErrors([errorMessage])
    }
  }

  // Check if form can be saved
  const canSave = canUpdate && (isDirty || !article) && !!user?.uid

  // If user is not authenticated, show error
  useEffect(() => {
    if (!user?.uid) {
      setErrors(['Bạn cần đăng nhập để tạo hoặc chỉnh sửa bài viết'])
    }
  }, [user])

  // Render type-specific fields
  const renderTypeSpecificFields = () => {
    if (articleType === 'news') {
      const newsData = formData as Partial<NewsArticle>
      return (
        <>
          <div className="form-group">
            <label htmlFor="excerpt">Tóm tắt *</label>
            <textarea
              id="excerpt"
              value={newsData.excerpt || ''}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              placeholder="Nhập tóm tắt tin tức..."
              rows={3}
              disabled={!canUpdate}
            />
          </div>

          <div className="form-group">
            <label htmlFor="newsCategory">Danh mục tin tức</label>
            <select
              id="newsCategory"
              value={newsData.category || 'general'}
              onChange={(e) => handleInputChange('category', e.target.value)}
              disabled={!canUpdate}
            >
              <option value="announcement">Thông báo</option>
              <option value="event">Sự kiện</option>
              <option value="update">Cập nhật</option>
              <option value="general">Tổng hợp</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="readingTime">Thời gian đọc (phút)</label>
              <input
                id="readingTime"
                type="number"
                min="1"
                value={newsData.readingTime || 5}
                onChange={(e) => handleInputChange('readingTime', parseInt(e.target.value))}
                disabled={!canUpdate}
              />
            </div>

            <div className="form-group">
              <label htmlFor="coverImage">Ảnh bìa (URL)</label>
              <input
                id="coverImage"
                type="url"
                value={newsData.coverImage || ''}
                onChange={(e) => handleInputChange('coverImage', e.target.value)}
                placeholder="https://..."
                disabled={!canUpdate}
              />
            </div>
          </div>
        </>
      )
    } else if (articleType === 'knowledge') {
      const knowledgeData = formData as Partial<KnowledgeArticle>
      return (
        <>
          <div className="form-group">
            <label htmlFor="summary">Tóm tắt *</label>
            <textarea
              id="summary"
              value={knowledgeData.summary || ''}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder="Nhập tóm tắt kiến thức..."
              rows={3}
              disabled={!canUpdate}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="knowledgeCategory">Danh mục kiến thức</label>
              <select
                id="knowledgeCategory"
                value={knowledgeData.category || 'quan-su'}
                onChange={(e) => handleInputChange('category', e.target.value)}
                disabled={!canUpdate}
              >
                <option value="quan-su">Quân sự</option>
                <option value="chinh-tri">Chính trị</option>
                <option value="hau-can">Hậu cần</option>
                <option value="ky-thuat">Kỹ thuật</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="estimatedTime">Thời gian ước tính (phút)</label>
              <input
                id="estimatedTime"
                type="number"
                min="1"
                value={knowledgeData.estimatedTime || 10}
                onChange={(e) => handleInputChange('estimatedTime', parseInt(e.target.value))}
                disabled={!canUpdate}
              />
            </div>

            <div className="form-group">
              <label htmlFor="subcategory">Danh mục con</label>
              <input
                id="subcategory"
                type="text"
                value={knowledgeData.subcategory || ''}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                placeholder="Danh mục con..."
                disabled={!canUpdate}
              />
            </div>
          </div>
        </>
      )
    }
    
    return null
  }

  if (isPreview) {
    return (
      <div className={`article-form preview-mode ${className}`}>
        <div className="preview-header">
          <h3>Xem trước: {formData.title}</h3>
          <button
            onClick={() => setIsPreview(false)}
            className="button-secondary"
          >
            <X size={16} />
            Quay lại chỉnh sửa
          </button>
        </div>
        <div className="preview-content">
          <div className="article-preview">
            <h1>{formData.title}</h1>
            <p><strong>Slug:</strong> {formData.slug}</p>
            {'excerpt' in formData && formData.excerpt && <p><strong>Tóm tắt:</strong> {formData.excerpt}</p>}
            {'summary' in formData && formData.summary && <p><strong>Tóm tắt:</strong> {formData.summary}</p>}
            <div 
              className="content-preview"
              dangerouslySetInnerHTML={{ __html: formData.content || '' }}
            />
            {formData.tags && formData.tags.length > 0 && (
              <div className="tags-preview">
                <strong>Tags:</strong> {formData.tags.join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`article-form ${className}`}>
      
      <div className="form-header">
        <h3>
          {article ? 'Chỉnh sửa' : 'Tạo mới'} {articleType === 'news' ? 'Tin tức' : 'Kiến thức'}
        </h3>
        <div className="form-actions">
          <button
            onClick={() => setIsPreview(true)}
            className="button-secondary"
            disabled={!formData.content}
          >
            <Eye size={16} />
            Xem trước
          </button>
          <button
            onClick={onCancel}
            className="button-secondary"
          >
            <X size={16} />
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || isLoading}
            className="button-primary"
          >
            <Save size={16} />
            {isLoading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="form-errors">
          <h4>Lỗi:</h4>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-content">
        <div className="form-group">
          <label htmlFor="title">Tiêu đề *</label>
          <input
            id="title"
            type="text"
            value={formData.title || ''}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Nhập tiêu đề..."
            disabled={!canUpdate}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="slug">Slug *</label>
          <input
            id="slug"
            type="text"
            value={formData.slug || ''}
            onChange={(e) => handleInputChange('slug', e.target.value)}
            placeholder="url-friendly-title"
            disabled={!canUpdate}
            required
          />
          <small>Slug sẽ được tự động tạo từ tiêu đề</small>
        </div>

        {renderTypeSpecificFields()}

        <div className="form-group">
          <label htmlFor="content">Nội dung *</label>
          <textarea
            id="content"
            value={formData.content || ''}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="Nhập nội dung bài viết..."
            rows={15}
            disabled={!canUpdate}
            required
          />
          <small>Hỗ trợ HTML. Ví dụ: &lt;p&gt;Nội dung&lt;/p&gt;</small>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags</label>
          <input
            id="tags"
            type="text"
            value={formData.tags ? formData.tags.join(', ') : ''}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="tag1, tag2, tag3..."
            disabled={!canUpdate}
          />
          <small>Cách nhau bằng dấu phẩy</small>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={formData.featured || false}
              onChange={(e) => handleInputChange('featured', e.target.checked)}
              disabled={!canUpdate}
            />
            Nổi bật
          </label>

          <label>
            <input
              type="checkbox"
              checked={formData.status === 'published'}
              onChange={(e) => handleInputChange('status', e.target.checked ? 'published' : 'saved')}
              disabled={!canUpdate}
            />
            Công bố
          </label>
        </div>
      </div>
    </div>
  )
}

export default ArticleForm
