import { FC, useMemo } from 'react';
import { Skeleton } from 'antd';
import ActionButton from '@/components/common/actionButton';
import { AllowedAreaConfiguration } from '@/types/timesheet/settings';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { useDeleteAllowedAreaConfiguration } from '@/store/server/features/timesheet/allowedAreaConfiguration/mutation';
import {
  getAllowedAreaConfigTypeLabel,
  getAllowedAreaConfigUserIds,
  isUserBasedAllowedAreaConfig,
} from '@/store/server/features/timesheet/allowedAreaConfiguration/interface';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { flattenDepartments } from '@/utils/approval/departmentHelpers';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

export interface ConfigCardProps {
  item: AllowedAreaConfiguration;
}

const ConfigCard: FC<ConfigCardProps> = ({ item }) => {
  const { setAllowedAreaConfigId, setIsShowAllowedAreaConfigModal } =
    useTimesheetSettingsStore();
  const { mutate: deleteConfig, isLoading } =
    useDeleteAllowedAreaConfiguration();
  const { data: departmentsData } = useGetDepartments();

  const isUserBased = isUserBasedAllowedAreaConfig(item);
  const assignedUserCount = getAllowedAreaConfigUserIds(item).length;
  const configTypeLabel = getAllowedAreaConfigTypeLabel(item);

  const departmentName = useMemo(() => {
    if (!item.departmentId || !departmentsData) return null;
    const flatDepartments = flattenDepartments(departmentsData as any[]);
    const department = flatDepartments.find(
      (dept) => String(dept.id) === String(item.departmentId),
    );
    return department?.name ?? null;
  }, [departmentsData, item.departmentId]);

  return (
    <Skeleton
      loading={isLoading}
      active
      data-cy={`time-attendance-settings-allowed-area-config-card-${item.id}-spin`}
    >
      <div
        className="rounded-lg border border-[#D9D9D9] bg-white p-4"
        id={`time-attendance-settings-allowed-area-config-card-${item.id}-container`}
        data-cy={`time-attendance-settings-allowed-area-config-card-${item.id}-container`}
      >
        <div
          className="flex items-start justify-between gap-2 mb-3"
          id={`time-attendance-settings-allowed-area-config-card-${item.id}-header`}
          data-cy={`time-attendance-settings-allowed-area-config-card-${item.id}-header`}
        >
          <div
            className="flex items-center gap-2 flex-1 min-w-0"
            data-cy={`time-attendance-settings-allowed-area-config-card-${item.id}-title-row`}
          >
            {isUserBased ? (
              <PersonOutlineOutlinedIcon className="text-[#4d4d4d] shrink-0" />
            ) : (
              <GroupsOutlinedIcon className="text-[#4d4d4d] shrink-0" />
            )}
            <h3
              className="font-bold text-gray-900 text-base m-0 truncate"
              id={`time-attendance-settings-allowed-area-config-card-${item.id}-title`}
              data-cy={`time-attendance-settings-allowed-area-config-card-${item.id}-title`}
            >
              {departmentName ?? 'Allowed Area Configuration'}
            </h3>
          </div>
          <AccessGuard
            permissions={[
              Permissions.UpdateAllowedArea,
              Permissions.DeleteAllowedArea,
            ]}
            data-cy={`time-attendance-settings-allowed-area-config-card-${item.id}-actions-access-guard`}
          >
            <ActionButton
              id={item.id}
              onEdit={() => {
                setAllowedAreaConfigId(item.id);
                setIsShowAllowedAreaConfigModal(true);
              }}
              onDelete={() => deleteConfig(item.id)}
              data-cy={`time-attendance-settings-allowed-area-config-card-${item.id}-action-button`}
            />
          </AccessGuard>
        </div>

        <div
          className="flex flex-col gap-2"
          id={`time-attendance-settings-allowed-area-config-card-${item.id}-info`}
          data-cy={`time-attendance-settings-allowed-area-config-card-${item.id}-info`}
        >
          <div
            className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 w-fit"
            data-cy={`time-attendance-settings-allowed-area-config-card-${item.id}-config-type`}
          >
            <span
              className="font-normal mr-1"
              data-cy={`time-attendance-settings-allowed-area-config-card-${item.id}-config-type-label`}
            >
              Config Type:
            </span>
            <span
              data-cy={`time-attendance-settings-allowed-area-config-card-${item.id}-config-type-value`}
            >
              {configTypeLabel}
            </span>
          </div>
          <div
            className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 w-fit"
            data-cy={`time-attendance-settings-allowed-area-config-card-${item.id}-department`}
          >
            <span
              className="font-normal mr-1"
              data-cy={`time-attendance-settings-allowed-area-config-card-${item.id}-department-label`}
            >
              Department:
            </span>
            <span
              data-cy={`time-attendance-settings-allowed-area-config-card-${item.id}-department-value`}
            >
              {departmentName ?? item.departmentId ?? '—'}
            </span>
          </div>
          {isUserBased && (
            <div
              className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 w-fit"
              data-cy={`time-attendance-settings-allowed-area-config-card-${item.id}-assigned-users`}
            >
              <span
                className="font-normal mr-1"
                data-cy={`time-attendance-settings-allowed-area-config-card-${item.id}-assigned-users-label`}
              >
                Assigned Users:
              </span>
              <span
                data-cy={`time-attendance-settings-allowed-area-config-card-${item.id}-assigned-users-value`}
              >
                {assignedUserCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </Skeleton>
  );
};

export default ConfigCard;
