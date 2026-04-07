'use client';

import { CourseLesson } from '@/types/tna/course';
import { FC, useCallback, useEffect } from 'react';
import { Button, Form, message } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import { useSetCourseLesson } from '@/store/server/features/tna/lesson/mutation';
import { LessonTitleDescriptionFormItems } from './lessonTitleDescriptionFields';

interface LessonSectionInlineEditProps {
  lesson: CourseLesson;
  onCancel: () => void;
  onAddCourseMaterial: () => void;
}

const LessonSectionInlineEdit: FC<LessonSectionInlineEditProps> = ({
  lesson,
  onCancel,
  onAddCourseMaterial,
}) => {
  const { refetchCourse } = useTnaManagementCoursePageStore();
  const { mutate: saveLesson, isLoading: isSaving } = useSetCourseLesson();
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      title: lesson.title,
      description: lesson.description ?? '',
    });
  }, [lesson.id, lesson.title, lesson.description, form]);

  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const title = String(values.title ?? '').trim();
      const description = String(values.description ?? '').trim();
      if (!title) {
        void message.warning('Please enter a lesson title.');
        return;
      }
      if (!description) {
        void message.warning('Please enter a description.');
        return;
      }
      const { courseLessonMaterials: unusedMaterials, ...lessonPayload } =
        lesson;
      void unusedMaterials;
      saveLesson(
        [
          {
            ...lessonPayload,
            title,
            description,
          },
        ],
        {
          onSuccess: () => {
            onCancel();
            void refetchCourse?.();
          },
        },
      );
    } catch {
      /* validation failed — Form shows field errors */
    }
  }, [form, lesson, onCancel, refetchCourse, saveLesson]);

  return (
    <div
      id={`tna-course-lesson-section-edit-${lesson.id}`}
      className="mb-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      data-cy={`tna-course-lesson-section-edit-${lesson.id}`}
    >
      <Form
        layout="vertical"
        form={form}
        requiredMark={CustomLabel}
        disabled={isSaving}
        id={`tna-course-lesson-section-edit-form-${lesson.id}`}
      >
        <LessonTitleDescriptionFormItems
          dataCyPrefix={`tna-course-lesson-section-edit-${lesson.id}`}
          titleInputId={`tna-course-lesson-section-edit-title-${lesson.id}`}
          descriptionInputId={`tna-course-lesson-section-edit-description-${lesson.id}`}
          titleInputDataCy={`tna-course-lesson-section-edit-title-input-${lesson.id}`}
          descriptionInputDataCy={`tna-course-lesson-section-edit-description-${lesson.id}`}
        />
      </Form>
      <div
        className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-2.5 sm:flex-row sm:items-center sm:justify-between"
        data-cy={`tna-course-lesson-section-edit-footer-${lesson.id}`}
      >
        <Button
          type="primary"
          size="middle"
          className="w-full !font-normal sm:w-auto"
          onClick={onAddCourseMaterial}
          data-cy={`tna-course-lesson-section-add-course-material-${lesson.id}`}
        >
          Add Course Material
        </Button>
        <div
          className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end"
          data-cy={`tna-course-lesson-section-edit-actions-${lesson.id}`}
        >
          <Button
            size="middle"
            className="w-full !border-[#D9D9D9] !font-normal !text-black/70 hover:!border-[#D9D9D9] hover:!text-black/70 sm:w-auto"
            onClick={onCancel}
            disabled={isSaving}
            data-cy={`tna-course-lesson-section-edit-cancel-${lesson.id}`}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            size="middle"
            className="w-full !font-normal sm:w-auto"
            loading={isSaving}
            onClick={handleSave}
            data-cy={`tna-course-lesson-section-edit-save-${lesson.id}`}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LessonSectionInlineEdit;
