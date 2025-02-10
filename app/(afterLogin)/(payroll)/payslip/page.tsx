'use client';
import React, { useEffect, useState } from 'react';
import Filters from './_components/filters';
import { useGetActivePayroll } from '@/store/server/features/payroll/payroll/queries';
import dayjs from 'dayjs';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';

const Page = () => {
  const { userId } = useAuthenticationStore();
  const [employeeData, setEmployeeDataPayroll] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: payroll, refetch } = useGetActivePayroll(searchQuery);
  const { data: currentUser } = useGetEmployee(userId);

  useEffect(() => {
    if (payroll?.payrolls && currentUser) {
      const employeeData = payroll.payrolls.find(
        (pay: any) => pay.employeeId === currentUser.id,
      );

      if (employeeData) {
        setEmployeeDataPayroll({
          ...employeeData,
          employeeInfo: currentUser, // Attach employee info
        });
      } else {
        setEmployeeDataPayroll(null);
      }
    }
  }, [payroll, currentUser]);

  const handleSearch = (searchValues: any) => {
    const queryParams = new URLSearchParams();
    if (searchValues?.payPeriodId) {
      queryParams.append('payPeriodId', searchValues.payPeriodId);
    }
    const searchParams = queryParams.toString()
      ? `?${queryParams.toString()}`
      : '';
    setSearchQuery(searchParams);
    refetch();
  };

  return (
    <div>
      {' '}
      <Filters onSearch={handleSearch} />
      <div
        key={employeeData?.employeeId}
        id="payslip"
        className="max-w-3xl mx-auto p-6 bg-white border border-gray-300 relative"
      >
        <img
          src="/image/ie.png"
          alt="IE Stamp"
          className="absolute top-[500px] right-10 w-48 h-auto opacity-30"
        />

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
          {employeeData?.employeeInfo?.middleName}{' '}
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
              <td className="p-2 border border-gray-300 font-semibold">TIN:</td>
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
                  (allowance: any) => allowance.type === 'Transport Allowance',
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
        <div className="bg-[#00b0f0] text-white font-bold p-2 mt-4">Bonus</div>
        <table className="w-full border border-gray-300">
          <tbody>
            <tr className="border border-gray-300">
              <td className="p-2 border border-gray-300">Variable Pay</td>
              <td className="p-2 border border-gray-300">
                {employeeData?.breakdown?.variablePay
                  ? employeeData.breakdown.variablePay.amount.toFixed(2)
                  : 'ETB 0'}
              </td>
            </tr>
            <tr className="border border-gray-300">
              <td className="p-2 border border-gray-300">GYM payment merit</td>
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
                  (merit: any) => merit.type === 'Training registration merit',
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
                {employeeData?.breakdown?.totalDeductionWithPension?.find(
                  (deduction: any) =>
                    deduction.type.toLowerCase() === 'cost sharing deduction',
                )
                  ? employeeData?.breakdown?.totalDeductionWithPension.find(
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
                {employeeData?.breakdown?.totalDeductionWithPension?.find(
                  (deduction: any) =>
                    deduction.type.toLowerCase() === '(aaa) penality deduction',
                )
                  ? employeeData?.breakdown?.totalDeductionWithPension.find(
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
                {employeeData?.breakdown?.totalDeductionWithPension?.find(
                  (deduction: any) =>
                    deduction.type.toLowerCase() ===
                    'project related deduction',
                )
                  ? employeeData?.breakdown?.totalDeductionWithPension.find(
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
                {employeeData?.breakdown?.totalDeductionWithPension?.find(
                  (deduction: any) =>
                    deduction.type.toLowerCase() === 'commitment deduction',
                )
                  ? employeeData?.breakdown?.totalDeductionWithPension.find(
                      (deduction: any) =>
                        deduction.type.toLowerCase() === 'commitment deduction',
                    ).amount
                  : 'ETB 0'}
              </td>
            </tr>
            <tr className="border border-gray-300">
              <td className="p-2 border border-gray-300">
                Facility Related Deduction
              </td>
              <td className="p-2 border border-gray-300">
                {employeeData?.breakdown?.totalDeductionWithPension?.find(
                  (deduction: any) =>
                    deduction.type.toLowerCase() ===
                    'facility related deduction',
                )
                  ? employeeData?.breakdown?.totalDeductionWithPension.find(
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
                {employeeData?.breakdown?.totalDeductionWithPension?.find(
                  (deduction: any) =>
                    deduction.type.toLowerCase() === 'meal deduction',
                )
                  ? employeeData?.breakdown?.totalDeductionWithPension.find(
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
                {employeeData?.breakdown?.totalDeductionWithPension?.find(
                  (deduction: any) =>
                    deduction.type.toLowerCase() === 'car related deduction',
                )
                  ? employeeData?.breakdown?.totalDeductionWithPension.find(
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
                {employeeData?.breakdown?.totalDeductionWithPension?.find(
                  (deduction: any) =>
                    deduction.type.toLowerCase() === 'failed exam deduction',
                )
                  ? employeeData?.breakdown?.totalDeductionWithPension.find(
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
                {employeeData?.breakdown?.totalDeductionWithPension?.find(
                  (deduction: any) =>
                    deduction.type.toLowerCase() === 'reprimand',
                )
                  ? employeeData?.breakdown?.totalDeductionWithPension.find(
                      (deduction: any) =>
                        deduction.type.toLowerCase() === 'reprimand',
                    ).amount
                  : 'ETB 0'}
              </td>
            </tr>
            <tr className="border border-gray-300">
              <td className="p-2 border border-gray-300">Pension</td>
              <td className="p-2 border border-gray-300">
                {(() => {
                  const pensionDeduction =
                    employeeData?.breakdown?.totalDeductionWithPension?.find(
                      (deduction: any) =>
                        deduction.type.toLowerCase() === 'pension',
                    );

                  return pensionDeduction
                    ? pensionDeduction.amount.toFixed(2)
                    : 'ETB 0';
                })()}
              </td>
            </tr>
            <tr className="border border-gray-300">
              <td className="p-2 border border-gray-300">Tax</td>
              <td className="p-2 border border-gray-300">
                {(() => {
                  const pensionDeduction =
                    employeeData?.breakdown?.totalDeductionWithPension?.find(
                      (deduction: any) =>
                        deduction.type.toLowerCase() === 'tax',
                    );

                  return pensionDeduction
                    ? pensionDeduction.amount.toFixed(2)
                    : 'ETB 0';
                })()}
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
              <td className="p-2 border border-gray-300">
                {
                  employeeData?.employeeInfo?.employeeInformation
                    ?.bankInformation?.accountNumber
                }
              </td>
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

        <img
          src="/image/ie.png"
          alt="IE Stamp"
          className="absolute bottom-48 right-10 w-48 h-auto opacity-30"
        />
      </div>
    </div>
  );
};

export default Page;
