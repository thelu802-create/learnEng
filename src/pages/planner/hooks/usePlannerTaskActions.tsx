import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { Button, Space } from 'antd'
import type { FormInstance } from 'antd'
import type { MessageInstance } from 'antd/es/message/interface'
import type { PlannerTask } from '../../../lib/plannerStorage'
import { shiftPlannerTaskAfterCompletion, sortPlannerTasks } from '../../../lib/plannerStorage'
import {
  createPlannerTaskRecord,
  deleteMultiplePlannerTaskRecords,
  deletePlannerTaskRecord,
  updatePlannerTaskRecord,
} from '../../../lib/supabase/plannerApi'
import type { PlannerFormValues } from '../types'
import { formatDateInputValue, formatTimeInputValue, openDrawerNextFrame } from '../utils'

interface UsePlannerTaskActionsOptions {
  userId?: string
  signInWithGithub: () => Promise<unknown>
  message: MessageInstance
  t: (key: string, params?: Record<string, string | number>) => string
  form: FormInstance<PlannerFormValues>
  tasks: PlannerTask[]
  selectedIds: Set<string>
  taskListMonth: string
  monthDeleteCandidates: PlannerTask[]
  quickTitle: string
  quickDate: string
  editingTaskId: string | null
  minPlannerDate: string
  maxPlannerDate: string
  setTasks: Dispatch<SetStateAction<PlannerTask[]>>
  setEditingTaskId: Dispatch<SetStateAction<string | null>>
  setPlannerDrawerOpen: Dispatch<SetStateAction<boolean>>
  setSavingTask: Dispatch<SetStateAction<boolean>>
  setQuickTitle: Dispatch<SetStateAction<string>>
  setQuickDate: Dispatch<SetStateAction<string>>
  setQuickAdding: Dispatch<SetStateAction<boolean>>
  setSelectionMode: Dispatch<SetStateAction<boolean>>
  setSelectedIds: Dispatch<SetStateAction<Set<string>>>
}

