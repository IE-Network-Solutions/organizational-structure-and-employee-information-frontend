import React, { FC, useEffect, useMemo } from 'react';
import { Course } from '@/types/tna/course';
import { Spin } from 'antd';
import ActionButton from '@/components/common/actionButton';
import { FaRegFileAlt } from 'react-icons/fa';
import { LuLayers } from 'react-icons/lu';
import { classNames } from '@/utils/classNames';
import { useTnaManagementStore } from '@/store/uistate/features/tna/management';
import { useDeleteCourseManagement } from '@/store/server/features/tna/management/mutation';
import { useRouter } from 'next/navigation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import Image from 'next/image';
import { useTnaManagementCoursePageStore } from '@/store/uistate/features/tna/management/coursePage';
import { useGetCourseRatings } from '@/store/server/features/tna/courseRating/queries';
import StarIcon from '@mui/icons-material/Star';

interface CourseCardProps {
  item: Course;
  refetch: any;
  className?: string;
}
const formatRating = (value: number) => value.toFixed(1);

const CourseCard: FC<CourseCardProps> = ({ item, refetch, className = '' }) => {
  const router = useRouter();
  const { setIsShowCourseSidebar, setCourseId } = useTnaManagementStore();

  const {
    mutate: deleteCourse,
    isLoading,
    isSuccess,
  } = useDeleteCourseManagement();
  const { course } = useTnaManagementCoursePageStore();
  const { data: reviews = [] } = useGetCourseRatings(item?.id ?? '');

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);
  const activeReviews = useMemo(
    () => reviews.filter((review) => !review.deletedAt),
    [reviews],
  );

  const averageRating = useMemo(() => {
    if (course?.rating != null && Number.isFinite(course.rating)) {
      return course.rating;
    }
    if (!activeReviews.length) return null;
    const total = activeReviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / activeReviews.length) * 10) / 10;
  }, [course?.rating, activeReviews]);

  return (
    <Spin spinning={isLoading} data-cy={`tna-course-card-spinner-${item?.id}`}>
      <div
        className={classNames(
          'group relative flex h-[295px] min-w-0 w-full cursor-pointer flex-col gap-0 overflow-hidden rounded-[8px] bg-[#F9FAFB] pb-3 transition-shadow hover:shadow-md',
          { 'opacity-70': item?.isDraft },
          [className],
        )}
        onClick={() => router.push(`/tna/management/${item?.id}`)}
        id={`tnaCourseCard${item?.id}Id`}
        data-cy={`tna-course-card-${item?.id}`}
      >
        <div
          className="relative h-[159px] w-full shrink-0 overflow-hidden leading-none"
          data-cy={`tna-course-card-thumbnail-wrap-${item?.id}`}
        >
          <Image
            unoptimized
            alt={item?.title || 'thumbnail'}
            src={item?.thumbnail || '/default-thumbnail.png'}
            fill
            sizes="(max-width: 767px) 380px, (max-width: 1279px) 50vw, 33vw"
            className="!object-cover object-center"
            id={`tnaCourseCardThumbnail${item?.id}Id`}
            data-cy={`tna-course-card-thumbnail-${item?.id}`}
          />
        </div>

        <div
          className="flex min-h-0 flex-1 flex-col gap-2 px-[15px] pt-2 md:gap-[8px] md:px-4 md:pt-[13px]"
          id={`tnaCourseCardContent${item?.id}Id`}
          data-cy={`tna-course-card-content-${item?.id}`}
        >
          <div
            className="flex items-center justify-between"
            data-cy={`tna-course-card-category-row-${item?.id}`}
          >
            <span
              className="text-xs font-bold leading-none text-black max-md:text-xs max-md:leading-5 max-md:text-black md:leading-none"
              id={`tnaCourseCardCategory${item?.id}Id`}
              data-cy={`tna-course-card-category-${item?.id}`}
            >
              {item?.courseCategory?.title || 'Uncategorized'}
            </span>
            {averageRating != null ? (
              <div
                className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900"
                data-cy="tna-course-feedback-and-ratings-average"
              >
                <StarIcon
                  sx={{ fontSize: 12 }}
                  className="fill-[#FAAD14] text-[#FAAD14]"
                  aria-hidden
                />
                <span data-cy="tna-course-feedback-and-ratings-average-value">
                  {formatRating(averageRating)}
                </span>
              </div>
            ) : null}
            {item?.isDraft && (
              <span
                className="text-[12px] font-medium leading-none text-[#000000]"
                id={`tnaCourseCardDraft${item?.id}Id`}
                data-cy={`tna-course-card-draft-${item?.id}`}
              >
                Draft
              </span>
            )}
          </div>

          <h3
            className="m-0 line-clamp-1 text-sm font-bold leading-tight text-black max-md:text-sm max-md:leading-[22px] max-md:text-black"
            id={`tnaCourseCardTitle${item?.id}Id`}
            data-cy={`tna-course-card-title-${item?.id}`}
          >
            {item?.title}
          </h3>

          <p
            className="m-0 line-clamp-3 text-[13px] leading-[18px] text-[#A6A6A6] max-md:line-clamp-2 max-md:text-xs max-md:leading-5 max-md:text-black/45 md:line-clamp-2"
            id={`tnaCourseCardDescription${item?.id}Id`}
            data-cy={`tna-course-card-description-${item?.id}`}
          >
            {item?.overview && !/^[a-f0-9-]{16,}$/.test(item.overview)
              ? item.overview
              : 'No overview available'}
          </p>

          <div
            className="mt-auto flex items-center gap-4 pt-1 max-md:gap-3"
            id={`tnaCourseCardFooter${item?.id}Id`}
            data-cy={`tna-course-card-footer-${item?.id}`}
          >
            <div
              className="flex items-center gap-1.5 text-xs font-medium text-[#A6A6A6] max-md:gap-2 max-md:font-normal max-md:leading-5 max-md:text-black/45"
              data-cy={`tna-course-card-courses-stat-${item?.id}`}
            >
              <LuLayers
                size={14}
                className="text-[#A6A6A6] max-md:text-black/45"
                data-cy={`tna-course-card-courses-icon-${item?.id}`}
              />
              <span data-cy={`tna-course-card-courses-count-${item?.id}`}>
                Courses({item.courseLessons?.length ?? 0})
              </span>
            </div>
            <div
              className="flex items-center gap-1.5 text-xs font-medium text-[#A6A6A6] max-md:gap-2 max-md:font-normal max-md:leading-5 max-md:text-black/45"
              data-cy={`tna-course-card-lessons-stat-${item?.id}`}
            >
              <FaRegFileAlt
                className="h-[13px] w-[13px] shrink-0 text-[#A6A6A6] max-md:h-3.5 max-md:w-3.5 max-md:text-black/45"
                data-cy={`tna-course-card-lessons-icon-${item?.id}`}
              />
              <span data-cy={`tna-course-card-lessons-count-${item?.id}`}>
                Lessons(
                {item.courseLessons?.reduce(
                  (acc, curr) =>
                    acc + (curr.courseLessonMaterials?.length ?? 0),
                  0,
                ) ?? 0}
                )
              </span>
            </div>
          </div>
        </div>

        <div
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2"
          onClick={(e) => e.stopPropagation()}
          id={`tnaCourseCardActions${item?.id}Id`}
          data-cy={`tna-course-card-actions-${item?.id}`}
        >
          <AccessGuard
            permissions={[Permissions.UpdateCourse, Permissions.DeleteCourse]}
            id={`tnaCourseCardActionGuard${item?.id}Id`}
          >
            <ActionButton
              id={item?.id ?? null}
              triggerSizePx={24}
              moreMenuIconPx={14}
              onEdit={() => {
                setCourseId(item?.id);
                setIsShowCourseSidebar(true);
              }}
              onDelete={() => {
                deleteCourse([item?.id]);
              }}
              onCancelDelete={() => ''}
            />
          </AccessGuard>
        </div>
      </div>
    </Spin>
  );
};

export default CourseCard;
