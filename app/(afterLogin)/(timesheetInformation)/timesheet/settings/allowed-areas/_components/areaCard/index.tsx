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
    <div
      className="border border-t-0 first:border-t border-gray-200"
      id={`time-attendance-settings-allowed-areas-card-${item.id}-container`}
      data-cy={`time-attendance-settings-allowed-areas-card-${item.id}-container`}
    >
      <Spin spinning={isLoading} data-cy={`time-attendance-settings-allowed-areas-card-${item.id}-spin`}>
        <div
          className="flex items-center gap-3 px-4 py-2.5"
          id={`time-attendance-settings-allowed-areas-card-${item.id}-content`}
          data-cy={`time-attendance-settings-allowed-areas-card-${item.id}-content`}
        >
          <TbLock
            size={16}
            className="text-gray-500"
            data-cy={`time-attendance-settings-allowed-areas-card-${item.id}-lock-icon`}
          />
          <div
            className="flex items-center justify-between flex-1"
            id={`time-attendance-settings-allowed-areas-card-${item.id}-info-container`}
            data-cy={`time-attendance-settings-allowed-areas-card-${item.id}-info-container`}
          >
            <div
              className="flex-1"
              id={`time-attendance-settings-allowed-areas-card-${item.id}-info`}
              data-cy={`time-attendance-settings-allowed-areas-card-${item.id}-info`}
            >
              <div
                className="text-xs text-gray-900 leading-5 font-medium"
                id={`time-attendance-settings-allowed-areas-card-${item.id}-title`}
                data-cy={`time-attendance-settings-allowed-areas-card-${item.id}-title`}
              >
                {item.title}
              </div>
              <div
                className="flex items-center gap-2 text-gray-500"
                id={`time-attendance-settings-allowed-areas-card-${item.id}-location`}
                data-cy={`time-attendance-settings-allowed-areas-card-${item.id}-location`}
              >
                <GoLocation
                  size={16}
                  data-cy={`time-attendance-settings-allowed-areas-card-${item.id}-location-icon`}
                />
                <span
                  className="text-xs"
                  id={`time-attendance-settings-allowed-areas-card-${item.id}-coordinates`}
                  data-cy={`time-attendance-settings-allowed-areas-card-${item.id}-coordinates`}
                >
                  {item.latitude} - {item.longitude}
                </span>
              </div>
            </div>
            <AccessGuard
              permissions={[
                Permissions.UpdateAllowedArea,
                Permissions.DeleteAllowedArea,
              ]}
              data-cy={`time-attendance-settings-allowed-areas-card-${item.id}-actions-access-guard`}
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
                data-cy={`time-attendance-settings-allowed-areas-card-${item.id}-action-buttons`}
              />
            </AccessGuard>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default AreaCard;
