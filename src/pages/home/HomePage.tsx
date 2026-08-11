import {
  ArrowRightOutlined,
  BellOutlined,
  BookOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  ProfileOutlined,
  RadarChartOutlined,
  SoundOutlined,
} from '@ant-design/icons'
import { App, Button, Card, Col, Progress, Row, Space, Tag, Typography } from 'antd'
import { useSupabaseAuth } from '../../components/providers/SupabaseAuthProvider'
import { usePlannerNotifications } from '../../contexts/plannerNotifications'
import { useI18n } from '../../i18n'
import { formatTaskDate, getWeekdayLabel } from '../../lib/plannerStorage'
import { useHomePlannerSummary } from './hooks/useHomePlannerSummary'
import type { HomePageProps } from './types'

const { Title, Paragraph, Text } = Typography

function HomePage({
  selectedGrade,
  currentGrade,
  onOpenLessons,
  onOpenPlanner,
  onOpenPractice,
}: HomePageProps) {
  const { gradeLabel, language, t } = useI18n()
  const { message } = App.useApp()
  const { user } = useSupabaseAuth()
  const browserNotifications = usePlannerNotifications()
  const { reminderTasks, plannerStats, weeklyPlanner, getReminderStatus } = useHomePlannerSummary(
    browserNotifications.tasks,
  )

  const topicCount = currentGrade.vocabularyTopics.length
  const wordCount = currentGrade.vocabularyTopics.reduce((total, topic) => total + topic.words.length, 0)
  const skillCount = currentGrade.skills.length
  const unitCount = currentGrade.units.length
  const featuredUnit = currentGrade.units[0]
  const featuredTopic = currentGrade.vocabularyTopics[0]
  const coverageItems = [
    { label: t('home.coverageUnits'), value: unitCount, percent: Math.min(unitCount * 20, 100), color: '#2a9d8f' },
    { label: t('home.coverageWords'), value: wordCount, percent: Math.min(wordCount, 100), color: '#4fb3a8' },
    { label: t('home.coverageTopics'), value: topicCount, percent: Math.min(topicCount * 18, 100), color: '#e9a56c' },
    { label: t('home.coverageSkills'), value: skillCount, percent: Math.min(skillCount * 22, 100), color: '#7bb7e8' },
  ]

  const copy = {
    tag: t('home.teacherTag'),
    title: t('home.teacherTitle', { grade: gradeLabel(selectedGrade) }),
    intro: t('home.teacherIntro'),
    featuredUnit: t('home.featuredUnit'),
    grammarFocus: t('home.grammarFocus'),
    vocabularyFocus: t('home.vocabularyFocus'),
    openLessons: t('home.openLessonContent'),
    openPractice: t('home.openPracticePanel'),
    selectedGrade: t('home.selectedGrade'),
    progress: t('home.currentProgress'),
    level: t('home.teacherLevel'),
    coverageTitle: t('home.coverageTitle'),
    coverageCopy: t('home.coverageCopy'),
    classFlow: t('home.classFlow'),
    classFlowCopy: t('home.classFlowCopy'),
    flow1Title: t('home.flow1Title'),
    flow1Copy: t('home.flow1Copy'),
    flow2Title: t('home.flow2Title'),
    flow2Copy: t('home.flow2Copy'),
    flow3Title: t('home.flow3Title'),
    flow3Copy: t('home.flow3Copy'),
    actionsTitle: t('home.actionsTitle'),
    actionsCopy: t('home.actionsCopy'),
    actionLessons: t('home.actionLessons'),
    actionLessonsCopy: t('home.actionLessonsCopy'),
    actionPractice: t('home.actionPractice'),
    actionPracticeCopy: t('home.actionPracticeCopy'),
    resourcesTitle: t('home.resourcesTitle'),
    resourcesCopy: t('home.resourcesCopy'),
    openPlanner: t('home.openPlanner'),
    noReminders: t('home.noReminders'),
    statusToday: t('home.statusToday'),
    statusUpcoming: t('home.statusUpcoming'),
    statusOverdue: t('home.statusOverdue'),
    plannerChartTitle: t('home.plannerChartTitle'),
    plannerDoneLabel: t('home.plannerDoneLabel'),
    plannerThisWeekLabel: t('home.plannerThisWeekLabel'),
    notificationsEnable: t('home.notificationsEnable'),
    notificationsDisable: t('home.notificationsDisable'),
    notificationsBlocked: t('home.notificationsBlocked'),
    notificationsUnsupported: t('home.notificationsUnsupported'),
  }

  const handleBrowserNotifications = async () => {
    if (browserNotifications.enabled) {
      browserNotifications.disable()
      message.info(t('home.notificationsDisabledMessage'))
      return
    }

    const permission = await browserNotifications.enable()
    if (permission === 'granted') {
      message.success(t('home.notificationsEnabledMessage'))
    } else if (permission === 'denied') {
      message.warning(t('home.notificationsDeniedMessage'))
    } else {
      message.warning(t('home.notificationsUnsupportedMessage'))
    }
  }

  const notificationButtonLabel = !browserNotifications.supported
    ? copy.notificationsUnsupported
    : browserNotifications.permission === 'denied'
      ? copy.notificationsBlocked
      : browserNotifications.enabled
        ? copy.notificationsDisable
        : copy.notificationsEnable

  const plannerStatItems = [
    { label: copy.statusToday, value: plannerStats.today, tone: 'gold' },
    { label: copy.statusUpcoming, value: plannerStats.upcoming, tone: 'cyan' },
    { label: copy.statusOverdue, value: plannerStats.overdue, tone: 'volcano' },
  ] as const

  return (
    <Space orientation="vertical" size={20} className="full-width">
      <Card className="hero-card teacher-hero-card" variant="borderless">
        <Row gutter={[20, 20]} align="stretch">
          <Col xs={24} xl={16}>
            <Space orientation="vertical" size={14} className="full-width teacher-hero-main">
              <Tag className="hero-tag" variant="filled">
                {copy.tag}
              </Tag>

              <div className="home-hero-copy">
                <Text className="home-hero-kicker">{gradeLabel(selectedGrade)}</Text>
                <Title className="hero-title">{copy.title}</Title>
                <Paragraph className="hero-copy">{copy.intro}</Paragraph>
              </div>

              <Card className="teacher-featured-card" variant="borderless">
                <div className="teacher-featured-brief">
                  <div className="teacher-featured-main">
                    <Text className="page-kicker">{copy.featuredUnit}</Text>
                    <Title level={3} className="teacher-featured-title">
                      {featuredUnit?.title ?? gradeLabel(selectedGrade)}
                    </Title>
                  </div>

                  <div className="teacher-featured-meta">
                    <div className="teacher-featured-chip">
                      <Text className="teacher-meta-label">{copy.grammarFocus}</Text>
                      <Paragraph className="teacher-meta-copy">
                        {featuredUnit?.grammar.focus ?? currentGrade.overview}
                      </Paragraph>
                    </div>
                    <div className="teacher-featured-chip">
                      <Text className="teacher-meta-label">{copy.vocabularyFocus}</Text>
                      <Paragraph className="teacher-meta-copy">
                        {featuredUnit?.vocabulary.summary ?? featuredTopic?.title ?? ''}
                      </Paragraph>
                    </div>
                  </div>
                </div>
              </Card>

              <Space wrap size={10} className="home-hero-actions">
                <Button type="primary" size="large" onClick={onOpenLessons}>
                  {copy.openLessons}
                </Button>
                <Button size="large" className="outline-button" onClick={onOpenPractice}>
                  {copy.openPractice}
                </Button>
              </Space>

              <div className="teacher-hero-summary">
                <div className="teacher-summary-pill">
                  <Text className="teacher-summary-label">{copy.selectedGrade}</Text>
                  <span>{gradeLabel(selectedGrade)}</span>
                </div>
                <div className="teacher-summary-pill">
                  <Text className="teacher-summary-label">{copy.progress}</Text>
                  <span>{currentGrade.progress}%</span>
                </div>
                <div className="teacher-summary-pill">
                  <Text className="teacher-summary-label">{copy.level}</Text>
                  <span>{currentGrade.level}</span>
                </div>
              </div>
            </Space>
          </Col>

          <Col xs={24} xl={8}>
            <Card className="teacher-featured-card teacher-hero-reminders-card" variant="borderless">
              <Space orientation="vertical" size={14} className="full-width">
                <div className="planner-home-chart">
                  <div className="planner-home-chart-ring">
                    <Progress
                      type="circle"
                      percent={weeklyPlanner.percent}
                      size={88}
                      strokeColor="#2a9d8f"
                      railColor="rgba(42, 157, 143, 0.12)"
                      format={() => `${weeklyPlanner.completed}/${weeklyPlanner.total || 0}`}
                    />
                  </div>
                  <div className="planner-home-chart-copy">
                    <Text className="planner-home-chart-title">{copy.plannerChartTitle}</Text>
                    <Text className="planner-home-chart-meta">
                      {weeklyPlanner.completed} {copy.plannerDoneLabel} · {weeklyPlanner.total} {copy.plannerThisWeekLabel}
                    </Text>
                    <div className="planner-home-legend">
                      {plannerStatItems.map((item) => (
                        <div className="planner-home-legend-item" key={item.label}>
                          <span
                            className={`planner-home-legend-dot planner-home-legend-dot-${item.tone}`}
                            aria-hidden="true"
                          />
                          <Text className="planner-home-legend-label">{item.label}</Text>
                          <strong>{item.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {reminderTasks.length > 0 ? (
                  <div className="teacher-resource-list planner-home-list">
                    {reminderTasks.map((task) => {
                      const status = getReminderStatus(task)
                      const statusLabel =
                        status.key === 'today'
                          ? copy.statusToday
                          : status.key === 'overdue'
                            ? copy.statusOverdue
                            : copy.statusUpcoming

                      return (
                        <div className="teacher-resource-item planner-home-item" key={task.id}>
                          <CheckCircleOutlined />
                          <div className="planner-home-copy">
                            <div className="planner-home-head">
                              <Text strong>{task.title}</Text>
                              <Tag className="planner-home-status" color={status.color} variant="filled">
                                {statusLabel}
                              </Tag>
                            </div>
                            <Text type="secondary" className="planner-home-meta">
                              {getWeekdayLabel(task.dueDate, language)} · {formatTaskDate(task.dueDate, language)}
                              {task.dueTime ? ` · ${task.dueTime}` : ''}
                            </Text>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <Paragraph className="settings-copy">{copy.noReminders}</Paragraph>
                )}

                <Space wrap className="planner-home-actions">
                  <Button
                    icon={<BellOutlined />}
                    disabled={!user || !browserNotifications.supported}
                    onClick={() => void handleBrowserNotifications()}
                  >
                    {notificationButtonLabel}
                  </Button>
                  <Button onClick={onOpenPlanner}>{copy.openPlanner}</Button>
                </Space>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card className="content-card teacher-chart-card" variant="borderless">
        <Space orientation="vertical" size={16} className="full-width">
          <div className="section-heading teacher-chart-head">
            <div>
              <Title level={3}>{copy.coverageTitle}</Title>
              <Paragraph>{copy.coverageCopy}</Paragraph>
            </div>
            <div className="teacher-chart-icons">
              <ProfileOutlined />
              <RadarChartOutlined />
            </div>
          </div>

          <div className="teacher-chart-grid">
            {coverageItems.map((item) => (
              <div key={item.label} className="teacher-chart-item">
                <div className="teacher-chart-label">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
                <Progress percent={item.percent} showInfo={false} strokeColor={item.color} />
              </div>
            ))}
          </div>
        </Space>
      </Card>

      <Row gutter={[18, 18]}>
        <Col xs={24} xl={15}>
          <Card className="content-card home-section-card" variant="borderless">
            <Space orientation="vertical" size={16} className="full-width">
              <div className="section-heading">
                <Title level={3}>{copy.classFlow}</Title>
                <Paragraph>{copy.classFlowCopy}</Paragraph>
              </div>

              <div className="teacher-flow-grid">
                <div className="teacher-flow-card">
                  <Text className="home-journey-index">01</Text>
                  <div className="teacher-flow-head">
                    <BookOutlined />
                    <Title level={5}>{copy.flow1Title}</Title>
                  </div>
                  <Paragraph>{copy.flow1Copy}</Paragraph>
                </div>

                <div className="teacher-flow-card">
                  <Text className="home-journey-index">02</Text>
                  <div className="teacher-flow-head">
                    <SoundOutlined />
                    <Title level={5}>{copy.flow2Title}</Title>
                  </div>
                  <Paragraph>{copy.flow2Copy}</Paragraph>
                </div>

                <div className="teacher-flow-card">
                  <Text className="home-journey-index">03</Text>
                  <div className="teacher-flow-head">
                    <PlayCircleOutlined />
                    <Title level={5}>{copy.flow3Title}</Title>
                  </div>
                  <Paragraph>{copy.flow3Copy}</Paragraph>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} xl={9}>
          <Space orientation="vertical" size={18} className="full-width">
            <Card className="content-card highlight-card teacher-side-card" variant="borderless">
              <Space orientation="vertical" size={18} className="full-width">
                <div className="section-heading">
                  <Title level={3}>{copy.actionsTitle}</Title>
                  <Paragraph>{copy.actionsCopy}</Paragraph>
                </div>

                <div className="teacher-side-actions">
                  <button type="button" className="home-action-link" onClick={onOpenLessons}>
                    <div>
                      <Text strong>{copy.actionLessons}</Text>
                      <Text className="home-action-copy">{copy.actionLessonsCopy}</Text>
                    </div>
                    <ArrowRightOutlined />
                  </button>

                  <button type="button" className="home-action-link" onClick={onOpenPractice}>
                    <div>
                      <Text strong>{copy.actionPractice}</Text>
                      <Text className="home-action-copy">{copy.actionPracticeCopy}</Text>
                    </div>
                    <ArrowRightOutlined />
                  </button>
                </div>

                <div className="teacher-side-divider" />

                <div className="section-heading">
                  <Title level={4}>{copy.resourcesTitle}</Title>
                  <Paragraph>{copy.resourcesCopy}</Paragraph>
                </div>

                <div className="teacher-resource-list">
                  <div className="teacher-resource-item">
                    <CheckCircleOutlined />
                    <span>{featuredTopic?.title ?? featuredUnit?.title ?? gradeLabel(selectedGrade)}</span>
                  </div>
                  <div className="teacher-resource-item">
                    <CheckCircleOutlined />
                    <span>{featuredUnit?.project ?? currentGrade.project}</span>
                  </div>
                  <div className="teacher-resource-item">
                    <CheckCircleOutlined />
                    <span>{currentGrade.exercises[0] ?? currentGrade.skills[0]}</span>
                  </div>
                </div>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </Space>
  )
}

export default HomePage
