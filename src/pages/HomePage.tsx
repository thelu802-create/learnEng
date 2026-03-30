import { useEffect, useState } from 'react'
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

  return (
    <Space direction="vertical" size={20} className="full-width">
      <Card className="hero-card teacher-hero-card" bordered={false}>
        <Row gutter={[20, 20]} align="stretch">
          <Col xs={24} xl={16}>
            <Space direction="vertical" size={14} className="full-width teacher-hero-main">
              <Tag className="hero-tag" bordered={false}>
                {copy.tag}
              </Tag>

              <div className="home-hero-copy">
                <Text className="home-hero-kicker">{gradeLabel(selectedGrade)}</Text>
                <Title className="hero-title">{copy.title}</Title>
                <Paragraph className="hero-copy">{copy.intro}</Paragraph>
              </div>

              <Card className="teacher-featured-card" bordered={false}>
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
            <Card className="teacher-featured-card teacher-hero-reminders-card" bordered={false}>
              <Space direction="vertical" size={16} className="full-width">
                <div className="section-heading">
                  <Title level={3}>{copy.remindersTitle}</Title>
                  <Paragraph>{copy.remindersCopy}</Paragraph>
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
                              <Tag className="planner-home-status" color={status.color} bordered={false}>
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

      <Card className="content-card teacher-chart-card" bordered={false}>
        <Space direction="vertical" size={16} className="full-width">
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
          <Card className="content-card home-section-card" bordered={false}>
            <Space direction="vertical" size={16} className="full-width">
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
          <Space direction="vertical" size={18} className="full-width">
            <Card className="content-card highlight-card teacher-side-card" bordered={false}>
              <Space direction="vertical" size={18} className="full-width">
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
