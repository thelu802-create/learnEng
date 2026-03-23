import { useMemo, useState } from 'react'
import { ConfigProvider, Layout } from 'antd'
import './App.css'
import AppSidebar from './components/layout/AppSidebar'
import AppTopbar from './components/layout/AppTopbar'
import { menuItems } from './constants/navigation'
import { gradeContent, learningSteps } from './data'
import HomePage from './pages/HomePage'
import LessonsPage from './pages/LessonsPage'
import PracticePage from './pages/PracticePage'
import ProgressPage from './pages/ProgressPage'

const { Content } = Layout

function App() {
  const gradeOptions = Object.keys(gradeContent)
  const [selectedMenu, setSelectedMenu] = useState('home')
  const [selectedGrade, setSelectedGrade] = useState('Lớp 6')

  const currentGrade = useMemo(() => gradeContent[selectedGrade], [selectedGrade])

  const pageProps = {
    selectedGrade,
    currentGrade,
  }

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

    return (
      <HomePage
        {...pageProps}
        onOpenLessons={() => setSelectedMenu('lessons')}
        onOpenPractice={() => setSelectedMenu('practice')}
      />
    )
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2a9d8f',
          colorInfo: '#2a9d8f',
          colorSuccess: '#2a9d8f',
          borderRadius: 18,
          fontFamily:
            "'Be Vietnam Pro', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          colorText: '#171717',
          colorTextSecondary: '#4b5563',
          colorBgLayout: '#ffffff',
          colorBgContainer: '#ffffff',
          colorBorderSecondary: '#e8edf2',
        },
      }}
    >
      <Layout className="app-shell">
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
          />

          <Content className="app-content">
            <div className="content-shell">{renderPage()}</div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export default App
