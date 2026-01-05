import { Button, Collapse } from 'antd';
import { LuPlus } from 'react-icons/lu';
import CourseAddLessonSidebar from './addLesson';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import { useEffect, useRef } from 'react';
import LessonCard from './lessonCard';
import CourseLessonMaterial from '@/app/(afterLogin)/(tna)/tna/management/[id]/_components/lessonMaterial';
import { RiTriangleFill } from 'react-icons/ri';
import { classNames } from '@/utils/classNames';
import ActionButton from '@/components/common/actionButton';

const CourseLesson = () => {
  const {
    course,
    refetchCourse,
    isShowAddLesson,
    setIsShowAddLesson,
    isShowLessonMaterial,
    activeKey,
    setActiveKey,
    setLesson,
    setIsShowLessonMaterial,
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
      label: (
        <div
          className="flex items-center justify-between w-full"
          data-cy="tna-course-lesson-collapse-label"
          id="tnaCourseLessonCollapseLabelId"
        >
          <span
            className="text-lg font-semibold text-gray-900"
            data-cy="tna-course-lesson-title"
            id="tnaCourseLessonTitleId"
          >
            {lesson.title}
          </span>
          {activeKey === String(lesson.id) && (
            <div
              className="flex items-center gap-2"
              data-cy="tna-course-lesson-actions"
              id="tnaCourseLessonActionsId"
            >
              <Button
                id="tnaAddCourseMaterialButtonId"
                icon={<LuPlus size={16} className="text-primary" />}
                type="text"
                onClick={(e) => {
                  e.stopPropagation();
                  setLesson(lesson);
                  setIsShowLessonMaterial(true);
                }}
                data-cy="tna-add-course-material-button"
              />
              <ActionButton
                id={lesson?.id || null}
                onEdit={(e) => {
                  e.stopPropagation();
                  setLesson(lesson);
                  setIsShowAddLesson(true);
                }}
                onDelete={(e) => {
                  e.stopPropagation();
                  // Add your delete logic here
                }}
                data-cy="tna-course-lesson-action-button"
              />
            </div>
          )}
        </div>
      ),
      children: (
        <LessonCard
          lesson={lesson}
          data-cy="tna-course-lesson-card-component"
        />
      ), // Just render the content, not a Collapse
    })) || [];

  return (
    <div id="tnaCourseLessonContainerId" data-cy="tna-course-lesson-container">
      <Collapse
        className="mb-6 lesson-card"
        accordion
        activeKey={activeKey ? String(activeKey) : undefined}
        onChange={(key) => {
          setActiveKey(key ? String(key) : undefined);
        }}
        items={items}
        style={{ borderColor: 'rgb(229 231 235)' }}
        data-cy="tna-course-lesson-collapse"
        expandIcon={({ isActive }) => (
          <RiTriangleFill
            size={24}
            className={classNames(
              'text-gray-900',
              { 'rotate-180': !!isActive, 'rotate-90': !isActive },
              [],
            )}
            id="tnaCourseLessonExpandIconId"
            data-cy="tna-course-lesson-expand-icon"
          />
        )}
      />

      <div
        className="flex flex-col justify-center items-center gap-2.5"
        id="tnaCourseLessonActionsId"
        data-cy="tna-course-lesson-actions"
      >
        <Button
          id="tnaCreateLessonButtonId"
          data-cy="tna-create-lesson-button"
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

        <div
          className="text-base text-gray-600"
          id="tnaCourseLessonHintId"
          data-cy="tna-course-lesson-hint"
        >
          {course?.courseLessons?.length
            ? 'Click to add more Lessons'
            : ' No lessons currently created'}
        </div>
      </div>

      <CourseAddLessonSidebar data-cy="tna-course-lesson-add-lesson-sidebar" />

      {!isShowAddLesson && (
        <CourseLessonMaterial data-cy="tna-course-lesson-material" />
      )}
    </div>
  );
};

export default CourseLesson;
