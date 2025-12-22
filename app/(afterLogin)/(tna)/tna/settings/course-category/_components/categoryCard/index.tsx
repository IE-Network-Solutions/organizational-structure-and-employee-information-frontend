import ActionButtons from '@/components/common/actionButton/actionButtons';
import { FC } from 'react';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';
import { Spin } from 'antd';
import { CourseCategory } from '@/types/tna/course';
import { useDeleteCourseCategory } from '@/store/server/features/tna/courseCategory/mutation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

interface CourseCategoryCardProps {
  item: CourseCategory;
}

const CourseCategoryCard: FC<CourseCategoryCardProps> = ({ item }) => {
  const { setIsShowCourseCategorySidebar, setCourseCategoryId } =
    useTnaSettingsStore();
  const { mutate: deleteCategory, isLoading } = useDeleteCourseCategory();

  return (
    <Spin
      spinning={isLoading}
      data-cy={`tna-course-category-card-spinner-${item.id}`}
    >
      <div
        className="flex justify-between items-center p-6 rounded-2xl border border-gray-200 mt-6 gap-2.5"
        id={`tnaCourseCategoryCard${item.id}Id`}
        data-cy={`tna-course-category-card-${item.id}`}
      >
        <div
          className="text-lg font-semibold text-gray-900 flex-1"
          id={`tnaCourseCategoryCardTitle${item.id}Id`}
          data-cy={`tna-course-category-card-title-${item.id}`}
        >
          {item.title}
        </div>
        <AccessGuard
          permissions={[
            Permissions.UpdateCourseCategory,
            Permissions.DeleteCourseCategory,
          ]}
          data-cy={`tna-course-category-card-action-guard-${item.id}`}
          id={`tnaCourseCategoryCardActionGuard${item.id}Id`}
        >
          <ActionButtons
            id={item?.id ?? null}
            data-cy={`tna-course-category-card-actions-${item.id}`}
            onDelete={() => {
              deleteCategory([item.id]);
            }}
            onEdit={() => {
              setCourseCategoryId(item.id);
              setIsShowCourseCategorySidebar(true);
            }}
          />
        </AccessGuard>
      </div>
    </Spin>
  );
};

export default CourseCategoryCard;
