import { create, StateCreator } from 'zustand';
import { Course } from '@/types/tna/course';

type TnaManagementCoursePageState = {
  isShowAddLesson: boolean;
  course: Course | null;
  refetchCourse: any;
  lessonId: string | null;
};

type TnaManagementCoursePageAction = {
  setIsShowAddLesson: (isShowAddLesson: boolean) => void;
  setCourse: (course: Course | null) => void;
  setRefetchCourse: (refetch: any) => void;
  setLessonId: (lessonId: string | null) => void;
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
});

export const useTnaManagementCoursePageStore = create<
  TnaManagementCoursePageState & TnaManagementCoursePageAction
>(tnaManagementCoursePageSlice);
