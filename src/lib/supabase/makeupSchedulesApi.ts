import { requireSupabaseClient } from './client'
import type { MakeupScheduleInput, MakeupScheduleRecord, MakeupScheduleStatus } from './types'

export async function listMakeupSchedules(userId: string): Promise<MakeupScheduleRecord[]> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('makeup_schedules')
    .select('*')
    .eq('user_id', userId)
    .order('makeup_date', { ascending: true })
    .order('makeup_time', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as MakeupScheduleRecord[]
}

export async function createMakeupScheduleRecord(input: MakeupScheduleInput): Promise<MakeupScheduleRecord> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('makeup_schedules')
    .insert({
      user_id: input.userId,
      class_name: input.className,
      missed_date: input.missedDate,
      makeup_date: input.makeupDate,
      makeup_time: input.makeupTime ?? '',
      note: input.note ?? '',
      status: input.status ?? 'planned',
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as MakeupScheduleRecord
}

export async function updateMakeupScheduleStatus(
  itemId: string,
  userId: string,
  status: MakeupScheduleStatus,
): Promise<MakeupScheduleRecord> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('makeup_schedules')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as MakeupScheduleRecord
}

export async function deleteMakeupScheduleRecord(itemId: string, userId: string): Promise<void> {
  const supabase = requireSupabaseClient()
  const { error } = await supabase
    .from('makeup_schedules')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId)

  if (error) {
    throw error
  }
}
