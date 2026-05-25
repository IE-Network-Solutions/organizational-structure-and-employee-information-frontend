import React from 'react';
import { Button, message, Popover } from 'antd';
import { useLeaveBalanceStore } from '@/store/uistate/features/timesheet/leaveBalance';
import {
  useGetAllLeaveBalanceWithFilter,
  useGetAllLeaveBalanceWithoutFilter,
} from '@/store/server/features/timesheet/leaveBalance/queries';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { useIsMobile } from '@/hooks/useIsMobile';

interface DownloadLeaveBalanceProps {
  'data-cy'?: string;
}

const DownloadLeaveBalance: React.FC<DownloadLeaveBalanceProps> = ({
  'data-cy': dataCy,
}) => {
  const { selectedUserId, leaveTypeId, isDownloading, setIsDownloading } =
    useLeaveBalanceStore();
  const { isMobile } = useIsMobile();
  const buttonClass = 'font-normal w-10 sm:w-full h-[40px] rounded-lg';

  const { refetch: refetchFiltered } = useGetAllLeaveBalanceWithFilter(
    selectedUserId,
    leaveTypeId,
  );
  const { refetch: refetchAll } = useGetAllLeaveBalanceWithoutFilter();

  const handleDownload = async (downloadType: 'all' | 'filtered') => {
    if (downloadType === 'filtered' && !selectedUserId) {
      message.warning(
        'Select a user before downloading filtered leave balance',
      );
      return;
    }

    setIsDownloading(true);

    try {
      const response =
        downloadType === 'all' ? await refetchAll() : await refetchFiltered();
      const fileUrl = response.data?.file;

      if (!fileUrl) {
        message.warning('No leave balance data available for download');
        return;
      }

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
    <Popover
      trigger="click"
      placement="bottom"
      align={{ offset: [0, 4] }}
      content={
        <div
          className="flex flex-col gap-1 min-w-[180px] py-1"
          id="time-attendance-leave-balance-export-popover-content"
          data-cy="time-attendance-leave-balance-export-popover-content"
        >
          <button
            type="button"
            id="leaveBalanceDownloadAllId"
            data-cy="time-attendance-leave-balance-export-popover-all"
            className="w-full rounded-lg bg-white px-4 py-2.5 text-left text-sm font-normal text-gray-600 shadow-sm border border-gray-200 hover:border-[#4096FF] hover:text-[#4096FF] transition-colors"
            onClick={() => handleDownload('all')}
          >
            Download All
          </button>
          <button
            type="button"
            id="leaveBalanceDownloadFilteredId"
            data-cy="time-attendance-leave-balance-export-popover-filtered"
            className="w-full rounded-lg bg-white px-4 py-2.5 text-left text-sm font-normal text-gray-600 shadow-sm border border-gray-200 hover:border-[#4096FF] hover:text-[#4096FF] transition-colors"
            onClick={() => handleDownload('filtered')}
          >
            Download Filtered
          </button>
        </div>
      }
    >
      <Button
        size="large"
        id="excelFileTypeToExportId"
        className={buttonClass}
        type="primary"
        loading={isDownloading}
        data-cy={dataCy || 'time-attendance-leave-balance-download-button'}
        icon={<SaveAltIcon fontSize="small" />}
      >
        {isMobile ? '' : isDownloading ? 'Preparing Download...' : 'Download'}
      </Button>
    </Popover>
  );
};

export default DownloadLeaveBalance;
