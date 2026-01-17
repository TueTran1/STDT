import React from 'react'
import {
  LoadingState,
  ErrorState,
} from '../components/ui'
import { 
  RegulationGridItem,
  RegulationDialog
} from '../components/regulation'
import { MilitaryPageLayout } from '../components/layout'
import canhTungImage from '../assets/canh-tung.png'
import quanPhapImage from '../assets/quan-phap.png'
import emblemQdndvnImage from '../assets/emblem-qdndvn.png'

const REGULATIONS_DATA = [
  {
    id: '1',
    title: '10 LỜI THỀ DANH DỰ',
    // subtitle: 'Lời thề danh dự quân đội',
    content: `Chúng tôi, Quân nhân trong Quân đội nhân dân Việt Nam, lấy danh dự người chiến sĩ cách mạng, xin thề dưới lá cờ vinh quang của Tổ quốc:

1. Hy sinh tất cả vì Tổ quốc Việt Nam; dưới sự lãnh đạo của Đảng Cộng sản Việt Nam, phấn đấu thực hiện một nước Việt Nam hòa bình, độc lập và xã hội chủ nghĩa, góp phần tích cực vào cuộc đấu tranh của nhân dân thế giới vì hòa bình, độc lập dân tộc, dân chủ và chủ nghĩa xã hội.
"Xin thề"
2. Tuyệt đối phục tùng mệnh lệnh cấp trên; khi nhận bất cứ nhiệm vụ gì đều tận tâm, tận lực thi hành nhanh chóng và chính xác.
"Xin thề"
3. Không ngừng nâng cao tinh thần yêu nước xã hội chủ nghĩa, tinh thần quốc tế vô sản, rèn luyện ý chí chiến đấu kiên quyết và bền bỉ, thắng không kiêu, bại không nản, dù gian lao khổ hạnh cũng không sờn lòng, vào sống ra chết cũng không nản chí. Nhiệm vụ nào cũng hoàn thành, khó khăn nào cũng vượt qua, kẻ thù nào cũng đánh thắng.
"Xin thề"
4. Ra sức học tập nâng cao trình độ chính trị, quân sự, văn hóa, khoa học kỹ thuật, nghiệp vụ, triệt để chấp hành điều lệnh, điều lệ, rèn luyện tính tổ chức, tính kỷ luật và tác phong chính quy, xây dựng quân đội ngày càng hùng mạnh, luôn luôn sẵn sàng chiến đấu
"Xin thề"
5. Nêu cao tinh thần làm chủ tập thể xã hội chủ nghĩa, làm tròn nhiệm vụ chiến đấu bảo vệ tổ quốc, xây dựng chủ nghĩa xã hội và làm tròn nghĩa vụ quốc tế. Gương mẫu chấp hành và vận động nhân dân thực hiện mọi đường lối, chủ trương của Đảng, chính sách và luật pháp của Nhà nước.
"Xin thề"
6. Luôn luôn cảnh giác, tuyệt đối giữ bí mật quân sự và bí mật quốc gia. Nếu bị quân địch bắt, dù phải chịu cực hình tàn khốc thế nào cũng cương quyết một lòng trung thành với sự nghiệp cách mạng, không bao giờ phản bội xưng khai.
"Xin thề"
7. Đoàn kết chặt chẽ với nhau như ruột thịt trên tình thương yêu giai cấp; hết lòng giúp đỡ nhau lúc thường cũng như lúc ra trận; thực hiện toàn quân một ý chí.
"Xin thề"
8. Ra sức giữ gìn vũ khí trang bị, quyết không để hư hỏng hoặc rơi vào tay quân thù. Luôn nêu cao tinh thần bảo vệ của công, không tham ô, lãng phí.
"Xin thề"
9. Khi tiếp xúc với nhân dân làm đúng ba điều nên:\n- Kính trọng dân\n- Giúp đỡ dân\n- Bảo vệ dân\nvà ba điều răn:\n- Không lấy của dân\n- Không dọa nạt dân\n- Không quấy nhiễu dân\nĐể gây lòng tin cậy, yêu mến của nhân dân, thực hiện quân với dân một ý chí.\n"Xin thề"
10. Giữ vững phẩm chất tốt đẹp và truyền thống quyết chiến, quyết thắng của quân đội nhân dân, luôn tự phê bình và phê bình, không làm điều gì hại tới danh dự của quân đội và quốc thể nước Cộng hòa Xã hội chủ nghĩa Việt Nam.
"Xin thề"`,
  },
  {
    id: '2',
    title: '12 ĐIỀU KỶ LUẬT',
    // subtitle: 'Kỷ luật quân đội',
    content: `1. Không lấy cái kim, sợi chỉ của nhân dân.

2. Mua bán phải công bằng, sòng phẳng.


3. Mượn cái gì của nhân dân phải hỏi, dùng xong phải trả, làm hỏng, làm mất phải đền.

4. Đóng quân nhà dân không được gây phiền nhiễu cho nhân dân, phải gìn giữ nhà cửa sạch sẽ.

5. Phải nghiêm chỉnh chấp hành chính sách dân tộc, tôn trọng tự do, tín ngưỡng, phong tục tập quán của nhân dân.

6. Phải đoàn kết chặt chẽ với nhân dân, kính già, yêu trẻ, đứng đắn với phụ nữ.

7. Không được dọa nạt, đánh mắng nhân dân.

8. Phải bảo vệ tính mạng, tài sản của tập thể và Nhà nước.

9. Phải đoàn kết, tôn trọng và ủng hộ các cơ quan dân, chính, Đảng. Các lực lượng vũ trang địa phương.

10. Phải gương mẫu chấp hành mọi đường lối, chính sách của Đảng và pháp luật của Nhà nước.

11. Phải tích cực tuyên truyền, vận động và giúp đỡ nhân dân thực hiện mọi đường lối, chính sách của Đảng và pháp luật của Nhà nước.

12. Phải giữ bí mật và vận động nhân dân giữ bí mật của Nhà nước và Quân đội.`,
  },
  {
    id: '3',
    title: '9 NÉT TIÊU BIỂU',
    content: `1. Trung thành vô hạn với Tổ quốc Việt Nam xã hội chủ nghĩa, với Đảng, Nhà nước và Nhân dân.

2. Quyết chiến, quyết thắng, biết đánh và biết thắng.

3. Gắn bó máu thịt với Nhân dân, quân với dân một ý chí.

4. Đoàn kết nội bộ; cán bộ, chiến sĩ bình đẳng về quyền lợi và nghĩa vụ, thương yêu, giúp đỡ nhau, trên dưới đồng lòng, thống nhất ý chí và hành động.

5. Kỷ luật tự giác, nghiêm minh.

6. Độc lập, tự chủ, tự lực, tự cường, cần, kiệm xây dựng Quân đội, xây dựng đất nước, tôn trọng và bảo vệ của công.

7. Lối sống trong sạch, lành mạnh, có văn hóa, trung thực, khiêm tốn, giản dị, lạc quan.

8. Luôn luôn nêu cao tinh thần ham học hỏi, cầu tiến bộ, ứng xử chuẩn mực, tinh tế.

9. Đoàn kết quốc tế trong sáng, thủy chung, chí nghĩa, chí tình.`
  }
]

