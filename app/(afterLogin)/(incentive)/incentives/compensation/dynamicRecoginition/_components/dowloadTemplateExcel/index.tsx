import React, { useEffect, useState, useRef } from 'react';
import ExcelJS from 'exceljs';
import { Button, Popover } from 'antd';
import { useExcelHeaders } from '@/store/server/features/incentive/all/queries';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import { useRecognitionByParentId } from '@/store/server/features/incentive/other/queries';
import { capitalizeInitials } from '@/helpers/capitalizeInitals';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const DownloadExcelButton: React.FC = () => {
  const { selectedRecognitionTypeId, activeKey, setSelectedRecognitionTypeId } =
    useIncentiveStore();

  const [loadingItems, setLoadingItems] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [popoverVisible, setPopoverVisible] = useState(false);

  const { data: excelHeaders, isLoading: templateResponseLoading } =
    useExcelHeaders(selectedRecognitionTypeId);

  const { data: childRecognitionData, isLoading: responseLoading } =
    useRecognitionByParentId(activeKey !== '1' ? activeKey : '');

  const warningTimeout = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (selectedRecognitionTypeId) {
      setLoadingItems({ ...loadingItems, [selectedRecognitionTypeId]: true });
    }
  }, [selectedRecognitionTypeId]);

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
  const handleTemplateDownload = async (recognitionId: string) => {
    // Set loading state for this specific item
    setLoadingItems({ ...loadingItems, [recognitionId]: true });

    // Set the recognition type ID first
    setSelectedRecognitionTypeId(recognitionId);

    try {
      // Wait for headers to be loaded with a timeout
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds with 100ms intervals

      while (!excelHeaders?.length && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      // If headers are still not loaded after waiting, keep spinning
      // The loading state will remain until headers are loaded or user tries again
      if (!excelHeaders?.length) {
        // Don't clear loading state - keep spinning until headers load
        return;
      }

      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('My Sheet');

      // Define Excel headers dynamically from props
      const columns = excelHeaders?.map((header: any) => {
        return {
          header: capitalizeInitials(header?.criterionKey),
          key: header?.id,
          width: 20,
        };
      });

      if (columns) {
        worksheet.columns = columns;
      } else {
        worksheet.columns = [];
      }

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
      // Clear loading state on error
      setLoadingItems({ ...loadingItems, [recognitionId]: false });
    } finally {
      // Only clear loading state if we actually completed the download
      // If headers are still not loaded, keep the loading state
      if (excelHeaders?.length) {
        setLoadingItems({ ...loadingItems, [recognitionId]: false });
      }
    }
  };
  useEffect(() => {
    if (selectedRecognitionTypeId) {
      handleTemplateDownload(selectedRecognitionTypeId);
    }
  }, [selectedRecognitionTypeId]);
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
