import { CheckCircleOutlined } from '@ant-design/icons'
import { Card, Col, List, Progress, Row, Space, Typography } from 'antd'
import { useI18n } from '../i18n'
import type { GradeContent, GradeKey } from '../types'

const { Title, Paragraph, Text } = Typography

interface ProgressPageProps {
  selectedGrade: GradeKey
  currentGrade: GradeContent
}

function ProgressPage({ selectedGrade, currentGrade }: ProgressPageProps) {
  const { t, gradeLabel } = useI18n()
  const milestones: string[] = [t('progress.item1'), t('progress.item2'), t('progress.item3'), t('progress.item4')]

  return (
    <Row gutter={[18, 18]}>
      <Col xs={24} xl={10}>
        <Card className="content-card progress-card" bordered={false}>
          <Space direction="vertical" size={14} className="full-width">
            <Text className="eyebrow">{t('progress.eyebrow')}</Text>
            <Title level={2}>{gradeLabel(selectedGrade)}</Title>
            <Progress
              percent={currentGrade.progress}
              strokeColor="#2a9d8f"
              trailColor="#e8eef2"
            />
            <Paragraph>
              {t('progress.description', { grade: gradeLabel(selectedGrade).toLowerCase() })}
            </Paragraph>
          </Space>
        </Card>
      </Col>
      <Col xs={24} xl={14}>
        <Card className="content-card" bordered={false}>
          <Space direction="vertical" size={16} className="full-width">
            <Title level={3}>{t('progress.milestones')}</Title>
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
