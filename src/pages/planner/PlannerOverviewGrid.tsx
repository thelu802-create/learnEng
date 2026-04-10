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
  activeKey?: string
  onCardClick?: (key: string) => void
}

function PlannerOverviewGrid({ items, activeKey, onCardClick }: PlannerOverviewGridProps) {
  return (
    <Row gutter={[14, 14]}>
      {items.map((item) => (
        <Col xs={12} lg={6} key={item.key}>
          <Card
            className={[
              'content-card planner-overview-card',
              `planner-overview-${item.key}`,
              onCardClick ? 'planner-overview-clickable' : '',
              activeKey === item.key ? 'planner-overview-active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            variant="borderless"
            onClick={onCardClick ? () => onCardClick(item.key) : undefined}
          >
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
