import { useEffect, useMemo, useState } from 'react'
import { ConfigProvider, Layout, theme as antdTheme } from 'antd'
import './App.css'
import AppSidebar from './components/layout/AppSidebar'
import AppTopbar from './components/layout/AppTopbar'
import { menuItems } from './constants/navigation'
import { gradeContent, learningSteps } from './data'
import HomePage from './pages/HomePage'
import HelpPage from './pages/HelpPage'
import LessonsPage from './pages/LessonsPage'
import PracticePage from './pages/PracticePage'
import ProgressPage from './pages/ProgressPage'
import I18nProvider from './components/providers/I18nProvider'
import type { FontSizeMode, GradeKey, MenuKey, ThemeMode } from './types'

const { Content } = Layout
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
  if (fontSizeMode === 'sm') {
    return 13
  }

  if (fontSizeMode === 'lg') {
    return 17
  }

  return 15
}

function App() {
  const gradeOptions = Object.keys(gradeContent) as GradeKey[]
  const [selectedMenu, setSelectedMenu] = useState<MenuKey>('home')
  const [selectedGrade, setSelectedGrade] = useState<GradeKey>(() => gradeOptions[0] ?? 'Lá»›p 6')
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode)
  const [fontSizeMode, setFontSizeMode] = useState<FontSizeMode>(getInitialFontSizeMode)

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode)
    document.body.classList.toggle('theme-dark-body', themeMode === 'dark')
  }, [themeMode])

  useEffect(() => {
    window.localStorage.setItem(FONT_SIZE_STORAGE_KEY, fontSizeMode)
  }, [fontSizeMode])

  const currentGrade = useMemo(() => gradeContent[selectedGrade], [selectedGrade])

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
        borderRadius: 18,
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

  const renderPage = () => {
    if (selectedMenu === 'lessons') {
      return <LessonsPage {...pageProps} />
    }

    if (selectedMenu === 'practice') {
      return <PracticePage {...pageProps} learningSteps={learningSteps} />
    }

    if (selectedMenu === 'progress') {
      return <ProgressPage {...pageProps} />
    }

    if (selectedMenu === 'help') {
      return <HelpPage />
    }

    return (
      <HomePage
        {...pageProps}
        onOpenLessons={() => setSelectedMenu('lessons')}
        onOpenPractice={() => setSelectedMenu('practice')}
      />
    )
  }

  return (
    <I18nProvider>
      <ConfigProvider theme={themeConfig}>
        <Layout className={`app-shell ${themeMode === 'dark' ? 'theme-dark' : 'theme-light'}`}>
          <AppSidebar
            menuItems={menuItems}
            selectedMenu={selectedMenu}
            onMenuChange={setSelectedMenu}
          />

          <Layout className="main-layout">
            <AppTopbar
              selectedGrade={selectedGrade}
              gradeOptions={gradeOptions}
              onGradeChange={setSelectedGrade}
              themeMode={themeMode}
              onThemeChange={setThemeMode}
              fontSizeMode={fontSizeMode}
              onFontSizeChange={setFontSizeMode}
            />

            <Content className="app-content">
              <div className="content-shell">{renderPage()}</div>
            </Content>
          </Layout>
        </Layout>
      </ConfigProvider>
    </I18nProvider>
  )
}

export default App
