import { Button, Collapse } from 'antd';
import { LuPlus } from 'react-icons/lu';
import CourseAddLessonSidebar from './addLesson';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import { useEffect, useRef } from 'react';
import LessonCard from './lessonCard';
import CourseLessonMaterial from '@/app/(afterLogin)/(tna)/tna/management/[id]/_components/lessonMaterial';
import { RiTriangleFill } from 'react-icons/ri';
import { classNames } from '@/utils/classNames';

const CourseLesson = () => {
  const {
    course,
    refetchCourse,
    isShowAddLesson,
    setIsShowAddLesson,
    isShowLessonMaterial,
    activeKey,
    setActiveKey,
  } = useTnaManagementCoursePageStore();

  useEffect(() => {
    if ((!isShowAddLesson || !isShowLessonMaterial) && refetchCourse) {
      refetchCourse();
    }
  }, [isShowAddLesson, isShowLessonMaterial]);

  // Only expand the first lesson by default on initial load
  const hasSetDefault = useRef(false);
  useEffect(() => {
    if (
      !hasSetDefault.current &&
      (!activeKey || (Array.isArray(activeKey) && activeKey.length === 0)) &&
      course?.courseLessons &&
      course.courseLessons.length > 0
    ) {
      setActiveKey(String(course.courseLessons[0].id));
      hasSetDefault.current = true;
    }
  }, [course, activeKey, setActiveKey]);

  const items =
    course?.courseLessons?.map((lesson) => ({
      key: String(lesson.id),
      label: <div className="text-lg font-semibold text-gray-900">{lesson.title}</div>,
      children: <LessonCard lesson={lesson} />, // Just render the content, not a Collapse
    })) || [];

  return (
    <div>
      <Collapse
        className="mb-6 lesson-card"
        accordion
        activeKey={activeKey ? String(activeKey) : undefined}
        onChange={(key) => {
          setActiveKey(key ? String(key) : undefined);
        }}
        items={items}
        style={{ borderColor: 'rgb(229 231 235)' }}
        expandIcon={({ isActive }) => (
          <RiTriangleFill
            size={24}
            className={classNames(
              'text-gray-900',
              { 'rotate-180': !!isActive, 'rotate-90': !isActive },
              [],
            )}
          />
        )}
      />

      <div className="flex flex-col justify-center items-center gap-2.5">
        <Button
          id="tnaCreateLessonButtonId"
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

      {!isShowAddLesson && <CourseLessonMaterial />}
    </div>
  );
};

export default CourseLesson;
