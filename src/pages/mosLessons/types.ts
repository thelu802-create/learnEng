export type CourseName = "MOS Word" | "MOS Excel" | "MOS PowerPoint";

export type Status = "not_started" | "learning" | "done" | "needs_review";

export type LessonStatus = "planned" | "teaching" | "completed" | "review";

export type TheoryTopic = {
  id: string;
  course: CourseName;
  objective: string;
  title: string;
  summary: string;
  examSkills?: string[];
  keyPoints: string[];
  commonTasks: string[];
  teachingFlow?: string[];
  teachingTips: string[];
  commonMistakes: string[];
  assessmentChecklist?: string[];
  practicePrompt?: string;
};

export type CourseTheoryMap = Record<CourseName, TheoryTopic[]>;

export type Student = {
  id: string;
  name: string;
  groupName: string;
  target: CourseName;
  phone?: string;
  note?: string;
};

export type Lesson = {
  id: string;
  course: CourseName;
  order?: number;
  stage?: string;
  title: string;
  objectives: string[];
  duration: number;
  status?: LessonStatus;
  theoryTopicIds?: string[];
  goals?: string[];
  agenda?: string[];
  materials?: string[];
  homework?: string;
  note?: string;
};

export type Practice = {
  id: string;
  course: CourseName;
  sourceLessonIds?: string[];
  title: string;
  objectives: string[];
  difficulty: "Dễ" | "Trung bình" | "Khó";
  estimatedMinutes?: number;
  scenario?: string;
  tasks?: string[];
  rubric?: string[];
  note?: string;
};

export type Progress = {
  id: string;
  studentId: string;
  itemId: string;
  itemType: "lesson" | "practice";
  status: Status;
  score?: number;
  note?: string;
};

export type AppData = {
  students: Student[];
  lessons: Lesson[];
  practices: Practice[];
  progress: Progress[];
};
