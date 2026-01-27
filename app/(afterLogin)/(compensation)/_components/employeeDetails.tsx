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
      <div
        data-testid="employee-details-loading"
        id="compensation-employee-loading-container"
        data-cy="compensation-employee-loading-container"
      >
        <LoadingOutlined data-cy="compensation-employee-loading-icon" />
      </div>
    );

  if (error || !userDetails)
    return (
      <span
        data-testid="employee-details-error"
        id="compensation-employee-error-text"
        data-cy="compensation-employee-error-text"
      >
        -
      </span>
    );

  const userName =
    `${userDetails?.firstName} ${userDetails?.middleName} ${userDetails?.lastName} ` ||
    '-';
  const profileImage = userDetails?.profileImage || fallbackProfileImage;

  return (
    <Space
      size="small"
      data-testid={`employee-details-${empId}`}
      id={`compensation-employee-details-wrapper-${empId}`}
      data-cy={`compensation-employee-details-wrapper-${empId}`}
    >
      <Avatar
        src={profileImage}
        icon={<UserOutlined data-cy="compensation-employee-avatar-icon" />}
        data-testid="employee-avatar"
        className="w-6 h-6"
        data-cy={`compensation-employee-avatar-image-${empId}`}
      />
      <span
        data-testid="employee-name"
        className="truncate"
        id={`compensation-employee-name-text-${empId}`}
        data-cy={`compensation-employee-name-text-${empId}`}
      >
        {userName}
      </span>
    </Space>
  );
};
