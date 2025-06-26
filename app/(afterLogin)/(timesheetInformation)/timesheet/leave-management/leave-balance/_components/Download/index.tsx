import React, { useEffect } from 'react';
import { Button, message } from 'antd';
import { useLeaveBalanceStore } from '@/store/uistate/features/timesheet/leaveBalance';
import { useGetAllLeaveBalanceWithFilter } from '@/store/server/features/timesheet/leaveBalance/queries';

const DownloadLeaveBalance: React.FC = () => {
  const { selectedUserId, leaveTypeId, isDownloading, setIsDownloading } =
    useLeaveBalanceStore();
  const buttonClass = 'text-xs font-bold h-[54px] w-full';

  const { data: allFilteredLeaveBalanceData, refetch: refetchFiltered } =
    useGetAllLeaveBalanceWithFilter(selectedUserId, leaveTypeId);

  useEffect(() => {
    const prefetchData = async () => {
      await refetchFiltered();
    };

    prefetchData();
  }, [selectedUserId, leaveTypeId, refetchFiltered]);

  const handleDownload = async () => {
    if (!allFilteredLeaveBalanceData?.file) {
      message.warning('No leave balance data available for download');
      return;
    }

    setIsDownloading(true);

    try {
      // Ensure we have the latest data
      await refetchFiltered();

      const { file: fileUrl } = allFilteredLeaveBalanceData;
      const filename = extractFilenameFromUrl(fileUrl) || 'leave-balance.xlsx';

      downloadFile(fileUrl, filename);
      message.success('Download started successfully');
    } catch (error) {
      message.error('Failed to download leave balance');
    } finally {
      setIsDownloading(false);
    }
  };

  const extractFilenameFromUrl = (url: string): string => {
    try {
      return new URL(url).pathname.split('/').pop() || '';
    } catch {
      return '';
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      // Note: Only revoke object URLs created with URL.createObjectURL()
      // For regular URLs, this isn't needed and might cause errors
    }, 100);
  };

  return (
    <Button
      size="small"
      id="excelFileTypeToExportId"
      className={buttonClass}
      type="primary"
      onClick={handleDownload}
      loading={isDownloading || !allFilteredLeaveBalanceData}
      disabled={!allFilteredLeaveBalanceData}
    >
      {isDownloading ? 'Preparing Download...' : 'Download'}
    </Button>
  );
};

export default DownloadLeaveBalance;
