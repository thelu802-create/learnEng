import { memo } from 'react'
import { Card, Col, Row, Tag, Typography } from 'antd'
import type { ReactNode } from 'react'

const { Text } = Typography

interface PlannerOverviewGridProps {
  items: Array<{
    key: string
    title: string
    value: number
    tone: string
    icon: ReactNode
  }>
}

function PlannerOverviewGrid({ items }: PlannerOverviewGridProps) {
  return (
    <Row gutter={[14, 14]}>
      {items.map((item) => (
        <Col xs={12} lg={6} key={item.key}>
          <Card className={`content-card planner-overview-card planner-overview-${item.key}`} variant="borderless">
            <div className="planner-overview-head">
              <span className={`planner-overview-icon tone-${item.tone}`}>{item.icon}</span>
              <Tag color={item.tone}>{item.value}</Tag>
            </div>
            <Text className="planner-overview-label">{item.title}</Text>
          </Card>
        </Col>
      ))}
    </Row>
  )
}

export default memo(PlannerOverviewGrid)
