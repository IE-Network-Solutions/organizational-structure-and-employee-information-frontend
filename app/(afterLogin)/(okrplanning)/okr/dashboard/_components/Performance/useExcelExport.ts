import NotificationMessage from '@/components/common/notification/notificationMessage';
import * as ExcelJS from 'exceljs';

interface EmployeePerformanceData {
  name: string;
  monthly: number | null;
  weekly: number | null;
  daily: number | null;
}

export const useExcelExport = () => {
  const exportPerformanceData = async (
    data: EmployeePerformanceData[],
    fileName: string = 'Average Performance Report',
    filterType: string = 'All',
  ) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Performance Data');

      let columns: any[];
      if (filterType === 'All') {
        columns = [
          { header: 'Employee Name', key: 'name', width: 25 },
          { header: 'Monthly Average (%)', key: 'monthly', width: 20 },
          { header: 'Weekly Average (%)', key: 'weekly', width: 20 },
          { header: 'Daily Average (%)', key: 'daily', width: 20 },
        ];
      } else {
        columns = [
          { header: 'Employee Name', key: 'name', width: 25 },
          {
            header: `${filterType} Average (%)`,
            key: 'performance',
            width: 20,
          },
        ];
      }

      worksheet.columns = columns;

      data.forEach((employee) => {
        if (filterType === 'All') {
          worksheet.addRow({
            name: employee.name,
            monthly: employee.monthly ?? '-',
            weekly: employee.weekly ?? '-',
            daily: employee.daily ?? '-',
          });
        } else {
          const performance =
            filterType === 'Monthly'
              ? employee.monthly
              : filterType === 'Weekly'
                ? employee.weekly
                : employee.daily;
          worksheet.addRow({
            name: employee.name,
            performance: performance ?? '-',
          });
        }
      });

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, size: 12, color: { argb: '000000' } };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          if (rowNumber % 2 === 0) {
            row.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'F8F9FA' },
            };
          }

          row.getCell(1).alignment = { horizontal: 'center' };
          if (filterType === 'All') {
            row.getCell(3).alignment = { horizontal: 'center' };
            row.getCell(4).alignment = { horizontal: 'center' };
            row.getCell(5).alignment = { horizontal: 'center' };
          } else {
            row.getCell(3).alignment = { horizontal: 'center' };
          }

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

      worksheet.insertRow(1, ['Average Performance Report']);
      const mergeRange = filterType === 'All' ? 'A1:E1' : 'A1:B1';
      worksheet.mergeCells(mergeRange);
      const titleCell = worksheet.getCell('A1');
      titleCell.font = { bold: true, size: 16, color: { argb: '4C4CFF' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F0F0FF' },
      };

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

      return true;
    } catch (error) {
      NotificationMessage.error({
        message: 'Failed to download report. Please try again.',
      });
    }
  };

  return { exportPerformanceData };
};
