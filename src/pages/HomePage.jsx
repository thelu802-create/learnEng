import {
  ArrowRightOutlined,
  BookOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  RiseOutlined,
  SoundOutlined,
} from '@ant-design/icons'
import { Button, Card, Col, Progress, Row, Space, Statistic, Tag, Typography } from 'antd'

const { Title, Paragraph, Text } = Typography

function HomePage({ selectedGrade, currentGrade, onOpenLessons, onOpenPractice }) {
  const topicCount = currentGrade.vocabularyTopics.length
  const wordCount = currentGrade.vocabularyTopics.reduce((total, topic) => total + topic.words.length, 0)
  const skillCount = currentGrade.skills.length
  const unitCount = currentGrade.units.length

  return (
    <Space direction="vertical" size={20} className="full-width">
      <Card className="hero-card home-hero-card" bordered={false}>
        <Row gutter={[28, 28]} align="middle">
          <Col xs={24} xl={14}>
            <Space direction="vertical" size={18} className="full-width">
              <Tag className="hero-tag" bordered={false}>
                Lộ trình học tiếng Anh THCS
              </Tag>

              <div className="home-hero-copy">
                <Text className="home-hero-kicker">{selectedGrade}</Text>
                <Title className="hero-title">Học tiếng Anh theo từng chủ điểm, dễ xem và dễ ôn hơn</Title>
                <Paragraph className="hero-copy">
                  Xem bài học, tra từ vựng và luyện tập ngay trên cùng một trang, phù hợp để ôn
                  lại kiến thức theo từng khối THCS.
                </Paragraph>
              </div>

              <Space wrap size={12}>
                <Button type="primary" size="large" onClick={onOpenLessons}>
                  Khám phá bài học
                </Button>
                <Button size="large" className="outline-button" onClick={onOpenPractice}>
                  Bắt đầu luyện tập
                </Button>
              </Space>

              <div className="home-hero-points">
                <div className="home-hero-point">
                  <CheckCircleOutlined />
                  <span>Tra từ vựng toàn bộ các khối ngay trên một màn hình</span>
                </div>
                <div className="home-hero-point">
                  <CheckCircleOutlined />
                  <span>Ba kiểu luyện tập giúp nhớ từ theo nghĩa, ngữ cảnh và cặp ghép</span>
                </div>
              </div>
            </Space>
          </Col>

          <Col xs={24} xl={10}>
            <div className="hero-showcase home-hero-showcase">
              <div className="home-progress-panel">
                <div className="home-progress-head">
                  <div>
                    <Text className="page-kicker">Khối đang chọn</Text>
                    <Title level={4} className="home-progress-title">
                      {selectedGrade}
                    </Title>
                  </div>
                  <Tag color="cyan">{currentGrade.level}</Tag>
                </div>

                <Paragraph className="home-progress-copy">{currentGrade.overview}</Paragraph>

                <div className="home-progress-bar">
                  <div className="home-progress-label">
                    <Text>Tiến độ hiện tại</Text>
                    <Text strong>{currentGrade.progress}%</Text>
                  </div>
                  <Progress percent={currentGrade.progress} strokeColor="#2a9d8f" showInfo={false} />
                </div>
              </div>

              <div className="hero-grid home-metric-grid">
                <div>
                  <BookOutlined />
                  <span>{unitCount} bài học trọng tâm</span>
                </div>
                <div>
                  <SoundOutlined />
                  <span>{wordCount} từ vựng đang có</span>
                </div>
                <div>
                  <FileTextOutlined />
                  <span>{topicCount} chủ đề tra cứu</span>
                </div>
                <div>
                  <RiseOutlined />
                  <span>{skillCount} nhóm kỹ năng</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card className="stat-card" bordered={false}>
            <Statistic title="Bài học" value={unitCount} suffix="mục" />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="stat-card" bordered={false}>
            <Statistic title="Từ vựng" value={wordCount} suffix="từ" />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="stat-card" bordered={false}>
            <Statistic title="Kỹ năng" value={skillCount} suffix="nhóm" />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="stat-card" bordered={false}>
            <Statistic title="Tiến độ" value={currentGrade.progress} suffix="%" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[18, 18]}>
        <Col xs={24} xl={15}>
          <Card className="content-card home-section-card" bordered={false}>
            <Space direction="vertical" size={16} className="full-width">
              <div className="section-heading">
                <Title level={3}>Hành trình học trong một nhịp rõ ràng</Title>
                <Paragraph>
                  Từ xem bài học đến luyện tập, mọi thứ đều được rút gọn để bạn học nhanh hơn mà
                  vẫn nắm chắc kiến thức.
                </Paragraph>
              </div>

              <div className="home-journey-grid">
                <div className="home-journey-card">
                  <Text className="home-journey-index">01</Text>
                  <Title level={5}>Xem chủ điểm học</Title>
                  <Paragraph>
                    Đọc nhanh nội dung từng bài, điểm ngữ pháp chính và phần project của mỗi chủ đề.
                  </Paragraph>
                </div>

                <div className="home-journey-card">
                  <Text className="home-journey-index">02</Text>
                  <Title level={5}>Tra và ghi nhớ từ vựng</Title>
                  <Paragraph>
                    Tìm từ theo nghĩa, ví dụ và đối chiếu luôn giữa các khối khi cần ôn lại.
                  </Paragraph>
                </div>

                <div className="home-journey-card">
                  <Text className="home-journey-index">03</Text>
                  <Title level={5}>Luyện tập theo ngữ cảnh</Title>
                  <Paragraph>
                    Làm bài chọn nghĩa, điền từ và ghép từ để nhớ cả phát âm lẫn cách dùng.
                  </Paragraph>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} xl={9}>
          <Card className="content-card highlight-card home-action-card" bordered={false}>
            <Space direction="vertical" size={16} className="full-width">
              <div className="section-heading">
                <Title level={3}>Đi tiếp từ đây</Title>
                <Paragraph>
                  Nếu muốn học có nhịp hơn, bạn nên vào bài học trước rồi sang luyện tập ngay sau đó.
                </Paragraph>
              </div>

              <button type="button" className="home-action-link" onClick={onOpenLessons}>
                <div>
                  <Text strong>Mở phần bài học</Text>
                  <Text className="home-action-copy">Xem chủ điểm, từ vựng và nội dung theo khối</Text>
                </div>
                <ArrowRightOutlined />
              </button>

              <button type="button" className="home-action-link" onClick={onOpenPractice}>
                <div>
                  <Text strong>Vào luyện tập</Text>
                  <Text className="home-action-copy">Ôn từ qua ba kiểu bài tập trực tiếp trên web</Text>
                </div>
                <ArrowRightOutlined />
              </button>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  )
}

export default HomePage
