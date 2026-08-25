import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { App as AntdApp, ConfigProvider, Layout, Spin, theme as antdTheme } from 'antd'
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import AuthGate from './components/auth/AuthGate'
import AppGradeBar from './components/layout/AppGradeBar'
import AppSidebar from './components/layout/AppSidebar'
import AppTopbar from './components/layout/AppTopbar'
import I18nProvider from './components/providers/I18nProvider'
import PlannerNotificationsProvider from './components/providers/PlannerNotificationsProvider'
import SupabaseAuthProvider, { useSupabaseAuth } from './components/providers/SupabaseAuthProvider'
import { getExternalMenuUrl, getMenuKeyFromPath, getMenuPath, menuItems } from './constants/navigation'
import { gradeContent, learningSteps } from './data'
import type { FontSizeMode, GradeKey, MenuKey, ThemeMode } from './types'

const { Content } = Layout
const HomePage = lazy(() => import('./pages/home/HomePage'))
const HelpPage = lazy(() => import('./pages/HelpPage'))
const LessonsPage = lazy(() => import('./pages/lessons/LessonsPage'))
const MakeupSchedulePage = lazy(() => import('./pages/makeupSchedule/MakeupSchedulePage'))
const ClassRostersPage = lazy(() => import('./pages/classRosters/ClassRostersPage'))
const UserManagementPage = lazy(() => import('./pages/userManagement/UserManagementPage'))
const OfficeTipsPage = lazy(() => import('./pages/officeTips/OfficeTipsPage'))
const PlannerPage = lazy(() => import('./pages/planner/PlannerPage'))
const PlaygroundPage = lazy(() => import('./pages/PlaygroundPage'))
const PracticePage = lazy(() => import('./pages/practice/PracticePage'))
const ProgressPage = lazy(() => import('./pages/ProgressPage'))
const THEME_STORAGE_KEY = 'learneng-theme'
const FONT_SIZE_STORAGE_KEY = 'learneng-font-size'

function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
}

function getInitialFontSizeMode(): FontSizeMode {
  if (typeof window === 'undefined') {
    return 'md'
  }

  const savedFontSize = window.localStorage.getItem(FONT_SIZE_STORAGE_KEY)
  return savedFontSize === 'sm' || savedFontSize === 'lg' ? savedFontSize : 'md'
}

function getFontSizeValue(fontSizeMode: FontSizeMode): number {
  if (fontSizeMode === 'sm') return 13
  if (fontSizeMode === 'lg') return 17
  return 15
}

