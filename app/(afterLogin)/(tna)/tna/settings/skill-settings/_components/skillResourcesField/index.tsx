'use client';

import React, { useState } from 'react';
import { Button, Form, Input, Progress, Select, Upload } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  InboxOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { LuFileText, LuPlus, LuX } from 'react-icons/lu';
import { uploadFileWithProgress } from '@/utils/fileUpload';
import {
  GrowthPlanSkillResource,
  parseYouTubeId,
} from '@/types/tna/growthPlan';

export interface CourseOption {
  value: string;
  label: string;
}

type ResourceType = 'link' | 'youtube' | 'document' | 'course';

/** One resource row as the form holds it. */
export interface ResourceFormValue {
  title?: string;
  type?: ResourceType;
  url?: string;
  courseId?: string;
}

const RESOURCE_TYPE_OPTIONS: Array<{ value: ResourceType; label: string }> = [
  { value: 'link', label: 'Link' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'document', label: 'Document' },
  { value: 'course', label: 'TNA course' },
];

const DOCUMENT_ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv';

type FieldPath = Array<string | number>;

const getIn = (source: any, path: FieldPath) =>
  path.reduce((value, key) => value?.[key], source);

/**
 * Turns the form's resource rows into skill resources for saving. Incomplete
 * rows are dropped; `existing` keeps the ids of resources being edited.
 */
export const toSkillResources = (
  rows: ResourceFormValue[] | undefined,
  courseOptions: CourseOption[],
  existing?: GrowthPlanSkillResource[],
): GrowthPlanSkillResource[] =>
  (rows ?? [])
    .map((row, index): GrowthPlanSkillResource | null => {
      const id = existing?.[index]?.id ?? `res-${Date.now()}-${index}`;
      const type: ResourceType = row?.type || 'link';

      if (type === 'course') {
        if (!row.courseId) return null;
        const course = courseOptions.find((c) => c.value === row.courseId);
        const title = row.title?.trim() || course?.label || 'TNA course';
        return {
          id,
          title,
          type: 'course',
          url: `/tna/management/${row.courseId}`,
          courseId: row.courseId,
          courseName: course?.label ?? title,
          videoId: null,
        };
      }

      if (!row?.title?.trim() || !row?.url?.trim()) return null;
      const url = row.url.trim();
      return {
        id,
        title: row.title.trim(),
        type,
        url,
        videoId: type === 'youtube' ? parseYouTubeId(url) : null,
        courseId: null,
        courseName: null,
      };
    })
    .filter((resource): resource is GrowthPlanSkillResource => !!resource);

/**
 * Editable list of a skill's recommended learning: links, YouTube videos,
 * uploaded documents and TNA courses.
 *
 * `listName` is the list's name relative to any enclosing Form.List (what
 * Form.List needs); `path` is its absolute path in the form (what
 * getFieldValue/setFieldValue need). At the top level both are
 * `['resources']`; nested under a skills list they differ.
 */
