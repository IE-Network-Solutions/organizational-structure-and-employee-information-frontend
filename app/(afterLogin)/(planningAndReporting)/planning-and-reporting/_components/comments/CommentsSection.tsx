import React, { useState, useMemo } from 'react';
import { Avatar, Skeleton } from 'antd';
import CommentList from './commentList';
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

  // Format achieved value as a proper number
  const formattedAchieved = useMemo(() => {
    const numValue = Number(achieved) || 0;
    return Math.round(numValue);
  }, [achieved]);

  return (
    <div className="mt-5">
      {/* Header: Avatars | Comments Count | Add Comment Button */}
      <div className="flex items-end justify-between w-full">
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleCommentsClick}
        >
          {commentCount > 0 && uniqueCommenters.length > 0 && (
            <Avatar.Group size={48} maxCount={5}>
              {uniqueCommenters.map((commentData, index) => {
                const userDetail = getUserDetail(commentData.commentedBy);
                return (
                  <Avatar
                    key={`avatar-${commentData.commentedBy}-${index}`}
                    src={userDetail.profileImage || undefined}
                    size={48}
                    style={{
                      backgroundColor: userDetail.profileImage
                        ? undefined
                        : '#E0E7FF',
                      color: userDetail.profileImage ? undefined : '#4C1D95',
                      fontSize: '16px',
                      fontWeight: 600,
                    }}
                  >
                    {!userDetail.profileImage && userDetail.initials}
                  </Avatar>
                );
              })}
            </Avatar.Group>
          )}
          <span className="text-xs md:text-sm font-semibold text-[#1F213A]">
            {commentCount} Comments
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          {/* Total Points Display (only for reporting mode, above Add Comment) */}
          {!isPlanCard && (
            <span className="text-[10px] md:text-xs font-normal text-[#8F94A3]">
              total point:{' '}
              <span
                className={`font-medium ${
                  formattedAchieved > 84
                    ? 'text-[#52C41A]'
                    : formattedAchieved >= 64
                      ? 'text-orange-500'
                      : 'text-red-500'
                }`}
              >
                {formattedAchieved}%
              </span>
            </span>
          )}
          <span
            onClick={handleAddCommentClick}
            className="cursor-pointer text-xs md:text-sm font-bold transition-colors"
            style={{ color: '#2563EB' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1D4ED8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#2563EB';
            }}
          >
            Add Comment
          </span>
        </div>
      </div>

      {/* Comments List and Add Comment Form */}
      {showComments && (
        <div className="mt-4">
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
