import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseClient, isSupabaseConfigured } from '../../lib/supabase/client'
import { ensureOwnProfile } from '../../lib/supabase/profilesApi'

interface SupabaseAuthContextValue {
  configured: boolean
  loading: boolean
  session: Session | null
  user: User | null
  signInWithGithub: () => Promise<void>
  signOut: () => Promise<void>
}

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | null>(null)

const OAUTH_URL_PARAM_KEYS = [
  'access_token',
  'code',
  'error',
  'error_code',
  'error_description',
  'expires_at',
  'expires_in',
  'provider_token',
  'refresh_token',
  'state',
  'token_type',
] as const

function removeOAuthParams(params: URLSearchParams): boolean {
  let changed = false

  OAUTH_URL_PARAM_KEYS.forEach((key) => {
    if (params.has(key)) {
      params.delete(key)
      changed = true
    }
  })

  return changed
}

function buildCleanRedirectUrl() {
  const url = new URL(window.location.href)
  removeOAuthParams(url.searchParams)
  url.hash = ''
  return url.toString()
}

function clearOAuthParamsFromBrowserUrl() {
  const currentUrl = new URL(window.location.href)
  const searchChanged = removeOAuthParams(currentUrl.searchParams)
  const hash = currentUrl.hash.startsWith('#') ? currentUrl.hash.slice(1) : currentUrl.hash
  const hashParams = new URLSearchParams(hash)
  const hashChanged = removeOAuthParams(hashParams)

  if (!searchChanged && !hashChanged) {
    return
  }

  currentUrl.hash = hashChanged && hashParams.toString() ? `#${hashParams.toString()}` : ''
  window.history.replaceState({}, document.title, currentUrl.toString())
}

function SupabaseAuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const configured = isSupabaseConfigured()

  useEffect(() => {
    const client = getSupabaseClient()

    if (!client) {
      setLoading(false)
      return
    }

    let active = true

    client.auth.getSession().then(({ data }) => {
      if (!active) {
        return
      }

      setSession(data.session)
      clearOAuthParamsFromBrowserUrl()
      setLoading(false)
    })

    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      clearOAuthParamsFromBrowserUrl()
      setLoading(false)
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!configured || !session?.user) {
      return
    }

    let cancelled = false

    ensureOwnProfile(session.user).catch(() => {
      if (cancelled) {
        return
      }
    })

    return () => {
      cancelled = true
    }
  }, [configured, session?.user])

  const value = useMemo<SupabaseAuthContextValue>(
    () => ({
      configured,
      loading,
      session,
      user: session?.user ?? null,
      signInWithGithub: async () => {
        const client = getSupabaseClient()

        if (!client) {
          throw new Error('Supabase chưa được cấu hình.')
        }

        const redirectTo = buildCleanRedirectUrl()
        const { error } = await client.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo,
          },
        })

        if (error) {
          throw error
        }
      },
      signOut: async () => {
        const client = getSupabaseClient()

        if (!client) {
          return
        }

        const { error } = await client.auth.signOut()

        if (error) {
          throw error
        }
      },
    }),
    [configured, loading, session],
  )

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext)

  if (!context) {
    throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider.')
  }

  return context
}

export default SupabaseAuthProvider
