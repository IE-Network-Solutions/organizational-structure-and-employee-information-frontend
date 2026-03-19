import { GoLocation } from 'react-icons/go';
import ActionButton from '@/components/common/actionButton';
import { AllowedArea } from '@/types/timesheet/settings';
import { FC } from 'react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { useDeleteAllowedArea } from '@/store/server/features/timesheet/allowedArea/mutation';
import { Card, Spin } from 'antd';
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
    <Spin
      spinning={isLoading}
      data-cy={`time-attendance-settings-allowed-areas-card-${item.id}-spin`}
    >
      <Card
        className="rounded-xl border border-gray-200 !shadow-none"
        bodyStyle={{ padding: 16 }}
        id={`time-attendance-settings-allowed-areas-card-${item.id}-container`}
        data-cy={`time-attendance-settings-allowed-areas-card-${item.id}-container`}
      >
        <div
          className="flex items-start justify-between gap-2"
          id={`time-attendance-settings-allowed-areas-card-${item.id}-info-container`}
          data-cy={`time-attendance-settings-allowed-areas-card-${item.id}-info-container`}
        >
          <div
            className="flex-1 min-w-0"
            id={`time-attendance-settings-allowed-areas-card-${item.id}-info`}
            data-cy={`time-attendance-settings-allowed-areas-card-${item.id}-info`}
          >
            <div
              className="text-md font-semibold text-[#4d4d4d] leading-6 mb-3 truncate"
              id={`time-attendance-settings-allowed-areas-card-${item.id}-title`}
              data-cy={`time-attendance-settings-allowed-areas-card-${item.id}-title`}
            >
              {item.title}
            </div>
            <div
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-gray-500"
              id={`time-attendance-settings-allowed-areas-card-${item.id}-location`}
              data-cy={`time-attendance-settings-allowed-areas-card-${item.id}-location`}
            >
              <GoLocation
                size={15}
                className="text-gray-500"
                data-cy={`time-attendance-settings-allowed-areas-card-${item.id}-location-icon`}
              />
              <span
                className="text-sm text-gray-500 "
                id={`time-attendance-settings-allowed-areas-card-${item.id}-coordinates`}
                data-cy={`time-attendance-settings-allowed-areas-card-${item.id}-coordinates`}
              >
                {item.latitude}{' '}
                <span
                  id="time-attendance-settings-allowed-areas-card-coordinates-separator"
                  data-cy="time-attendance-settings-allowed-areas-card-coordinates-separator"
                  className="mx-1"
                >
                  →
                </span>{' '}
                {item.longitude}
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
      </Card>
    </Spin>
  );
};

export default AreaCard;
