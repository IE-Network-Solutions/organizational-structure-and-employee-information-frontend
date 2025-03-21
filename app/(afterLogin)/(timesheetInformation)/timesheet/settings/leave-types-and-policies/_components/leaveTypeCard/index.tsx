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

export interface LeaveTypeCardProps {
  item: LeaveType;
}

const LeaveTypeCard: FC<LeaveTypeCardProps> = ({ item }) => {
  const { mutate: deleteLeaveType, isLoading: isDeleteLoading } =
    useDeleteLeaveType();
  const { mutate: setActive, isLoading } = useUpdateLeaveTypeActive();

  const onDelete = () => {
    deleteLeaveType(item.id);
  };

  return (
    <Spin spinning={isLoading || isDeleteLoading}>
      <div className="rounded-lg border border-gray-200 p-6 mt-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex-1 flex items-center text-lg text-gray-900 gap-2">
            <span className="font-semibold">{item.title}</span>
            <StatusBadge
              theme={
                !item.isPaid
                  ? StatusBadgeTheme.secondary
                  : StatusBadgeTheme.success
              }
              className="h-6"
            >
              {item.isPaid ? 'PAID' : 'UNPAID'}
            </StatusBadge>
          </div>
          <Space size={12}>
            <AccessGuard permissions={[Permissions.UpdateLeaveType]}>
              <Switch
                id={`${item.title}LeaveTypeCardSwitchButtonFieldId`}
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                value={item.isActive}
                onChange={(isActive) => {
                  setActive({
                    isActive,
                    id: item.id,
                  });
                }}
              />
            </AccessGuard>
            <AccessGuard permissions={[Permissions.DeleteLeaveType]}>
              <ActionButton id={item?.id} onDelete={onDelete} />
            </AccessGuard>
          </Space>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex text-sm text-gray-900 gap-4 even:justify-end">
            <span className="font-bold">Entitled Date-</span>
            <span>{item.entitledDaysPerYear}</span>
          </div>
          <div className="flex text-sm text-gray-900 gap-4 even:justify-end">
            <span className="font-bold">Minimum Notification Period-</span>
            <span>{item.minimumNotifyingDays}</span>
          </div>
          <div className="flex text-sm text-gray-900 gap-4 even:justify-end">
            <span className="font-bold">Maximum Allowed Days-</span>
            <span>{item.maximumAllowedConsecutiveDays}</span>
          </div>
          <div className="flex text-sm text-gray-900 gap-4 even:justify-end">
            <span className="font-bold">Accrual Rule-</span>
            <span>
              {typeof item.accrualRule !== 'string' && item.accrualRule.title}
            </span>
          </div>
          <div className="flex text-sm text-gray-900 gap-4 col-span-2">
            <span className="font-bold">Description</span>
            <span>{item.description}</span>
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default LeaveTypeCard;
