import {
  BookOutlined,
  BulbOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
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
            'This page helps you move through the app in a simple order: choose a grade, open a lesson, review vocabulary, start practice, and keep track of weekly teaching tasks.',
          quickStart: 'Quick start',
          menuGuide: 'Main sections',
          menuGuideCopy:
            'These are the areas you will use most often while teaching, reviewing content, and organizing your week.',
          tipsTitle: 'Tips for teachers',
          aboutTitle: 'About app',
          step1Title: 'Choose the grade you want to teach',
          step1Copy:
            'Use the grade switcher in the topbar to move between Grade 6 and Grade 9 before opening any content.',
          step2Title: 'Open Lessons to review the unit',
          step2Copy:
            'Lessons shows grammar focus, vocabulary, class activities, projects, and linked words for each topic.',
          step3Title: 'Use the Vocabulary area to manage words',
          step3Copy:
            'Search by keyword, open word details, review meaning, IPA, and examples, then add, edit, or delete teacher vocabulary when needed.',
          step4Title: 'Open Practice for reinforcement',
          step4Copy:
            'Practice is where you move from reading to recall with Word Practice and Passage Quiz Generator activities.',
          step5Title: 'Use Planner to track your week',
          step5Copy:
            'Planner helps you add teaching tasks, review what is due today, and mark work as done without losing sight of upcoming reminders.',
          lessonsTitle: 'Lessons',
          lessonsCopy:
            'Use this area to read unit content, search vocabulary, add teacher vocabulary, import word lists, edit teacher-added words, and save notes by topic.',
          practiceTitle: 'Practice',
          practiceCopy:
            'Use Word Practice for ready-made review and Passage Quiz Generator when you want to create exercises from your own text.',
          plannerTitle: 'Planner',
          plannerCopy:
            'Use Planner to add work for the week, separate today from upcoming tasks, and quickly check what has already been completed.',
          settingsTitle: 'Settings',
          settingsCopy:
            'Use the gear button in the topbar to switch language, theme, and font size for easier classroom use.',
          teacherTip1:
            'Sign in with GitHub before adding, editing, importing, or deleting vocabulary, notes, and planner tasks.',
          teacherTip2:
            'Teacher-added words can be edited or deleted from the word detail panel in Lessons.',
          teacherTip3:
            'When importing vocabulary, you can leave IPA blank if you want the system to fill it automatically.',
          teacherTip4: 'Use Teacher Notes in Lessons to save short reminders for each topic.',
          teacherTip5:
            'Planner tasks are saved to your account, so you can review the same schedule after signing in again.',
          aboutCopy:
            'English Path is a lightweight teaching and review tool for lower secondary English, combining lessons, vocabulary lookup, practice, reminders, and teacher tools in one place.',
          guideTag: 'Guide',
          menuTag: 'Sections',
          tipsTag: 'Teacher tips',
          aboutTag: 'About',
        }
      : {
          eyebrow: 'Hướng dẫn sử dụng',
          title: 'Cách dùng English Path',
          intro:
            'Trang này giúp bạn dùng app theo thứ tự đơn giản: chọn khối, mở bài học, xem từ vựng, luyện tập và theo dõi công việc trong tuần.',
          quickStart: 'Bắt đầu nhanh',
          menuGuide: 'Các mục chính',
          menuGuideCopy:
            'Đây là những phần bạn sẽ dùng thường xuyên nhất khi dạy học, ôn tập và sắp xếp công việc trong tuần.',
          tipsTitle: 'Mẹo dùng cho giáo viên',
          aboutTitle: 'Về ứng dụng',
          step1Title: 'Chọn khối cần dạy',
          step1Copy:
            'Dùng bộ chuyển khối trên topbar để đổi giữa Lớp 6 đến Lớp 9 trước khi mở nội dung.',
          step2Title: 'Mở Lessons để xem bài',
          step2Copy:
            'Lessons hiển thị trọng tâm ngữ pháp, từ vựng, hoạt động trên lớp, project và các từ liên kết theo từng chủ điểm.',
          step3Title: 'Dùng khu Từ vựng để quản lý từ',
          step3Copy:
            'Bạn có thể tìm theo từ khóa, mở chi tiết từ, xem nghĩa, phiên âm, ví dụ, rồi thêm, sửa hoặc xóa từ do giáo viên tạo.',
          step4Title: 'Dùng Practice để củng cố',
          step4Copy:
            'Practice là nơi chuyển từ xem bài sang ghi nhớ, với Word Practice và Passage Quiz Generator.',
          step5Title: 'Dùng Planner để theo dõi công việc',
          step5Copy:
            'Planner giúp bạn thêm việc trong tuần, xem các việc đến hạn hôm nay và đánh dấu hoàn thành mà vẫn theo dõi được các việc sắp tới.',
          lessonsTitle: 'Lessons',
          lessonsCopy:
            'Dùng khu này để xem bài học, tra từ vựng, thêm từ giáo viên, import danh sách từ, sửa xóa từ do giáo viên thêm và lưu ghi chú theo chủ điểm.',
          practiceTitle: 'Practice',
          practiceCopy:
            'Dùng Word Practice để ôn tập có sẵn, và Passage Quiz Generator khi muốn tạo bài tập từ đoạn văn của riêng bạn.',
          plannerTitle: 'Planner',
          plannerCopy:
            'Dùng Planner để thêm công việc trong tuần, tách việc hôm nay, việc sắp tới và kiểm tra nhanh những việc đã xong.',
          settingsTitle: 'Cài đặt',
          settingsCopy:
            'Dùng nút bánh răng trên topbar để đổi ngôn ngữ, giao diện và cỡ chữ cho phù hợp khi dạy học.',
          teacherTip1:
            'Hãy đăng nhập GitHub trước khi thêm, sửa, import hoặc xóa từ vựng, ghi chú và nhắc việc.',
          teacherTip2:
            'Từ do giáo viên thêm có thể sửa hoặc xóa ngay trong khung chi tiết từ ở Lessons.',
          teacherTip3:
            'Khi import từ vựng, bạn có thể để trống cột IPA nếu muốn hệ thống tự điền.',
          teacherTip4:
            'Dùng Ghi chú giáo viên trong Lessons để lưu nhanh lưu ý cho từng chủ điểm.',
          teacherTip5:
            'Nhắc việc trong Planner được lưu theo tài khoản, nên có thể xem lại sau khi đăng nhập.',
          aboutCopy:
            'English Path là công cụ gọn nhẹ hỗ trợ dạy và ôn tập tiếng Anh THCS, kết hợp bài học, tra từ, luyện tập, nhắc việc và tiện ích cho giáo viên trong một nơi.',
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
    {
      icon: <CalendarOutlined />,
      title: copy.step5Title,
      description: copy.step5Copy,
    },
  ]

  const menuSections = [
    {
      tag: copy.guideTag,
      tagClassName: 'help-section-tag-cyan',
      icon: <BookOutlined />,
      title: copy.lessonsTitle,
      description: copy.lessonsCopy,
    },
    {
      tag: copy.menuTag,
      tagClassName: 'help-section-tag-geekblue',
      icon: <PlayCircleOutlined />,
      title: copy.practiceTitle,
      description: copy.practiceCopy,
    },
    {
      tag: copy.menuTag,
      tagClassName: 'help-section-tag-green',
      icon: <CalendarOutlined />,
      title: copy.plannerTitle,
      description: copy.plannerCopy,
    },
    {
      tag: copy.menuTag,
      tagClassName: 'help-section-tag-gold',
      icon: <SettingOutlined />,
      title: copy.settingsTitle,
      description: copy.settingsCopy,
    },
  ]

  const teacherTips = [
    copy.teacherTip1,
    copy.teacherTip2,
    copy.teacherTip3,
    copy.teacherTip4,
    copy.teacherTip5,
  ]

  return (
    <Space orientation="vertical" size={20} className="full-width">
      <Card className="hero-card highlight-card help-hero-card" variant="borderless">
        <Space orientation="vertical" size={14} className="full-width">
          <Tag className="hero-tag" variant="filled">
            {copy.eyebrow}
          </Tag>
          <Title className="hero-title">{copy.title}</Title>
          <Paragraph className="hero-copy">{copy.intro}</Paragraph>
        </Space>
      </Card>

      <Row gutter={[18, 18]}>
        <Col xs={24} xl={14}>
          <Card className="content-card help-guide-card" variant="borderless">
            <Space orientation="vertical" size={16} className="full-width">
              <div className="section-heading">
                <Title level={3}>{copy.quickStart}</Title>
                <Paragraph>{copy.intro}</Paragraph>
              </div>

              <div className="help-step-list">
                {quickSteps.map((step, index) => (
                  <div className="help-step-item" key={step.title}>
                    <div className="help-step-icon">{step.icon}</div>
                    <div>
                      <div className="help-step-head">
                        <Tag variant="filled" className="help-step-badge">
                          {language === 'en' ? `Step ${index + 1}` : `Bước ${index + 1}`}
                        </Tag>
                        <Text strong>{step.title}</Text>
                      </div>
                      <Paragraph className="settings-copy">{step.description}</Paragraph>
                    </div>
                  </div>
                ))}
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Space orientation="vertical" size={16} className="full-width help-side-stack">
            <Card className="content-card help-section-card" variant="borderless">
              <Space orientation="vertical" size={12} className="full-width">
                <Tag variant="filled" className="help-section-tag help-section-tag-blue">
                  {copy.menuTag}
                </Tag>
                <div className="settings-heading">
                  <InfoCircleOutlined />
                  <Title level={4}>{copy.menuGuide}</Title>
                </div>
                <Paragraph className="settings-copy help-section-copy">{copy.menuGuideCopy}</Paragraph>
              </Space>
            </Card>

            {menuSections.map((section) => (
              <Card className="content-card help-section-card" variant="borderless" key={section.title}>
                <Space orientation="vertical" size={12} className="full-width">
                  <Tag variant="filled" className={`help-section-tag ${section.tagClassName}`}>
                    {section.tag}
                  </Tag>
                  <div className="settings-heading">
                    {section.icon}
                    <Title level={4}>{section.title}</Title>
                  </div>
                  <Paragraph className="settings-copy help-section-copy">{section.description}</Paragraph>
                </Space>
              </Card>
            ))}

            <Card className="content-card help-section-card help-tips-card" variant="borderless">
              <Space orientation="vertical" size={12} className="full-width">
                <Tag variant="filled" className="help-section-tag help-section-tag-purple">
                  {copy.tipsTag}
                </Tag>
                <div className="settings-heading">
                  <BulbOutlined />
                  <Title level={4}>{copy.tipsTitle}</Title>
                </div>
                <div className="help-tips-list">
                  {teacherTips.map((tip) => (
                    <div className="help-tip-item" key={tip}>
                      <CheckCircleOutlined />
                      <Paragraph className="settings-copy">{tip}</Paragraph>
                    </div>
                  ))}
                </div>
              </Space>
            </Card>

            <Card className="content-card help-section-card" variant="borderless">
              <Space orientation="vertical" size={12} className="full-width">
                <Tag variant="filled" className="help-section-tag help-section-tag-volcano">
                  {copy.aboutTag}
                </Tag>
                <div className="settings-heading">
                  <InfoCircleOutlined />
                  <Title level={4}>{copy.aboutTitle}</Title>
                </div>
                <Paragraph className="settings-copy help-section-copy">{copy.aboutCopy}</Paragraph>
                <Paragraph className="settings-copy settings-about-note">{t('common.appOwner')}</Paragraph>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </Space>
  )
}

export default HelpPage
