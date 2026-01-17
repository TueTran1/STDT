import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useNews } from '../hooks/useFirestore'
import { 
  ArticleCard, 
  type Article,
  LoadingState, 
  ErrorState, 
  EmptyState
} from '../components/ui'
import { MilitaryPageLayout } from '../components/layout'
import { Newspaper } from 'lucide-react'

export const NewsPage: React.FC = () => {
  const navigate = useNavigate()
  const { data: news, loading, error, refetch } = useNews()

  const handleArticleClick = (article: Article) => {
    navigate(`/news/${article.slug}`)
  }

  return (
    <MilitaryPageLayout 
      title={<h2>BẢN TIN LỮ ĐOÀN</h2>}
      subtitle="Cập nhật thông tin mới nhất"
    >
      {/* News Content */}
      <div className="news-content">
        {loading ? (
          <LoadingState message="Đang tải tin tức..." />
        ) : error ? (
          <ErrorState 
            message={error}
            onRetry={refetch}
          />
        ) : news.length === 0 ? (
          <EmptyState
            icon={<Newspaper size={48} />}
            title="CHƯA CÓ TIN TỨC"
            message="Chưa có thông báo nào được đăng tải. Vui lòng quay lại sau."
          />
        ) : (
          <div className="news-grid">
            {news.map((item: Article) => (
              <ArticleCard
                key={item.id}
                article={item}
                onClick={handleArticleClick}
              />
            ))}
          </div>
        )}
      </div>
    </MilitaryPageLayout>
  )
}

export default NewsPage
