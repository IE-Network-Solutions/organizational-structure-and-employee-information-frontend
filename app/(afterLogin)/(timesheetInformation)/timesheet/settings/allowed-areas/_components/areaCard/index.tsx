import { TbLock } from 'react-icons/tb';
import { GoLocation } from 'react-icons/go';
import ActionButton from '@/components/common/actionButton';
import { AllowedArea } from '@/types/timesheet/settings';
import { FC } from 'react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { useDeleteAllowedArea } from '@/store/server/features/timesheet/allowedArea/mutation';
import { Spin } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

interface AreaCardProps {
  item: AllowedArea;
}

const AreaCard: FC<AreaCardProps> = ({ item }) => {
  const { setAllowedAreaId, setIsShowLocationSidebar } =
    useTimesheetSettingsStore();
  const { mutate: deleteArea, isLoading } = useDeleteAllowedArea();
  return (
    <div className="border border-t-0 first:border-t border-gray-200">
      <Spin spinning={isLoading}>
        <div className="flex items-center gap-3 px-4 py-2.5">
          <TbLock size={16} className="text-gray-500" />
          <div className="flex items-center justify-between flex-1">
            <div className="flex-1">
              <div className="text-xs text-gray-900 leading-5 font-medium">
                {item.title}
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <GoLocation size={16} />
                <span className="text-xs">
                {item.latitude} - {item.longitude} 

                </span>
              </div>
            </div>
            <AccessGuard
              permissions={[
                Permissions.UpdateAllowedArea,
                Permissions.DeleteAllowedArea,
              ]}
            >
              <ActionButton
                id={item.id ?? null}
                onEdit={() => {
                  setAllowedAreaId(item.id);
                  setIsShowLocationSidebar(true);
                }}
                onDelete={() => {
                  deleteArea(item.id);
                }}
              />
            </AccessGuard>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default AreaCard;
