import React from 'react'
import { useNavigate } from 'react-router-dom'
import { HomeButton } from '../components/ui'
import { ShieldX } from 'lucide-react'
import { MilitaryPageLayout } from '../components/layout'

export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <MilitaryPageLayout 
      title={<h2>TRUY CẬP BỊ TỪ CHỐI</h2>}
      subtitle="Bạn không có quyền truy cập trang này"
      showTopIcons={false}
    >
      <div className="access-denied-content">
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <HomeButton variant="full" />
          <button
            onClick={() => window.history.back()}
            className="military-button"
            style={{ 
              maxWidth: '200px', 
              fontSize: '16px',
              padding: '16px'
            }}
          >
            <div className="icon-large">←</div>
            <div>QUAY LẠI</div>
          </button>
        </div>
      </div>
    </MilitaryPageLayout>
  )
}
