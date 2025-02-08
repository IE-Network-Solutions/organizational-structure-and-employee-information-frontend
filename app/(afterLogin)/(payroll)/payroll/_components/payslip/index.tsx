import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { fileUpload } from '@/utils/fileUpload';
import { useSendEmail } from '@/store/server/features/payroll/payroll/mutation';
import dayjs from 'dayjs';
import { Button } from 'antd';

const PaySlip = ({ data }: { data: any[] }) => {
  const [loading, setLoading] = useState(false);
  const { mutate: sendEmail } = useSendEmail();

  const sendPayrollWithPDF = async () => {
    setLoading(true);
    for (let i = 0; i < data.length; i++) {
      const employeeData = data[i];
      const input = document.getElementById('payslip');

      if (!input) {
        return;
      }

      try {
        const canvas = await html2canvas(input, { scale: 1 });
        const imgWidth = 190;
        const pageHeight = 280;
        let imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pdf = new jsPDF('p', 'mm', 'a4');

        const position = 10;
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

          const imgData = croppedCanvas.toDataURL('image/jpeg', 0.7);
          const newImgHeight = (cropHeightPx * imgWidth) / canvas.width;

          pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, newImgHeight);
          imgHeight -= pageHeight;
          yOffset += cropHeightPx;

          if (imgHeight > 0) pdf.addPage();
        }

        const pdfBlob = pdf.output('blob');
        const file = new File(
          [pdfBlob],
          `payslip_${employeeData?.employeeId}.pdf`,
          {
            type: 'application/pdf',
          },
        );

        const uploadResponse = await fileUpload(file);

        if (!uploadResponse?.data) {
          throw new Error('File upload failed.');
        }

        const emailData = {
          from: 'selamnew@ienetworksolutions.com',
          replyTo: 'selamnew@ienetworksolutions.com',
          to: employeeData?.employeeInfo?.email,
          subject: 'Your Pay Slip',
          html: `<h1>Pay Slip</h1><p>Dear ${employeeData?.firstName},</p><p>Thank you for being with us.</p>`,
          cc: [],
          bcc: [],
          attachments: [
            {
              filename: `payslip_${employeeData?.employeeId}.pdf`,
              path: uploadResponse.data.image,
            },
          ],
        };

        sendEmail(
          { values: emailData },
          {
            onSuccess: () => {},
            onError: () => {},
          },
        );
      } catch (error) {}
    }
    setLoading(false);
  };

  return (
    <>
      <Button
        type="default"
        loading={loading}
        onClick={sendPayrollWithPDF}
        className="text-white bg-violet-500 border-none p-6"
      >
        Send Email for employees
      </Button>
      {data?.map((employeeData) => (
        <div
          key={employeeData?.employeeId} // Ensure unique key for each employee
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
            Pay Slip for the Month of {dayjs().format('MMMM')}
          </h2>

          {/* Employee Details */}
          <div className="bg-[#00b0f0] text-white font-bold p-2 mt-4">
            Employee Name: {employeeData?.employeeInfo?.firstName}{' '}
            {employeeData?.employeeInfo?.lastName}
          </div>
          <table className="w-full border border-gray-300 mt-2">
            <tbody>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300 font-semibold">
                  Company Name:
                </td>
                <td className="p-2 border border-gray-300">IE Networks</td>
                <td className="p-2 border border-gray-300 font-semibold">
                  Date Hired:
                </td>
                <td className="p-2 border border-gray-300">
                  {dayjs(
                    employeeData?.employeeInfo?.employeeInformation?.joinedDate,
                  ).format('YYYY-MM-DD')}
                </td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300 font-semibold">
                  Salary Period:
                </td>
                <td className="p-2 border border-gray-300">30</td>
                <td className="p-2 border border-gray-300 font-semibold">
                  TIN:
                </td>
                <td className="p-2 border border-gray-300">--</td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300 font-semibold">
                  Location:
                </td>
                <td className="p-2 border border-gray-300">
                  {
                    employeeData?.employeeInfo?.employeeInformation?.addresses
                      ?.subCity
                  }
                </td>
                <td className="p-2 border border-gray-300 font-semibold">
                  Pay Date:
                </td>
                <td className="p-2 border border-gray-300">
                  {dayjs().format('YYYY-MM-DD')}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Earnings Table */}
          <div className="bg-[#00b0f0] text-white font-bold p-2 mt-4">
            Earning
          </div>
          <table className="w-full border border-gray-300">
            <tbody>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">Basic Salary</td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.employeeInfo?.basicSalaries[0]?.basicSalary ||
                    'ETB 0'}
                </td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">
                  Transport Allowance
                </td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.breakdown?.allowances?.find(
                    (allowance: any) =>
                      allowance.type === 'Transport Allowance',
                  )
                    ? employeeData?.breakdown?.allowances.find(
                        (allowance: any) =>
                          allowance.type === 'Transport Allowance',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">Total Earning</td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.netPay}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Bonuses Table */}
          <div className="bg-[#00b0f0] text-white font-bold p-2 mt-4">
            Bonus
          </div>
          <table className="w-full border border-gray-300">
            <tbody>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">Variable Pay</td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.breakdown?.variablePay?.length > 0
                    ? employeeData?.breakdown?.variablePay.find(
                        (vp: any) => vp.type === 'VP',
                      )?.amount || 'ETB 0'
                    : 'ETB 0'}
                </td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">
                  GYM payment merit
                </td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.breakdown?.merits?.find(
                    (merit: any) => merit.type === 'GYM payment merit',
                  )
                    ? employeeData?.breakdown?.merits.find(
                        (merit: any) => merit.type === 'GYM payment merit',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">
                  Training registration merit
                </td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.breakdown?.merits?.find(
                    (merit: any) =>
                      merit.type === 'Training registration merit',
                  )
                    ? employeeData?.breakdown?.merits.find(
                        (merit: any) =>
                          merit.type === 'Training registration merit',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">GIFT</td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.breakdown?.merits?.find(
                    (merit: any) => merit.type === 'GIFT',
                  )
                    ? employeeData?.breakdown?.merits.find(
                        (merit: any) => merit.type === 'GIFT',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">Medical merit</td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.breakdown?.merits?.find(
                    (merit: any) => merit.type === 'Medical merit',
                  )
                    ? employeeData?.breakdown?.merits.find(
                        (merit: any) => merit.type === 'Medical merit',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">
                  Training payment merit
                </td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.breakdown?.merits?.find(
                    (merit: any) => merit.type === 'Training payment merit',
                  )
                    ? employeeData?.breakdown?.merits.find(
                        (merit: any) => merit.type === 'Training payment merit',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">Loan merit</td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.breakdown?.merits?.find(
                    (merit: any) => merit.type === 'Loan merit',
                  )
                    ? employeeData?.breakdown?.merits.find(
                        (merit: any) => merit.type === 'Loan merit',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">Other Merit</td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.breakdown?.merits?.find(
                    (merit: any) => merit.type === 'Other Merit',
                  )
                    ? employeeData?.breakdown?.merits.find(
                        (merit: any) => merit.type === 'Other Merit',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">Total Earnings</td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.breakdown?.merits?.find(
                    (merit: any) => merit.type === 'Total Earnings',
                  )
                    ? employeeData?.breakdown?.merits.find(
                        (merit: any) => merit.type === 'Total Earnings',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Deduction Table */}
          <div className="bg-[#00b0f0] text-white font-bold p-2 mt-4">
            Deduction
          </div>
          <table className="w-full border border-gray-300">
            <tbody>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">
                  Cost Sharing Deduction
                </td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.breakdown?.deductions?.find(
                    (deduction: any) =>
                      deduction.type.toLowerCase() === 'cost sharing deduction',
                  )
                    ? employeeData?.breakdown?.deductions.find(
                        (deduction: any) =>
                          deduction.type.toLowerCase() ===
                          'cost sharing deduction',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">
                  (AAA) Penalty Deduction
                </td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.breakdown?.deductions?.find(
                    (deduction: any) =>
                      deduction.type.toLowerCase() ===
                      '(aaa) penality deduction',
                  )
                    ? employeeData?.breakdown?.deductions.find(
                        (deduction: any) =>
                          deduction.type.toLowerCase() ===
                          '(aaa) penality deduction',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">
                  Project Related Deduction
                </td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.breakdown?.deductions?.find(
                    (deduction: any) =>
                      deduction.type.toLowerCase() ===
                      'project related deduction',
                  )
                    ? employeeData?.breakdown?.deductions.find(
                        (deduction: any) =>
                          deduction.type.toLowerCase() ===
                          'project related deduction',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">
                  Commitment Deduction
                </td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.breakdown?.deductions?.find(
                    (deduction: any) =>
                      deduction.type.toLowerCase() === 'commitment deduction',
                  )
                    ? employeeData?.breakdown?.deductions.find(
                        (deduction: any) =>
                          deduction.type.toLowerCase() ===
                          'commitment deduction',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">
                  Facility Related Deduction
                </td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.breakdown?.deductions?.find(
                    (deduction: any) =>
                      deduction.type.toLowerCase() ===
                      'facility related deduction',
                  )
                    ? employeeData?.breakdown?.deductions.find(
                        (deduction: any) =>
                          deduction.type.toLowerCase() ===
                          'facility related deduction',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">Meal Deduction</td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.breakdown?.deductions?.find(
                    (deduction: any) =>
                      deduction.type.toLowerCase() === 'meal deduction',
                  )
                    ? employeeData?.breakdown?.deductions.find(
                        (deduction: any) =>
                          deduction.type.toLowerCase() === 'meal deduction',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">
                  Car Related Deduction
                </td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.breakdown?.deductions?.find(
                    (deduction: any) =>
                      deduction.type.toLowerCase() === 'car related deduction',
                  )
                    ? employeeData?.breakdown?.deductions.find(
                        (deduction: any) =>
                          deduction.type.toLowerCase() ===
                          'car related deduction',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">
                  Failed Exam Deduction
                </td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.breakdown?.deductions?.find(
                    (deduction: any) =>
                      deduction.type.toLowerCase() === 'failed exam deduction',
                  )
                    ? employeeData?.breakdown?.deductions.find(
                        (deduction: any) =>
                          deduction.type.toLowerCase() ===
                          'failed exam deduction',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">Reprimand</td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.breakdown?.deductions?.find(
                    (deduction: any) =>
                      deduction.type.toLowerCase() === 'reprimand',
                  )
                    ? employeeData?.breakdown?.deductions.find(
                        (deduction: any) =>
                          deduction.type.toLowerCase() === 'reprimand',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300">
                  Absence from Workplace without Permission
                </td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.breakdown?.deductions?.find(
                    (deduction: any) =>
                      deduction.type.toLowerCase() ===
                      'absence from workplace without permission',
                  )
                    ? employeeData?.breakdown?.deductions.find(
                        (deduction: any) =>
                          deduction.type.toLowerCase() ===
                          'absence from workplace without permission',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
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
                <td className="p-2 border border-gray-300">Bank</td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300 font-semibold">
                  Bank Name:
                </td>
                <td className="p-2 border border-gray-300">Enat Bank</td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300 font-semibold">
                  Account Number:
                </td>
                <td className="p-2 border border-gray-300">0061104289613001</td>
              </tr>
              <tr className="border border-gray-300">
                <td className="p-2 border border-gray-300 font-semibold">
                  Amount:
                </td>
                <td className="p-2 border border-gray-300">
                  {employeeData?.netPay}
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
      ))}
    </>
  );
};

export default PaySlip;
