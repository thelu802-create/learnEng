import { memo } from 'react'
import { CalendarOutlined } from '@ant-design/icons'
import { Button, Col, Drawer, Form, Input, Row, Select, Space, Typography } from 'antd'
import type { FormInstance } from 'antd'
import type { FocusEvent, MouseEvent } from 'react'
import type { PlannerTaskInput, PlannerTaskPriority } from '../../lib/plannerStorage'

const { Paragraph, Text } = Typography

interface PlannerTaskDrawerProps {
  open: boolean
  title: string
  form: FormInstance<PlannerTaskInput>
  savingTask: boolean
  isEditing: boolean
  formCopy: string
  repeatHint: string
  titleField: string
  noteField: string
  dateField: string
  timeField: string
  priorityField: string
  repeatField: string
  requiredTitle: string
  requiredDate: string
  invalidDateRangeText: string
  minPlannerDate: string
  maxPlannerDate: string
  closeDrawerText: string
  saveAndNewActionText: string
  saveTaskText: string
  priorityOptions: Array<{ value: PlannerTaskPriority; label: string }>
  repeatOptions: Array<{ value: string; label: string }>
  onClose: () => void
  onSubmit: (keepOpen?: boolean) => void
}

function openNativePicker(event: FocusEvent<HTMLInputElement> | MouseEvent<HTMLInputElement>) {
  const input = event.currentTarget
  if (typeof input.showPicker === 'function') {
    try {
      input.showPicker()
    } catch {
      // Some browsers require a stricter user gesture and will throw here.
    }
  }
}

function PlannerTaskDrawer({
  open,
  title,
  form,
  savingTask,
  isEditing,
  formCopy,
  repeatHint,
  titleField,
  noteField,
  dateField,
  timeField,
  priorityField,
  repeatField,
  requiredTitle,
  requiredDate,
  invalidDateRangeText,
  minPlannerDate,
  maxPlannerDate,
  closeDrawerText,
  saveAndNewActionText,
  saveTaskText,
  priorityOptions,
  repeatOptions,
  onClose,
  onSubmit,
}: PlannerTaskDrawerProps) {
  return (
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      size="default"
      autoFocus={false}
      forceRender
      className="planner-drawer"
      footer={
        <Space wrap className="planner-drawer-footer">
          <Button onClick={onClose}>{closeDrawerText}</Button>
          {!isEditing ? (
            <Button loading={savingTask} onClick={() => void onSubmit(true)}>
              {saveAndNewActionText}
            </Button>
          ) : null}
          <Button type="primary" loading={savingTask} onClick={() => void onSubmit()}>
            {saveTaskText}
          </Button>
        </Space>
      }
    >
      <Space orientation="vertical" size={16} className="full-width">
        <Paragraph className="planner-drawer-copy">{formCopy}</Paragraph>

        <div className="planner-form-callout">
          <CalendarOutlined />
          <Text>{repeatHint}</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={{ priority: 'medium', repeatPattern: null, dueTime: '' }}
        >
          <Form.Item name="title" label={titleField} rules={[{ required: true, message: requiredTitle }]}>
            <Input />
          </Form.Item>

          <Form.Item name="note" label={noteField}>
            <Input.TextArea rows={3} />
          </Form.Item>

          <Row gutter={12}>
            <Col span={14}>
              <Form.Item
                name="dueDate"
                label={dateField}
                rules={[
                  { required: true, message: requiredDate },
                  {
                    validator: async (_, value?: string) => {
                      if (!value || (value >= minPlannerDate && value <= maxPlannerDate)) {
                        return
                      }

                      throw new Error(invalidDateRangeText)
                    },
                  },
                ]}
              >
                <Input
                  type="date"
                  min={minPlannerDate}
                  max={maxPlannerDate}
                  onClick={openNativePicker}
                  onKeyDown={(event) => event.preventDefault()}
                  onPaste={(event) => event.preventDefault()}
                />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="dueTime" label={timeField}>
                <Input type="time" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="priority" label={priorityField}>
            <Select options={priorityOptions} />
          </Form.Item>

          <Form.Item name="repeatPattern" label={repeatField}>
            <Select options={repeatOptions} allowClear placeholder="—" />
          </Form.Item>
        </Form>
      </Space>
    </Drawer>
  )
}

export default memo(PlannerTaskDrawer)