function AppShell() {
  const { isAdmin } = useSupabaseAuth()
  const gradeOptions = Object.keys(gradeContent) as GradeKey[]
  const location = useLocation()
  const navigate = useNavigate()
  const currentMenu = useMemo(() => getMenuKeyFromPath(location.pathname), [location.pathname])
  const [selectedGrade, setSelectedGrade] = useState<GradeKey>(() => gradeOptions[0] ?? 'Lớp 6')
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode)
  const [fontSizeMode, setFontSizeMode] = useState<FontSizeMode>(getInitialFontSizeMode)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [topbarPageActionLabel, setTopbarPageActionLabel] = useState<string | null>(null)
  const [topbarPageActionHandler, setTopbarPageActionHandler] = useState<(() => void) | null>(null)

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode)
    document.body.classList.toggle('theme-dark-body', themeMode === 'dark')
  }, [themeMode])

  useEffect(() => {
    window.localStorage.setItem(FONT_SIZE_STORAGE_KEY, fontSizeMode)
  }, [fontSizeMode])

  useEffect(() => {
    if (currentMenu !== 'planner') {
      setTopbarPageActionLabel(null)
      setTopbarPageActionHandler(null)
    }
  }, [currentMenu])

  const currentGrade = useMemo(() => gradeContent[selectedGrade], [selectedGrade])
  const visibleMenuItems = useMemo(
    () => menuItems.filter((item) => item.key !== 'userManagement' || isAdmin),
    [isAdmin],
  )
  const showGradeBar =
    currentMenu === 'home' ||
    currentMenu === 'lessons' ||
    currentMenu === 'practice' ||
    currentMenu === 'playground' ||
    currentMenu === 'progress'

  const registerTopbarPageAction = useCallback((label: string | null, handler: (() => void) | null) => {
    setTopbarPageActionLabel(label)
    setTopbarPageActionHandler(() => handler)
  }, [])

  const openMenu = useCallback(
    (menuKey: MenuKey) => {
      const externalUrl = getExternalMenuUrl(menuKey)
      if (externalUrl) {
        window.open(externalUrl, '_blank', 'noopener,noreferrer')
        setIsMobileMenuOpen(false)
        return
      }

      navigate(getMenuPath(menuKey))
      setIsMobileMenuOpen(false)
    },
    [navigate],
  )

  const pageProps = {
    selectedGrade,
    currentGrade,
  }

  const themeConfig = useMemo(
    () => ({
      algorithm: themeMode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: '#2a9d8f',
        colorInfo: '#2a9d8f',
        colorSuccess: '#2a9d8f',
        colorError: '#e76f51',
        borderRadius: 12,
        fontSize: getFontSizeValue(fontSizeMode),
        fontFamily: "'Be Vietnam Pro', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        colorText: themeMode === 'dark' ? '#f3f7f9' : '#171717',
        colorTextSecondary: themeMode === 'dark' ? '#b7c4cb' : '#4b5563',
        colorBgLayout: themeMode === 'dark' ? '#09141a' : '#ffffff',
        colorBgContainer: themeMode === 'dark' ? '#102028' : '#ffffff',
        colorBorderSecondary: themeMode === 'dark' ? '#1f3641' : '#e8edf2',
      },
    }),
    [fontSizeMode, themeMode],
  )

  return (
    <ConfigProvider theme={themeConfig}>
      <AntdApp>
        <Layout className={`app-shell ${themeMode === 'dark' ? 'theme-dark' : 'theme-light'}`}>
          <AppSidebar
            menuItems={visibleMenuItems}
            selectedMenu={currentMenu}
            onMenuChange={openMenu}
            isMobileOpen={isMobileMenuOpen}
            onMobileClose={() => setIsMobileMenuOpen(false)}
          />

          <Layout className="main-layout">
            <AppTopbar
              currentMenu={currentMenu}
              themeMode={themeMode}
              onThemeChange={setThemeMode}
              fontSizeMode={fontSizeMode}
              onFontSizeChange={setFontSizeMode}
              onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
              pageActionLabel={topbarPageActionLabel}
              onPageAction={topbarPageActionHandler}
            />

            <Content className="app-content">
              <div className="content-shell">
                {showGradeBar ? (
                  <AppGradeBar
                    selectedGrade={selectedGrade}
                    gradeOptions={gradeOptions}
                    onGradeChange={setSelectedGrade}
                  />
                ) : null}
                <Suspense
                  fallback={
                    <div className="page-loading-shell">
                      <Spin size="large" />
                    </div>
                  }
                >
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <HomePage
                          {...pageProps}
                          onOpenLessons={() => openMenu('lessons')}
                          onOpenPlanner={() => openMenu('planner')}
                          onOpenPractice={() => openMenu('practice')}
                        />
                      }
                    />
                    <Route path="/lessons" element={<LessonsPage {...pageProps} />} />
                    <Route path="/practice" element={<PracticePage {...pageProps} learningSteps={learningSteps} />} />
                    <Route path="/planner" element={<PlannerPage onRegisterTopbarAction={registerTopbarPageAction} />} />
                    <Route path="/makeup-schedule" element={<MakeupSchedulePage />} />
                    <Route path="/class-rosters" element={<ClassRostersPage />} />
                    <Route path="/user-management" element={<UserManagementPage />} />
                    <Route path="/playground" element={<PlaygroundPage {...pageProps} />} />
                    <Route path="/progress" element={<ProgressPage {...pageProps} />} />
                    <Route path="/office-tips" element={<OfficeTipsPage />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </div>
            </Content>
          </Layout>
        </Layout>
      </AntdApp>
    </ConfigProvider>
  )
}

function App() {
  return (
    <I18nProvider>
      <SupabaseAuthProvider>
        <HashRouter>
          <AuthGate>
            <PlannerNotificationsProvider>
              <AppShell />
            </PlannerNotificationsProvider>
          </AuthGate>
        </HashRouter>
      </SupabaseAuthProvider>
    </I18nProvider>
  )
}

export default App
