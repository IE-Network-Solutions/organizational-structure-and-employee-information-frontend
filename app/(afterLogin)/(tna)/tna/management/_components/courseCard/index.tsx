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
    <Spin spinning={isLoading}>
      <Card
        hoverable
        className={classNames('relative', { 'opacity-70': item?.isDraft }, [
          className,
        ])}
        cover={
          <Image
            alt="example"
            src={item?.thumbnail ?? ''}
            width={300}
            height={250}
            className="w-full h-[250px] object-cover object-top"
          />
        }
        onClick={() => {
          router.push(`/tna/management/${item?.id}`);
        }}
      >
        <div className="absolute top-5 left-5 z-10 py-2 px-3 rounded-lg bg-primary text-white text-sm font-semibold">
          {item?.isDraft ? (
            <div className="flex items-center gap-2">
              Draft <FaRegFile size={16} />
            </div>
          ) : (
            item?.courseCategory?.title || ''
          )}
        </div>
        <Meta
          title={
            <div className="flex items-center gap-1">
              <div className="text-lg font-bold text-gray-900 flex-1 text-pretty">
                {item?.title}
              </div>
            </div>
          }
          description={
            <div className="text-base text-gray-600">{item?.overview}</div>
          }
        />
      </Card>
      <div className="action-buttons mt-2 flex gap-2">
        <AccessGuard
          permissions={[Permissions.UpdateCourse, Permissions.DeleteCourse]}
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
          />
        </AccessGuard>
      </div>
    </Spin>
  );
};

export default CourseCard;
