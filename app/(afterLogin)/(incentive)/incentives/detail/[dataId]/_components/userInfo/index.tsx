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
    <Card id="incentive-user-info-card" data-cy="incentive-user-info-card" className="text-center rounded-xl  p-2 sm:p-4 ml-4">
      <Avatar
        data-cy="incentive-user-info-avatar"
        size={80}
        src={userInfo?.profileImage || undefined}
        icon={!userInfo?.profileImage ? <UserOutlined id="incentive-user-info-avatar-icon" data-cy="incentive-user-info-avatar-icon" /> : undefined}
        className="mx-auto"
      />
      <Title id="incentive-user-info-title" data-cy="incentive-user-info-title" level={4} className="mt-3">
        {userDetailLoading ? (
          <Skeleton data-cy="incentive-user-info-title-skeleton" active title={{ width: 120 }} paragraph={false} />
        ) : (
          <span id="incentive-user-info-title-text" data-cy="incentive-user-info-title-text">{`${userInfo?.firstName || 'N/A'} ${userInfo?.middleName || ''}`.trim()}</span>
        )}
      </Title>
      <Text id="incentive-user-info-position" data-cy="incentive-user-info-position" type="secondary">
        {userDetailLoading ? (
          <Skeleton data-cy="incentive-user-info-position-skeleton" active title={false} paragraph={{ rows: 1, width: 100 }} />
        ) : userInfo?.employeeJobInformation?.length ? (
          <span id="incentive-user-info-position-text" data-cy="incentive-user-info-position-text">{userInfo?.employeeJobInformation
            ?.map((item: any) => item?.position?.name || 'N/A')
            .join(', ')}</span>
        ) : (
          <span id="incentive-user-info-position-na" data-cy="incentive-user-info-position-na">N/A</span>
        )}
      </Text>
      <Divider data-cy="incentive-user-info-divider" />
      <div id="incentive-user-info-recognition-wrapper" data-cy="incentive-user-info-recognition-wrapper" className="text-left space-y-4">
        <div id="incentive-user-info-recognition" data-cy="incentive-user-info-recognition">
          <Text id="incentive-user-info-recognition-label" data-cy="incentive-user-info-recognition-label" type="secondary">Recognized for</Text>
          <Title id="incentive-user-info-recognition-title" data-cy="incentive-user-info-recognition-title" level={5} className="my-1 font-semibold">
            {userDetailLoading ? (
              <Skeleton data-cy="incentive-user-info-recognition-skeleton" active paragraph={{ rows: 1 }} />
            ) : (
              <span id="incentive-user-info-recognition-text" data-cy="incentive-user-info-recognition-text">{userDetail?.recognitionTypeName || 'N/A'}</span>
            )}
          </Title>
        </div>
      </div>
    </Card>
  );
};

export default IncentiveUserInfo;
