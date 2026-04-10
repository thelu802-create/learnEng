import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { startTransition } from 'react'
import {
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  FilePdfOutlined,
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
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd'
import type { InputRef } from 'antd'
import { jsPDF } from 'jspdf'
import plannerPdfFontUrl from '../assets/fonts/BeVietnamPro-Regular.ttf?url'
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
  deleteMultiplePlannerTaskRecords,
  listPlannerTasks,
  updatePlannerTaskRecord,
} from '../lib/supabase/plannerApi'
import PlannerOverviewGrid from './planner/PlannerOverviewGrid'
import PlannerTaskDrawer from './planner/PlannerTaskDrawer'
import PlannerTaskSection from './planner/PlannerTaskSection'
import PlannerTaskItem from './planner/PlannerTaskItem'
import PlannerWeeklyOverview from './planner/PlannerWeeklyOverview'

const { Title, Paragraph, Text } = Typography

type PlannerFormValues = PlannerTaskInput

const PLANNER_PDF_FONT_FILE = 'BeVietnamPro-Regular.ttf'
const PLANNER_PDF_FONT_NAME = 'BeVietnamPro'
const PLANNER_REPORT_BRAND = 'English Path'
let plannerPdfFontPromise: Promise<string> | null = null

interface PlannerPageProps {
  onRegisterTopbarAction?: (label: string | null, handler: (() => void) | null) => void
}

function formatDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTimeInputValue(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
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

async function getPlannerPdfFont(): Promise<string> {
  if (!plannerPdfFontPromise) {
    plannerPdfFontPromise = fetch(plannerPdfFontUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load PDF font')
        }
        return response.arrayBuffer()
      })
      .then((buffer) => {
        const bytes = new Uint8Array(buffer)
        let binary = ''
        const chunkSize = 0x8000
        for (let index = 0; index < bytes.length; index += chunkSize) {
          binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
        }
        return binary
      })
  }

  return plannerPdfFontPromise
}

