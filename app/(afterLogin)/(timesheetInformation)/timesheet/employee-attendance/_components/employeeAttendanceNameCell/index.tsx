'use client';

import React from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';

const getProfileImageUrl = (profileImage: unknown): string | undefined => {
  if (!profileImage || typeof profileImage !== 'string') return undefined;

  if (profileImage.startsWith('http')) {
    return profileImage;
  }

  try {
    const parsed = JSON.parse(profileImage);
    if (
      parsed?.url &&
      typeof parsed.url === 'string' &&
      parsed.url.startsWith('http')
    ) {
      return parsed.url;
    }
  } catch {
    return undefined;
  }

  return undefined;
};

interface EmployeeAttendanceNameCellProps {
  userId: string;
}

const EmployeeAttendanceNameCell: React.FC<EmployeeAttendanceNameCellProps> = ({
  userId,
}) => {
  const {
    isLoading,
    data: employeeData,
    isError,
  } = useGetSimpleEmployee(userId);

  if (isLoading) {
    return (
      <div
        id={`time-attendance-employee-attendance-row-employee-name-div-${userId}-loading-div`}
        data-cy={`time-attendance-employee-attendance-row-employee-name-div-${userId}-loading-div`}
      >
        ...
      </div>
    );
  }

  if (isError || !employeeData) return <>-</>;

  const profileImageUrl = getProfileImageUrl(
    (employeeData as { profileImage?: unknown })?.profileImage,
  );

  return (
    <div
      id={`time-attendance-employee-attendance-row-employee-name-div-${userId}`}
      data-cy={`time-attendance-employee-attendance-row-employee-name-div-${userId}`}
      className="flex items-center gap-2"
    >
      <Avatar
        size={32}
        src={profileImageUrl}
        icon={<UserOutlined />}
        data-cy={`time-attendance-employee-attendance-row-employee-name-div-${userId}-avatar`}
      />
      <div
        id={`time-attendance-employee-attendance-row-employee-name-div-${userId}-name-div`}
        data-cy={`time-attendance-employee-attendance-row-employee-name-div-${userId}-name-div`}
        className="min-w-0 flex-1"
      >
        <div
          className="text-sm font-normal text-[#4d4d4d] truncate"
          id={`time-attendance-employee-attendance-row-employee-name-div-${userId}-name-text-div`}
          data-cy={`time-attendance-employee-attendance-row-employee-name-div-${userId}-name-text-div`}
        >
          {employeeData?.firstName || '-'} {employeeData?.middleName || ''}{' '}
          {employeeData?.lastName || '-'}
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendanceNameCell;
