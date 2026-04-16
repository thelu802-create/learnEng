import type { VocabularyTopic } from '../../types'
import type {
  ChoiceQuestion,
  MatchRound,
  PassageCandidate,
  PassageQuestion,
  PassageWordCategory,
  PracticeVocabularyWord,
} from './types'

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

export function buildChoiceQuestions(
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

export function buildMatchRounds(words: PracticeVocabularyWord[]): MatchRound[] {
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

export function mapVocabularyPool(
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

  if (
    normalizedWord.endsWith('ing') ||
    normalizedWord.endsWith('tion') ||
    normalizedWord.endsWith('ful')
  ) {
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
    return (
      candidateShape.length >= 3 &&
      candidateShape !== answerShape &&
      Math.abs(candidate.length - answer.length) <= 4
    )
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

export function buildPassageQuestions(passage: string, extraPool: string[] = []): PassageQuestion[] {
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
