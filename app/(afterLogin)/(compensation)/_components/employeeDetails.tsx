import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { Avatar, Space } from 'antd';
import { LoadingOutlined, UserOutlined } from '@ant-design/icons';

export const EmployeeDetails = ({
  empId,
  fallbackProfileImage,
}: {
  empId: string;
  fallbackProfileImage?: string;
}) => {
  const { data: userDetails, isLoading, error } = useGetEmployee(empId);

  if (isLoading)
    return (
      <div data-testid="employee-details-loading">
        <LoadingOutlined />
      </div>
    );

  if (error || !userDetails)
    return <span data-testid="employee-details-error">-</span>;

  const userName =
    `${userDetails?.firstName} ${userDetails?.middleName} ${userDetails?.lastName} ` ||
    '-';
  const profileImage = userDetails?.profileImage || fallbackProfileImage;

  return (
    <Space size="small" data-testid={`employee-details-${empId}`}>
      <Avatar
        src={profileImage}
        icon={<UserOutlined />}
        data-testid="employee-avatar"
        className="w-6 h-6"
      />
      <span data-testid="employee-name" className="truncate">{userName}</span>
    </Space>
  );
};
