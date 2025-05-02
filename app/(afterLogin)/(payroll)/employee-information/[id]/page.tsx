'use client';
import {
  Card,
  Tabs,
  Typography,
  Row,
  Col,
  Button,
  Divider,
  Avatar,
  Collapse,
  Tag,
  List,
} from 'antd';
import { PhoneOutlined, PrinterOutlined } from '@ant-design/icons';
import { useEffect, useRef } from 'react';
import {
  useGetActivePayroll,
  useGetPayPeriod,
  useGetPayrollHistory,
} from '@/store/server/features/payroll/payroll/queries';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useParams, useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import PayrollDetails from './_components/PayrollDetails';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import useEmployeeStore from '@/store/uistate/features/payroll/employeeInfoStore';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { UploadFile } from 'antd/lib';
import { RcFile } from 'antd/es/upload';
import { HiOutlineMail } from 'react-icons/hi';
import { MdKeyboardArrowRight } from 'react-icons/md';
import SettlementDetail from './_components/settlementDetail';
import { useIsMobile } from '@/components/common/hooks/useIsMobile';
import { FaArrowLeft } from 'react-icons/fa';
import { EmptyImage } from '@/components/emptyIndicator';
import { PayPeriod } from '@/store/server/features/payroll/payroll/interface';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const EmployeeProfile = () => {
  const { data: payPeriodData } = useGetPayPeriod();
  const { profileFileList } = useEmployeeManagementStore();
  const router = useRouter();

  const openPayPeriods = payPeriodData?.filter(
    (period: any) => period.status === 'OPEN',
  );
  const { id } = useParams();
  const empId = id as string;

  const { data: employee, isLoading } = useGetEmployee(empId);
  const { data: payroll } = useGetActivePayroll();
  const { data: payrollHistory } = useGetPayrollHistory(empId);

  const {
    activeMergedPayroll,
    activePayPeriod,
    setMergedPayroll,
    setActiveMergedPayroll,
    setActivePayPeriod,
  } = useEmployeeStore();
  const payslipRef = useRef(null);

  const downloadPayslip = () => {
    if (!payslipRef.current) return;
    const payslipElement = payslipRef.current;

    html2canvas(payslipElement, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(
        `${activeMergedPayroll?.employeeInfo?.firstName}_${
          activeMergedPayroll?.employeeInfo?.lastName
        }_Payslip_.pdf`,
      );
    });
  };

  useEffect(() => {
    if (payPeriodData && activeMergedPayroll?.payPeriodId) {
      const currentPayPeriod = payPeriodData.find(
        (payPeriod: PayPeriod) =>
          payPeriod.id === activeMergedPayroll.payPeriodId,
      );
      setActivePayPeriod(currentPayPeriod);
    }
  }, [activeMergedPayroll, payPeriodData]);

  useEffect(() => {
    if (payroll?.payrolls && employee) {
      const mergedData = payroll.payrolls
        .filter((pay: any) => pay.employeeId === employee.id)
        .map((pay: any) => ({
          ...pay,
          employeeInfo: employee || null,
        }));

      setMergedPayroll(mergedData);

      const activeMergedData = mergedData?.filter(
        (pay: any) => openPayPeriods?.[0]?.id === pay.payPeriodId,
      );
      setActiveMergedPayroll(activeMergedData[0]);
    }
  }, [payroll, employee, empId, payPeriodData]);

  interface Allowances {
    amount: string | number;
  }

  const totalAmount = (items: Allowances[]) => {
    if (!items || items.length === 0) return '0.00';
    return items
      .reduce(
        (total: number, item: any) => total + parseFloat(item.amount || 0),
        0,
      )
      .toFixed(2);
  };

  const getImageUrl = (fileList: UploadFile[]): string => {
    if (fileList.length > 0) {
      const imageFile = fileList[0];
      return (
        imageFile?.url ||
        imageFile?.thumbUrl ||
        URL.createObjectURL(imageFile.originFileObj as RcFile) ||
        ''
      );
    }
    return '';
  };

  const { isMobile } = useIsMobile();

  return (
    <div style={{ padding: isMobile ? '2px' : '24px' }}>
      <Card
        title={
          isMobile && (
            <span
              onClick={() => router.back()}
              className="flex items-center gap-2 cursor-pointer"
            >
              <FaArrowLeft />
              <span className="text-lg font-bold">Detail Employee</span>
            </span>
          )
        }
        className={isMobile ? 'p-0' : 'p-4'}
        bordered={false}
      >
        <Row gutter={[32, 32]}>
          <Col lg={8} md={10} xs={24}>
            <Card loading={isLoading} className="mb-3">
              <div className="flex flex-col gap-3 items-center">
                <div className="relative group">
                  <Avatar
                    size={144}
                    src={
                      profileFileList.length > 0
                        ? getImageUrl(profileFileList)
                        : employee?.profileImage
                    }
                    className="relative z-0"
                  />
                </div>
                <h5>
                  {employee?.firstName} {employee?.middleName}{' '}
                  {employee?.lastName}
                </h5>
                <p>
                  {employee?.employeeJobInformation?.find(
                    (e: any) => e.isPositionActive === true,
                  )?.position?.name || '-'}
                </p>
                <Tag color="purple-inverse">
                  {employee?.employeeJobInformation?.find(
                    (e: any) => e.isPositionActive === true,
                  )?.employementType?.name || '-'}
                </Tag>
                <Divider className="my-2" />
              </div>

              <div className="flex gap-5 my-2 items-center">
                <HiOutlineMail color="#BFBFBF" />
                <p className="font-semibold">{employee?.email}</p>
              </div>
              <div className="flex gap-5 my-2 items-center">
                <PhoneOutlined className="text-[#BFBFBF]" />
                <p className="font-semibold">
                  {employee?.employeeInformation?.addresses?.phoneNumber ||
                    '--'}
                </p>
              </div>

              <Divider className="my-2" key="arrows" />
              <List split={false} size="small">
                <List.Item
                  key={'department'}
                  actions={[<MdKeyboardArrowRight key="arrow" />]}
                >
                  <List.Item.Meta
                    title={<p className="text-xs font-light">Department</p>}
                    description={
                      <p className="font-bold text-black text-sm">
                        {employee?.employeeJobInformation?.find(
                          (e: any) => e.isPositionActive === true,
                        )?.department?.name || '-'}
                      </p>
                    }
                  />
                </List.Item>
                <List.Item
                  key={'office'}
                  actions={[<MdKeyboardArrowRight key="arrow" />]}
                >
                  <List.Item.Meta
                    title={<p className="text-xs font-light">Office</p>}
                    description={
                      <p className="font-bold text-black text-sm">
                        {employee?.employeeJobInformation?.find(
                          (e: any) => e.isPositionActive === true,
                        )?.branch?.name || '-'}
                      </p>
                    }
                  />
                </List.Item>
              </List>
            </Card>
          </Col>

          <Col xs={24} md={16}>
            <Tabs defaultActiveKey="1">
              <TabPane
                tab="Information"
                key="1"
                className={isMobile ? 'border border-solid rounded-xl p-4' : ''}
              >
                <div>
                  <Title level={4}>Payroll Information</Title>
                  <div className="flex gap-6 w-full">
                    <div className="flex flex-col gap-4 w-1/3">
                      <Text>Base Salary:</Text>
                      <Text>Bank Information:</Text>
                      <Text>Branch:</Text>
                      <Text>Account Number:</Text>
                    </div>
                    <div className="flex flex-col gap-4 font-bold">
                      <Text>
                        {
                          activeMergedPayroll?.employeeInfo?.basicSalaries[0]
                            ?.basicSalary
                        }
                      </Text>
                      <Text>
                        {
                          activeMergedPayroll?.employeeInfo?.employeeInformation
                            ?.bankInformation?.bankName
                        }
                      </Text>
                      <Text>
                        {
                          activeMergedPayroll?.employeeInfo
                            ?.employeeJobInformation[0]?.branch?.name
                        }
                      </Text>
                      <Text>
                        {
                          activeMergedPayroll?.employeeInfo?.employeeInformation
                            ?.bankInformation?.accountNumber
                        }
                      </Text>
                    </div>
                  </div>
                </div>
                <Divider />
                <div className="flex justify-between">
                  <Title level={4}>
                    {dayjs(activePayPeriod?.startDate).format('MMMM')} Pay Slip
                  </Title>
                  <Button
                    type="primary"
                    onClick={downloadPayslip}
                    icon={<PrinterOutlined />}
                    style={{ marginTop: 12, backgroundColor: '#635BFF' }}
                  >
                    Print
                  </Button>
                </div>
                <Divider />
                <div className="flex gap-6 w-full m-4">
                  <div className="flex flex-col gap-4 w-1/3">
                    <Text className=" text-gray-600">Salary Period</Text>
                    <Text className=" text-gray-600">Pay Date</Text>
                  </div>
                  <div className="flex flex-col gap-4 font-bold">
                    <Text>
                      {dayjs(openPayPeriods?.[0]?.startDate).format('MMM-YYYY')}
                    </Text>
                    <Text>
                      {dayjs(openPayPeriods?.[0]?.updatedAt).format(
                        'MMM-DD-YYYY',
                      )}
                    </Text>
                  </div>
                </div>
                <PayrollDetails
                  activeMergedPayroll={activeMergedPayroll || undefined}
                />
                <div className="h-0 overflow-hidden">
                  <div ref={payslipRef} className="p-4">
                    <Divider className="m-2" />
                    <header className="text-center border-b pb-4 mb-4">
                      <h2 className="text-xl font-semibold text-center">
                        Payslip for the month of{' '}
                        <span className="text-violet-500">
                          {dayjs(openPayPeriods?.[0]?.startDate).format(
                            'MMMM-YYYY',
                          )}
                        </span>
                      </h2>
                    </header>
                    <div className="flex justify-between">
                      <div className="mx-2 flex flex-col gap-2">
                        <div className="font-bold text-xl">
                          Employee Pay Summary
                        </div>
                        <div className="flex gap-6 w-full">
                          <div className="flex flex-col gap-2">
                            <Text>Employee name:</Text>
                            <Text>Job title:</Text>
                            <Text>Pay period:</Text>
                            <Text>Pay Date:</Text>
                          </div>
                          <div className="flex flex-col gap-2 font-bold">
                            <Text>
                              {[
                                activeMergedPayroll?.employeeInfo?.firstName,
                                activeMergedPayroll?.employeeInfo?.middleName,
                              ]
                                .filter(Boolean)
                                .join(' ')}
                            </Text>
                            <Text>
                              {
                                activeMergedPayroll?.employeeInfo?.employeeJobInformation?.find(
                                  (job: any) => job.isPositionActive,
                                )?.position?.name
                              }
                            </Text>
                            <Text>
                              {' '}
                              {dayjs(openPayPeriods?.[0]?.startDate).format(
                                'MMM-YYYY',
                              )}
                            </Text>
                            <Text>
                              {dayjs(openPayPeriods?.[0]?.updatedAt).format(
                                'MMM-DD-YYYY',
                              )}
                            </Text>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex flex-col justify-center items-center m-2">
                          <span className="font-bold text-xl">
                            Employee Net Pay
                          </span>
                          <span className="text-violet-500 text-4xl font-bold mb-2">
                            {activeMergedPayroll?.netPay}
                          </span>
                          <span className="font-bold text-xl">
                            Employee Basic Salary
                          </span>
                          <span className=" text-2xl font-bold">
                            {
                              activeMergedPayroll?.employeeInfo
                                ?.basicSalaries[0]?.basicSalary
                            }{' '}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Divider className="my-2" />

                    <header className=" border-b pb-2 mb-2">
                      <h2 className="text-xl font-semibold">
                        Employee Earnings
                      </h2>
                    </header>

                    {/* Total Allowance */}
                    <div>
                      <div className="flex flex-col w-full gap-4">
                        <div className=" pl-4 flex justify-between  items-center my-2">
                          <Text className="text-xl">Employee Allowance</Text>
                          <Text className="text-xl pr-10">Amount</Text>
                        </div>
                        <div className="flex justify-between">
                          <div className="flex flex-col gap-2 justify-center items-start pl-4 text-gray-600">
                            {activeMergedPayroll?.breakdown?.allowances?.map(
                              (item: any, index: any) => (
                                <Text className="text-gray-600" key={index}>
                                  {item.type}
                                </Text>
                              ),
                            )}
                          </div>

                          <div className="flex flex-col gap-2 text-right font-bold pr-10">
                            {activeMergedPayroll?.breakdown?.allowances?.map(
                              (item: any, index: any) => (
                                <Text key={index}>
                                  {parseFloat(item.amount).toFixed(2)}
                                </Text>
                              ),
                            )}
                          </div>
                        </div>

                        <div className=" pl-4 flex justify-between  items-center my-2 pr-10">
                          <Text className="text-purple">Total Allowance:</Text>
                          <Text className="text-purple">
                            {totalAmount(
                              activeMergedPayroll?.breakdown?.allowances || [],
                            )}{' '}
                          </Text>
                        </div>
                      </div>
                      <Divider />

                      <div className="flex flex-col w-full gap-4">
                        <div className=" pl-4 flex justify-between  items-center my-2">
                          <Text className="text-xl">Employee Benefits</Text>
                          <Text className="text-xl pr-10">Amount</Text>
                        </div>
                        <div className="flex justify-between gap-2 w-full">
                          <div className="flex flex-col gap-2 justify-center items-start pl-4">
                            {activeMergedPayroll?.breakdown?.merits?.map(
                              (item: any, index: any) => (
                                <Text className="text-gray-600" key={index}>
                                  {item.type}
                                </Text>
                              ),
                            )}
                            {activeMergedPayroll?.breakdown?.variablePay && (
                              <Text className="text-gray-600">
                                {
                                  activeMergedPayroll?.breakdown?.variablePay
                                    ?.type
                                }
                              </Text>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 text-right justify-end items-start pr-10">
                            {activeMergedPayroll?.breakdown?.merits?.map(
                              (item: any, index: any) => (
                                <Text className="font-bold" key={index}>
                                  {parseFloat(item.amount).toFixed(2)}
                                </Text>
                              ),
                            )}
                            {activeMergedPayroll?.breakdown?.variablePay && (
                              <Text className="font-bold">
                                {parseFloat(
                                  activeMergedPayroll?.breakdown?.variablePay
                                    ?.amount,
                                ).toFixed(2)}{' '}
                              </Text>
                            )}
                          </div>
                        </div>

                        <div className=" pl-4 flex justify-between  items-center my-2">
                          <Text className="text-purple ">Total Benefit:</Text>
                          <Text className="text-purple pr-10">
                            {totalAmount([
                              ...(activeMergedPayroll?.breakdown?.merits || []),
                              ...(activeMergedPayroll?.breakdown?.variablePay
                                ? [
                                    {
                                      amount:
                                        activeMergedPayroll?.breakdown
                                          ?.variablePay.amount,
                                    },
                                  ]
                                : []),
                            ])}{' '}
                          </Text>
                        </div>
                      </div>
                    </div>
                    <Divider className="my-2" />

                    <header className=" border-b pb-2 mb-2">
                      <h2 className="text-xl font-semibold">
                        Employee Deductions
                      </h2>
                    </header>

                    {/* Total Deduction */}
                    <div className="flex flex-col">
                      <div className=" p-4 flex justify-between  items-center my-2">
                        <Text className="text-xl">Employee Deductions</Text>
                        <Text className="text-xl pr-10">Amount</Text>
                      </div>

                      <div className="flex justify-between gap-2 w-full">
                        <div className="flex flex-col gap-2 justify-center items-start pl-4">
                          {activeMergedPayroll?.breakdown?.pension?.map(
                            (item: any, index: any) => (
                              <Text className="text-gray-600" key={index}>
                                {item.type}
                              </Text>
                            ),
                          )}
                          {activeMergedPayroll?.breakdown?.totalDeductionWithPension?.map(
                            (item: any, index: any) => (
                              <Text className="text-gray-600" key={index}>
                                {item.type}
                              </Text>
                            ),
                          )}
                        </div>
                        <div className="flex flex-col gap-2 text-right justify-end items-start pr-10">
                          {activeMergedPayroll?.breakdown?.pension?.map(
                            (item: any, index: any) => (
                              <Text className="font-bold" key={index}>
                                {parseFloat(item.amount).toFixed(2)}
                              </Text>
                            ),
                          )}
                          {activeMergedPayroll?.breakdown?.totalDeductionWithPension?.map(
                            (item: any, index: any) => (
                              <Text className="font-bold" key={index}>
                                {parseFloat(item.amount).toFixed(2)}
                              </Text>
                            ),
                          )}
                        </div>
                      </div>
                      <div className="pl-4 my-6 flex justify-between ">
                        <Text className="text-purple"> Total Deduction</Text>
                        <Text className="text-purple pr-10">
                          {totalAmount([
                            ...(activeMergedPayroll?.breakdown?.pension || []),
                            ...(activeMergedPayroll?.breakdown
                              ?.totalDeductionWithPension || []),
                          ])}{' '}
                        </Text>
                      </div>
                    </div>

                    <Divider className="my-2" />
                    {/* Gross Earning & Net Pay */}
                    <header className=" border-b pb-2 mb-2">
                      <h2 className="text-xl font-semibold">
                        Employee Bank Information
                      </h2>
                    </header>
                    <div>
                      <div className=" p-4 flex justify-between  items-center my-2">
                        <Text className="text-xl">Employee Bank Details</Text>
                        <Text className="text-xl pr-10">Details</Text>
                      </div>
                      <div className="flex justify-between  w-full">
                        <div className="flex flex-col gap-2 pl-4">
                          <Text>Bank Information:</Text>
                          <Text>Account Number:</Text>
                        </div>
                        <div className="flex flex-col gap-3 font-bold">
                          <Text>
                            {
                              activeMergedPayroll?.employeeInfo
                                ?.employeeInformation?.bankInformation?.bankName
                            }
                          </Text>
                          <Text>
                            {
                              activeMergedPayroll?.employeeInfo
                                ?.employeeInformation?.bankInformation
                                ?.accountNumber
                            }
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabPane>

              <TabPane tab="Payroll History" key="2">
                <>
                  {payPeriodData ? (
                    payPeriodData
                      ?.filter(
                        (period: PayPeriod) =>
                          payrollHistory?.some(
                            (pay: any) => pay.payPeriodId === period.id,
                          ), // Filter only periods with merged data
                      )
                      .map((period: any, index: any) => {
                        const activeMergedPayroll = payrollHistory?.find(
                          (pay: any) => pay.payPeriodId === period.id,
                        );

                        return (
                          <Collapse
                            size="large"
                            className="p-4 m-2"
                            key={index}
                          >
                            <Collapse.Panel
                              key={period.id}
                              header={`${dayjs(period.startDate).format('MMMM-YYYY')}`}
                            >
                              <div className="flex gap-6 w-full m-4">
                                <div className="flex flex-col gap-4 w-1/3">
                                  <Text className=" text-gray-600">
                                    Salary Period
                                  </Text>
                                  <Text className=" text-gray-600">
                                    Pay Date
                                  </Text>
                                </div>
                                <div className="flex flex-col gap-4 font-bold">
                                  <Text>
                                    {dayjs(period.startDate).format('MMM-YYYY')}
                                  </Text>
                                  <Text>
                                    {dayjs(period.updatedAt).format(
                                      'MMM-DD-YYYY',
                                    )}
                                  </Text>
                                </div>
                              </div>
                              <PayrollDetails
                                activeMergedPayroll={activeMergedPayroll}
                              />
                            </Collapse.Panel>
                          </Collapse>
                        );
                      })
                  ) : (
                    <EmptyImage />
                  )}
                </>
              </TabPane>
              <TabPane tab="Settlement Tracking" key="3">
                <SettlementDetail />
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default EmployeeProfile;
