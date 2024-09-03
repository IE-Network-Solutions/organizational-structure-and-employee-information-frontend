import { Space, Switch } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import ActionButton from '@/components/common/ActionButton';
import { CarryOverRule } from '@/types/timesheet/settings';
import { FC } from 'react';
import { useDeleteCarryOverRule } from '@/store/server/features/timesheet/carryOverRule/mutation';

export interface CarryOverCardProps {
  item: CarryOverRule;
}

const CarryOverCard: FC<CarryOverCardProps> = ({ item }) => {
  const { mutate: deleteCarryOver } = useDeleteCarryOverRule();

  const onDelete = () => {
    deleteCarryOver(item.id);
  };

  return (
    <div className="rounded-lg border border-gray-200 p-6 mt-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex-1 text-lg font-semibold text-gray-900">
          {item.title}
        </div>
        <Space size={12}>
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultChecked
          />
          <ActionButton onDelete={onDelete} />
        </Space>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center text-sm text-gray-900 gap-4 even:justify-end">
          <span className="font-bold">Carry-over Limit</span>
          <span>{item.limit}</span>
        </div>
        <div className="flex items-center text-sm text-gray-900 gap-4 even:justify-end">
          <span className="font-bold">Carry-overUOM</span>
          <span>{item.expirationPeriod}</span>
        </div>
        <div className="flex items-center text-sm text-gray-900 gap-4 even:justify-end">
          <span className="font-bold">Carry-Over Expiration-</span>
          <span>{item.expiration}</span>
        </div>
      </div>
    </div>
  );
};

export default CarryOverCard;
