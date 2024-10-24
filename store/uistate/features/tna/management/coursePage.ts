import { create, StateCreator } from 'zustand';
import { Course, CourseLesson, CourseLessonMaterial } from '@/types/tna/course';

type TnaManagementCoursePageState = {
  isShowAddLesson: boolean;
  course: Course | null;
  refetchCourse: any;
  lessonId: string | null;

  isShowLessonMaterial: boolean;
  lesson: CourseLesson | null;
  lessonMaterial: CourseLessonMaterial | null;
};

type TnaManagementCoursePageAction = {
  setIsShowAddLesson: (isShowAddLesson: boolean) => void;
  setCourse: (course: Course | null) => void;
  setRefetchCourse: (refetch: any) => void;
  setLessonId: (lessonId: string | null) => void;

  setIsShowLessonMaterial: (isShowLessonMaterial: boolean) => void;
  setLesson: (lesson: CourseLesson | null) => void;
  setLessonMaterial: (lessonMaterial: CourseLessonMaterial | null) => void;
};

const tnaManagementCoursePageSlice: StateCreator<
  TnaManagementCoursePageState & TnaManagementCoursePageAction
> = (set) => ({
  isShowAddLesson: false,
  setIsShowAddLesson: (isShowAddLesson: boolean) => {
    set({ isShowAddLesson });
  },

  course: null,
  setCourse: (course: Course | null) => {
    set({ course });
  },

  refetchCourse: null,
  setRefetchCourse: (refetch: any) => {
    set({ refetchCourse: refetch });
  },

  lessonId: null,
  setLessonId: (lessonId: string | null) => {
    set({ lessonId });
  },

  isShowLessonMaterial: false,
  setIsShowLessonMaterial: (isShowLessonMaterial: boolean) => {
    set({ isShowLessonMaterial });
  },

  lesson: null,
  setLesson: (lesson) => {
    set({ lesson });
  },

  lessonMaterial: null,
  setLessonMaterial: (lessonMaterial: CourseLessonMaterial | null) => {
    set({ lessonMaterial });
  },
});

export const useTnaManagementCoursePageStore = create<
  TnaManagementCoursePageState & TnaManagementCoursePageAction
>(tnaManagementCoursePageSlice);
