'use client';

import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import {
  useCreateCourseRating,
  useDeleteCourseRating,
  useUpdateCourseRating,
} from '@/store/server/features/tna/courseRating/mutation';
import { useGetCourseRatings } from '@/store/server/features/tna/courseRating/queries';
import { CourseRating } from '@/store/server/features/tna/courseRating/interface';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetCourseWithAssignments } from '@/store/server/features/tna/management/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import { UserOutlined } from '@ant-design/icons';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import type { MenuProps } from 'antd';
import { Avatar, Button, Dropdown, Input, Modal, Skeleton } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';

const STAR_COUNT = 5;

const formatRating = (value: number) => value.toFixed(1);

const getUserDisplayName = (
  userId: string,
  users: Array<{
    id: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
  }>,
) => {
  const user = users.find((entry) => entry.id === userId);
  if (!user) return 'User';
  return (
    `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim() ||
    'User'
  );
};

const StarDisplay = ({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) => {
  const filledCount = Math.min(STAR_COUNT, Math.max(0, Math.round(rating)));

  return (
    <div
      className="flex shrink-0 items-center gap-0.5"
      aria-hidden
      data-cy="tna-course-feedback-star-display"
    >
      {Array.from({ length: STAR_COUNT }, (notused, index) => {
        const filled = index < filledCount;
        return filled ? (
          <StarIcon
            key={index}
            sx={{ fontSize: size }}
            className="fill-[#FAAD14] text-[#FAAD14]"
          />
        ) : (
          <StarOutlineOutlinedIcon
            key={index}
            sx={{ fontSize: size }}
            className="text-[#FAAD14]"
          />
        );
      })}
    </div>
  );
};

const InteractiveStarRating = ({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}) => (
  <div
    className="flex items-center gap-0.5"
    role="radiogroup"
    aria-label="Rate this course"
    data-cy="tna-course-feedback-rate-stars"
  >
    {Array.from({ length: STAR_COUNT }, (notused, index) => {
      const starValue = index + 1;
      const filled = starValue <= value;

      return (
        <button
          key={starValue}
          type="button"
          role="radio"
          aria-checked={value === starValue}
          aria-label={`${starValue} star${starValue === 1 ? '' : 's'}`}
          className="rounded p-0.5 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => onChange(starValue)}
          disabled={disabled}
          data-cy={`tna-course-feedback-rate-star-${starValue}`}
        >
          {filled ? (
            <StarIcon
              sx={{ fontSize: 18 }}
              className="fill-[#FAAD14] text-[#FAAD14]"
            />
          ) : (
            <StarOutlineOutlinedIcon
              sx={{ fontSize: 18 }}
              className="text-[#FAAD14]"
            />
          )}
        </button>
      );
    })}
  </div>
);

const CourseFeedbacksAndRatings = () => {
  const { course, refetchCourse } = useTnaManagementCoursePageStore();
  const currentUserId = useAuthenticationStore((state) => state.userId);
  const courseId = course?.id ?? '';
  const formRef = useRef<HTMLDivElement>(null);

  const { data: reviews = [], isLoading } = useGetCourseRatings(courseId);
  const { data: courseWithAssignments } = useGetCourseWithAssignments(
    courseId,
    Boolean(courseId),
  );
  const { data: usersData } = useGetAllUsers();
  const users = usersData?.items ?? [];

  const { mutate: createRating, isLoading: isCreating } =
    useCreateCourseRating();
  const { mutate: updateRating, isLoading: isUpdating } =
    useUpdateCourseRating();
  const { mutate: deleteRating, isLoading: isDeleting } =
    useDeleteCourseRating();

  const [reviewText, setReviewText] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [isEditingOwnReview, setIsEditingOwnReview] = useState(false);

  const activeReviews = useMemo(
    () => reviews.filter((review) => !review.deletedAt),
    [reviews],
  );

  const ownRating = useMemo(
    () =>
      activeReviews.find((review) => review.userId === currentUserId) ?? null,
    [activeReviews, currentUserId],
  );

  const isAssignedToCourse = useMemo(() => {
    if (!currentUserId) return false;

    const assignmentSource = courseWithAssignments ?? course;
    if (!assignmentSource) return false;

    if (assignmentSource.userIds?.includes(currentUserId)) return true;

    return (
      assignmentSource.courseUsers?.some(
        (entry: { userId: string }) => entry.userId === currentUserId,
      ) ?? false
    );
  }, [course, courseWithAssignments, currentUserId]);

  const averageRating = useMemo(() => {
    if (course?.rating != null && Number.isFinite(course.rating)) {
      return course.rating;
    }
    if (!activeReviews.length) return null;
    const total = activeReviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / activeReviews.length) * 10) / 10;
  }, [course?.rating, activeReviews]);

  const isSaving = isCreating || isUpdating;
  const canCreateRating = isAssignedToCourse && Boolean(currentUserId);
  const showCreateForm = canCreateRating && !ownRating;
  const showEditForm = isEditingOwnReview && Boolean(ownRating);
  const showReviewForm = showCreateForm || showEditForm;

  useEffect(() => {
    if (!ownRating && !isEditingOwnReview) {
      setReviewText('');
      setSelectedRating(0);
    }
  }, [ownRating, isEditingOwnReview]);

  const refreshCourseData = () => {
    refetchCourse?.();
  };

  const handleSave = () => {
    const trimmedReview = reviewText.trim();
    if (!courseId || !trimmedReview || selectedRating < 1) return;

    if (ownRating && isEditingOwnReview) {
      updateRating(
        {
          id: ownRating.id,
          courseId,
          rating: selectedRating,
          comment: trimmedReview,
        },
        {
          onSuccess: () => {
            setIsEditingOwnReview(false);
            refreshCourseData();
          },
        },
      );
      return;
    }

    createRating(
      {
        courseId,
        rating: selectedRating,
        comment: trimmedReview,
      },
      { onSuccess: refreshCourseData },
    );
  };

  const handleStartEdit = (review: CourseRating) => {
    setReviewText(review.comment ?? '');
    setSelectedRating(review.rating ?? 0);
    setIsEditingOwnReview(true);
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  const handleDelete = (review: CourseRating) => {
    if (!courseId) return;

    Modal.confirm({
      title: 'Delete your rating?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      cancelText: 'Cancel',
      okButtonProps: { danger: true, loading: isDeleting },
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          deleteRating(
            { id: review.id, courseId },
            {
              onSuccess: () => {
                setReviewText('');
                setSelectedRating(0);
                setIsEditingOwnReview(false);
                refreshCourseData();
                resolve();
              },
              onError: () => reject(),
            },
          );
        }),
    });
  };

  const getReviewMenuItems = (): MenuProps['items'] => [
    { key: 'edit', label: 'Edit' },
    {
      key: 'delete',
      label: (
        <span
          data-cy={`tna-course-feedback-review-delete-button`}
          className="text-red-500"
        >
          Delete
        </span>
      ),
    },
  ];

  const handleReviewMenuClick = (review: CourseRating, key: string) => {
    if (key === 'edit') {
      handleStartEdit(review);
      return;
    }
    if (key === 'delete') {
      handleDelete(review);
    }
  };

  const renderReviewCard = (review: CourseRating, index: number) => {
    const isOwnReview = review.userId === currentUserId;

    return (
      <div
        key={review.id}
        className="rounded-lg bg-[#FAFAFA] p-3"
        data-cy={`tna-course-feedback-review-card-${index}`}
      >
        <div
          data-cy={`tna-course-feedback-review-container-${index}`}
          className="flex items-start gap-3"
        >
          <Avatar
            size={32}
            icon={<UserOutlined />}
            className="shrink-0 bg-[#D9D9D9] text-white"
            data-cy={`tna-course-feedback-review-avatar-${index}`}
          />
          <div
            data-cy={`tna-course-feedback-review-author-container-${index}`}
            className="min-w-0 flex-1"
          >
            <div
              data-cy={`tna-course-feedback-review-author-row-${index}`}
              className="mb-1 flex items-start justify-between gap-2"
            >
              <p
                className="text-xs font-medium text-gray-500"
                data-cy={`tna-course-feedback-review-author-${index}`}
              >
                {getUserDisplayName(review.userId, users)}
                {isOwnReview ? ' (You)' : ''}
              </p>
              {isOwnReview ? (
                <Dropdown
                  trigger={['click']}
                  placement="bottomRight"
                  menu={{
                    items: getReviewMenuItems(),
                    onClick: ({ key }) => handleReviewMenuClick(review, key),
                  }}
                  data-cy={`tna-course-feedback-review-actions-dropdown-${index}`}
                >
                  <Button
                    type="text"
                    size="small"
                    className="!h-8 !w-8 !min-w-8 shrink-0 !p-0 text-gray-500 hover:!bg-gray-200"
                    icon={<MoreHorizIcon sx={{ fontSize: 20 }} />}
                    aria-label="Review actions"
                    data-cy={`tna-course-feedback-review-actions-trigger-${index}`}
                  />
                </Dropdown>
              ) : null}
            </div>
            <p
              className="mb-2 text-sm leading-6 text-gray-900"
              data-cy={`tna-course-feedback-review-text-${index}`}
            >
              {review.comment}
            </p>
            <div
              className="flex items-center gap-2"
              data-cy={`tna-course-feedback-review-rating-row-${index}`}
            >
              <StarDisplay rating={review.rating} />
              <span
                className="text-sm font-medium text-gray-900 tabular-nums"
                data-cy={`tna-course-feedback-review-rating-value-${index}`}
              >
                {formatRating(review.rating)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <BlockWrapper
      withBackground={false}
      className="mt-4 bg-white border border-gray-200 overflow-hidden"
      data-cy="tna-course-feedback-and-ratings-wrapper"
    >
      <div
        className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3"
        data-cy="tna-course-feedback-and-ratings-header"
      >
        <div
          className="text-sm font-semibold text-gray-900"
          data-cy="tna-course-feedback-and-ratings-title"
        >
          Feedbacks and Ratings
        </div>
        {averageRating != null ? (
          <div
            className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900"
            data-cy="tna-course-feedback-and-ratings-average"
          >
            <StarIcon
              sx={{ fontSize: 16 }}
              className="fill-[#FAAD14] text-[#FAAD14]"
              aria-hidden
            />
            <span data-cy="tna-course-feedback-and-ratings-average-value">
              {formatRating(averageRating)}
            </span>
          </div>
        ) : null}
      </div>

      <div className="px-4 py-3" data-cy="tna-course-feedback-and-ratings-body">
        {showReviewForm ? (
          <div ref={formRef} data-cy="tna-course-feedback-form-section">
            <div
              className="mb-2 flex items-center justify-between gap-3"
              data-cy="tna-course-feedback-form-labels"
            >
              <span
                className="text-sm font-medium text-gray-900"
                data-cy="tna-course-feedback-write-review-label"
              >
                {isEditingOwnReview ? 'Edit your review' : 'Write your review'}
              </span>
              <div
                className="inline-flex items-center gap-2"
                data-cy="tna-course-feedback-rate-label-row"
              >
                <span
                  className="text-sm font-medium text-gray-900"
                  data-cy="tna-course-feedback-rate-label"
                >
                  Rate:
                </span>
                <InteractiveStarRating
                  value={selectedRating}
                  onChange={setSelectedRating}
                  disabled={isSaving || isDeleting}
                />
              </div>
            </div>

            <Input.TextArea
              rows={4}
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              placeholder="Share your feedback about this course"
              className="rounded-md"
              disabled={isSaving || isDeleting}
              data-cy="tna-course-feedback-review-textarea"
            />

            <div
              className="mt-3 flex justify-end gap-2"
              data-cy="tna-course-feedback-save-actions"
            >
              {isEditingOwnReview ? (
                <Button
                  className="!h-9 rounded-md"
                  disabled={isSaving || isDeleting}
                  onClick={() => setIsEditingOwnReview(false)}
                  data-cy="tna-course-feedback-cancel-button"
                >
                  Cancel
                </Button>
              ) : null}
              <Button
                type="primary"
                className="!h-9 !min-w-[88px] rounded-md !bg-[#1E40AF] !border-[#1E40AF] hover:!bg-primary/80 hover:!border-primary/80"
                onClick={handleSave}
                loading={isSaving}
                disabled={
                  isDeleting || !reviewText.trim() || selectedRating < 1
                }
                data-cy="tna-course-feedback-save-button"
              >
                {isEditingOwnReview ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        ) : !canCreateRating && !ownRating ? (
          <p
            className="mb-4 text-sm text-gray-500"
            data-cy="tna-course-feedback-not-assigned-message"
          >
            You must be assigned to this course to leave a rating.
          </p>
        ) : null}

        <div
          className="mt-4 space-y-3"
          data-cy="tna-course-feedback-reviews-list"
        >
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : activeReviews.length ? (
            activeReviews.map(renderReviewCard)
          ) : (
            <p
              className="text-sm text-gray-500"
              data-cy="tna-course-feedback-reviews-empty"
            >
              No feedback yet.
            </p>
          )}
        </div>
      </div>
    </BlockWrapper>
  );
};

export default CourseFeedbacksAndRatings;
