import { useEffect, useMemo, useState } from 'react'
import { DeleteOutlined, LockOutlined, PlusOutlined, SafetyCertificateOutlined, TeamOutlined } from '@ant-design/icons'
import { App as AntdApp, Button, Card, Empty, Form, Input, Modal, Popconfirm, Result, Select, Space, Spin, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useSupabaseAuth } from '../../components/providers/SupabaseAuthProvider'
import { useI18n } from '../../i18n'
import { createUserAccessRecord, deleteUserAccessRecord, listUserAccessRecords, updateUserAccessRecord } from '../../lib/supabase/userAccessApi'
import type { AppUserAccessRecord, AppUserRole, AppUserStatus } from '../../lib/supabase/types'

const { Title, Paragraph, Text } = Typography
interface AddUserValues { email: string; role: AppUserRole }

const copy = {
  vi: {
    eyebrow: 'Quyền truy cập', title: 'Quản lý người dùng',
    description: 'Chỉ email có trong danh sách này mới được phép tạo tài khoản bằng GitHub.',
    add: 'Thêm người dùng', addTitle: 'Cấp quyền cho email', email: 'Email GitHub', role: 'Vai trò',
    status: 'Trạng thái', admin: 'Quản trị viên', member: 'Thành viên', active: 'Đang hoạt động', disabled: 'Đã khóa',
    created: 'Ngày thêm', actions: 'Thao tác', save: 'Cấp quyền', cancel: 'Hủy', required: 'Vui lòng nhập email.',
    invalidEmail: 'Email không hợp lệ.', loadError: 'Không thể tải danh sách người dùng.', saveError: 'Không thể cập nhật quyền.',
    saved: 'Đã cập nhật quyền truy cập.', deleted: 'Đã xóa quyền truy cập.', deleteConfirm: 'Xóa email này khỏi danh sách được phép?',
    empty: 'Chưa có người dùng được cấp quyền.', forbidden: 'Bạn không có quyền quản trị người dùng.',
    total: 'Tổng người dùng', admins: 'Quản trị viên', activeUsers: 'Đang hoạt động', self: 'Bạn', selfProtected: 'Không thể tự khóa hoặc xóa tài khoản admin đang đăng nhập.',
  },
  en: {
    eyebrow: 'Access control', title: 'User management',
    description: 'Only emails in this list can create an account with GitHub.',
    add: 'Add user', addTitle: 'Authorize an email', email: 'GitHub email', role: 'Role',
    status: 'Status', admin: 'Administrator', member: 'Member', active: 'Active', disabled: 'Disabled',
    created: 'Added', actions: 'Actions', save: 'Authorize', cancel: 'Cancel', required: 'Enter an email.',
    invalidEmail: 'Enter a valid email.', loadError: 'Could not load users.', saveError: 'Could not update access.',
    saved: 'Access updated.', deleted: 'Access removed.', deleteConfirm: 'Remove this email from the allowlist?',
    empty: 'No authorized users yet.', forbidden: 'You do not have permission to manage users.',
    total: 'Total users', admins: 'Administrators', activeUsers: 'Active', self: 'You', selfProtected: 'You cannot disable or remove the signed-in admin account.',
  },
} as const

