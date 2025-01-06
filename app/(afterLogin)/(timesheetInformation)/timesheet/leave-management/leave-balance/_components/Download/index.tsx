import { useGetAllLeaveBalance } from '@/store/server/features/timesheet/leaveBalance/queries';
import { Button } from 'antd';
import React from 'react';
const DownloadLeaveBalance = () => {
  const buttonClass = 'text-xs font-bold h-[54px] w-full';
  const { data: allLeaveBalanceData } = useGetAllLeaveBalance();
  const onExport = () => {
    window.open(allLeaveBalanceData?.file);
  };

  return (
    <Button
      size="small"
      id="excelFileTypeToExportId"
      className={buttonClass}
      type="primary"
      onClick={() => onExport()}
    >
      Download
    </Button>
  );
};

export default DownloadLeaveBalance;
