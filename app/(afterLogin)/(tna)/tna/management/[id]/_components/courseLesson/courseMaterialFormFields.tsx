'use client';

import TextEditor from '@/components/form/textEditor';
import CustomUpload from '@/components/form/customUpload';
import { InboxOutlined } from '@ant-design/icons';
import { Form, Input, InputNumber } from 'antd';
import type { FormItemProps } from 'antd';
import type { Rule } from 'antd/es/form';
import { type FC, type ReactNode } from 'react';

export const MATERIAL_DESCRIPTION_ROWS = 6;

const titleInputClass =
  'control !h-[40px] min-h-[40px] py-0 leading-normal !font-normal';

const descriptionTextareaClass = 'control-tarea resize-y !font-normal';

/** Align with lesson fields: `.form-item` uses semibold in globals. */
const materialFormItemWeightClass =
  '[&_.ant-form-item-label>label]:!font-normal [&_.ant-form-item-control]:!font-normal';

const mergeItemClass = (base?: string) =>
  [base, materialFormItemWeightClass].filter(Boolean).join(' ');

const fileListFromEvent = (e: unknown) =>
  Array.isArray(e) ? e : (e as { fileList?: unknown })?.fileList;

export const courseMaterialTimeValidationRules: Rule[] = [
  { required: true, message: 'Required' },
  {
    validator: async (rule, value) => {
      void rule;
      if (value === undefined || value === null) {
        return Promise.resolve();
      }
      const s = String(value).trim();
      if (s === '') {
        return Promise.resolve();
      }
      const n = Number(s);
      if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
        return Promise.reject(new Error('Enter at least 1 whole minute'));
      }
      return Promise.resolve();
    },
  },
];

export interface CourseMaterialTitleFormItemProps {
  itemDataCy: string;
  formItemClassName?: string;
  formItemProps?: Partial<FormItemProps>;
  inputClassName?: string;
  inputId?: string;
  inputDataCy?: string;
}

export const CourseMaterialTitleFormItem: FC<
  CourseMaterialTitleFormItemProps
> = ({
  itemDataCy,
  formItemClassName,
  formItemProps,
  inputClassName,
  inputId,
  inputDataCy,
}) => (
  <Form.Item
    {...formItemProps}
    name="title"
    label="Course Material Title"
    rules={[{ required: true, message: 'Required' }]}
    className={mergeItemClass(formItemClassName)}
    data-cy={itemDataCy}
  >
    <Input
      id={inputId}
      className={inputClassName ?? titleInputClass}
      data-cy={inputDataCy}
    />
  </Form.Item>
);

export interface CourseMaterialDescriptionFormItemProps {
  itemDataCy: string;
  /** Wizard: "Description"; drawer historically: "Lesson Description" */
  label?: string;
  formItemClassName?: string;
  formItemProps?: Partial<FormItemProps>;
  placeholder?: string;
  inputId?: string;
  inputDataCy?: string;
}

export const CourseMaterialDescriptionFormItem: FC<
  CourseMaterialDescriptionFormItemProps
> = ({
  itemDataCy,
  label = 'Description',
  formItemClassName,
  formItemProps,
  placeholder,
  inputId,
  inputDataCy,
}) => (
  <Form.Item
    {...formItemProps}
    name="description"
    label={label}
    rules={[{ required: true, message: 'Required' }]}
    className={mergeItemClass(formItemClassName)}
    data-cy={itemDataCy}
  >
    <Input.TextArea
      id={inputId}
      rows={MATERIAL_DESCRIPTION_ROWS}
      placeholder={placeholder}
      className={descriptionTextareaClass}
      data-cy={inputDataCy}
    />
  </Form.Item>
);

export interface CourseMaterialTimeFormItemProps {
  itemDataCy: string;
  /** Wizard: native `Input type="number"` (matches `getFieldsValue` parsing). Drawer: `InputNumber`. */
  variant: 'native' | 'inputNumber';
  rules?: Rule[];
  label?: string;
  formItemClassName?: string;
  formItemProps?: Partial<FormItemProps>;
  nativeInputPlaceholder?: string;
  nativeInputClassName?: string;
  inputNumberClassName?: string;
  inputNumberId?: string;
  inputNumberDataCy?: string;
  inputNumberMin?: number;
}

export const CourseMaterialTimeFormItem: FC<
  CourseMaterialTimeFormItemProps
> = ({
  itemDataCy,
  variant,
  rules,
  label = 'Estimated Time to Finish',
  formItemClassName,
  formItemProps,
  nativeInputPlaceholder = 'Enter estimated time',
  nativeInputClassName = 'control w-full !h-[40px] min-h-[40px] py-0 leading-normal !font-normal',
  inputNumberClassName = 'control-number w-full max-w-full',
  inputNumberId,
  inputNumberDataCy,
  inputNumberMin = 1,
}) => (
  <Form.Item
    {...formItemProps}
    name="timeToFinishMinutes"
    label={label}
    rules={rules}
    className={mergeItemClass(formItemClassName)}
    data-cy={itemDataCy}
  >
    {variant === 'native' ? (
      <Input
        type="number"
        min={inputNumberMin ?? 1}
        step={1}
        inputMode="numeric"
        placeholder={nativeInputPlaceholder}
        className={nativeInputClassName}
      />
    ) : (
      <InputNumber
        id={inputNumberId}
        className={inputNumberClassName}
        placeholder={nativeInputPlaceholder}
        min={inputNumberMin}
        data-cy={inputNumberDataCy}
      />
    )}
  </Form.Item>
);

