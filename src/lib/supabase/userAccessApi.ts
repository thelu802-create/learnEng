import { requireSupabaseClient } from './client'
import type { AppUserAccessRecord, AppUserRole, AppUserStatus } from './types'

export async function getOwnUserAccess(email: string): Promise<AppUserAccessRecord | null> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('app_user_allowlist')
    .select('*')
  if (error) throw error
  const normalizedEmail = email.trim().toLowerCase()
  return ((data ?? []) as AppUserAccessRecord[]).find(
    (record) => record.email.trim().toLowerCase() === normalizedEmail,
  ) ?? null
}

export async function listUserAccessRecords(): Promise<AppUserAccessRecord[]> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('app_user_allowlist')
    .select('*')
    .order('role', { ascending: true })
    .order('email', { ascending: true })
  if (error) throw error
  return (data ?? []) as AppUserAccessRecord[]
}

export async function createUserAccessRecord(
  email: string,
  role: AppUserRole,
  createdBy: string,
): Promise<AppUserAccessRecord> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('app_user_allowlist')
    .insert({ email: email.trim().toLowerCase(), role, status: 'active', created_by: createdBy })
    .select()
    .single()
  if (error) throw error
  return data as AppUserAccessRecord
}

export async function updateUserAccessRecord(
  id: string,
  role: AppUserRole,
  status: AppUserStatus,
): Promise<AppUserAccessRecord> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('app_user_allowlist')
    .update({ role, status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as AppUserAccessRecord
}

export async function deleteUserAccessRecord(id: string): Promise<void> {
  const supabase = requireSupabaseClient()
  const { error } = await supabase.from('app_user_allowlist').delete().eq('id', id)
  if (error) throw error
}
