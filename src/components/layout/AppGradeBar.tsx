import { Segmented, Typography } from 'antd'
import { useI18n } from '../../i18n'
import type { GradeKey } from '../../types'

const { Text } = Typography

interface AppGradeBarProps {
  selectedGrade: GradeKey
  gradeOptions: GradeKey[]
  onGradeChange: (grade: GradeKey) => void
}

function AppGradeBar({ selectedGrade, gradeOptions, onGradeChange }: AppGradeBarProps) {
  const { t, gradeLabel } = useI18n()

  return (
    <div className="grade-context-bar">
      <div className="grade-context-copy">
        <Text className="page-kicker">{t('common.chooseGrade')}</Text>
        <Text className="grade-context-current">{gradeLabel(selectedGrade)}</Text>
      </div>

      <Segmented
        options={gradeOptions.map((grade) => ({
          label: gradeLabel(grade),
          value: grade,
        }))}
        value={selectedGrade}
        onChange={(value) => onGradeChange(value as GradeKey)}
        className="grade-switcher"
      />
    </div>
  )
}

export default AppGradeBar
