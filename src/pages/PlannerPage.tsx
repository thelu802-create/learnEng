import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { startTransition } from 'react'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  NotificationOutlined,
} from '@ant-design/icons'
import {
  App as AntdApp,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd'
import type { InputRef } from 'antd'
import { useSupabaseAuth } from '../components/providers/SupabaseAuthProvider'
import { useI18n } from '../i18n'
import {
  getTaskBucket,
  getTaskDueDate,
  isSameDay,
  sortPlannerTasks,
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
} from '../lib/supabase/plannerApi'
import PlannerOverviewGrid from './planner/PlannerOverviewGrid'
import PlannerTaskDrawer from './planner/PlannerTaskDrawer'
import PlannerTaskSection from './planner/PlannerTaskSection'
import PlannerTaskItem from './planner/PlannerTaskItem'
import PlannerWeeklyOverview from './planner/PlannerWeeklyOverview'

const { Title, Paragraph } = Typography

type PlannerFormValues = PlannerTaskInput

interface PlannerPageProps {
  onRegisterTopbarAction?: (label: string | null, handler: (() => void) | null) => void
}

function formatDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getStartOfWeek(baseDate: Date): Date {
  const date = new Date(baseDate)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatPlannerShortDate(date: Date, language: 'en' | 'vi'): string {
  return new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'vi-VN', {
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

function openDrawerNextFrame(setter: (open: boolean) => void) {
  requestAnimationFrame(() => {
    setter(true)
  })
}

function PlannerPage({ onRegisterTopbarAction }: PlannerPageProps) {
  const { message } = AntdApp.useApp()
  const { language } = useI18n()
  const { configured, signInWithGithub, user } = useSupabaseAuth()
  const [form] = Form.useForm<PlannerFormValues>()
  const [tasks, setTasks] = useState<PlannerTask[]>([])
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [plannerDrawerOpen, setPlannerDrawerOpen] = useState(false)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [savingTask, setSavingTask] = useState(false)
  const [taskListQuery, setTaskListQuery] = useState('')
  const [taskListDate, setTaskListDate] = useState('')
  const [taskListStatus, setTaskListStatus] = useState<'completed' | 'overdue' | 'later'>('completed')
  const [taskListDraftStatus, setTaskListDraftStatus] = useState<'completed' | 'overdue' | 'later'>('completed')
  const taskListQueryRef = useRef<InputRef | null>(null)
  const taskListDateRef = useRef<InputRef | null>(null)
  const currentYear = new Date().getFullYear()
  const minPlannerDate = formatDateInputValue(new Date(currentYear - 1, 0, 1))
  const maxPlannerDate = formatDateInputValue(new Date(currentYear + 5, 11, 31))

  const copy = useMemo(
    () =>
      language === 'en'
        ? {
          title: 'Weekly planner',
          intro: 'Keep today, upcoming work, and weekly workload in one place.',
          formTitle: editingTaskId ? 'Edit task' : 'Add a task',
          formCopy: 'Use this for teaching reminders, homework checks, meetings, or weekly routines.',
          addAction: 'Add task',
          saveAndNew: 'Save & add another',
          closeDrawer: 'Close',
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
          notReady: 'Supabase is not configured yet in this environment.',
          loadError: 'Unable to load planner tasks.',
          pendingToday: 'Not done yet',
          completedToday: 'Done today',
          completedToggle: 'Show completed',
          hideCompleted: 'Hide completed',
          undoNotice: 'Task marked as done.',
          undoAction: 'Undo',
          completedSummary: 'Completed tasks stay here so you can review them quickly.',
        }
        : {
          title: 'Kế hoạch trong tuần',
          intro: 'Theo dõi việc hôm nay, việc sắp tới và khối lượng công việc trong tuần.',
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
          loginRequired: 'Hãy đăng nhập GitHub để lưu nhắc việc của bạn.',
          notReady: 'Môi trường này chưa cấu hình Supabase.',
          loadError: 'Không tải được danh sách nhắc việc.',
          pendingToday: 'Chưa xong',
          completedToday: 'Đã xong',
          completedToggle: 'Hiện việc đã xong',
          hideCompleted: 'Ẩn việc đã xong',
        },
    [editingTaskId, language],
  )

  const loginActionText = language === 'en' ? 'Sign in with GitHub' : 'Đăng nhập GitHub'
  const invalidDateRangeText =
    language === 'en'
      ? `Please choose a date between ${minPlannerDate} and ${maxPlannerDate}.`
      : `Hãy chọn ngày trong khoảng ${minPlannerDate} đến ${maxPlannerDate}.`
  const loadingTasksText = language === 'en' ? 'Loading planner tasks...' : 'Đang tải nhắc việc...'
  const cancelText = language === 'en' ? 'Cancel' : 'Hủy'
  const weekOverviewLabel = language === 'en' ? 'Week overview' : 'Tổng quan tuần'
  const weekProgressLabel = language === 'en' ? 'Weekly progress' : 'Tiến độ tuần'
  const weekLoadLabel = language === 'en' ? 'Workload by day' : 'Khối lượng theo ngày'
  const weekPendingLabel = language === 'en' ? 'Pending' : 'Chưa xong'
  const weekCompletedLabel = language === 'en' ? 'Completed' : 'Đã xong'
  const weekNoTasksLabel = language === 'en' ? 'No tasks this week' : 'Chưa có việc trong tuần này'
  const weekMetaTemplate = language === 'en' ? '{done}/{total} done' : '{done}/{total} đã xong'
  const weekLabels = language === 'en' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

  const weekRangeLabel = language === 'en' ? 'This week' : 'Tuần này'
  const weekFocusLabel = language === 'en' ? 'Focus day' : 'Ngày cần chú ý'
  const weekTotalLabel = language === 'en' ? 'Total tasks' : 'Tổng việc'
  const weekFocusTemplate = language === 'en' ? '{label} · {count} tasks' : '{label} · {count} việc'

  const undoNoticeText = language === 'en' ? 'Task marked as done.' : 'Đã đánh dấu công việc hoàn thành.'
  const undoActionText = language === 'en' ? 'Undo' : 'Hoàn tác'
  const completedArchiveSearchPlaceholder =
    language === 'en' ? 'Search by task name' : 'Tìm theo tên công việc'
  const completedArchiveDateLabel = language === 'en' ? 'Filter by date' : 'Lọc theo ngày'
  const completedArchiveSearchAction = language === 'en' ? 'Search' : 'Tìm'

  const addTaskActionText = language === 'en' ? 'Add task' : 'Thêm công việc'
  const saveAndNewActionText = language === 'en' ? 'Save & add another' : 'Lưu và thêm tiếp'
  const closeDrawerText = language === 'en' ? 'Close' : 'Đóng'
  const taskListTitle = language === 'en' ? 'Task list' : 'Danh sách công việc'
  const taskListDescription =
    language === 'en'
      ? 'Review completed, overdue, and later tasks in one place.'
      : 'Xem chung các việc đã hoàn thành, quá hạn và để sau trong một nơi.'
  const taskStatusLabel = language === 'en' ? 'Status' : 'Trạng thái'
  const taskStatusCompleted = language === 'en' ? 'Completed' : 'Đã hoàn thành'
  const taskStatusOverdue = language === 'en' ? 'Overdue' : 'Quá hạn'
  const taskStatusLater = language === 'en' ? 'Later' : 'Để sau'
  const priorityOptions: Array<{ value: PlannerTaskPriority; label: string }> = useMemo(
    () => [
      { value: 'low', label: copy.low },
      { value: 'medium', label: copy.medium },
      { value: 'high', label: copy.high },
    ],
    [copy.high, copy.low, copy.medium],
  )

  const mapRecordToTask = useCallback(
    (task: Awaited<ReturnType<typeof createPlannerTaskRecord>>): PlannerTask => ({
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
    }),
    [],
  )

  const applySavedTask = useCallback((savedTask: Awaited<ReturnType<typeof createPlannerTaskRecord>>) => {
    const nextTask = mapRecordToTask(savedTask)

    setTasks((currentTasks) => {
      const exists = currentTasks.some((task) => task.id === nextTask.id)
      return sortPlannerTasks(
        exists
          ? currentTasks.map((task) => (task.id === nextTask.id ? nextTask : task))
          : [...currentTasks, nextTask],
      )
    })

    return nextTask
  }, [mapRecordToTask])

  const handleGithubSignIn = useCallback(async () => {
    try {
      await signInWithGithub()
    } catch {
      message.error(language === 'en' ? 'Unable to start GitHub sign-in.' : 'Không thể bắt đầu đăng nhập GitHub.')
    }
  }, [language, message, signInWithGithub])

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
          sortPlannerTasks(
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
          ),
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

  const todayTasks = useMemo(() => tasks.filter((task) => isSameDay(getTaskDueDate(task), new Date())), [tasks])
  const todayPendingTasks = todayTasks.filter((task) => !task.completed)
  const taskListItems = useMemo(
    () =>
      [...tasks]
        .filter((task) => {
          if (task.completed) {
            return true
          }

          const bucket = getTaskBucket(task, new Date())
          return bucket === 'overdue' || bucket === 'later'
        })
        .sort((left, right) => {
          if (left.completed !== right.completed) {
            return left.completed ? 1 : -1
          }
          const leftDue = getTaskDueDate(left).getTime()
          const rightDue = getTaskDueDate(right).getTime()

          if (leftDue !== rightDue) {
            return rightDue - leftDue
          }

          return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
        }),
    [tasks],
  )
  const filteredTaskListItems = useMemo(() => {
    const keyword = taskListQuery.trim().toLowerCase()

    return taskListItems.filter((task) => {
      const status = task.completed ? 'completed' : getTaskBucket(task, new Date())
      const matchesStatus = status === taskListStatus
      const matchesQuery =
        keyword.length === 0 ||
        task.title.toLowerCase().includes(keyword) ||
        task.note.toLowerCase().includes(keyword)
      const matchesDate = !taskListDate || task.dueDate === taskListDate

      return matchesStatus && matchesQuery && matchesDate
    })
  }, [taskListDate, taskListItems, taskListQuery, taskListStatus])

  const applyTaskListFilters = useCallback(() => {
    const nextQuery = taskListQueryRef.current?.input?.value?.trim() ?? ''
    const nextDate = taskListDateRef.current?.input?.value ?? ''

    startTransition(() => {
      setTaskListQuery(nextQuery)
      setTaskListDate(nextDate)
      setTaskListStatus(taskListDraftStatus)
    })
  }, [taskListDraftStatus])

  const handleTaskStatusChange = useCallback((value: 'completed' | 'overdue' | 'later') => {
    setTaskListDraftStatus(value)
    startTransition(() => {
      setTaskListStatus(value)
    })
  }, [])

  const openCreateDrawer = useCallback(() => {
    setEditingTaskId(null)
    openDrawerNextFrame(setPlannerDrawerOpen)
  }, [])

  const closePlannerDrawer = useCallback(() => {
    setPlannerDrawerOpen(false)
    setEditingTaskId(null)
  }, [])

  useEffect(() => {
    if (plannerDrawerOpen && !editingTaskId) {
      form.resetFields()
    }
  }, [editingTaskId, form, plannerDrawerOpen])

  useEffect(() => {
    onRegisterTopbarAction?.(addTaskActionText, openCreateDrawer)

    return () => {
      onRegisterTopbarAction?.(null, null)
    }
  }, [addTaskActionText, onRegisterTopbarAction, openCreateDrawer])

  const overviewCards = useMemo(
    () =>
      [
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
      ] as const,
    [
      bucketedTasks.later,
      bucketedTasks.overdue.length,
      bucketedTasks.upcoming.length,
      copy.later,
      copy.overdue,
      copy.today,
      copy.upcoming,
      todayPendingTasks.length,
    ],
  )

  const taskStatusOptions = [
    { label: taskStatusCompleted, value: 'completed' },
    { label: taskStatusOverdue, value: 'overdue' },
    { label: taskStatusLater, value: 'later' },
  ] as const

  const weeklyOverview = useMemo(() => {
    const today = new Date()
    const weekStart = getStartOfWeek(today)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + index)
      const iso = formatDateInputValue(date)
      const items = tasks.filter((task) => task.dueDate === iso)
      const completed = items.filter((task) => task.completed).length

      return {
        key: iso,
        label: weekLabels[index] ?? '',
        dayNumber: date.getDate(),
        total: items.length,
        completed,
        pending: items.length - completed,
        isToday: isSameDay(date, today),
      }
    })

    const total = days.reduce((sum, day) => sum + day.total, 0)
    const completed = days.reduce((sum, day) => sum + day.completed, 0)
    const pending = days.reduce((sum, day) => sum + day.pending, 0)
    const max = Math.max(1, ...days.map((day) => day.total))
    const busiestDay = days.reduce<(typeof days)[number] | null>((current, day) => {
      if (day.total === 0) {
        return current
      }

      if (!current || day.total > current.total) {
        return day
      }

      return current
    }, null)

    return {
      days,
      weekStart,
      weekEnd,
      total,
      completed,
      pending,
      overdue: bucketedTasks.overdue.length,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      max,
      busiestDay,
    }
  }, [bucketedTasks.overdue.length, tasks, weekLabels])

  const weeklyMetaText = weekMetaTemplate
    .replace('{done}', String(weeklyOverview.completed))
    .replace('{total}', String(weeklyOverview.total))
  const weeklyRangeText = `${weekRangeLabel} ${formatPlannerShortDate(weeklyOverview.weekStart, language)} - ${formatPlannerShortDate(
    weeklyOverview.weekEnd,
    language,
  )}`
  const weeklyFocusText = weeklyOverview.busiestDay
    ? weekFocusTemplate
        .replace('{label}', weeklyOverview.busiestDay.label)
        .replace('{count}', String(weeklyOverview.busiestDay.total))
    : weekNoTasksLabel

  const handleSubmit = useCallback(async (keepOpen = false) => {
    if (!user) {
      return
    }

    const values = await form.validateFields()

    if (values.dueDate < minPlannerDate || values.dueDate > maxPlannerDate) {
      message.warning(invalidDateRangeText)
      return
    }

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

      applySavedTask(saved)

        if (keepOpen && !editingTaskId) {
          form.resetFields()
        } else {
          closePlannerDrawer()
        }
        message.success(copy.saved)
    } catch {
      message.error(copy.loadError)
    } finally {
      setSavingTask(false)
    }
  }, [
    applySavedTask,
    closePlannerDrawer,
    copy.addTask,
    copy.loadError,
    copy.saved,
    editingTaskId,
    form,
    invalidDateRangeText,
    maxPlannerDate,
    message,
    minPlannerDate,
    tasks,
    user,
  ])

  const handleEdit = useCallback((task: PlannerTask) => {
    setEditingTaskId(task.id)
    form.setFieldsValue({
      title: task.title,
      note: task.note,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      priority: task.priority,
      repeatWeekly: task.repeatWeekly,
    })
    openDrawerNextFrame(setPlannerDrawerOpen)
  }, [form])

  const handleDelete = useCallback(async (taskId: string) => {
    if (!user) {
      return
    }

    try {
      setSavingTask(true)
      await deletePlannerTaskRecord(taskId, user.id)
      setTasks((currentTasks) => sortPlannerTasks(currentTasks.filter((task) => task.id !== taskId)))

        if (editingTaskId === taskId) {
          closePlannerDrawer()
        }

      message.success(copy.deleted)
    } catch {
      message.error(copy.loadError)
    } finally {
      setSavingTask(false)
    }
  }, [closePlannerDrawer, copy.deleted, copy.loadError, editingTaskId, message, user])

  const handleUndoCompletion = useCallback(async (task: PlannerTask) => {
    if (!user) {
      return
    }

    try {
      setSavingTask(true)
      const restored = await updatePlannerTaskRecord(task.id, {
        userId: user.id,
        title: task.title,
        note: task.note,
        dueDate: task.dueDate,
        dueTime: task.dueTime,
        priority: task.priority,
        repeatWeekly: task.repeatWeekly,
        completed: task.completed,
      })

      applySavedTask(restored)
      message.destroy(`planner-toggle-${task.id}`)
      message.success(copy.toggled)
    } catch {
      message.error(copy.loadError)
    } finally {
      setSavingTask(false)
    }
  }, [applySavedTask, copy.loadError, copy.toggled, message, user])

  const handleToggle = useCallback(async (task: PlannerTask) => {
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

      const nextTask = applySavedTask(saved)

      if (!task.completed && nextTask.completed) {
        const messageKey = `planner-toggle-${task.id}`
        message.open({
          key: messageKey,
          duration: 5,
          content: (
            <Space size={10} wrap>
              <span>{undoNoticeText}</span>
              <Button
                type="link"
                size="small"
                className="planner-undo-link"
                onClick={() => void handleUndoCompletion(task)}
              >
                {undoActionText}
              </Button>
            </Space>
          ),
        })
      } else {
        message.destroy(`planner-toggle-${task.id}`)
        message.success(copy.toggled)
      }
    } catch {
      message.error(copy.loadError)
    } finally {
      setSavingTask(false)
    }
  }, [applySavedTask, copy.loadError, copy.toggled, handleUndoCompletion, message, undoActionText, undoNoticeText, user])

  return (
    <Space orientation="vertical" size={20} className="full-width">
      <Card className="hero-card highlight-card planner-hero-card" variant="borderless">
        <Space orientation="vertical" size={10} className="full-width">
          <Title className="hero-title">{copy.title}</Title>
          <Paragraph className="hero-copy">{copy.intro}</Paragraph>
        </Space>
      </Card>

      {!configured ? (
        <Card className="content-card" variant="borderless">
          <Paragraph className="settings-copy">{copy.notReady}</Paragraph>
        </Card>
      ) : !user ? (
        <Card className="content-card" variant="borderless">
          <Space orientation="vertical" size={12}>
            <Paragraph className="settings-copy">{copy.loginRequired}</Paragraph>
            <Button type="primary" onClick={() => void handleGithubSignIn()}>
              {loginActionText}
            </Button>
          </Space>
        </Card>
      ) : (
          <Space orientation="vertical" size={18} className="full-width">
            <PlannerOverviewGrid items={[...overviewCards]} />

          <PlannerWeeklyOverview
            weekOverviewLabel={weekOverviewLabel}
            weekProgressLabel={weekProgressLabel}
            weekLoadLabel={weekLoadLabel}
            weekFocusLabel={weekFocusLabel}
            weekPendingLabel={weekPendingLabel}
            weekCompletedLabel={weekCompletedLabel}
            weekTotalLabel={weekTotalLabel}
            weeklyRangeText={weeklyRangeText}
            weeklyMetaText={weeklyMetaText}
            weeklyFocusText={weeklyFocusText}
            weeklyOverview={weeklyOverview}
          />

            <Row gutter={[18, 18]}>
              <Col xs={24}>
                <Space orientation="vertical" size={16} className="full-width">
                <Card className="content-card planner-list-card planner-today-card" variant="borderless">
                  <PlannerTaskSection
                    title={copy.today}
                    description={copy.todayCopy}
                    icon={<NotificationOutlined />}
                    color="gold"
                    items={todayPendingTasks}
                    loading={loadingTasks}
                    noTasksText={copy.noTasks}
                    loadingText={loadingTasksText}
                    language={language}
                    savingTask={savingTask}
                    repeatFieldLabel={copy.repeatField}
                    editLabel={copy.edit}
                    deleteLabel={copy.delete}
                    deleteTitle={copy.deleteTitle}
                    deleteDescription={copy.deleteCopy}
                    completeLabel={copy.complete}
                    undoLabel={copy.undo}
                    cancelText={cancelText}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    priorityOptions={priorityOptions}
                  />
                </Card>

                <Card className="content-card planner-list-card planner-upcoming-card" variant="borderless">
                  <PlannerTaskSection
                    title={copy.upcoming}
                    description={copy.upcomingCopy}
                    icon={<ClockCircleOutlined />}
                    color="cyan"
                    items={bucketedTasks.upcoming}
                    loading={loadingTasks}
                    noTasksText={copy.noTasks}
                    loadingText={loadingTasksText}
                    language={language}
                    savingTask={savingTask}
                    repeatFieldLabel={copy.repeatField}
                    editLabel={copy.edit}
                    deleteLabel={copy.delete}
                    deleteTitle={copy.deleteTitle}
                    deleteDescription={copy.deleteCopy}
                    completeLabel={copy.complete}
                    undoLabel={copy.undo}
                    cancelText={cancelText}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    priorityOptions={priorityOptions}
                  />
                </Card>

                  <Card className="content-card planner-list-card planner-task-list-card" variant="borderless">
                    <Space orientation="vertical" size={14} className="full-width">
                      <div className="planner-section-head">
                        <div className="settings-heading">
                          <ClockCircleOutlined />
                          <Title level={4}>{taskListTitle}</Title>
                        </div>
                        <Tag color="cyan">{taskListItems.length}</Tag>
                      </div>

                      <Paragraph className="settings-copy">{taskListDescription}</Paragraph>

                      <div className="planner-completed-filters planner-task-list-searchbar">
                        <Input
                          className="planner-completed-search-input"
                          ref={taskListQueryRef}
                          defaultValue={taskListQuery}
                          placeholder={completedArchiveSearchPlaceholder}
                        />
                        <div className="planner-completed-filter-actions planner-task-list-filter-actions">
                          <Input
                            className="planner-completed-date-input"
                            ref={taskListDateRef}
                            type="date"
                            defaultValue={taskListDate}
                            aria-label={completedArchiveDateLabel}
                          />
                          <Select
                            className="planner-task-status-select"
                            value={taskListDraftStatus}
                            options={[...taskStatusOptions]}
                            aria-label={taskStatusLabel}
                            onChange={(value: 'completed' | 'overdue' | 'later') => handleTaskStatusChange(value)}
                          />
                          <Button className="planner-completed-search-button" type="primary" onClick={applyTaskListFilters}>
                            {completedArchiveSearchAction}
                          </Button>
                        </div>
                      </div>

                      {loadingTasks ? (
                        <Paragraph className="settings-copy">{loadingTasksText}</Paragraph>
                      ) : filteredTaskListItems.length === 0 ? (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={copy.noTasks} />
                      ) : (
                        <Space orientation="vertical" size={12} className="full-width">
                          {filteredTaskListItems.map((task) => (
                            <PlannerTaskItem
                              key={task.id}
                              task={task}
                              language={language}
                              savingTask={savingTask}
                              repeatFieldLabel={copy.repeatField}
                              editLabel={copy.edit}
                              deleteLabel={copy.delete}
                              deleteTitle={copy.deleteTitle}
                              deleteDescription={copy.deleteCopy}
                              completeLabel={copy.complete}
                              undoLabel={copy.undo}
                              cancelText={cancelText}
                              onToggle={handleToggle}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              priorityOptions={priorityOptions}
                            />
                          ))}
                        </Space>
                      )}
                    </Space>
                  </Card>

              </Space>
              </Col>
            </Row>

            <PlannerTaskDrawer
              open={plannerDrawerOpen}
              title={copy.formTitle}
              form={form}
              savingTask={savingTask}
              isEditing={Boolean(editingTaskId)}
              formCopy={copy.formCopy}
              repeatHint={copy.repeatHint}
              titleField={copy.titleField}
              noteField={copy.noteField}
              dateField={copy.dateField}
              timeField={copy.timeField}
              priorityField={copy.priorityField}
              repeatField={copy.repeatField}
              requiredTitle={copy.requiredTitle}
              requiredDate={copy.requiredDate}
              invalidDateRangeText={invalidDateRangeText}
              minPlannerDate={minPlannerDate}
              maxPlannerDate={maxPlannerDate}
              closeDrawerText={closeDrawerText}
              saveAndNewActionText={saveAndNewActionText}
              saveTaskText={copy.addTask}
              priorityOptions={priorityOptions}
              onClose={closePlannerDrawer}
              onSubmit={handleSubmit}
            />
        </Space>
      )}
    </Space>
  )
}

export default PlannerPage

