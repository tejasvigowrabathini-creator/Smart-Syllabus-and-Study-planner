export enum DifficultyLevel {
  EASY = "Easy",
  MEDIUM = "Medium",
  HARD = "Hard"
}

export interface CourseInfo {
  course_name: string;
  overall_weeks: number;
  course_code?: string | null;
  instructor?: string | null;
}

export interface StudyModule {
  module_title: string;
  difficulty: DifficultyLevel;
  estimated_hours: number;
  topics: string[];
  learning_outcomes: string[];
}

export interface StudyTimelineWeek {
  week_number: number;
  weekly_objectives: string[];
  assigned_modules: string[];
  estimated_weekly_hours: number;
  milestone?: string | null;
}

export interface StudyPlanResponse {
  course_info: CourseInfo;
  modules: StudyModule[];
  timeline: StudyTimelineWeek[];
  generation_notes?: string | null;
}
