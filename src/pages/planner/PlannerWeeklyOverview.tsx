import { memo } from 'react'
import { Card, Progress, Typography } from 'antd'

const { Text } = Typography

interface WeeklyDayItem {
  key: string
  label: string
  dayNumber: number
  total: number
  completed: number
  pending: number
  isToday: boolean
}

interface PlannerWeeklyOverviewProps {
  weekOverviewLabel: string
  weekProgressLabel: string
  weekLoadLabel: string
  weekFocusLabel: string
  weekPendingLabel: string
  weekCompletedLabel: string
  weekTotalLabel: string
  weeklyRangeText: string
  weeklyMetaText: string
  weeklyFocusText: string
  weeklyOverview: {
    days: WeeklyDayItem[]
    total: number
    completed: number
    percent: number
    max: number
  }
}

function PlannerWeeklyOverview({
  weekOverviewLabel,
  weekProgressLabel,
  weekLoadLabel,
  weekFocusLabel,
  weekPendingLabel,
  weekCompletedLabel,
  weekTotalLabel,
  weeklyRangeText,
  weeklyMetaText,
  weeklyFocusText,
  weeklyOverview,
}: PlannerWeeklyOverviewProps) {
  return (
    <Card className="content-card planner-weekly-card" variant="borderless">
      <div className="planner-weekly-grid">
        <div className="planner-weekly-summary">
          <div className="planner-weekly-head">
            <div className="planner-weekly-head-copy">
              <Text className="page-kicker">{weekOverviewLabel}</Text>
              <Text className="planner-weekly-title">{weekProgressLabel}</Text>
            </div>
            <div className="planner-weekly-chip">{weeklyRangeText}</div>
          </div>

          <div className="planner-weekly-ring-wrap">
            <Progress
              type="circle"
              percent={weeklyOverview.percent}
              size={112}
              strokeColor="#2a9d8f"
              railColor="rgba(42, 157, 143, 0.12)"
              format={() => (
                <div className="planner-weekly-ring-copy">
                  <strong>{weeklyOverview.completed}</strong>
                  <span>/{weeklyOverview.total || 0}</span>
                </div>
              )}
            />
          </div>

          <Text className="planner-weekly-meta">{weeklyMetaText}</Text>
        </div>

        <div className="planner-weekly-chart">
          <div className="planner-weekly-chart-head">
            <div className="planner-weekly-chart-copy">
              <Text className="planner-weekly-chart-title">{weekLoadLabel}</Text>
              <Text type="secondary">{weekFocusLabel}</Text>
            </div>
            <div className="planner-weekly-chart-aside">
              <div className="planner-weekly-chip is-ghost">
                <span>{weekTotalLabel}</span>
                <strong>{weeklyOverview.total}</strong>
              </div>
              <div className="planner-weekly-focus-text">{weeklyFocusText}</div>
            </div>
          </div>

          <div className="planner-weekly-bars">
            {weeklyOverview.days.map((day) => {
              const totalHeight = day.total > 0 ? Math.max(16, (day.total / weeklyOverview.max) * 100) : 8
              const completedPercent = day.total > 0 ? (day.completed / day.total) * 100 : 0

              return (
                <div
                  key={day.key}
                  className={`planner-weekly-bar-item${day.isToday ? ' is-today' : ''}`}
                  title={`${day.label}: ${day.total}`}
                >
                  <span className="planner-weekly-bar-count">{day.total}</span>
                  <div className="planner-weekly-bar-track">
                    <div className="planner-weekly-bar-fill" style={{ height: `${totalHeight}%` }}>
                      {completedPercent > 0 ? (
                        <div className="planner-weekly-bar-fill-done" style={{ height: `${completedPercent}%` }} />
                      ) : null}
                    </div>
                  </div>
                  <div className="planner-weekly-bar-label">
                    <span>{day.label}</span>
                    <small>{day.dayNumber}</small>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="planner-weekly-legend">
            <span>
              <i className="planner-weekly-legend-dot" />
              {weekPendingLabel}
            </span>
            <span>
              <i className="planner-weekly-legend-dot is-done" />
              {weekCompletedLabel}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default memo(PlannerWeeklyOverview)
