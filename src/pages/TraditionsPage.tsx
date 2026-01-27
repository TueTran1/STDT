import React, { useState } from 'react'
import { 
  Accordion, 
  type ButtonOption,
  MinistryLeadersList,
  ButtonGroup,
  TimelineList
} from '../components/ui'
import type { TimelineCardProps } from '../components/ui/TimelineCard'
import { MilitaryPageLayout } from '../components/layout'
import { 
  phanVanGiangProfile,
  nguyenTrongNghiaProfile,
  nguyenTanCuongProfile
} from '../data/leaders'

const TABS: ButtonOption[] = [
  { id: 'qndvn', label: 'TRUYỀN THỐNG QĐNDVN' },
  { id: 'hai-quan', label: 'TRUYỀN THỐNG QUÂN CHỦNG HẢI QUÂN' },
  { id: 'lu-doan-83', label: 'TRUYỀN THỐNG LỮ ĐOÀN 83' },
]

export const TraditionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('qndvn')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Timeline data for historical milestones
  const timelineData: TimelineCardProps[] = [
    {
      year: '1944',
      title: 'Khai sinh',
      description: '22/12/1944: Thành lập Đội Việt Nam Tuyên truyền Giải phóng quân với 34 chiến sĩ. Tiền thân của QĐNDVN dưới sự chỉ huy của Đại tướng Võ Nguyên Giáp.'
    },
    {
      year: '1945',
      title: 'Tổng khởi nghĩa Cách mạng',
      description: 'Quân đội cùng toàn dân giành chính quyền trên cả nước trong cuộc Tổng khởi nghĩa Cách mạng Tháng Tám. Đổi tên thành Vệ quốc đoàn.'
    },
    {
      year: '1946-1954',
      title: 'Kháng chiến chống thực dân Pháp',
      description: 'Xây dựng quân đội chính quy từ chiến tranh du kích. Các chiến dịch lớn: Việt Bắc (1947), Biên Giới (1950), Tây Bắc (1952).'
    },
    {
      year: '1954',
      title: 'Chiến thắng Điện Biên Phủ',
      description: '"Lừng lẫy năm châu, chấn động địa cầu" - Chiến thắng lịch sử chấm dứt ách thống trị thực dân Pháp.'
    },
    {
      year: '1954-1975',
      title: 'Kháng chiến chống Mỹ cứu nước',
      description: 'Miền Bắc xây dựng quân đội chính quy hiện đại, Miền Nam tiến hành chiến tranh nhân dân quân-dân kết hợp. Các mốc lớn: 1968 Tổng tiến công Tết Mậu Thân, 1972 Chiến thắng "Điện Biên Phủ trên không", 30/4/1975 Chiến dịch Hồ Chí Minh giải phóng miền Nam.'
    },
    {
      year: '1975-1989',
      title: 'Chiến tranh biên giới',
      description: 'Bảo vệ biên giới Tây Nam và biên giới phía Bắc. Thực hiện nghĩa vụ quốc tế tại Campuchia. Giữ vững chủ quyền và ổn định đất nước sau chiến tranh.'
    },
    {
      year: '1990-nay',
      title: 'Xây dựng quân đội hiện đại',
      description: 'Xây dựng quân đội cách mạng - chính quy - tinh nhuệ - từng bước hiện đại. Tham gia gìn giữ hòa bình Liên Hợp Quốc, phòng chống thiên tai, cứu hộ cứu nạn, bảo vệ chủ quyền biển đảo và không gian mạng.'
    }
  ]

  // Timeline data for honors
  const honorsData: TimelineCardProps[] = [
    {
      year: '1950',
      title: 'Huân chương Sao Vàng',
      description: 'Huân chương cao quý nhất của Nhà nước Việt Nam. Trao tặng vì công lao đặc biệt xuất sắc.',
      medalImage: '/src/assets/HCSV.png',
      medalAlt: 'Huân chương Sao Vàng'
    },
    {
      year: '1955',
      title: 'Huân chương Hồ Chí Minh',
      description: 'Ghi nhận thành tích to lớn trong kháng chiến và xây dựng đất nước.',
      medalImage: '/src/assets/HCHCM.png',
      medalAlt: 'Huân chương Hồ Chí Minh'
    },
    {
      year: '1960-1975',
      title: 'Huân chương Quân công & Chiến công',
      description: 'Huân chương Quân công (hạng Nhất, Nhì, Ba) và Huân chương Chiến công trao tặng cho các thành tích xuất sắc trong chiến đấu.',
      medalImage: '/src/assets/HCQC.png',
      medalAlt: 'Huân chương Quân công'
    },
    {
      year: '1975',
      title: 'Danh hiệu Anh hùng Lực lượng Vũ trang Nhân dân',
      description: 'Phong tặng cho nhiều tập thể, cá nhân sau Đại thắng mùa Xuân lịch sử.',
      medalImage: '/src/assets/AHLLVTND.png',
      medalAlt: 'AHLLVTND'
    },
    {
      year: '1984',
      title: 'Huân chương Độc lập',
      description: 'Ghi nhận đóng góp đặc biệt cho sự nghiệp cách mạng của đất nước.',
      medalImage: '/src/assets/HCĐL.png',
      medalAlt: 'HCĐL'
    },
    {
      year: '2004',
      title: 'Huân chương Sao Vàng (lần 2)',
      description: 'Trao tặng lần thứ hai cho QĐNDVN, khẳng định vai trò và công lao to lớn của quân đội trong sự nghiệp xây dựng và bảo vệ Tổ quốc.',
      medalImage: '/src/assets/HCSV.png',
      medalAlt: 'HCSV'
    }
  ]

  // Ministry of Defense leaders data - using real LeaderProfile structure
  const ministryLeadersData = [
    {
      ...phanVanGiangProfile,
      // Legacy properties for backward compatibility with MinistryLeadersList
      title: phanVanGiangProfile.currentTitles[phanVanGiangProfile.currentTitles.length - 1],
      imageAlt: `Ảnh chân dung ${phanVanGiangProfile.name}`,
      rank: 'Đại tướng',
      birthYear: '1960',
      birthPlace: 'Tỉnh Ninh Bình',
      education: [
        'Học viện Lục quân',
        'Học viện Quốc phòng Việt Nam',
        'Cao cấp lý luận chính trị'
      ],
      achievements: [
        'Đóng góp quan trọng vào công tác hiện đại hóa quân đội',
        'Nâng cao năng lực sẵn sàng chiến đấu của các lực lượng vũ trang',
        'Đẩy mạnh hợp tác quốc phòng quốc tế'
      ],
      decorations: [
        'Huân chương Quân công hạng Nhất',
        'Huân chương Chiến công hạng Nhất',
        'Huy chương Quân kỳ quyết thắng'
      ]
    },
    {
      ...nguyenTrongNghiaProfile,
      // Legacy properties for backward compatibility with MinistryLeadersList
      title: nguyenTrongNghiaProfile.currentTitles[nguyenTrongNghiaProfile.currentTitles.length - 1],
      imageAlt: `Ảnh chân dung ${nguyenTrongNghiaProfile.name}`,
      rank: 'Đại tướng',
      birthYear: '1962',
      birthPlace: 'Tỉnh Đồng Tháp',
      education: [
        'Trường Sĩ quan Chỉ huy-Kỹ thuật Thông tin',
        'Học viện Chính trị',
        'Cao cấp lý luận chính trị'
      ],
      achievements: [
        'Đóng góp vào công tác xây dựng quân đội vững mạnh về chính trị',
        'Nâng cao chất lượng công tác đảng, công tác chính trị',
        'Đẩy mạnh công tác giáo dục truyền thống cách mạng'
      ],
      decorations: [
        'Huân chương Quân công hạng Nhất',
        'Huân chương Chiến công hạng Nhất',
        'Huy chương Quân kỳ quyết thắng'
      ]
    },
    {
      ...nguyenTanCuongProfile,
      // Legacy properties for backward compatibility with MinistryLeadersList
      title: nguyenTanCuongProfile.currentTitles[nguyenTanCuongProfile.currentTitles.length - 1],
      imageAlt: `Ảnh chân dung ${nguyenTanCuongProfile.name}`,
      rank: 'Đại tướng',
      birthYear: '1966',
      birthPlace: 'Tỉnh Ninh Bình',
      education: [
        'Trường Sĩ quan Lục quân 2',
        'Học viện Lục quân',
        'Học viện Quốc phòng',
        'Cao cấp lý luận chính trị'
      ],
      achievements: [
        'Đóng góp vào công tác xây dựng quân đội hiện đại',
        'Nâng cao năng lực chỉ huy, tham mưu chiến đấu',
        'Đẩy mạnh hợp tác quốc phòng quốc tế'
      ],
      decorations: [
        'Huân chương Quân công hạng Nhất',
        'Huân chương Chiến công hạng Nhất',
        'Huy chương Quân kỳ quyết thắng'
      ]
    }
  ]

  return (
    <MilitaryPageLayout 
      title={<h2>TRUYỀN THỐNG</h2>}
      className={isDialogOpen ? 'behind-modal' : ''}
      disableTopIcons={isDialogOpen}
    >
      {/* Tab Navigation - Horizontal */}
      <ButtonGroup
        options={TABS}
        selectedValue={activeTab}
        onSelect={setActiveTab}
        orientation="horizontal"
        variant="military"
        className="tab-navigation-horizontal"
      />

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'qndvn' && (
          <div className="tab-panel">
            {/* Hero Section - Emblem & Motto */}
            <div className="hero-section">
              <div className="emblem-placeholder">
                <div className="emblem-circle">
                  <img 
                    src="/src/assets/emblem-qdndvn.png" 
                    alt="QĐNDVN Emblem" 
                    className="emblem-image"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = target.nextElementSibling as HTMLElement;
                      target.style.display = 'none';
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="emblem-fallback">
                    <span className="emblem-text">QĐNDVN</span>
                  </div>
                </div>
              </div>
              <div className="motto-text-serious">
                "QUÂN ĐỘI TA TRUNG VỚI ĐẢNG, HIẾU VỚI DÂN,
                SẴN SÀNG CHIẾN ĐẤU HY SINH VÌ 
                ĐỘC LẬP, TỰ DO CỦA TỔ QUỐC,
                VÌ CHỦ NGHĨA XÃ HỘI.
                NHIỆM VỤ NÀO CŨNG HOÀN THÀNH,
                KHÓ KHĂN NÀO CŨNG VƯỢT QUA,
                KẺ THÙ NÀO CŨNG ĐÁNH THẮNG."
              </div>
            </div>

            {/* Accordion Sections */}
            <Accordion 
              items={[
                {
                  id: 'milestones',
                  title: 'CÁC MỐC SON LỊCH SỬ TIÊU BIỂU',
                  children: <TimelineList items={timelineData} />
                },
                {
                  id: 'honors',
                  title: 'CÁC HUÂN CHƯƠNG CAO QUÝ ĐƯỢC TRAO TẶNG',
                  children: <TimelineList items={honorsData} />
                },
                {
                  id: 'ministry-leaders',
                  title: 'THỦ TRƯỞNG BỘ QUỐC PHÒNG',
                  children: <MinistryLeadersList leaders={ministryLeadersData} onDialogStateChange={setIsDialogOpen} />
                }
              ]}
              allowMultiple={false}
            />
          </div>
        )}
        
        {activeTab === 'hai-quan' && (
          <div className="tab-panel placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon"></div>
              <h2>TRUYỀN THỐNG QUÂN CHỦNG HẢI QUÂN</h2>
              <p>Nội dung đang được phát triển...</p>
            </div>
          </div>
        )}

        {activeTab === 'lu-doan-83' && (
          <div className="tab-panel placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon"></div>
              <h2>TRUYỀN THỐNG LỮ ĐOÀN 83</h2>
              <p>Nội dung đang được phát triển...</p>
            </div>
          </div>
        )}
      </div>
    </MilitaryPageLayout>
  )
}
