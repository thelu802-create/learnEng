import { createContext, useContext } from 'react'
import type { GradeKey, Language, MenuKey } from './types'

export interface I18nContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
  gradeLabel: (grade: GradeKey) => string
  menuLabel: (menuKey: MenuKey) => string
}

export const STORAGE_KEY = 'learneng-language'

export const translations = {
  vi: {
    common: {
      appOwner: 'Nguyễn Thế Lữ',
      gradeLabel: 'Khối đang học',
      chooseGrade: 'Chọn khối',
      language: 'Ngôn ngữ',
      levelReady: 'sẵn sàng',
      topicsOpen: 'chủ đề đang mở',
      questionsPerRound: 'câu mỗi lượt',
      currentProgress: 'Tiến độ hiện tại',
      projectApply: 'Dự án áp dụng',
      keySkills: 'Kỹ năng trọng tâm',
      noData: 'Chưa đủ dữ liệu',
      allTopics: 'Tất cả chủ đề',
    },
    menu: {
      home: 'Trang chủ',
      lessons: 'Bài học',
      practice: 'Luyện tập',
      planner: 'Nhắc việc',
      progress: 'Tiến độ',
      help: 'Hướng dẫn',
    },
    home: {
      tag: 'Tiếng Anh THCS',
      title: 'Học tiếng Anh theo chủ điểm',
      copy: 'Xem bài học, tra từ vựng và luyện tập nhanh theo từng khối.',
      openLessons: 'Khám phá bài học',
      openPractice: 'Bắt đầu luyện tập',
      pointSearch: 'Tra từ vựng toàn bộ các khối ngay trên một màn hình',
      pointPractice:
        'Ba kiểu luyện tập giúp nhớ từ theo nghĩa, ngữ cảnh và cặp ghép',
      selectedGrade: 'Khối đang chọn',
      currentProgress: 'Tiến độ hiện tại',
      units: 'bài học trọng tâm',
      words: 'từ vựng đang có',
      topics: 'chủ đề tra cứu',
      skills: 'nhóm kỹ năng',
      statUnits: 'Bài học',
      statWords: 'Từ vựng',
      statSkills: 'Kỹ năng',
      statProgress: 'Tiến độ',
      journeyTitle: 'Hành trình học trong một nhịp rõ ràng',
      journeyCopy:
        'Từ xem bài học đến luyện tập, mọi thứ đều được rút gọn để bạn học nhanh hơn mà vẫn nắm chắc kiến thức.',
      journey1Title: 'Xem chủ điểm học',
      journey1Copy:
        'Đọc nhanh nội dung từng bài, điểm ngữ pháp chính và phần project của mỗi chủ đề.',
      journey2Title: 'Tra và ghi nhớ từ vựng',
      journey2Copy:
        'Tìm từ theo nghĩa, ví dụ và đối chiếu luôn giữa các khối khi cần ôn lại.',
      journey3Title: 'Luyện tập theo ngữ cảnh',
      journey3Copy:
        'Làm bài chọn nghĩa, điền từ và ghép từ để nhớ cả phát âm lẫn cách dùng.',
      nextTitle: 'Đi tiếp từ đây',
      nextCopy:
        'Nếu muốn học có nhịp hơn, bạn nên vào bài học trước rồi sang luyện tập ngay sau đó.',
      nextLessons: 'Mở phần bài học',
      nextLessonsCopy: 'Xem chủ điểm, từ vựng và nội dung theo khối',
      nextPractice: 'Vào luyện tập',
      nextPracticeCopy: 'Ôn từ qua ba kiểu bài tập trực tiếp trên web',
      itemSuffix: 'mục',
      wordSuffix: 'từ',
      skillSuffix: 'nhóm',
    },
    lessons: {
      title: 'Nội dung học của {grade}',
      searchPlaceholder: 'Tra nhanh từ vựng toàn bộ các khối',
      unitsTab: 'Chủ điểm học',
      vocabularyTab: 'Tra từ vựng',
      grammar: 'Ngữ pháp:',
      vocabulary: 'Từ vựng:',
      linkedWords: 'từ liên kết',
      practice: 'Luyện tập:',
      project: 'Dự án:',
      searchFound: 'Tìm thấy {count} từ phù hợp trong các khối.',
      searchDefault: 'Hiển thị {count} từ của {grade}.',
      words: 'từ',
      noWords: 'Không tìm thấy từ vựng phù hợp.',
      noSelectedWord: 'Chọn một từ vựng để xem chi tiết.',
      noIpa: 'Chưa có IPA',
      noExample: 'Chưa có ví dụ sử dụng.',
    },
    practice: {
      title: 'Luyện tập',
      intro:
        'Chọn kiểu luyện phù hợp với {grade}, sau đó làm nhanh từng câu để ghi nhớ từ vựng tốt hơn.',
      modeMeaning: 'Chọn nghĩa đúng',
      modeMeaningCopy:
        'Nhìn từ tiếng Anh và chọn nghĩa tiếng Việt phù hợp nhất.',
      modeFill: 'Điền từ còn thiếu',
      modeFillCopy:
        'Nhìn câu ví dụ có chỗ trống và chọn từ đúng để điền.',
      modeMatch: 'Ghép từ với nghĩa',
      modeMatchCopy:
        'Một lượt 4 từ, chọn đúng nghĩa cho từng từ rồi chấm điểm.',
      available: 'Đang dùng',
      comingSoon: 'Sắp có',
      quizNeedMore:
        'Chủ đề này cần ít nhất 4 từ và câu ví dụ phù hợp để tạo bài luyện. Bạn thử chuyển sang chủ đề khác hoặc chọn tất cả chủ đề.',
      matchNeedMore:
        'Chủ đề này cần ít nhất 4 từ để tạo một lượt ghép hoàn chỉnh.',
      question: 'Câu {count}',
      round: 'Lượt {count}',
      fillTitle: 'Điền vào chỗ trống',
      matchTitle: 'Ghép từ với nghĩa',
      sentenceLabel: 'Câu ví dụ',
      chooseMeaning: 'Chọn nghĩa tiếng Việt đúng nhất cho từ trên.',
      instructions: 'Hướng dẫn',
      matchInstructions:
        'Chọn nghĩa đúng cho từng từ bên dưới, sau đó bấm `Chấm điểm`.',
      meaningPlaceholder: 'Chọn nghĩa phù hợp',
      checkScore: 'Chấm điểm',
      resetQuestionSet: 'Làm lại bộ câu hỏi',
      resetMatchSet: 'Làm lại lượt ghép',
      nextQuestion: 'Câu tiếp theo',
      nextRound: 'Lượt tiếp theo',
      restart: 'Chơi lại từ đầu',
      correct: 'Chính xác rồi',
      wrong: 'Chưa đúng rồi',
      correctAnswer: 'Đáp án đúng là: {answer}',
      fullExample: 'Ví dụ đầy đủ: {value}',
      vietnameseMeaning: 'Nghĩa tiếng Việt: {value}',
      currentScore: 'Điểm hiện tại: {score}/{total}',
      matchPerfect: 'Bạn ghép đúng hết rồi',
      matchScore: 'Bạn ghép đúng {score}/4 cặp trong lượt này',
      totalScore: 'Tổng điểm hiện tại: {score}/{total}',
      overviewTitle: 'Tổng quan lượt luyện',
      suggestions: 'Gợi ý luyện hiệu quả',
      todayPractice: 'Hôm nay nên luyện gì?',
    },
    progress: {
      eyebrow: 'Tiến độ hiện tại',
      description:
        'Mức hoàn thành giả lập theo nội dung đã học trong khối {grade}.',
      milestones: 'Mốc cần hoàn thành',
      item1: 'Hoàn thành toàn bộ từ vựng chủ đề',
      item2: 'Ôn tập ngữ pháp trọng tâm',
      item3: 'Làm 3 bài luyện tập theo kỹ năng',
      item4: 'Hoàn thành 1 dự án cuối chủ đề',
    },
  },
  en: {
    common: {
      appOwner: 'Nguyen The Lu',
      gradeLabel: 'Current grade',
      chooseGrade: 'Choose grade',
      language: 'Language',
      levelReady: 'ready',
      topicsOpen: 'topics open',
      questionsPerRound: 'questions per round',
      currentProgress: 'Current progress',
      projectApply: 'Applied project',
      keySkills: 'Key skills',
      noData: 'Not enough data',
      allTopics: 'All topics',
    },
    menu: {
      home: 'Home',
      lessons: 'Lessons',
      practice: 'Practice',
      planner: 'Planner',
      progress: 'Progress',
      help: 'Help',
    },
    home: {
      tag: 'Lower secondary English',
      title: 'Learn English by topic',
      copy: 'Open lessons, search vocabulary, and practice by grade in one place.',
      openLessons: 'Explore lessons',
      openPractice: 'Start practice',
      pointSearch: 'Search vocabulary across all grades on one screen',
      pointPractice:
        'Three practice modes to remember meaning, context, and matching pairs',
      selectedGrade: 'Selected grade',
      currentProgress: 'Current progress',
      units: 'core lessons',
      words: 'available words',
      topics: 'search topics',
      skills: 'skill groups',
      statUnits: 'Lessons',
      statWords: 'Vocabulary',
      statSkills: 'Skills',
      statProgress: 'Progress',
      journeyTitle: 'A clear study flow from start to review',
      journeyCopy:
        'From lesson reading to practice, the whole experience is organized to help you study faster without losing structure.',
      journey1Title: 'Review lesson topics',
      journey1Copy:
        'Scan each unit quickly, including the main grammar point and project task.',
      journey2Title: 'Search and retain vocabulary',
      journey2Copy:
        'Find words by meaning and example, and compare them across grades when revising.',
      journey3Title: 'Practice in context',
      journey3Copy:
        'Use meaning, fill-in, and matching exercises to remember pronunciation and usage.',
      nextTitle: 'Where to go next',
      nextCopy: 'A good flow is to open lessons first, then move to practice right after.',
      nextLessons: 'Open lessons',
      nextLessonsCopy: 'Browse topics, vocabulary, and unit content by grade',
      nextPractice: 'Open practice',
      nextPracticeCopy: 'Review vocabulary with three practice modes directly on the web',
      itemSuffix: 'items',
      wordSuffix: 'words',
      skillSuffix: 'groups',
    },
    lessons: {
      title: 'Learning content for {grade}',
      searchPlaceholder: 'Quick search across all grades',
      unitsTab: 'Learning topics',
      vocabularyTab: 'Vocabulary search',
      grammar: 'Grammar:',
      vocabulary: 'Vocabulary:',
      linkedWords: 'linked words',
      practice: 'Practice:',
      project: 'Project:',
      searchFound: 'Found {count} matching words across grades.',
      searchDefault: 'Showing {count} words from {grade}.',
      words: 'words',
      noWords: 'No matching vocabulary found.',
      noSelectedWord: 'Choose a word to view its details.',
      noIpa: 'IPA unavailable',
      noExample: 'No example available yet.',
    },
    practice: {
      title: 'Practice',
      intro: 'Choose a suitable mode for {grade}, then answer each question to reinforce vocabulary.',
      modeMeaning: 'Choose the meaning',
      modeMeaningCopy: 'See the English word and choose the best Vietnamese meaning.',
      modeFill: 'Fill in the blank',
      modeFillCopy: 'Read the sentence with a blank and choose the correct word.',
      modeMatch: 'Match word and meaning',
      modeMatchCopy: 'Work through 4 words in one round and score them together.',
      available: 'Available',
      comingSoon: 'Coming soon',
      quizNeedMore:
        'This topic needs at least 4 words and suitable examples to build an exercise. Try another topic or choose all topics.',
      matchNeedMore: 'This topic needs at least 4 words to build a matching round.',
      question: 'Question {count}',
      round: 'Round {count}',
      fillTitle: 'Fill in the blank',
      matchTitle: 'Match word and meaning',
      sentenceLabel: 'Example sentence',
      chooseMeaning: 'Choose the best Vietnamese meaning for the word above.',
      instructions: 'Instructions',
      matchInstructions: 'Choose the correct meaning for each word below, then press `Score`.',
      meaningPlaceholder: 'Choose a matching meaning',
      checkScore: 'Score',
      resetQuestionSet: 'Reset question set',
      resetMatchSet: 'Reset matching round',
      nextQuestion: 'Next question',
      nextRound: 'Next round',
      restart: 'Start over',
      correct: 'Correct',
      wrong: 'Not quite right',
      correctAnswer: 'Correct answer: {answer}',
      fullExample: 'Full example: {value}',
      vietnameseMeaning: 'Vietnamese meaning: {value}',
      currentScore: 'Current score: {score}/{total}',
      matchPerfect: 'You matched all pairs correctly',
      matchScore: 'You matched {score}/4 pairs in this round',
      totalScore: 'Current total score: {score}/{total}',
      overviewTitle: 'Practice overview',
      suggestions: 'Effective practice tips',
      todayPractice: 'What should you practice today?',
    },
    progress: {
      eyebrow: 'Current progress',
      description: 'A sample completion level based on the content covered in {grade}.',
      milestones: 'Milestones to complete',
      item1: 'Complete all topic vocabulary',
      item2: 'Review the key grammar points',
      item3: 'Finish 3 skill-based practice activities',
      item4: 'Complete 1 end-of-topic project',
    },
  },
} as const

export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) {
    return template
  }

  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replaceAll(`{${key}}`, String(value))
  }, template)
}

export function getNestedValue(language: Language, key: string): string {
  const segments = key.split('.')
  let current: unknown = translations[language]

  for (const segment of segments) {
    if (!current || typeof current !== 'object' || !(segment in current)) {
      return key
    }

    current = (current as Record<string, unknown>)[segment]
  }

  return typeof current === 'string' ? current : key
}

export function translateGrade(grade: GradeKey, language: Language): string {
  if (language === 'en') {
    return grade.replace('Lớp', 'Grade').replace('Lá»›p', 'Grade')
  }

  return grade.replace('Lá»›p', 'Lớp')
}

export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'vi'
  }

  const savedLanguage = window.localStorage.getItem(STORAGE_KEY)
  return savedLanguage === 'en' ? 'en' : 'vi'
}

export const I18nContext = createContext<I18nContextValue | null>(null)

export function useI18n() {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useI18n must be used within I18nProvider.')
  }

  return context
}
