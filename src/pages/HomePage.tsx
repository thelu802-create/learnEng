import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRightOutlined,
  BookOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  ProfileOutlined,
  RadarChartOutlined,
  SoundOutlined,
} from '@ant-design/icons'
import { Button, Card, Col, Progress, Row, Space, Tag, Typography } from 'antd'
import { useSupabaseAuth } from '../components/providers/SupabaseAuthProvider'
import { useI18n } from '../i18n'
import {
  formatTaskDate,
  getTaskBucket,
  getWeekdayLabel,
  type PlannerTask,
} from '../lib/plannerStorage'
import { listPlannerTasks } from '../lib/supabase/teacherData'
import type { GradeContent, GradeKey } from '../types'

const { Title, Paragraph, Text } = Typography

interface HomePageProps {
  selectedGrade: GradeKey
  currentGrade: GradeContent
  onOpenLessons: () => void
  onOpenPlanner: () => void
  onOpenPractice: () => void
}

function HomePage({
  selectedGrade,
  currentGrade,
  onOpenLessons,
  onOpenPlanner,
  onOpenPractice,
}: HomePageProps) {
  const { gradeLabel, language } = useI18n()
  const { configured, user } = useSupabaseAuth()
  const [plannerTasks, setPlannerTasks] = useState<PlannerTask[]>([])

  const getReminderStatus = (task: PlannerTask) => {
    const bucket = getTaskBucket(task)

    if (bucket === 'today') {
      return { key: 'today' as const, color: 'gold' }
    }

    if (bucket === 'overdue') {
      return { key: 'overdue' as const, color: 'volcano' }
    }

    return { key: 'upcoming' as const, color: 'cyan' }
  }

  const getStartOfWeek = (date: Date) => {
    const next = new Date(date)
    const day = next.getDay()
    const offset = day === 0 ? -6 : 1 - day
    next.setHours(0, 0, 0, 0)
    next.setDate(next.getDate() + offset)
    return next
  }

  const topicCount = currentGrade.vocabularyTopics.length
  const wordCount = currentGrade.vocabularyTopics.reduce(
    (total, topic) => total + topic.words.length,
    0,
  )
  const skillCount = currentGrade.skills.length
  const unitCount = currentGrade.units.length
  const featuredUnit = currentGrade.units[0]
  const featuredTopic = currentGrade.vocabularyTopics[0]
  const reminderTasks = plannerTasks
    .filter((task) => {
      const bucket = getTaskBucket(task)
      return bucket === 'today' || bucket === 'upcoming' || bucket === 'overdue'
    })
    .slice(0, 3)

  const weeklyPlanner = useMemo(() => {
    const start = getStartOfWeek(new Date())
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      return {
        key: date.toISOString(),
        date,
        total: 0,
        completed: 0,
      }
    })

    plannerTasks.forEach((task) => {
      const dueDate = new Date(`${task.dueDate}T00:00:00`)
      dueDate.setHours(0, 0, 0, 0)
      const diff = Math.round((dueDate.getTime() - start.getTime()) / 86400000)

      if (diff >= 0 && diff < 7) {
        days[diff].total += 1
        if (task.completed) {
          days[diff].completed += 1
        }
      }
    })

    const total = days.reduce((sum, day) => sum + day.total, 0)
    const completed = days.reduce((sum, day) => sum + day.completed, 0)
    const max = Math.max(...days.map((day) => day.total), 1)

    return {
      days,
      total,
      completed,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      max,
    }
  }, [plannerTasks])

  useEffect(() => {
    if (!configured || !user) {
      setPlannerTasks([])
      return
    }

    let active = true
    listPlannerTasks(user.id)
      .then((records) => {
        if (!active) {
          return
        }

        setPlannerTasks(
          records.map((task) => ({
            id: task.id,
            title: task.title,
            note: task.note,
            dueDate: task.due_date,
            dueTime: task.due_time,
            priority: task.priority,
            repeatWeekly: task.repeat_weekly,
            completed: task.completed,
            createdAt: task.created_at,
            updatedAt: task.updated_at,
          })),
        )
      })
      .catch(() => {
        if (active) {
          setPlannerTasks([])
        }
      })

    return () => {
      active = false
    }
  }, [configured, user])

  const coverageItems =
    language === 'en'
      ? [
          { label: 'Units', value: unitCount, percent: Math.min(unitCount * 20, 100), color: '#2a9d8f' },
          { label: 'Words', value: wordCount, percent: Math.min(wordCount, 100), color: '#4fb3a8' },
          { label: 'Topics', value: topicCount, percent: Math.min(topicCount * 18, 100), color: '#e9a56c' },
          { label: 'Skills', value: skillCount, percent: Math.min(skillCount * 22, 100), color: '#7bb7e8' },
        ]
      : [
          { label: 'Bài học', value: unitCount, percent: Math.min(unitCount * 20, 100), color: '#2a9d8f' },
          { label: 'Từ vựng', value: wordCount, percent: Math.min(wordCount, 100), color: '#4fb3a8' },
          { label: 'Chủ đề', value: topicCount, percent: Math.min(topicCount * 18, 100), color: '#e9a56c' },
          { label: 'Kỹ năng', value: skillCount, percent: Math.min(skillCount * 22, 100), color: '#7bb7e8' },
        ]

  const copy =
    language === 'en'
      ? {
          tag: 'Teacher dashboard',
          title: `Teaching plan for ${gradeLabel(selectedGrade)}`,
          intro:
            'Choose a grade, open the featured unit, and move quickly from lesson content to guided practice.',
          featuredUnit: 'Featured unit',
          grammarFocus: 'Grammar focus',
          vocabularyFocus: 'Vocabulary set',
          openLessons: 'Open lesson content',
          openPractice: 'Open practice',
          selectedGrade: 'Selected grade',
          progress: 'Current progress',
          level: 'Level',
          coverageTitle: 'Teaching coverage',
          coverageCopy: 'A quick view of the teaching materials available for this grade.',
          classFlow: 'Quick classroom flow',
          classFlowCopy: 'A simple sequence to introduce content, reinforce it, and close the lesson.',
          flow1Title: 'Open the lesson',
          flow1Copy: 'Review the main topic, grammar point, and project direction before class practice.',
          flow2Title: 'Highlight vocabulary',
          flow2Copy: 'Use the topic word list to pre-teach key words and examples for the unit.',
          flow3Title: 'Run a short practice round',
          flow3Copy: 'Move students into immediate recall with quick meaning, fill-in, or matching tasks.',
          actionsTitle: 'Next teaching actions',
          actionsCopy: 'Start with the lesson content, then switch to practice once students know the topic.',
          actionLessons: 'Review unit structure',
          actionLessonsCopy: 'Open the unit, grammar focus, and project task for this grade.',
          actionPractice: 'Launch practice',
          actionPracticeCopy: 'Use short activities to reinforce vocabulary in class or for homework.',
          resourcesTitle: 'Resources ready to use',
          resourcesCopy: 'Everything below is available for the selected grade right now.',
          remindersTitle: 'Teaching reminders',
          remindersCopy: 'Keep the closest tasks visible so nothing important slips past.',
          openPlanner: 'Open planner',
          noReminders: 'No reminders are close yet. Add a task in Planner to see it here.',
          statusToday: 'Today',
          statusUpcoming: 'Soon',
          statusOverdue: 'Overdue',
        }
      : {
          tag: 'Bảng điều khiển giảng dạy',
          title: `Kế hoạch dạy ${gradeLabel(selectedGrade)}`,
          intro:
            'Chọn khối, mở bài nổi bật và chuyển nhanh từ nội dung bài học sang phần luyện tập.',
          featuredUnit: 'Bài học nổi bật',
          grammarFocus: 'Trọng tâm ngữ pháp',
          vocabularyFocus: 'Cụm từ vựng',
          openLessons: 'Mở bài học',
          openPractice: 'Mở luyện tập',
          selectedGrade: 'Khối đang chọn',
          progress: 'Tiến độ hiện tại',
          level: 'Mức độ',
          coverageTitle: 'Biểu đồ tổng quan',
          coverageCopy: 'Xem nhanh mức độ sẵn sàng của tài nguyên cho khối đang chọn.',
          classFlow: 'Luồng triển khai nhanh trên lớp',
          classFlowCopy: 'Một nhịp dạy gọn để vào bài, củng cố kiến thức và chốt hoạt động.',
          flow1Title: 'Mở bài học',
          flow1Copy: 'Xem chủ điểm, điểm ngữ pháp chính và hướng project trước khi vào hoạt động lớp.',
          flow2Title: 'Nhấn vào từ vựng',
          flow2Copy: 'Dùng danh sách từ theo chủ đề để giới thiệu từ mới và ví dụ trọng tâm của bài.',
          flow3Title: 'Cho luyện nhanh',
          flow3Copy: 'Chuyển ngay sang bài tập ngắn để học sinh nhớ từ qua ngữ cảnh và ghép cặp.',
          actionsTitle: 'Bước tiếp theo',
          actionsCopy: 'Nên bắt đầu từ bài học trước, sau đó chuyển sang phần luyện tập để học sinh làm ngay.',
          actionLessons: 'Xem cấu trúc bài dạy',
          actionLessonsCopy: 'Mở bài, xem ngữ pháp trọng tâm và phần project của khối này.',
          actionPractice: 'Triển khai luyện tập',
          actionPracticeCopy: 'Dùng bài tập ngắn để củng cố từ vựng trên lớp hoặc giao về nhà.',
          resourcesTitle: 'Tài nguyên sẵn để dùng',
          resourcesCopy: 'Toàn bộ dữ liệu dưới đây đang có sẵn cho khối được chọn.',
          remindersTitle: 'Nhắc việc giảng dạy',
          remindersCopy: 'Giữ các việc gần hạn ở ngay trang chủ để không bị sót.',
          openPlanner: 'Mở nhắc việc',
          noReminders: 'Chưa có việc nào gần hạn. Bạn có thể thêm việc trong Planner.',
          statusToday: 'Hôm nay',
          statusUpcoming: 'Sắp tới',
          statusOverdue: 'Quá hạn',
        }

  const plannerChartTitle = language === 'en' ? 'Weekly plan' : 'Kế hoạch tuần'
  const plannerChartCopy =
    language === 'en'
      ? 'A quick look at this week and how much is already done.'
      : 'Xem nhanh khối lượng việc trong tuần và mức độ đã hoàn thành.'
  const plannerDoneLabel = language === 'en' ? 'done' : 'đã xong'
  const plannerThisWeekLabel = language === 'en' ? 'tasks this week' : 'việc trong tuần'
  const plannerStats = [
    { label: copy.statusToday, value: plannerTasks.filter((task) => getTaskBucket(task) === 'today').length, tone: 'gold' },
    {
      label: copy.statusUpcoming,
      value: plannerTasks.filter((task) => getTaskBucket(task) === 'upcoming').length,
      tone: 'cyan',
    },
    {
      label: copy.statusOverdue,
      value: plannerTasks.filter((task) => getTaskBucket(task) === 'overdue').length,
      tone: 'volcano',
    },
  ] as const
  const plannerChartTitleText = language === 'en' ? 'Weekly plan' : 'Kế hoạch tuần'
  const plannerChartCopyText =
    language === 'en'
      ? 'A quick look at this week and how much is already done.'
      : 'Xem nhanh khối lượng việc trong tuần và mức độ đã hoàn thành.'
  const plannerDoneLabelText = language === 'en' ? 'done' : 'đã xong'
  const plannerThisWeekLabelText = language === 'en' ? 'tasks this week' : 'việc trong tuần'
  void plannerChartTitle
  void plannerChartCopy
  void plannerChartCopyText

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
              <Space orientation="vertical" size={16} className="full-width">
                <div className="section-heading">
                  <Title level={3}>{copy.remindersTitle}</Title>
                  <Paragraph>{copy.remindersCopy}</Paragraph>
                </div>

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
                    <Text className="planner-home-chart-title">{plannerChartTitleText}</Text>
                    <Text className="planner-home-chart-meta">
                      {weeklyPlanner.completed} {plannerDoneLabel} · {weeklyPlanner.total} {plannerThisWeekLabel}
                    </Text>
                    <Text className="planner-home-chart-meta planner-home-chart-meta-live">
                      {weeklyPlanner.completed} {plannerDoneLabelText} · {weeklyPlanner.total}{' '}
                      {plannerThisWeekLabelText}
                    </Text>
                    <div className="planner-home-legend">
                      {plannerStats.map((item) => (
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

                <Button onClick={onOpenPlanner}>{copy.openPlanner}</Button>
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
