'use client';

import { CourseLesson, CourseLessonMaterial } from '@/types/tna/course';
import { FC, useCallback, useEffect, useState } from 'react';
import { Button, Form, Spin } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import { useSetCourseLessonMaterial } from '@/store/server/features/tna/lessonMaterial/mutation';
import { formatLinkToUploadFile } from '@/helpers/formatTo';
import { classNames } from '@/utils/classNames';
import {
  CourseMaterialArticleFormItem,
  CourseMaterialAttachmentsFormItem,
  CourseMaterialDescriptionFormItem,
  CourseMaterialTimeFormItem,
  CourseMaterialTitleFormItem,
  CourseMaterialVideosFormItem,
  courseMaterialTimeValidationRules,
  courseMaterialVideoUploadIcon,
} from './courseMaterialFormFields';

const STEP_LABELS = [
  'Material Details',
  'Article',
  'Video',
  'Attachments',
] as const;

interface InlineAddCourseMaterialWizardProps {
  lesson: CourseLesson;
  /** When set, the wizard updates this material (same stepper as add). */
  editingMaterial?: CourseLessonMaterial | null;
  onClose: () => void;
  /** After successful create or update; wizard is closed first. */
  onMaterialCreated?: () => void;
}

/** New inline materials sort first in the list (`LessonCard` uses ascending `order`). */
const getNewMaterialOrderForTop = (
  courseLessonMaterials: CourseLessonMaterial[],
): number => {
  if (!courseLessonMaterials.length) {
    return 0;
  }
  const minOrder = Math.min(
    ...courseLessonMaterials.map((material) => material.order),
  );
  if (minOrder > 0) {
    return minOrder / 2;
  }
  if (minOrder === 0) {
    return -1;
  }
  return minOrder - 1;
};

