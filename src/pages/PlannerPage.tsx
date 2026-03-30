import { useEffect, useMemo, useState } from 'react'
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  NotificationOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Checkbox,
  Col,
  Empty,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd'
import { useSupabaseAuth } from '../components/providers/SupabaseAuthProvider'
import { useI18n } from '../i18n'
import {
  formatTaskDate,
  getTaskBucket,
  getTaskDueDate,
  getWeekdayLabel,
  isSameDay,
  shiftPlannerTaskAfterCompletion,
  type PlannerTask,
  type PlannerTaskInput,
  type PlannerTaskPriority,
} from '../lib/plannerStorage'
import {
  createPlannerTaskRecord,
  deletePlannerTaskRecord,
  listPlannerTasks,
  updatePlannerTaskRecord,
} from '../lib/supabase/teacherData'

const { Title, Paragraph, Text } = Typography

type PlannerFormValues = PlannerTaskInput

function PlannerPage() {
  const { language } = useI18n()
  const { configured, signInWithGithub, user } = useSupabaseAuth()
  const [form] = Form.useForm<PlannerFormValues>()
  const [tasks, setTasks] = useState<PlannerTask[]>([])
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [savingTask, setSavingTask] = useState(false)
  const [showCompletedToday, setShowCompletedToday] = useState(false)

  const copy =
    language === 'en'
      ? {
          eyebrow: 'Planner',
          title: 'Weekly reminders and teaching tasks',
          intro:
            'Add tasks for the week, track what is due today, and keep upcoming teaching reminders in one place.',
          formTitle: editingTaskId ? 'Edit task' : 'Add a task',
          formCopy: 'Use this for teaching reminders, homework checks, meetings, or weekly routines.',
          titleField: 'Task title',
          noteField: 'Notes',
          dateField: 'Date',
          timeField: 'Time',
          priorityField: 'Priority',
          repeatField: 'Repeat every week',
          addTask: 'Save task',
          reset: 'Clear form',
          today: 'Today',
          upcoming: 'Coming soon',
          overdue: 'Overdue',
          later: 'Later',
          noTasks: 'No tasks in this group yet.',
          delete: 'Delete',
          edit: 'Edit',
          complete: 'Mark done',
          undo: 'Mark not done',
          deleteTitle: 'Delete this task?',
          deleteCopy: 'This action cannot be undone.',
          saved: 'Task saved.',
          deleted: 'Task deleted.',
          toggled: 'Task updated.',
          requiredTitle: 'Please enter a task title.',
          requiredDate: 'Please choose a date.',
          low: 'Low',
          medium: 'Medium',
          high: 'High',
          todayCopy: 'Tasks due today or very close to now.',
          upcomingCopy: 'Tasks arriving within the next two days.',
          overdueCopy: 'Tasks that need attention now.',
          laterCopy: 'Other scheduled tasks for later.',
          repeatHint: 'Useful for weekly routines such as checking notebooks or preparing a class.',
          loginRequired: 'Sign in with GitHub to save your planner tasks.',
          loginAction: 'Sign in with GitHub',
          notReady: 'Supabase is not configured yet in this environment.',
          loadError: 'Unable to load planner tasks.',
          pendingToday: 'Not done yet',
          completedToday: 'Done today',
          completedToggle: 'Show completed',
          hideCompleted: 'Hide completed',
        }
      : {
          eyebrow: 'Nhắc việc',
          title: 'Công việc và nhắc việc trong tuần',
          intro:
            'Thêm công việc trong tuần, xem việc đến hạn hôm nay và theo dõi những việc sắp tới trong một nơi.',
          formTitle: editingTaskId ? 'Sửa công việc' : 'Thêm công việc',
          formCopy: 'Dùng cho việc dạy học, kiểm tra bài, họp, nhắc việc hoặc công việc lặp lại hằng tuần.',
          titleField: 'Tên công việc',
          noteField: 'Ghi chú',
          dateField: 'Ngày',
          timeField: 'Giờ',
          priorityField: 'Mức ưu tiên',
          repeatField: 'Lặp lại mỗi tuần',
          addTask: 'Lưu công việc',
          reset: 'Làm mới',
          today: 'Hôm nay',
          upcoming: 'Sắp tới',
          overdue: 'Quá hạn',
          later: 'Để sau',
          noTasks: 'Chưa có công việc trong nhóm này.',
          delete: 'Xóa',
          edit: 'Sửa',
          complete: 'Đánh dấu xong',
          undo: 'Bỏ hoàn thành',
          deleteTitle: 'Xóa công việc này?',
          deleteCopy: 'Thao tác này không thể hoàn tác.',
          saved: 'Đã lưu công việc.',
          deleted: 'Đã xóa công việc.',
          toggled: 'Đã cập nhật công việc.',
          requiredTitle: 'Hãy nhập tên công việc.',
          requiredDate: 'Hãy chọn ngày.',
          low: 'Thấp',
          medium: 'Vừa',
          high: 'Cao',
          todayCopy: 'Các việc đến hạn hôm nay hoặc đã rất gần thời điểm thực hiện.',
          upcomingCopy: 'Các việc sẽ đến trong vòng hai ngày tới.',
          overdueCopy: 'Các việc cần xử lý ngay vì đã quá hạn.',
          laterCopy: 'Các việc đã lên kế hoạch cho những ngày sau.',
          repeatHint: 'Phù hợp với các việc lặp lại như kiểm tra vở, chuẩn bị tiết dạy hoặc nhắc bài.',
          loginRequired: 'Hãy đăng nhập GitHub để lưu nhắc việc lên Supabase.',
          notReady: 'Môi trường này chưa cấu hình Supabase.',
          loadError: 'Không tải được danh sách nhắc việc.',
          pendingToday: 'Chưa xong',
          completedToday: 'Đã xong',
          completedToggle: 'Hiện việc đã xong',
          hideCompleted: 'Ẩn việc đã xong',
        }

  const loginRequiredText =
    language === 'en' ? copy.loginRequired : 'Hãy đăng nhập GitHub để lưu nhắc việc của bạn.'
  const loginActionText = language === 'en' ? 'Sign in with GitHub' : 'Đăng nhập GitHub'

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub()
    } catch {
      message.error(language === 'en' ? 'Unable to start GitHub sign-in.' : 'Không thể bắt đầu đăng nhập GitHub.')
    }
  }

  useEffect(() => {
    if (!configured || !user) {
      setTasks([])
      return
    }

    let active = true
    setLoadingTasks(true)

    listPlannerTasks(user.id)
      .then((records) => {
        if (!active) {
          return
        }

        setTasks(
          records.map((task) => ({
            id: task.id,
            title: task.title,
            note: task.note,
            dueDate: task.due_date,
            dueTime: task.due_time,
            priority: task.priority,
            repeatWeekly: task.repeat_weekly,
            completed: task.completed,
            createdAt: task.created_at,
            updatedAt: task.updated_at,
          })),
        )
      })
      .catch(() => {
        if (active) {
          message.error(copy.loadError)
        }
      })
      .finally(() => {
        if (active) {
          setLoadingTasks(false)
        }
      })

    return () => {
      active = false
    }
  }, [configured, copy.loadError, user])

  const bucketedTasks = useMemo(() => {
    const now = new Date()
    return {
      today: tasks.filter((task) => getTaskBucket(task, now) === 'today'),
      upcoming: tasks.filter((task) => getTaskBucket(task, now) === 'upcoming'),
      overdue: tasks.filter((task) => getTaskBucket(task, now) === 'overdue'),
      later: tasks.filter((task) => getTaskBucket(task, now) === 'later'),
    }
  }, [tasks])

  const todayTasks = useMemo(
    () => tasks.filter((task) => isSameDay(getTaskDueDate(task), new Date())),
    [tasks],
  )
  const todayPendingTasks = todayTasks.filter((task) => !task.completed)
  const todayCompletedTasks = todayTasks.filter((task) => task.completed)
  const overviewCards = [
    {
      key: 'today',
      title: copy.today,
      value: todayPendingTasks.length,
      tone: 'gold',
      icon: <NotificationOutlined />,
    },
    {
      key: 'upcoming',
      title: copy.upcoming,
      value: bucketedTasks.upcoming.length,
      tone: 'cyan',
      icon: <ClockCircleOutlined />,
    },
    {
      key: 'overdue',
      title: copy.overdue,
      value: bucketedTasks.overdue.length,
      tone: 'volcano',
      icon: <ExclamationCircleOutlined />,
    },
    {
      key: 'later',
      title: copy.later,
      value: bucketedTasks.later.filter((task) => !task.completed).length,
      tone: 'blue',
      icon: <CalendarOutlined />,
    },
  ] as const

  const priorityOptions: Array<{ value: PlannerTaskPriority; label: string }> = [
    { value: 'low', label: copy.low },
    { value: 'medium', label: copy.medium },
    { value: 'high', label: copy.high },
  ]

  const mapRecordToTask = (task: Awaited<ReturnType<typeof createPlannerTaskRecord>>): PlannerTask => ({
    id: task.id,
    title: task.title,
    note: task.note,
    dueDate: task.due_date,
    dueTime: task.due_time,
    priority: task.priority,
    repeatWeekly: task.repeat_weekly,
    completed: task.completed,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  })

  const handleSubmit = async () => {
    if (!user) {
      return
    }

    const values = await form.validateFields()

    try {
      setSavingTask(true)

      const saved = editingTaskId
        ? await updatePlannerTaskRecord(editingTaskId, {
            userId: user.id,
            title: values.title,
            note: values.note,
            dueDate: values.dueDate,
            dueTime: values.dueTime,
            priority: values.priority,
            repeatWeekly: values.repeatWeekly,
            completed: tasks.find((task) => task.id === editingTaskId)?.completed ?? false,
          })
        : await createPlannerTaskRecord({
            userId: user.id,
            title: values.title,
            note: values.note,
            dueDate: values.dueDate,
            dueTime: values.dueTime,
            priority: values.priority,
            repeatWeekly: values.repeatWeekly,
          })

      const nextTask = mapRecordToTask(saved)

      setTasks((currentTasks) => {
        const exists = currentTasks.some((task) => task.id === nextTask.id)
        return exists
          ? currentTasks.map((task) => (task.id === nextTask.id ? nextTask : task))
          : [...currentTasks, nextTask]
      })

      setEditingTaskId(null)
      form.resetFields()
      message.success(copy.saved)
    } catch {
      message.error(copy.loadError)
    } finally {
      setSavingTask(false)
    }
  }

  const handleEdit = (task: PlannerTask) => {
    setEditingTaskId(task.id)
    form.setFieldsValue({
      title: task.title,
      note: task.note,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      priority: task.priority,
      repeatWeekly: task.repeatWeekly,
    })
  }

  const handleDelete = async (taskId: string) => {
    if (!user) {
      return
    }

    try {
      setSavingTask(true)
      await deletePlannerTaskRecord(taskId, user.id)
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))
      if (editingTaskId === taskId) {
        setEditingTaskId(null)
        form.resetFields()
      }
      message.success(copy.deleted)
    } catch {
      message.error(copy.loadError)
    } finally {
      setSavingTask(false)
    }
  }

  const handleToggle = async (task: PlannerTask) => {
    if (!user) {
      return
    }

    try {
      setSavingTask(true)
      const shiftedTask = shiftPlannerTaskAfterCompletion(task)
      const saved = await updatePlannerTaskRecord(task.id, {
        userId: user.id,
        title: shiftedTask.title,
        note: shiftedTask.note,
        dueDate: shiftedTask.dueDate,
        dueTime: shiftedTask.dueTime,
        priority: shiftedTask.priority,
        repeatWeekly: shiftedTask.repeatWeekly,
        completed: shiftedTask.completed,
      })

      setTasks((currentTasks) =>
        currentTasks.map((item) => (item.id === task.id ? mapRecordToTask(saved) : item)),
      )
      message.success(copy.toggled)
    } catch {
      message.error(copy.loadError)
    } finally {
      setSavingTask(false)
    }
  }

  const renderTaskItem = (task: PlannerTask) => (
    <div className={`planner-task-item${task.completed ? ' is-completed' : ''}`} key={task.id}>
      <div className="planner-task-main">
        <div className="planner-task-top">
          <div className="planner-task-head">
            <Text strong>{task.title}</Text>
          </div>
          <Tag
            className="planner-priority-tag"
            color={
              task.priority === 'high'
                ? 'volcano'
                : task.priority === 'medium'
                  ? 'gold'
                  : 'blue'
            }
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
          <Tag bordered={false} color="purple">
            {copy.repeatField}
          </Tag>
        ) : null}
      </div>

      <Space wrap className="planner-task-actions">
        <Tooltip title={task.completed ? copy.undo : copy.complete}>
          <Button
            size="small"
            shape="circle"
            className={`planner-icon-action planner-icon-action-complete${task.completed ? ' is-active' : ''}`}
            loading={savingTask}
            icon={<CheckCircleOutlined />}
            aria-label={task.completed ? copy.undo : copy.complete}
            onClick={() => void handleToggle(task)}
          />
        </Tooltip>
        <Tooltip title={copy.edit}>
          <Button
            size="small"
            shape="circle"
            className="planner-icon-action"
            icon={<EditOutlined />}
            aria-label={copy.edit}
            onClick={() => handleEdit(task)}
          />
        </Tooltip>
        <Popconfirm
          title={copy.deleteTitle}
          description={copy.deleteCopy}
          onConfirm={() => void handleDelete(task.id)}
          okText={copy.delete}
          cancelText={language === 'en' ? 'Cancel' : 'Hủy'}
        >
          <Tooltip title={copy.delete}>
            <Button
              size="small"
              shape="circle"
              danger
              className="planner-icon-action planner-icon-action-delete"
              icon={<DeleteOutlined />}
              aria-label={copy.delete}
            />
          </Tooltip>
        </Popconfirm>
      </Space>
    </div>
  )

  const sectionCards = [
    {
      key: 'upcoming',
      title: copy.upcoming,
      description: copy.upcomingCopy,
      icon: <ClockCircleOutlined />,
      color: 'cyan',
      items: bucketedTasks.upcoming,
    },
    {
      key: 'overdue',
      title: copy.overdue,
      description: copy.overdueCopy,
      icon: <ExclamationCircleOutlined />,
      color: 'volcano',
      items: bucketedTasks.overdue,
    },
    {
      key: 'later',
      title: copy.later,
      description: copy.laterCopy,
      icon: <CalendarOutlined />,
      color: 'blue',
      items: bucketedTasks.later.filter((task) => !task.completed),
    },
  ]

  return (
    <Space direction="vertical" size={20} className="full-width">
      <Card className="hero-card highlight-card" bordered={false}>
        <Space direction="vertical" size={14} className="full-width">
          <Tag className="hero-tag" bordered={false}>
            {copy.eyebrow}
          </Tag>
          <Title className="hero-title">{copy.title}</Title>
          <Paragraph className="hero-copy">{copy.intro}</Paragraph>
        </Space>
      </Card>

      {!configured ? (
        <Card className="content-card" bordered={false}>
          <Paragraph className="settings-copy">{copy.notReady}</Paragraph>
        </Card>
      ) : !user ? (
        <Card className="content-card" bordered={false}>
          <Space direction="vertical" size={12}>
            <Paragraph className="settings-copy">{loginRequiredText}</Paragraph>
            <Button type="primary" onClick={() => void handleGithubSignIn()}>
              {loginActionText}
            </Button>
          </Space>
        </Card>
      ) : (
        <Space direction="vertical" size={18} className="full-width">
          <Row gutter={[14, 14]}>
            {overviewCards.map((item) => (
              <Col xs={12} lg={6} key={item.key}>
                <Card className={`content-card planner-overview-card planner-overview-${item.key}`} bordered={false}>
                  <div className="planner-overview-head">
                    <span className={`planner-overview-icon tone-${item.tone}`}>{item.icon}</span>
                    <Tag color={item.tone}>{item.value}</Tag>
                  </div>
                  <Text className="planner-overview-label">{item.title}</Text>
                </Card>
              </Col>
            ))}
          </Row>

        <Row gutter={[18, 18]}>
          <Col xs={24} xl={8}>
            <Card className="content-card planner-form-card planner-sticky-card" bordered={false}>
              <Space direction="vertical" size={16} className="full-width">
                <div className="section-heading">
                  <Title level={3}>{copy.formTitle}</Title>
                  <Paragraph>{copy.formCopy}</Paragraph>
                </div>

                <div className="planner-form-callout">
                  <CalendarOutlined />
                  <Text>{copy.repeatHint}</Text>
                </div>

                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{ priority: 'medium', repeatWeekly: false, dueTime: '' }}
                >
                  <Form.Item
                    name="title"
                    label={copy.titleField}
                    rules={[{ required: true, message: copy.requiredTitle }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item name="note" label={copy.noteField}>
                    <Input.TextArea rows={3} />
                  </Form.Item>

                  <Row gutter={12}>
                    <Col span={14}>
                      <Form.Item
                        name="dueDate"
                        label={copy.dateField}
                        rules={[{ required: true, message: copy.requiredDate }]}
                      >
                        <Input type="date" />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item name="dueTime" label={copy.timeField}>
                        <Input type="time" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="priority" label={copy.priorityField}>
                    <Select options={priorityOptions} />
                  </Form.Item>

                  <Form.Item name="repeatWeekly" valuePropName="checked">
                    <Checkbox>{copy.repeatField}</Checkbox>
                  </Form.Item>

                  <Space wrap>
                    <Button type="primary" loading={savingTask} onClick={() => void handleSubmit()}>
                      {copy.addTask}
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingTaskId(null)
                        form.resetFields()
                      }}
                    >
                      {copy.reset}
                    </Button>
                  </Space>
                </Form>
              </Space>
            </Card>
          </Col>

          <Col xs={24} xl={16}>
            <Space direction="vertical" size={16} className="full-width">
              <Card className="content-card planner-list-card planner-today-card" bordered={false}>
                <Space direction="vertical" size={14} className="full-width">
                  <div className="planner-section-head">
                    <div className="settings-heading">
                      <NotificationOutlined />
                      <Title level={4}>{copy.today}</Title>
                    </div>
                    <Tag color="gold">{todayTasks.length}</Tag>
                  </div>

                  <Paragraph className="settings-copy">{copy.todayCopy}</Paragraph>

                  {loadingTasks ? (
                    <Paragraph className="settings-copy">
                      {language === 'en' ? 'Loading planner tasks...' : 'Đang tải nhắc việc...'}
                    </Paragraph>
                  ) : todayTasks.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={copy.noTasks} />
                  ) : (
                    <Space direction="vertical" size={14} className="full-width">
                      <div className="planner-subsection">
                        <div className="planner-subsection-head">
                          <Text strong>{copy.pendingToday}</Text>
                          <Tag color="cyan">{todayPendingTasks.length}</Tag>
                        </div>
                        {todayPendingTasks.length > 0 ? (
                          <Space direction="vertical" size={12} className="full-width">
                            {todayPendingTasks.map(renderTaskItem)}
                          </Space>
                        ) : (
                          <Paragraph className="settings-copy">{copy.noTasks}</Paragraph>
                        )}
                      </div>

                      <div className="planner-subsection planner-completed-subsection">
                        <div className="planner-subsection-head">
                          <Space align="center" size={8}>
                            <Text strong>{copy.completedToday}</Text>
                            <Tag>{todayCompletedTasks.length}</Tag>
                          </Space>
                          {todayCompletedTasks.length > 0 ? (
                            <Button
                              size="small"
                              type="text"
                              onClick={() => setShowCompletedToday((current) => !current)}
                            >
                              {showCompletedToday ? copy.hideCompleted : copy.completedToggle}
                            </Button>
                          ) : null}
                        </div>
                        {showCompletedToday && todayCompletedTasks.length > 0 ? (
                          <Space direction="vertical" size={12} className="full-width">
                            {todayCompletedTasks.map(renderTaskItem)}
                          </Space>
                        ) : null}
                      </div>
                    </Space>
                  )}
                </Space>
              </Card>

              <Row gutter={[16, 16]}>
                {sectionCards.map((section) => (
                  <Col xs={24} md={12} key={section.key}>
                    <Card className="content-card planner-list-card" bordered={false}>
                      <Space direction="vertical" size={14} className="full-width">
                        <div className="planner-section-head">
                          <div className="settings-heading">
                            {section.icon}
                            <Title level={4}>{section.title}</Title>
                          </div>
                          <Tag color={section.color}>{section.items.length}</Tag>
                        </div>

                        <Paragraph className="settings-copy">{section.description}</Paragraph>

                        {loadingTasks ? (
                          <Paragraph className="settings-copy">
                            {language === 'en' ? 'Loading planner tasks...' : 'Đang tải nhắc việc...'}
                          </Paragraph>
                        ) : section.items.length === 0 ? (
                          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={copy.noTasks} />
                        ) : (
                          <Space direction="vertical" size={12} className="full-width">
                            {section.items.map(renderTaskItem)}
                          </Space>
                        )}
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Space>
          </Col>
        </Row>
        </Space>
      )}
    </Space>
  )
}

export default PlannerPage
