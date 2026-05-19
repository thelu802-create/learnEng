import type { CourseName, LessonStatus, Status } from "../types";

export const courses: CourseName[] = ["MOS Word", "MOS Excel", "MOS PowerPoint"];

export const courseObjectives: Record<CourseName, string[]> = {
  "MOS Word": [
    "Manage documents",
    "Insert and format text, paragraphs, and sections",
    "Manage tables and lists",
    "Create and manage references",
    "Insert and format graphic elements",
    "Manage document collaboration",
  ],
  "MOS Excel": [
    "Manage worksheets and workbooks",
    "Manage data cells and ranges",
    "Manage tables and table data",
    "Use formulas and functions",
    "Manage charts",
  ],
  "MOS PowerPoint": [
    "Manage presentations",
    "Manage slides",
    "Insert and format text, shapes, images",
    "Insert tables, charts, media",
    "Apply transitions and animations",
  ],
};

export const statusLabels: Record<Status, string> = {
  not_started: "Chưa học",
  learning: "Đang học",
  done: "Đã ổn",
  needs_review: "Cần ôn",
};

export const lessonStatusLabels: Record<LessonStatus, string> = {
  planned: "Dự kiến",
  teaching: "Đang dạy",
  completed: "Đã dạy",
  review: "Cần ôn lại",
};
