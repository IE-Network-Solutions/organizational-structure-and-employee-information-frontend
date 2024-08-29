import React from 'react';
import { Space, Switch } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import ActionButton from '@/components/common/ActionButton';
import StatusBadge from '@/components/common/statusBadge/statusBadge';

const PolicyCard = () => {
  return (
    <div className="rounded-lg border border-gray-200 p-6 mt-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex-1 flex items-center text-lg text-gray-900 gap-2">
          <span className="font-semibold">Annual</span>
          <StatusBadge className="h-6">UNPAID</StatusBadge>
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
        <div className="flex text-sm text-gray-900 gap-4 even:justify-end">
          <span className="font-bold">Entitled Date-</span>
          <span>Annual</span>
        </div>
        <div className="flex text-sm text-gray-900 gap-4 even:justify-end">
          <span className="font-bold">Minimum Notification Period-</span>
          <span>5 days</span>
        </div>
        <div className="flex text-sm text-gray-900 gap-4 even:justify-end">
          <span className="font-bold">Maximum Allowed Days-</span>
          <span>15 days</span>
        </div>
        <div className="flex text-sm text-gray-900 gap-4 even:justify-end">
          <span className="font-bold">Accrual Rule-</span>
          <span>Annual</span>
        </div>
        <div className="flex text-sm text-gray-900 gap-4 col-span-2">
          <span className="font-bold">Description</span>
          <span>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s
            with the release of Letraset sheets containing Lorem Ipsum passages,
            and more recently with desktop publishing software like Aldus
            PageMaker including versions of Lorem Ipsum.
          </span>
        </div>
      </div>
    </div>
  );
};

export default PolicyCard;
