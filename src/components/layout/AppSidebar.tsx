import {
  BookOutlined,
  BulbOutlined,
  CalendarOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  RiseOutlined,
  RocketOutlined,
} from '@ant-design/icons'
import { Drawer, Layout, Menu, Typography } from 'antd'
import type { MenuProps } from 'antd'
import type { ReactNode } from 'react'
import { useI18n } from '../../i18n'
import type { MenuIconKey, MenuItemConfig, MenuKey } from '../../types'

const { Sider } = Layout
const { Text } = Typography

const iconMap: Record<MenuIconKey, ReactNode> = {
  book: <BookOutlined />,
  bulb: <BulbOutlined />,
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

function SidebarBrand() {
  const { t } = useI18n()

  return (
    <div className="brand-mark sidebar-brand">
      <div className="brand-badge">EP</div>
      <div className="sidebar-brand-copy">
        <Text className="brand-title">{t('common.appName')}</Text>
        <Text className="brand-subtitle">{t('common.brandSubtitle')}</Text>
      </div>
    </div>
  )
}

function AppSidebar({
  menuItems,
  selectedMenu,
  onMenuChange,
  isMobileOpen,
  onMobileClose,
}: AppSidebarProps) {
  const { menuLabel } = useI18n()

  const mappedMenuItems: MenuProps['items'] = menuItems.map((item) => ({
    ...item,
    label: menuLabel(item.key),
    icon: iconMap[item.icon],
  }))

  return (
    <>
      <Sider width={260} className="app-sider">
        <SidebarBrand />

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
        size={280}
        open={isMobileOpen}
        onClose={onMobileClose}
        className="mobile-nav-drawer"
        rootClassName="mobile-nav-root"
        title={<SidebarBrand />}
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
