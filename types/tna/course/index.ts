import { DateInfo } from '@/types/commons/dateInfo';

export interface CourseCategory extends DateInfo {
  id: string;
  title: string;
  description: string;
  tenantId: string;
}

export interface CourseLessonMaterial extends DateInfo {
  id: string;
  courseLessonId: string;
  title: string;
  description: string | null;
  article: string | null;
  videos: string[];
  attachments: string[];
  /** Supporting reading material (docs, slide decks, external links). */
  referenceMaterials: string[] | null;
  /** Supplementary images shown as a gallery on the material page. */
  images: string[] | null;
  order: number;
  timeToFinishMinutes: number | null;
  tenantId: string;
}

/** A private note an employee writes while going through a lesson material. */
export interface CourseLessonMaterialNote extends DateInfo {
  id: string;
  courseLessonMaterialId: string;
  userId: string;
  title: string;
  content: string | null;
  tenantId: string;
}

export interface CourseLesson extends DateInfo {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  order: number;
  courseLessonMaterials: CourseLessonMaterial[];
  tenantId: string;
}

export interface CourseUser extends DateInfo {
  id: string;
  courseId: string;
  userId: string;
  tenantId: string;
}

export interface CourseDepartment extends DateInfo {
  id: string;
  courseId: string;
  departmentId: string;
  tenantId: string;
}

export interface Course extends DateInfo {
  id: string;
  title: string;
  overview: string | null;
  thumbnail: string | null;
  courseCategoryId: string;
  courseCategory: CourseCategory;
  courseLessons: CourseLesson[];
  courseUsers?: CourseUser[];
  courseDepartments?: CourseDepartment[];
  departmentIds?: string[];
  userIds?: string[];
  preparedBy: string;
  isDraft: boolean;
  rating?: number | null;
  tenantId: string;
}
