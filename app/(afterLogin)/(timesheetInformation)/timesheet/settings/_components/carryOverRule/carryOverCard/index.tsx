import { Space, Switch } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import ActionButton from '@/components/common/ActionButton';

const CarryOverCard = () => {
  return (
    <div className="rounded-lg border border-gray-200 p-6 mt-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex-1 text-lg font-semibold text-gray-900">
          Carry-over Rule 1
        </div>
        <Space size={12}>
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultChecked
          />
          <ActionButton />
        </Space>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center text-sm text-gray-900 gap-4 even:justify-end">
          <span className="font-bold">Carry-over Limit</span>
          <span>Annual</span>
        </div>
        <div className="flex items-center text-sm text-gray-900 gap-4 even:justify-end">
          <span className="font-bold">Carry-over Limit</span>
          <span>Annual</span>
        </div>
        <div className="flex items-center text-sm text-gray-900 gap-4 even:justify-end">
          <span className="font-bold">Carry-over Limit</span>
          <span>Annual</span>
        </div>
      </div>
    </div>
  );
};

export default CarryOverCard;
