import { useGetAllLeaveBalance } from '@/store/server/features/timesheet/leaveBalance/queries';
import { Button } from 'antd';
import React, { useEffect } from 'react';
import { TbLayoutList } from 'react-icons/tb';

const DownloadLeaveBalance = () => {
  const buttonClass = 'text-xs font-bold h-[54px] w-full';
  const {
    data: allLeaveBalanceData,
    isLoading: leaveBalanceIsLoading,
    isFetched: allLeaveBalanceFetch,
  } = useGetAllLeaveBalance();
  const onExport = () => {
    window.open(allLeaveBalanceData, '_blank');
    // window.open(
    //   'https://files.ienetworks.co/view/test/9b320d7d-bece-4dd4-bb87-dd226f70daef/Total Time Card_Today, Dec 30.xlsx',
    // );
  };

  return (
    <Button
      size="small"
      id="excelFileTypeToExportId"
      className={buttonClass}
      type="primary"
      //   icon={<TbLayoutList size={16} />}
      onClick={() => onExport()}
    >
      Download
    </Button>
  );
};

export default DownloadLeaveBalance;
