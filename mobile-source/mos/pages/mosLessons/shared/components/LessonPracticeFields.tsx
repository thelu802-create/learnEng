import { Form, Input, Select } from "antd";
import { useState } from "react";
import { courseObjectives, courses } from "../../data";
import type { CourseName } from "../../types";

export function LessonPracticeFields({ defaultCourse = "MOS Excel" }: { defaultCourse?: CourseName }) {
  const [course, setCourse] = useState<CourseName>(defaultCourse);

  return (
    <>
      <Form.Item name="title" label="Tên nội dung" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="course" label="Khóa" initialValue={defaultCourse} rules={[{ required: true }]}>
        <Select
          options={courses.map((item) => ({ label: item, value: item }))}
          onChange={(value: CourseName) => setCourse(value)}
        />
      </Form.Item>
      <Form.Item name="objectives" label="Kỹ năng MOS" rules={[{ required: true }]}>
        <Select mode="multiple" options={courseObjectives[course].map((item) => ({ label: item, value: item }))} />
      </Form.Item>
      <Form.Item name="note" label="Ghi chú">
        <Input.TextArea rows={3} />
      </Form.Item>
    </>
  );
}
