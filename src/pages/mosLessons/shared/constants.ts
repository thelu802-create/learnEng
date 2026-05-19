import type { CourseName, LessonStatus, Status } from "../types";

export const coursePathMap = {
  word: "MOS Word",
  excel: "MOS Excel",
  powerpoint: "MOS PowerPoint",
} as const satisfies Record<string, CourseName>;

export const statusColor: Record<Status, string> = {
  not_started: "default",
  learning: "processing",
  done: "success",
  needs_review: "warning",
};

export const lessonStatusColor: Record<LessonStatus, string> = {
  planned: "default",
  teaching: "processing",
  completed: "success",
  review: "warning",
};
