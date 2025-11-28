import React from 'react';
import { Avatar } from 'antd';
import { PlanSummary } from './types';

interface CommentsSectionProps {
  commentCount: number;
  commentAvatars: string[];
}

export default function CommentsSection({
  commentCount,
  commentAvatars,
}: CommentsSectionProps) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <Avatar.Group size="small" maxCount={3}>
        {commentAvatars.map((avatar, index) => (
          <Avatar key={`avatar-${index}`} src={avatar} size={28} />
        ))}
      </Avatar.Group>
      <span className="text-sm font-semibold text-[#1F213A]">
        {commentCount} Comments
      </span>
    </div>
  );
}

