import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

let cachedClient: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null
  }

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }

  return cachedClient
}

export function requireSupabaseClient(): SupabaseClient {
  const client = getSupabaseClient()

  if (!client) {
    throw new Error(
      'Supabase chua duoc cau hinh. Hay them VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY vao file env.',
    )
  }

  return client
}
