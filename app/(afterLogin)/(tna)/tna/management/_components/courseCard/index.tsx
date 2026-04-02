import React, { FC, useEffect } from 'react';
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

interface CourseCardProps {
  item: Course;
  refetch: any;
  className?: string;
}

const CourseCard: FC<CourseCardProps> = ({ item, refetch, className = '' }) => {
  const router = useRouter();
  const { setIsShowCourseSidebar, setCourseId } = useTnaManagementStore();
  const {
    mutate: deleteCourse,
    isLoading,
    isSuccess,
  } = useDeleteCourseManagement();

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  return (
    <Spin spinning={isLoading} data-cy={`tna-course-card-spinner-${item?.id}`}>
      <div
        className={classNames(
          'relative flex flex-col w-[348px] h-[295px] rounded-[8px] border border-gray-200 bg-white overflow-hidden cursor-pointer hover:shadow-md transition-shadow group pt-[1px] pb-[12px] gap-[13px]',
          { 'opacity-70': item?.isDraft },
          [className],
        )}
        onClick={() => router.push(`/tna/management/${item?.id}`)}
        id={`tnaCourseCard${item?.id}Id`}
        data-cy={`tna-course-card-${item?.id}`}
      >
        <div
          className="relative w-[348px] h-[159px] shrink-0"
          data-cy={`tna-course-card-thumbnail-wrap-${item?.id}`}
        >
          <Image
            alt={item?.title || 'thumbnail'}
            src={item?.thumbnail || '/default-thumbnail.png'}
            fill
            className="object-cover"
            id={`tnaCourseCardThumbnail${item?.id}Id`}
            data-cy={`tna-course-card-thumbnail-${item?.id}`}
          />
        </div>

        <div
          className="flex flex-col w-[320px] mx-auto gap-[8px] flex-1 min-h-0"
          id={`tnaCourseCardContent${item?.id}Id`}
          data-cy={`tna-course-card-content-${item?.id}`}
        >
          <div
            className="flex justify-between items-center"
            data-cy={`tna-course-card-category-row-${item?.id}`}
          >
            <span
              className="text-[13px] font-bold text-gray-900 leading-none"
              id={`tnaCourseCardCategory${item?.id}Id`}
              data-cy={`tna-course-card-category-${item?.id}`}
            >
              {item?.courseCategory?.title || 'Uncategorized'}
            </span>
            {item?.isDraft && (
              <span
                className="text-[13px] text-[#A6A6A6] font-medium leading-none"
                id={`tnaCourseCardDraft${item?.id}Id`}
                data-cy={`tna-course-card-draft-${item?.id}`}
              >
                Draft
              </span>
            )}
          </div>

          <h3
            className="text-base font-bold text-gray-900 line-clamp-1 leading-tight m-0"
            id={`tnaCourseCardTitle${item?.id}Id`}
            data-cy={`tna-course-card-title-${item?.id}`}
          >
            {item?.title}
          </h3>

          <p
            className="text-[13px] text-[#A6A6A6] line-clamp-2 leading-[18px] m-0"
            id={`tnaCourseCardDescription${item?.id}Id`}
            data-cy={`tna-course-card-description-${item?.id}`}
          >
            {item?.overview && !/^[a-f0-9-]{16,}$/.test(item.overview)
              ? item.overview
              : 'No overview available'}
          </p>

          <div
            className="flex items-center gap-4 mt-auto pt-1"
            id={`tnaCourseCardFooter${item?.id}Id`}
            data-cy={`tna-course-card-footer-${item?.id}`}
          >
            <div
              className="flex items-center gap-1.5 text-[#A6A6A6] text-xs font-medium"
              data-cy={`tna-course-card-courses-stat-${item?.id}`}
            >
              <LuLayers
                size={14}
                className="text-[#A6A6A6]"
                data-cy={`tna-course-card-courses-icon-${item?.id}`}
              />
              <span data-cy={`tna-course-card-courses-count-${item?.id}`}>
                Courses({item.courseLessons?.length || 12})
              </span>
            </div>
            <div
              className="flex items-center gap-1.5 text-[#A6A6A6] text-xs font-medium"
              data-cy={`tna-course-card-lessons-stat-${item?.id}`}
            >
              <FaRegFileAlt
                size={13}
                className="text-[#A6A6A6]"
                data-cy={`tna-course-card-lessons-icon-${item?.id}`}
              />
              <span data-cy={`tna-course-card-lessons-count-${item?.id}`}>
                Lessons(
                {item.courseLessons?.reduce(
                  (acc, curr) =>
                    acc + (curr.courseLessonMaterials?.length || 0),
                  0,
                ) || 24}
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
