import React from 'react';
import ExcelJS from 'exceljs';
import { Button, message, Popover, Skeleton } from 'antd';
import { useExcelHeaders } from '@/store/server/features/incentive/all/queries';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import {
  useAllRecognition,
  useRecognitionByParentId,
} from '@/store/server/features/incentive/other/queries';
import { capitalizeInitials } from '@/helpers/capitalizeInitals';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const DownloadExcelButton: React.FC = () => {
  const { selectedRecognitionTypeId, activeKey, setSelectedRecognitionTypeId } =
    useIncentiveStore();
  const { data: excelHeaders, isLoading: templateResponseLoading } =
    useExcelHeaders(selectedRecognitionTypeId);
  const { data: recognitionData } = useAllRecognition();

  const { data: childRecognitionData, isLoading: responseLoading } =
    useRecognitionByParentId(activeKey !== '1' ? activeKey : '');

  const handleTemplateDownload = async () => {
    if (excelHeaders?.length === 0) {
      NotificationMessage.warning({ message: 'Headers are not loaded yet!' });
      return;
    }

    //  Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('My Sheet');

    //  Define Excel headers dynamically from props
    const columns = excelHeaders?.map((header: any) => {
      return {
        header: capitalizeInitials(header?.criterionKey), // Header name passed from props
        key: header?.id,
        width: 20,
      };
    });

    console.log(columns, 'columns');

    if (columns) {
      worksheet.columns = columns;
    } else {
      worksheet.columns = [];
    }
    const buffer = await workbook.xlsx.writeBuffer();

    //  Create a Blob and download using native APIs
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    //  Generate a download link and programmatically click it
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'IncentiveImportTemplate.xlsx'; // Desired filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up
    URL.revokeObjectURL(url); // Free up memory
  };

  if (templateResponseLoading || responseLoading) {
    return <Skeleton.Button active />;
  }

  return childRecognitionData?.length > 0 ? (
    <Popover
      content={
        <div>
          {childRecognitionData.map((item: any) => (
            <div
              key={item?.id}
              onClick={() => {
                handleTemplateDownload();
                setSelectedRecognitionTypeId(item?.id);
              }}
              className="flex flex-col border-[1px] w-60 my-2 rounded-xl border-gray-300 p-2 cursor-pointer hover:bg-gray-100 transition"
            >
              {item?.name}
            </div>
          ))}
        </div>
      }
      trigger="click"
    >
      <Button
        style={{
          padding: '10px 20px',
          backgroundColor: '#B2B2FF',
          color: '#3636F0',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
        }}
      >
        Download Format
      </Button>
    </Popover>
  ) : (
    <Button
      style={{
        padding: '10px 20px',
        backgroundColor: '#B2B2FF',
        color: '#3636F0',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
      }}
      onClick={() => {
        handleTemplateDownload();
        setSelectedRecognitionTypeId(activeKey);
      }}
    >
      Download Format
    </Button>
  );
};

export default DownloadExcelButton;