function UserManagementPage() {
  const { message } = AntdApp.useApp()
  const { language } = useI18n()
  const text = copy[language]
  const { user, isAdmin, accessLoading } = useSupabaseAuth()
  const [form] = Form.useForm<AddUserValues>()
  const [records, setRecords] = useState<AppUserAccessRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const ownEmail = user?.email?.trim().toLowerCase() ?? ''

  useEffect(() => {
    if (!isAdmin) { setRecords([]); return }
    let active = true
    setLoading(true)
    listUserAccessRecords()
      .then((items) => active && setRecords(items))
      .catch(() => active && message.error(text.loadError))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [isAdmin, message, text.loadError])

  const stats = useMemo(() => ({
    total: records.length,
    admins: records.filter((record) => record.role === 'admin').length,
    active: records.filter((record) => record.status === 'active').length,
  }), [records])

  if (accessLoading) return <div className="page-loading-shell"><Spin size="large" /></div>
  if (!isAdmin) return <Result status="403" title="403" subTitle={text.forbidden} icon={<LockOutlined />} />

  const addUser = async (values: AddUserValues) => {
    if (!user) return
    setSaving(true)
    try {
      const created = await createUserAccessRecord(values.email, values.role, user.id)
      setRecords((current) => [...current, created].sort((left, right) => left.email.localeCompare(right.email)))
      setModalOpen(false)
      form.resetFields()
      message.success(text.saved)
    } catch { message.error(text.saveError) } finally { setSaving(false) }
  }

  const updateUser = async (record: AppUserAccessRecord, role: AppUserRole, status: AppUserStatus) => {
    if (record.email.toLowerCase() === ownEmail && (role !== 'admin' || status !== 'active')) {
      message.warning(text.selfProtected)
      return
    }
    setSaving(true)
    try {
      const updated = await updateUserAccessRecord(record.id, role, status)
      setRecords((current) => current.map((item) => item.id === updated.id ? updated : item))
      message.success(text.saved)
    } catch { message.error(text.saveError) } finally { setSaving(false) }
  }

  const removeUser = async (record: AppUserAccessRecord) => {
    if (record.email.toLowerCase() === ownEmail) { message.warning(text.selfProtected); return }
    setSaving(true)
    try {
      await deleteUserAccessRecord(record.id)
      setRecords((current) => current.filter((item) => item.id !== record.id))
      message.success(text.deleted)
    } catch { message.error(text.saveError) } finally { setSaving(false) }
  }

  const columns: ColumnsType<AppUserAccessRecord> = [
    { title: text.email, dataIndex: 'email', render: (value: string) => <Space><div className="user-access-avatar">{value.slice(0, 1).toUpperCase()}</div><div className="user-access-email"><Text strong>{value}</Text>{value.toLowerCase() === ownEmail && <Tag color="cyan">{text.self}</Tag>}</div></Space> },
    { title: text.role, dataIndex: 'role', width: 190, render: (role: AppUserRole, record) => <Select value={role} disabled={record.email.toLowerCase() === ownEmail || saving} onChange={(value) => updateUser(record, value, record.status)} options={[{ value: 'member', label: text.member }, { value: 'admin', label: text.admin }]} /> },
    { title: text.status, dataIndex: 'status', width: 180, render: (status: AppUserStatus, record) => <Select value={status} disabled={record.email.toLowerCase() === ownEmail || saving} onChange={(value) => updateUser(record, record.role, value)} options={[{ value: 'active', label: text.active }, { value: 'disabled', label: text.disabled }]} /> },
    { title: text.created, dataIndex: 'created_at', width: 150, render: (value: string) => new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US').format(new Date(value)) },
    { title: text.actions, key: 'actions', width: 90, align: 'center', render: (_, record) => <Popconfirm title={text.deleteConfirm} onConfirm={() => removeUser(record)} disabled={record.email.toLowerCase() === ownEmail}><Button type="text" danger icon={<DeleteOutlined />} disabled={record.email.toLowerCase() === ownEmail || saving} /></Popconfirm> },
  ]

  return <Space orientation="vertical" size={18} className="full-width user-access-page">
    <Card className="content-card user-access-hero" variant="borderless"><div className="user-access-hero-layout"><div><Text className="eyebrow">{text.eyebrow}</Text><Title level={2}>{text.title}</Title><Paragraph className="settings-copy">{text.description}</Paragraph></div><Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>{text.add}</Button></div></Card>
    <div className="user-access-stats"><Card variant="borderless"><TeamOutlined /><div><strong>{stats.total}</strong><Text>{text.total}</Text></div></Card><Card variant="borderless"><SafetyCertificateOutlined /><div><strong>{stats.admins}</strong><Text>{text.admins}</Text></div></Card><Card variant="borderless"><span className="user-access-active-dot" /><div><strong>{stats.active}</strong><Text>{text.activeUsers}</Text></div></Card></div>
    <Card className="content-card" variant="borderless"><Table rowKey="id" columns={columns} dataSource={records} loading={loading} pagination={false} scroll={{ x: 850 }} locale={{ emptyText: <Empty description={text.empty} /> }} /></Card>
    <Modal title={text.addTitle} open={modalOpen} onCancel={() => setModalOpen(false)} okText={text.save} cancelText={text.cancel} onOk={() => form.submit()} confirmLoading={saving}><Form form={form} layout="vertical" initialValues={{ role: 'member' }} onFinish={addUser}><Form.Item name="email" label={text.email} rules={[{ required: true, message: text.required }, { type: 'email', message: text.invalidEmail }]}><Input autoFocus placeholder="teacher@example.com" /></Form.Item><Form.Item name="role" label={text.role}><Select options={[{ value: 'member', label: text.member }, { value: 'admin', label: text.admin }]} /></Form.Item></Form></Modal>
  </Space>
}

export default UserManagementPage
