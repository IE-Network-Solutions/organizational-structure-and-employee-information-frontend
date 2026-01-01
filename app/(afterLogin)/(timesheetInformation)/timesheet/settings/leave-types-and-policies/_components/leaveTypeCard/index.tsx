import React, { FC } from 'react';
import { Space, Spin, Switch } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import ActionButton from '@/components/common/actionButton';
import StatusBadge, {
  StatusBadgeTheme,
} from '@/components/common/statusBadge/statusBadge';
import { LeaveType } from '@/types/timesheet/settings';
import {
  useDeleteLeaveType,
  useUpdateLeaveTypeActive,
} from '@/store/server/features/timesheet/leaveType/mutation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';

export interface LeaveTypeCardProps {
  item: LeaveType;
}

const LeaveTypeCard: FC<LeaveTypeCardProps> = ({ item }) => {
  const { mutate: deleteLeaveType, isLoading: isDeleteLoading } =
    useDeleteLeaveType();
  const { setLeaveTypeId, setIsShowTypeAndPoliciesSidebarEdit } =
    useTimesheetSettingsStore();

  const { mutate: setActive, isLoading } = useUpdateLeaveTypeActive();

  const onDelete = () => {
    deleteLeaveType(item.id);
  };
  const onEdit = () => {
    setIsShowTypeAndPoliciesSidebarEdit(true);
    setLeaveTypeId(item.id);
  };

  return (
    <Spin
      spinning={isLoading || isDeleteLoading}
      data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-spin`}
    >
      <div
        className="rounded-lg border border-gray-200 p-1 sm:p-6 mt-4 w-full"
        id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-container`}
        data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-container`}
      >
        <div
          className="flex items-center gap-2.5 mb-4"
          id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-header`}
          data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-header`}
        >
          <div
            className="flex-1 flex items-center text-lg text-gray-900 gap-2"
            id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-title-section`}
            data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-title-section`}
          >
            <span
              className="font-semibold"
              id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-title`}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-title`}
            >
              {item.title}
            </span>
            <StatusBadge
              theme={
                !item.isPaid
                  ? StatusBadgeTheme.secondary
                  : StatusBadgeTheme.success
              }
              className="h-6"
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-status-badge`}
            >
              {item.isPaid ? 'PAID' : 'UNPAID'}
            </StatusBadge>
          </div>
          <Space
            size={12}
            id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-actions`}
            data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-actions`}
          >
            <AccessGuard
              permissions={[Permissions.UpdateLeaveType]}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-switch-access-guard`}
            >
              <Switch
                id={`${item.title}LeaveTypeCardSwitchButtonFieldId`}
                data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-switch-button-id`}
                checkedChildren={
                  <CheckOutlined
                    data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-switch-checked-icon`}
                  />
                }
                unCheckedChildren={
                  <CloseOutlined
                    data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-switch-unchecked-icon`}
                  />
                }
                value={item.isActive}
                onChange={(isActive) => {
                  setActive({
                    isActive,
                    id: item.id,
                  });
                }}
              />
            </AccessGuard>
            <AccessGuard
              permissions={[Permissions.DeleteLeaveType]}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-action-button-access-guard`}
            >
              <ActionButton
                id={item?.id}
                onDelete={onDelete}
                onEdit={onEdit}
                data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-action-button`}
              />
            </AccessGuard>
          </Space>
        </div>

        <div
          className="grid grid-cols-2 gap-4"
          id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-info-grid`}
          data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-info-grid`}
        >
          <div
            className="flex text-xs text-gray-900 gap-4 even:justify-end"
            id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-entitled`}
            data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-entitled`}
          >
            <span
              className="font-bold"
              id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-entitled-label`}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-entitled-label`}
            >
              Entitled Date-
            </span>
            <span
              id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-entitled-value`}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-entitled-value`}
            >
              {item.entitledDaysPerYear}
            </span>
          </div>
          <div
            className="flex text-xs text-gray-900 gap-4 even:justify-end"
            id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-minimum-notification`}
            data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-minimum-notification`}
          >
            <span
              className="font-bold"
              id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-minimum-notification-label`}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-minimum-notification-label`}
            >
              Minimum Notification Period-
            </span>
            <span
              id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-minimum-notification-value`}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-minimum-notification-value`}
            >
              {item.minimumNotifyingDays}
            </span>
          </div>
          <div
            className="flex text-xs text-gray-900 gap-4 even:justify-end"
            id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-maximum-allowed`}
            data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-maximum-allowed`}
          >
            <span
              className="font-bold"
              id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-maximum-allowed-label`}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-maximum-allowed-label`}
            >
              Maximum Allowed Days-
            </span>
            <span
              id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-maximum-allowed-value`}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-maximum-allowed-value`}
            >
              {item.maximumAllowedConsecutiveDays}
            </span>
          </div>
          <div
            className="flex text-xs text-gray-900 gap-4 even:justify-end"
            id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-accrual-rule`}
            data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-accrual-rule`}
          >
            <span
              className="font-bold"
              id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-accrual-rule-label`}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-accrual-rule-label`}
            >
              Accrual Rule-
            </span>
            <span
              id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-accrual-rule-value`}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-accrual-rule-value`}
            >
              {item.accrualRule &&
                typeof item.accrualRule !== 'string' &&
                item.accrualRule.title}
            </span>
          </div>
          <div
            className="flex text-xs text-gray-900 gap-4 col-span-2"
            id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-description`}
            data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-description`}
          >
            <span
              className="font-bold"
              id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-description-label`}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-description-label`}
            >
              Description
            </span>
            <span
              id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-description-value`}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-description-value`}
            >
              {item.description}
            </span>
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default LeaveTypeCard;
