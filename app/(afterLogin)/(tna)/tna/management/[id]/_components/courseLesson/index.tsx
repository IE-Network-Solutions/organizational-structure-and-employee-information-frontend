import { Button } from 'antd';
import { LuPlus } from 'react-icons/lu';
import CourseAddLessonSidebar from './addLesson';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import { useEffect } from 'react';
import LessonCard from './lessonCard';
import CourseLessonMaterial from '@/app/(afterLogin)/(tna)/tna/management/[id]/_components/lessonMaterial';

const CourseLesson = () => {
  const {
    course,
    refetchCourse,
    isShowAddLesson,
    setIsShowAddLesson,
    isShowLessonMaterial,
  } = useTnaManagementCoursePageStore();

  useEffect(() => {
    if ((!isShowAddLesson || !isShowLessonMaterial) && refetchCourse) {
      refetchCourse();
    }
  }, [isShowAddLesson, isShowLessonMaterial]);

  return (
    <div>
      {course?.courseLessons?.map((lesson) => (
        <LessonCard key={lesson.id} lesson={lesson} />
      ))}

      <div className="flex flex-col justify-center items-center gap-2.5">
        <Button
          className="w-full max-w-[325px] h-[56px]"
          type="primary"
          size="large"
          icon={<LuPlus size={16} />}
          onClick={() => {
            setIsShowAddLesson(true);
          }}
        >
          Create Lesson
        </Button>

        <div className="text-base text-gray-600">
          {course?.courseLessons?.length
            ? 'Click to add more Lessons'
            : ' No lessons currently created'}
        </div>
      </div>

      <CourseAddLessonSidebar />

      <CourseLessonMaterial />
    </div>
  );
};

export default CourseLesson;
