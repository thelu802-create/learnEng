export type MosExamApp = 'Word' | 'Excel' | 'PowerPoint'
export type MosExamDifficulty = 'Dễ' | 'Trung bình' | 'Khó'

export type MosExamSkill =
  | 'Manage documents'
  | 'Insert and format text, paragraphs, and sections'
  | 'Manage tables and lists'
  | 'Create and manage references'
  | 'Insert and format graphic elements'
  | 'Manage document collaboration'
  | 'Manage worksheets and workbooks'
  | 'Manage data cells and ranges'
  | 'Manage tables and table data'
  | 'Use formulas and functions'
  | 'Manage charts'

export interface MosExamTask {
  id: string
  skill: MosExamSkill
  title: string
  instruction: string
  points: number
  checklist: string[]
}

export interface MosMockExam {
  id: string
  app: MosExamApp
  code: string
  title: string
  difficulty: MosExamDifficulty
  durationMinutes: number
  passingScore: number
  sourceNote: string
  scenario: string
  starterFiles: string[]
  deliverables: string[]
  tasks: MosExamTask[]
}
