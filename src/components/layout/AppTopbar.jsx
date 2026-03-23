import { Layout, Segmented, Typography } from 'antd'

const { Header } = Layout
const { Title, Text } = Typography

function AppTopbar({ selectedGrade, gradeOptions, onGradeChange }) {
  return (
    <Header className="topbar">
      <div className="topbar-left">
        <div>
          <Text className="page-kicker">Khối đang học</Text>
          <Title level={4} className="page-title">
            {selectedGrade}
          </Title>
        </div>
      </div>

      <div className="grade-picker">
        <Text className="grade-picker-label">Chọn khối</Text>
        <Segmented
          options={gradeOptions}
          value={selectedGrade}
          onChange={onGradeChange}
          className="grade-switcher"
        />
      </div>
    </Header>
  )
}

export default AppTopbar
