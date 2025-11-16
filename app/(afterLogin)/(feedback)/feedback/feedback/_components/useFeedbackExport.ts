import * as ExcelJS from 'exceljs';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import dayjs from 'dayjs';

interface FeedbackExportData {
  issuedTo: string;
  givenBy: string;
  type: string;
  reason: string;
  objective: string;
  name: string;
  actionToBeTaken?: string;
  givenDate: string;
}

export const useFeedbackExport = () => {
  const exportFeedbackData = async (
    data: any[],
    getAllUsers: any,
    getAllFeedbackTypes: any,
    employeeDepartment: any,
    variantType: 'appreciation' | 'reprimand',
    fileName: string = 'Feedback Export',
  ) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Feedback Data');

      // Prepare export data
      const exportData: FeedbackExportData[] = data.map((record: any) => {
        const recipientUser = getAllUsers?.items?.find(
          (item: any) => item.id === record.recipientId,
        );
        const issuerUser = getAllUsers?.items?.find(
          (item: any) => item.id === record.issuerId,
        );
        const feedbackType = getAllFeedbackTypes?.items?.find(
          (item: any) => item.id === record.feedbackTypeId,
        );
        const department = employeeDepartment?.find(
          (item: any) =>
            item.id === record.feedbackVariant?.perspective?.departmentId,
        );

        const exportRow: FeedbackExportData = {
          issuedTo: recipientUser
            ? `${recipientUser?.firstName || ''} ${recipientUser?.middleName || ''} ${recipientUser?.lastName || ''}`.trim()
            : 'Unknown',
          givenBy: issuerUser
            ? `${issuerUser?.firstName || ''} ${issuerUser?.middleName || ''} ${issuerUser?.lastName || ''}`.trim()
            : 'Unknown',
          type: feedbackType?.category || 'Unknown',
          reason: record.reason || 'N/A',
          objective: record.feedbackVariant?.name || 'N/A',
          name: department?.name || '-',
          givenDate: record.createdAt
            ? dayjs(record.createdAt).format('YYYY-MM-DD')
            : 'N/A',
        };

        if (variantType !== 'appreciation') {
          exportRow.actionToBeTaken = record.action || 'N/A';
        }

        return exportRow;
      });

      // Define columns based on variant type
      const columns = [
        { header: 'Issued To', key: 'issuedTo', width: 25 },
        { header: 'Given By', key: 'givenBy', width: 25 },
        { header: 'Type', key: 'type', width: 20 },
        { header: 'Reason', key: 'reason', width: 40 },
        { header: 'Objective', key: 'objective', width: 40 },
        { header: 'Name', key: 'name', width: 25 },
        ...(variantType !== 'appreciation'
          ? [
              {
                header: 'Action To be Taken',
                key: 'actionToBeTaken',
                width: 40,
              },
            ]
          : []),
        { header: 'Given Date', key: 'givenDate', width: 15 },
      ];

      worksheet.columns = columns;

      // Add data rows
      exportData.forEach((row) => {
        worksheet.addRow(row);
      });

      // Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, size: 12, color: { argb: '000000' } };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF3498DB' },
      };
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      });

      // Style data rows
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          // Alternate row colors
          if (rowNumber % 2 === 0) {
            row.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'F8F9FA' },
            };
          }

          // Add borders
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'E0E0E0' } },
              left: { style: 'thin', color: { argb: 'E0E0E0' } },
              bottom: { style: 'thin', color: { argb: 'E0E0E0' } },
              right: { style: 'thin', color: { argb: 'E0E0E0' } },
            };
          });
        }
      });

      // Auto-adjust column widths
      worksheet.columns.forEach((column) => {
        if (column.eachCell) {
          let maxLength = 0;
          column.eachCell({ includeEmpty: true }, (cell) => {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
          });
          column.width = maxLength < 10 ? 10 : maxLength + 2;
        }
      });

      // Generate file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      NotificationMessage.success({
        message: 'Export Successful',
        description: 'Feedback data exported successfully!',
      });

      return true;
    } catch (error) {
      NotificationMessage.error({
        message: 'Export Failed',
        description: 'Failed to export feedback data. Please try again.',
      });
      throw error;
    }
  };

  return { exportFeedbackData };
};
