'use client';
import { Button, Form, Upload } from 'antd';
import { ImAttachment } from 'react-icons/im';
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
    <div className="border rounded-lg border-gray-200 p-4 mt-6">
      <Form
        form={form}
        onFieldsChange={() => {
          onChange(form.getFieldsValue());
        }}
      >
        <Form.Item name="comment">
          <QuillEditor modules={{ toolbar }} />
        </Form.Item>
        <div className="border-b border-gray-200 mb-3"></div>
        <div id="inputToolbar" className="border-0">
          <button type="button" className="ql-bold"></button>
          <button type="button" className="ql-italic"></button>
          <button type="button" className="ql-link"></button>
        </div>
      </Form>
    </div>
  );
};

export default CommentInput;
