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
import { useSupabaseAuth } from '../../components/providers/SupabaseAuthProvider'
import { usePlannerNotifications } from '../../contexts/plannerNotifications'
import { useI18n } from '../../i18n'
import {
  getTaskBucket,
  getTaskDueDate,
  isSameDay,
  type PlannerTask,
  type PlannerTaskPriority,
} from '../../lib/plannerStorage'
import PlannerOverviewGrid from './components/PlannerOverviewGrid'
import { exportPlannerWeeklyPdf } from './pdf'
import PlannerTaskDrawer from './components/PlannerTaskDrawer'
import PlannerTaskSection from './components/PlannerTaskSection'
import PlannerTaskItem from './components/PlannerTaskItem'
import { usePlannerTaskActions } from './hooks/usePlannerTaskActions'
import type {
  PlannerFormValues,
  PlannerPageProps,
  PlannerTaskListStatus,
} from './types'
import {
  formatDateInputValue,
  formatPlannerShortDate,
  formatTimeInputValue,
  getStartOfWeek,
} from './utils'
import PlannerWeeklyOverview from './components/PlannerWeeklyOverview'

const { Title, Paragraph, Text } = Typography

function PlannerPage({ onRegisterTopbarAction }: PlannerPageProps) {
  const { message } = AntdApp.useApp()
  const { language, t } = useI18n()
  const { configured, signInWithGithub, user } = useSupabaseAuth()
  const { loadingTasks, setTasks, taskLoadErrorVersion, tasks } = usePlannerNotifications()
  const [form] = Form.useForm<PlannerFormValues>()
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [plannerDrawerOpen, setPlannerDrawerOpen] = useState(false)
  const [savingTask, setSavingTask] = useState(false)
  const [taskListQuery, setTaskListQuery] = useState('')
  const [taskListDate, setTaskListDate] = useState('')
  const [taskListMonth, setTaskListMonth] = useState('')
  const [taskListStatus, setTaskListStatus] = useState<PlannerTaskListStatus>('completed')
  const [taskListDraftStatus, setTaskListDraftStatus] = useState<PlannerTaskListStatus>('completed')
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
  const reportedLoadErrorVersionRef = useRef(0)
  const [activeOverviewKey, setActiveOverviewKey] = useState<string | null>(null)
  const currentYear = new Date().getFullYear()
  const minPlannerDate = formatDateInputValue(new Date(currentYear - 1, 0, 1))
  const maxPlannerDate = formatDateInputValue(new Date(currentYear + 5, 11, 31))
  const weekLabels = useMemo(
    () => [
      t('planner.weekLabelMon'),
      t('planner.weekLabelTue'),
      t('planner.weekLabelWed'),
      t('planner.weekLabelThu'),
      t('planner.weekLabelFri'),
      t('planner.weekLabelSat'),
      t('planner.weekLabelSun'),
    ],
    [t],
  )

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

  useEffect(() => {
    if (taskLoadErrorVersion <= reportedLoadErrorVersionRef.current) return
    reportedLoadErrorVersionRef.current = taskLoadErrorVersion
    message.error(t('planner.loadError'))
  }, [message, t, taskLoadErrorVersion])

  const { bucketedTasks, todayPendingTasks, taskListItems } = useMemo(() => {
    const now = new Date()
    const nextBucketedTasks = {
      today: [] as PlannerTask[],
      upcoming: [] as PlannerTask[],
      overdue: [] as PlannerTask[],
      later: [] as PlannerTask[],
    }
    const nextTodayPendingTasks: PlannerTask[] = []
    const nextTaskListItems: PlannerTask[] = []

    tasks.forEach((task) => {
      const bucket = getTaskBucket(task, now)
      nextBucketedTasks[bucket].push(task)

      if (isSameDay(getTaskDueDate(task), now) && !task.completed) {
        nextTodayPendingTasks.push(task)
      }

      if (task.completed || bucket === 'overdue' || bucket === 'later') {
        nextTaskListItems.push(task)
      }
    })

    nextTaskListItems.sort((left, right) => {
      if (left.completed !== right.completed) return left.completed ? 1 : -1
      const leftDue = getTaskDueDate(left).getTime()
      const rightDue = getTaskDueDate(right).getTime()
      if (leftDue !== rightDue) return rightDue - leftDue
      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    })

    return {
      bucketedTasks: nextBucketedTasks,
      todayPendingTasks: nextTodayPendingTasks,
      taskListItems: nextTaskListItems,
    }
  }, [tasks])

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

  const {
    handleGithubSignIn,
    openCreateDrawer,
    closePlannerDrawer,
    handleQuickAdd,
    toggleSelectMode,
    handleSelect,
    handleBatchComplete,
    handleBatchDelete,
    handleDeleteByMonth,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleToggle,
  } = usePlannerTaskActions({
    userId: user?.id,
    signInWithGithub,
    message,
    t,
    form,
    tasks,
    selectedIds,
    taskListMonth,
    monthDeleteCandidates,
    quickTitle,
    quickDate,
    editingTaskId,
    minPlannerDate,
    maxPlannerDate,
    setTasks,
    setEditingTaskId,
    setPlannerDrawerOpen,
    setSavingTask,
    setQuickTitle,
    setQuickDate,
    setQuickAdding,
    setSelectionMode,
    setSelectedIds,
  })

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

  const taskStatusOptions = useMemo(
    () =>
      [
        { label: t('planner.taskStatusCompleted'), value: 'completed' },
        { label: t('planner.taskStatusOverdue'), value: 'overdue' },
        { label: t('planner.taskStatusLater'), value: 'later' },
      ] as const,
    [t],
  )

  const weeklyOverview = useMemo(() => {
    const today = new Date()
    const weekStart = getStartOfWeek(today)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    const tasksByDate = tasks.reduce<Map<string, PlannerTask[]>>((map, task) => {
      const current = map.get(task.dueDate)
      if (current) {
        current.push(task)
      } else {
        map.set(task.dueDate, [task])
      }

      return map
    }, new Map())
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + index)
      const iso = formatDateInputValue(date)
      const items = tasksByDate.get(iso) ?? []
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
      await exportPlannerWeeklyPdf({
        language,
        userEmail: user?.email,
        tasks,
        weeklyOverview,
        weeklyNote,
        priorityOptions,
        repeatOptions,
        t,
      })
    } catch {
      message.error(t('planner.pdfError'))
    } finally {
      setExportingPdf(false)
    }
  }, [language, message, priorityOptions, repeatOptions, t, tasks, user?.email, weeklyNote, weeklyOverview])

  const commonTaskProps = useMemo(
    () => ({
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
    }),
    [handleDelete, handleEdit, handleToggle, language, priorityOptions, repeatOptions, savingTask, t],
  )

  const commonSectionProps = useMemo(
    () => ({
      ...commonTaskProps,
      loading: loadingTasks,
      noTasksText: t('planner.noTasks'),
      loadingText: t('planner.loadingTasks'),
      repeatFieldLabel: t('planner.repeatField'),
    }),
    [commonTaskProps, loadingTasks, t],
  )

  return (
    <Space orientation="vertical" size={20} className="full-width">

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
                            month: taskListMonth || 'â€”',
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


