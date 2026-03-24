import { useMemo, useState } from 'react'
import {
  CheckCircleOutlined,
  EditOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  RightOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Input,
  Progress,
  Radio,
  Row,
  Select,
  Space,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import { useI18n } from '../i18n'
import type { GradeContent, GradeKey, VocabularyTopic, VocabularyWord } from '../types'

const { TextArea } = Input
const { Title, Paragraph, Text } = Typography

type PracticeModeKey = 'meaning' | 'fill' | 'match'
type PracticeSectionKey = 'word' | 'generator'
type GeneratorViewKey = 'create' | 'take'

interface PracticeMode {
  key: PracticeModeKey
  title: string
  description: string
  available: boolean
}

interface PracticePageProps {
  selectedGrade: GradeKey
  currentGrade: GradeContent
  learningSteps: string[]
}

interface PracticeVocabularyWord extends VocabularyWord {
  topicKey: string
  topicTitle: string
}

interface ChoiceQuestion {
  id: string
  mode: 'meaning' | 'fill'
  prompt: string
  word: string
  ipa: string
  meaning: string
  example: string
  topicTitle: string
  options: string[]
  optionDetails: Record<string, string>
  correctAnswer: string
}

interface MatchRound {
  id: string
  pairs: PracticeVocabularyWord[]
  options: string[]
  topicTitle: string
}

interface PassageQuestion {
  id: string
  sentence: string
  prompt: string
  answer: string
  options: string[]
}

type PassageWordCategory = 'verb' | 'noun' | 'adjective' | 'adverb' | 'other'

interface PassageCandidate {
  word: string
  category: PassageWordCategory
  score: number
}

const STOP_WORDS = new Set([
  'the',
  'and',
  'that',
  'this',
  'with',
  'from',
  'they',
  'have',
  'your',
  'about',
  'there',
  'their',
  'would',
  'could',
  'should',
  'where',
  'which',
  'when',
  'while',
  'because',
  'into',
  'than',
  'them',
  'then',
  'were',
  'been',
  'being',
  'what',
  'will',
  'just',
  'over',
  'also',
  'some',
  'very',
  'much',
  'more',
  'many',
  'such',
  'only',
  'each',
  'every',
  'after',
  'before',
  'under',
  'between',
  'through',
  'during',
  'again',
  'always',
  'often',
])

function shuffleItems<T>(items: T[]): T[] {
  const clonedItems = [...items]

  for (let index = clonedItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[clonedItems[index], clonedItems[swapIndex]] = [clonedItems[swapIndex], clonedItems[index]]
  }

  return clonedItems
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildQuestionPrompt(mode: 'meaning' | 'fill', entry: PracticeVocabularyWord): string | null {
  if (mode === 'fill') {
    const pattern = new RegExp(escapeRegExp(entry.word), 'i')
    const blankedExample = entry.example.replace(pattern, '_____')

    if (!blankedExample || blankedExample === entry.example) {
      return null
    }

    return blankedExample
  }

  return entry.word
}

function isChoiceQuestion(question: ChoiceQuestion | null): question is ChoiceQuestion {
  return question !== null
}

function buildChoiceQuestions(
  words: PracticeVocabularyWord[],
  mode: 'meaning' | 'fill',
): ChoiceQuestion[] {
  if (words.length < 4) {
    return []
  }

  return shuffleItems(words)
    .map((entry) => {
      const distractors = shuffleItems(words.filter((word) => word.word !== entry.word)).slice(0, 3)
      const prompt = buildQuestionPrompt(mode, entry)

      if (!prompt) {
        return null
      }

      return {
        id: `${mode}-${entry.topicKey}-${entry.word}`,
        mode,
        prompt,
        word: entry.word,
        ipa: entry.ipa,
        meaning: entry.meaning,
        example: entry.example,
        topicTitle: entry.topicTitle,
        options:
          mode === 'fill'
            ? shuffleItems([entry.word, ...distractors.map((word) => word.word)])
            : shuffleItems([entry.meaning, ...distractors.map((word) => word.meaning)]),
        optionDetails:
          mode === 'fill'
            ? [entry, ...distractors].reduce<Record<string, string>>(
                (details, word) => ({
                  ...details,
                  [word.word]: word.ipa,
                }),
                {},
              )
            : {},
        correctAnswer: mode === 'fill' ? entry.word : entry.meaning,
      }
    })
    .filter(isChoiceQuestion)
    .slice(0, Math.min(words.length, 8))
}

function buildMatchRounds(words: PracticeVocabularyWord[]): MatchRound[] {
  if (words.length < 4) {
    return []
  }

  const shuffledWords = shuffleItems(words).slice(0, Math.min(words.length, 8))
  const rounds: MatchRound[] = []

  for (let index = 0; index < shuffledWords.length; index += 4) {
    const pairs = shuffledWords.slice(index, index + 4)

    if (pairs.length < 4) {
      break
    }

    rounds.push({
      id: `match-${index}`,
      pairs,
      options: shuffleItems(pairs.map((pair) => pair.meaning)),
      topicTitle: pairs[0].topicTitle,
    })
  }

  return rounds
}

function mapVocabularyPool(
  vocabularyTopics: VocabularyTopic[],
  selectedTopicKey: string,
): PracticeVocabularyWord[] {
  const filteredTopics =
    selectedTopicKey === 'all'
      ? vocabularyTopics
      : vocabularyTopics.filter((topic) => topic.key === selectedTopicKey)

  return filteredTopics.flatMap((topic) =>
    topic.words.map((word) => ({
      ...word,
      topicKey: topic.key,
      topicTitle: topic.title,
    })),
  )
}

function getCandidateWords(sentence: string): string[] {
  const matches = sentence.match(/[A-Za-z][A-Za-z'-]{3,}/g) ?? []

  return matches.filter((word) => !STOP_WORDS.has(word.toLowerCase()))
}

function inferWordCategoryByShape(word: string): PassageWordCategory {
  const normalizedWord = word.toLowerCase()

  if (normalizedWord.endsWith('ly')) {
    return 'adverb'
  }

  if (
    normalizedWord.endsWith('ing') ||
    normalizedWord.endsWith('ed') ||
    normalizedWord.endsWith('en')
  ) {
    return 'verb'
  }

  if (
    normalizedWord.endsWith('ous') ||
    normalizedWord.endsWith('ful') ||
    normalizedWord.endsWith('able') ||
    normalizedWord.endsWith('ible') ||
    normalizedWord.endsWith('ive') ||
    normalizedWord.endsWith('al') ||
    normalizedWord.endsWith('y')
  ) {
    return 'adjective'
  }

  if (
    normalizedWord.endsWith('tion') ||
    normalizedWord.endsWith('ment') ||
    normalizedWord.endsWith('ness') ||
    normalizedWord.endsWith('ship')
  ) {
    return 'noun'
  }

  return 'other'
}

function inferWordCategory(sentence: string, word: string): PassageWordCategory {
  const normalizedWord = word.toLowerCase()
  const normalizedSentence = sentence.toLowerCase()

  if (inferWordCategoryByShape(word) === 'adverb') {
    return 'adverb'
  }

  if (
    inferWordCategoryByShape(word) === 'verb' ||
    normalizedSentence.includes(`to ${normalizedWord}`) ||
    normalizedSentence.includes(`can ${normalizedWord}`) ||
    normalizedSentence.includes(`will ${normalizedWord}`) ||
    normalizedSentence.includes(`should ${normalizedWord}`) ||
    normalizedSentence.includes(`must ${normalizedWord}`) ||
    normalizedSentence.includes(`did ${normalizedWord}`) ||
    normalizedSentence.includes(`does ${normalizedWord}`) ||
    normalizedSentence.includes(`do ${normalizedWord}`)
  ) {
    return 'verb'
  }

  if (inferWordCategoryByShape(word) === 'adjective') {
    return 'adjective'
  }

  if (
    inferWordCategoryByShape(word) === 'noun' ||
    normalizedSentence.includes(`a ${normalizedWord}`) ||
    normalizedSentence.includes(`an ${normalizedWord}`) ||
    normalizedSentence.includes(`the ${normalizedWord}`) ||
    normalizedSentence.includes(`this ${normalizedWord}`) ||
    normalizedSentence.includes(`that ${normalizedWord}`) ||
    normalizedSentence.includes(`these ${normalizedWord}`) ||
    normalizedSentence.includes(`those ${normalizedWord}`) ||
    normalizedSentence.includes(`my ${normalizedWord}`) ||
    normalizedSentence.includes(`your ${normalizedWord}`) ||
    normalizedSentence.includes(`our ${normalizedWord}`) ||
    normalizedSentence.includes(`their ${normalizedWord}`)
  ) {
    return 'noun'
  }

  return 'other'
}

function scoreCandidate(sentence: string, word: string): PassageCandidate {
  const normalizedWord = word.toLowerCase()
  const category = inferWordCategory(sentence, word)
  let score = Math.min(word.length, 12)

  if (category !== 'other') {
    score += 4
  }

  if (/^[A-Z]/.test(word)) {
    score -= 3
  }

  if (normalizedWord.includes("'")) {
    score -= 2
  }

  if (normalizedWord.endsWith('ing') || normalizedWord.endsWith('tion') || normalizedWord.endsWith('ful')) {
    score += 2
  }

  return {
    word,
    category,
    score,
  }
}

function normalizeWordShape(word: string): string {
  return word
    .toLowerCase()
    .replace(/ing$|ed$|ly$|s$/g, '')
    .replace(/[^a-z]/g, '')
}

function buildDistractorOptions(
  answer: string,
  category: PassageWordCategory,
  sentencePool: string[],
  extraPool: string[],
): string[] {
  const answerShape = normalizeWordShape(answer)
  const mergedPool = [...new Set([...sentencePool, ...extraPool])]
  const categorizedPool = mergedPool.filter((candidate) => candidate.toLowerCase() !== answer.toLowerCase())

  const sameCategory = categorizedPool.filter(
    (candidate) => inferWordCategoryByShape(candidate) === category,
  )

  const similarShape = categorizedPool.filter((candidate) => {
    const candidateShape = normalizeWordShape(candidate)
    return candidateShape.length >= 3 && candidateShape !== answerShape && Math.abs(candidate.length - answer.length) <= 4
  })

  const prioritized = shuffleItems([
    ...sameCategory.filter((candidate) => candidate.toLowerCase() !== answer.toLowerCase()),
    ...similarShape,
    ...categorizedPool,
  ])

  return [...new Set(prioritized)].slice(0, 3)
}

function splitPassageIntoSentences(passage: string): string[] {
  return passage
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
}

function determineQuestionCount(sentenceCount: number, wordCount: number): number {
  return Math.max(4, Math.min(10, Math.min(sentenceCount, Math.round(wordCount / 16))))
}

function buildPassageQuestions(passage: string, extraPool: string[] = []): PassageQuestion[] {
  const sentences = splitPassageIntoSentences(passage)
  const wordCount = passage.trim().split(/\s+/).filter(Boolean).length
  const eligibleSentences = sentences
    .map((sentence) => ({
      sentence,
      candidates: [...new Set(getCandidateWords(sentence).map((word) => scoreCandidate(sentence, word)))],
    }))
    .filter((entry) => entry.candidates.length > 0)

  if (eligibleSentences.length < 4) {
    return []
  }

  const allCandidates = [
    ...new Set(eligibleSentences.flatMap((entry) => entry.candidates.map((candidate) => candidate.word))),
  ]
  const questionCount = determineQuestionCount(eligibleSentences.length, wordCount)

  return shuffleItems(eligibleSentences)
    .slice(0, questionCount)
    .map((entry, index) => {
      const answerCandidate = [...entry.candidates].sort((left, right) => right.score - left.score)[0]
      const answer = answerCandidate.word
      const prompt = entry.sentence.replace(new RegExp(`\\b${escapeRegExp(answer)}\\b`, 'i'), '_____')
      const distractors = buildDistractorOptions(
        answer,
        answerCandidate.category,
        allCandidates,
        extraPool,
      )

      return {
        id: `passage-${index + 1}`,
        sentence: entry.sentence,
        prompt,
        answer,
        options: shuffleItems([answer, ...distractors]),
      }
    })
}

interface PracticeChoiceSessionProps {
  selectedGrade: GradeKey
  vocabularyPool: PracticeVocabularyWord[]
  selectedMode: 'meaning' | 'fill'
}

function PracticeChoiceSession({
  selectedGrade,
  vocabularyPool,
  selectedMode,
}: PracticeChoiceSessionProps) {
  const { t, gradeLabel } = useI18n()
  const [questions, setQuestions] = useState<ChoiceQuestion[]>(() =>
    buildChoiceQuestions(vocabularyPool, selectedMode),
  )
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const currentQuestion = questions[questionIndex]
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer

  const resetSession = () => {
    setQuestions(buildChoiceQuestions(vocabularyPool, selectedMode))
    setQuestionIndex(0)
    setSelectedAnswer(null)
    setScore(0)
    setShowResult(false)
  }

  const handleAnswer = (value: string) => {
    if (showResult || !currentQuestion) {
      return
    }

    setSelectedAnswer(value)
    setShowResult(true)

    if (value === currentQuestion.correctAnswer) {
      setScore((currentScore) => currentScore + 1)
    }
  }

  const handleNextQuestion = () => {
    if (questionIndex >= questions.length - 1) {
      resetSession()
      return
    }

    setQuestionIndex((currentIndex) => currentIndex + 1)
    setSelectedAnswer(null)
    setShowResult(false)
  }

  return (
    <Card className="content-card practice-quiz-card" bordered={false}>
      {!currentQuestion ? (
        <Space direction="vertical" size={12} className="full-width">
          <Title level={4} className="practice-empty-title">
            {t('common.noData')}
          </Title>
          <Paragraph className="practice-empty-copy">{t('practice.quizNeedMore')}</Paragraph>
        </Space>
      ) : (
        <Space direction="vertical" size={18} className="full-width">
          <div className="practice-quiz-head">
            <div>
              <Text className="page-kicker">
                {t('practice.question', { count: questionIndex + 1 })}
              </Text>
              <Title level={3} className="practice-word-title">
                {selectedMode === 'fill' ? t('practice.fillTitle') : currentQuestion.word}
              </Title>
            </div>
            <div className="practice-question-meta">
              <Tag color="cyan">{gradeLabel(selectedGrade)}</Tag>
              <Tag color="orange">{currentQuestion.topicTitle}</Tag>
            </div>
          </div>

          {selectedMode !== 'fill' ? (
            <div className="practice-pronunciation">
              <Text>{currentQuestion.ipa || t('lessons.noIpa')}</Text>
            </div>
          ) : null}

          <div className="practice-question-panel">
            {selectedMode === 'fill' ? (
              <>
                <Text className="page-kicker">{t('practice.sentenceLabel')}</Text>
                <Paragraph className="practice-sentence-prompt">{currentQuestion.prompt}</Paragraph>
              </>
            ) : (
              <Paragraph className="practice-question-copy">{t('practice.chooseMeaning')}</Paragraph>
            )}
          </div>

          <Radio.Group
            value={selectedAnswer}
            onChange={(event) => handleAnswer(event.target.value)}
            className="practice-options"
          >
            <Space direction="vertical" size={12} className="full-width">
              {currentQuestion.options.map((option) => {
                let optionState = ''

                if (showResult && option === currentQuestion.correctAnswer) {
                  optionState = 'is-correct'
                } else if (showResult && option === selectedAnswer) {
                  optionState = 'is-wrong'
                }

                return (
                  <Radio.Button
                    key={option}
                    value={option}
                    className={`practice-option ${optionState}`.trim()}
                  >
                    {selectedMode === 'fill' ? (
                      <span className="practice-option-copy">
                        <span className="practice-option-word">{option}</span>
                        <span className="practice-option-ipa">
                          {currentQuestion.optionDetails[option] || t('common.noData')}
                        </span>
                      </span>
                    ) : (
                      option
                    )}
                  </Radio.Button>
                )
              })}
            </Space>
          </Radio.Group>

          {showResult ? (
            <div className={`practice-feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
              <Space direction="vertical" size={6} className="full-width">
                <Text strong>{isCorrect ? t('practice.correct') : t('practice.wrong')}</Text>
                {!isCorrect ? (
                  <Text>
                    {t('practice.correctAnswer', {
                      answer:
                        selectedMode === 'meaning'
                          ? `${currentQuestion.correctAnswer} - ${currentQuestion.meaning}`
                          : currentQuestion.correctAnswer,
                    })}
                  </Text>
                ) : null}
                <Text type="secondary">
                  {t('practice.fullExample', { value: currentQuestion.example })}
                </Text>
                <Text type="secondary">
                  {t('practice.vietnameseMeaning', { value: currentQuestion.meaning })}
                </Text>
                <Text type="secondary">
                  {t('practice.currentScore', { score, total: questions.length })}
                </Text>
              </Space>
            </div>
          ) : null}

          <div className="practice-actions">
            <Button icon={<ReloadOutlined />} onClick={resetSession}>
              {t('practice.resetQuestionSet')}
            </Button>
            <Button
              type="primary"
              icon={<RightOutlined />}
              iconPosition="end"
              onClick={handleNextQuestion}
              disabled={!showResult}
            >
              {questionIndex >= questions.length - 1 ? t('practice.restart') : t('practice.nextQuestion')}
            </Button>
          </div>
        </Space>
      )}
    </Card>
  )
}

interface PracticeMatchSessionProps {
  selectedGrade: GradeKey
  vocabularyPool: PracticeVocabularyWord[]
}

function PracticeMatchSession({ selectedGrade, vocabularyPool }: PracticeMatchSessionProps) {
  const { t, gradeLabel } = useI18n()
  const [rounds, setRounds] = useState<MatchRound[]>(() => buildMatchRounds(vocabularyPool))
  const [roundIndex, setRoundIndex] = useState(0)
  const [selectedPairs, setSelectedPairs] = useState<Record<string, string>>({})
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [roundScore, setRoundScore] = useState(0)

  const currentRound = rounds[roundIndex]
  const totalPossibleScore = rounds.length * 4

  const resetSession = () => {
    setRounds(buildMatchRounds(vocabularyPool))
    setRoundIndex(0)
    setSelectedPairs({})
    setShowResult(false)
    setScore(0)
    setRoundScore(0)
  }

  const handleSelectMeaning = (word: string, meaning: string) => {
    if (showResult) {
      return
    }

    setSelectedPairs((currentPairs) => ({
      ...currentPairs,
      [word]: meaning,
    }))
  }

  const handleCheckRound = () => {
    if (!currentRound) {
      return
    }

    const matchedCount = currentRound.pairs.reduce((count, pair) => {
      return selectedPairs[pair.word] === pair.meaning ? count + 1 : count
    }, 0)

    setRoundScore(matchedCount)
    setScore((currentScore) => currentScore + matchedCount)
    setShowResult(true)
  }

  const handleNextRound = () => {
    if (roundIndex >= rounds.length - 1) {
      resetSession()
      return
    }

    setRoundIndex((currentIndex) => currentIndex + 1)
    setSelectedPairs({})
    setShowResult(false)
    setRoundScore(0)
  }

  const allPairsSelected =
    currentRound?.pairs.every((pair) => Boolean(selectedPairs[pair.word])) ?? false

  return (
    <Card className="content-card practice-quiz-card" bordered={false}>
      {!currentRound ? (
        <Space direction="vertical" size={12} className="full-width">
          <Title level={4} className="practice-empty-title">
            {t('common.noData')}
          </Title>
          <Paragraph className="practice-empty-copy">{t('practice.matchNeedMore')}</Paragraph>
        </Space>
      ) : (
        <Space direction="vertical" size={18} className="full-width">
          <div className="practice-quiz-head">
            <div>
              <Text className="page-kicker">{t('practice.round', { count: roundIndex + 1 })}</Text>
              <Title level={3} className="practice-word-title">
                {t('practice.matchTitle')}
              </Title>
            </div>
            <div className="practice-question-meta">
              <Tag color="cyan">{gradeLabel(selectedGrade)}</Tag>
              <Tag color="orange">{currentRound.topicTitle}</Tag>
            </div>
          </div>

          <div className="practice-question-panel">
            <Text className="page-kicker">{t('practice.instructions')}</Text>
            <Paragraph className="practice-question-copy">{t('practice.matchInstructions')}</Paragraph>
          </div>

          <div className="practice-match-list">
            {currentRound.pairs.map((pair, index) => {
              const isPairCorrect = selectedPairs[pair.word] === pair.meaning
              const rowState = showResult ? (isPairCorrect ? 'is-correct' : 'is-wrong') : ''

              return (
                <div key={pair.word} className={`practice-match-row ${rowState}`.trim()}>
                  <div className="practice-match-word">
                    <Text className="practice-match-index">{index + 1}</Text>
                    <div>
                      <Text strong>{pair.word}</Text>
                      <Text className="practice-match-ipa">
                        {pair.ipa || t('lessons.noIpa')}
                      </Text>
                    </div>
                  </div>

                  <Select
                    value={selectedPairs[pair.word]}
                    placeholder={t('practice.meaningPlaceholder')}
                    onChange={(value) => handleSelectMeaning(pair.word, value)}
                    className="practice-match-select"
                    options={currentRound.options.map((option) => ({
                      label: option,
                      value: option,
                    }))}
                    disabled={showResult}
                  />
                </div>
              )
            })}
          </div>

          {showResult ? (
            <div className={`practice-feedback ${roundScore === 4 ? 'is-correct' : 'is-wrong'}`}>
              <Space direction="vertical" size={6} className="full-width">
                <Text strong>
                  {roundScore === 4
                    ? t('practice.matchPerfect')
                    : t('practice.matchScore', { score: roundScore })}
                </Text>
                {currentRound.pairs.map((pair) => (
                  <Text key={pair.word} type="secondary">
                    {pair.word}: {pair.meaning}
                  </Text>
                ))}
                <Text type="secondary">
                  {t('practice.totalScore', { score, total: totalPossibleScore })}
                </Text>
              </Space>
            </div>
          ) : null}

          <div className="practice-actions">
            <Button icon={<ReloadOutlined />} onClick={resetSession}>
              {t('practice.resetMatchSet')}
            </Button>
            <Space>
              <Button
                type="default"
                onClick={handleCheckRound}
                disabled={!allPairsSelected || showResult}
              >
                {t('practice.checkScore')}
              </Button>
              <Button
                type="primary"
                icon={<RightOutlined />}
                iconPosition="end"
                onClick={handleNextRound}
                disabled={!showResult}
              >
                {roundIndex >= rounds.length - 1 ? t('practice.restart') : t('practice.nextRound')}
              </Button>
            </Space>
          </div>
        </Space>
      )}
    </Card>
  )
}

interface PassageGeneratorPanelProps {
  distractorPool: string[]
}

function PassageGeneratorPanel({ distractorPool }: PassageGeneratorPanelProps) {
  const { language } = useI18n()
  const [passage, setPassage] = useState('')
  const [questions, setQuestions] = useState<PassageQuestion[]>([])

  const copy =
    language === 'en'
      ? {
          title: 'Passage quiz generator',
          intro: 'Paste a passage and generate fill-in multiple-choice questions automatically.',
          placeholder:
            'Paste an English paragraph here. The generator will create 4 to 10 fill-in questions depending on the passage length.',
          generate: 'Generate questions',
          reset: 'Clear passage',
          requirement:
            'Use a passage with at least 4 meaningful sentences so the generator can build a stronger question set.',
          empty: 'No questions yet',
          emptyCopy: 'Paste a passage and press Generate questions to create a quick worksheet.',
          resultTitle: 'Generated question set',
          originalSentence: 'Original sentence',
          correctAnswer: 'Correct answer',
          noQuestions:
            'The passage is still too short or too simple. Try a longer paragraph with clearer full sentences.',
          question: 'Question',
        }
      : {
          title: 'Passage quiz generator',
          intro: 'Dán một đoạn văn để hệ thống tự tạo bộ câu hỏi điền từ trắc nghiệm.',
          placeholder:
            'Dán đoạn văn tiếng Anh vào đây. Hệ thống sẽ tạo từ 4 đến 10 câu hỏi điền từ tùy theo độ dài và số câu của đoạn.',
          generate: 'Tạo câu hỏi',
          reset: 'Xóa đoạn văn',
          requirement:
            'Nên dùng đoạn văn có ít nhất 4 câu rõ nghĩa để bộ câu hỏi tạo ra sát nội dung hơn.',
          empty: 'Chưa có câu hỏi',
          emptyCopy: 'Dán đoạn văn rồi bấm Tạo câu hỏi để tạo nhanh một bộ bài tập.',
          resultTitle: 'Bộ câu hỏi đã tạo',
          originalSentence: 'Câu gốc',
          correctAnswer: 'Đáp án đúng',
          noQuestions:
            'Đoạn văn hiện còn quá ngắn hoặc chưa đủ rõ. Hãy thử một đoạn dài hơn với nhiều câu đầy đủ hơn.',
          question: 'Câu',
        }

  const handleGenerate = () => {
    setQuestions(buildPassageQuestions(passage, distractorPool))
  }

  const handleReset = () => {
    setPassage('')
    setQuestions([])
  }

  return (
    <Space direction="vertical" size={18} className="full-width">
      <Card className="content-card practice-generator-card" bordered={false}>
        <Space direction="vertical" size={16} className="full-width">
          <div className="section-heading">
            <Title level={2}>{copy.title}</Title>
            <Paragraph>{copy.intro}</Paragraph>
          </div>

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
        </Space>
      </Card>

      <Card className="content-card practice-quiz-card" bordered={false}>
        {passage.trim().length > 0 && questions.length === 0 ? (
          <Space direction="vertical" size={12} className="full-width">
            <Title level={4} className="practice-empty-title">
              {copy.empty}
            </Title>
            <Paragraph className="practice-empty-copy">{copy.noQuestions}</Paragraph>
          </Space>
        ) : questions.length === 0 ? (
          <Space direction="vertical" size={12} className="full-width">
            <Title level={4} className="practice-empty-title">
              {copy.empty}
            </Title>
            <Paragraph className="practice-empty-copy">{copy.emptyCopy}</Paragraph>
          </Space>
        ) : (
          <Space direction="vertical" size={16} className="full-width">
            <div className="practice-quiz-head">
              <div>
                <Text className="page-kicker">{copy.resultTitle}</Text>
                <Title level={3} className="practice-word-title">
                  {questions.length} {language === 'en' ? 'questions ready' : 'câu đã sẵn sàng'}
                </Title>
              </div>
              <Tag color="cyan">MCQ</Tag>
            </div>

            <div className="practice-generator-list">
              {questions.map((question, index) => (
                <div key={question.id} className="practice-generator-question">
                  <Space direction="vertical" size={10} className="full-width">
                    <Text className="page-kicker">
                      {copy.question} {index + 1}
                    </Text>
                    <Paragraph className="practice-sentence-prompt">{question.prompt}</Paragraph>

                    <Radio.Group value={null} className="practice-options">
                      <Space direction="vertical" size={10} className="full-width">
                        {question.options.map((option) => (
                          <Radio.Button
                            key={`${question.id}-${option}`}
                            value={option}
                            className={`practice-option ${
                              option === question.answer ? 'is-correct' : ''
                            }`.trim()}
                          >
                            {option}
                          </Radio.Button>
                        ))}
                      </Space>
                    </Radio.Group>

                    <div className="practice-feedback is-correct">
                      <Space direction="vertical" size={4} className="full-width">
                        <Text strong>
                          {copy.correctAnswer}: {question.answer}
                        </Text>
                        <Text type="secondary">
                          {copy.originalSentence}: {question.sentence}
                        </Text>
                      </Space>
                    </div>
                  </Space>
                </div>
              ))}
            </div>
          </Space>
        )}
      </Card>
    </Space>
  )
}

void PassageGeneratorPanel

function PassageGeneratorWorkbench({ distractorPool }: PassageGeneratorPanelProps) {
  const { language } = useI18n()
  const [passage, setPassage] = useState('')
  const [questions, setQuestions] = useState<PassageQuestion[]>([])
  const [generatorView, setGeneratorView] = useState<GeneratorViewKey>('create')
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const copy =
    language === 'en'
      ? {
          title: 'Passage quiz generator',
          createTab: 'Create quiz',
          takeTab: 'Take quiz',
          intro: 'Paste a passage and generate fill-in multiple-choice questions automatically.',
          placeholder:
            'Paste an English paragraph here. The generator will create 4 to 10 fill-in questions depending on the passage length.',
          generate: 'Generate questions',
          reset: 'Clear passage',
          submit: 'Submit quiz',
          retry: 'Try again',
          switchHint: 'Use Create quiz to prepare the worksheet, then switch to Take quiz for students.',
          requirement:
            'Use a passage with at least 4 meaningful sentences so the generator can build a stronger question set.',
          empty: 'No questions yet',
          emptyCopy: 'Paste a passage and press Generate questions to create a quick worksheet.',
          emptyTakeTitle: 'Quiz not ready yet',
          emptyTakeCopy: 'Generate a question set first, then switch here so students can answer it.',
          resultTitle: 'Generated question set',
          takeTitle: 'Student quiz',
          takeIntro: 'Students can answer the questions below and only see the correct answers after submitting.',
          originalSentence: 'Original sentence',
          correctAnswer: 'Correct answer',
          noQuestions:
            'The passage is still too short or too simple. Try a longer paragraph with clearer full sentences.',
          question: 'Question',
          quizReady: 'questions ready',
          studentProgress: 'Completed',
          studentScore: 'Score',
          chooseAnswer: 'Choose all answers, then submit to reveal the result.',
          correct: 'Correct',
          wrong: 'Incorrect',
        }
      : {
          title: 'Passage quiz generator',
          createTab: 'Tạo bài',
          takeTab: 'Làm bài',
          intro: 'Dán một đoạn văn để hệ thống tự tạo bộ câu hỏi điền từ trắc nghiệm.',
          placeholder:
            'Dán đoạn văn tiếng Anh vào đây. Hệ thống sẽ tạo từ 4 đến 10 câu hỏi điền từ tùy theo độ dài và số câu của đoạn.',
          generate: 'Tạo câu hỏi',
          reset: 'Xóa đoạn văn',
          submit: 'Nộp bài',
          retry: 'Làm lại',
          switchHint: 'Dùng mục Tạo bài để chuẩn bị đề, sau đó chuyển sang Làm bài để học sinh làm trực tiếp.',
          requirement:
            'Nên dùng đoạn văn có ít nhất 4 câu rõ nghĩa để bộ câu hỏi tạo ra sát nội dung hơn.',
          empty: 'Chưa có câu hỏi',
          emptyCopy: 'Dán đoạn văn rồi bấm Tạo câu hỏi để tạo nhanh một bộ bài tập.',
          emptyTakeTitle: 'Chưa có bài để làm',
          emptyTakeCopy: 'Hãy tạo bộ câu hỏi trước, rồi chuyển sang mục này để học sinh làm bài.',
          resultTitle: 'Bộ câu hỏi đã tạo',
          takeTitle: 'Chế độ học sinh',
          takeIntro: 'Học sinh làm bài trực tiếp bên dưới và chỉ xem đáp án sau khi nộp.',
          originalSentence: 'Câu gốc',
          correctAnswer: 'Đáp án đúng',
          noQuestions:
            'Đoạn văn hiện còn quá ngắn hoặc chưa đủ rõ. Hãy thử một đoạn dài hơn với nhiều câu đầy đủ hơn.',
          question: 'Câu',
          quizReady: 'câu đã sẵn sàng',
          studentProgress: 'Đã làm',
          studentScore: 'Điểm',
          chooseAnswer: 'Chọn đủ đáp án rồi nộp bài để xem kết quả.',
          correct: 'Đúng',
          wrong: 'Sai',
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
    <Space direction="vertical" size={18} className="full-width">
      <Card className="content-card practice-generator-card" bordered={false}>
        <Space direction="vertical" size={16} className="full-width">
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

      <Card className="content-card practice-quiz-card" bordered={false}>
        {generatorView === 'take' && questions.length === 0 ? (
          <Space direction="vertical" size={12} className="full-width">
            <Title level={4} className="practice-empty-title">
              {copy.emptyTakeTitle}
            </Title>
            <Paragraph className="practice-empty-copy">{copy.emptyTakeCopy}</Paragraph>
          </Space>
        ) : passage.trim().length > 0 && questions.length === 0 ? (
          <Space direction="vertical" size={12} className="full-width">
            <Title level={4} className="practice-empty-title">
              {copy.empty}
            </Title>
            <Paragraph className="practice-empty-copy">{copy.noQuestions}</Paragraph>
          </Space>
        ) : questions.length === 0 ? (
          <Space direction="vertical" size={12} className="full-width">
            <Title level={4} className="practice-empty-title">
              {copy.empty}
            </Title>
            <Paragraph className="practice-empty-copy">{copy.emptyCopy}</Paragraph>
          </Space>
        ) : (
          <Space direction="vertical" size={16} className="full-width">
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
                  <Space direction="vertical" size={10} className="full-width">
                    <Text className="page-kicker">
                      {copy.question} {index + 1}
                    </Text>
                    <Paragraph className="practice-sentence-prompt">{question.prompt}</Paragraph>

                    <Radio.Group
                      value={generatorView === 'take' ? studentAnswers[question.id] : null}
                      onChange={(event) => handleStudentAnswer(question.id, event.target.value)}
                      className="practice-options"
                    >
                      <Space direction="vertical" size={10} className="full-width">
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
                        <Space direction="vertical" size={4} className="full-width">
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

function PracticePage({ selectedGrade, currentGrade, learningSteps }: PracticePageProps) {
  const { t, gradeLabel, language } = useI18n()
  const [selectedSection, setSelectedSection] = useState<PracticeSectionKey>('word')
  const [selectedTopicKey, setSelectedTopicKey] = useState('all')
  const [selectedMode, setSelectedMode] = useState<PracticeModeKey>('meaning')

  const pageCopy =
    language === 'en'
      ? {
          wordPractice: 'Word practice',
          wordPracticeCopy: 'Use the built-in vocabulary practice modes for the selected grade.',
          generator: 'Passage quiz generator',
          generatorCopy: 'Turn any English paragraph into a quick fill-in question set.',
        }
      : {
          wordPractice: 'Word practice',
          wordPracticeCopy: 'Dùng các chế độ luyện từ vựng có sẵn theo khối đang chọn.',
          generator: 'Passage quiz generator',
          generatorCopy: 'Biến một đoạn văn tiếng Anh thành bộ câu hỏi điền từ nhanh.',
        }

  const practiceModes: PracticeMode[] = [
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
  ]

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

  const activeTopicCount =
    selectedTopicKey === 'all'
      ? currentGrade.vocabularyTopics.length
      : currentGrade.vocabularyTopics.filter((topic) => topic.key === selectedTopicKey).length

  return (
    <Row gutter={[18, 18]}>
      <Col xs={24} xl={16}>
        <Space direction="vertical" size={18} className="full-width">
          <Card className="content-card practice-hero-card" bordered={false}>
            <Space direction="vertical" size={18} className="full-width">
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
            <PassageGeneratorWorkbench
              distractorPool={currentGrade.vocabularyTopics.flatMap((topic) =>
                topic.words.map((word) => word.word),
              )}
            />
          )}
        </Space>
      </Col>

      <Col xs={24} xl={8}>
        <Space direction="vertical" size={18} className="full-width">
          <Card className="content-card highlight-card" bordered={false}>
            <Space direction="vertical" size={16} className="full-width">
              <div className="practice-score-head">
                <div>
                  <Text className="page-kicker">{t('practice.overviewTitle')}</Text>
                  <Title level={4} className="practice-score-title">
                    {selectedSection === 'word'
                      ? `${vocabularyPool.length} ${t('common.levelReady')}`
                      : language === 'en'
                        ? 'Generator ready'
                        : 'Sẵn sàng tạo bài'}
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
                      : language === 'en'
                        ? '4-10 quiz items'
                        : '4-10 câu hỏi'}
                  </Text>
                </div>
                <div className="practice-score-box">
                  <PlayCircleOutlined />
                  <Text>
                    {selectedSection === 'word'
                      ? `${Math.min(vocabularyPool.length, 8)} ${t('common.questionsPerRound')}`
                      : language === 'en'
                        ? 'Auto from passage'
                        : 'Tự tạo từ đoạn văn'}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>

          <Card className="content-card side-card" bordered={false}>
            <Title level={4}>{t('practice.suggestions')}</Title>
            <Timeline
              items={learningSteps.map((step) => ({
                color: '#e76f51',
                children: step,
              }))}
            />
          </Card>

          <Card className="content-card" bordered={false}>
            <Space direction="vertical" size={12} className="full-width">
              <Title level={5} className="practice-mini-title">
                {selectedSection === 'word'
                  ? t('practice.todayPractice')
                  : language === 'en'
                    ? 'Generator tips'
                    : 'Gợi ý khi tạo bài'}
              </Title>
              {(selectedSection === 'word'
                ? currentGrade.exercises
                : language === 'en'
                  ? [
                      'Paste a passage with 4 or more full sentences',
                      'Use topic vocabulary you want students to revise',
                      'Review the generated options before giving the worksheet',
                    ]
                  : [
                      'Dùng đoạn văn có từ 4 câu đầy đủ trở lên',
                      'Ưu tiên đoạn có từ vựng đúng chủ điểm cần ôn',
                      'Kiểm tra lại đáp án trước khi giao cho học sinh',
                    ]
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
