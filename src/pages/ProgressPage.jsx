import { CheckCircleOutlined } from '@ant-design/icons'
import { Card, Col, List, Progress, Row, Space, Typography } from 'antd'

const { Title, Paragraph, Text } = Typography

const milestones = [
  'Hoàn thành toàn bộ từ vựng chủ đề',
  'Ôn tập ngữ pháp trọng tâm',
  'Làm 3 bài luyện tập theo kỹ năng',
  'Hoàn thành 1 dự án cuối chủ đề',
]

function ProgressPage({ selectedGrade, currentGrade }) {
  return (
    <Row gutter={[18, 18]}>
      <Col xs={24} xl={10}>
        <Card className="content-card progress-card" bordered={false}>
          <Space direction="vertical" size={14} className="full-width">
            <Text className="eyebrow">Tiến độ hiện tại</Text>
            <Title level={2}>{selectedGrade}</Title>
            <Progress
              percent={currentGrade.progress}
              strokeColor="#2a9d8f"
              trailColor="#e8eef2"
            />
            <Paragraph>
              Mức hoàn thành giả lập theo nội dung đã học trong khối{' '}
              {selectedGrade.toLowerCase()}.
            </Paragraph>
          </Space>
        </Card>
      </Col>
      <Col xs={24} xl={14}>
        <Card className="content-card" bordered={false}>
          <Space direction="vertical" size={16} className="full-width">
            <Title level={3}>Mốc cần hoàn thành</Title>
            <List
              dataSource={milestones}
              renderItem={(item) => (
                <List.Item className="skill-item">
                  <CheckCircleOutlined className="accent-icon" />
                  <Text>{item}</Text>
                </List.Item>
              )}
            />
          </Space>
        </Card>
      </Col>
    </Row>
  )
}

export default ProgressPage
