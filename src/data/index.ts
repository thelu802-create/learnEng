import type { GradeContentMap } from '../types'
import grade6 from './grades/grade6'
import grade7 from './grades/grade7'
import grade8 from './grades/grade8'
import grade9 from './grades/grade9'
import { learningSteps } from './learningSteps'

export const gradeContent: GradeContentMap = {
  'Lớp 6': grade6,
  'Lớp 7': grade7,
  'Lớp 8': grade8,
  'Lớp 9': grade9,
}

export { learningSteps }