export const RegulationsPage: React.FC = () => {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedRegulation, setSelectedRegulation] = React.useState<typeof REGULATIONS_DATA[0] | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const handleRegulationClick = (regulation: typeof REGULATIONS_DATA[0]) => {
    setSelectedRegulation(regulation)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedRegulation(null)
  }

  const handleRefresh = () => {
    setLoading(true)
    setError(null)
    // Simulate refresh
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  if (loading) {
    return (
      <MilitaryPageLayout 
        title={<h2>ĐIỀU LỆNH QUẢN LÝ BỘ ĐỘI</h2>}
      >
        <LoadingState message="Đang tải điều lệnh..." />
      </MilitaryPageLayout>
    )
  }

  if (error) {
    return (
      <MilitaryPageLayout 
        title={<h2>ĐIỀU LỆNH QUẢN LÝ BỘ ĐỘI</h2>}
      >
        <ErrorState 
          message={error}
          onRetry={handleRefresh}
        />
      </MilitaryPageLayout>
    )
  }

  return (
    <MilitaryPageLayout 
      title={<h2>ĐIỀU LỆNH QUẢN LÝ BỘ ĐỘI</h2>}
      className={dialogOpen ? 'behind-modal' : ''}
      disableTopIcons={dialogOpen}
    >
      {/* Regulations Grid - Same as HomeScreen navigation-grid */}
      <div className="navigation-grid">
        {REGULATIONS_DATA.map((regulation, index) => {
          let iconImage;
          if (index === 0) {
            iconImage = <img src={canhTungImage} alt="Cành tung" width="32" height="32" />;
          } else if (index === 1) {
            iconImage = <img src={quanPhapImage} alt="Quân pháp" width="32" height="32" />;
          } else {
            iconImage = <img src={emblemQdndvnImage} alt="QĐNDVN" width="32" height="32" />;
          }
          
          return (
            <RegulationGridItem
              key={regulation.id}
              title={regulation.title}
              // subtitle={regulation.subtitle}
              icon={iconImage}
              onClick={() => handleRegulationClick(regulation)}
            />
          );
        })}
      </div>

      {/* Regulation Dialog */}
      <RegulationDialog
        isOpen={dialogOpen}
        onClose={handleCloseDialog}
        title={selectedRegulation?.title || ''}
        content={selectedRegulation?.content || ''}
        // tags={selectedRegulation?.tags}
      />
    </MilitaryPageLayout>
  )
}
