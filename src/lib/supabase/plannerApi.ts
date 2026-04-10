import { requireSupabaseClient } from './client'
import type { PlannerTaskInput, PlannerTaskRecord } from './types'

export async function listPlannerTasks(userId: string): Promise<PlannerTaskRecord[]> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('planner_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true })
    .order('due_time', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as PlannerTaskRecord[]
}

export async function createPlannerTaskRecord(input: PlannerTaskInput): Promise<PlannerTaskRecord> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('planner_tasks')
    .insert({
      user_id: input.userId,
      title: input.title,
      note: input.note ?? '',
      due_date: input.dueDate,
      due_time: input.dueTime ?? '',
      priority: input.priority ?? 'medium',
      repeat_weekly: input.repeatPattern === 'weekly',
      repeat_pattern: input.repeatPattern ?? null,
      completed: input.completed ?? false,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as PlannerTaskRecord
}

export async function updatePlannerTaskRecord(
  taskId: string,
  input: PlannerTaskInput,
): Promise<PlannerTaskRecord> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('planner_tasks')
    .update({
      title: input.title,
      note: input.note ?? '',
      due_date: input.dueDate,
      due_time: input.dueTime ?? '',
      priority: input.priority ?? 'medium',
      repeat_weekly: input.repeatPattern === 'weekly',
      repeat_pattern: input.repeatPattern ?? null,
      completed: input.completed ?? false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .eq('user_id', input.userId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as PlannerTaskRecord
}

export async function deletePlannerTaskRecord(taskId: string, userId: string): Promise<void> {
  const supabase = requireSupabaseClient()
  const { error } = await supabase
    .from('planner_tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId)

  if (error) {
    throw error
  }
}

export async function deleteMultiplePlannerTaskRecords(taskIds: string[], userId: string): Promise<void> {
  const supabase = requireSupabaseClient()
  const { error } = await supabase
    .from('planner_tasks')
    .delete()
    .in('id', taskIds)
    .eq('user_id', userId)

  if (error) {
    throw error
  }
}
