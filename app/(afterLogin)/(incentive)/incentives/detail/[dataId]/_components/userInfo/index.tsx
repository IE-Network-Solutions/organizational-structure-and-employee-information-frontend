import React from 'react';
import { Avatar, Card, Divider, Skeleton, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useFetchIncentiveUserDetails } from '@/store/server/features/incentive/all/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';

const { Title, Text } = Typography;

interface IncentiveUserInfoProps {
  detailId: string;
}

const IncentiveUserInfo: React.FC<IncentiveUserInfoProps> = ({ detailId }) => {
  const { data: userDetail, isLoading: userDetailLoading } =
    useFetchIncentiveUserDetails(detailId);
  const { data: employeeData } = useGetAllUsers();

  const getEmployeeInformation = (id: string) => {
    return employeeData?.items?.find((item: any) => item.id === id) || {};
  };

  const userInfo = getEmployeeInformation(userDetail?.userId);

  return (
    <Card className="text-center rounded-xl  p-2 sm:p-4 ml-4">
      <Avatar
        size={80}
        src={userInfo?.profileImage || undefined}
        icon={!userInfo?.profileImage ? <UserOutlined /> : undefined}
        className="mx-auto"
      />
      <Title level={4} className="mt-3">
        {userDetailLoading ? (
          <Skeleton active title={{ width: 120 }} paragraph={false} />
        ) : (
          `${userInfo?.firstName || 'N/A'} ${userInfo?.middleName || ''}`.trim()
        )}
      </Title>
      <Text type="secondary">
        {userDetailLoading ? (
          <Skeleton active title={false} paragraph={{ rows: 1, width: 100 }} />
        ) : userInfo?.employeeJobInformation?.length ? (
          userInfo?.employeeJobInformation
            ?.map((item: any) => item?.position?.name || 'N/A')
            .join(', ')
        ) : (
          'N/A'
        )}
      </Text>
      <Divider />
      <div className="text-left space-y-4">
        <div>
          <Text type="secondary">Recognized for</Text>
          <Title level={5} className="my-1 font-semibold">
            {userDetailLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              userDetail?.recognitionTypeName || 'N/A'
            )}
          </Title>
        </div>
      </div>
    </Card>
  );
};

export default IncentiveUserInfo;
