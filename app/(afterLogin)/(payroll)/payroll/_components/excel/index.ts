import * as ExcelJS from 'exceljs';

export const useExportData = () => {
  const exportToExcel = async (
    data: any[],
    columns: any[],
    fileName: string,
  ) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(fileName);

    worksheet.columns = columns;

    data.forEach((item) => {
      worksheet.addRow(item);
    });

    worksheet.getRow(1).font = { bold: true, size: 18 };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.xlsx`;
    link.click();
  };

  return { exportToExcel };
};
