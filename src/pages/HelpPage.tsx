import {
  BookOutlined,
  BulbOutlined,
  InfoCircleOutlined,
  PlayCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { Card, Col, Row, Space, Tag, Typography } from 'antd'
import { useI18n } from '../i18n'

const { Paragraph, Text, Title } = Typography

function HelpPage() {
  const { language, t } = useI18n()

  const copy =
    language === 'en'
      ? {
          eyebrow: 'User guide',
          title: 'How to use English Path',
          intro:
            'This page helps you move through the app in the simplest order: choose a grade, open a lesson, review vocabulary, and start practice.',
          quickStart: 'Quick start',
          menuGuide: 'Main sections',
          tipsTitle: 'Tips for teachers',
          aboutTitle: 'About app',
          step1Title: 'Choose the grade you want to teach',
          step1Copy:
            'Use the grade switcher in the topbar to move between Grade 6 and Grade 9 before opening any content.',
          step2Title: 'Open Lessons to review the unit',
          step2Copy:
            'Lessons shows grammar focus, vocabulary, class activities, projects, and linked words for each topic.',
          step3Title: 'Open the Vocabulary tab to look up words',
          step3Copy:
            'You can search by keyword, open word details, and review meaning, IPA, and example sentences quickly.',
          step4Title: 'Use Practice for reinforcement',
          step4Copy:
            'Practice is where you move from reading to recall with word practice and passage quiz activities.',
          lessonsTitle: 'Lessons',
          lessonsCopy:
            'Use this area to read unit content, search vocabulary, add teacher vocabulary, import word lists, and save notes by topic.',
          practiceTitle: 'Practice',
          practiceCopy:
            'Use Word Practice for ready-made review and Passage Quiz Generator when you want to create exercises from your own text.',
          settingsTitle: 'Settings',
          settingsCopy:
            'Use the gear button in the topbar to switch language, theme, and font size for easier classroom use.',
          teacherTip1: 'Sign in with GitHub before adding, editing, importing, or deleting vocabulary.',
          teacherTip2: 'Teacher-added words can be edited or deleted from the word detail panel in Lessons.',
          teacherTip3: 'When importing vocabulary, leave IPA blank if you want the system to auto-fill it.',
          teacherTip4: 'Use Teacher Notes in Lessons to save short reminders for each topic.',
          aboutCopy:
            'English Path is a lightweight teaching and review tool for lower secondary English, combining lessons, vocabulary lookup, practice, and teacher tools in one place.',
          guideTag: 'Guide',
          menuTag: 'Sections',
          tipsTag: 'Teacher tips',
          aboutTag: 'About',
        }
      : {
          eyebrow: 'Hướng dẫn sử dụng',
          title: 'Cách dùng English Path',
          intro:
            'Trang này giúp bạn dùng app theo thứ tự đơn giản nhất: chọn khối, mở bài học, xem từ vựng và bắt đầu luyện tập.',
          quickStart: 'Bắt đầu nhanh',
          menuGuide: 'Các khu chính',
          tipsTitle: 'Mẹo dùng cho giáo viên',
          aboutTitle: 'Về ứng dụng',
          step1Title: 'Chọn khối cần dạy',
          step1Copy:
            'Dùng bộ chuyển khối trên topbar để đổi giữa Lớp 6 đến Lớp 9 trước khi mở nội dung.',
          step2Title: 'Mở Lessons để xem bài',
          step2Copy:
            'Lessons hiển thị trọng tâm ngữ pháp, từ vựng, hoạt động trên lớp, project và các từ liên kết theo từng chủ điểm.',
          step3Title: 'Mở tab Từ vựng để tra nhanh',
          step3Copy:
            'Bạn có thể tìm theo từ khóa, mở chi tiết từng từ và xem nghĩa, phiên âm, câu ví dụ ngay trong cùng một chỗ.',
          step4Title: 'Dùng Practice để củng cố',
          step4Copy:
            'Practice là nơi chuyển từ xem bài sang ghi nhớ, với Word Practice và Passage Quiz Generator.',
          lessonsTitle: 'Lessons',
          lessonsCopy:
            'Dùng khu này để xem bài học, tra từ vựng, thêm từ giáo viên, import danh sách từ và lưu ghi chú theo chủ điểm.',
          practiceTitle: 'Practice',
          practiceCopy:
            'Dùng Word Practice để ôn tập có sẵn, và Passage Quiz Generator khi muốn tạo bài tập từ đoạn văn của riêng bạn.',
          settingsTitle: 'Cài đặt',
          settingsCopy:
            'Dùng nút bánh răng trên topbar để đổi ngôn ngữ, giao diện và cỡ chữ cho phù hợp khi dạy học.',
          teacherTip1: 'Hãy đăng nhập GitHub trước khi thêm, sửa, import hoặc xóa từ vựng.',
          teacherTip2: 'Từ do giáo viên thêm có thể sửa hoặc xóa ngay trong khung chi tiết từ ở Lessons.',
          teacherTip3: 'Khi import từ vựng, có thể để trống cột IPA nếu muốn hệ thống tự điền.',
          teacherTip4: 'Dùng Ghi chú giáo viên trong Lessons để lưu nhanh lưu ý cho từng chủ điểm.',
          aboutCopy:
            'English Path là công cụ gọn nhẹ hỗ trợ dạy và ôn tập tiếng Anh THCS, kết hợp bài học, tra từ, luyện tập và tiện ích cho giáo viên trong một nơi.',
          guideTag: 'Hướng dẫn',
          menuTag: 'Chức năng',
          tipsTag: 'Mẹo dùng',
          aboutTag: 'Giới thiệu',
        }

  const quickSteps = [
    {
      icon: <BookOutlined />,
      title: copy.step1Title,
      description: copy.step1Copy,
    },
    {
      icon: <BookOutlined />,
      title: copy.step2Title,
      description: copy.step2Copy,
    },
    {
      icon: <BulbOutlined />,
      title: copy.step3Title,
      description: copy.step3Copy,
    },
    {
      icon: <PlayCircleOutlined />,
      title: copy.step4Title,
      description: copy.step4Copy,
    },
  ]

  const menuSections = [
    {
      tag: copy.guideTag,
      color: 'cyan',
      icon: <BookOutlined />,
      title: copy.lessonsTitle,
      description: copy.lessonsCopy,
    },
    {
      tag: copy.menuTag,
      color: 'geekblue',
      icon: <PlayCircleOutlined />,
      title: copy.practiceTitle,
      description: copy.practiceCopy,
    },
    {
      tag: copy.menuTag,
      color: 'gold',
      icon: <SettingOutlined />,
      title: copy.settingsTitle,
      description: copy.settingsCopy,
    },
  ]

  const teacherTips = [copy.teacherTip1, copy.teacherTip2, copy.teacherTip3, copy.teacherTip4]

  return (
    <Space direction="vertical" size={20} className="full-width">
      <Card className="hero-card highlight-card" bordered={false}>
        <Space direction="vertical" size={16} className="full-width">
          <Tag className="hero-tag" bordered={false}>
            {copy.eyebrow}
          </Tag>
          <Title className="hero-title">{copy.title}</Title>
          <Paragraph className="hero-copy">{copy.intro}</Paragraph>
        </Space>
      </Card>

      <Row gutter={[18, 18]}>
        <Col xs={24} xl={14}>
          <Card className="content-card help-guide-card" bordered={false}>
            <Space direction="vertical" size={16} className="full-width">
              <div className="section-heading">
                <Title level={3}>{copy.quickStart}</Title>
                <Paragraph>{copy.intro}</Paragraph>
              </div>

              <div className="help-step-list">
                {quickSteps.map((step) => (
                  <div className="help-step-item" key={step.title}>
                    <div className="help-step-icon">{step.icon}</div>
                    <div>
                      <Text strong>{step.title}</Text>
                      <Paragraph className="settings-copy">{step.description}</Paragraph>
                    </div>
                  </div>
                ))}
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Space direction="vertical" size={16} className="full-width">
            {menuSections.map((section) => (
              <Card className="content-card" bordered={false} key={section.title}>
                <Space direction="vertical" size={12} className="full-width">
                  <Tag color={section.color}>{section.tag}</Tag>
                  <div className="settings-heading">
                    {section.icon}
                    <Title level={4}>{section.title}</Title>
                  </div>
                  <Paragraph className="settings-copy">{section.description}</Paragraph>
                </Space>
              </Card>
            ))}

            <Card className="content-card" bordered={false}>
              <Space direction="vertical" size={12} className="full-width">
                <Tag color="purple">{copy.tipsTag}</Tag>
                <div className="settings-heading">
                  <BulbOutlined />
                  <Title level={4}>{copy.tipsTitle}</Title>
                </div>
                <Space direction="vertical" size={8} className="full-width">
                  {teacherTips.map((tip) => (
                    <Paragraph className="settings-copy" key={tip}>
                      - {tip}
                    </Paragraph>
                  ))}
                </Space>
              </Space>
            </Card>

            <Card className="content-card" bordered={false}>
              <Space direction="vertical" size={12} className="full-width">
                <Tag color="volcano">{copy.aboutTag}</Tag>
                <div className="settings-heading">
                  <InfoCircleOutlined />
                  <Title level={4}>{copy.aboutTitle}</Title>
                </div>
                <Paragraph className="settings-copy">{copy.aboutCopy}</Paragraph>
                <Paragraph className="settings-copy settings-about-note">
                  {t('common.appOwner')}
                </Paragraph>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </Space>
  )
}

export default HelpPage
