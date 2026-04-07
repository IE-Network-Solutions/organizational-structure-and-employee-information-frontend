'use client';

import { Form, Input } from 'antd';
import type { FormItemProps } from 'antd';
import type { NamePath } from 'antd/es/form/interface';
import { type FC } from 'react';

export const LESSON_FORM_TITLE_PLACEHOLDER = 'Lesson title';
export const LESSON_FORM_DESCRIPTION_PLACEHOLDER = 'Description';
export const LESSON_DESCRIPTION_ROWS = 6;

const titleInputClass =
  'control !h-[40px] min-h-[40px] py-0 leading-normal !font-normal';

const descriptionTextareaClass = 'control-tarea resize-y !font-normal';

/** `.form-item` in globals uses `font-semibold`; normalize label + control text for lesson fields. */
const lessonFormItemWeightClass =
  '[&_.ant-form-item-label>label]:!font-normal [&_.ant-form-item-control]:!font-normal';

const requiredTitle = [{ required: true, message: 'Required' }];
const requiredDescription = [{ required: true, message: 'Required' }];

export interface LessonTitleFormItemProps {
  name?: NamePath;
  className?: string;
  /** `data-cy` on Form.Item */
  itemDataCy: string;
  /** `data-cy` on Input */
  inputDataCy: string;
  inputId?: string;
  /** Spread `{...restField}` from antd `Form.List` children render */
  formListRest?: Partial<FormItemProps>;
}

export const LessonTitleFormItem: FC<LessonTitleFormItemProps> = ({
  name = 'title',
  className = 'form-item',
  itemDataCy,
  inputDataCy,
  inputId,
  formListRest,
}) => (
  <Form.Item
    {...formListRest}
    name={name}
    label="Lesson title"
    rules={requiredTitle}
    className={[className, lessonFormItemWeightClass].filter(Boolean).join(' ')}
    data-cy={itemDataCy}
  >
    <Input
      id={inputId}
      className={titleInputClass}
      placeholder={LESSON_FORM_TITLE_PLACEHOLDER}
      data-cy={inputDataCy}
    />
  </Form.Item>
);

export interface LessonDescriptionFormItemProps {
  name?: NamePath;
  className?: string;
  itemDataCy: string;
  inputDataCy: string;
  inputId?: string;
  formListRest?: Partial<FormItemProps>;
}

export const LessonDescriptionFormItem: FC<LessonDescriptionFormItemProps> = ({
  name = 'description',
  className = 'form-item',
  itemDataCy,
  inputDataCy,
  inputId,
  formListRest,
}) => (
  <Form.Item
    {...formListRest}
    name={name}
    label="Description"
    rules={requiredDescription}
    className={[className, lessonFormItemWeightClass].filter(Boolean).join(' ')}
    data-cy={itemDataCy}
  >
    <Input.TextArea
      id={inputId}
      rows={LESSON_DESCRIPTION_ROWS}
      placeholder={LESSON_FORM_DESCRIPTION_PLACEHOLDER}
      className={descriptionTextareaClass}
      data-cy={inputDataCy}
    />
  </Form.Item>
);

export interface LessonTitleDescriptionFormItemsProps {
  titleName?: NamePath;
  descriptionName?: NamePath;
  /** Prefix for default `data-cy` values when overrides are omitted */
  dataCyPrefix: string;
  titleItemDataCy?: string;
  titleInputDataCy?: string;
  descriptionItemDataCy?: string;
  descriptionInputDataCy?: string;
  titleInputId?: string;
  descriptionInputId?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

/** Lesson title + description `Form.Item`s (flat or nested names for `Form.List`). */
export const LessonTitleDescriptionFormItems: FC<
  LessonTitleDescriptionFormItemsProps
> = ({
  titleName = 'title',
  descriptionName = 'description',
  dataCyPrefix,
  titleItemDataCy,
  titleInputDataCy,
  descriptionItemDataCy,
  descriptionInputDataCy,
  titleInputId,
  descriptionInputId,
  titleClassName,
  descriptionClassName,
}) => (
  <>
    <LessonTitleFormItem
      name={titleName}
      className={titleClassName ?? 'form-item'}
      itemDataCy={titleItemDataCy ?? `${dataCyPrefix}-title`}
      inputDataCy={titleInputDataCy ?? `${dataCyPrefix}-title-input`}
      inputId={titleInputId}
    />
    <LessonDescriptionFormItem
      name={descriptionName}
      className={descriptionClassName ?? 'form-item'}
      itemDataCy={descriptionItemDataCy ?? `${dataCyPrefix}-description`}
      inputDataCy={
        descriptionInputDataCy ?? `${dataCyPrefix}-description-input`
      }
      inputId={descriptionInputId}
    />
  </>
);
