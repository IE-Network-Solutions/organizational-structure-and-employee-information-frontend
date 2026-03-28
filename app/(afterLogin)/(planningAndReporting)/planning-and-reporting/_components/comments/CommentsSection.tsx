import React, { useState, useMemo } from 'react';
import { Avatar, Skeleton } from 'antd';
import CommentList from './commentList';
import {
  PR_BORDER,
  PR_PRIMARY,
  PR_PRIMARY_MUTED,
  PR_TEXT,
} from '../planningUiTokens';
import { CommentsData } from '@/types/okr';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';

interface CommentsSectionProps {
  commentCount: number;
  commentAvatars: string[];
  planId: string;
  isPlanCard: boolean; // true for plans, false for reports
  comments?: CommentsData[]; // Comments data from the backend
  isLoading?: boolean; // Loading state for comments
  achieved?: number; // Total points achieved (for reporting mode)
}

export default function CommentsSection({
  commentCount,
  planId,
  isPlanCard,
  comments = [],
  isLoading = false,
  achieved = 0,
}: CommentsSectionProps) {
  void achieved;
  const [showComments, setShowComments] = useState(false);
  const [showAddComment, setShowAddComment] = useState(false);
  const [resetToggle, setResetToggle] = useState(0);
  const { data: allUsers } = useGetAllUsers();

  // Get unique commenters from comments
  const uniqueCommenters = useMemo(() => {
    if (!comments || comments.length === 0) return [];

    // Get unique users who commented
    const unique = comments.filter(
      (comment, index, self) =>
        index === self.findIndex((c) => c.commentedBy === comment.commentedBy),
    );

    // Limit to 5
    return unique.slice(0, 5);
  }, [comments]);

  // Get user details for each commenter
  const getUserDetail = (userId: string) => {
    const user = allUsers?.items?.find((user: any) => user.id === userId);
    if (!user) {
      return {
        profileImage: null,
        firstName: '',
        middleName: '',
        lastName: '',
        initials: 'UU',
      };
    }

    const firstName = user.firstName || '';
    const middleName = user.middleName || '';
    const lastName = user.lastName || '';
    const initials =
      `${firstName.charAt(0)}${middleName.charAt(0)}`.toUpperCase() || 'UU';

    return {
      profileImage: user.profileImage,
      firstName,
      middleName,
      lastName,
      initials,
    };
  };

  const handleAddCommentClick = () => {
    setResetToggle((prev) => prev + 1);
    setShowAddComment(true);
    setShowComments(true); // Also show comments list when adding
  };

  const handleCommentsClick = () => {
    setShowComments(!showComments);
    if (!showComments) {
      setShowAddComment(false); // Hide add comment form when just viewing
    }
  };

  return (
    <div
      data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-div-92"
      className="mt-5 border-t pt-4"
      style={{ borderColor: PR_BORDER }}
    >
      {/* Header: Avatars | Comments Count | Add Comment Button */}
      <div
        data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-div-94"
        className="flex items-end justify-between w-full"
      >
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleCommentsClick}
          data-cy="planningandreporting-planning-and-reporting-components-comments-commentssection-tsx-div-101"
        >
          {commentCount > 0 && uniqueCommenters.length > 0 && (
            <Avatar.Group size={32} maxCount={3}>
              {uniqueCommenters.map((commentData, index) => {
                const userDetail = getUserDetail(commentData.commentedBy);
                return (
                  <Avatar
                    key={`avatar-${commentData.commentedBy}-${index}`}
                    src={userDetail.profileImage || undefined}
                    size={32}
                    style={{
                      backgroundColor: userDetail.profileImage
                        ? undefined
                        : PR_PRIMARY_MUTED,
                      color: userDetail.profileImage ? undefined : PR_PRIMARY,
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {!userDetail.profileImage && userDetail.initials}
                  </Avatar>
                );
              })}
            </Avatar.Group>
          )}
          <span
            data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-span-123"
            className="text-xs md:text-sm font-semibold"
            style={{ color: PR_TEXT }}
          >
            {commentCount} Comments
          </span>
        </div>
        <div
          data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-div-127"
          className="flex flex-col items-end gap-0.5"
        >
          <span
            onClick={handleAddCommentClick}
            className="cursor-pointer text-xs font-semibold transition-colors md:text-sm hover:opacity-90"
            style={{ color: PR_PRIMARY }}
            data-cy="planningandreporting-planning-and-reporting-components-comments-commentssection-tsx-span-160"
          >
            Add comment
          </span>
        </div>
      </div>

      {/* Comments List and Add Comment Form */}
      {showComments && (
        <div
          data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-div-163"
          className="mt-4"
        >
          {isLoading ? (
            <Skeleton
              active
              title={false}
              paragraph={{ rows: 3, width: ['100%', '80%', '60%'] }}
            />
          ) : (
            <CommentList
              data={comments || []}
              planId={planId}
              isPlanCard={isPlanCard}
              showAddForm={showAddComment}
              resetToggle={resetToggle}
              onEdit={() => setShowAddComment(true)}
              onFormSubmit={() => setShowAddComment(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
