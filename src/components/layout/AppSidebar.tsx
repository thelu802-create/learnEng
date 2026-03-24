import {
  BookOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  RiseOutlined,
  RocketOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'
import { Layout, Menu, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { useI18n } from '../../i18n'
import type { MenuIconKey, MenuItemConfig, MenuKey } from '../../types'

const { Sider } = Layout
const { Text } = Typography

const iconMap: Record<MenuIconKey, ReactNode> = {
  book: <BookOutlined />,
  play: <PlayCircleOutlined />,
  rise: <RiseOutlined />,
  rocket: <RocketOutlined />,
  help: <QuestionCircleOutlined />,
}

interface AppSidebarProps {
  menuItems: MenuItemConfig[]
  selectedMenu: MenuKey
  onMenuChange: (menuKey: MenuKey) => void
}

function AppSidebar({ menuItems, selectedMenu, onMenuChange }: AppSidebarProps) {
  const { language, t, menuLabel } = useI18n()

  const mappedMenuItems: MenuProps['items'] = menuItems.map((item) => ({
    ...item,
    label: item.key === 'help' ? (language === 'en' ? 'Help' : 'Hướng dẫn') : menuLabel(item.key),
    icon: iconMap[item.icon],
  }))

  return (
    <Sider width={260} className="app-sider">
      <div className="brand-mark sidebar-brand">
        <div className="brand-badge">EP</div>
        <div className="sidebar-brand-copy">
          <Text className="brand-title">English Path</Text>
          <Text className="brand-subtitle">{t('common.appOwner')}</Text>
        </div>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selectedMenu]}
        items={mappedMenuItems}
        onClick={({ key }) => onMenuChange(key as MenuKey)}
        className="side-menu"
      />
    </Sider>
  )
}

export default AppSidebar
