import React, { FC, useEffect } from 'react';
import { Course } from '@/types/tna/course';
import { Card } from 'antd';
import { Spin } from 'antd';
import { classNames } from '@/utils/classNames';
import { FaRegFile } from 'react-icons/fa6';
import { useTnaManagementStore } from '@/store/uistate/features/tna/management';
import { useDeleteCourseManagement } from '@/store/server/features/tna/management/mutation';
import { useRouter } from 'next/navigation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { IoInformationCircleOutline } from "react-icons/io5";

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
        className={classNames(
          'relative bg-white rounded-xl shadow-sm w-[140px] sm:w-[160px] md:w-[180px] h-[120px] sm:h-[140px] flex items-center justify-center cursor-pointer',
          { 'opacity-70': item?.isDraft },
          [className],
        )}
        bodyStyle={{ 
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px 8px'
        }}
        onClick={() => {
          router.push(`/tna/management/${item?.id}`);
        }}
      >
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {item?.isDraft && (
            <div className="flex items-center text-gray-500">
              <FaRegFile className="w-3.5 h-3.5" />
            </div>
          )}
          <AccessGuard
            permissions={[Permissions.UpdateCourse, Permissions.DeleteCourse]}
          >
            <div 
              className="text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                setCourseId(item?.id);
                setIsShowCourseSidebar(true);
              }}
            >
              <IoInformationCircleOutline className="w-4 h-4" />
            </div>
          </AccessGuard>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="text-sm sm:text-base font-medium text-gray-900 mb-2 line-clamp-2 px-1">
            {item?.title}
          </div>
          <div className="text-lg sm:text-xl font-semibold text-primary">
            {item?.courseLessons?.length || 0}
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            Lessons
          </div>
        </div>
      </Card>
    </Spin>
  );
};

export default CourseCard;
