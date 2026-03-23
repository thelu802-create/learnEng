import {
  BookOutlined,
  PlayCircleOutlined,
  RiseOutlined,
  RocketOutlined,
} from '@ant-design/icons'
import { Layout, Menu, Typography } from 'antd'

const { Sider } = Layout
const { Text } = Typography

const iconMap = {
  book: <BookOutlined />,
  play: <PlayCircleOutlined />,
  rise: <RiseOutlined />,
  rocket: <RocketOutlined />,
}

function AppSidebar({ menuItems, selectedMenu, onMenuChange }) {
  const mappedMenuItems = menuItems.map((item) => ({
    ...item,
    icon: iconMap[item.icon],
  }))

  return (
    <Sider width={260} className="app-sider">
      <div className="brand-mark sidebar-brand">
        <div className="brand-badge">EP</div>
        <div className="sidebar-brand-copy">
          <Text className="brand-title">English Path 6-9</Text>
          <Text className="brand-subtitle">Nguyễn Ngọc Long Vân</Text>
        </div>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selectedMenu]}
        items={mappedMenuItems}
        onClick={({ key }) => onMenuChange(key)}
        className="side-menu"
      />
    </Sider>
  )
}

export default AppSidebar