const SkillResourcesField = ({
  listName,
  path,
  courseOptions,
  dataCyPrefix = 'tna-skill-resource',
}: {
  listName: FieldPath;
  path: FieldPath;
  courseOptions: CourseOption[];
  dataCyPrefix?: string;
}) => {
  const form = Form.useFormInstance();

  return (
    <Form.List name={listName}>
      {(fields, { add, remove }) => (
        <div data-cy={`${dataCyPrefix}-list`} className="flex flex-col gap-3">
          {fields.map(({ key, name, ...restField }) => {
            const rowPath = [...path, name];

            return (
              <div
                data-cy={`${dataCyPrefix}-row-${key}`}
                key={key}
                className="rounded-[8px] border border-[#E5E7EB] p-3"
              >
                <div
                  data-cy={`${dataCyPrefix}-row-header-${key}`}
                  className="mb-2 flex items-start justify-between gap-2"
                >
                  <Form.Item
                    {...restField}
                    name={[name, 'type']}
                    label="Type"
                    initialValue="link"
                    className="mb-2 w-40"
                  >
                    <Select
                      options={RESOURCE_TYPE_OPTIONS}
                      // A URL, file or course left over from the previous
                      // type would be saved under the new one.
                      onChange={() => {
                        form.setFieldValue([...rowPath, 'url'], '');
                        form.setFieldValue([...rowPath, 'courseId'], undefined);
                      }}
                      data-cy={`${dataCyPrefix}-type-${key}`}
                    />
                  </Form.Item>
                  <button
                    data-cy={`${dataCyPrefix}-remove-${key}`}
                    type="button"
                    className="mt-7 flex h-8 w-8 cursor-pointer items-center justify-center border-none bg-transparent text-[#8c8c8c] hover:text-red-500"
                    onClick={() => remove(name)}
                    aria-label="Remove resource"
                  >
                    <MinusCircleOutlined />
                  </button>
                </div>
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, next) =>
                    getIn(prev, [...rowPath, 'type']) !==
                    getIn(next, [...rowPath, 'type'])
                  }
                >
                  {({ getFieldValue, setFieldValue }) => {
                    const type = getFieldValue([...rowPath, 'type']);

                    if (type === 'course') {
                      return (
                        <>
                          <Form.Item
                            {...restField}
                            name={[name, 'courseId']}
                            label="TNA course"
                            className="mb-2"
                            rules={[
                              { required: true, message: 'Select a course' },
                            ]}
                          >
                            <Select
                              showSearch
                              optionFilterProp="label"
                              placeholder="Search courses"
                              options={courseOptions}
                              onChange={(courseId) => {
                                const course = courseOptions.find(
                                  (c) => c.value === courseId,
                                );
                                if (course) {
                                  setFieldValue(
                                    [...rowPath, 'title'],
                                    course.label,
                                  );
                                  setFieldValue(
                                    [...rowPath, 'url'],
                                    `/tna/management/${courseId}`,
                                  );
                                }
                              }}
                              data-cy={`${dataCyPrefix}-course-${key}`}
                            />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'title']}
                            label="Display title"
                            className="mb-0"
                          >
                            <Input placeholder="Optional display title" />
                          </Form.Item>
                          <Form.Item {...restField} name={[name, 'url']} hidden>
                            <Input />
                          </Form.Item>
                        </>
                      );
                    }

                    return (
                      <>
                        <Form.Item
                          {...restField}
                          name={[name, 'title']}
                          label="Title"
                          className="mb-2"
                          rules={[{ required: true, message: 'Required' }]}
                        >
                          <Input placeholder="Resource title" />
                        </Form.Item>
                        {type === 'document' ? (
                          <Form.Item
                            {...restField}
                            name={[name, 'url']}
                            label="Attachment"
                            className="mb-0"
                            rules={[
                              { required: true, message: 'Attach a document' },
                            ]}
                          >
                            <ResourceDocumentField
                              data-cy={`${dataCyPrefix}-document-${key}`}
                              onUploaded={(fileName) => {
                                if (
                                  !getFieldValue([...rowPath, 'title'])?.trim()
                                ) {
                                  setFieldValue(
                                    [...rowPath, 'title'],
                                    fileName,
                                  );
                                }
                              }}
                            />
                          </Form.Item>
                        ) : (
                          <Form.Item
                            {...restField}
                            name={[name, 'url']}
                            label="URL"
                            className="mb-0"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Input placeholder="https://…" />
                          </Form.Item>
                        )}
                      </>
                    );
                  }}
                </Form.Item>
              </div>
            );
          })}
          <Button
            type="dashed"
            onClick={() => add({ type: 'link', title: '', url: '' })}
            icon={<LuPlus />}
            className="w-full"
            data-cy={`${dataCyPrefix}-add`}
          >
            Add resource
          </Button>
        </div>
      )}
    </Form.List>
  );
};

/** Last path segment of a stored file URL, for display. */
const fileNameFromUrl = (url: string): string => {
  try {
    const segment = new URL(url).pathname.split('/').filter(Boolean).pop();
    return segment ? decodeURIComponent(segment) : url;
  } catch {
    return url;
  }
};

const formatSize = (bytes?: number): string => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

type UploadState =
  | { status: 'idle' }
  | { status: 'uploading'; file: File; percent: number }
  | { status: 'done'; file: File }
  | { status: 'error'; file: File; message: string };

const uploadErrorMessage = (error: unknown): string => {
  const status = (error as any)?.response?.status;
  if (status === 413) return 'The file is too large for the file server.';
  if (error instanceof Error && error.message === 'Network Error') {
    return 'Could not reach the file server. Check your connection.';
  }
  return error instanceof Error && error.message
    ? error.message
    : 'Upload failed. Please try again.';
};

/**
 * Attachment uploader for a Document resource: drop zone → file card with
 * live progress → uploaded / failed. The file goes to the shared file server
 * and the stored file's URL becomes the form value, so saving the skill sends
 * it like any other resource URL.
 */
