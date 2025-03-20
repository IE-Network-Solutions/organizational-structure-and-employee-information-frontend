import React from 'react';
import { Avatar, Card, Divider, Typography } from 'antd';
import { ProfileState } from '@/store/uistate/features/incentive/incentive';

const { Title, Text } = Typography;

const data: ProfileState = {
  name: 'Abraham Dulla',
  role: 'Product Design Lead',
  recognition: 'Cash collection',
  project: 'ERP',
  avatarUrl: '/avatar.png',
};
const IncentiveUserInfo: React.FC = () => {
  return (
    <Card className="text-center rounded-xl shadow-md p-4">
      <Avatar size={80} src={data?.avatarUrl} className="mx-auto" />
      <Title level={4} className="mt-3">
        {data?.name}
      </Title>
      <Text type="secondary">{data?.role}</Text>
      <Divider />
      <div className="text-left space-y-4">
        <div>
          <Text type="secondary">Recognized for</Text>
          <Title level={5} className="my-1 font-semibold">
            {data?.recognition}
          </Title>
        </div>
      </div>
    </Card>
  );
};

export default IncentiveUserInfo;
