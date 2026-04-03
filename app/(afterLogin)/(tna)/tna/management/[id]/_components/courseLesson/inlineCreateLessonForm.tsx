'use client';

import CustomLabel from '@/components/form/customLabel/customLabel';
import { LessonTitleDescriptionFormItems } from './lessonTitleDescriptionFields';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import { useSetCourseLesson } from '@/store/server/features/tna/lesson/mutation';
import { CourseLesson } from '@/types/tna/course';
import { Button, Form } from 'antd';
import { useCallback, type FC } from 'react';

const getLessonOrderForInsert = (
  courseLessons: CourseLesson[],
  lessonOrder: number,
): number => {
  if (!courseLessons?.length || !lessonOrder) {
    return 0;
  }
  const targetLesson = courseLessons.find((l) => l.order === lessonOrder);
  if (!targetLesson) {
    return 0;
  }
  const targetOrder = targetLesson.order;
  const sortedLessons = [...courseLessons].sort((a, b) => a.order - b.order);
  const previousLesson = sortedLessons
    .filter((l) => l.order < targetOrder)
    .pop();
  if (!previousLesson) {
    return targetOrder / 2;
  }
  return (previousLesson.order + targetOrder) / 2;
};

/** Same as drawer "Create at the end" (select value 0). */
const INSERT_NEW_LESSON_AT_END = 0;

const InlineCreateLessonForm: FC = () => {
  const { course, refetchCourse, setIsShowAddLesson, setLesson } =
    useTnaManagementCoursePageStore();
  const { mutate: setLessons, isLoading } = useSetCourseLesson();
  const [form] = Form.useForm();

  const handleClose = useCallback(() => {
    form.resetFields();
    setLesson(null);
    setIsShowAddLesson(false);
  }, [form, setIsShowAddLesson, setLesson]);

  const onFinish = (values: { title: string; description: string }) => {
    const courseLessons = course?.courseLessons ?? [];
    const resolvedOrder =
      getLessonOrderForInsert(courseLessons, INSERT_NEW_LESSON_AT_END) || 0;
    setLessons(
      [
        {
          title: values.title,
          order: resolvedOrder,
          description: values.description,
          courseId: course?.id ?? '',
        },
      ],
      {
        onSuccess: () => {
          handleClose();
          void refetchCourse?.();
        },
      },
    );
  };

  return (
    <div
      id="tna-inline-create-lesson"
      className="mb-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      data-cy="tna-inline-create-lesson"
    >
      <div
        className="mb-4 text-base font-semibold text-gray-900"
        data-cy="tna-inline-create-lesson-heading"
      >
        Add lesson
      </div>
      <Form
        layout="vertical"
        form={form}
        requiredMark={CustomLabel}
        disabled={isLoading}
        onFinish={onFinish}
        id="tnaInlineCreateLessonForm"
        data-cy="tna-inline-create-lesson-form"
      >
        <LessonTitleDescriptionFormItems dataCyPrefix="tna-inline-create-lesson" />
      </Form>
      <div
        className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-2.5 sm:flex-row sm:items-center sm:justify-end"
        data-cy="tna-inline-create-lesson-footer"
      >
        <Button
          size="middle"
          className="w-full !border-[#D9D9D9] !font-normal !text-black/70 hover:!border-[#D9D9D9] hover:!text-black/70 sm:w-auto"
          onClick={handleClose}
          disabled={isLoading}
          data-cy="tna-inline-create-lesson-cancel"
        >
          Cancel
        </Button>
        <Button
          type="primary"
          size="middle"
          className="w-full !font-normal sm:w-auto"
          loading={isLoading}
          onClick={() => form.submit()}
          data-cy="tna-inline-create-lesson-submit"
        >
          Create
        </Button>
      </div>
    </div>
  );
};

export default InlineCreateLessonForm;
