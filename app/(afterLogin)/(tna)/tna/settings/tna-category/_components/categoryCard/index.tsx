import ActionButtons from '@/components/common/actionButton/actionButtons';
import { TrainingNeedCategory } from '@/types/tna/tna';
import { FC } from 'react';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';
import { useDeleteTnaCategory } from '@/store/server/features/tna/category/mutation';
import { Spin } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

interface TnaCategoryCardProps {
  item: TrainingNeedCategory;
}

const TnaCategoryCard: FC<TnaCategoryCardProps> = ({ item }) => {
  const { setIsShowTnaCategorySidebar, setTnaCategoryId } =
    useTnaSettingsStore();
  const { mutate: deleteCategory, isLoading } = useDeleteTnaCategory();

  return (
    <Spin spinning={isLoading}>
      <div className="flex justify-between items-center p-6 rounded-2xl border border-gray-200 mt-6 gap-2.5">
        <div className="text-lg font-semibold text-gray-900 flex-1">
          {item.name}
        </div>
        <AccessGuard
          permissions={[
            Permissions.UpdateTnaCategory,
            Permissions.DeleteTnaCategory,
          ]}
        >
          <ActionButtons
            id={item?.id ?? null}
            onDelete={() => {
              deleteCategory([item.id]);
            }}
            onEdit={() => {
              setTnaCategoryId(item.id);
              setIsShowTnaCategorySidebar(true);
            }}
          />
        </AccessGuard>
      </div>
    </Spin>
  );
};

export default TnaCategoryCard;