const ResourceDocumentField = ({
  value,
  onChange,
  onUploaded,
  'data-cy': dataCy,
}: {
  value?: string;
  onChange?: (url: string) => void;
  onUploaded?: (fileName: string) => void;
  'data-cy'?: string;
}) => {
  const [state, setState] = useState<UploadState>({ status: 'idle' });

  const upload = async (file: File) => {
    setState({ status: 'uploading', file, percent: 0 });
    try {
      const url = await uploadFileWithProgress(file, (percent) =>
        setState((prev) =>
          prev.status === 'uploading' && prev.file === file
            ? { ...prev, percent }
            : prev,
        ),
      );
      setState({ status: 'done', file });
      onChange?.(url);
      onUploaded?.(file.name);
    } catch (error) {
      setState({ status: 'error', file, message: uploadErrorMessage(error) });
    }
  };

  /** Hand the picked file to `upload`; antd itself never posts anything. */
  const pick = (file: File) => {
    void upload(file);
    return Upload.LIST_IGNORE;
  };

  const clear = () => {
    setState({ status: 'idle' });
    onChange?.('');
  };

  if (state.status === 'uploading') {
    return (
      <div
        data-cy={`${dataCy}-uploading`}
        className="rounded-[8px] border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2.5"
      >
        <div
          data-cy={`${dataCy}-uploading-header`}
          className="flex items-center gap-2 text-xs"
        >
          <LuFileText className="shrink-0 text-base text-[#1E40AF]" />
          <span
            data-cy={`${dataCy}-uploading-name`}
            className="min-w-0 flex-1 truncate font-medium text-[#262626]"
          >
            {state.file.name}
          </span>
          <span
            data-cy={`${dataCy}-uploading-size`}
            className="shrink-0 text-[#8c8c8c]"
          >
            {formatSize(state.file.size)}
          </span>
        </div>
        <Progress
          percent={state.percent}
          size="small"
          strokeColor="#1E40AF"
          status="active"
          className="mb-0 mt-1"
          data-cy={`${dataCy}-progress`}
        />
        <div
          data-cy={`${dataCy}-uploading-label`}
          className="text-[11px] text-[#1E40AF]"
        >
          Uploading…
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div
        data-cy={`${dataCy}-error`}
        className="rounded-[8px] border border-[#FFCCC7] bg-[#FFF2F0] px-3 py-2.5"
      >
        <div
          data-cy={`${dataCy}-error-header`}
          className="flex items-center gap-2 text-xs"
        >
          <CloseCircleFilled className="shrink-0 text-[#ff4d4f]" />
          <span
            data-cy={`${dataCy}-error-name`}
            className="min-w-0 flex-1 truncate font-medium text-[#262626]"
          >
            {state.file.name}
          </span>
          <span
            data-cy={`${dataCy}-error-size`}
            className="shrink-0 text-[#8c8c8c]"
          >
            {formatSize(state.file.size)}
          </span>
        </div>
        <div
          data-cy={`${dataCy}-error-message`}
          className="mt-1 text-[11px] text-[#ff4d4f]"
          role="alert"
        >
          {state.message}
        </div>
        <div data-cy={`${dataCy}-error-actions`} className="mt-2 flex gap-2">
          <Button
            size="small"
            onClick={() => void upload(state.file)}
            data-cy={`${dataCy}-retry`}
          >
            Try again
          </Button>
          <Upload
            accept={DOCUMENT_ACCEPT}
            showUploadList={false}
            beforeUpload={pick}
          >
            <Button size="small" data-cy={`${dataCy}-choose-another`}>
              Choose another file
            </Button>
          </Upload>
        </div>
      </div>
    );
  }

  if (value) {
    const fileName =
      state.status === 'done' ? state.file.name : fileNameFromUrl(value);
    const size = state.status === 'done' ? formatSize(state.file.size) : '';

    return (
      <div
        data-cy={`${dataCy}-file`}
        className="flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 text-xs"
      >
        <LuFileText className="shrink-0 text-base text-[#1E40AF]" />
        <div data-cy={`${dataCy}-file-info`} className="min-w-0 flex-1">
          <a
            data-cy={`${dataCy}-link`}
            href={value}
            target="_blank"
            rel="noreferrer"
            className="block truncate font-medium text-[#1E40AF] hover:underline"
          >
            {fileName}
          </a>
          <span
            data-cy={`${dataCy}-file-status`}
            className="text-[11px] text-[#52c41a]"
          >
            <CheckCircleFilled className="mr-1" />
            Uploaded{size ? ` · ${size}` : ''}
          </span>
        </div>
        <Upload
          accept={DOCUMENT_ACCEPT}
          showUploadList={false}
          beforeUpload={pick}
        >
          <Button size="small" data-cy={`${dataCy}-replace`}>
            Replace
          </Button>
        </Upload>
        <button
          data-cy={`${dataCy}-remove`}
          type="button"
          aria-label="Remove document"
          onClick={clear}
          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border-none bg-transparent text-[#8c8c8c] hover:bg-red-50 hover:text-red-500"
        >
          <LuX />
        </button>
      </div>
    );
  }

  return (
    <Upload.Dragger
      accept={DOCUMENT_ACCEPT}
      multiple={false}
      showUploadList={false}
      beforeUpload={pick}
      data-cy={`${dataCy}-dropzone`}
    >
      <p data-cy={`${dataCy}-dropzone-icon`} className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p data-cy={`${dataCy}-dropzone-text`} className="ant-upload-text">
        Click or drag a document here to upload
      </p>
      <p data-cy={`${dataCy}-dropzone-hint`} className="ant-upload-hint">
        PDF, Word, PowerPoint, Excel, TXT or CSV
      </p>
    </Upload.Dragger>
  );
};

export default SkillResourcesField;
