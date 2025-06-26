import React, { useEffect, useState, useRef } from 'react';
import ExcelJS from 'exceljs';
import { Button, Popover } from 'antd';
import { useExcelHeaders } from '@/store/server/features/incentive/all/queries';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import { useRecognitionByParentId } from '@/store/server/features/incentive/other/queries';
import { capitalizeInitials } from '@/helpers/capitalizeInitals';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { fetchExcelHeaders } from '@/store/server/features/incentive/all/queries';

const DownloadExcelButton: React.FC = () => {
  const { selectedRecognitionTypeId, activeKey } = useIncentiveStore();

  const [loadingItems, setLoadingItems] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [pendingDownloadId, setPendingDownloadId] = useState<string | null>(
    null,
  );

  const { data: excelHeaders, isLoading: templateResponseLoading } =
    useExcelHeaders(selectedRecognitionTypeId);

  const { data: childRecognitionData, isLoading: responseLoading } =
    useRecognitionByParentId(activeKey !== '1' ? activeKey : '');

  const warningTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any previous timeout
    if (warningTimeout.current) {
      clearTimeout(warningTimeout.current);
    }

    // Only run if loading is active for the current recognition type
    if (selectedRecognitionTypeId && loadingItems[selectedRecognitionTypeId]) {
      // Set a timeout to check for headers after 5 seconds
      warningTimeout.current = setTimeout(() => {
        if (!excelHeaders || excelHeaders.length === 0) {
          setLoadingItems((prev) => ({
            ...prev,
            [selectedRecognitionTypeId]: false,
          }));
          NotificationMessage.warning({
            message: 'No headers found. Please try again.',
          });
        }
      }, 5000); // 5 seconds
    }

    // If headers arrive and are non-empty, clear loading
    if (selectedRecognitionTypeId && excelHeaders && excelHeaders.length > 0) {
      setLoadingItems((prev) => ({
        ...prev,
        [selectedRecognitionTypeId]: false,
      }));
      if (warningTimeout.current) {
        clearTimeout(warningTimeout.current);
      }
    }

    // Cleanup on unmount or change
    return () => {
      if (warningTimeout.current) {
        clearTimeout(warningTimeout.current);
      }
    };
  }, [excelHeaders, selectedRecognitionTypeId, templateResponseLoading]);

  // Download logic in useEffect, triggered when headers for pendingDownloadId are available
  useEffect(() => {
    const doDownload = async () => {
      if (
        pendingDownloadId &&
        selectedRecognitionTypeId === pendingDownloadId &&
        excelHeaders &&
        excelHeaders.length > 0
      ) {
        try {
          // Create a new workbook and worksheet
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet('My Sheet');

          // Define Excel headers dynamically from props
          const columns = excelHeaders.map((header: any) => ({
            header: capitalizeInitials(header?.criterionKey),
            key: header?.id,
            width: 20,
          }));

          worksheet.columns = columns || [];
          const buffer = await workbook.xlsx.writeBuffer();

          // Create a Blob and download using native APIs
          const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });

          // Generate a download link and programmatically click it
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'IncentiveImportTemplate.xlsx';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          // Close the popover after successful download
          setPopoverVisible(false);

          NotificationMessage.success({
            message: 'Template downloaded successfully!',
          });
        } catch (error) {
          NotificationMessage.error({
            message: 'Failed to download template. Please try again.',
          });
        } finally {
          setPendingDownloadId(null);
        }
      }
    };
    doDownload();
  }, [excelHeaders, pendingDownloadId, selectedRecognitionTypeId]);

  const handleTemplateDownload = async (recognitionId: string) => {
    setLoadingItems({ ...loadingItems, [recognitionId]: true });

    try {
      const headers = await fetchExcelHeaders(recognitionId);

      if (!headers || headers.length === 0) {
        NotificationMessage.warning({
          message: 'No headers found. Please try again.',
        });
        setLoadingItems({ ...loadingItems, [recognitionId]: false });
        return;
      }

      // ...proceed with ExcelJS logic using headers
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('My Sheet');
      const columns = headers.map((header: any) => ({
        header: capitalizeInitials(header?.criterionKey),
        key: header?.id,
        width: 20,
      }));
      worksheet.columns = columns || [];
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'IncentiveImportTemplate.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setPopoverVisible(false);

      NotificationMessage.success({
        message: 'Template downloaded successfully!',
      });
    } catch (error) {
      NotificationMessage.error({
        message: 'Failed to download template. Please try again.',
      });
    } finally {
      setLoadingItems({ ...loadingItems, [recognitionId]: false });
    }
  };

  // Check if the current recognition type is loading
  const isCurrentRecognitionLoading = loadingItems[selectedRecognitionTypeId];

  return childRecognitionData?.length > 0 ? (
    <Popover
      content={
        <div>
          {childRecognitionData?.map((item: any) => (
            <div
              key={item?.id}
              onClick={() => {
                // Only prevent click if this specific item is loading
                if (!loadingItems[item?.id]) {
                  handleTemplateDownload(item?.id || '');
                }
              }}
              className={`flex flex-col border-[1px] w-32 sm:w-60 my-2 rounded-xl border-gray-300 p-2 cursor-pointer hover:bg-gray-100 transition ${
                loadingItems[item?.id]
                  ? 'opacity-70 cursor-not-allowed bg-gray-50 border-blue-300'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex-1">{item?.name}</span>
                {loadingItems[item?.id] && (
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center ml-2">
                    <div className="w-6 h-6 border-4 border-blue-800 border-t-transparent rounded-full animate-spin shadow-sm"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      }
      trigger="click"
      open={popoverVisible}
      onOpenChange={setPopoverVisible}
    >
      <Button
        loading={templateResponseLoading || responseLoading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#B2B2FF',
          color: '#3636F0',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '12px',
          height: '30px',
        }}
      >
        Download Format
      </Button>
    </Popover>
  ) : (
    <Button
      loading={templateResponseLoading || responseLoading}
      style={{
        padding: '10px 20px',
        backgroundColor: '#B2B2FF',
        color: '#3636F0',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '12px',
        height: '30px',
      }}
      onClick={() => {
        // Only prevent click if the current recognition type is loading
        if (!isCurrentRecognitionLoading) {
          handleTemplateDownload(activeKey);
        }
      }}
    >
      Download Format
    </Button>
  );
};

export default DownloadExcelButton;
