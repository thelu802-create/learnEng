import type { User } from '@supabase/supabase-js'
import { requireSupabaseClient } from './client'
import type { ProfileRecord } from './types'

function getDerivedDisplayName(user: User): string {
  const metadata = user.user_metadata ?? {}
  const candidates = [
    metadata.full_name,
    metadata.name,
    metadata.user_name,
    metadata.preferred_username,
    user.email?.split('@')[0],
  ]

  const displayName = candidates.find((value) => typeof value === 'string' && value.trim().length > 0)
  return typeof displayName === 'string' ? displayName.trim() : 'Teacher'
}

export async function getOwnProfile(userId: string): Promise<ProfileRecord | null> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()

  if (error) {
    throw error
  }

  return (data as ProfileRecord | null) ?? null
}

export async function ensureOwnProfile(user: User): Promise<ProfileRecord> {
  const supabase = requireSupabaseClient()
  const existingProfile = await getOwnProfile(user.id)

  if (existingProfile) {
    if (existingProfile.display_name?.trim()) {
      return existingProfile
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        display_name: getDerivedDisplayName(user),
      })
      .eq('id', user.id)
      .select('*')
      .single()

    if (error) {
      throw error
    }

    return data as ProfileRecord
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      display_name: getDerivedDisplayName(user),
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data as ProfileRecord
}