export function usePlannerTaskActions({
  userId,
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
}: UsePlannerTaskActionsOptions) {
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

  const applySavedTask = useCallback(
    (savedTask: Awaited<ReturnType<typeof createPlannerTaskRecord>>) => {
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
    },
    [mapRecordToTask, setTasks],
  )

  const handleGithubSignIn = useCallback(async () => {
    try {
      await signInWithGithub()
    } catch {
      message.error(t('planner.signInError'))
    }
  }, [message, signInWithGithub, t])

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
  }, [form, setEditingTaskId, setPlannerDrawerOpen])

  const closePlannerDrawer = useCallback(() => {
    setPlannerDrawerOpen(false)
    setEditingTaskId(null)
  }, [setEditingTaskId, setPlannerDrawerOpen])

  const handleQuickAdd = useCallback(async () => {
    if (!userId || !quickTitle.trim()) return
    setQuickAdding(true)
    try {
      const saved = await createPlannerTaskRecord({
        userId,
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
  }, [
    applySavedTask,
    message,
    quickDate,
    quickTitle,
    setQuickAdding,
    setQuickDate,
    setQuickTitle,
    t,
    userId,
  ])

  const toggleSelectMode = useCallback(() => {
    setSelectionMode((prev) => {
      if (prev) setSelectedIds(new Set())
      return !prev
    })
  }, [setSelectedIds, setSelectionMode])

  const handleSelect = useCallback(
    (taskId: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (next.has(taskId)) next.delete(taskId)
        else next.add(taskId)
        return next
      })
    },
    [setSelectedIds],
  )

  const handleBatchComplete = useCallback(async () => {
    if (!userId || selectedIds.size === 0) return
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
            userId,
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
  }, [applySavedTask, message, selectedIds, setSavingTask, setSelectedIds, setSelectionMode, t, tasks, userId])

  const handleBatchDelete = useCallback(async () => {
    if (!userId || selectedIds.size === 0) return
    setSavingTask(true)
    try {
      const ids = [...selectedIds]
      await deleteMultiplePlannerTaskRecords(ids, userId)
      setTasks((current) => sortPlannerTasks(current.filter((task) => !ids.includes(task.id))))
      setSelectedIds(new Set())
      setSelectionMode(false)
      message.success(t('planner.deleted'))
    } catch {
      message.error(t('planner.loadError'))
    } finally {
      setSavingTask(false)
    }
  }, [message, selectedIds, setSavingTask, setSelectedIds, setSelectionMode, setTasks, t, userId])

  const handleDeleteByMonth = useCallback(async () => {
    if (!userId || !taskListMonth || monthDeleteCandidates.length === 0) return
    setSavingTask(true)
    try {
      const ids = monthDeleteCandidates.map((task) => task.id)
      await deleteMultiplePlannerTaskRecords(ids, userId)
      setTasks((current) => sortPlannerTasks(current.filter((task) => !ids.includes(task.id))))
      setSelectedIds((current) => new Set([...current].filter((id) => !ids.includes(id))))
      message.success(t('planner.monthDeleteSuccess', { count: ids.length }))
    } catch {
      message.error(t('planner.loadError'))
    } finally {
      setSavingTask(false)
    }
  }, [
    message,
    monthDeleteCandidates,
    setSavingTask,
    setSelectedIds,
    setTasks,
    t,
    taskListMonth,
    userId,
  ])

  const handleSubmit = useCallback(
    async (keepOpen = false) => {
      if (!userId) return
      const values = await form.validateFields()

      if (values.dueDate < minPlannerDate || values.dueDate > maxPlannerDate) {
        message.warning(t('planner.invalidDateRange', { min: minPlannerDate, max: maxPlannerDate }))
        return
      }

      try {
        setSavingTask(true)
        const saved = editingTaskId
          ? await updatePlannerTaskRecord(editingTaskId, {
              userId,
              title: values.title,
              note: values.note,
              dueDate: values.dueDate,
              dueTime: values.dueTime,
              priority: values.priority,
              repeatPattern: values.repeatPattern ?? null,
              completed: tasks.find((task) => task.id === editingTaskId)?.completed ?? false,
            })
          : await createPlannerTaskRecord({
              userId,
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
    },
    [
      applySavedTask,
      closePlannerDrawer,
      editingTaskId,
      form,
      maxPlannerDate,
      message,
      minPlannerDate,
      setSavingTask,
      t,
      tasks,
      userId,
    ],
  )

  const handleEdit = useCallback(
    (task: PlannerTask) => {
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
    },
    [form, setEditingTaskId, setPlannerDrawerOpen],
  )

  const handleDelete = useCallback(
    async (taskId: string) => {
      if (!userId) return
      try {
        setSavingTask(true)
        await deletePlannerTaskRecord(taskId, userId)
        setTasks((current) => sortPlannerTasks(current.filter((task) => task.id !== taskId)))
        if (editingTaskId === taskId) closePlannerDrawer()
        message.success(t('planner.deleted'))
      } catch {
        message.error(t('planner.loadError'))
      } finally {
        setSavingTask(false)
      }
    },
    [closePlannerDrawer, editingTaskId, message, setSavingTask, setTasks, t, userId],
  )

  const handleUndoCompletion = useCallback(
    async (task: PlannerTask) => {
      if (!userId) return
      try {
        setSavingTask(true)
        const restored = await updatePlannerTaskRecord(task.id, {
          userId,
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
    },
    [applySavedTask, message, setSavingTask, t, userId],
  )

  const handleToggle = useCallback(
    async (task: PlannerTask) => {
      if (!userId) return
      try {
        setSavingTask(true)
        const shiftedTask = shiftPlannerTaskAfterCompletion(task)
        const saved = await updatePlannerTaskRecord(task.id, {
          userId,
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
    },
    [applySavedTask, handleUndoCompletion, message, setSavingTask, t, userId],
  )

  return {
    applySavedTask,
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
  }
}
