import React from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { fileUpload } from '@/utils/fileUpload';
import { useSendEmail } from '@/store/server/features/payroll/payroll/mutation';
import dayjs from 'dayjs';
import { Button } from 'antd';

const PaySlip = ({ data }: { data: any[] }) => {
  const { mutate: sendEmail } = useSendEmail();

  const sendPayrollWithPDF = async () => {
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

        if (!uploadResponse?.image) {
          throw new Error('File upload failed.');
        }

        const emailData = {
          from: 'selamnew@ienetworksolutions.com',
          replyTo: 'selamnew@ienetworksolutions.com',
          to: 'surafel@ienetworks.co',
          subject: 'Your Pay Slip',
          html: `<h1>Pay Slip</h1><p>Dear ${employeeData?.firstName},</p><p>Thank you for being with us.</p>`,
          cc: [],
          bcc: [],
          attachments: [
            {
              filename: `payslip_${employeeData?.employeeId}.pdf`,
              path: uploadResponse.image,
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
  };
  return (
    <>
      <Button
        id="payroll-payslip-send-email-click-button"
        data-cy="payroll-payslip-send-email-click-button"
        type="default"
        // loading={loading}
        onClick={sendPayrollWithPDF}
        className="text-white bg-primary border-none p-6"
      >
        Send Email for employees
      </Button>
      {data?.map((employeeData) => (
        <div
          key={employeeData?.employeeId} // Ensure unique key for each employee
          id="payslip"
          data-cy={`payroll-payslip-document-view-container-${employeeData?.employeeId}`}
          className="max-w-2xl mx-auto p-6 bg-white border border-gray-300 relative"
        >
          {/* Transparent Stamp (Top Half) */}
          <img
            id={`payroll-payslip-top-stamp-view-image-${employeeData?.employeeId}`}
            data-cy={`payroll-payslip-top-stamp-view-image-${employeeData?.employeeId}`}
            src="/image/ie.png"
            alt="IE Stamp"
            className="absolute top-[500px] right-10 w-48 h-auto opacity-30"
          />

          {/* Header Section */}
          <div
            id={`payroll-payslip-header-view-container-${employeeData?.employeeId}`}
            data-cy={`payroll-payslip-header-view-container-${employeeData?.employeeId}`}
            className="flex justify-between items-center"
          >
            <div
              id={`payroll-payslip-logo-view-container-${employeeData?.employeeId}`}
              data-cy={`payroll-payslip-logo-view-container-${employeeData?.employeeId}`}
            >
              <img
                id={`payroll-payslip-logo-view-image-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-logo-view-image-${employeeData?.employeeId}`}
                src="/image/IE.png" // Logo
                alt="IE Logo"
                className="w-24 h-auto"
              />
            </div>
            <div
              id={`payroll-payslip-company-info-view-container-${employeeData?.employeeId}`}
              data-cy={`payroll-payslip-company-info-view-container-${employeeData?.employeeId}`}
              className="text-sm text-gray-500"
            >
              <a
                id={`payroll-payslip-company-info-link-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-company-info-link-${employeeData?.employeeId}`}
                href="https://www.ienetworksolutions.com"
                className="text-blue-500 underline"
              >
                www.ienetworksolutions.com
              </a>
              <p
                id={`payroll-payslip-company-info-address-line1-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-company-info-address-line1-${employeeData?.employeeId}`}
              >
                Festival 22, 7th floor
              </p>
              <p
                id={`payroll-payslip-company-info-address-line2-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-company-info-address-line2-${employeeData?.employeeId}`}
              >
                Addis Ababa, Ethiopia
              </p>
            </div>
          </div>

          <h2
            id={`payroll-payslip-title-view-text-${employeeData?.employeeId}`}
            data-cy={`payroll-payslip-title-view-text-${employeeData?.employeeId}`}
            className="text-center font-bold text-lg mt-4 border-b-2 border-gray-400 pb-2"
          >
            Pay Slip for the Month of {dayjs().format('MMMM')}
          </h2>

          {/* Employee Details */}
          <div
            id={`payroll-payslip-employee-banner-view-container-${employeeData?.employeeId}`}
            data-cy={`payroll-payslip-employee-banner-view-container-${employeeData?.employeeId}`}
            className="bg-[#00b0f0] text-white font-bold p-2 mt-4"
          >
            Employee Name: {employeeData?.employeeInfo?.firstName}{' '}
            {employeeData?.employeeInfo?.lastName}
            {employeeData?.employeeInfo?.employeeInformation?.additionalInformation?.tinNumber && (
              <span className="ml-2 text-sm font-normal">
                (TIN: {employeeData?.employeeInfo?.employeeInformation?.additionalInformation?.tinNumber})
              </span>
            )}
          </div>
          <table
            id={`payroll-payslip-employee-details-view-table-${employeeData?.employeeId}`}
            data-cy={`payroll-payslip-employee-details-view-table-${employeeData?.employeeId}`}
            className="w-full border border-gray-300 mt-2"
          >
            <tbody
              id={`payroll-payslip-employee-details-view-tbody-${employeeData?.employeeId}`}
              data-cy={`payroll-payslip-employee-details-view-tbody-${employeeData?.employeeId}`}
            >
              <tr
                id={`payroll-payslip-employee-details-company-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-employee-details-company-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-employee-details-company-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-employee-details-company-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300 font-semibold"
                >
                  Company Name:
                </td>
                <td
                  id={`payroll-payslip-employee-details-company-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-employee-details-company-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  IE Networks
                </td>
                <td
                  id={`payroll-payslip-employee-details-hired-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-employee-details-hired-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300 font-semibold"
                >
                  Date Hired:
                </td>
                <td
                  id={`payroll-payslip-employee-details-hired-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-employee-details-hired-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  {dayjs(
                    employeeData?.employeeInfo?.employeeInformation?.joinedDate,
                  ).format('YYYY-MM-DD')}
                </td>
              </tr>
              <tr
                id={`payroll-payslip-employee-details-salary-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-employee-details-salary-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-employee-details-salary-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-employee-details-salary-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300 font-semibold"
                >
                  Salary Period:
                </td>
                <td
                  id={`payroll-payslip-employee-details-salary-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-employee-details-salary-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  30
                </td>
                <td
                  id={`payroll-payslip-employee-details-tin-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-employee-details-tin-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300 font-semibold"
                >
                  TIN:
                </td>
                <td
                  id={`payroll-payslip-employee-details-tin-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-employee-details-tin-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  {employeeData?.employeeInfo?.employeeInformation?.additionalInformation?.tinNumber || '--'}
                </td>
              </tr>
              <tr
                id={`payroll-payslip-employee-details-location-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-employee-details-location-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-employee-details-location-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-employee-details-location-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300 font-semibold"
                >
                  Location:
                </td>
                <td
                  id={`payroll-payslip-employee-details-location-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-employee-details-location-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  {
                    employeeData?.employeeInfo?.employeeInformation?.addresses
                      ?.subCity
                  }
                </td>
                <td
                  id={`payroll-payslip-employee-details-paydate-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-employee-details-paydate-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300 font-semibold"
                >
                  Pay Date:
                </td>
                <td
                  id={`payroll-payslip-employee-details-paydate-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-employee-details-paydate-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  {dayjs().format('YYYY-MM-DD')}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Earnings Table */}
          <div
            id={`payroll-payslip-earnings-banner-view-container-${employeeData?.employeeId}`}
            data-cy={`payroll-payslip-earnings-banner-view-container-${employeeData?.employeeId}`}
            className="bg-[#00b0f0] text-white font-bold p-2 mt-4"
          >
            Earning
          </div>
          <table
            id={`payroll-payslip-earnings-view-table-${employeeData?.employeeId}`}
            data-cy={`payroll-payslip-earnings-view-table-${employeeData?.employeeId}`}
            className="w-full border border-gray-300"
          >
            <tbody
              id={`payroll-payslip-earnings-view-tbody-${employeeData?.employeeId}`}
              data-cy={`payroll-payslip-earnings-view-tbody-${employeeData?.employeeId}`}
            >
              <tr
                id={`payroll-payslip-earnings-basic-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-earnings-basic-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-earnings-basic-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-earnings-basic-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  Basic Salary
                </td>
                <td
                  id={`payroll-payslip-earnings-basic-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-earnings-basic-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  {employeeData?.employeeInfo?.basicSalaries[0]?.basicSalary ||
                    'ETB 0'}
                </td>
              </tr>
              <tr
                id={`payroll-payslip-earnings-transport-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-earnings-transport-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-earnings-transport-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-earnings-transport-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  Transport Allowance
                </td>
                <td
                  id={`payroll-payslip-earnings-transport-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-earnings-transport-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
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
              <tr
                id={`payroll-payslip-earnings-total-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-earnings-total-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-earnings-total-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-earnings-total-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  Total Earning
                </td>
                <td
                  id={`payroll-payslip-earnings-total-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-earnings-total-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  {employeeData?.netPay}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Bonuses Table */}
          <div
            id={`payroll-payslip-bonus-banner-view-container-${employeeData?.employeeId}`}
            data-cy={`payroll-payslip-bonus-banner-view-container-${employeeData?.employeeId}`}
            className="bg-[#00b0f0] text-white font-bold p-2 mt-4"
          >
            Bonus
          </div>
          <table
            id={`payroll-payslip-bonus-view-table-${employeeData?.employeeId}`}
            data-cy={`payroll-payslip-bonus-view-table-${employeeData?.employeeId}`}
            className="w-full border border-gray-300"
          >
            <tbody
              id={`payroll-payslip-bonus-view-tbody-${employeeData?.employeeId}`}
              data-cy={`payroll-payslip-bonus-view-tbody-${employeeData?.employeeId}`}
            >
              <tr
                id={`payroll-payslip-bonus-variable-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-bonus-variable-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-bonus-variable-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-bonus-variable-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  Variable Pay
                </td>
                <td
                  id={`payroll-payslip-bonus-variable-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-bonus-variable-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  {employeeData?.breakdown?.variablePay?.length > 0
                    ? employeeData?.breakdown?.variablePay.find(
                        (vp: any) => vp.type === 'VP',
                      )?.amount || 'ETB 0'
                    : 'ETB 0'}
                </td>
              </tr>
              <tr
                id={`payroll-payslip-bonus-gym-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-bonus-gym-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-bonus-gym-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-bonus-gym-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  GYM payment merit
                </td>
                <td
                  id={`payroll-payslip-bonus-gym-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-bonus-gym-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  {employeeData?.breakdown?.merits?.find(
                    (merit: any) => merit.type === 'GYM payment merit',
                  )
                    ? employeeData?.breakdown?.merits.find(
                        (merit: any) => merit.type === 'GYM payment merit',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr
                id={`payroll-payslip-bonus-training-registration-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-bonus-training-registration-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-bonus-training-registration-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-bonus-training-registration-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  Training registration merit
                </td>
                <td
                  id={`payroll-payslip-bonus-training-registration-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-bonus-training-registration-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
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
              <tr
                id={`payroll-payslip-bonus-gift-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-bonus-gift-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-bonus-gift-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-bonus-gift-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  GIFT
                </td>
                <td
                  id={`payroll-payslip-bonus-gift-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-bonus-gift-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  {employeeData?.breakdown?.merits?.find(
                    (merit: any) => merit.type === 'GIFT',
                  )
                    ? employeeData?.breakdown?.merits.find(
                        (merit: any) => merit.type === 'GIFT',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr
                id={`payroll-payslip-bonus-medical-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-bonus-medical-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-bonus-medical-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-bonus-medical-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  Medical merit
                </td>
                <td
                  id={`payroll-payslip-bonus-medical-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-bonus-medical-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  {employeeData?.breakdown?.merits?.find(
                    (merit: any) => merit.type === 'Medical merit',
                  )
                    ? employeeData?.breakdown?.merits.find(
                        (merit: any) => merit.type === 'Medical merit',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr
                id={`payroll-payslip-bonus-training-payment-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-bonus-training-payment-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-bonus-training-payment-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-bonus-training-payment-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  Training payment merit
                </td>
                <td
                  id={`payroll-payslip-bonus-training-payment-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-bonus-training-payment-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  {employeeData?.breakdown?.merits?.find(
                    (merit: any) => merit.type === 'Training payment merit',
                  )
                    ? employeeData?.breakdown?.merits.find(
                        (merit: any) => merit.type === 'Training payment merit',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr
                id={`payroll-payslip-bonus-loan-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-bonus-loan-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-bonus-loan-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-bonus-loan-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  Loan merit
                </td>
                <td
                  id={`payroll-payslip-bonus-loan-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-bonus-loan-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  {employeeData?.breakdown?.merits?.find(
                    (merit: any) => merit.type === 'Loan merit',
                  )
                    ? employeeData?.breakdown?.merits.find(
                        (merit: any) => merit.type === 'Loan merit',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr
                id={`payroll-payslip-bonus-other-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-bonus-other-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-bonus-other-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-bonus-other-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  Other Merit
                </td>
                <td
                  id={`payroll-payslip-bonus-other-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-bonus-other-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  {employeeData?.breakdown?.merits?.find(
                    (merit: any) => merit.type === 'Other Merit',
                  )
                    ? employeeData?.breakdown?.merits.find(
                        (merit: any) => merit.type === 'Other Merit',
                      ).amount
                    : 'ETB 0'}
                </td>
              </tr>
              <tr
                id={`payroll-payslip-bonus-total-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-bonus-total-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-bonus-total-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-bonus-total-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  Total Earnings
                </td>
                <td
                  id={`payroll-payslip-bonus-total-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-bonus-total-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
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
          <div
            id={`payroll-payslip-deduction-banner-view-container-${employeeData?.employeeId}`}
            data-cy={`payroll-payslip-deduction-banner-view-container-${employeeData?.employeeId}`}
            className="bg-[#00b0f0] text-white font-bold p-2 mt-4"
          >
            Deduction
          </div>
          <table
            id={`payroll-payslip-deduction-view-table-${employeeData?.employeeId}`}
            data-cy={`payroll-payslip-deduction-view-table-${employeeData?.employeeId}`}
            className="w-full border border-gray-300"
          >
            <tbody
              id={`payroll-payslip-deduction-view-tbody-${employeeData?.employeeId}`}
              data-cy={`payroll-payslip-deduction-view-tbody-${employeeData?.employeeId}`}
            >
              <tr
                id={`payroll-payslip-deduction-cost-sharing-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-deduction-cost-sharing-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-deduction-cost-sharing-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-deduction-cost-sharing-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  Cost Sharing Deduction
                </td>
                <td
                  id={`payroll-payslip-deduction-cost-sharing-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-deduction-cost-sharing-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
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
              <tr
                id={`payroll-payslip-deduction-aaa-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-deduction-aaa-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-deduction-aaa-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-deduction-aaa-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  (AAA) Penalty Deduction
                </td>
                <td
                  id={`payroll-payslip-deduction-aaa-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-deduction-aaa-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
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
              <tr
                id={`payroll-payslip-deduction-project-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-deduction-project-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-deduction-project-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-deduction-project-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  Project Related Deduction
                </td>
                <td
                  id={`payroll-payslip-deduction-project-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-deduction-project-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
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
              <tr
                id={`payroll-payslip-deduction-commitment-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-deduction-commitment-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-deduction-commitment-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-deduction-commitment-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  Commitment Deduction
                </td>
                <td
                  id={`payroll-payslip-deduction-commitment-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-deduction-commitment-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
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
              <tr
                id={`payroll-payslip-deduction-facility-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-deduction-facility-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-deduction-facility-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-deduction-facility-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  Facility Related Deduction
                </td>
                <td
                  id={`payroll-payslip-deduction-facility-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-deduction-facility-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
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
              <tr
                id={`payroll-payslip-deduction-meal-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-deduction-meal-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-deduction-meal-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-deduction-meal-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  Meal Deduction
                </td>
                <td
                  id={`payroll-payslip-deduction-meal-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-deduction-meal-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
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
              <tr
                id={`payroll-payslip-deduction-car-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-deduction-car-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-deduction-car-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-deduction-car-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  Car Related Deduction
                </td>
                <td
                  id={`payroll-payslip-deduction-car-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-deduction-car-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
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
              <tr
                id={`payroll-payslip-deduction-failed-exam-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-deduction-failed-exam-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-deduction-failed-exam-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-deduction-failed-exam-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  Failed Exam Deduction
                </td>
                <td
                  id={`payroll-payslip-deduction-failed-exam-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-deduction-failed-exam-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
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
              <tr
                id={`payroll-payslip-deduction-reprimand-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-deduction-reprimand-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-deduction-reprimand-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-deduction-reprimand-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  Reprimand
                </td>
                <td
                  id={`payroll-payslip-deduction-reprimand-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-deduction-reprimand-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
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
              <tr
                id={`payroll-payslip-deduction-absence-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-deduction-absence-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-deduction-absence-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-deduction-absence-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  Absence from Workplace without Permission
                </td>
                <td
                  id={`payroll-payslip-deduction-absence-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-deduction-absence-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
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
          <div
            id={`payroll-payslip-payment-banner-view-container-${employeeData?.employeeId}`}
            data-cy={`payroll-payslip-payment-banner-view-container-${employeeData?.employeeId}`}
            className="bg-[#00b0f0] text-white font-bold p-2 mt-4"
          >
            Payment Details
          </div>
          <table
            id={`payroll-payslip-payment-details-view-table-${employeeData?.employeeId}`}
            data-cy={`payroll-payslip-payment-details-view-table-${employeeData?.employeeId}`}
            className="w-full border border-gray-300"
          >
            <tbody
              id={`payroll-payslip-payment-details-view-tbody-${employeeData?.employeeId}`}
              data-cy={`payroll-payslip-payment-details-view-tbody-${employeeData?.employeeId}`}
            >
              <tr
                id={`payroll-payslip-payment-method-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-payment-method-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-payment-method-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-payment-method-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300 font-semibold"
                >
                  Payment Method:
                </td>
                <td
                  id={`payroll-payslip-payment-method-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-payment-method-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  Bank
                </td>
              </tr>
              <tr
                id={`payroll-payslip-payment-bank-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-payment-bank-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-payment-bank-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-payment-bank-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300 font-semibold"
                >
                  Bank Name:
                </td>
                <td
                  id={`payroll-payslip-payment-bank-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-payment-bank-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  Enat Bank
                </td>
              </tr>
              <tr
                id={`payroll-payslip-payment-account-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-payment-account-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-payment-account-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-payment-account-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300 font-semibold"
                >
                  Account Number:
                </td>
                <td
                  id={`payroll-payslip-payment-account-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-payment-account-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  0061104289613001
                </td>
              </tr>
              <tr
                id={`payroll-payslip-payment-amount-row-${employeeData?.employeeId}`}
                data-cy={`payroll-payslip-payment-amount-row-${employeeData?.employeeId}`}
                className="border border-gray-300"
              >
                <td
                  id={`payroll-payslip-payment-amount-label-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-payment-amount-label-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300 font-semibold"
                >
                  Amount:
                </td>
                <td
                  id={`payroll-payslip-payment-amount-value-cell-${employeeData?.employeeId}`}
                  data-cy={`payroll-payslip-payment-amount-value-cell-${employeeData?.employeeId}`}
                  className="p-2 border border-gray-300"
                >
                  {employeeData?.netPay}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Transparent Stamp (Bottom Half) */}
          <img
            id={`payroll-payslip-bottom-stamp-view-image-${employeeData?.employeeId}`}
            data-cy={`payroll-payslip-bottom-stamp-view-image-${employeeData?.employeeId}`}
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
