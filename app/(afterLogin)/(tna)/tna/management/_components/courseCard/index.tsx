import React, { FC, useEffect } from 'react';
import { Course } from '@/types/tna/course';
import { Card, Spin } from 'antd';
import { classNames } from '@/utils/classNames';
import { FaRegFile } from 'react-icons/fa6';
import { useTnaManagementStore } from '@/store/uistate/features/tna/management';
import { useDeleteCourseManagement } from '@/store/server/features/tna/management/mutation';
import { useRouter } from 'next/navigation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { GlobalStateStore } from '@/store/uistate/features/global';
import { HiArrowRight } from 'react-icons/hi';
import styles from './styles.module.css';

interface CourseCardProps {
  items?: Course[];
  refetch: any;
  className?: string;
  maxVisibleCards?: number;
}

const CourseCard: FC<CourseCardProps> = ({ 
  items = [], 
  refetch, 
  className = '',
  maxVisibleCards = 10
}) => {
  const router = useRouter();
  const { isMobile, isTablet } = GlobalStateStore();
  const { setIsShowCourseSidebar, setCourseId } = useTnaManagementStore();
  const { mutate: deleteCourse, isLoading, isSuccess } = useDeleteCourseManagement();

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  const cardClasses = classNames(
    'relative bg-white rounded-xl shadow-sm cursor-pointer transition-all hover:shadow-md',
    {
      'w-[120px] min-h-[100px] sm:w-[130px] sm:min-h-[105px] md:w-[140px] md:min-h-[110px]': true
    }
  );

  const renderCard = (item: Course) => (
    <Spin key={item.id} spinning={isLoading}>
      <Card
        hoverable
        className={classNames(cardClasses, {
          'opacity-70': item?.isDraft
        })}
        bodyStyle={{
          padding: isMobile ? '12px 8px' : '16px 12px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={() => {
          router.push(`/tna/management/${item?.id}`);
        }}
      >
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {item?.isDraft && (
            <div className="flex items-center text-gray-500">
              <FaRegFile className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          )}
          <AccessGuard permissions={[Permissions.UpdateCourse, Permissions.DeleteCourse]}>
            <div 
              className="text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                setCourseId(item?.id);
                setIsShowCourseSidebar(true);
              }}
            >
              <IoInformationCircleOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </AccessGuard>
        </div>

        <div className="flex flex-col items-center justify-center text-center w-full">
          <div className="font-medium text-gray-900 line-clamp-2 px-1 text-[13px] mb-1 sm:text-[15px] sm:mb-2">
            {item?.title}
          </div>
          <div className="font-semibold text-primary text-[18px] sm:text-[22px]">
            {item?.courseLessons?.length || 0}
          </div>
          <div className="text-gray-500 mt-0.5 text-[10px] sm:text-xs">
            Lessons
          </div>
        </div>
      </Card>
    </Spin>
  );

  const renderViewMoreCard = () => (
    <Card
      hoverable
      className={cardClasses}
      bodyStyle={{
        padding: isMobile ? '12px 8px' : '16px 12px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={() => router.push('/tna/management')}
    >
      <div className="flex flex-col items-center justify-center text-center w-full">
        <div className="text-primary mb-2">
          <HiArrowRight className="w-6 h-6" />
        </div>
        <div className="font-medium text-gray-900 text-[13px] sm:text-[15px]">
          View More
        </div>
      </div>
    </Card>
  );

  // If items is undefined or empty, don't render anything
  if (!items?.length) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      <div className={`flex overflow-x-auto gap-4 pb-4 ${styles.hideScrollbar}`}>
        {items.slice(0, maxVisibleCards).map(renderCard)}
        {items.length > maxVisibleCards && renderViewMoreCard()}
      </div>
    </div>
  );
};

export default CourseCard;
