import { Button, Form, Input, Upload } from 'antd';
import { ImAttachment } from 'react-icons/im';
import { CommonObject } from '@/types/commons/commonObject';
import { FC } from 'react';

interface CommentInputProps {
  onChange: (value: CommonObject) => void;
}

const CommentInput: FC<CommentInputProps> = ({ onChange }) => {
  const [form] = Form.useForm();

  return (
    <div className="border rounded-lg border-gray-200 p-4 mt-6">
      <Form
        form={form}
        onFieldsChange={() => {
          onChange(form.getFieldsValue());
        }}
      >
        <Form.Item name="comment">
          <Input.TextArea
            variant="borderless"
            placeholder="Comment"
            className="w-full"
            autoSize={{ minRows: 2, maxRows: 6 }}
          />
        </Form.Item>
        <div className="border-b border-gray-200 mb-3"></div>
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
