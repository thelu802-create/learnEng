import type { AppData, CourseTheoryMap } from "../types";
import { courses } from "./common";
import { excelPractices, excelRoadmapLessons, excelTheory } from "./excel";
import { powerpointPractices, powerpointRoadmapLessons, powerpointTheory } from "./powerpoint";
import { expandedWordRoadmapLessons as wordRoadmapLessons, wordPractices, wordTheory } from "./word";

export { courseObjectives, courses, lessonStatusLabels, statusLabels } from "./common";
export { excelPractices, excelRoadmapLessons, excelTheory } from "./excel";
export { powerpointPractices, powerpointRoadmapLessons, powerpointTheory } from "./powerpoint";
export { expandedWordRoadmapLessons as wordRoadmapLessons, wordPractices, wordTheory } from "./word";

export const courseTheory: CourseTheoryMap = {
  "MOS Word": wordTheory,
  "MOS Excel": excelTheory,
  "MOS PowerPoint": powerpointTheory,
};

export const seedData: AppData = {
  students: [
    {
      id: "student-1",
      name: "Nguyen Minh Anh",
      groupName: "Ca tối T2-T4",
      target: "MOS Excel",
      phone: "0900000001",
      note: "Cần luyện thêm hàm điều kiện.",
    },
    {
      id: "student-2",
      name: "Tran Quoc Bao",
      groupName: "Cuối tuần",
      target: "MOS Word",
      phone: "0900000002",
      note: "Làm tốt phần định dạng văn bản.",
    },
  ],
  lessons: [...wordRoadmapLessons, ...excelRoadmapLessons, ...powerpointRoadmapLessons],
  practices: [...wordPractices, ...excelPractices, ...powerpointPractices],
  progress: [
    {
      id: "progress-1",
      studentId: "student-1",
      itemId: "excel-lesson-01",
      itemType: "lesson",
      status: "done",
      score: 86,
    },
    {
      id: "progress-2",
      studentId: "student-1",
      itemId: "practice-1",
      itemType: "practice",
      status: "needs_review",
      score: 68,
      note: "Sai phần chart axis.",
    },
    {
      id: "progress-3",
      studentId: "student-2",
      itemId: "word-lesson-02",
      itemType: "lesson",
      status: "done",
      score: 90,
    },
  ],
};

export const courseRoadmaps = {
  "MOS Word": wordRoadmapLessons,
  "MOS Excel": excelRoadmapLessons,
  "MOS PowerPoint": powerpointRoadmapLessons,
};

export const availableCourses = courses;
