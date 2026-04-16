import { useMemo, useState } from 'react'
import {
  CheckCircleOutlined,
  PlayCircleOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import {
  Card,
  Col,
  Progress,
  Row,
  Space,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import { useI18n } from '../../i18n'
import { PassageGeneratorWorkbench } from './components/PassageGeneratorWorkbench'
import { PracticeChoiceSession } from './components/PracticeChoiceSession'
import { PracticeMatchSession } from './components/PracticeMatchSession'
import type {
  PracticeMode,
  PracticeModeKey,
  PracticePageProps,
  PracticeSectionKey,
} from './types'
import { mapVocabularyPool } from './utils'

const { Title, Paragraph, Text } = Typography

function PracticePage({ selectedGrade, currentGrade, learningSteps }: PracticePageProps) {
  const { t, gradeLabel } = useI18n()
  const [selectedSection, setSelectedSection] = useState<PracticeSectionKey>('word')
  const [selectedTopicKey, setSelectedTopicKey] = useState('all')
  const [selectedMode, setSelectedMode] = useState<PracticeModeKey>('meaning')

  const pageCopy = useMemo(
    () => ({
      wordPractice: t('practicePage.wordPractice'),
      wordPracticeCopy: t('practicePage.wordPracticeCopy'),
      generator: t('practicePage.generator'),
      generatorCopy: t('practicePage.generatorCopy'),
      generatorReady: t('practicePage.generatorReady'),
      generatorQuizItems: t('practicePage.generatorQuizItems'),
      generatorAutoFromPassage: t('practicePage.generatorAutoFromPassage'),
      generatorTipsTitle: t('practicePage.generatorTipsTitle'),
      generatorTip1: t('practicePage.generatorTip1'),
      generatorTip2: t('practicePage.generatorTip2'),
      generatorTip3: t('practicePage.generatorTip3'),
    }),
    [t],
  )

  const practiceModes: PracticeMode[] = useMemo(
    () => [
      {
        key: 'meaning',
        title: t('practice.modeMeaning'),
        description: t('practice.modeMeaningCopy'),
        available: true,
      },
      {
        key: 'fill',
        title: t('practice.modeFill'),
        description: t('practice.modeFillCopy'),
        available: true,
      },
      {
        key: 'match',
        title: t('practice.modeMatch'),
        description: t('practice.modeMatchCopy'),
        available: true,
      },
    ],
    [t],
  )

  const topicOptions = useMemo(
    () => [
      { key: 'all', title: t('common.allTopics') },
      ...currentGrade.vocabularyTopics.map((topic) => ({
        key: topic.key,
        title: topic.title,
      })),
    ],
    [currentGrade.vocabularyTopics, t],
  )

  const vocabularyPool = useMemo(
    () => mapVocabularyPool(currentGrade.vocabularyTopics, selectedTopicKey),
    [currentGrade.vocabularyTopics, selectedTopicKey],
  )

  const generatorDistractorPool = useMemo(
    () => currentGrade.vocabularyTopics.flatMap((topic) => topic.words.map((word) => word.word)),
    [currentGrade.vocabularyTopics],
  )

  const activeTopicCount =
    selectedTopicKey === 'all'
      ? currentGrade.vocabularyTopics.length
      : currentGrade.vocabularyTopics.filter((topic) => topic.key === selectedTopicKey).length

  return (
    <Row gutter={[18, 18]}>
      <Col xs={24} xl={16}>
        <Space orientation="vertical" size={18} className="full-width">
          <Card className="content-card practice-hero-card" variant="borderless">
            <Space orientation="vertical" size={18} className="full-width">
              <div className="section-heading">
                <Title level={2}>{t('practice.title')}</Title>
                <Paragraph>{t('practice.intro', { grade: gradeLabel(selectedGrade) })}</Paragraph>
              </div>

              <div className="practice-section-switch">
                <button
                  type="button"
                  className={`practice-section-card ${selectedSection === 'word' ? 'is-active' : ''}`}
                  onClick={() => setSelectedSection('word')}
                >
                  <div className="practice-mode-head">
                    <Text strong>{pageCopy.wordPractice}</Text>
                    <Tag color={selectedSection === 'word' ? 'cyan' : 'default'}>A</Tag>
                  </div>
                  <Text className="practice-mode-copy">{pageCopy.wordPracticeCopy}</Text>
                </button>

                <button
                  type="button"
                  className={`practice-section-card ${
                    selectedSection === 'generator' ? 'is-active' : ''
                  }`}
                  onClick={() => setSelectedSection('generator')}
                >
                  <div className="practice-mode-head">
                    <Text strong>{pageCopy.generator}</Text>
                    <Tag color={selectedSection === 'generator' ? 'cyan' : 'default'}>B</Tag>
                  </div>
                  <Text className="practice-mode-copy">{pageCopy.generatorCopy}</Text>
                </button>
              </div>

              {selectedSection === 'word' ? (
                <>
                  <Row gutter={[14, 14]}>
                    {practiceModes.map((mode) => {
                      const isActive = mode.key === selectedMode

                      return (
                        <Col xs={24} md={8} key={mode.key}>
                          <button
                            type="button"
                            className={`practice-mode-card${isActive ? ' is-active' : ''}${
                              mode.available ? '' : ' is-disabled'
                            }`}
                            onClick={() => mode.available && setSelectedMode(mode.key)}
                          >
                            <div className="practice-mode-head">
                              <Text strong>{mode.title}</Text>
                              <Tag color={mode.available ? 'cyan' : 'default'}>
                                {mode.available ? t('practice.available') : t('practice.comingSoon')}
                              </Tag>
                            </div>
                            <Text className="practice-mode-copy">{mode.description}</Text>
                          </button>
                        </Col>
                      )
                    })}
                  </Row>

                  <div className="practice-topic-filter">
                    {topicOptions.map((topic) => (
                      <button
                        key={topic.key}
                        type="button"
                        className={`practice-topic-chip${
                          selectedTopicKey === topic.key ? ' is-active' : ''
                        }`}
                        onClick={() => setSelectedTopicKey(topic.key)}
                      >
                        {topic.title}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </Space>
          </Card>

          {selectedSection === 'word' ? (
            selectedMode === 'match' ? (
              <PracticeMatchSession
                key={`${selectedGrade}-${selectedTopicKey}-${selectedMode}`}
                selectedGrade={selectedGrade}
                vocabularyPool={vocabularyPool}
              />
            ) : (
              <PracticeChoiceSession
                key={`${selectedGrade}-${selectedTopicKey}-${selectedMode}`}
                selectedGrade={selectedGrade}
                vocabularyPool={vocabularyPool}
                selectedMode={selectedMode}
              />
            )
          ) : (
            <PassageGeneratorWorkbench distractorPool={generatorDistractorPool} />
          )}
        </Space>
      </Col>

      <Col xs={24} xl={8}>
        <Space orientation="vertical" size={18} className="full-width">
          <Card className="content-card highlight-card" variant="borderless">
            <Space orientation="vertical" size={16} className="full-width">
              <div className="practice-score-head">
                <div>
                  <Text className="page-kicker">{t('practice.overviewTitle')}</Text>
                  <Title level={4} className="practice-score-title">
                    {selectedSection === 'word'
                      ? `${vocabularyPool.length} ${t('common.levelReady')}`
                      : pageCopy.generatorReady}
                  </Title>
                </div>
                <TrophyOutlined className="practice-score-icon" />
              </div>

              <Progress
                percent={
                  selectedSection === 'word'
                    ? Math.min(100, Math.round((vocabularyPool.length / 8) * 100))
                    : 100
                }
                strokeColor="#2a9d8f"
                showInfo={false}
              />

              <div className="practice-score-grid">
                <div className="practice-score-box">
                  <CheckCircleOutlined />
                  <Text>
                    {selectedSection === 'word'
                      ? `${activeTopicCount} ${t('common.topicsOpen')}`
                      : pageCopy.generatorQuizItems}
                  </Text>
                </div>
                <div className="practice-score-box">
                  <PlayCircleOutlined />
                  <Text>
                    {selectedSection === 'word'
                      ? `${Math.min(vocabularyPool.length, 8)} ${t('common.questionsPerRound')}`
                      : pageCopy.generatorAutoFromPassage}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>

          <Card className="content-card side-card" variant="borderless">
            <Title level={4}>{t('practice.suggestions')}</Title>
            <Timeline
              items={learningSteps.map((step) => ({
                color: '#e76f51',
                content: step,
              }))}
            />
          </Card>

          <Card className="content-card" variant="borderless">
            <Space orientation="vertical" size={12} className="full-width">
              <Title level={5} className="practice-mini-title">
                {selectedSection === 'word'
                  ? t('practice.todayPractice')
                  : pageCopy.generatorTipsTitle}
              </Title>
              {(selectedSection === 'word'
                ? currentGrade.exercises
                : [pageCopy.generatorTip1, pageCopy.generatorTip2, pageCopy.generatorTip3]
              ).map((item) => (
                <div key={item} className="practice-mini-item">
                  <PlayCircleOutlined className="accent-icon" />
                  <Text>{item}</Text>
                </div>
              ))}
            </Space>
          </Card>
        </Space>
      </Col>
    </Row>
  )
}

export default PracticePage