export interface CourseMaterialArticleFormItemProps {
  itemDataCy: string;
  /** Wizard: "Article Name"; drawer: "Article" */
  label?: string;
  formItemClassName?: string;
  formItemProps?: Partial<FormItemProps>;
  editorPlaceholder?: string;
  editorClassName?: string;
  editorDataCy: string;
}

export const CourseMaterialArticleFormItem: FC<
  CourseMaterialArticleFormItemProps
> = ({
  itemDataCy,
  label = 'Article Name',
  formItemClassName,
  formItemProps,
  editorPlaceholder = 'Enter the article',
  editorClassName = 'mt-3',
  editorDataCy,
}) => (
  <Form.Item
    {...formItemProps}
    name="article"
    label={label}
    rules={[{ required: true, message: 'Required' }]}
    className={mergeItemClass(formItemClassName)}
    data-cy={itemDataCy}
  >
    <TextEditor
      className={editorClassName}
      placeholder={editorPlaceholder}
      data-cy={editorDataCy}
    />
  </Form.Item>
);

export interface CourseMaterialVideosFormItemProps {
  itemDataCy: string;
  formItemClassName?: string;
  formItemProps?: Partial<FormItemProps>;
  uploadClassName: string;
  uploadTitle: string;
  uploadSubtitle?: string;
  uploadLinkPlaceholder?: string;
  uploadDataCy: string;
  uploadId?: string;
  uploadIcon?: ReactNode;
  accept?: string;
}

export const CourseMaterialVideosFormItem: FC<
  CourseMaterialVideosFormItemProps
> = ({
  itemDataCy,
  formItemClassName,
  formItemProps,
  uploadClassName,
  uploadTitle,
  uploadSubtitle,
  uploadLinkPlaceholder = 'Link',
  uploadDataCy,
  uploadId,
  uploadIcon,
  accept = 'video/*',
}) => (
  <Form.Item
    {...formItemProps}
    name="videos"
    label="Videos"
    valuePropName="fileList"
    rules={[{ required: true, message: 'Required' }]}
    getValueFromEvent={fileListFromEvent}
    className={mergeItemClass(formItemClassName)}
    data-cy={itemDataCy}
  >
    <CustomUpload
      id={uploadId}
      mode="dragWithLinkStacked"
      className={uploadClassName}
      listType="picture"
      icon={uploadIcon}
      title={uploadTitle}
      subtitle={uploadSubtitle}
      linkPlaceholder={uploadLinkPlaceholder}
      accept={accept}
      maxCount={10}
      targetState="fileList"
      uploadType="video"
      data-cy={uploadDataCy}
    />
  </Form.Item>
);

export interface CourseMaterialAttachmentsFormItemProps {
  itemDataCy: string;
  label?: string;
  formItemClassName?: string;
  formItemProps?: Partial<FormItemProps>;
  uploadClassName: string;
  uploadTitle: string;
  uploadSubtitle?: string;
  uploadLinkPlaceholder?: string;
  uploadDataCy: string;
  uploadId?: string;
  uploadIcon?: ReactNode;
  accept?: string;
}

export const CourseMaterialAttachmentsFormItem: FC<
  CourseMaterialAttachmentsFormItemProps
> = ({
  itemDataCy,
  label = 'Attachments',
  formItemClassName,
  formItemProps,
  uploadClassName,
  uploadTitle,
  uploadSubtitle,
  uploadLinkPlaceholder = 'Link',
  uploadDataCy,
  uploadId,
  uploadIcon,
  accept,
}) => (
  <Form.Item
    {...formItemProps}
    name="attachments"
    label={label}
    valuePropName="fileList"
    rules={[{ required: true, message: 'Required' }]}
    getValueFromEvent={fileListFromEvent}
    className={mergeItemClass(formItemClassName)}
    data-cy={itemDataCy}
  >
    <CustomUpload
      id={uploadId}
      mode="dragWithLinkStacked"
      className={uploadClassName}
      listType="picture"
      icon={uploadIcon}
      title={uploadTitle}
      subtitle={uploadSubtitle}
      linkPlaceholder={uploadLinkPlaceholder}
      maxCount={10}
      targetState="fileAttachmentList"
      uploadType="attachment"
      data-cy={uploadDataCy}
      accept={accept}
    />
  </Form.Item>
);

export const courseMaterialVideoUploadIcon = (
  <InboxOutlined style={{ fontSize: 40 }} />
);
