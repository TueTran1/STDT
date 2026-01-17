import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MilitaryPageLayout } from '../components/layout'
import quanHieuImage from '../assets/quan-hieu.png'
import quyetThangImage from '../assets/quyet-thang.png'
import tinTucImage from '../assets/tin-tuc.png'
import kienThucImage from '../assets/kien-thuc.png'

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate()
  
  const handleRegulationsClick = () => {
    navigate('/regulations')
  }

  const handleTraditionsClick = () => {
    navigate('/traditions')
  }

  const handleNewsClick = () => {
    navigate('/news')
  }

  const handleKnowledgeClick = () => {
    navigate('/knowledge')
  }

  return (
    <MilitaryPageLayout 
      title={<h2>SỔ TAY ĐIỆN TỬ<br/>LỮ ĐOÀN 83</h2>}
      showTopIcons={false}
    >

      {/* Navigation Grid */}
      <div className="navigation-grid">
        {/* ĐIỀU LỆNH QUẢN LÝ BỘ ĐỘI */}
        <button
          onClick={handleRegulationsClick}
          className="military-button"
        >
          <div className="icon-large">
            <img src={quanHieuImage} alt="Quân hiệu" />
          </div>
          <div>ĐIỀU LỆNH QUẢN LÝ BỘ ĐỘI</div>
        </button>

        {/* TRUYỀN THỐNG */}
        <button
          onClick={handleTraditionsClick}
          className="military-button"
        >
          {/* <div className="icon-large"> */}
            <img src={quyetThangImage} alt="Quyết thắng" width="66" height="44"/>
          {/* </div> */}
          <div>TRUYỀN THỐNG</div>
        </button>

        {/* TIN TỨC */}
        <button
          onClick={handleNewsClick}
          className="military-button"
        >
          <div className="icon-large">
            <img src={tinTucImage} alt="Tin tức" />
          </div>
          <div>TIN TỨC</div>
        </button>

        {/* KIẾN THỨC */}
        <button
          onClick={handleKnowledgeClick}
          className="military-button"
        >
          <div className="icon-large">
            <img src={kienThucImage} alt="Kiến thức" />
          </div>
          <div>KIẾN THỨC CẦN CÓ</div>
        </button>
      </div>
    </MilitaryPageLayout>
  )
}
