import { memo } from 'react'
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons'
import { Button, Popconfirm, Space, Tag, Tooltip, Typography } from 'antd'
import {
  formatTaskDate,
  getWeekdayLabel,
  type PlannerTask,
  type PlannerTaskPriority,
} from '../../lib/plannerStorage'

const { Paragraph, Text } = Typography

interface PlannerTaskItemProps {
  task: PlannerTask
  language: 'vi' | 'en'
  savingTask: boolean
  repeatFieldLabel: string
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

function PlannerTaskItem({
  task,
  language,
  savingTask,
  repeatFieldLabel,
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
}: PlannerTaskItemProps) {
  return (
    <div className={`planner-task-item${task.completed ? ' is-completed' : ''}`}>
      <div className="planner-task-main">
        <div className="planner-task-top">
          <div className="planner-task-head">
            <Text strong>{task.title}</Text>
          </div>
          <Tag
            className="planner-priority-tag"
            color={task.priority === 'high' ? 'volcano' : task.priority === 'medium' ? 'gold' : 'blue'}
          >
            {priorityOptions.find((option) => option.value === task.priority)?.label}
          </Tag>
        </div>
        <Text type="secondary">
          {getWeekdayLabel(task.dueDate, language)} · {formatTaskDate(task.dueDate, language)}
          {task.dueTime ? ` · ${task.dueTime}` : ''}
        </Text>
        {task.note ? <Paragraph className="settings-copy">{task.note}</Paragraph> : null}
        {task.repeatWeekly ? (
          <Tag variant="filled" color="purple">
            {repeatFieldLabel}
          </Tag>
        ) : null}
      </div>

      <Space wrap className="planner-task-actions">
        <Tooltip title={task.completed ? undoLabel : completeLabel}>
          <Button
            size="small"
            shape="circle"
            className={`planner-icon-action planner-icon-action-complete${task.completed ? ' is-active' : ''}`}
            loading={savingTask}
            icon={<CheckCircleOutlined />}
            aria-label={task.completed ? undoLabel : completeLabel}
            onClick={() => onToggle(task)}
          />
        </Tooltip>
        <Tooltip title={editLabel}>
          <Button
            size="small"
            shape="circle"
            className="planner-icon-action"
            icon={<EditOutlined />}
            aria-label={editLabel}
            onClick={() => onEdit(task)}
          />
        </Tooltip>
        <Popconfirm
          title={deleteTitle}
          description={deleteDescription}
          onConfirm={() => onDelete(task.id)}
          okText={deleteLabel}
          cancelText={cancelText}
        >
          <Tooltip title={deleteLabel}>
            <Button
              size="small"
              shape="circle"
              danger
              className="planner-icon-action planner-icon-action-delete"
              icon={<DeleteOutlined />}
              aria-label={deleteLabel}
            />
          </Tooltip>
        </Popconfirm>
      </Space>
    </div>
  )
}

export default memo(PlannerTaskItem)
