import { Button, Input, Upload } from 'antd';
import { ImAttachment } from 'react-icons/im';

const CommentInput = () => {
  return (
    <div className="border rounded-lg border-gray-200 p-4 mt-6">
      <Input.TextArea
        variant="borderless"
        placeholder="Comment"
        className="w-full"
        autoSize={{ minRows: 2, maxRows: 6 }}
      />
      <div className="border-b border-gray-200 mb-3"></div>
      <div className="flex justify-between">
        <Upload className="felx-1">
          <Button
            icon={<ImAttachment size={20} />}
            type="primary"
            className="bg-transparent text-gray-500 shadow-none"
          />
        </Upload>
        <Button type="primary">Comment</Button>
      </div>
    </div>
  );
};

export default CommentInput;