const InlineAddCourseMaterialWizard: FC<InlineAddCourseMaterialWizardProps> = ({
  lesson,
  editingMaterial = null,
  onClose,
  onMaterialCreated,
}) => {
  const { refetchCourse, isFileUploadLoading } =
    useTnaManagementCoursePageStore();
  const { mutate: setMaterial, isLoading } = useSetCourseLessonMaterial();
  const [form] = Form.useForm();
  const [step, setStep] = useState(0);

  useEffect(() => {
    form.resetFields();
    setStep(0);
    if (editingMaterial) {
      form.setFieldsValue({
        title: editingMaterial.title,
        description: editingMaterial.description ?? '',
        article: editingMaterial.article ?? '',
        timeToFinishMinutes: editingMaterial.timeToFinishMinutes ?? undefined,
        videos: editingMaterial.videos?.length
          ? editingMaterial.videos.map((v) => formatLinkToUploadFile(v))
          : undefined,
        attachments: editingMaterial.attachments?.length
          ? editingMaterial.attachments.map((a) => formatLinkToUploadFile(a))
          : undefined,
      });
    }
  }, [lesson.id, editingMaterial, form]);

  const handleFinish = useCallback(() => {
    // `true` = full store; unmounted steps stay out of default getFieldsValue() even with preserve.
    const values = form.getFieldsValue(true);
    const courseLessonMaterials = lesson.courseLessonMaterials ?? [];
    const title = String(values.title ?? '').trim();
    const minutesRaw = values.timeToFinishMinutes;
    const minutesStr = String(minutesRaw ?? '').trim();
    const minutesParsed = minutesStr === '' ? NaN : Number(minutesStr);
    const timeToFinishMinutes =
      Number.isFinite(minutesParsed) &&
      Number.isInteger(minutesParsed) &&
      minutesParsed >= 1
        ? minutesParsed
        : null;

    if (!title || timeToFinishMinutes === null) {
      return;
    }

    setMaterial(
      [
        {
          ...(editingMaterial ?? {}),
          title,
          description: values.description,
          article: values.article,
          timeToFinishMinutes,
          order: editingMaterial
            ? editingMaterial.order
            : getNewMaterialOrderForTop(courseLessonMaterials),
          courseLessonId: lesson.id,
          videos:
            values.videos?.map(
              (video: { response?: string }) => video.response,
            ) ?? [],
          attachments:
            values.attachments?.map((a: { response?: string }) => a.response) ??
            [],
        },
      ],
      {
        onSuccess: () => {
          onMaterialCreated?.();
          onClose();
          void refetchCourse?.();
        },
      },
    );
  }, [
    editingMaterial,
    lesson.id,
    lesson.courseLessonMaterials,
    onClose,
    onMaterialCreated,
    refetchCourse,
    setMaterial,
  ]);

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const fieldGroups: Record<number, string[]> = {
    0: ['title', 'description', 'timeToFinishMinutes'],
    1: ['article'],
    2: ['videos'],
    3: ['attachments'],
  };

  const handleContinue = async () => {
    try {
      await form.validateFields(fieldGroups[step]);
      setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
    } catch {
      /* validated */
    }
  };

  const handleCreate = async () => {
    try {
      await form.validateFields();
      handleFinish();
    } catch {
      /* validated */
    }
  };

  const isLastStep = step === STEP_LABELS.length - 1;

  const stepCount = STEP_LABELS.length;
  const lineProgressFraction =
    step >= stepCount - 1 ? 1 : (step + 0.5) / (stepCount - 1);
  /** Dot centers sit midway in each equal column; line runs between first and last center. */
  const stepTrackInsetPct = 100 / (2 * stepCount);
  const stepTrackSpanPct = (100 * (stepCount - 1)) / stepCount;

  return (
    <div
      className="mb-3 rounded-lg bg-white p-4 shadow-sm"
      data-cy={
        editingMaterial
          ? `tna-inline-edit-material-wizard-${editingMaterial.id}`
          : `tna-inline-add-material-wizard-${lesson.id}`
      }
    >
      <nav
        className="mb-6 w-full"
        aria-label="Material setup steps"
        data-cy="tna-inline-add-material-stepper"
      >
        <div
          className="relative mx-auto w-full max-w-[560px] px-1 sm:px-2"
          data-cy="tna-inline-add-material-stepper-inner"
        >
          <div
            className="pointer-events-none absolute top-[4.5px] h-[3px] rounded-full bg-[#E5E5E5] sm:top-[4.5px]"
            style={{
              left: `${stepTrackInsetPct}%`,
              width: `${stepTrackSpanPct}%`,
            }}
            aria-hidden
            data-cy="tna-inline-add-material-stepper-track-bg"
          />
          <div
            className="pointer-events-none absolute top-[4.5px] h-[3px] rounded-full bg-primary transition-[width] duration-300 ease-out sm:top-[4.5px]"
            style={{
              left: `${stepTrackInsetPct}%`,
              width: `${lineProgressFraction * stepTrackSpanPct}%`,
            }}
            aria-hidden
            data-cy="tna-inline-add-material-stepper-track-progress"
          />
          <div
            className="relative z-[1] flex w-full"
            data-cy="tna-inline-add-material-stepper-dots-row"
          >
            {STEP_LABELS.map((name, i) => {
              const canGoToStep = i <= step;
              return (
                <button
                  key={name}
                  type="button"
                  disabled={!canGoToStep}
                  aria-current={i === step ? 'step' : undefined}
                  aria-label={
                    canGoToStep
                      ? `${i === step ? 'Current step: ' : 'Go to step: '}${name}`
                      : `${name} (complete previous steps first)`
                  }
                  onClick={() => {
                    if (canGoToStep) setStep(i);
                  }}
                  className={classNames(
                    'flex min-w-0 flex-1 flex-col items-center gap-3 border-0 bg-transparent p-0 outline-none transition-opacity',
                    canGoToStep
                      ? 'cursor-pointer hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md'
                      : 'cursor-not-allowed',
                  )}
                  data-cy={`tna-inline-add-material-step-dot-${i}`}
                >
                  <span
                    className="sr-only"
                    data-cy={`tna-inline-add-material-step-sr-${i}`}
                  >
                    {`${name}${i === step ? ' (current step)' : ''}${i < step ? ', completed' : ''}`}
                  </span>
                  <div
                    className="flex h-3 shrink-0 items-center justify-center"
                    data-cy={`tna-inline-add-material-step-dot-wrap-${i}`}
                  >
                    <span
                      className={classNames(
                        'block shrink-0 rounded-full border-2 border-white transition-colors',
                        {
                          'h-3 w-3 bg-primary': i === step,
                          'h-2.5 w-2.5 bg-primary': i < step,
                          'h-2.5 w-2.5 bg-[#D9D9D9]': i > step,
                        },
                      )}
                      title={name}
                      aria-hidden
                      data-cy={`tna-inline-add-material-step-dot-visual-${i}`}
                    />
                  </div>
                  <span
                    className={classNames(
                      'w-full px-0.5 text-center text-xs leading-tight sm:text-sm',
                      {
                        'font-medium text-primary': i === step,
                        'font-normal text-primary': i < step,
                        'font-normal text-[#BFBFBF]': i > step,
                      },
                    )}
                    data-cy={`tna-inline-add-material-step-label-${i}`}
                  >
                    {name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <Form
        layout="vertical"
        form={form}
        preserve
        requiredMark={CustomLabel}
        disabled={isLoading}
        id={`tnaInlineAddMaterialForm-${lesson.id}`}
        data-cy="tna-inline-add-material-form"
      >
        {step === 0 ? (
          <>
            <CourseMaterialTitleFormItem itemDataCy="tna-inline-add-material-title" />
            <CourseMaterialDescriptionFormItem itemDataCy="tna-inline-add-material-description" />
            <CourseMaterialTimeFormItem
              itemDataCy="tna-inline-add-material-time"
              variant="native"
              rules={courseMaterialTimeValidationRules}
            />
          </>
        ) : null}

        {step === 1 ? (
          <CourseMaterialArticleFormItem
            itemDataCy="tna-inline-add-material-article"
            editorDataCy="tna-inline-add-material-article-editor"
          />
        ) : null}

        {step === 2 ? (
          <Spin spinning={!!isFileUploadLoading?.video}>
            <CourseMaterialVideosFormItem
              itemDataCy="tna-inline-add-material-video"
              uploadClassName="mt-3 w-full"
              uploadTitle="Click or drag file to this area to upload"
              uploadSubtitle="Add one or more videos via upload or link."
              uploadDataCy="tna-inline-add-material-video-upload"
              uploadIcon={courseMaterialVideoUploadIcon}
            />
          </Spin>
        ) : null}

        {step === 3 ? (
          <Spin spinning={!!isFileUploadLoading?.attachment}>
            <CourseMaterialAttachmentsFormItem
              itemDataCy="tna-inline-add-material-attachment"
              uploadClassName="mt-3 w-full"
              uploadTitle="Click or drag file to this area to upload"
              uploadSubtitle="Support for a single or bulk upload."
              uploadDataCy="tna-inline-add-material-attachment-upload"
              uploadIcon={courseMaterialVideoUploadIcon}
            />
          </Spin>
        ) : null}

        <div
          className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-2.5 sm:flex-row sm:items-center sm:justify-end"
          data-cy="tna-inline-add-material-form-footer"
        >
          <div
            className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end"
            data-cy="tna-inline-add-material-form-footer-actions"
          >
            <Button
              size="middle"
              className="w-full !border-[#D9D9D9] !font-normal !text-black/70 hover:!border-[#D9D9D9] hover:!text-black/70 sm:w-auto"
              onClick={handleCancel}
              disabled={isLoading}
              data-cy="tna-inline-add-material-cancel"
            >
              Cancel
            </Button>
            {isLastStep ? (
              <Button
                type="primary"
                size="middle"
                className="w-full !font-normal sm:w-auto"
                loading={isLoading}
                onClick={handleCreate}
                data-cy="tna-inline-add-material-create"
              >
                {editingMaterial ? 'Update' : 'Finish'}
              </Button>
            ) : (
              <Button
                type="primary"
                size="middle"
                className="w-full !font-normal sm:w-auto"
                onClick={handleContinue}
                data-cy="tna-inline-add-material-continue"
              >
                Continue
              </Button>
            )}
          </div>
        </div>
      </Form>
    </div>
  );
};

export default InlineAddCourseMaterialWizard;
