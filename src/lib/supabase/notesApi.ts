import { requireSupabaseClient } from './client'
import type { TeacherNoteRecord } from './types'

export async function listTeacherNotes(userId: string): Promise<TeacherNoteRecord[]> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('teacher_notes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as TeacherNoteRecord[]
}

export async function upsertTeacherNote(input: {
  userId: string
  gradeKey: string
  topicKey: string
  content: string
}): Promise<TeacherNoteRecord> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('teacher_notes')
    .upsert(
      {
        user_id: input.userId,
        grade_key: input.gradeKey,
        topic_key: input.topicKey,
        content: input.content,
      },
      {
        onConflict: 'user_id,grade_key,topic_key',
      },
    )
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as TeacherNoteRecord
}
