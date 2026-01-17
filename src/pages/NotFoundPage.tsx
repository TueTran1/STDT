import { HomeButton } from '../components/ui'
import { MilitaryPageLayout } from '../components/layout'

export function NotFoundPage() {
  return (
    <MilitaryPageLayout 
      title={<h2>TRANG KHÔNG TÌM THẤY</h2>}
      showTopIcons={false}
    >
      <div className="not-found-content">
        {/* Error Messages */}
        <div className="greeting-text">
          TRANG KHÔNG TÌM THẤY
        </div>
      
        {/* Return Button */}
        <HomeButton variant="full" />
      </div>
    </MilitaryPageLayout>
  )
}
