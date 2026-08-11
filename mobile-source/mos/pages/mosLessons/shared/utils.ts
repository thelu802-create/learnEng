import { message } from "antd";
import { courseRoadmaps, courses } from "../data";
import type { AppStore } from "../storage";
import type { AppData, CourseName, Lesson } from "../types";

export function getStats(data: AppData) {
  const courseCompletion = courses.reduce(
    (acc, course) => {
      const students = data.students.filter((student) => student.target === course);
      const records = data.progress.filter((item) => {
        const student = data.students.find((studentItem) => studentItem.id === item.studentId);
        return student?.target === course;
      });
      const done = records.filter((item) => item.status === "done").length;
      acc[course] = students.length && records.length ? Math.round((done / records.length) * 100) : 0;
      return acc;
    },
    {} as Record<CourseName, number>,
  );

  return { courseCompletion };
}

export function updateLesson(setData: AppStore["setData"], lessonId: string, patch: Partial<Lesson>) {
  setData((current) => ({
    ...current,
    lessons: current.lessons.map((lesson) => (lesson.id === lessonId ? { ...lesson, ...patch } : lesson)),
  }));
}

export function textToLines(value?: string) {
  return value
    ?.split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function syncCourseRoadmap(setData: AppStore["setData"], course: CourseName) {
  setData((current) => {
    const roadmapLessons = courseRoadmaps[course];
    const roadmapById = new Map(roadmapLessons.map((lesson) => [lesson.id, lesson]));
    const existingRoadmapIds = new Set(current.lessons.map((lesson) => lesson.id));
    const updatedLessons = current.lessons.map((lesson) => {
      const roadmapLesson = roadmapById.get(lesson.id);
      if (!roadmapLesson) {
        return lesson;
      }

      return {
        ...roadmapLesson,
        status: lesson.status ?? roadmapLesson.status,
        note: lesson.note ?? roadmapLesson.note,
      };
    });
    const missingLessons = roadmapLessons.filter((lesson) => !existingRoadmapIds.has(lesson.id));

    message.success(
      missingLessons.length
        ? `Đã nạp/cập nhật lộ trình ${course}, thêm ${missingLessons.length} bài mới`
        : `Đã cập nhật lộ trình ${course}`,
    );

    return {
      ...current,
      lessons: [...updatedLessons, ...missingLessons],
    };
  });
}
