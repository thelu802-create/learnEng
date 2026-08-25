import { GithubOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useState } from 'react'
import type { PropsWithChildren } from 'react'
import { useI18n } from '../../i18n'
import { useSupabaseAuth } from '../providers/SupabaseAuthProvider'

const copy = {
  vi: {
    badge: 'Không gian làm việc nội bộ',
    title: 'Chào mừng đến với English Path',
    description: 'Đăng nhập bằng tài khoản GitHub đã được quản trị viên cấp quyền để tiếp tục.',
    signIn: 'Đăng nhập với GitHub',
    signingIn: 'Đang chuyển đến GitHub...',
    protected: 'Quyền truy cập được kiểm soát bằng tài khoản GitHub và Supabase.',
    deniedTitle: 'Tài khoản chưa được cấp quyền',
    deniedDescription: 'Email GitHub này chưa có trong danh sách được phép hoặc đã bị khóa.',
    deniedHint: 'Hãy liên hệ quản trị viên để được cấp quyền trước khi đăng nhập lại.',
    signOut: 'Đăng xuất tài khoản này',
    oauthError: 'Đăng nhập không thành công. Tài khoản có thể chưa được cấp quyền hoặc yêu cầu đã bị hủy.',
    notConfigured: 'Hệ thống đăng nhập chưa được cấu hình trong môi trường này.',
    genericError: 'Không thể bắt đầu đăng nhập GitHub. Vui lòng thử lại.',
    signOutError: 'Không thể đăng xuất tài khoản. Vui lòng thử lại.',
  },
  en: {
    badge: 'Internal workspace',
    title: 'Welcome to English Path',
    description: 'Sign in with a GitHub account authorized by an administrator to continue.',
    signIn: 'Continue with GitHub',
    signingIn: 'Redirecting to GitHub...',
    protected: 'Access is protected by GitHub authentication and Supabase.',
    deniedTitle: 'Account not authorized',
    deniedDescription: 'This GitHub email is not on the allowlist or has been disabled.',
    deniedHint: 'Contact an administrator for access before signing in again.',
    signOut: 'Sign out this account',
    oauthError: 'Sign-in failed. This account may not be authorized, or the request was cancelled.',
    notConfigured: 'Authentication is not configured in this environment.',
    genericError: 'Unable to start GitHub sign-in. Please try again.',
    signOutError: 'Unable to sign out this account. Please try again.',
  },
} as const

function AuthGate({ children }: PropsWithChildren) {
  const { language } = useI18n()
  const text = copy[language]
  const {
    configured,
    loading,
    session,
    user,
    authError,
    access,
    accessLoading,
    clearAuthError,
    signInWithGithub,
    signOut,
  } = useSupabaseAuth()
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSignIn = async () => {
    clearAuthError()
    setLocalError(null)
    setSubmitting(true)
    try {
      await signInWithGithub()
    } catch {
      setLocalError(text.genericError)
      setSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    setLocalError(null)
    setSubmitting(true)
    try {
      await signOut()
    } catch {
      setLocalError(text.signOutError)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || (session && accessLoading)) {
    return (
      <main className="auth-gate auth-gate-loading" aria-busy="true">
        <span className="auth-gate-spinner" />
      </main>
    )
  }

  const hasActiveAccess = Boolean(
    session
    && access?.status === 'active'
    && access.email.trim().toLowerCase() === session.user.email?.trim().toLowerCase(),
  )

  if (hasActiveAccess) return children

  const isDeniedSession = Boolean(session)
  const visibleError = localError ?? (authError ? text.oauthError : null)

  return (
    <main className="auth-gate">
      <div className="auth-gate-orb auth-gate-orb-one" />
      <div className="auth-gate-orb auth-gate-orb-two" />
      <section className="auth-gate-card" aria-labelledby="auth-gate-title">
        <div className="auth-gate-brand-mark" aria-hidden="true">EP</div>
        <div className="auth-gate-badge"><LockOutlined /> {text.badge}</div>
        <h1 id="auth-gate-title">{isDeniedSession ? text.deniedTitle : text.title}</h1>
        <p className="auth-gate-description">
          {isDeniedSession ? text.deniedDescription : text.description}
        </p>

        {isDeniedSession ? (
          <div className="auth-gate-denied">
            <strong>{user?.email ?? user?.user_metadata.user_name}</strong>
            <span>{text.deniedHint}</span>
          </div>
        ) : null}

        {visibleError ? <div className="auth-gate-alert" role="alert">{visibleError}</div> : null}
        {!configured ? <div className="auth-gate-alert" role="alert">{text.notConfigured}</div> : null}

        {isDeniedSession ? (
          <button className="auth-gate-button auth-gate-button-secondary" type="button" onClick={handleSignOut} disabled={submitting}>
            {text.signOut}
          </button>
        ) : (
          <button className="auth-gate-button" type="button" onClick={handleSignIn} disabled={!configured || submitting}>
            <GithubOutlined />
            {submitting ? text.signingIn : text.signIn}
          </button>
        )}

        <div className="auth-gate-security"><SafetyCertificateOutlined /> {text.protected}</div>
      </section>
    </main>
  )
}

export default AuthGate
