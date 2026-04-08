import React, { useState, useMemo } from 'react';
import { Avatar, Skeleton } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { GoPlus } from 'react-icons/go';
import CommentList from './commentList';
import { CommentsData } from '@/types/okr';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import dayjs from 'dayjs';

interface CommentsSectionProps {
  commentCount: number;
  commentAvatars: string[];
  planId: string;
  isPlanCard: boolean;
  comments?: CommentsData[];
  isLoading?: boolean;
  achieved?: number;
  onOpenThread?: () => void;
}

export default function CommentsSection({
  commentCount,
  planId,
  isPlanCard,
  comments = [],
  isLoading = false,
  achieved = 0,
  onOpenThread,
}: CommentsSectionProps) {
  const [showComments, setShowComments] = useState(false);
  const [showAddComment, setShowAddComment] = useState(false);
  const [resetToggle, setResetToggle] = useState(0);
  const { data: allUsers } = useGetAllUsers();

  const uniqueCommenters = useMemo(() => {
    if (!comments || comments.length === 0) return [];
    const unique = comments.filter(
      (comment, index, self) =>
        index === self.findIndex((c) => c.commentedBy === comment.commentedBy),
    );
    return unique.slice(0, 3);
  }, [comments]);

  const lastCommentTime = useMemo(() => {
    if (!comments || comments.length === 0) return '';
    const sorted = [...comments].sort(
      (a, b) => dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix(),
    );
    return dayjs(sorted[0].createdAt).format('hh:mm a');
  }, [comments]);

  const getUserDetail = (userId: string) => {
    const user = allUsers?.items?.find((user: any) => user.id === userId);
    if (!user) {
      return { profileImage: null, initials: 'UU' };
    }
    const firstName = user.firstName || '';
    const middleName = user.middleName || '';
    const initials =
      `${firstName.charAt(0)}${middleName.charAt(0)}`.toUpperCase() || 'UU';
    return { profileImage: user.profileImage, initials };
  };

  const formattedAchieved = useMemo(() => {
    const numValue = Number(achieved) || 0;
    return Math.round(numValue);
  }, [achieved]);

  if (onOpenThread) {
    return (
      <div data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-div-92">
        <div
          data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-div-72"
          className="flex items-center justify-between"
        >
          <button
            type="button"
            onClick={onOpenThread}
            className="flex items-center gap-2 rounded-lg px-2 py-1 -ml-2 transition-colors hover:bg-[#F8F7FF] group"
            data-cy="planningandreporting-planning-and-reporting-components-comments-commentssection-tsx-div-101"
          >
            {commentCount > 0 && uniqueCommenters.length > 0 && (
              <div
                data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-div-80"
                className="flex -space-x-1.5"
              >
                {uniqueCommenters.map((commentData, index) => {
                  const userDetail = getUserDetail(commentData.commentedBy);
                  return (
                    <Avatar
                      key={`avatar-${commentData.commentedBy}-${index}`}
                      src={userDetail.profileImage || undefined}
                      size={22}
                      style={{
                        backgroundColor: userDetail.profileImage
                          ? undefined
                          : '#E0E7FF',
                        color: userDetail.profileImage ? undefined : '#4C1D95',
                        fontSize: '9px',
                        fontWeight: 700,
                        border: '1.5px solid white',
                      }}
                    >
                      {!userDetail.profileImage && userDetail.initials}
                    </Avatar>
                  );
                })}
              </div>
            )}
            <div
              data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-div-104"
              className="flex items-center gap-1.5"
            >
              {commentCount === 0 && (
                <MessageOutlined className="text-[12px] text-[#B0B3C0]" />
              )}
              <span
                data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-span-108"
                className="text-[12px] font-medium text-[#574CFF] group-hover:text-[#4F46EF] transition-colors"
              >
                {commentCount > 0
                  ? `${commentCount} comment${commentCount !== 1 ? 's' : ''}`
                  : 'No comments'}
              </span>
              {commentCount > 0 && lastCommentTime && (
                <>
                  <span
                    data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-span-115"
                    className="text-[10px] text-[#D1D5DB]"
                  >
                    ·
                  </span>
                  <span
                    data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-span-116"
                    className="text-[10px] text-[#B0B3C0]"
                  >
                    Last {lastCommentTime}
                  </span>
                </>
              )}
            </div>
          </button>

          {!isPlanCard && (
            <span
              data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-span-125"
              className="text-[11px] text-[#8F94A3]"
            >
              Points:{' '}
              <span
                data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-span-150"
                className={`font-semibold ${
                  formattedAchieved > 84
                    ? 'text-[#10B981]'
                    : formattedAchieved >= 64
                      ? 'text-[#F59E0B]'
                      : 'text-[#EF4444]'
                }`}
              >
                {formattedAchieved}%
              </span>
            </span>
          )}
        </div>
      </div>
    );
  }

  const handleAddCommentClick = () => {
    setResetToggle((prev) => prev + 1);
    setShowAddComment(true);
    setShowComments(true);
  };

  const handleCommentsClick = () => {
    setShowComments(!showComments);
    if (!showComments) {
      setShowAddComment(false);
    }
  };

  return (
    <div data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-div-92">
      <div
        data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-div-160"
        className="flex items-center justify-between"
      >
        <button
          type="button"
          onClick={handleCommentsClick}
          className="flex items-center gap-2 rounded-lg px-2 py-1 -ml-2 transition-colors hover:bg-[#F8F7FF] group"
          data-cy="planningandreporting-planning-and-reporting-components-comments-commentssection-tsx-div-101"
        >
          {commentCount > 0 && uniqueCommenters.length > 0 && (
            <div
              data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-div-168"
              className="flex -space-x-1.5"
            >
              {uniqueCommenters.map((commentData, index) => {
                const userDetail = getUserDetail(commentData.commentedBy);
                return (
                  <Avatar
                    key={`avatar-${commentData.commentedBy}-${index}`}
                    src={userDetail.profileImage || undefined}
                    size={22}
                    style={{
                      backgroundColor: userDetail.profileImage
                        ? undefined
                        : '#E0E7FF',
                      color: userDetail.profileImage ? undefined : '#4C1D95',
                      fontSize: '9px',
                      fontWeight: 700,
                      border: '1.5px solid white',
                    }}
                  >
                    {!userDetail.profileImage && userDetail.initials}
                  </Avatar>
                );
              })}
            </div>
          )}
          <div
            data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-div-192"
            className="flex items-center gap-1.5"
          >
            {commentCount === 0 && (
              <MessageOutlined className="text-[12px] text-[#B0B3C0]" />
            )}
            <span
              data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-span-196"
              className="text-[12px] font-medium text-[#8F94A3] group-hover:text-[#574CFF] transition-colors"
            >
              {commentCount > 0
                ? `${commentCount} comment${commentCount !== 1 ? 's' : ''}`
                : 'No comments'}
            </span>
          </div>
        </button>

        <div
          data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-div-204"
          className="flex items-center gap-3"
        >
          {!isPlanCard && (
            <span
              data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-span-206"
              className="text-[11px] text-[#8F94A3]"
            >
              Points:{' '}
              <span
                data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-span-249"
                className={`font-semibold ${
                  formattedAchieved > 84
                    ? 'text-[#10B981]'
                    : formattedAchieved >= 64
                      ? 'text-[#F59E0B]'
                      : 'text-[#EF4444]'
                }`}
              >
                {formattedAchieved}%
              </span>
            </span>
          )}
          <button
            type="button"
            onClick={handleAddCommentClick}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-[#574CFF] transition-all hover:bg-[#574CFF]/5"
            data-cy="planningandreporting-planning-and-reporting-components-comments-commentssection-tsx-span-160"
          >
            <GoPlus className="text-sm" />
            Comment
          </button>
        </div>
      </div>

      {showComments && (
        <div
          data-cy="planning-and-reporting-components-comments-commentssection-tsx-commentssection-div-234"
          className="mt-3"
        >
          {isLoading ? (
            <Skeleton
              active
              title={false}
              paragraph={{ rows: 2, width: ['100%', '70%'] }}
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
