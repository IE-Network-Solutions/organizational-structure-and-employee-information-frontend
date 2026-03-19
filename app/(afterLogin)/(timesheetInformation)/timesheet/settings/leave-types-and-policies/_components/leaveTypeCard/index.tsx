import React, { FC } from 'react';
import { Spin, Tag } from 'antd';
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
  const { mutate: setActive, isLoading: isActiveLoading } =
    useUpdateLeaveTypeActive();

  const onDelete = () => {
    deleteLeaveType(item.id);
  };
  const onEdit = () => {
    setIsShowTypeAndPoliciesSidebarEdit(true);
    setLeaveTypeId(item.id);
  };

  return (
    <Spin
      spinning={isDeleteLoading || isActiveLoading}
      data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-spin`}
    >
      <div
        className="rounded-lg border border-gray-200 bg-white p-2 sm:p-4 w-full mb-4"
        id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-container`}
        data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-container`}
      >
        <div
          className="flex items-center justify-between gap-2.5 mb-4 pb-3 border-b border-gray-200"
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
              <Tag
              className={`h-5 text-xs px-2 rounded-[4px] ${
                item.isPaid ? 'border border-[#b7eb8f] text-[#52c41a] bg-[#f6ffed]' : 'bg-[#FFE6E6] text-[#EF4444] border border-[#ffa39e]'
              }`}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-status-badge`}
            >
              {item.isPaid ? 'PAID' : 'UNPAID'}
            </Tag>
          </div>
          <div
            className="flex items-center gap-2"
            id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-actions`}
            data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-actions`}
          >
            <Tag
              className={`h-5 px-3 rounded-[4px] border text-sm font-normal inline-flex items-center ${
                item.isActive
                  ? 'border-[#91caff] bg-[#e6f4ff] text-[#1677ff]'
                  : 'bg-[#FFE6E6] text-[#EF4444] border border-[#ffa39e]'
              }`}
              id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-active-status`}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-active-status`}
            >
              {item.isActive ? 'Active' : 'Inactive'}
            </Tag>
            <AccessGuard
              permissions={[
                Permissions.UpdateLeaveType,
                Permissions.DeleteLeaveType,
              ]}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-action-button-access-guard`}
            >
              <ActionButton
                id={item?.id}
                onDelete={onDelete}
                onEdit={onEdit}
                onStatusToggle={() =>
                  setActive({
                    id: item.id,
                    isActive: !item.isActive,
                  })
                }
                statusToggleLabel={
                  item.isActive
                    ? 'Deactivate Leave Type'
                    : 'Activate Leave Type'
                }
                data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-action-button`}
              />
            </AccessGuard>
          </div>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3"
          id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-info-grid`}
          data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-info-grid`}
        >
          <div
            className="rounded-lg border border-gray-200 p-3"
            id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-entitled`}
            data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-entitled`}
          >
            <p
              className="text-sm text-gray-600 mb-2"
              id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-entitled-label`}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-entitled-label`}
            >
              Maximum Allowed Days
            </p>
            <p
              className="text-2xl font-semibold text-gray-900 mb-0"
              id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-maximum-allowed-value`}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-maximum-allowed-value`}
            >
              {item.maximumAllowedConsecutiveDays ?? '-'}
            </p>
          </div>
          <div
            className="rounded-lg border border-gray-200 p-3"
            id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-minimum-notification`}
            data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-minimum-notification`}
          >
            <p
              className="text-sm text-gray-600 mb-2"
              id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-minimum-notification-label`}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-minimum-notification-label`}
            >
              Minimum Notification Period
            </p>
            <p
              className="text-2xl font-semibold text-gray-900 mb-0"
              id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-minimum-notification-value`}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-minimum-notification-value`}
            >
              {item.minimumNotifyingDays ?? '-'}
            </p>
          </div>
          <div
            className="rounded-lg border border-gray-200 p-3"
            id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-entitled`}
            data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-entitled`}
          >
            <p
              className="text-sm text-gray-600 mb-2"
              id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-entitled-label`}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-entitled-label`}
            >
              Entitled Days
            </p>
            <p
              className="text-2xl font-semibold text-gray-900 mb-0"
              id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-entitled-value`}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-entitled-value`}
            >
              {item.entitledDaysPerYear ?? '-'}
            </p>
          </div>
          <div
            className="rounded-lg border border-gray-200 p-3"
            id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-accrual-rule`}
            data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-accrual-rule`}
          >
            <p
              className="text-sm text-gray-600 mb-2"
              id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-accrual-rule-label`}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-accrual-rule-label`}
            >
              Accrual Rule
            </p>
            <p
              className="text-2xl font-semibold text-gray-900 mb-0"
              id={`time-attendance-settings-leave-types-and-policies-card-${item.id}-accrual-rule-value`}
              data-cy={`time-attendance-settings-leave-types-and-policies-card-${item.id}-accrual-rule-value`}
            >
              {(item.accrualRule &&
                typeof item.accrualRule !== 'string' &&
                item.accrualRule.title) ||
                '-'}
            </p>
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default LeaveTypeCard;
