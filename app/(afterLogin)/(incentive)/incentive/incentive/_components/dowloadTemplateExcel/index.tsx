import React from 'react';
import ExcelJS from 'exceljs';
import { ProjectData } from '@/store/uistate/features/incentive/incentive'; // Import the interface

interface DownloadExcelButtonProps {
  headers: string[]; // Headers passed as props
  //   data: ProjectData[]; // Data passed as props
}

const DownloadExcelButton: React.FC<DownloadExcelButtonProps> = ({
  headers,
  //   data,
}) => {
  const handleDownload = async () => {
    if (headers.length === 0) {
      alert('Headers are not loaded yet!');
      return;
    }

    // 1. Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('My Sheet');

    // 2. Define Excel headers dynamically from props
    const columns = headers.map((header) => ({
      header: header, // Header name passed from props
      key: header.toLowerCase().replace(/\s+/g, '_'), // Create key for each column (adjust to your needs)
      width: 20, // Set default width, can adjust based on your data
    }));
    worksheet.columns = columns;

    // 3. Add rows to the worksheet dynamically based on data
    // data.forEach((item) => {
    //   const row: { [key: string]: any } = {}; // Define row as an object with dynamic keys

    //   // Iterate through headers to build a row object based on the provided data
    //   headers.forEach((header) => {
    //     const key = header.toLowerCase().replace(/\s+/g, '_'); // Dynamic key for each header
    //     row[key] = item[key as keyof ProjectData]; // Assign data to the corresponding row key
    //   });

    //   worksheet.addRow(row);
    // });

    // 4. Create Excel file as a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // 5. Create a Blob and download using native APIs
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // 6. Generate a download link and programmatically click it
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dynamic_example.xlsx'; // Desired filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up
    URL.revokeObjectURL(url); // Free up memory
  };

  return (
    <button
      onClick={handleDownload}
      style={{
        padding: '10px 20px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
      }}
    >
      Download Excel
    </button>
  );
};

export default DownloadExcelButton;
