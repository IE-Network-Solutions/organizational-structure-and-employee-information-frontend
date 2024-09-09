import { Button, Form, Upload } from 'antd';
import { ImAttachment } from 'react-icons/im';
import { CommonObject } from '@/types/commons/commonObject';
import { FC } from 'react';

// import 'react-quill/dist/quill.snow.css';
// import ReactQuill from 'react-quill';

interface CommentInputProps {
  onChange: (value: CommonObject) => void;
}

const CommentInput: FC<CommentInputProps> = ({ onChange }) => {
  const [form] = Form.useForm();

  // const toolbar = { container: '#inputToolbar' };

  return (
    <div className="border rounded-lg border-gray-200 p-4 mt-6">
      <Form
        form={form}
        onFieldsChange={() => {
          onChange(form.getFieldsValue());
        }}
      >
        <Form.Item name="comment">
          {/*<ReactQuill modules={{ toolbar }} />*/}
        </Form.Item>
        <div className="border-b border-gray-200 mb-3"></div>
        <div id="inputToolbar" className="border-0">
          <button type="button" className="ql-bold"></button>
          <button type="button" className="ql-italic"></button>
          <button type="button" className="ql-link"></button>
        </div>
        <div className="flex justify-between">
          <Form.Item name="commentAttachment" valuePropName="fileList">
            <Upload className="felx-1">
              <Button
                icon={<ImAttachment size={20} />}
                type="primary"
                className="bg-transparent text-gray-500 shadow-none"
              />
            </Upload>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default CommentInput;
