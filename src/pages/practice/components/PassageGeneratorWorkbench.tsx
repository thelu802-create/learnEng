import { useState } from 'react'
import {
  CheckCircleOutlined,
  EditOutlined,
  FileTextOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { Button, Card, Input, Radio, Space, Tag, Typography } from 'antd'
import { useI18n } from '../../../i18n'
import { buildPassageQuestions } from '../utils'
import type { GeneratorViewKey, PassageGeneratorWorkbenchProps, PassageQuestion } from '../types'

const { TextArea } = Input
const { Title, Paragraph, Text } = Typography

export function PassageGeneratorWorkbench({ distractorPool }: PassageGeneratorWorkbenchProps) {
  const { t } = useI18n()
  const [passage, setPassage] = useState('')
  const [questions, setQuestions] = useState<PassageQuestion[]>([])
  const [generatorView, setGeneratorView] = useState<GeneratorViewKey>('create')
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const copy = {
    title: t('practiceGenerator.title'),
    createTab: t('practiceGenerator.createTab'),
    takeTab: t('practiceGenerator.takeTab'),
    intro: t('practiceGenerator.intro'),
    placeholder: t('practiceGenerator.placeholder'),
    generate: t('practiceGenerator.generate'),
    reset: t('practiceGenerator.reset'),
    submit: t('practiceGenerator.submit'),
    retry: t('practiceGenerator.retry'),
    switchHint: t('practiceGenerator.switchHint'),
    requirement: t('practiceGenerator.requirement'),
    empty: t('practiceGenerator.empty'),
    emptyCopy: t('practiceGenerator.emptyCopy'),
    emptyTakeTitle: t('practiceGenerator.emptyTakeTitle'),
    emptyTakeCopy: t('practiceGenerator.emptyTakeCopy'),
    resultTitle: t('practiceGenerator.resultTitle'),
    takeTitle: t('practiceGenerator.takeTitle'),
    takeIntro: t('practiceGenerator.takeIntro'),
    originalSentence: t('practiceGenerator.originalSentence'),
    correctAnswer: t('practiceGenerator.correctAnswer'),
    noQuestions: t('practiceGenerator.noQuestions'),
    question: t('practiceGenerator.question'),
    quizReady: t('practiceGenerator.quizReady'),
    studentProgress: t('practiceGenerator.studentProgress'),
    studentScore: t('practiceGenerator.studentScore'),
    chooseAnswer: t('practiceGenerator.chooseAnswer'),
    correct: t('practiceGenerator.correct'),
    wrong: t('practiceGenerator.wrong'),
  }

  const answeredCount = Object.keys(studentAnswers).length
  const score = questions.filter((question) => studentAnswers[question.id] === question.answer).length

  const handleGenerate = () => {
    setQuestions(buildPassageQuestions(passage, distractorPool))
    setStudentAnswers({})
    setSubmitted(false)
    setGeneratorView('create')
  }

  const handleReset = () => {
    setPassage('')
    setQuestions([])
    setStudentAnswers({})
    setSubmitted(false)
    setGeneratorView('create')
  }

  const handleStudentAnswer = (questionId: string, value: string) => {
    if (submitted) {
      return
    }

    setStudentAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: value,
    }))
  }

  return (
    <Space orientation="vertical" size={18} className="full-width">
      <Card className="content-card practice-generator-card" variant="borderless">
        <Space orientation="vertical" size={16} className="full-width">
          <div className="section-heading">
            <Title level={2}>{copy.title}</Title>
            <Paragraph>{copy.intro}</Paragraph>
          </div>

          <div className="practice-generator-view-switch" role="tablist" aria-label={copy.title}>
            <button
              type="button"
              className={`practice-generator-view-chip ${generatorView === 'create' ? 'is-active' : ''}`}
              onClick={() => setGeneratorView('create')}
            >
              {copy.createTab}
            </button>
            <button
              type="button"
              className={`practice-generator-view-chip ${generatorView === 'take' ? 'is-active' : ''}`}
              onClick={() => setGeneratorView('take')}
              disabled={questions.length === 0}
            >
              {copy.takeTab}
            </button>
          </div>

          <Text className="practice-generator-switch-hint">{copy.switchHint}</Text>

          {generatorView === 'create' ? (
            <div className="practice-generator-panel">
              <TextArea
                value={passage}
                onChange={(event) => setPassage(event.target.value)}
                rows={9}
                placeholder={copy.placeholder}
                className="practice-generator-input"
              />

              <div className="practice-generator-actions">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleGenerate}
                  disabled={!passage.trim()}
                >
                  {copy.generate}
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                  disabled={!passage && questions.length === 0}
                >
                  {copy.reset}
                </Button>
              </div>

              <div className="practice-generator-note">
                <FileTextOutlined />
                <Text>{copy.requirement}</Text>
              </div>
            </div>
          ) : (
            <div className="practice-generator-student-intro">
              <div className="practice-quiz-head">
                <div>
                  <Text className="page-kicker">{copy.takeTitle}</Text>
                  <Title level={4} className="practice-word-title">
                    {questions.length} {copy.quizReady}
                  </Title>
                </div>
                <Tag color="cyan">MCQ</Tag>
              </div>
              <Paragraph>{copy.takeIntro}</Paragraph>
              <div className="practice-generator-student-stats">
                <div className="practice-generator-stat">
                  <Text className="page-kicker">{copy.studentProgress}</Text>
                  <Text strong>
                    {answeredCount}/{questions.length}
                  </Text>
                </div>
                <div className="practice-generator-stat">
                  <Text className="page-kicker">{copy.studentScore}</Text>
                  <Text strong>{submitted ? `${score}/${questions.length}` : '--'}</Text>
                </div>
              </div>
            </div>
          )}
        </Space>
      </Card>

      <Card className="content-card practice-quiz-card" variant="borderless">
        {generatorView === 'take' && questions.length === 0 ? (
          <Space orientation="vertical" size={12} className="full-width">
            <Title level={4} className="practice-empty-title">
              {copy.emptyTakeTitle}
            </Title>
            <Paragraph className="practice-empty-copy">{copy.emptyTakeCopy}</Paragraph>
          </Space>
        ) : passage.trim().length > 0 && questions.length === 0 ? (
          <Space orientation="vertical" size={12} className="full-width">
            <Title level={4} className="practice-empty-title">
              {copy.empty}
            </Title>
            <Paragraph className="practice-empty-copy">{copy.noQuestions}</Paragraph>
          </Space>
        ) : questions.length === 0 ? (
          <Space orientation="vertical" size={12} className="full-width">
            <Title level={4} className="practice-empty-title">
              {copy.empty}
            </Title>
            <Paragraph className="practice-empty-copy">{copy.emptyCopy}</Paragraph>
          </Space>
        ) : (
          <Space orientation="vertical" size={16} className="full-width">
            <div className="practice-quiz-head">
              <div>
                <Text className="page-kicker">
                  {generatorView === 'create' ? copy.resultTitle : copy.takeTitle}
                </Text>
                <Title level={3} className="practice-word-title">
                  {questions.length} {copy.quizReady}
                </Title>
              </div>
              <Tag color="cyan">MCQ</Tag>
            </div>

            <div className="practice-generator-list">
              {questions.map((question, index) => (
                <div key={question.id} className="practice-generator-question">
                  <Space orientation="vertical" size={10} className="full-width">
                    <Text className="page-kicker">
                      {copy.question} {index + 1}
                    </Text>
                    <Paragraph className="practice-sentence-prompt">{question.prompt}</Paragraph>

                    <Radio.Group
                      value={generatorView === 'take' ? studentAnswers[question.id] : null}
                      onChange={(event) => handleStudentAnswer(question.id, event.target.value)}
                      className="practice-options"
                    >
                      <Space orientation="vertical" size={10} className="full-width">
                        {question.options.map((option) => {
                          const isStudentSelected = studentAnswers[question.id] === option
                          const optionState =
                            generatorView === 'create'
                              ? option === question.answer
                                ? 'is-correct'
                                : ''
                              : submitted
                                ? option === question.answer
                                  ? 'is-correct'
                                  : isStudentSelected
                                    ? 'is-wrong'
                                    : ''
                                : ''

                          return (
                            <Radio.Button
                              key={`${question.id}-${option}`}
                              value={option}
                              disabled={generatorView === 'take' && submitted}
                              className={`practice-option ${optionState}`.trim()}
                            >
                              {option}
                            </Radio.Button>
                          )
                        })}
                      </Space>
                    </Radio.Group>

                    {generatorView === 'create' || submitted ? (
                      <div
                        className={`practice-feedback ${
                          generatorView === 'take' && studentAnswers[question.id] !== question.answer
                            ? 'is-wrong'
                            : 'is-correct'
                        }`}
                      >
                        <Space orientation="vertical" size={4} className="full-width">
                          {generatorView === 'take' ? (
                            <Text strong>
                              {studentAnswers[question.id] === question.answer ? copy.correct : copy.wrong}
                            </Text>
                          ) : null}
                          <Text strong>
                            {copy.correctAnswer}: {question.answer}
                          </Text>
                          <Text type="secondary">
                            {copy.originalSentence}: {question.sentence}
                          </Text>
                        </Space>
                      </div>
                    ) : (
                      <div className="practice-generator-answer-hint">
                        <Text>{copy.chooseAnswer}</Text>
                      </div>
                    )}
                  </Space>
                </div>
              ))}
            </div>

            {generatorView === 'take' ? (
              <div className="practice-actions">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setStudentAnswers({})
                    setSubmitted(false)
                  }}
                >
                  {copy.retry}
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => setSubmitted(true)}
                  disabled={submitted || answeredCount !== questions.length}
                >
                  {copy.submit}
                </Button>
              </div>
            ) : null}
          </Space>
        )}
      </Card>
    </Space>
  )
}
