import { requireSupabaseClient } from './client'
import type { ClassRosterRecord, ClassStudentRecord } from './types'
import type { ParsedStudent } from '../../pages/classRosters/types'

interface CreateClassRosterInput {
  name: string
  schoolYear: string
  sourceFileName: string
  students: ParsedStudent[]
}

export interface ClassStudentInput {
  rosterId: string
  userId: string
  className: string
  studentNumber?: string
  fullName: string
  gender?: string
  dateOfBirth?: string
  phoneNumber?: string
  isIc3?: boolean
  isTabn?: boolean
  hasAirConditioner?: boolean
  isInclusive?: boolean
  hasZalo?: boolean
  note?: string
}

async function syncRosterStudentCount(rosterId: string, userId: string): Promise<number> {
  const supabase = requireSupabaseClient()
  const { count, error: countError } = await supabase
    .from('class_students')
    .select('*', { count: 'exact', head: true })
    .eq('roster_id', rosterId)
    .eq('user_id', userId)
  if (countError) throw countError

  const studentCount = count ?? 0
  const { error: updateError } = await supabase
    .from('class_rosters')
    .update({ student_count: studentCount, updated_at: new Date().toISOString() })
    .eq('id', rosterId)
    .eq('user_id', userId)
  if (updateError) throw updateError
  return studentCount
}

function mapStudentInput(input: ClassStudentInput) {
  return {
    class_name: input.className.trim(),
    student_number: input.studentNumber?.trim() ?? '',
    full_name: input.fullName.trim(),
    gender: input.gender?.trim() ?? '',
    date_of_birth: input.dateOfBirth?.trim() ?? '',
    phone_number: input.phoneNumber?.trim() ?? '',
    is_ic3: input.isIc3 ?? false,
    is_tabn: input.isTabn ?? false,
    has_air_conditioner: input.hasAirConditioner ?? false,
    is_inclusive: input.isInclusive ?? false,
    has_zalo: input.hasZalo ?? false,
    note: input.note?.trim() ?? '',
  }
}

export async function listClassRosters(userId: string): Promise<ClassRosterRecord[]> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('class_rosters')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ClassRosterRecord[]
}

export async function listClassStudents(rosterId: string, userId: string): Promise<ClassStudentRecord[]> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('class_students')
    .select('*')
    .eq('roster_id', rosterId)
    .eq('user_id', userId)
    .order('class_name')
    .order('source_sheet')
    .order('source_row')
  if (error) throw error
  return (data ?? []) as ClassStudentRecord[]
}

export async function createClassRoster(input: CreateClassRosterInput): Promise<ClassRosterRecord> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase.rpc('create_class_roster_with_students', {
    p_name: input.name,
    p_school_year: input.schoolYear,
    p_source_file_name: input.sourceFileName,
    p_students: input.students,
  })
  if (error) throw error
  if (!data) throw new Error('Roster transaction returned no data.')
  return data as ClassRosterRecord
}

export async function deleteClassRoster(rosterId: string, userId: string): Promise<void> {
  const supabase = requireSupabaseClient()
  const { error } = await supabase.from('class_rosters').delete().eq('id', rosterId).eq('user_id', userId)
  if (error) throw error
}

export async function updateStudentZaloStatus(
  studentId: string,
  userId: string,
  hasZalo: boolean,
): Promise<ClassStudentRecord> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('class_students')
    .update({ has_zalo: hasZalo })
    .eq('id', studentId)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data as ClassStudentRecord
}

export async function createClassStudent(input: ClassStudentInput): Promise<ClassStudentRecord> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('class_students')
    .insert({ roster_id: input.rosterId, user_id: input.userId, ...mapStudentInput(input), extra_data: {}, source_sheet: 'manual', source_row: 0 })
    .select()
    .single()
  if (error) throw error
  await syncRosterStudentCount(input.rosterId, input.userId)
  return data as ClassStudentRecord
}

export async function updateClassStudent(
  studentId: string,
  input: ClassStudentInput,
): Promise<ClassStudentRecord> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('class_students')
    .update(mapStudentInput(input))
    .eq('id', studentId)
    .eq('roster_id', input.rosterId)
    .eq('user_id', input.userId)
    .select()
    .single()
  if (error) throw error
  return data as ClassStudentRecord
}

export async function deleteClassStudents(
  studentIds: string[],
  rosterId: string,
  userId: string,
): Promise<number> {
  if (!studentIds.length) return syncRosterStudentCount(rosterId, userId)
  const supabase = requireSupabaseClient()
  const { error } = await supabase
    .from('class_students')
    .delete()
    .in('id', studentIds)
    .eq('roster_id', rosterId)
    .eq('user_id', userId)
  if (error) throw error
  return syncRosterStudentCount(rosterId, userId)
}

export async function deleteClassStudentsByClass(
  rosterId: string,
  userId: string,
  className: string,
): Promise<number> {
  const supabase = requireSupabaseClient()
  const { error } = await supabase
    .from('class_students')
    .delete()
    .eq('roster_id', rosterId)
    .eq('user_id', userId)
    .eq('class_name', className)
  if (error) throw error
  return syncRosterStudentCount(rosterId, userId)
}
