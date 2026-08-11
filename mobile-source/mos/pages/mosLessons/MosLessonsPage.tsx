import { CheckCircleOutlined, CompressOutlined, ExpandOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Segmented,
  Select,
  Space,
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { FormInstance } from "antd";
import { useMemo, useState } from "react";
import { courseTheory, courses, lessonStatusLabels } from "./data";
import { createId, type AppStore, useAppData } from "./storage";
import { LessonPracticeFields } from "./shared/components/LessonPracticeFields";
import { ObjectiveTags } from "./shared/components/ObjectiveTags";
import { syncCourseRoadmap, textToLines, updateLesson } from "./shared/utils";
import type { CourseName, Lesson, LessonStatus } from "./types";

const { Text, Title } = Typography;

type LessonFormValues = Omit<Lesson, "id" | "goals" | "agenda" | "materials"> & {
  goalsText?: string;
  agendaText?: string;
  materialsText?: string;
};

function MosLessonsPage() {
  const store = useAppData();
  const { data, setData } = store;
  const [courseFilter, setCourseFilter] = useState<CourseName>("MOS Word");
  const [open, setOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string>();
  const [focusMode, setFocusMode] = useState(false);
  const [form] = Form.useForm<LessonFormValues>();

  const filteredLessons = useMemo(
    () =>
      data.lessons
        .filter((lesson) => lesson.course === courseFilter)
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
    [courseFilter, data.lessons],
  );
  const selectedLesson = filteredLessons.find((lesson) => lesson.id === selectedLessonId) ?? filteredLessons[0];
  const theoryTopics = selectedLesson
    ? (selectedLesson.theoryTopicIds ?? [])
        .map((topicId) => courseTheory[selectedLesson.course].find((topic) => topic.id === topicId))
        .filter(Boolean)
    : [];

  return (
    <>
      <div className="toolbar mos-lessons-toolbar">
        <Segmented<CourseName>
          value={courseFilter}
          options={courses}
          onChange={(value) => {
            setCourseFilter(value);
            setSelectedLessonId(undefined);
          }}
        />
        <Space wrap>
          <Button onClick={() => syncCourseRoadmap(setData, courseFilter)} icon={<CheckCircleOutlined />}>
            Cập nhật lộ trình
          </Button>
          <Button type="primary" onClick={() => setOpen(true)}>
            Thêm bài giảng
          </Button>
        </Space>
      </div>
      <div className={`lesson-workspace ${focusMode ? "is-focus" : ""}`}>
        <Card className="lesson-roadmap" title="Lộ trình buổi học">
          <Space direction="vertical" size={10} style={{ width: "100%" }}>
            {filteredLessons.map((lesson) => {
              const status = lesson.status ?? "planned";
              const isActive = lesson.id === selectedLesson?.id;
              return (
                <button
                  key={lesson.id}
                  className={`lesson-roadmap-item ${isActive ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setSelectedLessonId(lesson.id)}
                >
                  <span className={`lesson-status-dot status-${status}`} />
                  <span className="lesson-roadmap-order">{String(lesson.order ?? "-").padStart(2, "0")}</span>
                  <span className="lesson-roadmap-body">
                    <Text strong>{lesson.title}</Text>
                    <Text type="secondary">{lesson.stage ?? lesson.course}</Text>
                  </span>
                </button>
              );
            })}
          </Space>
        </Card>

        <Card className="lesson-main">
          {selectedLesson ? (
            <>
              <LessonHeader lesson={selectedLesson} focusMode={focusMode} onToggleFocus={() => setFocusMode((value) => !value)} />
              <Tabs
                items={[
                  { key: "overview", label: "Kế hoạch", children: <LessonOverview lesson={selectedLesson} /> },
                  {
                    key: "theory",
                    label: "Lý thuyết",
                    children: theoryTopics.length ? (
                      <div className="lesson-theory-list">
                        {theoryTopics.map((topic) => (
                          <section key={topic!.id} className="lesson-theory-topic">
                            <Title level={4}>{topic!.title}</Title>
                            <p className="lesson-theory-summary">{topic!.summary}</p>
                            <div className="lesson-section-stack">
                              {topic!.examSkills?.length ? <TheoryBlock title="Kỹ năng theo outline MOS" values={topic!.examSkills} /> : null}
                              <TheoryBlock title="Ý chính" values={topic!.keyPoints} />
                              <TheoryBlock title="Task MOS thường gặp" values={topic!.commonTasks} />
                              {topic!.teachingFlow?.length ? <TheoryBlock title="Luồng dạy gợi ý" values={topic!.teachingFlow} /> : null}
                              <TheoryBlock title="Cách dạy nên bám" values={topic!.teachingTips} />
                              <TheoryBlock title="Lỗi học viên hay mắc" values={topic!.commonMistakes} />
                              {topic!.assessmentChecklist?.length ? <TheoryBlock title="Checklist đánh giá" values={topic!.assessmentChecklist} /> : null}
                            </div>
                          </section>
                        ))}
                      </div>
                    ) : (
                      <Empty description="Chưa có lý thuyết cho bài này" />
                    ),
                  },
                  {
                    key: "practice",
                    label: "Thực hành",
                    children: (
                      <div className="lesson-section-stack">
                        {theoryTopics.map((topic) =>
                          topic!.practicePrompt ? (
                            <div key={topic!.id} className="lesson-section">
                              <Text strong>{topic!.title}</Text>
                              <p>{topic!.practicePrompt}</p>
                            </div>
                          ) : null,
                        )}
                        {selectedLesson.homework ? <Alert type="success" showIcon message="Bài về nhà" description={selectedLesson.homework} /> : null}
                      </div>
                    ),
                  },
                ]}
              />
            </>
          ) : (
            <Empty description="Chưa có bài giảng trong lộ trình này" />
          )}
        </Card>

        <LessonSidePanel lesson={selectedLesson} setData={setData} />
      </div>
      <LessonModal open={open} form={form} course={courseFilter} onClose={() => setOpen(false)} setData={setData} />
    </>
  );
}

function LessonHeader({ lesson, focusMode, onToggleFocus }: { lesson: Lesson; focusMode: boolean; onToggleFocus: () => void }) {
  return (
    <div className="lesson-reader-header">
      <div>
        <Space wrap>
          <Tag color="blue">{lesson.course}</Tag>
          {lesson.stage ? <Tag>{lesson.stage}</Tag> : null}
          <Tag>{lesson.duration} phút</Tag>
        </Space>
        <Title level={2} className="lesson-reader-title">
          {lesson.order ? `Buổi ${lesson.order}: ` : ""}
          {lesson.title}
        </Title>
        <ObjectiveTags objectives={lesson.objectives} />
      </div>
      <Button icon={focusMode ? <CompressOutlined /> : <ExpandOutlined />} onClick={onToggleFocus}>
        {focusMode ? "Thoát tập trung" : "Tập trung"}
      </Button>
    </div>
  );
}

function LessonOverview({ lesson }: { lesson: Lesson }) {
  return (
    <div className="lesson-plan-grid">
      <LessonPlanSection title="Mục tiêu buổi học" values={lesson.goals} />
      <LessonPlanSection title="Agenda khi dạy" values={lesson.agenda} />
      <div className="lesson-section full-span">
        <Text strong>Tài liệu cần chuẩn bị</Text>
        {lesson.materials?.length ? (
          <Space size={[8, 8]} wrap style={{ marginTop: 12 }}>
            {lesson.materials.map((material) => (
              <Tag key={material}>{material}</Tag>
            ))}
          </Space>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có tài liệu" />
        )}
      </div>
    </div>
  );
}

function LessonPlanSection({ title, values }: { title: string; values?: string[] }) {
  return (
    <div className="lesson-section">
      <Text strong>{title}</Text>
      {values?.length ? (
        <ul className="clean-list">
          {values.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có nội dung" />
      )}
    </div>
  );
}

function TheoryBlock({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="lesson-section">
      <Text strong>{title}</Text>
      <ul className="clean-list">
        {values.map((value) => (
          <li key={value}>{value}</li>
        ))}
      </ul>
    </div>
  );
}

function LessonSidePanel({ lesson, setData }: { lesson?: Lesson; setData: AppStore["setData"] }) {
  return (
    <Card className="lesson-side" title="Theo dõi buổi dạy">
      {lesson ? (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div>
            <Text strong>Trạng thái</Text>
            <Select
              value={lesson.status ?? "planned"}
              onChange={(status: LessonStatus) => updateLesson(setData, lesson.id, { status })}
              options={Object.entries(lessonStatusLabels).map(([value, label]) => ({ value, label }))}
              style={{ width: "100%", marginTop: 8 }}
            />
          </div>
          <Divider style={{ margin: 0 }} />
          <Checkbox.Group className="lesson-checklist">
            <Checkbox value="theory">Đã dạy lý thuyết</Checkbox>
            <Checkbox value="demo">Đã demo thao tác</Checkbox>
            <Checkbox value="practice">Đã cho làm bài tập</Checkbox>
            <Checkbox value="review">Có mục cần ôn lại</Checkbox>
          </Checkbox.Group>
          <Divider style={{ margin: 0 }} />
          <div>
            <Text strong>Ghi chú sau buổi học</Text>
            <Input.TextArea
              rows={7}
              value={lesson.note}
              onChange={(event) => updateLesson(setData, lesson.id, { note: event.target.value })}
              placeholder="Ví dụ: học viên còn yếu phần section break, buổi sau ôn lại page number..."
              style={{ marginTop: 8 }}
            />
          </div>
        </Space>
      ) : (
        <Empty description="Chọn một bài để theo dõi" />
      )}
    </Card>
  );
}

function LessonModal({
  open,
  form,
  course,
  onClose,
  setData,
}: {
  open: boolean;
  form: FormInstance<LessonFormValues>;
  course: CourseName;
  onClose: () => void;
  setData: AppStore["setData"];
}) {
  return (
    <Modal title="Thêm bài giảng" open={open} onCancel={onClose} onOk={() => form.submit()} destroyOnHidden>
      <Form
        form={form}
        layout="vertical"
        onFinish={(values: LessonFormValues) => {
          const { goalsText, agendaText, materialsText, ...lessonValues } = values;
          setData((current) => ({
            ...current,
            lessons: [
              ...current.lessons,
              {
                ...lessonValues,
                goals: textToLines(goalsText),
                agenda: textToLines(agendaText),
                materials: textToLines(materialsText),
                id: createId("lesson"),
              },
            ],
          }));
          form.resetFields();
          onClose();
        }}
      >
        <LessonPracticeFields defaultCourse={course} />
        <div className="form-grid">
          <Form.Item name="order" label="Thứ tự">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="stage" label="Chặng">
            <Input />
          </Form.Item>
        </div>
        <Form.Item name="status" label="Trạng thái" initialValue="planned" rules={[{ required: true }]}>
          <Select options={Object.entries(lessonStatusLabels).map(([value, label]) => ({ value, label }))} />
        </Form.Item>
        <Form.Item name="duration" label="Thời lượng" initialValue={90} rules={[{ required: true }]}>
          <InputNumber min={15} step={15} addonAfter="phút" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="goalsText" label="Mục tiêu buổi học">
          <Input.TextArea rows={3} placeholder="Mỗi dòng là một mục tiêu" />
        </Form.Item>
        <Form.Item name="agendaText" label="Agenda khi dạy">
          <Input.TextArea rows={4} placeholder="Mỗi dòng là một bước triển khai" />
        </Form.Item>
        <Form.Item name="materialsText" label="Tài liệu/file cần chuẩn bị">
          <Input.TextArea rows={3} placeholder="Mỗi dòng là một tài liệu" />
        </Form.Item>
        <Form.Item name="homework" label="Bài về nhà">
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default MosLessonsPage;
