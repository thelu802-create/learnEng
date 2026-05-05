import { useEffect, useMemo, useState } from 'react'
import {
  BookOutlined,
  CalendarOutlined,
  CheckOutlined,
  DeleteOutlined,
  FieldTimeOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import {
  App as AntdApp,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useSupabaseAuth } from '../../components/providers/SupabaseAuthProvider'
import { useI18n } from '../../i18n'
import {
  createMakeupScheduleRecord,
  deleteMakeupScheduleRecord,
  listMakeupSchedules,
  updateMakeupScheduleStatus,
} from '../../lib/supabase/makeupSchedulesApi'
import type { MakeupScheduleRecord, MakeupScheduleStatus } from '../../lib/supabase/types'

const { Title, Paragraph, Text } = Typography

type MakeupFilter = MakeupScheduleStatus | 'all'

interface MakeupFormValues {
  className: string
  lessonPeriod?: string
  missedDate: string
  makeupDate: string
  makeupTime?: string
  note?: string
}

function getTodayInputValue(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getItemDateTime(item: MakeupScheduleRecord): number {
  return new Date(`${item.makeup_date}T${item.makeup_time || '23:59'}`).getTime()
}

function formatDate(dateValue: string, language: 'vi' | 'en'): string {
  if (!dateValue) {
    return ''
  }

  return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${dateValue}T00:00:00`))
}

function getStatusColor(status: MakeupScheduleStatus): string {
  if (status === 'completed') return 'green'
  if (status === 'cancelled') return 'red'
  return 'blue'
}

function MakeupSchedulePage() {
  const { message } = AntdApp.useApp()
  const { language, t } = useI18n()
  const { configured, signInWithGithub, user } = useSupabaseAuth()
  const [form] = Form.useForm<MakeupFormValues>()
  const [items, setItems] = useState<MakeupScheduleRecord[]>([])
  const [filter, setFilter] = useState<MakeupFilter>('all')
  const [loadingItems, setLoadingItems] = useState(false)
  const [savingItem, setSavingItem] = useState(false)
  const [busyItemId, setBusyItemId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!configured || !user) {
      setItems([])
      return
    }

    let active = true
    setLoadingItems(true)

    listMakeupSchedules(user.id)
      .then((records) => {
        if (active) {
          setItems(records)
        }
      })
      .catch(() => {
        if (active) {
          message.error(t('makeupSchedule.loadError'))
        }
      })
      .finally(() => {
        if (active) {
          setLoadingItems(false)
        }
      })

    return () => {
      active = false
    }
  }, [configured, message, t, user])

  const sortedItems = useMemo(
    () =>
      [...items].sort((left, right) => {
        if (left.status !== right.status) {
          if (left.status === 'planned') return -1
          if (right.status === 'planned') return 1
        }

        return getItemDateTime(left) - getItemDateTime(right)
      }),
    [items],
  )

  const visibleItems = useMemo(
    () => sortedItems.filter((item) => filter === 'all' || item.status === filter),
    [filter, sortedItems],
  )

  const stats = useMemo(() => {
    const planned = items.filter((item) => item.status === 'planned').length
    const completed = items.filter((item) => item.status === 'completed').length

    return { planned, completed, total: items.length }
  }, [items])

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: t('makeupSchedule.filterAll') },
      { value: 'planned', label: t('makeupSchedule.statusPlanned') },
      { value: 'completed', label: t('makeupSchedule.statusCompleted') },
      { value: 'cancelled', label: t('makeupSchedule.statusCancelled') },
    ],
    [t],
  )

  const addItem = async (values: MakeupFormValues) => {
    if (!configured || !user) {
      message.warning(t('makeupSchedule.needLogin'))
      return
    }

    setSavingItem(true)
    try {
      const createdItem = await createMakeupScheduleRecord({
        userId: user.id,
        className: values.className.trim(),
        lessonPeriod: values.lessonPeriod?.trim() ?? '',
        missedDate: values.missedDate,
        makeupDate: values.makeupDate,
        makeupTime: values.makeupTime ?? '',
        note: values.note?.trim() ?? '',
        status: 'planned',
      })

      setItems((currentItems) => [createdItem, ...currentItems])
      form.resetFields()
      form.setFieldValue('makeupDate', getTodayInputValue())
      setDrawerOpen(false)
    } catch {
      message.error(t('makeupSchedule.saveError'))
    } finally {
      setSavingItem(false)
    }
  }

  const handleSignIn = async () => {
    try {
      await signInWithGithub()
    } catch {
      message.error(t('makeupSchedule.signInError'))
    }
  }

  const updateStatus = async (itemId: string, status: MakeupScheduleStatus) => {
    if (!user) {
      return
    }

    setBusyItemId(itemId)
    try {
      const updatedItem = await updateMakeupScheduleStatus(itemId, user.id, status)
      setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? updatedItem : item)))
    } catch {
      message.error(t('makeupSchedule.updateError'))
    } finally {
      setBusyItemId(null)
    }
  }

  const deleteItem = async (itemId: string) => {
    if (!user) {
      return
    }

    setBusyItemId(itemId)
    try {
      await deleteMakeupScheduleRecord(itemId, user.id)
      setItems((currentItems) => currentItems.filter((item) => item.id !== itemId))
    } catch {
      message.error(t('makeupSchedule.deleteError'))
    } finally {
      setBusyItemId(null)
    }
  }

  const columns: ColumnsType<MakeupScheduleRecord> = [
    {
      title: t('makeupSchedule.classColumn'),
      dataIndex: 'class_name',
      key: 'class_name',
      width: 220,
      render: (value: string) => (
        <Space orientation="vertical" size={4} className="makeup-class-cell">
          <Text strong className="makeup-class-title">
            {value}
          </Text>
        </Space>
      ),
    },
    {
      title: t('makeupSchedule.periodLabel'),
      dataIndex: 'lesson_period',
      key: 'lesson_period',
      width: 130,
      render: (value: string) =>
        value ? (
          <Tag icon={<BookOutlined />} color="gold" className="makeup-period-tag">
            {value}
          </Tag>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: t('makeupSchedule.missedDateLabel'),
      dataIndex: 'missed_date',
      key: 'missed_date',
      width: 170,
      render: (value: string) => (
        <Tag icon={<CalendarOutlined />} className="makeup-date-tag">
          {formatDate(value, language)}
        </Tag>
      ),
    },
    {
      title: t('makeupSchedule.makeupDateLabel'),
      dataIndex: 'makeup_date',
      key: 'makeup_date',
      width: 190,
      render: (_value: string, item) => (
        <Tag icon={<FieldTimeOutlined />} color="cyan" className="makeup-date-tag">
          {formatDate(item.makeup_date, language)}
          {item.makeup_time ? ` ${item.makeup_time}` : ''}
        </Tag>
      ),
    },
    {
      title: t('makeupSchedule.noteLabel'),
      dataIndex: 'note',
      key: 'note',
      render: (value: string) =>
        value ? <Text className="makeup-note-cell">{value}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: t('makeupSchedule.statusColumn'),
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: MakeupScheduleStatus) => (
        <Tag color={getStatusColor(status)}>{t(`makeupSchedule.${status}`)}</Tag>
      ),
    },
    {
      title: t('makeupSchedule.actionsColumn'),
      key: 'actions',
      width: 230,
      align: 'right',
      render: (_value, item) => (
        <Space size={8} className="makeup-table-actions">
          {item.status !== 'completed' ? (
            <Button
              icon={<CheckOutlined />}
              loading={busyItemId === item.id}
              onClick={() => updateStatus(item.id, 'completed')}
            >
              {t('makeupSchedule.completeAction')}
            </Button>
          ) : null}
          {item.status !== 'cancelled' ? (
            <Button loading={busyItemId === item.id} onClick={() => updateStatus(item.id, 'cancelled')}>
              {t('makeupSchedule.cancelAction')}
            </Button>
          ) : null}
          <Popconfirm
            title={t('makeupSchedule.deleteConfirm')}
            okText={t('makeupSchedule.deleteOk')}
            cancelText={t('makeupSchedule.deleteCancel')}
            onConfirm={() => deleteItem(item.id)}
          >
            <Button danger icon={<DeleteOutlined />} loading={busyItemId === item.id} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const canManageSchedules = configured && !!user

  const openDrawer = () => {
    form.setFieldsValue({ makeupDate: getTodayInputValue() })
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
  }

  return (
    <Space orientation="vertical" size={18} className="full-width">
      <Card className="content-card makeup-hero-card" variant="borderless">
        <Row gutter={[18, 18]} align="middle">
          <Col xs={24} lg={14}>
            <Space orientation="vertical" size={10} className="full-width">
              <Text className="eyebrow">{t('makeupSchedule.eyebrow')}</Text>
              <Title level={2}>{t('makeupSchedule.title')}</Title>
              <Paragraph className="settings-copy">{t('makeupSchedule.copy')}</Paragraph>
              {!configured ? (
                <Tag color="red">{t('makeupSchedule.accountNotReady')}</Tag>
              ) : !user ? (
                <Button type="primary" onClick={handleSignIn}>
                  {t('makeupSchedule.signInAction')}
                </Button>
              ) : (
                <Button type="primary" icon={<PlusOutlined />} onClick={openDrawer}>
                  {t('makeupSchedule.addAction')}
                </Button>
              )}
            </Space>
          </Col>
          <Col xs={24} lg={10}>
            <div className="makeup-stat-grid">
              <div className="makeup-stat-card">
                <Text>{t('makeupSchedule.statPlanned')}</Text>
                <strong>{stats.planned}</strong>
              </div>
              <div className="makeup-stat-card">
                <Text>{t('makeupSchedule.statCompleted')}</Text>
                <strong>{stats.completed}</strong>
              </div>
              <div className="makeup-stat-card">
                <Text>{t('makeupSchedule.statTotal')}</Text>
                <strong>{stats.total}</strong>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[18, 18]}>
        <Col span={24}>
          <Card className="content-card makeup-list-card" variant="borderless">
            <Space orientation="vertical" size={16} className="full-width">
              <div className="makeup-list-head">
                <div className="settings-heading">
                  <CalendarOutlined />
                  <Title level={4}>{t('makeupSchedule.listTitle')}</Title>
                </div>
                <div className="makeup-toolbar">
                  <Select value={filter} options={statusOptions} onChange={setFilter} className="makeup-filter" />
                </div>
              </div>

              <Table
                rowKey="id"
                columns={columns}
                dataSource={visibleItems}
                loading={loadingItems}
                pagination={false}
                scroll={{ x: 1080 }}
                className="makeup-table"
                locale={{ emptyText: <Empty description={t('makeupSchedule.empty')} /> }}
              />
            </Space>
          </Card>
        </Col>
      </Row>

      <Drawer
        title={t('makeupSchedule.formTitle')}
        open={drawerOpen}
        onClose={closeDrawer}
        size="large"
        className="makeup-drawer"
        destroyOnHidden
        footer={
          <Space className="makeup-drawer-footer">
            <Button onClick={closeDrawer}>{t('makeupSchedule.closeDrawer')}</Button>
            <Button type="primary" icon={<PlusOutlined />} loading={savingItem} onClick={() => form.submit()}>
              {t('makeupSchedule.addAction')}
            </Button>
          </Space>
        }
      >
        <Paragraph className="settings-copy makeup-drawer-copy">{t('makeupSchedule.formCopy')}</Paragraph>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ makeupDate: getTodayInputValue() }}
          onFinish={addItem}
          disabled={!canManageSchedules || savingItem}
        >
          <Row gutter={12}>
            <Col xs={24} sm={15}>
              <Form.Item
                name="className"
                label={t('makeupSchedule.classLabel')}
                rules={[{ required: true, message: t('makeupSchedule.required') }]}
              >
                <Input placeholder={t('makeupSchedule.classPlaceholder')} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={9}>
              <Form.Item name="lessonPeriod" label={t('makeupSchedule.periodLabel')}>
                <Input prefix={<BookOutlined />} placeholder={t('makeupSchedule.periodPlaceholder')} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="missedDate"
            label={t('makeupSchedule.missedDateLabel')}
            rules={[{ required: true, message: t('makeupSchedule.required') }]}
          >
            <Input type="date" />
          </Form.Item>
          <Row gutter={12}>
            <Col xs={24} sm={14}>
              <Form.Item
                name="makeupDate"
                label={t('makeupSchedule.makeupDateLabel')}
                rules={[{ required: true, message: t('makeupSchedule.required') }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={10}>
              <Form.Item name="makeupTime" label={t('makeupSchedule.timeLabel')}>
                <Input type="time" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="note" label={t('makeupSchedule.noteLabel')}>
            <Input.TextArea rows={5} placeholder={t('makeupSchedule.notePlaceholder')} />
          </Form.Item>
        </Form>
      </Drawer>
    </Space>
  )
}

export default MakeupSchedulePage
