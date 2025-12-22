import { Space, Spin, Switch } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import ActionButton from '@/components/common/actionButton';
import { CarryOverRule } from '@/types/timesheet/settings';
import { FC } from 'react';
import {
  useDeleteCarryOverRule,
  useUpdateCarryOverRuleActive,
} from '@/store/server/features/timesheet/carryOverRule/mutation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

export interface CarryOverCardProps {
  item: CarryOverRule;
}

const CarryOverCard: FC<CarryOverCardProps> = ({ item }) => {
  const { mutate: deleteCarryOver, isLoading: isDeleteLoading } =
    useDeleteCarryOverRule();
  const { mutate: setActive, isLoading } = useUpdateCarryOverRuleActive();

  const onDelete = () => {
    deleteCarryOver(item.id);
  };

  return (
    <Spin
      spinning={isLoading || isDeleteLoading}
      data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-spin`}
    >
      <div
        className="rounded-lg border border-gray-200 p-6 mt-6"
        id={`time-attendance-settings-carry-over-rule-card-${item.id}-container`}
        data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-container`}
      >
        <div
          className="flex items-center gap-2.5 mb-4"
          id={`time-attendance-settings-carry-over-rule-card-${item.id}-header`}
          data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-header`}
        >
          <div
            className="flex-1 text-lg font-semibold text-gray-900"
            id={`time-attendance-settings-carry-over-rule-card-${item.id}-title`}
            data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-title`}
          >
            {item.title}
          </div>
          <AccessGuard
            permissions={[
              Permissions.UpdateCarryOverRule,
              Permissions.DeleteCarryOverRule,
            ]}
            data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-actions-access-guard`}
          >
            <Space
              size={12}
              id={`time-attendance-settings-carry-over-rule-card-${item.id}-actions`}
              data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-actions`}
            >
              <Switch
                id="carryOverSwitchAbleCardButtonId"
                data-cy="time-attendance-settings-carry-over-rule-card-switch-able-button-id"
                checkedChildren={
                  <CheckOutlined data-cy="time-attendance-settings-carry-over-rule-card-switch-able-button-checked-icon" />
                }
                unCheckedChildren={
                  <CloseOutlined data-cy="time-attendance-settings-carry-over-rule-card-switch-able-button-unchecked-icon" />
                }
                value={item.isActive}
                onChange={(isActive) => {
                  setActive({
                    isActive,
                    id: item.id,
                  });
                }}
              />
              <ActionButton
                id={item?.id ?? null}
                onDelete={onDelete}
                data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-action-button`}
              />
            </Space>
          </AccessGuard>
        </div>

        <div
          className="grid grid-cols-2 gap-4"
          id={`time-attendance-settings-carry-over-rule-card-${item.id}-info-grid`}
          data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-info-grid`}
        >
          <div
            className="flex items-center text-xs text-gray-900 gap-4 even:justify-end"
            id={`time-attendance-settings-carry-over-rule-card-${item.id}-limit`}
            data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-limit`}
          >
            <span
              className="font-bold"
              id={`time-attendance-settings-carry-over-rule-card-${item.id}-limit-label`}
              data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-limit-label`}
            >
              Carry-over Limit
            </span>
            <span
              id={`time-attendance-settings-carry-over-rule-card-${item.id}-limit-value`}
              data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-limit-value`}
            >
              {item.limit}
            </span>
          </div>
          <div
            className="flex items-center text-xs text-gray-900 gap-4 even:justify-end"
            id={`time-attendance-settings-carry-over-rule-card-${item.id}-uom`}
            data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-uom`}
          >
            <span
              className="font-bold"
              id={`time-attendance-settings-carry-over-rule-card-${item.id}-uom-label`}
              data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-uom-label`}
            >
              Carry-overUOM
            </span>
            <span
              id={`time-attendance-settings-carry-over-rule-card-${item.id}-uom-value`}
              data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-uom-value`}
            >
              {item.expirationPeriod}
            </span>
          </div>
          <div
            className="flex items-center text-xs text-gray-900 gap-4 even:justify-end"
            id={`time-attendance-settings-carry-over-rule-card-${item.id}-expiration`}
            data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-expiration`}
          >
            <span
              className="font-bold"
              id={`time-attendance-settings-carry-over-rule-card-${item.id}-expiration-label`}
              data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-expiration-label`}
            >
              Carry-Over Expiration-
            </span>
            <span
              id={`time-attendance-settings-carry-over-rule-card-${item.id}-expiration-value`}
              data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-expiration-value`}
            >
              {item.expiration}
            </span>
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default CarryOverCard;
