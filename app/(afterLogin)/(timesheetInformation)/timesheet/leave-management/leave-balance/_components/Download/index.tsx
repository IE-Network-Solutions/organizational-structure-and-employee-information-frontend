import { useGetAllLeaveBalance } from '@/store/server/features/timesheet/leaveBalance/queries';
import { Button } from 'antd';
import React from 'react';

const DownloadLeaveBalance = () => {
  const buttonClass = 'text-xs font-bold h-[54px] w-full';
  const { data: allLeaveBalanceData, refetch } = useGetAllLeaveBalance();

  const onExport = () => {
    if (!allLeaveBalanceData?.file) return;
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = allLeaveBalanceData.file;
    link.download = 'leave-balance.xlsx'; // You can customize the filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      size="small"
      id="excelFileTypeToExportId"
      className={buttonClass}
      type="primary"
      onClick={onExport}
    >
      Download
    </Button>
  );
};

export default DownloadLeaveBalance;
