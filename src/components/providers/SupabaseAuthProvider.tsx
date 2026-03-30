import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseClient, isSupabaseConfigured } from '../../lib/supabase/client'

interface SupabaseAuthContextValue {
  configured: boolean
  loading: boolean
  session: Session | null
  user: User | null
  signInWithGithub: () => Promise<void>
  signOut: () => Promise<void>
}

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | null>(null)

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
      setLoading(false)
    })

    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

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

        const redirectTo = window.location.href
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
