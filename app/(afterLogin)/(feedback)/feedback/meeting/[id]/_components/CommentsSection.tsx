// components/MeetingDetail/CommentsSection.tsx
import { Avatar, Tooltip } from 'antd';
import { useState } from 'react';
import CommentComponent from './Comments';

export default function CommentsSection() {
  const [showComments, setShowComments] = useState(false);
  function handleOpenCloseComment() {
    setShowComments(!showComments);
  }
  return (
    <div className=" p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Avatar.Group maxCount={3}>
          <Tooltip>
            <Avatar>{'S'}</Avatar>
          </Tooltip>
          <Tooltip>
            <Avatar>{'A'}</Avatar>
          </Tooltip>
          <Tooltip>
            <Avatar>{'C'}</Avatar>
          </Tooltip>
        </Avatar.Group>
        <span
          onClick={() => handleOpenCloseComment()}
          className="font-semibold text-gray-800 cursor-pointer"
        >
          10 Comments
        </span>
      </div>
      {showComments && <CommentComponent />}
      {/* <Input.TextArea rows={3} placeholder="[[Comment by the person]]" /> */}
    </div>
  );
}
