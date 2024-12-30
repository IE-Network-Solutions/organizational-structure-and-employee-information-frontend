import { useGetEmployee } from "@/store/server/features/employees/employeeDetail/queries";
import { Avatar, Space } from "antd";
import { LoadingOutlined } from '@ant-design/icons';

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
        <>
          <LoadingOutlined />
        </>
      );
  
    if (error || !userDetails) return '-';
  
    const userName = userDetails?.firstName || '-';
    const profileImage = fallbackProfileImage;
  
    return (
      <Space size="small">
        <Avatar src={profileImage} />
        {userName}
      </Space>
    );
};