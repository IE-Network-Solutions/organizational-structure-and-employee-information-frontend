import React from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { fileUpload } from '@/utils/fileUpload';

interface Earnings {
  description: string;
  amount: string;
}

interface Bonus {
  description: string;
  amount: string;
}

interface Deduction {
  description: string;
  amount: string;
}

interface PaySlipData {
  employeeName: string;
  companyName: string;
  jobTitle: string;
  dateHired: string;
  salaryPeriod: number;
  tin: string;
  location: string;
  payDate: string;
  earnings: Earnings[];
  bonuses: Bonus[];
  deduction: Deduction[];
  paymentMethod: string;
  bankName: string;
  accountNumber: string;
}

interface PaySlipProps {
  data: PaySlipData;
}

const PaySlip: React.FC<PaySlipProps> = ({ data }) => {
  const generatePDFAndUpload = async () => {
    const input = document.getElementById('payslip');

    if (!input) {
      console.error("Element with ID 'payslip' not found.");
      return;
    }

    try {
      const canvas = await html2canvas(input, { scale: 1 });
      const imgWidth = 190;
      const pageHeight = 280;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a4');

      let position = 10;
      let yOffset = 0;

      while (imgHeight > 0) {
        const croppedCanvas = document.createElement('canvas');
        const ctx = croppedCanvas.getContext('2d');

        const cropHeightPx = Math.min(
          pageHeight * (canvas.height / imgHeight),
          canvas.height - yOffset,
        );

        croppedCanvas.width = canvas.width;
        croppedCanvas.height = cropHeightPx;

        ctx?.drawImage(
          canvas,
          0,
          yOffset,
          canvas.width,
          cropHeightPx,
          0,
          0,
          canvas.width,
          cropHeightPx,
        );

        const imgData = croppedCanvas.toDataURL('image/jpeg', 0.7); // Use JPEG with compression
        const newImgHeight = (cropHeightPx * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, newImgHeight);
        imgHeight -= pageHeight;
        yOffset += cropHeightPx;

        if (imgHeight > 0) pdf.addPage();
      }

      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], 'payslip.pdf', {
        type: 'application/pdf',
      });

      const uploadResponse = await fileUpload(file);
      console.log('File uploaded successfully:', uploadResponse);
    } catch (error) {
      console.error('Error generating or uploading PDF:', error);
    }
  };

  return (
    <>
      <div
        id="payslip"
        className="max-w-2xl mx-auto p-6 bg-white border border-gray-300 relative"
      >
        {/* Transparent Stamp (Top Half) */}
        <img
          src="/image/ie.png"
          alt="IE Stamp"
          className="absolute top-[500px] right-10 w-48 h-auto opacity-30"
        />

        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <img
              src="/image/IE.png" // Logo
              alt="IE Logo"
              className="w-24 h-auto"
            />
          </div>
          <div className="text-sm text-gray-500">
            <a
              href="https://www.ienetworksolutions.com"
              className="text-blue-500 underline"
            >
              www.ienetworksolutions.com
            </a>
            <p>Festival 22, 7th floor</p>
            <p>Addis Ababa, Ethiopia</p>
          </div>
        </div>

        <h2 className="text-center font-bold text-lg mt-4 border-b-2 border-gray-400 pb-2">
          Pay Slip for the Month of December
        </h2>

        {/* Employee Details */}
        <div className="bg-[#00b0f0] text-white font-bold p-2 mt-4">
          Employee Name: {data.employeeName}
        </div>
        <table className="w-full border border-gray-300 mt-2">
          <tbody>
            <tr className="border border-gray-300">
              <td className="p-2 border border-gray-300 font-semibold">
                Company Name:
              </td>
              <td className="p-2 border border-gray-300">{data.companyName}</td>
              <td className="p-2 border border-gray-300 font-semibold">
                Date Hired:
              </td>
              <td className="p-2 border border-gray-300">{data.dateHired}</td>
            </tr>
            <tr className="border border-gray-300">
              <td className="p-2 border border-gray-300 font-semibold">
                Salary Period:
              </td>
              <td className="p-2 border border-gray-300">
                {data.salaryPeriod}
              </td>
              <td className="p-2 border border-gray-300 font-semibold">TIN:</td>
              <td className="p-2 border border-gray-300">{data.tin}</td>
            </tr>
            <tr className="border border-gray-300">
              <td className="p-2 border border-gray-300 font-semibold">
                Location:
              </td>
              <td className="p-2 border border-gray-300">{data.location}</td>
              <td className="p-2 border border-gray-300 font-semibold">
                Pay Date:
              </td>
              <td className="p-2 border border-gray-300">{data.payDate}</td>
            </tr>
          </tbody>
        </table>

        {/* Earnings Table */}
        <div className="bg-[#00b0f0] text-white font-bold p-2 mt-4">
          Earning
        </div>
        <table className="w-full border border-gray-300">
          <tbody>
            {data.earnings.map((item, index) => (
              <tr key={index} className="border border-gray-300">
                <td className="p-2 border border-gray-300">
                  {item.description}
                </td>
                <td className="p-2 border border-gray-300">{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bonuses Table */}
        <div className="bg-[#00b0f0] text-white font-bold p-2 mt-4">Bonus</div>
        <table className="w-full border border-gray-300">
          <tbody>
            {data.bonuses.map((item, index) => (
              <tr key={index} className="border border-gray-300">
                <td className="p-2 border border-gray-300">
                  {item.description}
                </td>
                <td className="p-2 border border-gray-300">{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* deduction Table */}

        <div className="bg-[#00b0f0] text-white font-bold p-2 mt-4">
          Deduction
        </div>
        <table className="w-full border border-gray-300">
          <tbody>
            {data.deduction.map((item, index) => (
              <tr key={index} className="border border-gray-300">
                <td className="p-2 border border-gray-300">
                  {item.description}
                </td>
                <td className="p-2 border border-gray-300">{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Payment Details */}
        <div className="bg-[#00b0f0] text-white font-bold p-2 mt-4">
          Payment Details
        </div>
        <table className="w-full border border-gray-300">
          <tbody>
            <tr className="border border-gray-300">
              <td className="p-2 border border-gray-300 font-semibold">
                Payment Method:
              </td>
              <td className="p-2 border border-gray-300">
                {data.paymentMethod}
              </td>
            </tr>
            <tr className="border border-gray-300">
              <td className="p-2 border border-gray-300 font-semibold">
                Bank Name:
              </td>
              <td className="p-2 border border-gray-300">{data.bankName}</td>
            </tr>
            <tr className="border border-gray-300">
              <td className="p-2 border border-gray-300 font-semibold">
                Account Number:
              </td>
              <td className="p-2 border border-gray-300">
                {data.accountNumber}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Transparent Stamp (Bottom Half) */}
        <img
          src="/image/ie.png"
          alt="IE Stamp"
          className="absolute bottom-48 right-10 w-48 h-auto opacity-30"
        />

        {/* Download Button */}
      </div>
      <button
        onClick={generatePDFAndUpload}
        className="mt-4 bg-[#00b0f0] text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
      >
        Download Pay Slip
      </button>
    </>
  );
};

export default PaySlip;
