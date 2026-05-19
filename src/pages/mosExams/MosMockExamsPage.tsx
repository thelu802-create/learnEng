import { DownloadOutlined, FilePdfOutlined, PrinterOutlined } from '@ant-design/icons'
import { App as AntdApp, Button, Card, Checkbox, Empty, Progress, Select, Space, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { excelMockExams, mosExcelSkillWeights, mosWordSkillWeights, wordMockExams } from './data'
import { exportMosMockExamPdf } from './pdf'
import type { MosExamApp, MosExamDifficulty, MosExamSkill, MosMockExam } from './types'

const { Paragraph, Text, Title } = Typography

const examApps: MosExamApp[] = ['Word', 'Excel', 'PowerPoint']
const examsByApp: Record<MosExamApp, MosMockExam[]> = {
  Word: wordMockExams,
  Excel: excelMockExams,
  PowerPoint: [],
}

const appToneMap: Record<MosExamApp, { className: string; tagColor: string }> = {
  Word: { className: 'is-word', tagColor: 'blue' },
  Excel: { className: 'is-excel', tagColor: 'green' },
  PowerPoint: { className: 'is-powerpoint', tagColor: 'volcano' },
}

const difficultyOptions: Array<'all' | MosExamDifficulty> = ['all', 'Dễ', 'Trung bình', 'Khó']

const skillWeightsByApp = {
  Word: mosWordSkillWeights,
  Excel: mosExcelSkillWeights,
  PowerPoint: [],
} as const

function MosMockExamsPage() {
  const { message } = AntdApp.useApp()
  const [selectedApp, setSelectedApp] = useState<MosExamApp>('Word')
  const [selectedExamId, setSelectedExamId] = useState(wordMockExams[0]?.id ?? '')
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | MosExamDifficulty>('all')
  const [skillFilter, setSkillFilter] = useState<'all' | MosExamSkill>('all')
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([])
  const currentExams = examsByApp[selectedApp]
  const currentSkillWeights = skillWeightsByApp[selectedApp]
  const currentSkillOptions = useMemo(
    () => [...new Set(currentExams.flatMap((exam) => exam.tasks.map((task) => task.skill)))],
    [currentExams],
  )
  const filteredExams = useMemo(
    () =>
      currentExams.filter((exam) => {
        const matchesDifficulty = difficultyFilter === 'all' || exam.difficulty === difficultyFilter
        const matchesSkill = skillFilter === 'all' || exam.tasks.some((task) => task.skill === skillFilter)
        return matchesDifficulty && matchesSkill
      }),
    [currentExams, difficultyFilter, skillFilter],
  )
  const selectedExam = filteredExams.find((exam) => exam.id === selectedExamId) ?? filteredExams[0]

  const totalPoints = useMemo(
    () => selectedExam?.tasks.reduce((sum, task) => sum + task.points, 0) ?? 0,
    [selectedExam],
  )
  const completedPoints = useMemo(
    () =>
      selectedExam?.tasks.reduce((sum, task) => (completedTaskIds.includes(task.id) ? sum + task.points : sum), 0) ??
      0,
    [completedTaskIds, selectedExam],
  )
  const progressPercent = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0
  const scaledScore = Math.round(progressPercent * 10)

  const handleAppChange = (app: MosExamApp) => {
    const firstExam = examsByApp[app][0]
    setSelectedApp(app)
    setSelectedExamId(firstExam?.id ?? '')
    setDifficultyFilter('all')
    setSkillFilter('all')
    setCompletedTaskIds([])
  }

  const handleDifficultyFilterChange = (value: 'all' | MosExamDifficulty) => {
    const nextExams = currentExams.filter((exam) => {
      const matchesDifficulty = value === 'all' || exam.difficulty === value
      const matchesSkill = skillFilter === 'all' || exam.tasks.some((task) => task.skill === skillFilter)
      return matchesDifficulty && matchesSkill
    })
    setDifficultyFilter(value)
    setSelectedExamId(nextExams[0]?.id ?? '')
    setCompletedTaskIds([])
  }

  const handleSkillFilterChange = (value: 'all' | MosExamSkill) => {
    const nextExams = currentExams.filter((exam) => {
      const matchesDifficulty = difficultyFilter === 'all' || exam.difficulty === difficultyFilter
      const matchesSkill = value === 'all' || exam.tasks.some((task) => task.skill === value)
      return matchesDifficulty && matchesSkill
    })
    setSkillFilter(value)
    setSelectedExamId(nextExams[0]?.id ?? '')
    setCompletedTaskIds([])
  }

  const handleExamChange = (examId: string) => {
    setSelectedExamId(examId)
    setCompletedTaskIds([])
  }

  const handleExportPdf = async () => {
    if (!selectedExam) return

    try {
      await exportMosMockExamPdf(selectedExam)
      message.success('Đã xuất PDF đề thi thử.')
    } catch {
      message.error('Không xuất được PDF.')
    }
  }

  return (
    <Space direction="vertical" size={18} className="full-width">
      <Card className={`content-card mos-exam-control-card ${appToneMap[selectedApp].className}`} variant="borderless">
        <div className="mos-exam-controls">
          <div className="mos-exam-control-title">
            <Tag color={appToneMap[selectedApp].tagColor} className="mos-exam-app-badge">
              {selectedApp}
            </Tag>
          </div>
          <div className="mos-exam-control-fields">
            <div>
              <Text strong>Ứng dụng</Text>
              <Select<MosExamApp>
                value={selectedApp}
                onChange={handleAppChange}
                options={examApps.map((app) => ({
                  value: app,
                  label: app,
                }))}
              />
            </div>
            <div>
              <Text strong>Độ khó</Text>
              <Select
                value={difficultyFilter}
                onChange={handleDifficultyFilterChange}
                options={difficultyOptions.map((value) => ({
                  value,
                  label: value === 'all' ? 'Tất cả độ khó' : value,
                }))}
              />
            </div>
            <div>
              <Text strong>Kỹ năng</Text>
              <Select
                value={skillFilter}
                onChange={handleSkillFilterChange}
                options={[
                  { value: 'all', label: 'Tất cả kỹ năng' },
                  ...currentSkillOptions.map((skill) => ({ value: skill, label: skill })),
                ]}
              />
            </div>
            <div>
              <Text strong>Đề thi</Text>
              <Select
                value={selectedExam?.id}
                placeholder={`Chưa có đề ${selectedApp}`}
                onChange={handleExamChange}
                disabled={filteredExams.length === 0}
                options={filteredExams.map((exam) => ({
                  value: exam.id,
                  label: `${exam.code} - ${exam.title}`,
                }))}
              />
            </div>
          </div>
        </div>
      </Card>

      {selectedExam ? (
        <>
          <Card className="content-card mos-exam-hero" variant="borderless">
            <div className="mos-exam-hero-grid">
              <div>
                <Space wrap>
                  <Tag color={appToneMap[selectedExam.app].tagColor}>{selectedExam.app}</Tag>
                  <Tag color="green">{selectedExam.code}</Tag>
                  <Tag>{selectedExam.difficulty}</Tag>
                  <Tag>{selectedExam.durationMinutes} phút</Tag>
                  <Tag>Điểm đạt gợi ý {selectedExam.passingScore}/1000</Tag>
                </Space>
                <Title level={2}>{selectedExam.title}</Title>
                <Paragraph>{selectedExam.scenario}</Paragraph>
              </div>
              <div className="mos-exam-score-panel">
                <Progress type="circle" percent={progressPercent} size={104} />
                <Text strong>Điểm tạm tính: {scaledScore}/1000</Text>
                <Text type="secondary">
                  Tick các task đã hoàn thành để tự chấm nhanh khi luyện.
                </Text>
              </div>
            </div>

            <div className="mos-exam-meta-grid">
              <div>
                <Text strong>File đầu vào</Text>
                <Space size={[6, 6]} wrap>
                  {selectedExam.starterFiles.map((fileName) => (
                    <Tag key={fileName}>{fileName}</Tag>
                  ))}
                </Space>
              </div>
              <div>
                <Text strong>File cần nộp</Text>
                <Space size={[6, 6]} wrap>
                  {selectedExam.deliverables.map((fileName) => (
                    <Tag key={fileName}>{fileName}</Tag>
                  ))}
                </Space>
              </div>
            </div>

            <Space wrap className="mos-exam-actions">
              <Button icon={<FilePdfOutlined />} type="primary" onClick={() => void handleExportPdf()}>
                Xuất PDF để in
              </Button>
              <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
                In trang hiện tại
              </Button>
              <Button icon={<DownloadOutlined />} onClick={() => setCompletedTaskIds([])}>
                Làm lại
              </Button>
            </Space>

            <div className="mos-exam-source-box">
              <Text strong>Outline đang bám</Text>
              <div className="mos-exam-weight-list">
                {currentSkillWeights.map((item) => (
                  <Tag key={item.skill} className="mos-exam-weight-tag">
                    {item.skill}: {item.weight}
                  </Tag>
                ))}
              </div>
            </div>
          </Card>

          <div className="mos-exam-task-list">
            {selectedExam.tasks.map((task, index) => (
              <Card key={task.id} className="content-card mos-exam-task-card" variant="borderless">
                <div className="mos-exam-task-head">
                  <Checkbox
                    checked={completedTaskIds.includes(task.id)}
                    onChange={(event) => {
                      setCompletedTaskIds((current) =>
                        event.target.checked
                          ? [...current, task.id]
                          : current.filter((taskId) => taskId !== task.id),
                      )
                    }}
                  />
                  <div>
                    <Space wrap>
                      <Tag>{String(index + 1).padStart(2, '0')}</Tag>
                      <Tag color="cyan">{task.points} điểm</Tag>
                      <Tag>{task.skill}</Tag>
                    </Space>
                    <Title level={4}>{task.title}</Title>
                  </div>
                </div>
                <Paragraph>{task.instruction}</Paragraph>
                <div className="mos-exam-checklist">
                  {task.checklist.map((item) => (
                    <Text key={item}>□ {item}</Text>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card className="content-card" variant="borderless">
          <Empty
            description={`Chưa có đề thi thử ${selectedApp}. Mình đã để sẵn lựa chọn này để thêm data Excel/PowerPoint sau.`}
          />
        </Card>
      )}
    </Space>
  )
}

export default MosMockExamsPage
