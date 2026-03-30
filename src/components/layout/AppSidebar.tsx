import {
  BookOutlined,
  CalendarOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  RiseOutlined,
  RocketOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'
import { Drawer, Layout, Menu, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { useI18n } from '../../i18n'
import type { MenuIconKey, MenuItemConfig, MenuKey } from '../../types'

const { Sider } = Layout
const { Text } = Typography

const iconMap: Record<MenuIconKey, ReactNode> = {
  book: <BookOutlined />,
  calendar: <CalendarOutlined />,
  play: <PlayCircleOutlined />,
  rise: <RiseOutlined />,
  rocket: <RocketOutlined />,
  help: <QuestionCircleOutlined />,
}

interface AppSidebarProps {
  menuItems: MenuItemConfig[]
  selectedMenu: MenuKey
  onMenuChange: (menuKey: MenuKey) => void
  isMobileOpen: boolean
  onMobileClose: () => void
}

function AppSidebar({
  menuItems,
  selectedMenu,
  onMenuChange,
  isMobileOpen,
  onMobileClose,
}: AppSidebarProps) {
  const { language, menuLabel } = useI18n()

  const mappedMenuItems: MenuProps['items'] = menuItems.map((item) => ({
    ...item,
    label: item.key === 'help' ? (language === 'en' ? 'Help' : 'Hướng dẫn') : menuLabel(item.key),
    icon: iconMap[item.icon],
  }))

  return (
    <>
      <Sider width={260} className="app-sider">
        <div className="brand-mark sidebar-brand">
        <div className="brand-badge">EP</div>
        <div className="sidebar-brand-copy">
          <Text className="brand-title">English Path</Text>
          <Text className="brand-subtitle">
            {language === 'en' ? 'Nguyen Ngoc Long Van' : 'Nguyễn Ngọc Long Vân'}
          </Text>
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

      <Drawer
        placement="left"
        width={280}
        open={isMobileOpen}
        onClose={onMobileClose}
        className="mobile-nav-drawer"
        rootClassName="mobile-nav-root"
        title={
          <div className="brand-mark">
            <div className="brand-badge">EP</div>
            <div className="sidebar-brand-copy">
              <Text className="brand-title">English Path</Text>
              <Text className="brand-subtitle">
                {language === 'en' ? 'Nguyen Ngoc Long Van' : 'Nguyễn Ngọc Long Vân'}
              </Text>
            </div>
          </div>
        }
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedMenu]}
          items={mappedMenuItems}
          onClick={({ key }) => onMenuChange(key as MenuKey)}
          className="side-menu mobile-side-menu"
        />
      </Drawer>
    </>
  )
}

export default AppSidebar
