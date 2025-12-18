'use client';
import { Form } from 'antd';
import { CommonObject } from '@/types/commons/commonObject';
import { FC } from 'react';

import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';
const QuillEditor = dynamic(() => import('react-quill'), { ssr: false });

interface CommentInputProps {
  onChange: (value: CommonObject) => void;
}

const CommentInput: FC<CommentInputProps> = ({ onChange }) => {
  const [form] = Form.useForm();

  const toolbar = { container: '#inputToolbar' };

  return (
    <div
      className="border rounded-lg border-gray-200 p-4 mt-6"
      id="time-attendance-leave-management-comment-input-container"
      data-cy="time-attendance-leave-management-comment-input-container"
    >
      <Form
        form={form}
        onFieldsChange={() => {
          onChange(form.getFieldsValue());
        }}
        id="time-attendance-leave-management-comment-input-form"
        data-cy="time-attendance-leave-management-comment-input-form"
      >
        <Form.Item
          id="commentSectionId"
          name="comment"
          data-cy="time-attendance-leave-management-comment-input-editor-item"
        >
          <QuillEditor
            modules={{ toolbar }}
            id="time-attendance-leave-management-comment-input-editor"
            data-cy="time-attendance-leave-management-comment-input-editor"
          />
        </Form.Item>
        <div
          className="border-b border-gray-200 mb-3"
          id="time-attendance-leave-management-comment-input-divider"
          data-cy="time-attendance-leave-management-comment-input-divider"
        ></div>
        <div
          id="inputToolbar"
          className="border-0"
          data-cy="time-attendance-leave-management-comment-input-toolbar"
        >
          <button
            id="qlBoldId"
            data-cy="time-attendance-leave-management-comment-input-toolbar-bold-button"
            type="button"
            className="ql-bold"
          ></button>
          <button
            id="qlItallicId"
            data-cy="time-attendance-leave-management-comment-input-toolbar-italic-button"
            type="button"
            className="ql-italic"
          ></button>
          <button
            id="qlLinkId"
            data-cy="time-attendance-leave-management-comment-input-toolbar-link-button"
            type="button"
            className="ql-link"
          ></button>
        </div>
      </Form>
    </div>
  );
};

export default CommentInput;
