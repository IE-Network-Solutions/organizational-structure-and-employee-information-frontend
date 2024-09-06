import { Avatar, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { LuFileText } from 'react-icons/lu';
import { FC } from 'react';

interface CommentCardProps {
  text: string;
  attachments?: any[];
}

const CommentCard: FC<CommentCardProps> = ({ text, attachments }) => {
  return (
    <div className="flex gap-4">
      <Avatar icon={<UserOutlined />} size={40} />
      <div>
        <div className="flex items-center text-sm gap-1.5">
          <span className="text-gray-900 font-bold">Caleb Abreham</span>
          <span className="text-gray-500">Commented</span>
        </div>
        <div className="text-xs text-gray-800 leading-5">{text}</div>
        <div className="flex flex-wrap items-center gap-1 mt-2">
          {attachments &&
            attachments.map((item) => (
              <Button
                key={item}
                icon={<LuFileText size={14} />}
                type="text"
                className="py-1 pl-0 pr-4 text-[10px] font-bold text-gray-900"
              >
                File.pdf
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CommentCard;
