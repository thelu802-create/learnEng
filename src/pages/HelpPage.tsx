import {
  BookOutlined,
  BulbOutlined,
  InfoCircleOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons'
import { Card, Col, Row, Space, Tag, Typography } from 'antd'
import { useI18n } from '../i18n'

const { Paragraph, Text, Title } = Typography

function HelpPage() {
  const { language, t } = useI18n()

  const copy =
    language === 'en'
      ? {
          eyebrow: 'Help center',
          title: 'A clear guide for using English Path more smoothly',
          intro:
            'This section groups the app guide, study flow, and quick notes in one place so it stays easy to maintain as the project grows.',
          gettingStarted: 'Getting started',
          lessonsTitle: 'How to use Lessons',
          practiceTitle: 'How to use Practice',
          aboutTitle: 'About app',
          step1Title: 'Pick your grade first',
          step1Copy:
            'Use the topbar grade switcher to move between Grade 6 and Grade 9 before exploring content.',
          step2Title: 'Open Lessons to review',
          step2Copy:
            'Read grammar focus, vocabulary summaries, linked words, and project tasks for each unit.',
          step3Title: 'Use Practice to reinforce',
          step3Copy:
            'Review vocabulary with meaning, fill-in, and matching exercises after reading lessons.',
          lessonsCopy:
            'Lessons is best when you want to scan topics, compare vocabulary, and revisit unit structure by grade.',
          practiceCopy:
            'Practice is where you move from reading to recall, especially useful after opening a topic in Lessons.',
          aboutCopy:
            'English Path combines lesson browsing, vocabulary lookup, and direct practice in a lightweight interface for lower secondary English review.',
          guideTag: 'Guide',
          tipTag: 'Study flow',
          aboutTag: 'About',
        }
      : {
          eyebrow: 'Trung tâm hướng dẫn',
          title: 'Hướng dẫn sử dụng English Path',
          intro: 'Xem nhanh cách dùng app để chọn khối, mở bài học và bắt đầu luyện tập.',
          gettingStarted: 'Bắt đầu nhanh',
          lessonsTitle: 'Cách dùng Lessons',
          practiceTitle: 'Cách dùng Practice',
          aboutTitle: 'Về ứng dụng',
          step1Title: 'Chọn khối học trước',
          step1Copy:
            'Dùng bộ chuyển khối trên topbar để đổi giữa Lớp 6 đến Lớp 9 trước khi xem nội dung.',
          step2Title: 'Mở Lessons để ôn bài',
          step2Copy:
            'Xem ngữ pháp, tóm tắt từ vựng, cụm từ liên quan và project của từng bài học.',
          step3Title: 'Dùng Practice để củng cố',
          step3Copy:
            'Ôn lại từ vựng qua các dạng chọn nghĩa, điền từ và ghép cặp sau khi xem bài học.',
          lessonsCopy:
            'Lessons phù hợp khi bạn muốn xem tổng quan chủ đề, đối chiếu từ vựng và ôn lại cấu trúc từng bài theo khối.',
          practiceCopy:
            'Practice hợp với lúc cần chuyển từ đọc hiểu sang ghi nhớ và gọi lại từ vựng.',
          aboutCopy:
            'English Path kết hợp phần xem bài học, tra từ và luyện tập trong một giao diện gọn để ôn tập tiếng Anh THCS.',
          guideTag: 'Hướng dẫn',
          tipTag: 'Luồng học',
          aboutTag: 'Giới thiệu',
        }

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
                <Title level={3}>{copy.gettingStarted}</Title>
                <Paragraph>{copy.intro}</Paragraph>
              </div>

              <div className="help-step-list">
                <div className="help-step-item">
                  <div className="help-step-icon">
                    <QuestionCircleOutlined />
                  </div>
                  <div>
                    <Text strong>{copy.step1Title}</Text>
                    <Paragraph className="settings-copy">{copy.step1Copy}</Paragraph>
                  </div>
                </div>

                <div className="help-step-item">
                  <div className="help-step-icon">
                    <BookOutlined />
                  </div>
                  <div>
                    <Text strong>{copy.step2Title}</Text>
                    <Paragraph className="settings-copy">{copy.step2Copy}</Paragraph>
                  </div>
                </div>

                <div className="help-step-item">
                  <div className="help-step-icon">
                    <PlayCircleOutlined />
                  </div>
                  <div>
                    <Text strong>{copy.step3Title}</Text>
                    <Paragraph className="settings-copy">{copy.step3Copy}</Paragraph>
                  </div>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Space direction="vertical" size={16} className="full-width">
            <Card className="content-card" bordered={false}>
              <Space direction="vertical" size={12} className="full-width">
                <Tag color="cyan">{copy.guideTag}</Tag>
                <div className="settings-heading">
                  <BookOutlined />
                  <Title level={4}>{copy.lessonsTitle}</Title>
                </div>
                <Paragraph className="settings-copy">{copy.lessonsCopy}</Paragraph>
              </Space>
            </Card>

            <Card className="content-card" bordered={false}>
              <Space direction="vertical" size={12} className="full-width">
                <Tag color="geekblue">{copy.tipTag}</Tag>
                <div className="settings-heading">
                  <BulbOutlined />
                  <Title level={4}>{copy.practiceTitle}</Title>
                </div>
                <Paragraph className="settings-copy">{copy.practiceCopy}</Paragraph>
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
