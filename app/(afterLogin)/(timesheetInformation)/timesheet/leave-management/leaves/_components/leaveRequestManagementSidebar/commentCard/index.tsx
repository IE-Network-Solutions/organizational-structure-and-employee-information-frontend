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
    <div
      className="flex gap-4"
      id="time-attendance-leave-management-comment-card"
      data-cy="time-attendance-leave-management-comment-card"
    >
      <Avatar
        icon={
          <UserOutlined data-cy="time-attendance-leave-management-comment-card-avatar-icon" />
        }
        size={40}
        data-cy="time-attendance-leave-management-comment-card-avatar"
      />
      <div
        id="time-attendance-leave-management-comment-card-content"
        data-cy="time-attendance-leave-management-comment-card-content"
      >
        <div
          id="time-attendance-leave-management-comment-card-author-row"
          data-cy="time-attendance-leave-management-comment-card-author-row"
          className="flex items-center text-sm gap-1.5"
        >
          <span
            className="text-gray-900 font-bold"
            id="time-attendance-leave-management-comment-card-author"
            data-cy="time-attendance-leave-management-comment-card-author"
          >
            Caleb Abreham
          </span>
          <span
            id="time-attendance-leave-management-comment-card-author-label"
            data-cy="time-attendance-leave-management-comment-card-author-label"
            className="text-gray-500"
          >
            Commented
          </span>
        </div>
        <div
          className="text-xs text-gray-800 leading-5"
          id="time-attendance-leave-management-comment-card-text"
          data-cy="time-attendance-leave-management-comment-card-text"
          dangerouslySetInnerHTML={{ __html: text }}
        ></div>
        <div
          className="flex flex-wrap items-center gap-1 mt-2"
          id="time-attendance-leave-management-comment-card-attachments"
          data-cy="time-attendance-leave-management-comment-card-attachments"
        >
          {attachments &&
            attachments.map((item, key) => (
              <Button
                key={item}
                id={`${key}filePdfAttachmentId`}
                icon={
                  <LuFileText
                    data-cy="time-attendance-leave-management-comment-card-attachment-icon"
                    size={14}
                  />
                }
                type="text"
                className="py-1 pl-0 pr-4 text-[10px] font-bold text-gray-900"
                data-cy={`time-attendance-leave-management-comment-card-attachment-${key}`}
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
