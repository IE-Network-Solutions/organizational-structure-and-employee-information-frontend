import { Spin } from 'antd';
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
        className="rounded-lg border border-[#D9D9D9] p-4"
        id={`time-attendance-settings-carry-over-rule-card-${item.id}-container`}
        data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-container`}
      >
        <div
          className="flex items-center gap-2.5 mb-3"
          id={`time-attendance-settings-carry-over-rule-card-${item.id}-header`}
          data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-header`}
        >
          <div
            className="flex-1 text-xl font-semibold text-[#4d4d4d] leading-6"
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
            <div
              id={`time-attendance-settings-carry-over-rule-card-${item.id}-actions`}
              data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-actions`}
            >
              <ActionButton
                id={item?.id ?? null}
                onDelete={onDelete}
                onStatusToggle={() =>
                  setActive({
                    isActive: !item.isActive,
                    id: item.id,
                  })
                }
                statusToggleLabel={
                  item.isActive
                    ? 'Deactivate Carry Over Rule'
                    : 'Activate Carry Over Rule'
                }
                data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-action-button`}
              />
            </div>
          </AccessGuard>
        </div>

        <div
          className="grid grid-cols-2 gap-3"
          id={`time-attendance-settings-carry-over-rule-card-${item.id}-info-grid`}
          data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-info-grid`}
        >
          <div
            className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 whitespace-nowrap"
            id={`time-attendance-settings-carry-over-rule-card-${item.id}-limit`}
            data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-limit`}
          >
            <span
              className="font-normal"
              id={`time-attendance-settings-carry-over-rule-card-${item.id}-limit-label`}
              data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-limit-label`}
            >
              Limit:
            </span>
            <span
              id={`time-attendance-settings-carry-over-rule-card-${item.id}-limit-value`}
              data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-limit-value`}
            >
              {item.limit}
            </span>
          </div>
          <div
            className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 whitespace-nowrap"
            id={`time-attendance-settings-carry-over-rule-card-${item.id}-expiration`}
            data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-expiration`}
          >
            <span
              className="font-normal"
              id={`time-attendance-settings-carry-over-rule-card-${item.id}-expiration-label`}
              data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-expiration-label`}
            >
              Expiration:
            </span>
            <span
              id={`time-attendance-settings-carry-over-rule-card-${item.id}-expiration-value`}
              data-cy={`time-attendance-settings-carry-over-rule-card-${item.id}-expiration-value`}
            >
              {item.expiration ?? item.expirationPeriod}
            </span>
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default CarryOverCard;
