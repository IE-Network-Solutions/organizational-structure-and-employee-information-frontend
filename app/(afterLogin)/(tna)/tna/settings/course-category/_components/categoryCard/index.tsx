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
    <Spin spinning={isLoading}>
      <div className="flex justify-between items-center p-6 rounded-2xl border border-gray-200 mt-6 gap-2.5">
        <div className="text-lg font-semibold text-gray-900 flex-1">
          {item.title}
        </div>
        <AccessGuard permissions={[Permissions.UpdateCourseCategory, Permissions.DeleteCourseCategory]}>
          <ActionButtons
            id={item?.id ?? null}
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
