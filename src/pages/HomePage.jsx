import {
  BookOutlined,
  FileTextOutlined,
  RiseOutlined,
  SoundOutlined,
} from '@ant-design/icons'
import { Button, Card, Col, Progress, Row, Space, Statistic, Tag, Typography } from 'antd'

const { Title, Paragraph, Text } = Typography

function HomePage({ selectedGrade, currentGrade, onOpenLessons, onOpenPractice }) {
  return (
    <Space direction="vertical" size={20} className="full-width">
      <Card className="hero-card" bordered={false}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} lg={14}>
            <Space direction="vertical" size={16}>
              <Tag className="hero-tag" bordered={false}>
                Học tiếng Anh theo khối THCS
              </Tag>
              <Title className="hero-title">Bố cục gọn hơn, học dễ theo hơn</Title>
              <Paragraph className="hero-copy">
                Sidebar bên trái giữ phần điều hướng chính, còn chọn lớp được đưa lên trên
                khu nội dung để học sinh nhìn thấy ngay khi vào web.
              </Paragraph>
              <Space wrap>
                <Button type="primary" size="large" onClick={onOpenLessons}>
                  Vào bài học
                </Button>
                <Button size="large" className="outline-button" onClick={onOpenPractice}>
                  Mở luyện tập
                </Button>
              </Space>
            </Space>
          </Col>
          <Col xs={24} lg={10}>
            <div className="hero-showcase">
              <div className="hero-badge-card">
                <Text strong>{selectedGrade}</Text>
                <Progress
                  percent={currentGrade.progress}
                  strokeColor="#2a9d8f"
                  showInfo={false}
                />
                <Text>{currentGrade.level}</Text>
              </div>
              <div className="hero-grid">
                <div>
                  <BookOutlined />
                  <span>4 khối lớp</span>
                </div>
                <div>
                  <SoundOutlined />
                  <span>4 kỹ năng</span>
                </div>
                <div>
                  <FileTextOutlined />
                  <span>Bài học rõ ràng</span>
                </div>
                <div>
                  <RiseOutlined />
                  <span>Tiến độ theo dõi</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card className="stat-card" bordered={false}>
            <Statistic title="Khối lớp" value="4" suffix="mức" />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="stat-card" bordered={false}>
            <Statistic title="Chủ đề mẫu" value="16" suffix="bài" />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="stat-card" bordered={false}>
            <Statistic title="Bài tập" value="12" suffix="mẫu" />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="stat-card" bordered={false}>
            <Statistic title="Tiến độ lớp" value={currentGrade.progress} suffix="%" />
          </Card>
        </Col>
      </Row>
    </Space>
  )
}

export default HomePage
