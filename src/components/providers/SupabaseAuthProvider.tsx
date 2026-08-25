import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseClient, isSupabaseConfigured } from '../../lib/supabase/client'
import { ensureOwnProfile } from '../../lib/supabase/profilesApi'
import { getOwnUserAccess } from '../../lib/supabase/userAccessApi'
import type { AppUserAccessRecord } from '../../lib/supabase/types'

interface SupabaseAuthContextValue {
  configured: boolean
  loading: boolean
  session: Session | null
  user: User | null
  authError: string | null
  access: AppUserAccessRecord | null
  accessLoading: boolean
  isAdmin: boolean
  clearAuthError: () => void
  refreshAccess: () => Promise<void>
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
const OAUTH_RETURN_PATH_KEY = 'learneng-oauth-return-path'

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

function getOAuthErrorFromBrowserUrl(): string | null {
  const url = new URL(window.location.href)
  const searchError = url.searchParams.get('error_description') ?? url.searchParams.get('error')
  if (searchError) return searchError

  const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash
  const hashParams = new URLSearchParams(hash)
  return hashParams.get('error_description') ?? hashParams.get('error')
}

function saveOAuthReturnPath() {
  if (!window.location.hash.startsWith('#/')) {
    return
  }

  window.sessionStorage.setItem(OAUTH_RETURN_PATH_KEY, window.location.hash)
}

function restoreOAuthReturnPath() {
  const returnPath = window.sessionStorage.getItem(OAUTH_RETURN_PATH_KEY)

  if (!returnPath) {
    return
  }

  window.sessionStorage.removeItem(OAUTH_RETURN_PATH_KEY)

  if (window.location.hash !== returnPath) {
    window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}${returnPath}`)
  }
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
  const [authError, setAuthError] = useState<string | null>(() => getOAuthErrorFromBrowserUrl())
  const [access, setAccess] = useState<AppUserAccessRecord | null>(null)
  const [accessLoading, setAccessLoading] = useState(false)
  const sessionUserIdRef = useRef<string | null>(null)
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

      const nextUserId = data.session?.user.id ?? null
      if (sessionUserIdRef.current !== nextUserId) {
        setAccess(null)
        setAccessLoading(Boolean(data.session?.user.email))
      }
      sessionUserIdRef.current = nextUserId
      setSession(data.session)
      clearOAuthParamsFromBrowserUrl()
      if (data.session) {
        restoreOAuthReturnPath()
      }
      setLoading(false)
    })

    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      const nextUserId = nextSession?.user.id ?? null
      if (sessionUserIdRef.current !== nextUserId) {
        setAccess(null)
        setAccessLoading(Boolean(nextSession?.user.email))
      }
      sessionUserIdRef.current = nextUserId
      setSession(nextSession)
      clearOAuthParamsFromBrowserUrl()
      if (nextSession) {
        restoreOAuthReturnPath()
      }
      setLoading(false)
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!configured || !session?.user || access?.status !== 'active') {
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
  }, [access?.status, configured, session?.user])

  const refreshAccess = useCallback(async () => {
    const email = session?.user?.email
    if (!configured || !email) {
      setAccess(null)
      setAccessLoading(false)
      return
    }

    setAccessLoading(true)
    try {
      setAccess(await getOwnUserAccess(email))
    } catch {
      setAccess(null)
    } finally {
      setAccessLoading(false)
    }
  }, [configured, session?.user?.email])

  useEffect(() => {
    void refreshAccess()
  }, [refreshAccess])

  const value = useMemo<SupabaseAuthContextValue>(
    () => ({
      configured,
      loading,
      session,
      user: session?.user ?? null,
      authError,
      access,
      accessLoading,
      isAdmin: access?.role === 'admin' && access.status === 'active',
      clearAuthError: () => setAuthError(null),
      refreshAccess,
      signInWithGithub: async () => {
        const client = getSupabaseClient()

        if (!client) {
          throw new Error('Supabase chưa được cấu hình.')
        }

        setAuthError(null)
        saveOAuthReturnPath()
        const redirectTo = buildCleanRedirectUrl()
        const { error } = await client.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo,
          },
        })

        if (error) {
          setAuthError(error.message)
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
    [access, accessLoading, authError, configured, loading, refreshAccess, session],
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
