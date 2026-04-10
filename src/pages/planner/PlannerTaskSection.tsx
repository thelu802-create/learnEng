import { memo } from 'react'
import type { ReactNode } from 'react'
import { Empty, Space, Tag, Typography } from 'antd'
import type { PlannerTask, PlannerTaskPriority } from '../../lib/plannerStorage'
import PlannerTaskItem from './PlannerTaskItem'

const { Paragraph, Title } = Typography

interface PlannerTaskSectionProps {
  title: string
  description: string
  icon: ReactNode
  color: string
  items: PlannerTask[]
  loading: boolean
  noTasksText: string
  loadingText: string
  language: 'vi' | 'en'
  savingTask: boolean
  repeatOptions: Array<{ value: string; label: string }>
  editLabel: string
  deleteLabel: string
  deleteTitle: string
  deleteDescription: string
  completeLabel: string
  undoLabel: string
  cancelText: string
  onToggle: (task: PlannerTask) => void
  onEdit: (task: PlannerTask) => void
  onDelete: (taskId: string) => void
  priorityOptions: Array<{ value: PlannerTaskPriority; label: string }>
}

function PlannerTaskSection({
  title,
  description,
  icon,
  color,
  items,
  loading,
  noTasksText,
  loadingText,
  language,
  savingTask,
  repeatOptions,
  editLabel,
  deleteLabel,
  deleteTitle,
  deleteDescription,
  completeLabel,
  undoLabel,
  cancelText,
  onToggle,
  onEdit,
  onDelete,
  priorityOptions,
}: PlannerTaskSectionProps) {
  return (
    <Space orientation="vertical" size={14} className="full-width">
      {title ? (
        <div className="planner-section-head">
          <div className="settings-heading">
            {icon}
            <Title level={4}>{title}</Title>
          </div>
          <Tag color={color}>{items.length}</Tag>
        </div>
      ) : null}

      {description ? <Paragraph className="settings-copy">{description}</Paragraph> : null}

      {loading ? (
        <Paragraph className="settings-copy">{loadingText}</Paragraph>
      ) : items.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={noTasksText} />
      ) : (
        <Space orientation="vertical" size={12} className="full-width">
          {items.map((task) => (
            <PlannerTaskItem
              key={task.id}
              task={task}
              language={language}
              savingTask={savingTask}
              repeatOptions={repeatOptions}
              editLabel={editLabel}
              deleteLabel={deleteLabel}
              deleteTitle={deleteTitle}
              deleteDescription={deleteDescription}
              completeLabel={completeLabel}
              undoLabel={undoLabel}
              cancelText={cancelText}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              priorityOptions={priorityOptions}
            />
          ))}
        </Space>
      )}
    </Space>
  )
}

export default memo(PlannerTaskSection)
