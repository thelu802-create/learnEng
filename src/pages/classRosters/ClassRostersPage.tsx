import { useEffect, useMemo, useState } from 'react'
import type { Key } from 'react'
import { CloudUploadOutlined, DeleteOutlined, EditOutlined, FileExcelOutlined, PlusOutlined, SearchOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons'
import { Alert, App as AntdApp, Button, Card, Checkbox, Col, Drawer, Empty, Form, Input, Modal, Popconfirm, Row, Select, Space, Table, Tag, Tooltip, Typography, Upload } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { UploadFile } from 'antd/es/upload/interface'
import { useSupabaseAuth } from '../../components/providers/SupabaseAuthProvider'
import { useI18n } from '../../i18n'
import { createClassRoster, createClassStudent, deleteClassRoster, deleteClassStudents, deleteClassStudentsByClass, listClassRosters, listClassStudents, updateClassStudent, updateStudentZaloStatus } from '../../lib/supabase/classRostersApi'
import type { ClassStudentInput } from '../../lib/supabase/classRostersApi'
import type { ClassRosterRecord, ClassStudentRecord } from '../../lib/supabase/types'
import { parseRosterWorkbook } from './importWorkbook'
import type { ParsedRosterWorkbook } from './types'

const { Dragger } = Upload
const { Title, Paragraph, Text } = Typography
interface ImportFormValues { name: string; schoolYear: string }
interface StudentFormValues {
  className: string; studentNumber?: string; fullName: string; gender?: string; dateOfBirth?: string
  phoneNumber?: string; isIc3?: boolean; isTabn?: boolean; hasAirConditioner?: boolean
  isInclusive?: boolean; hasZalo?: boolean; note?: string
}

const copy = {
  vi: {
    eyebrow: 'Dữ liệu giáo viên', title: 'Danh sách lớp', description: 'Một nơi gọn gàng để nhập Excel, cập nhật thông tin và theo dõi học sinh theo từng lớp.',
    import: 'Import Excel', addStudent: 'Thêm học sinh', editStudent: 'Sửa học sinh', signIn: 'Đăng nhập để quản lý', notConfigured: 'Chưa cấu hình Supabase.',
    saved: 'Bản danh sách', selectRoster: 'Chọn bản danh sách', emptyRosters: 'Chưa có bản danh sách nào.', search: 'Tìm tên hoặc số điện thoại', allClasses: 'Tất cả lớp',
    students: 'học sinh', classes: 'lớp', zaloDone: 'đã có Zalo', deleteRoster: 'Xóa bản', deleteRosterConfirm: 'Xóa toàn bộ bản danh sách và học sinh bên trong?',
    deleteClass: 'Xóa lớp', deleteClassConfirm: 'Xóa toàn bộ học sinh của lớp {className}?', deleteSelected: 'Xóa đã chọn', deleteSelectedConfirm: 'Xóa {count} học sinh đã chọn?', selected: 'đã chọn', clearSelection: 'Bỏ chọn',
    uploadTitle: 'Chọn file Excel danh sách lớp', uploadHint: 'Hỗ trợ .xlsx và .xls. Hệ thống đọc sheet danh sách đầu tiên và tự bỏ tiêu đề lặp lại.', rosterName: 'Tên bản lưu', schoolYear: 'Năm học', required: 'Vui lòng nhập thông tin này.',
    sheet: 'Sheet được import', selectClass: 'Chọn lớp cần lưu', chooseClass: 'Vui lòng chọn một lớp', multipleClasses: 'File Excel có nhiều lớp', multipleClassesHint: 'Hệ thống phát hiện nhiều lớp trong file. Vui lòng chọn đúng lớp cần lưu.',
    save: 'Lưu', saveRoster: 'Lưu danh sách', cancel: 'Hủy', preview: 'Xem trước', noStudents: 'Không có học sinh phù hợp.', loadError: 'Không thể tải danh sách lớp.', parseError: 'Không đọc được file Excel.',
    saveError: 'Không thể lưu dữ liệu.', updateError: 'Không thể cập nhật dữ liệu.', savedOk: 'Đã lưu danh sách lớp.', studentSaved: 'Đã lưu học sinh.', deletedOk: 'Đã xóa dữ liệu.',
    name: 'Họ tên', class: 'Lớp', number: 'STT', gender: 'Giới tính', dob: 'Ngày sinh', phone: 'Số điện thoại', zalo: 'Đã tạo Zalo', programs: 'Thông tin', note: 'Ghi chú', warning: 'cảnh báo',
    actions: 'Thao tác', male: 'Nam', female: 'Nữ', other: 'Khác', ic3: 'IC3', tabn: 'TABN', airConditioner: 'Máy lạnh', inclusive: 'Hòa nhập', formHint: 'Các trường có dấu * là bắt buộc.',
  },
  en: {
    eyebrow: 'Teacher data', title: 'Class rosters', description: 'A clean workspace to import Excel files, update details, and manage students by class.',
    import: 'Import Excel', addStudent: 'Add student', editStudent: 'Edit student', signIn: 'Sign in to manage', notConfigured: 'Supabase is not configured.',
    saved: 'Saved roster', selectRoster: 'Select a roster', emptyRosters: 'No saved rosters yet.', search: 'Search name or phone', allClasses: 'All classes',
    students: 'students', classes: 'classes', zaloDone: 'with Zalo', deleteRoster: 'Delete roster', deleteRosterConfirm: 'Delete this roster and all of its students?',
    deleteClass: 'Delete class', deleteClassConfirm: 'Delete every student in class {className}?', deleteSelected: 'Delete selected', deleteSelectedConfirm: 'Delete {count} selected students?', selected: 'selected', clearSelection: 'Clear',
    uploadTitle: 'Choose a class roster Excel file', uploadHint: 'Supports .xlsx and .xls. The first valid roster sheet is read and repeated headers are skipped.', rosterName: 'Snapshot name', schoolYear: 'School year', required: 'This field is required.',
    sheet: 'Imported sheet', selectClass: 'Select class to save', chooseClass: 'Please select a class', multipleClasses: 'The Excel file contains multiple classes', multipleClassesHint: 'Multiple classes were detected. Select the class you want to save.',
    save: 'Save', saveRoster: 'Save roster', cancel: 'Cancel', preview: 'Preview', noStudents: 'No matching students.', loadError: 'Could not load class rosters.', parseError: 'Could not read the Excel file.',
    saveError: 'Could not save data.', updateError: 'Could not update data.', savedOk: 'Class roster saved.', studentSaved: 'Student saved.', deletedOk: 'Data deleted.',
    name: 'Full name', class: 'Class', number: 'No.', gender: 'Gender', dob: 'Date of birth', phone: 'Phone', zalo: 'Zalo created', programs: 'Details', note: 'Note', warning: 'warnings',
    actions: 'Actions', male: 'Male', female: 'Female', other: 'Other', ic3: 'IC3', tabn: 'TABN', airConditioner: 'Air conditioner', inclusive: 'Inclusive', formHint: 'Fields marked * are required.',
  },
} as const

function replaceParams(value: string, params: Record<string, string | number>) {
  return Object.entries(params).reduce((result, [key, replacement]) => result.replace(`{${key}}`, String(replacement)), value)
}

function ClassRostersPage() {
  const { message } = AntdApp.useApp()
  const { language } = useI18n()
  const text = copy[language]
  const { configured, user, signInWithGithub } = useSupabaseAuth()
  const [importForm] = Form.useForm<ImportFormValues>()
  const [studentForm] = Form.useForm<StudentFormValues>()
  const [rosters, setRosters] = useState<ClassRosterRecord[]>([])
  const [selectedRosterId, setSelectedRosterId] = useState<string>()
  const [students, setStudents] = useState<ClassStudentRecord[]>([])
  const [classFilter, setClassFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [busyStudentId, setBusyStudentId] = useState<string>()
  const [importOpen, setImportOpen] = useState(false)
  const [studentDrawerOpen, setStudentDrawerOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<ClassStudentRecord>()
  const [workbook, setWorkbook] = useState<ParsedRosterWorkbook>()
  const [selectedImportClass, setSelectedImportClass] = useState<string>()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [parsing, setParsing] = useState(false)

  useEffect(() => {
    if (!configured || !user) { setRosters([]); setSelectedRosterId(undefined); setStudents([]); return }
    let active = true
    setLoading(true)
    listClassRosters(user.id).then((items) => {
      if (!active) return
      setRosters(items)
      setSelectedRosterId((current) => current && items.some((item) => item.id === current) ? current : items[0]?.id)
    }).catch(() => active && message.error(text.loadError)).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [configured, message, text.loadError, user])

  useEffect(() => {
    setSelectedRowKeys([])
    if (!user || !selectedRosterId) { setStudents([]); return }
    let active = true
    setLoading(true)
    listClassStudents(selectedRosterId, user.id).then((items) => active && setStudents(items)).catch(() => active && message.error(text.loadError)).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [message, selectedRosterId, text.loadError, user])

  const selectedRoster = rosters.find((item) => item.id === selectedRosterId)
  const classNames = useMemo(() => [...new Set(students.map((student) => student.class_name))].sort(new Intl.Collator('vi').compare), [students])
  const visibleStudents = useMemo(() => {
    const term = search.trim().toLocaleLowerCase(language === 'vi' ? 'vi' : 'en')
    return students.filter((student) => (classFilter === 'all' || student.class_name === classFilter) && (!term || `${student.full_name} ${student.phone_number}`.toLocaleLowerCase().includes(term)))
  }, [classFilter, language, search, students])
  const importClassNames = useMemo(() => workbook ? [...new Set(workbook.sheet.students.map((student) => student.className))].sort(new Intl.Collator('vi').compare) : [], [workbook])
  const importStudents = useMemo(() => selectedImportClass && workbook ? workbook.sheet.students.filter((student) => student.className === selectedImportClass) : [], [selectedImportClass, workbook])
  const zaloCount = students.filter((student) => student.has_zalo).length

  const updateLocalRosterCount = (studentCount: number) => {
    if (!selectedRosterId) return
    setRosters((current) => current.map((item) => item.id === selectedRosterId ? { ...item, student_count: studentCount } : item))
  }
  const resetImport = () => { setWorkbook(undefined); setSelectedImportClass(undefined); setFileList([]); importForm.resetFields() }
  const readFile = async (file: File) => {
    setParsing(true)
    try {
      const parsed = await parseRosterWorkbook(file)
      setWorkbook(parsed)
      const classes = [...new Set(parsed.sheet.students.map((student) => student.className))].sort(new Intl.Collator('vi').compare)
      setSelectedImportClass(classes.length === 1 ? classes[0] : undefined)
      if (classes.length > 1) message.info(`${text.multipleClasses}: ${classes.length}. ${text.chooseClass}.`)
      setFileList([{ uid: file.name, name: file.name, status: 'done', originFileObj: file } as UploadFile])
      importForm.setFieldsValue({ name: file.name.replace(/\.(xlsx|xls)$/i, ''), schoolYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}` })
    } catch { message.error(text.parseError) } finally { setParsing(false) }
    return false
  }
  const saveImport = async () => {
    if (!user || !workbook || !importStudents.length) return
    const values = await importForm.validateFields()
    setSaving(true)
    try {
      const roster = await createClassRoster({ name: values.name.trim(), schoolYear: values.schoolYear.trim(), sourceFileName: workbook.fileName, students: importStudents })
      setRosters((current) => [roster, ...current]); setSelectedRosterId(roster.id); setStudents([]); setImportOpen(false); resetImport(); message.success(text.savedOk)
    } catch { message.error(text.saveError) } finally { setSaving(false) }
  }

  const openCreateStudent = () => {
    if (!selectedRosterId) return
    setEditingStudent(undefined)
    studentForm.resetFields()
    studentForm.setFieldsValue({ className: classFilter !== 'all' ? classFilter : classNames[0] ?? '', studentNumber: String(students.length + 1) })
    setStudentDrawerOpen(true)
  }
  const openEditStudent = (student: ClassStudentRecord) => {
    setEditingStudent(student)
    studentForm.setFieldsValue({ className: student.class_name, studentNumber: student.student_number, fullName: student.full_name, gender: student.gender, dateOfBirth: student.date_of_birth, phoneNumber: student.phone_number, isIc3: student.is_ic3, isTabn: student.is_tabn, hasAirConditioner: student.has_air_conditioner, isInclusive: student.is_inclusive, hasZalo: student.has_zalo, note: student.note })
    setStudentDrawerOpen(true)
  }
  const saveStudent = async (values: StudentFormValues) => {
    if (!user || !selectedRosterId) return
    const input: ClassStudentInput = { ...values, rosterId: selectedRosterId, userId: user.id }
    setSaving(true)
    try {
      if (editingStudent) {
        const updated = await updateClassStudent(editingStudent.id, input)
        setStudents((current) => current.map((student) => student.id === updated.id ? updated : student))
      } else {
        const created = await createClassStudent(input)
        setStudents((current) => [...current, created])
        updateLocalRosterCount(students.length + 1)
      }
      setStudentDrawerOpen(false); studentForm.resetFields(); message.success(text.studentSaved)
    } catch { message.error(text.saveError) } finally { setSaving(false) }
  }
  const removeStudents = async (ids: string[]) => {
    if (!user || !selectedRosterId || !ids.length) return
    setSaving(true)
    try {
      const count = await deleteClassStudents(ids, selectedRosterId, user.id)
      const deleted = new Set(ids)
      setStudents((current) => current.filter((student) => !deleted.has(student.id)))
      setSelectedRowKeys([]); updateLocalRosterCount(count); message.success(text.deletedOk)
    } catch { message.error(text.updateError) } finally { setSaving(false) }
  }
  const removeFilteredClass = async () => {
    if (!user || !selectedRosterId || classFilter === 'all') return
    setSaving(true)
    try {
      const count = await deleteClassStudentsByClass(selectedRosterId, user.id, classFilter)
      setStudents((current) => current.filter((student) => student.class_name !== classFilter))
      setClassFilter('all'); setSelectedRowKeys([]); updateLocalRosterCount(count); message.success(text.deletedOk)
    } catch { message.error(text.updateError) } finally { setSaving(false) }
  }
  const removeRoster = async () => {
    if (!user || !selectedRosterId) return
    try {
      await deleteClassRoster(selectedRosterId, user.id)
      const remaining = rosters.filter((item) => item.id !== selectedRosterId)
      setRosters(remaining); setSelectedRosterId(remaining[0]?.id); setStudents([]); message.success(text.deletedOk)
    } catch { message.error(text.saveError) }
  }
  const updateZaloStatus = async (student: ClassStudentRecord, hasZalo: boolean) => {
    if (!user) return
    setBusyStudentId(student.id)
    try {
      const updated = await updateStudentZaloStatus(student.id, user.id, hasZalo)
      setStudents((current) => current.map((item) => item.id === updated.id ? updated : item))
    } catch { message.error(text.updateError) } finally { setBusyStudentId(undefined) }
  }

  const columns: ColumnsType<ClassStudentRecord> = [
    { title: text.number, dataIndex: 'student_number', width: 68 },
    { title: text.class, dataIndex: 'class_name', width: 88, render: (value: string) => <Tag color="cyan">{value}</Tag> },
    { title: text.name, dataIndex: 'full_name', width: 220, render: (value: string) => <Text strong>{value}</Text> },
    { title: text.gender, dataIndex: 'gender', width: 100 }, { title: text.dob, dataIndex: 'date_of_birth', width: 125 }, { title: text.phone, dataIndex: 'phone_number', width: 140 },
    { title: text.zalo, dataIndex: 'has_zalo', width: 118, align: 'center', render: (checked: boolean, student) => <Checkbox checked={checked} disabled={busyStudentId === student.id} onChange={(event) => updateZaloStatus(student, event.target.checked)} aria-label={`${text.zalo}: ${student.full_name}`} /> },
    { title: text.programs, key: 'programs', width: 185, render: (_, student) => <Space size={[4, 4]} wrap>{student.is_ic3 && <Tag color="blue">IC3</Tag>}{student.is_tabn && <Tag color="purple">TABN</Tag>}{student.has_air_conditioner && <Tag color="gold">{text.airConditioner}</Tag>}{student.is_inclusive && <Tag color="green">{text.inclusive}</Tag>}{Object.keys(student.extra_data).length > 0 && <Tooltip title={Object.entries(student.extra_data).map(([key, value]) => `${key}: ${value}`).join(' · ')}><Tag>+{Object.keys(student.extra_data).length}</Tag></Tooltip>}</Space> },
    { title: text.note, dataIndex: 'note', ellipsis: true, width: 260 },
  ]

  return <Space orientation="vertical" size={18} className="full-width class-rosters-page">
    <Card className="content-card class-rosters-hero" variant="borderless"><div className="class-rosters-hero-layout"><div><Text className="eyebrow">{text.eyebrow}</Text><Title level={2}>{text.title}</Title><Paragraph className="settings-copy">{text.description}</Paragraph></div><Space wrap>{!configured ? <Tag color="red">{text.notConfigured}</Tag> : !user ? <Button type="primary" onClick={() => signInWithGithub()}>{text.signIn}</Button> : <><Button icon={<CloudUploadOutlined />} onClick={() => setImportOpen(true)}>{text.import}</Button><Button type="primary" icon={<PlusOutlined />} disabled={!selectedRosterId} onClick={openCreateStudent}>{text.addStudent}</Button></>}</Space></div></Card>

    <Card className="content-card class-rosters-workspace" variant="borderless">
      {selectedRoster ? <>
        <div className="class-rosters-stat-strip"><div className="class-rosters-stat"><span><UserOutlined /></span><div><strong>{students.length}</strong><Text>{text.students}</Text></div></div><div className="class-rosters-stat"><span><TeamOutlined /></span><div><strong>{classNames.length}</strong><Text>{text.classes}</Text></div></div><div className="class-rosters-stat is-accent"><span>Z</span><div><strong>{zaloCount}</strong><Text>{text.zaloDone}</Text></div></div></div>
        <div className="class-rosters-filter-bar"><Select className="class-rosters-inline-roster-select" aria-label={text.selectRoster} value={selectedRosterId} onChange={(value) => { setSelectedRosterId(value); setClassFilter('all'); setSelectedRowKeys([]) }} options={rosters.map((item) => ({ value: item.id, label: `${item.name} · ${item.school_year}` }))} /><Input allowClear prefix={<SearchOutlined />} placeholder={text.search} value={search} onChange={(event) => setSearch(event.target.value)} /><Select value={classFilter} onChange={(value) => { setClassFilter(value); setSelectedRowKeys([]) }} options={[{ value: 'all', label: text.allClasses }, ...classNames.map((name) => ({ value: name, label: name }))]} />{classFilter !== 'all' && <Popconfirm title={replaceParams(text.deleteClassConfirm, { className: classFilter })} onConfirm={removeFilteredClass}><Button danger icon={<DeleteOutlined />}>{text.deleteClass} {classFilter}</Button></Popconfirm>}<Tooltip title={text.deleteRoster}><Popconfirm title={text.deleteRosterConfirm} onConfirm={removeRoster}><Button type="text" danger icon={<DeleteOutlined />} aria-label={text.deleteRoster} /></Popconfirm></Tooltip></div>
        <div className="class-rosters-selection-bar"><Text strong>{selectedRowKeys.length} {text.selected}</Text><Space wrap><Button type="text" disabled={!selectedRowKeys.length} onClick={() => setSelectedRowKeys([])}>{text.clearSelection}</Button><Button icon={<EditOutlined />} disabled={selectedRowKeys.length !== 1} onClick={() => { const student = students.find((item) => item.id === String(selectedRowKeys[0])); if (student) openEditStudent(student) }}>{text.editStudent}</Button><Popconfirm title={replaceParams(text.deleteSelectedConfirm, { count: selectedRowKeys.length })} onConfirm={() => removeStudents(selectedRowKeys.map(String))} disabled={!selectedRowKeys.length}><Button danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length} loading={saving}>{text.deleteSelected}</Button></Popconfirm></Space></div>
        <Table rowKey="id" columns={columns} dataSource={visibleStudents} loading={loading} rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }} scroll={{ x: 1360 }} pagination={{ pageSize: 50, showSizeChanger: true, showTotal: (total) => `${total} ${text.students}` }} locale={{ emptyText: <Empty description={text.noStudents} /> }} className="class-rosters-table" />
      </> : <Empty description={text.emptyRosters}><Button type="primary" icon={<FileExcelOutlined />} disabled={!user} onClick={() => setImportOpen(true)}>{text.import}</Button></Empty>}
    </Card>

    <Drawer title={editingStudent ? text.editStudent : text.addStudent} open={studentDrawerOpen} onClose={() => setStudentDrawerOpen(false)} size="large" destroyOnHidden footer={<div className="class-rosters-drawer-footer"><Button onClick={() => setStudentDrawerOpen(false)}>{text.cancel}</Button><Button type="primary" loading={saving} onClick={() => studentForm.submit()}>{text.save}</Button></div>}>
      <Paragraph type="secondary">{text.formHint}</Paragraph><Form form={studentForm} layout="vertical" onFinish={saveStudent}><Row gutter={12}><Col xs={24} sm={8}><Form.Item name="studentNumber" label={text.number}><Input /></Form.Item></Col><Col xs={24} sm={16}><Form.Item name="className" label={text.class} rules={[{ required: true, message: text.required }]}><Input /></Form.Item></Col></Row><Form.Item name="fullName" label={text.name} rules={[{ required: true, message: text.required }]}><Input autoFocus /></Form.Item><Row gutter={12}><Col xs={24} sm={8}><Form.Item name="gender" label={text.gender}><Select allowClear options={[{ value: 'Nam', label: text.male }, { value: 'Nữ', label: text.female }, { value: 'Khác', label: text.other }]} /></Form.Item></Col><Col xs={24} sm={8}><Form.Item name="dateOfBirth" label={text.dob}><Input placeholder="dd/mm/yyyy" /></Form.Item></Col><Col xs={24} sm={8}><Form.Item name="phoneNumber" label={text.phone}><Input /></Form.Item></Col></Row><div className="class-rosters-check-grid"><Form.Item name="hasZalo" valuePropName="checked"><Checkbox>{text.zalo}</Checkbox></Form.Item><Form.Item name="isIc3" valuePropName="checked"><Checkbox>{text.ic3}</Checkbox></Form.Item><Form.Item name="isTabn" valuePropName="checked"><Checkbox>{text.tabn}</Checkbox></Form.Item><Form.Item name="hasAirConditioner" valuePropName="checked"><Checkbox>{text.airConditioner}</Checkbox></Form.Item><Form.Item name="isInclusive" valuePropName="checked"><Checkbox>{text.inclusive}</Checkbox></Form.Item></div><Form.Item name="note" label={text.note}><Input.TextArea rows={4} /></Form.Item></Form>
    </Drawer>

    <Modal title={text.import} open={importOpen} onCancel={() => { setImportOpen(false); resetImport() }} okText={text.saveRoster} cancelText={text.cancel} onOk={saveImport} okButtonProps={{ disabled: !selectedImportClass || !importStudents.length, loading: saving }} width={720}><Space orientation="vertical" size={16} className="full-width"><Dragger accept=".xlsx,.xls" maxCount={1} fileList={fileList} beforeUpload={readFile} onRemove={() => { resetImport(); return true }} disabled={parsing || saving}><p className="ant-upload-drag-icon"><FileExcelOutlined /></p><p className="ant-upload-text">{text.uploadTitle}</p><p className="ant-upload-hint">{text.uploadHint}</p></Dragger>{workbook && <>{importClassNames.length > 1 && <Alert type="warning" showIcon message={`${text.multipleClasses}: ${importClassNames.length}`} description={text.multipleClassesHint} />}<Form form={importForm} layout="vertical"><Row gutter={12}><Col xs={24} sm={15}><Form.Item name="name" label={text.rosterName} rules={[{ required: true, message: text.required }]}><Input /></Form.Item></Col><Col xs={24} sm={9}><Form.Item name="schoolYear" label={text.schoolYear} rules={[{ required: true, message: text.required }]}><Input /></Form.Item></Col></Row></Form><div className="class-rosters-import-class"><Text strong>{text.selectClass}</Text><Select placeholder={text.chooseClass} value={selectedImportClass} onChange={setSelectedImportClass} options={importClassNames.map((name) => ({ value: name, label: `${name} (${workbook.sheet.students.filter((student) => student.className === name).length} ${text.students})` }))} /></div><Space wrap><Tag color="blue">{text.sheet}: {workbook.sheet.name}</Tag><Tag color={selectedImportClass ? 'green' : 'default'}>{text.preview}: {importStudents.length} {text.students}</Tag>{workbook.sheet.warnings.length > 0 && <Tag color="orange">{workbook.sheet.warnings.length} {text.warning}</Tag>}</Space></>}</Space></Modal>
  </Space>
}

export default ClassRostersPage
