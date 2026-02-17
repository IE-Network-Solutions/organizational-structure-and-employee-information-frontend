import React, { FC, useEffect } from 'react';
import { Course } from '@/types/tna/course';
import { Card } from 'antd';
import { Spin } from 'antd';
import Meta from 'antd/lib/card/Meta';
import ActionButton from '@/components/common/actionButton';
import { classNames } from '@/utils/classNames';
import { FaRegFile } from 'react-icons/fa6';
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
      <Card
        hoverable
        className={classNames(
          'relative min-h-[180px] max-h-[180px] overflow-hidden',
          { 'opacity-70': item?.isDraft },
          [className],
        )}
        id={`tnaCourseCard${item?.id}Id`}
        data-cy={`tna-course-card-${item?.id}`}
        cover={
          <Image
            alt="example"
            src={item?.thumbnail ?? ''}
            width={300}
            height={120}
            className="w-full h-[120px] object-cover object-top"
            id={`tnaCourseCardThumbnail${item?.id}Id`}
            data-cy={`tna-course-card-thumbnail-${item?.id}`}
          />
        }
        onClick={() => {
          router.push(`/tna/management/${item?.id}`);
        }}
      >
        <div
          className="flex justify-between "
          id={`tnaCourseCardContent${item?.id}Id`}
          data-cy={`tna-course-card-content-${item?.id}`}
        >
          <div
            id={`tnaCourseCardInfo${item?.id}Id`}
            data-cy={`tna-course-card-info-${item?.id}`}
          >
            <div
              className="absolute top-5 left-5 z-10 py-2 px-3 rounded-lg bg-primary text-white text-sm font-semibold"
              id={`tnaCourseCardBadge${item?.id}Id`}
              data-cy={`tna-course-card-badge-${item?.id}`}
            >
              {item?.isDraft ? (
                <div
                  className="flex items-center gap-2"
                  id={`tnaCourseCardDraft${item?.id}Id`}
                  data-cy={`tna-course-card-draft-${item?.id}`}
                >
                  Draft{' '}
                  <FaRegFile
                    size={16}
                    data-cy={`tna-course-card-draft-icon-${item?.id}`}
                  />
                </div>
              ) : (
                item?.courseCategory?.title || ''
              )}
            </div>
            {item?.tenantId === null && (
              <div
                className="absolute top-5 right-5 z-10 py-2 px-3 rounded-lg bg-green-500 text-white text-sm font-semibold"
                id={`tnaCourseCardSystem${item?.id}Id`}
                data-cy={`tna-course-card-system-${item?.id}`}
              >
                system course
              </div>
            )}

            <Meta
              title={
                <div
                  className="flex items-center gap-1"
                  id={`tnaCourseCardTitle${item?.id}Id`}
                  data-cy={`tna-course-card-title-${item?.id}`}
                >
                  <div
                    className="text-lg font-bold text-gray-900 flex-1 text-pretty line-clamp-1"
                    data-cy={`tna-course-card-title-text-${item?.id}`}
                    id={`tnaCourseCardTitleText${item?.id}Id`}
                  >
                    {item?.title}
                  </div>
                </div>
              }
              description={
                <div
                  className="text-base text-gray-600 line-clamp-1"
                  id={`tnaCourseCardDescription${item?.id}Id`}
                  data-cy={`tna-course-card-description-${item?.id}`}
                >
                  {item?.overview && !/^[a-f0-9-]{16,}$/.test(item.overview)
                    ? item.overview
                    : 'No overview available'}
                </div>
              }
              data-cy={`tna-course-card-meta-${item?.id}`}
            />
          </div>

          <div
            className="action-buttons mt-2  gap-2"
            onClick={(e) => e.stopPropagation()}
            id={`tnaCourseCardActions${item?.id}Id`}
            data-cy={`tna-course-card-actions-${item?.id}`}
          >
            <AccessGuard
              permissions={[Permissions.UpdateCourse, Permissions.DeleteCourse]}
              data-cy={`tna-course-card-action-guard-${item?.id}`}
              id={`tnaCourseCardActionGuard${item?.id}Id`}
            >
              <ActionButton
                id={item?.id ?? null}
                data-cy={`tna-course-card-action-button-${item?.id}`}
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
      </Card>
    </Spin>
  );
};

export default CourseCard;
