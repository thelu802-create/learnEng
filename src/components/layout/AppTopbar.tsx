import {
  FontSizeOutlined,
  GithubOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  MenuOutlined,
  MoonOutlined,
  PlusOutlined,
  SettingOutlined,
  SunOutlined,
} from '@ant-design/icons'
import { App as AntdApp, Button, Divider, Drawer, Segmented, Tooltip, Typography } from 'antd'
import { useState } from 'react'
import { useI18n } from '../../i18n'
import type { FontSizeMode, MenuKey, ThemeMode } from '../../types'
import { useSupabaseAuth } from '../providers/SupabaseAuthProvider'

const { Paragraph, Text, Title } = Typography

interface AppTopbarProps {
  currentMenu: MenuKey
  onOpenMobileMenu: () => void
  themeMode: ThemeMode
  onThemeChange: (themeMode: ThemeMode) => void
  fontSizeMode: FontSizeMode
  onFontSizeChange: (fontSizeMode: FontSizeMode) => void
  pageActionLabel?: string | null
  onPageAction?: (() => void) | null
}

function AppTopbar({
  currentMenu,
  onOpenMobileMenu,
  themeMode,
  onThemeChange,
  fontSizeMode,
  onFontSizeChange,
  pageActionLabel,
  onPageAction,
}: AppTopbarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { message } = AntdApp.useApp()
  const { language, setLanguage, t, menuLabel } = useI18n()
  const { configured, loading, user, signInWithGithub, signOut } = useSupabaseAuth()

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub()
    } catch (error) {
      message.error(error instanceof Error ? error.message : t('topbar.githubSignInError'))
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      message.success(t('common.signedOut'))
    } catch (error) {
      message.error(error instanceof Error ? error.message : t('topbar.signOutError'))
    }
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-main-row">
          <div className="topbar-left">
            <Button
              type="default"
              icon={<MenuOutlined />}
              className="mobile-menu-trigger"
              onClick={onOpenMobileMenu}
              aria-label={t('common.openNavigationMenu')}
            />

            <div className="topbar-grade">
              <Text className="page-kicker">{t('common.appName')}</Text>
              <Title level={4} className="page-title">
                {menuLabel(currentMenu)}
              </Title>
            </div>
          </div>

          <div className="topbar-actions">
            <Tooltip title={t('topbar.settingsLabel')}>
              <Button
                type="default"
                icon={<SettingOutlined />}
                className={`settings-trigger settings-trigger-icon ${isSettingsOpen ? 'is-open' : ''}`}
                onClick={() => setIsSettingsOpen(true)}
                aria-label={t('topbar.settingsLabel')}
              />
            </Tooltip>
          </div>
        </div>

        {pageActionLabel && onPageAction ? (
          <div className="topbar-action-row">
            <Button type="primary" icon={<PlusOutlined />} className="topbar-page-action" onClick={onPageAction}>
              {pageActionLabel}
            </Button>
          </div>
        ) : null}
      </header>

      <Drawer
        title={t('topbar.settingsTitle')}
        placement="right"
        size={380}
        styles={{ body: { paddingBottom: 32 } }}
        onClose={() => setIsSettingsOpen(false)}
        open={isSettingsOpen}
        className="settings-drawer"
      >
        <div className="settings-stack">
          <div className="settings-section">
            <Text className="settings-eyebrow">{t('topbar.settingsTitle')}</Text>
            <Paragraph className="settings-copy">{t('topbar.settingsSubtitle')}</Paragraph>
          </div>

          <div className="settings-section">
            <div className="settings-heading">
              <GithubOutlined />
              <Title level={5}>{t('topbar.accountTitle')}</Title>
            </div>
            <Paragraph className="settings-copy">
              {configured ? t('topbar.accountCopy') : t('topbar.accountNotReady')}
            </Paragraph>
            {user ? (
              <div className="settings-account-card">
                <Text className="page-kicker">{t('topbar.connectedAs')}</Text>
                <Text strong>{user.email ?? user.user_metadata.user_name ?? user.id}</Text>
                <Button icon={<LogoutOutlined />} onClick={handleSignOut} disabled={loading}>
                  {t('topbar.signOut')}
                </Button>
              </div>
            ) : (
              <Button
                type="primary"
                icon={<GithubOutlined />}
                onClick={handleGithubSignIn}
                disabled={!configured || loading}
              >
                {t('topbar.signIn')}
              </Button>
            )}
          </div>

          <Divider />

          <div className="settings-section">
            <div className="settings-heading">
              <GlobalOutlined />
              <Title level={5}>{t('common.language')}</Title>
            </div>
            <Paragraph className="settings-copy">{t('topbar.languageCopy')}</Paragraph>
            <Segmented
              block
              options={[
                { label: 'VI', value: 'vi' },
                { label: 'EN', value: 'en' },
              ]}
              value={language}
              onChange={(value) => setLanguage(value as 'vi' | 'en')}
              className="settings-segmented"
            />
          </div>

          <Divider />

          <div className="settings-section">
            <div className="settings-heading">
              <FontSizeOutlined />
              <Title level={5}>{t('topbar.fontSizeTitle')}</Title>
            </div>
            <Paragraph className="settings-copy">{t('topbar.fontSizeCopy')}</Paragraph>
            <Segmented
              block
              options={[
                { label: 'A-', value: 'sm' },
                { label: 'A', value: 'md' },
                { label: 'A+', value: 'lg' },
              ]}
              value={fontSizeMode}
              onChange={(value) => onFontSizeChange(value as FontSizeMode)}
              className="settings-segmented font-size-segmented"
            />
            <div className="font-size-hints" aria-hidden="true">
              <span>{t('topbar.fontSizeSmall')}</span>
              <span>{t('topbar.fontSizeMedium')}</span>
              <span>{t('topbar.fontSizeLarge')}</span>
            </div>
          </div>

          <Divider />

          <div className="settings-section">
            <div className="settings-heading">
              <SettingOutlined />
              <Title level={5}>{t('topbar.themeTitle')}</Title>
            </div>
            <Paragraph className="settings-copy">{t('topbar.themeCopy')}</Paragraph>

            <div className="theme-toggle-grid" role="group" aria-label={t('topbar.themeTitle')}>
              <Tooltip title={t('topbar.lightMode')}>
                <button
                  type="button"
                  className={`theme-toggle-button ${themeMode === 'light' ? 'is-active is-light' : ''}`}
                  onClick={() => onThemeChange('light')}
                  aria-label={t('topbar.lightMode')}
                  aria-pressed={themeMode === 'light'}
                >
                  <SunOutlined />
                </button>
              </Tooltip>

              <Tooltip title={t('topbar.darkMode')}>
                <button
                  type="button"
                  className={`theme-toggle-button ${themeMode === 'dark' ? 'is-active is-dark' : ''}`}
                  onClick={() => onThemeChange('dark')}
                  aria-label={t('topbar.darkMode')}
                  aria-pressed={themeMode === 'dark'}
                >
                  <MoonOutlined />
                </button>
              </Tooltip>
            </div>
          </div>

          <Divider />

          <div className="settings-section">
            <div className="settings-heading">
              <InfoCircleOutlined />
              <Title level={5}>{t('topbar.aboutTitle')}</Title>
            </div>
            <Paragraph className="settings-copy">{t('topbar.aboutCopy')}</Paragraph>
            <Paragraph className="settings-copy settings-about-note">
              {t('topbar.aboutOwnerPrefix')}{' '}
              <span className="settings-about-owner-name">{t('common.appOwner')}</span>
            </Paragraph>
          </div>
        </div>
      </Drawer>
    </>
  )
}

export default AppTopbar
