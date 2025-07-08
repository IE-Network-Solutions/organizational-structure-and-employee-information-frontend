import React from 'react';
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

  const { data: excelHeaders, isLoading: templateResponseLoading } =
    useExcelHeaders(selectedRecognitionTypeId);

  const { data: childRecognitionData, isLoading: responseLoading } =
    useRecognitionByParentId(activeKey !== '1' ? activeKey : '');

  const handleTemplateDownload = async (recognitionId: string) => {
    // Set the recognition type ID first
    setSelectedRecognitionTypeId(recognitionId);

    // Wait for headers to be loaded
    if (!excelHeaders?.length) {
      NotificationMessage.warning({
        message: ' Excel Headers are not loaded yet! Please Try Again',
      });
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
  };

  return childRecognitionData?.length > 0 ? (
    <Popover
      content={
        <div>
          {childRecognitionData?.map((item: any) => (
            <div
              key={item?.id}
              onClick={() => {
                handleTemplateDownload(item?.id || '');
              }}
              className="flex flex-col border-[1px] w-32 sm:w-60 my-2 rounded-xl border-gray-300 p-2 cursor-pointer hover:bg-gray-100 transition"
            >
              {item?.name}
            </div>
          ))}
        </div>
      }
      trigger="click"
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
        handleTemplateDownload(activeKey);
      }}
    >
      Download Format
    </Button>
  );
};

export default DownloadExcelButton;