function PlannerPage({ onRegisterTopbarAction }: PlannerPageProps) {
  const { message } = AntdApp.useApp()
  const { language, t } = useI18n()
  const { configured, signInWithGithub, user } = useSupabaseAuth()
  const [form] = Form.useForm<PlannerFormValues>()
  const [tasks, setTasks] = useState<PlannerTask[]>([])
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [plannerDrawerOpen, setPlannerDrawerOpen] = useState(false)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [savingTask, setSavingTask] = useState(false)
  const [taskListQuery, setTaskListQuery] = useState('')
  const [taskListDate, setTaskListDate] = useState('')
  const [taskListMonth, setTaskListMonth] = useState('')
  const [taskListStatus, setTaskListStatus] = useState<'completed' | 'overdue' | 'later'>('completed')
  const [taskListDraftStatus, setTaskListDraftStatus] = useState<'completed' | 'overdue' | 'later'>('completed')
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [quickTitle, setQuickTitle] = useState('')
  const [quickDate, setQuickDate] = useState(() => formatDateInputValue(new Date()))
  const [quickAdding, setQuickAdding] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [weeklyNote, setWeeklyNote] = useState('')
  const taskListQueryRef = useRef<InputRef | null>(null)
  const taskListDateRef = useRef<InputRef | null>(null)
  const todaySectionRef = useRef<HTMLDivElement>(null)
  const upcomingSectionRef = useRef<HTMLDivElement>(null)
  const taskListSectionRef = useRef<HTMLDivElement>(null)
  const [activeOverviewKey, setActiveOverviewKey] = useState<string | null>(null)
  const currentYear = new Date().getFullYear()
  const minPlannerDate = formatDateInputValue(new Date(currentYear - 1, 0, 1))
  const maxPlannerDate = formatDateInputValue(new Date(currentYear + 5, 11, 31))
  const weekLabels = language === 'en'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

  const priorityOptions: Array<{ value: PlannerTaskPriority; label: string }> = useMemo(
    () => [
      { value: 'low', label: t('planner.low') },
      { value: 'medium', label: t('planner.medium') },
      { value: 'high', label: t('planner.high') },
    ],
    [t],
  )

  const repeatOptions = useMemo(
    () => [
      { value: 'weekly', label: t('planner.repeatWeekly') },
      { value: 'biweekly', label: t('planner.repeatBiweekly') },
      { value: 'weekdays', label: t('planner.repeatWeekdays') },
    ],
    [t],
  )

  const mapRecordToTask = useCallback(
    (task: Awaited<ReturnType<typeof createPlannerTaskRecord>>): PlannerTask => ({
      id: task.id,
      title: task.title,
      note: task.note,
      dueDate: task.due_date,
      dueTime: task.due_time,
      priority: task.priority,
      repeatPattern: task.repeat_pattern ?? (task.repeat_weekly ? 'weekly' : null),
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
      message.error(t('planner.signInError'))
    }
  }, [message, signInWithGithub, t])

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
              repeatPattern: task.repeat_pattern ?? (task.repeat_weekly ? 'weekly' : null),
              completed: task.completed,
              createdAt: task.created_at,
              updatedAt: task.updated_at,
            })),
          ),
        )
      })
      .catch(() => {
        if (active) {
          message.error(t('planner.loadError'))
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
  }, [configured, message, t, user])

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
          if (task.completed) return true
          const bucket = getTaskBucket(task, new Date())
          return bucket === 'overdue' || bucket === 'later'
        })
        .sort((left, right) => {
          if (left.completed !== right.completed) return left.completed ? 1 : -1
          const leftDue = getTaskDueDate(left).getTime()
          const rightDue = getTaskDueDate(right).getTime()
          if (leftDue !== rightDue) return rightDue - leftDue
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

  const monthDeleteCandidates = useMemo(
    () => (taskListMonth ? tasks.filter((task) => task.dueDate.startsWith(taskListMonth)) : []),
    [taskListMonth, tasks],
  )

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
    startTransition(() => setTaskListStatus(value))
  }, [])

  const handleOverviewCardClick = useCallback((key: string) => {
    setActiveOverviewKey(key)
    if (key === 'today') {
      todaySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } else if (key === 'upcoming') {
      upcomingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } else {
      startTransition(() => {
        setTaskListStatus(key as 'overdue' | 'later')
        setTaskListDraftStatus(key as 'overdue' | 'later')
      })
      taskListSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [])

  const openCreateDrawer = useCallback(() => {
    setEditingTaskId(null)
    const now = new Date()
    form.setFieldsValue({
      dueDate: formatDateInputValue(now),
      dueTime: formatTimeInputValue(now),
      priority: 'medium',
      repeatPattern: null,
      title: '',
      note: '',
    })
    openDrawerNextFrame(setPlannerDrawerOpen)
  }, [form])

  const closePlannerDrawer = useCallback(() => {
    setPlannerDrawerOpen(false)
    setEditingTaskId(null)
  }, [])

  const handleQuickAdd = useCallback(async () => {
    if (!user || !quickTitle.trim()) return
    setQuickAdding(true)
    try {
      const saved = await createPlannerTaskRecord({
        userId: user.id,
        title: quickTitle.trim(),
        dueDate: quickDate,
        priority: 'medium',
      })
      applySavedTask(saved)
      setQuickTitle('')
      setQuickDate(formatDateInputValue(new Date()))
      message.success(t('planner.saved'))
    } catch {
      message.error(t('planner.loadError'))
    } finally {
      setQuickAdding(false)
    }
  }, [applySavedTask, message, quickDate, quickTitle, t, user])

  const toggleSelectMode = useCallback(() => {
    setSelectionMode((prev) => {
      if (prev) setSelectedIds(new Set())
      return !prev
    })
  }, [])

  const handleSelect = useCallback((taskId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) next.delete(taskId)
      else next.add(taskId)
      return next
    })
  }, [])

  const handleBatchComplete = useCallback(async () => {
    if (!user || selectedIds.size === 0) return
    setSavingTask(true)
    try {
      const actionableTasks = [...selectedIds]
        .map((id) => tasks.find((task) => task.id === id))
        .filter((task): task is PlannerTask => Boolean(task && !task.completed))

      if (actionableTasks.length === 0) {
        setSelectedIds(new Set())
        setSelectionMode(false)
        return
      }

      await Promise.all(
        actionableTasks.map((task) => {
          const shifted = shiftPlannerTaskAfterCompletion(task)
          return updatePlannerTaskRecord(task.id, {
            userId: user.id,
            title: shifted.title,
            note: shifted.note,
            dueDate: shifted.dueDate,
            dueTime: shifted.dueTime,
            priority: shifted.priority,
            repeatPattern: shifted.repeatPattern,
            completed: shifted.completed,
          }).then((saved) => applySavedTask(saved))
        }),
      )
      setSelectedIds(new Set())
      setSelectionMode(false)
      message.success(t('planner.toggled'))
    } catch {
      message.error(t('planner.loadError'))
    } finally {
      setSavingTask(false)
    }
  }, [applySavedTask, message, selectedIds, t, tasks, user])

  const handleBatchDelete = useCallback(async () => {
    if (!user || selectedIds.size === 0) return
    setSavingTask(true)
    try {
      const ids = [...selectedIds]
      await deleteMultiplePlannerTaskRecords(ids, user.id)
      setTasks((current) => sortPlannerTasks(current.filter((task) => !ids.includes(task.id))))
      setSelectedIds(new Set())
      setSelectionMode(false)
      message.success(t('planner.deleted'))
    } catch {
      message.error(t('planner.loadError'))
    } finally {
      setSavingTask(false)
    }
  }, [message, selectedIds, t, user])

  const handleDeleteByMonth = useCallback(async () => {
    if (!user || !taskListMonth || monthDeleteCandidates.length === 0) return
    setSavingTask(true)
    try {
      const ids = monthDeleteCandidates.map((task) => task.id)
      await deleteMultiplePlannerTaskRecords(ids, user.id)
      setTasks((current) => sortPlannerTasks(current.filter((task) => !ids.includes(task.id))))
      setSelectedIds((current) => new Set([...current].filter((id) => !ids.includes(id))))
      message.success(t('planner.monthDeleteSuccess', { count: ids.length }))
    } catch {
      message.error(t('planner.loadError'))
    } finally {
      setSavingTask(false)
    }
  }, [message, monthDeleteCandidates, t, taskListMonth, user])

  useEffect(() => {
    if (plannerDrawerOpen && !editingTaskId) {
      const now = new Date()
      form.setFieldsValue({
        title: '',
        note: '',
        dueDate: formatDateInputValue(now),
        dueTime: formatTimeInputValue(now),
        priority: 'medium',
        repeatPattern: null,
      })
    }
  }, [editingTaskId, form, plannerDrawerOpen])

  useEffect(() => {
    onRegisterTopbarAction?.(t('planner.addTaskAction'), openCreateDrawer)
    return () => { onRegisterTopbarAction?.(null, null) }
  }, [onRegisterTopbarAction, openCreateDrawer, t])

  const overviewCards = useMemo(
    () =>
      [
        {
          key: 'today',
          title: t('planner.today'),
          value: todayPendingTasks.length,
          tone: 'gold',
          icon: <NotificationOutlined />,
        },
        {
          key: 'upcoming',
          title: t('planner.upcoming'),
          value: bucketedTasks.upcoming.length,
          tone: 'cyan',
          icon: <ClockCircleOutlined />,
        },
        {
          key: 'overdue',
          title: t('planner.overdue'),
          value: bucketedTasks.overdue.length,
          tone: 'volcano',
          icon: <ExclamationCircleOutlined />,
        },
        {
          key: 'later',
          title: t('planner.later'),
          value: bucketedTasks.later.filter((task) => !task.completed).length,
          tone: 'blue',
          icon: <CalendarOutlined />,
        },
      ] as const,
    [
      bucketedTasks.later,
      bucketedTasks.overdue.length,
      bucketedTasks.upcoming.length,
      t,
      todayPendingTasks.length,
    ],
  )

  const taskStatusOptions = [
    { label: t('planner.taskStatusCompleted'), value: 'completed' },
    { label: t('planner.taskStatusOverdue'), value: 'overdue' },
    { label: t('planner.taskStatusLater'), value: 'later' },
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
      if (day.total === 0) return current
      if (!current || day.total > current.total) return day
      return current
    }, null)

    return {
      days, weekStart, weekEnd, total, completed, pending,
      overdue: bucketedTasks.overdue.length,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      max, busiestDay,
    }
  }, [bucketedTasks.overdue.length, tasks, weekLabels])

  const weeklyMetaText = t('planner.weekMeta', { done: weeklyOverview.completed, total: weeklyOverview.total })
  const weeklyRangeText = `${t('planner.weekRange')} ${formatPlannerShortDate(weeklyOverview.weekStart, language)} - ${formatPlannerShortDate(weeklyOverview.weekEnd, language)}`
  const weeklyFocusText = weeklyOverview.busiestDay
    ? t('planner.weekFocusTemplate', { label: weeklyOverview.busiestDay.label, count: weeklyOverview.busiestDay.total })
    : t('planner.weekNoTasks')
  const weeklyNoteStorageKey = useMemo(
    () => `english-path-planner-weekly-note:${user?.id ?? 'guest'}:${formatDateInputValue(weeklyOverview.weekStart)}`,
    [user?.id, weeklyOverview.weekStart],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    setWeeklyNote(window.localStorage.getItem(weeklyNoteStorageKey) ?? '')
  }, [weeklyNoteStorageKey])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(weeklyNoteStorageKey, weeklyNote)
  }, [weeklyNote, weeklyNoteStorageKey])

  const handleExportPdf = useCallback(async () => {
    setExportingPdf(true)

    try {
      const fontBinary = await getPlannerPdfFont()
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      doc.addFileToVFS(PLANNER_PDF_FONT_FILE, fontBinary)
      doc.addFont(PLANNER_PDF_FONT_FILE, PLANNER_PDF_FONT_NAME, 'normal')
      doc.setFont(PLANNER_PDF_FONT_NAME, 'normal')

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const marginX = 10
      const topY = 10
      const headerHeight = 22
      const summaryY = 38
      const summaryHeight = 18
      const summaryGap = 4
      const summaryWidth = (pageWidth - marginX * 2 - summaryGap * 3) / 4
      const sectionMetaY = 64
      const sectionTitleY = 71
      const gridY = 80
      const bottomMargin = 10
      const columnCount = 3
      const cardGapX = 5
      const cardGapY = 5
      const rowCount = Math.ceil(weeklyOverview.days.length / columnCount)
      const cardWidth = (pageWidth - marginX * 2 - cardGapX * (columnCount - 1)) / columnCount
      const footerGap = 6
      const footerHeight = 22
      const cardHeight = (pageHeight - gridY - bottomMargin - footerHeight - footerGap - cardGapY * (rowCount - 1)) / rowCount
      const footerY = gridY + rowCount * cardHeight + (rowCount - 1) * cardGapY + footerGap
      const footerWidth = (pageWidth - marginX * 2 - cardGapX) / 2
      const ownerLabel = user?.email ?? '—'
      const generatedAt = new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date())
      const focusLabel = weeklyOverview.busiestDay
        ? `${weeklyOverview.busiestDay.label} ${weeklyOverview.busiestDay.dayNumber}`
        : t('planner.weekNoTasks')
      const priorityLabelMap = new Map(priorityOptions.map((option) => [option.value, option.label]))
      const repeatLabelMap = new Map(repeatOptions.map((option) => [option.value, option.label]))
      const weekTasks = tasks.filter((task) => task.dueDate >= formatDateInputValue(weeklyOverview.weekStart) && task.dueDate <= formatDateInputValue(weeklyOverview.weekEnd))
      const repeatingHighlights = weekTasks.filter((task) => task.repeatPattern).slice(0, 3)
      const quickSummaryLines = [
        `${t('planner.overdue')}: ${weeklyOverview.overdue}`,
        `${t('planner.pdfFocusLabel')}: ${focusLabel}`,
        repeatingHighlights.length > 0
          ? `${t('planner.pdfRepeatHighlights')}: ${repeatingHighlights.map((task) => task.title).join(', ')}`
          : `${t('planner.pdfRepeatHighlights')}: ${t('planner.printNoTasks')}`,
      ]

      doc.setFillColor(15, 118, 110)
      doc.roundedRect(marginX, topY, pageWidth - marginX * 2, headerHeight, 3, 3, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(7.8)
      doc.text(PLANNER_REPORT_BRAND, marginX + 5, topY + 4.8)
      doc.setFontSize(17)
      doc.text(t('planner.printTitle'), marginX + 5, topY + 11.2)
      doc.setFontSize(9)
      doc.text(weeklyRangeText, marginX + 5, topY + 17)
      doc.text(t('planner.pdfGeneratedAt', { value: generatedAt }), pageWidth - marginX - 5, topY + 8.2, { align: 'right' })
      doc.text(`${t('planner.pdfFocusLabel')}: ${focusLabel}`, pageWidth - marginX - 5, topY + 14.6, { align: 'right' })
      doc.setTextColor(20, 20, 20)

      const summaryCards = [
        { label: t('planner.weekTotal'), value: String(weeklyOverview.total), fill: [232, 244, 242] as const, text: [20, 20, 20] as const },
        { label: t('planner.weekCompleted'), value: String(weeklyOverview.completed), fill: [228, 245, 234] as const, text: [30, 96, 53] as const },
        { label: t('planner.weekPending'), value: String(weeklyOverview.pending), fill: [255, 244, 229] as const, text: [154, 52, 18] as const },
        { label: t('planner.overdue'), value: String(weeklyOverview.overdue), fill: [253, 237, 237] as const, text: [185, 28, 28] as const },
      ]

      summaryCards.forEach((item, index) => {
        const x = marginX + index * (summaryWidth + summaryGap)
        doc.setFillColor(item.fill[0], item.fill[1], item.fill[2])
        doc.roundedRect(x, summaryY, summaryWidth, summaryHeight, 3, 3, 'F')
        doc.setFontSize(8)
        doc.setTextColor(90, 90, 90)
        doc.text(item.label, x + 4, summaryY + 6)
        doc.setFontSize(16)
        doc.setTextColor(item.text[0], item.text[1], item.text[2])
        doc.text(item.value, x + 4, summaryY + 13)
      })
      doc.setTextColor(20, 20, 20)

      doc.setFontSize(9)
      doc.setTextColor(96, 108, 118)
      doc.text(`${t('planner.pdfOwnerLabel')}: ${ownerLabel}`, marginX, sectionMetaY)
      doc.setFontSize(12)
      doc.setTextColor(20, 20, 20)
      doc.text(t('planner.pdfScheduleLabel'), marginX, sectionTitleY)
      doc.setDrawColor(220, 229, 233)
      doc.line(marginX, sectionTitleY + 3, pageWidth - marginX, sectionTitleY + 3)

      weeklyOverview.days.forEach((day, index) => {
        const row = Math.floor(index / columnCount)
        const columnIndex = index % columnCount
        const x = marginX + columnIndex * (cardWidth + cardGapX)
        const y = gridY + row * (cardHeight + cardGapY)
        const dayTasks = tasks
          .filter((task) => task.dueDate === day.key)
          .sort((left, right) => {
            if (left.completed !== right.completed) return left.completed ? 1 : -1
            return getTaskDueDate(left).getTime() - getTaskDueDate(right).getTime()
          })
        const completedCount = dayTasks.filter((task) => task.completed).length
        const headerFill = day.isToday ? ([226, 245, 241] as const) : ([245, 247, 249] as const)
        const borderColor = day.isToday ? ([42, 157, 143] as const) : ([220, 224, 230] as const)

        doc.setFillColor(253, 253, 252)
        doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F')
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
        doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3)
        doc.setFillColor(headerFill[0], headerFill[1], headerFill[2])
        doc.roundedRect(x, y, cardWidth, 11, 3, 3, 'F')
        doc.rect(x, y + 8, cardWidth, 3, 'F')

        doc.setFontSize(8)
        doc.setTextColor(day.isToday ? 29 : 90, day.isToday ? 127 : 90, day.isToday ? 115 : 90)
        doc.text(day.label, x + 4, y + 5)
        doc.setFontSize(10.5)
        doc.setTextColor(20, 20, 20)
        doc.text(`${day.dayNumber}`, x + 4, y + 9.4)
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(x + cardWidth - 25, y + 2.2, 21, 6.2, 2, 2, 'F')
        doc.setDrawColor(230, 235, 238)
        doc.roundedRect(x + cardWidth - 25, y + 2.2, 21, 6.2, 2, 2)
        doc.setFontSize(6.3)
        doc.setTextColor(90, 90, 90)
        doc.text(dayTasks.length === 0 ? t('planner.printNoTasks') : `${completedCount}/${dayTasks.length}`, x + cardWidth - 14.5, y + 6.4, { align: 'center' })

        let cursorY = y + 16
        const contentWidth = cardWidth - 8
        const maxY = y + cardHeight - 4

        if (dayTasks.length === 0) {
          doc.setFontSize(7.2)
          doc.setTextColor(140, 140, 140)
          doc.text(t('planner.printNoTasks'), x + cardWidth / 2, y + cardHeight / 2 + 1, { align: 'center' })
          return
        }

        for (let taskIndex = 0; taskIndex < dayTasks.length; taskIndex += 1) {
          const task = dayTasks[taskIndex]
          const titleLines = doc.splitTextToSize(task.title, contentWidth).slice(0, 2)
          const metaParts = [
            task.dueTime || null,
            task.repeatPattern ? `${t('planner.pdfRepeatLabel')}: ${repeatLabelMap.get(task.repeatPattern) ?? task.repeatPattern}` : null,
          ].filter(Boolean)
          const metaLine = metaParts.join(' · ')
          const metaLines = metaLine ? doc.splitTextToSize(metaLine, contentWidth).slice(0, 2) : []
          const noteSource = task.note.trim()
          const noteLines = noteSource
            ? doc.splitTextToSize(`${t('planner.pdfNoteLabel')}: ${noteSource}`, contentWidth)
                .slice(0, 1)
            : []
          const lineHeight = 3.4
          const blockHeight =
            titleLines.length * lineHeight +
            metaLines.length * 2.9 +
            noteLines.length * 2.8 +
            3.6

          if (cursorY + blockHeight > maxY) {
            const remaining = dayTasks.length - taskIndex
            doc.setFontSize(7.2)
            doc.setTextColor(140, 140, 140)
            doc.text(`+${remaining} ${t('planner.moreTasks')}`, x + 4, maxY)
            break
          }

          doc.setFontSize(7.3)
          doc.setTextColor(task.completed ? 125 : 28, task.completed ? 125 : 28, task.completed ? 125 : 28)
          doc.text(titleLines, x + 4, cursorY)
          cursorY += titleLines.length * lineHeight

          const priorityLabel = priorityLabelMap.get(task.priority) ?? task.priority
          const priorityColors =
            task.priority === 'high'
              ? { fill: [253, 237, 237] as const, text: [185, 28, 28] as const }
              : task.priority === 'medium'
                ? { fill: [255, 244, 229] as const, text: [180, 83, 9] as const }
                : { fill: [232, 244, 252] as const, text: [30, 64, 175] as const }
          const priorityWidth = Math.min(contentWidth, Math.max(18, priorityLabel.length * 2.5 + 8))
          doc.setFillColor(priorityColors.fill[0], priorityColors.fill[1], priorityColors.fill[2])
          doc.roundedRect(x + 4, cursorY - 0.8, priorityWidth, 5, 1.8, 1.8, 'F')
          doc.setFontSize(6.1)
          doc.setTextColor(priorityColors.text[0], priorityColors.text[1], priorityColors.text[2])
          doc.text(priorityLabel, x + 7, cursorY + 2.2)
          cursorY += 5.6

          if (metaLines.length > 0) {
            doc.setFontSize(6.2)
            doc.setTextColor(96, 108, 118)
            doc.text(metaLines, x + 4, cursorY)
            cursorY += metaLines.length * 2.9
          }

          if (noteLines.length > 0) {
            doc.setFontSize(6)
            doc.setTextColor(120, 120, 120)
            doc.text(noteLines, x + 4, cursorY)
            cursorY += noteLines.length * 2.8
          }

          doc.setDrawColor(240, 242, 245)
          doc.line(x + 4, cursorY + 0.5, x + cardWidth - 4, cursorY + 0.5)
          cursorY += 2.2
        }
      })

      doc.setFillColor(250, 251, 252)
      doc.roundedRect(marginX, footerY, footerWidth, footerHeight, 3, 3, 'F')
      doc.roundedRect(marginX + footerWidth + cardGapX, footerY, footerWidth, footerHeight, 3, 3, 'F')
      doc.setDrawColor(225, 231, 235)
      doc.roundedRect(marginX, footerY, footerWidth, footerHeight, 3, 3)
      doc.roundedRect(marginX + footerWidth + cardGapX, footerY, footerWidth, footerHeight, 3, 3)

      doc.setFontSize(9.2)
      doc.setTextColor(20, 20, 20)
      doc.text(t('planner.weeklyNotesTitle'), marginX + 4, footerY + 6)
      doc.text(t('planner.pdfQuickSummaryTitle'), marginX + footerWidth + cardGapX + 4, footerY + 6)

      doc.setFontSize(7)
      doc.setTextColor(96, 108, 118)
      const weeklyNoteLines = weeklyNote.trim()
        ? doc.splitTextToSize(weeklyNote.trim(), footerWidth - 8).slice(0, 4)
        : [t('planner.weeklyNotesPlaceholder')]
      doc.text(weeklyNoteLines, marginX + 4, footerY + 11)

      const quickSummaryWrapped = quickSummaryLines.flatMap((line) => doc.splitTextToSize(`- ${line}`, footerWidth - 8).slice(0, 2))
      doc.text(quickSummaryWrapped.slice(0, 6), marginX + footerWidth + cardGapX + 4, footerY + 11)

      doc.save(`planner-week-${formatDateInputValue(weeklyOverview.weekStart)}.pdf`)
    } catch {
      message.error(t('planner.pdfError'))
    } finally {
      setExportingPdf(false)
    }
  }, [language, message, priorityOptions, repeatOptions, t, tasks, user?.email, weeklyNote, weeklyOverview, weeklyRangeText])

  const handleSubmit = useCallback(async (keepOpen = false) => {
    if (!user) return
    const values = await form.validateFields()

    if (values.dueDate < minPlannerDate || values.dueDate > maxPlannerDate) {
      message.warning(t('planner.invalidDateRange', { min: minPlannerDate, max: maxPlannerDate }))
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
            repeatPattern: values.repeatPattern ?? null,
            completed: tasks.find((task) => task.id === editingTaskId)?.completed ?? false,
          })
        : await createPlannerTaskRecord({
            userId: user.id,
            title: values.title,
            note: values.note,
            dueDate: values.dueDate,
            dueTime: values.dueTime,
            priority: values.priority,
            repeatPattern: values.repeatPattern ?? null,
          })

      applySavedTask(saved)
      if (keepOpen && !editingTaskId) {
        form.resetFields()
      } else {
        closePlannerDrawer()
      }
      message.success(t('planner.saved'))
    } catch {
      message.error(t('planner.loadError'))
    } finally {
      setSavingTask(false)
    }
  }, [
    applySavedTask, closePlannerDrawer, editingTaskId,
    form, maxPlannerDate, message, minPlannerDate, t, tasks, user,
  ])

  const handleEdit = useCallback((task: PlannerTask) => {
    setEditingTaskId(task.id)
    form.setFieldsValue({
      title: task.title,
      note: task.note,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      priority: task.priority,
      repeatPattern: task.repeatPattern ?? undefined,
    })
    openDrawerNextFrame(setPlannerDrawerOpen)
  }, [form])

  const handleDelete = useCallback(async (taskId: string) => {
    if (!user) return
    try {
      setSavingTask(true)
      await deletePlannerTaskRecord(taskId, user.id)
      setTasks((current) => sortPlannerTasks(current.filter((task) => task.id !== taskId)))
      if (editingTaskId === taskId) closePlannerDrawer()
      message.success(t('planner.deleted'))
    } catch {
      message.error(t('planner.loadError'))
    } finally {
      setSavingTask(false)
    }
  }, [closePlannerDrawer, editingTaskId, message, t, user])

  const handleUndoCompletion = useCallback(async (task: PlannerTask) => {
    if (!user) return
    try {
      setSavingTask(true)
      const restored = await updatePlannerTaskRecord(task.id, {
        userId: user.id,
        title: task.title,
        note: task.note,
        dueDate: task.dueDate,
        dueTime: task.dueTime,
        priority: task.priority,
        repeatPattern: task.repeatPattern,
        completed: task.completed,
      })
      applySavedTask(restored)
      message.destroy(`planner-toggle-${task.id}`)
      message.success(t('planner.toggled'))
    } catch {
      message.error(t('planner.loadError'))
    } finally {
      setSavingTask(false)
    }
  }, [applySavedTask, message, t, user])

  const handleToggle = useCallback(async (task: PlannerTask) => {
    if (!user) return
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
        repeatPattern: shiftedTask.repeatPattern,
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
              <span>{t('planner.undoNotice')}</span>
              <Button
                type="link"
                size="small"
                className="planner-undo-link"
                onClick={() => void handleUndoCompletion(task)}
              >
                {t('planner.undoAction')}
              </Button>
            </Space>
          ),
        })
      } else {
        message.destroy(`planner-toggle-${task.id}`)
        message.success(t('planner.toggled'))
      }
    } catch {
      message.error(t('planner.loadError'))
    } finally {
      setSavingTask(false)
    }
  }, [applySavedTask, handleUndoCompletion, message, t, user])

  const commonTaskProps = {
    language,
    savingTask,
    repeatOptions,
    editLabel: t('planner.edit'),
    deleteLabel: t('planner.delete'),
    deleteTitle: t('planner.deleteTitle'),
    deleteDescription: t('planner.deleteCopy'),
    completeLabel: t('planner.complete'),
    undoLabel: t('planner.undo'),
    cancelText: t('planner.cancel'),
    onToggle: handleToggle,
    onEdit: handleEdit,
    onDelete: handleDelete,
    priorityOptions,
  }

  const commonSectionProps = {
    ...commonTaskProps,
    loading: loadingTasks,
    noTasksText: t('planner.noTasks'),
    loadingText: t('planner.loadingTasks'),
    repeatFieldLabel: t('planner.repeatField'),
  }

  return (
    <Space orientation="vertical" size={20} className="full-width">
      {/* Print view (hidden on screen, visible when printing) */}
      <div className="planner-print-view">
        <div className="planner-print-title">{t('planner.printTitle')}</div>
        <div className="planner-print-range">{weeklyRangeText}</div>
        <div className="planner-print-days">
          {weeklyOverview.days.map((day) => {
            const dayTasks = tasks.filter((task) => task.dueDate === day.key)
            return (
              <div key={day.key} className={`planner-print-day${day.isToday ? ' is-today' : ''}`}>
                <div className="planner-print-day-label">{day.label} {day.dayNumber}</div>
                {dayTasks.length === 0 ? (
                  <div className="planner-print-no-tasks">{t('planner.printNoTasks')}</div>
                ) : (
                  dayTasks.map((task) => (
                    <div key={task.id} className={`planner-print-task-row${task.completed ? ' is-done' : ''}`}>
                      {task.completed ? '✓' : '☐'} {task.title}
                      {task.dueTime ? ` · ${task.dueTime}` : ''}
                    </div>
                  ))
                )}
              </div>
            )
          })}
        </div>
      </div>

      <Card className="hero-card highlight-card planner-hero-card" variant="borderless">
        <div className="planner-hero-head">
          <Space orientation="vertical" size={4}>
            <Title className="hero-title">{t('planner.title')}</Title>
            <Paragraph className="hero-copy">{t('planner.intro')}</Paragraph>
          </Space>
        </div>
      </Card>

      {!configured ? (
        <Card className="content-card" variant="borderless">
          <Paragraph className="settings-copy">{t('planner.notReady')}</Paragraph>
        </Card>
      ) : !user ? (
        <Card className="content-card" variant="borderless">
          <Space orientation="vertical" size={12}>
            <Paragraph className="settings-copy">{t('planner.loginRequired')}</Paragraph>
            <Button type="primary" onClick={() => void handleGithubSignIn()}>
              {t('planner.loginAction')}
            </Button>
          </Space>
        </Card>
      ) : (
        <Space orientation="vertical" size={18} className="full-width">
          <PlannerOverviewGrid
            items={[...overviewCards]}
            activeKey={activeOverviewKey ?? undefined}
            onCardClick={handleOverviewCardClick}
          />

          <PlannerWeeklyOverview
            weekOverviewLabel={t('planner.weekOverview')}
            weekProgressLabel={t('planner.weekProgress')}
            weekLoadLabel={t('planner.weekLoad')}
            weekFocusLabel={t('planner.weekFocus')}
            weekPendingLabel={t('planner.weekPending')}
            weekCompletedLabel={t('planner.weekCompleted')}
            weekTotalLabel={t('planner.weekTotal')}
            weeklyRangeText={weeklyRangeText}
            weeklyMetaText={weeklyMetaText}
            weeklyFocusText={weeklyFocusText}
            actionSlot={(
              <Button icon={<FilePdfOutlined />} loading={exportingPdf} onClick={() => void handleExportPdf()}>
                {t('planner.printWeekly')}
              </Button>
            )}
            weeklyOverview={weeklyOverview}
          />

          <Card className="content-card planner-weekly-notes-card" variant="borderless">
            <Space orientation="vertical" size={10} className="full-width">
              <div className="planner-section-head">
                <div className="settings-heading">
                  <CalendarOutlined />
                  <Title level={4}>{t('planner.weeklyNotesTitle')}</Title>
                </div>
              </div>
              <Paragraph className="settings-copy">{t('planner.weeklyNotesCopy')}</Paragraph>
              <Input.TextArea
                className="planner-weekly-notes-input"
                rows={4}
                value={weeklyNote}
                placeholder={t('planner.weeklyNotesPlaceholder')}
                onChange={(event) => setWeeklyNote(event.target.value)}
              />
              <Text type="secondary">{t('planner.weeklyNotesHelp')}</Text>
            </Space>
          </Card>

          {/* Quick add */}
          <Card className="content-card planner-quick-add-card" variant="borderless">
            <div className="planner-quick-add">
              <Input
                className="planner-quick-add-input"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder={t('planner.quickAddPlaceholder')}
                onPressEnter={() => void handleQuickAdd()}
              />
              <Input
                className="planner-quick-add-date"
                type="date"
                value={quickDate}
                min={minPlannerDate}
                max={maxPlannerDate}
                onChange={(e) => setQuickDate(e.target.value)}
              />
              <Button
                type="primary"
                loading={quickAdding}
                disabled={!quickTitle.trim()}
                onClick={() => void handleQuickAdd()}
              >
                {t('planner.quickAddAction')}
              </Button>
            </div>
          </Card>

          <Row gutter={[18, 18]}>
            <Col xs={24}>
              <Space orientation="vertical" size={16} className="full-width">
                <div ref={todaySectionRef}>
                  <Card className="content-card planner-list-card planner-today-card" variant="borderless">
                    <PlannerTaskSection
                      title={t('planner.today')}
                      description={t('planner.todayCopy')}
                      icon={<NotificationOutlined />}
                      color="gold"
                      items={todayPendingTasks}
                      {...commonSectionProps}
                    />
                  </Card>
                </div>

                <div ref={upcomingSectionRef}>
                  <Card className="content-card planner-list-card planner-upcoming-card" variant="borderless">
                    <PlannerTaskSection
                      title={t('planner.upcoming')}
                      description={t('planner.upcomingCopy')}
                      icon={<ClockCircleOutlined />}
                      color="cyan"
                      items={bucketedTasks.upcoming}
                      {...commonSectionProps}
                    />
                  </Card>
                </div>

                <div ref={taskListSectionRef}>
                  <Card className="content-card planner-list-card planner-task-list-card" variant="borderless">
                    <Space orientation="vertical" size={14} className="full-width">
                      <div className="planner-section-head">
                        <div className="settings-heading">
                          <ClockCircleOutlined />
                          <Title level={4}>{t('planner.taskListTitle')}</Title>
                        </div>
                        <Space size={10} className="planner-task-list-head-actions">
                          <Tag color="cyan">{taskListItems.length}</Tag>
                          <Button
                            className={`planner-select-toggle${selectionMode ? ' is-active' : ''}`}
                            size="small"
                            type={selectionMode ? 'primary' : 'default'}
                            onClick={toggleSelectMode}
                          >
                            {t('planner.selectMode')}
                          </Button>
                        </Space>
                      </div>

                      <Paragraph className="settings-copy">{t('planner.taskListDescription')}</Paragraph>

                      <div className="planner-completed-filters planner-task-list-searchbar">
                        <Input
                          className="planner-completed-search-input"
                          ref={taskListQueryRef}
                          defaultValue={taskListQuery}
                          placeholder={t('planner.archiveSearchPlaceholder')}
                        />
                        <div className="planner-completed-filter-actions planner-task-list-filter-actions">
                          <Input
                            className="planner-completed-date-input"
                            ref={taskListDateRef}
                            type="date"
                            defaultValue={taskListDate}
                            aria-label={t('planner.archiveDateLabel')}
                          />
                          <Select
                            className="planner-task-status-select"
                            value={taskListDraftStatus}
                            options={[...taskStatusOptions]}
                            aria-label={t('planner.taskStatusLabel')}
                            onChange={(value: 'completed' | 'overdue' | 'later') => handleTaskStatusChange(value)}
                          />
                          <Button className="planner-completed-search-button" type="primary" onClick={applyTaskListFilters}>
                            {t('planner.archiveSearchAction')}
                          </Button>
                        </div>
                      </div>

                      <div className="planner-month-actions">
                        <Input
                          className="planner-month-input"
                          type="month"
                          value={taskListMonth}
                          aria-label={t('planner.monthDeleteLabel')}
                          onChange={(event) => setTaskListMonth(event.target.value)}
                        />
                        <Text type="secondary" className="planner-month-hint">
                          {taskListMonth
                            ? t('planner.monthDeleteHint', { count: monthDeleteCandidates.length })
                            : t('planner.monthDeleteEmpty')}
                        </Text>
                        <Popconfirm
                          title={t('planner.monthDeleteConfirmTitle')}
                          description={t('planner.monthDeleteConfirmDescription', {
                            month: taskListMonth || '—',
                            count: monthDeleteCandidates.length,
                          })}
                          onConfirm={() => void handleDeleteByMonth()}
                          okText={t('planner.delete')}
                          cancelText={t('planner.cancel')}
                          disabled={!taskListMonth || monthDeleteCandidates.length === 0}
                        >
                          <Button
                            className="planner-month-delete-button"
                            danger
                            loading={savingTask}
                            disabled={!taskListMonth || monthDeleteCandidates.length === 0}
                            icon={<DeleteOutlined />}
                          >
                            {t('planner.monthDeleteAction')}
                          </Button>
                        </Popconfirm>
                      </div>

                      {/* Batch action bar */}
                      {selectionMode && selectedIds.size > 0 ? (
                        <div className="planner-batch-bar">
                          <div className="planner-batch-summary">
                            <span className="planner-batch-count">{selectedIds.size}</span>
                            <Text strong>{t('planner.selected', { count: selectedIds.size })}</Text>
                          </div>
                          <Space size={10} wrap className="planner-batch-actions">
                            <Button
                              className="planner-batch-btn planner-batch-btn-complete"
                              size="small"
                              type="primary"
                              icon={<CheckOutlined />}
                              loading={savingTask}
                              onClick={() => void handleBatchComplete()}
                            >
                              {t('planner.batchComplete', { count: selectedIds.size })}
                            </Button>
                            <Popconfirm
                              title={t('planner.batchConfirmDelete', { count: selectedIds.size })}
                              onConfirm={() => void handleBatchDelete()}
                              okText={t('planner.delete')}
                              cancelText={t('planner.cancel')}
                            >
                              <Button
                                className="planner-batch-btn planner-batch-btn-delete"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                loading={savingTask}
                              >
                                {t('planner.batchDelete', { count: selectedIds.size })}
                              </Button>
                            </Popconfirm>
                            <Button
                              className="planner-batch-btn planner-batch-btn-cancel"
                              size="small"
                              icon={<CloseOutlined />}
                              onClick={() => setSelectedIds(new Set())}
                            >
                              {t('planner.cancelSelection')}
                            </Button>
                          </Space>
                        </div>
                      ) : null}

                      {loadingTasks ? (
                        <Paragraph className="settings-copy">{t('planner.loadingTasks')}</Paragraph>
                      ) : filteredTaskListItems.length === 0 ? (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('planner.noTasks')} />
                      ) : (
                        <Space orientation="vertical" size={12} className="full-width">
                          {filteredTaskListItems.map((task) => (
                            <PlannerTaskItem
                              key={task.id}
                              task={task}
                              selectionMode={selectionMode}
                              selected={selectedIds.has(task.id)}
                              onSelect={handleSelect}
                              {...commonTaskProps}
                            />
                          ))}
                        </Space>
                      )}
                    </Space>
                  </Card>
                </div>
              </Space>
            </Col>
          </Row>

          <PlannerTaskDrawer
            open={plannerDrawerOpen}
            title={editingTaskId ? t('planner.formTitleEdit') : t('planner.formTitleAdd')}
            form={form}
            savingTask={savingTask}
            isEditing={Boolean(editingTaskId)}
            formCopy={t('planner.formCopy')}
            repeatHint={t('planner.repeatHint')}
            titleField={t('planner.titleField')}
            noteField={t('planner.noteField')}
            dateField={t('planner.dateField')}
            timeField={t('planner.timeField')}
            priorityField={t('planner.priorityField')}
            repeatField={t('planner.repeatField')}
            requiredTitle={t('planner.requiredTitle')}
            requiredDate={t('planner.requiredDate')}
            invalidDateRangeText={t('planner.invalidDateRange', { min: minPlannerDate, max: maxPlannerDate })}
            minPlannerDate={minPlannerDate}
            maxPlannerDate={maxPlannerDate}
            closeDrawerText={t('planner.closeDrawer')}
            saveAndNewActionText={t('planner.saveAndNew')}
            saveTaskText={t('planner.addTask')}
            priorityOptions={priorityOptions}
            repeatOptions={repeatOptions}
            onClose={closePlannerDrawer}
            onSubmit={handleSubmit}
          />
        </Space>
      )}
    </Space>
  )
}

export default PlannerPage
