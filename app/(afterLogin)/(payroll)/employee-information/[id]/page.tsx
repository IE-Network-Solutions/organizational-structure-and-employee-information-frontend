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
import { useIsMobile } from '@/hooks/useIsMobile';
import { EmptyImage } from '@/components/emptyIndicator';
import { IoChevronBackSharp } from 'react-icons/io5';
import { PayPeriod } from '@/store/server/features/payroll/payroll/interface';
import { usePayrollStore } from '@/store/uistate/features/payroll/payroll';

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

  const { pageSize } = usePayrollStore();
  const { data: payroll } = useGetActivePayroll(
    `&employeeId=${empId}`,
    pageSize,
    1,
  );
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
    const payslipElement = payslipRef.current as HTMLElement;

    html2canvas(payslipElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Calculate how many pages are needed
      const totalPages = Math.ceil(imgHeight / pageHeight);

      // Add pages with properly positioned content
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        // Calculate the Y position for this page
        // For the first page, start at 0, for subsequent pages, shift up
        const yPosition = -(i * pageHeight);
        pdf.addImage(imgData, 'PNG', 0, yPosition, imgWidth, imgHeight);
      }

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
    if (payroll?.items && employee) {
      const mergedData = payroll.items
        .filter((pay: any) => pay.employeeId === employee.id)
        .map((pay: any) => ({ ...pay, employeeInfo: employee || null }));

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
    <div
      style={{ padding: isMobile ? '2px' : '24px' }}
      id="payroll-employee-profile-view-container"
      data-cy="payroll-employee-profile-view-container"
    >
      <Card
        id="payroll-employee-profile-view-card"
        data-cy="payroll-employee-profile-view-card"
        title={
          isMobile && (
            <span
              id="payroll-employee-profile-mobile-header-view-text"
              data-cy="payroll-employee-profile-mobile-header-view-text"
              onClick={() => router.back()}
              className="flex items-center gap-2 cursor-pointer"
            >
              <IoChevronBackSharp
                id="payroll-employee-profile-back-click-icon"
                data-cy="payroll-employee-profile-back-click-icon"
              />
              <span
                className="text-lg font-bold"
                id="payroll-employee-profile-title-view-text"
                data-cy="payroll-employee-profile-title-view-text"
              >
                Detail Employee
              </span>
            </span>
          )
        }
        className={isMobile ? 'p-0' : 'p-4'}
        bordered={false}
      >
        <Row
          id="payroll-employee-profile-layout-view-row"
          data-cy="payroll-employee-profile-layout-view-row"
          gutter={[32, 32]}
        >
          <Col
            id="payroll-employee-profile-summary-view-column"
            data-cy="payroll-employee-profile-summary-view-column"
            sm={24}
            md={24}
            xs={24}
            lg={10}
            xl={10}
          >
            <Card
              id="payroll-employee-profile-summary-view-card"
              data-cy="payroll-employee-profile-summary-view-card"
              loading={isLoading}
              className={`mb-3 ${isMobile ? 'w-full m-0' : ''}`}
              style={isMobile ? { width: '100%' } : {}}
              bordered={!isMobile}
            >
              <div
                className="flex flex-col gap-3 items-center"
                id="payroll-employee-profile-info-view-container"
                data-cy="payroll-employee-profile-info-view-container"
              >
                <div
                  className="relative group"
                  id="payroll-employee-profile-avatar-view-wrapper"
                  data-cy="payroll-employee-profile-avatar-view-wrapper"
                >
                  <Avatar
                    data-cy="payroll-employee-profile-avatar-view-component"
                    size={144}
                    src={
                      profileFileList.length > 0
                        ? getImageUrl(profileFileList)
                        : employee?.profileImage
                    }
                    className="relative z-0"
                  />
                </div>
                <h5
                  id="payroll-employee-profile-name-view-heading"
                  data-cy="payroll-employee-profile-name-view-heading"
                >
                  {employee?.firstName} {employee?.middleName}{' '}
                  {employee?.lastName}
                </h5>
                <p
                  id="payroll-employee-profile-position-view-text"
                  data-cy="payroll-employee-profile-position-view-text"
                >
                  {employee?.employeeJobInformation?.find(
                    (e: any) => e.isPositionActive === true,
                  )?.position?.name || '-'}
                </p>
                <Tag
                  id="payroll-employee-profile-employmenttype-view-tag"
                  data-cy="payroll-employee-profile-employmenttype-view-tag"
                  color="purple-inverse"
                >
                  {employee?.employeeJobInformation?.find(
                    (e: any) => e.isPositionActive === true,
                  )?.employementType?.name || '-'}
                </Tag>
                <Divider
                  data-cy="payroll-employee-profile-info-divider-view-divider"
                  className="my-2"
                />
              </div>

              <div
                className="flex gap-5 my-2 items-center"
                id="payroll-employee-profile-email-view-container"
                data-cy="payroll-employee-profile-email-view-container"
              >
                <HiOutlineMail
                  id="payroll-employee-profile-email-view-icon"
                  data-cy="payroll-employee-profile-email-view-icon"
                  color="#BFBFBF"
                />
                <p
                  className="font-semibold break-all"
                  id="payroll-employee-profile-email-view-text"
                  data-cy="payroll-employee-profile-email-view-text"
                >
                  {employee?.email}
                </p>
              </div>
              <div
                className="flex gap-5 my-2 items-center"
                id="payroll-employee-profile-phone-view-container"
                data-cy="payroll-employee-profile-phone-view-container"
              >
                <PhoneOutlined
                  id="payroll-employee-profile-phone-view-icon"
                  data-cy="payroll-employee-profile-phone-view-icon"
                  className="text-[#BFBFBF]"
                />
                <p
                  className="font-semibold"
                  id="payroll-employee-profile-phone-view-text"
                  data-cy="payroll-employee-profile-phone-view-text"
                >
                  {employee?.employeeInformation?.addresses?.phoneNumber ||
                    '--'}
                </p>
              </div>

              <Divider
                className="my-2"
                key="arrows"
                data-cy="payroll-employee-profile-contact-divider-view-divider"
              />
              <List
                split={false}
                size="small"
                id="payroll-employee-profile-details-view-list"
                data-cy="payroll-employee-profile-details-view-list"
              >
                <List.Item
                  key={'department'}
                  id="payroll-employee-profile-department-view-listitem"
                  data-cy="payroll-employee-profile-department-view-listitem"
                  actions={[
                    <MdKeyboardArrowRight
                      id="payroll-employee-profile-department-view-icon"
                      data-cy="payroll-employee-profile-department-view-icon"
                      key="arrow"
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <p
                        className="text-xs font-light"
                        id="payroll-employee-profile-department-label-view-text"
                        data-cy="payroll-employee-profile-department-label-view-text"
                      >
                        Department
                      </p>
                    }
                    description={
                      <p
                        className="font-bold text-black text-sm"
                        id="payroll-employee-profile-department-value-view-text"
                        data-cy="payroll-employee-profile-department-value-view-text"
                      >
                        {employee?.employeeJobInformation?.find(
                          (e: any) => e.isPositionActive === true,
                        )?.department?.name || '-'}
                      </p>
                    }
                  />
                </List.Item>
                <List.Item
                  key={'office'}
                  id="payroll-employee-profile-office-view-listitem"
                  data-cy="payroll-employee-profile-office-view-listitem"
                  actions={[
                    <MdKeyboardArrowRight
                      id="payroll-employee-profile-office-view-icon"
                      data-cy="payroll-employee-profile-office-view-icon"
                      key="arrow"
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <p
                        className="text-xs font-light"
                        id="payroll-employee-profile-office-label-view-text"
                        data-cy="payroll-employee-profile-office-label-view-text"
                      >
                        Office
                      </p>
                    }
                    description={
                      <p
                        className="font-bold text-black text-sm"
                        id="payroll-employee-profile-office-value-view-text"
                        data-cy="payroll-employee-profile-office-value-view-text"
                      >
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

          <Col
            id="payroll-employee-profile-details-view-column"
            data-cy="payroll-employee-profile-details-view-column"
            xs={24}
            sm={24}
            md={24}
            lg={14}
            xl={14}
          >
            <Tabs
              id="payroll-employee-profile-tabs-view-tabs"
              data-cy="payroll-employee-profile-tabs-view-tabs"
              defaultActiveKey="1"
            >
              <TabPane
                id="payroll-employee-profile-information-tab-view-tabpane"
                data-cy="payroll-employee-profile-information-tab-view-tabpane"
                tab="Information"
                key="1"
                className={isMobile ? 'border border-solid rounded-xl p-4' : ''}
              >
                {!openPayPeriods || openPayPeriods.length === 0 ? (
                  <div
                    className="text-center py-8"
                    id="payroll-employee-profile-no-payperiod-view-container"
                    data-cy="payroll-employee-profile-no-payperiod-view-container"
                  >
                    <Title
                      level={4}
                      className="text-gray-500"
                      id="payroll-employee-profile-no-payperiod-view-title"
                      data-cy="payroll-employee-profile-no-payperiod-view-title"
                    >
                      No Active Pay Period
                    </Title>
                    <Text
                      className="text-gray-400"
                      id="payroll-employee-profile-no-payperiod-view-text"
                      data-cy="payroll-employee-profile-no-payperiod-view-text"
                    >
                      There is currently no active pay period available.
                    </Text>
                  </div>
                ) : !payroll?.items || payroll.items.length === 0 ? (
                  <div
                    className="text-center py-8"
                    id="payroll-employee-profile-no-payroll-view-container"
                    data-cy="payroll-employee-profile-no-payroll-view-container"
                  >
                    <Title
                      level={4}
                      className="text-gray-500"
                      id="payroll-employee-profile-no-payroll-view-title"
                      data-cy="payroll-employee-profile-no-payroll-view-title"
                    >
                      No Payroll Data
                    </Title>
                    <Text
                      className="text-gray-400"
                      id="payroll-employee-profile-no-payroll-view-text"
                      data-cy="payroll-employee-profile-no-payroll-view-text"
                    >
                      There is no payroll data available for this pay period.
                    </Text>
                  </div>
                ) : !activeMergedPayroll ? (
                  <div
                    className="text-center py-8"
                    id="payroll-employee-profile-no-employee-payroll-view-container"
                    data-cy="payroll-employee-profile-no-employee-payroll-view-container"
                  >
                    <Title
                      level={4}
                      className="text-gray-500"
                      id="payroll-employee-profile-no-employee-payroll-view-title"
                      data-cy="payroll-employee-profile-no-employee-payroll-view-title"
                    >
                      No Employee Payroll Data
                    </Title>
                    <Text
                      className="text-gray-400"
                      id="payroll-employee-profile-no-employee-payroll-view-text"
                      data-cy="payroll-employee-profile-no-employee-payroll-view-text"
                    >
                      No payroll data found for this employee in the current pay
                      period.
                    </Text>
                  </div>
                ) : (
                  <>
                    <div
                      id="payroll-employee-profile-information-section-view-container"
                      data-cy="payroll-employee-profile-information-section-view-container"
                    >
                      <Title
                        level={4}
                        id="payroll-employee-profile-information-section-view-title"
                        data-cy="payroll-employee-profile-information-section-view-title"
                      >
                        Payroll Information
                      </Title>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 16,
                        }}
                        id="payroll-employee-profile-information-section-grid"
                        data-cy="payroll-employee-profile-information-section-grid"
                      >
                        {/* Base Salary Row */}
                        <div
                          className="flex flex-col md:flex-row gap-2"
                          id="payroll-employee-profile-base-salary-view-row"
                          data-cy="payroll-employee-profile-base-salary-view-row"
                        >
                          <Text
                            className="min-w-[120px]"
                            id="payroll-employee-profile-base-salary-label-view-text"
                            data-cy="payroll-employee-profile-base-salary-label-view-text"
                          >
                            Base Salary:
                          </Text>
                          <Text
                            strong
                            id="payroll-employee-profile-base-salary-value-view-text"
                            data-cy="payroll-employee-profile-base-salary-value-view-text"
                          >
                            {activeMergedPayroll?.employeeInfo?.basicSalaries[0]
                              ?.basicSalary || '--'}
                          </Text>
                        </div>
                        {/* Bank Information Row */}
                        <div
                          className="flex flex-col md:flex-row gap-2"
                          id="payroll-employee-profile-bank-info-view-row"
                          data-cy="payroll-employee-profile-bank-info-view-row"
                        >
                          <Text
                            className="min-w-[120px]"
                            id="payroll-employee-profile-bank-info-label-view-text"
                            data-cy="payroll-employee-profile-bank-info-label-view-text"
                          >
                            Bank Information:
                          </Text>
                          <Text
                            strong
                            id="payroll-employee-profile-bank-info-value-view-text"
                            data-cy="payroll-employee-profile-bank-info-value-view-text"
                          >
                            {activeMergedPayroll?.employeeInfo
                              ?.employeeInformation?.bankInformation
                              ?.bankName || '--'}
                          </Text>
                        </div>
                        {/* Branch Row */}
                        <div
                          className="flex flex-col md:flex-row gap-2"
                          id="payroll-employee-profile-branch-view-row"
                          data-cy="payroll-employee-profile-branch-view-row"
                        >
                          <Text
                            className="min-w-[120px]"
                            id="payroll-employee-profile-branch-label-view-text"
                            data-cy="payroll-employee-profile-branch-label-view-text"
                          >
                            Branch:
                          </Text>
                          <Text
                            strong
                            id="payroll-employee-profile-branch-value-view-text"
                            data-cy="payroll-employee-profile-branch-value-view-text"
                          >
                            {activeMergedPayroll?.employeeInfo
                              ?.employeeJobInformation[0]?.branch?.name || '--'}
                          </Text>
                        </div>
                        {/* Account Number Row */}
                        <div
                          className="flex flex-col md:flex-row gap-2"
                          id="payroll-employee-profile-account-view-row"
                          data-cy="payroll-employee-profile-account-view-row"
                        >
                          <Text
                            className="min-w-[120px]"
                            id="payroll-employee-profile-account-label-view-text"
                            data-cy="payroll-employee-profile-account-label-view-text"
                          >
                            Account Number:
                          </Text>
                          <Text
                            strong
                            id="payroll-employee-profile-account-value-view-text"
                            data-cy="payroll-employee-profile-account-value-view-text"
                          >
                            {activeMergedPayroll?.employeeInfo
                              ?.employeeInformation?.bankInformation
                              ?.accountNumber || '--'}
                          </Text>
                        </div>
                      </div>
                    </div>
                    <Divider data-cy="payroll-employee-profile-information-section-divider" />
                    <div
                      className="flex justify-between"
                      id="payroll-employee-profile-payslip-header-view-container"
                      data-cy="payroll-employee-profile-payslip-header-view-container"
                    >
                      <Title
                        level={4}
                        id="payroll-employee-profile-payslip-title-view-title"
                        data-cy="payroll-employee-profile-payslip-title-view-title"
                      >
                        {dayjs(activePayPeriod?.startDate).format('MMMM')} Pay
                        Slip
                      </Title>
                      <Button
                        id="payroll-employee-profile-payslip-print-click-button"
                        data-cy="payroll-employee-profile-payslip-print-click-button"
                        type="primary"
                        onClick={downloadPayslip}
                        icon={
                          <PrinterOutlined
                            id="payroll-employee-profile-payslip-print-click-icon"
                            data-cy="payroll-employee-profile-payslip-print-click-icon"
                          />
                        }
                        style={{ marginTop: 12, backgroundColor: '#635BFF' }}
                      >
                        Print
                      </Button>
                    </div>
                    <Divider data-cy="payroll-employee-profile-payslip-divider" />
                    <div
                      className="flex gap-6 w-full m-4"
                      id="payroll-employee-profile-paydates-view-container"
                      data-cy="payroll-employee-profile-paydates-view-container"
                    >
                      <div
                        className="flex flex-col gap-4 w-1/3"
                        id="payroll-employee-profile-paydates-labels-view-column"
                        data-cy="payroll-employee-profile-paydates-labels-view-column"
                      >
                        <Text
                          className=" text-gray-600"
                          id="payroll-employee-profile-salary-period-label-view-text"
                          data-cy="payroll-employee-profile-salary-period-label-view-text"
                        >
                          Salary Period
                        </Text>
                        <Text
                          className=" text-gray-600"
                          id="payroll-employee-profile-pay-date-label-view-text"
                          data-cy="payroll-employee-profile-pay-date-label-view-text"
                        >
                          Pay Date
                        </Text>
                      </div>
                      <div
                        className="flex flex-col gap-4 font-bold"
                        id="payroll-employee-profile-paydates-values-view-column"
                        data-cy="payroll-employee-profile-paydates-values-view-column"
                      >
                        <Text
                          id="payroll-employee-profile-salary-period-value-view-text"
                          data-cy="payroll-employee-profile-salary-period-value-view-text"
                        >
                          {dayjs(openPayPeriods?.[0]?.startDate).format(
                            'MMM-YYYY',
                          )}
                        </Text>
                        <Text
                          id="payroll-employee-profile-pay-date-value-view-text"
                          data-cy="payroll-employee-profile-pay-date-value-view-text"
                        >
                          {dayjs(openPayPeriods?.[0]?.updatedAt).format(
                            'MMM-DD-YYYY',
                          )}
                        </Text>
                      </div>
                    </div>
                    <PayrollDetails
                      data-cy="payroll-employee-profile-active-details-view-component"
                      activeMergedPayroll={activeMergedPayroll || undefined}
                    />
                    <div
                      className="h-0 overflow-hidden"
                      id="payroll-employee-profile-payslip-hidden-view-container"
                      data-cy="payroll-employee-profile-payslip-hidden-view-container"
                    >
                      <div
                        ref={payslipRef}
                        className="p-4"
                        style={{
                          width: '210mm',
                          minWidth: '210mm',
                          maxWidth: '210mm',
                          backgroundColor: '#ffffff',
                        }}
                        id="payroll-employee-profile-payslip-hidden-view-card"
                        data-cy="payroll-employee-profile-payslip-hidden-view-card"
                      >
                        <Divider
                          className="m-2"
                          data-cy="payroll-employee-profile-payslip-hidden-divider-top"
                        />
                        <header
                          className="text-center border-b pb-4 mb-4"
                          id="payroll-employee-profile-payslip-hidden-header"
                          data-cy="payroll-employee-profile-payslip-hidden-header"
                        >
                          <h2
                            className="text-xl font-semibold text-center"
                            id="payroll-employee-profile-payslip-hidden-title"
                            data-cy="payroll-employee-profile-payslip-hidden-title"
                          >
                            Payslip for the month of{' '}
                            <span
                              className="text-violet-500"
                              id="payroll-employee-profile-payslip-hidden-title-highlight"
                              data-cy="payroll-employee-profile-payslip-hidden-title-highlight"
                            >
                              {dayjs(openPayPeriods?.[0]?.startDate).format(
                                'MMMM-YYYY',
                              )}
                            </span>
                          </h2>
                        </header>
                        <div
                          className="flex justify-between"
                          id="payroll-employee-profile-payslip-summary-view-container"
                          data-cy="payroll-employee-profile-payslip-summary-view-container"
                        >
                          <div
                            className="mx-2 flex flex-col gap-2"
                            id="payroll-employee-profile-payslip-summary-left"
                            data-cy="payroll-employee-profile-payslip-summary-left"
                          >
                            <div
                              className="font-bold text-xl"
                              id="payroll-employee-profile-payslip-summary-title"
                              data-cy="payroll-employee-profile-payslip-summary-title"
                            >
                              Employee Pay Summary
                            </div>
                            <div
                              className="flex gap-6 w-full"
                              id="payroll-employee-profile-payslip-summary-grid"
                              data-cy="payroll-employee-profile-payslip-summary-grid"
                            >
                              <div
                                className="flex flex-col gap-2"
                                id="payroll-employee-profile-payslip-summary-labels"
                                data-cy="payroll-employee-profile-payslip-summary-labels"
                              >
                                <Text
                                  id="payroll-employee-profile-summary-label-name"
                                  data-cy="payroll-employee-profile-summary-label-name"
                                >
                                  Employee name:
                                </Text>
                                <Text
                                  id="payroll-employee-profile-summary-label-job"
                                  data-cy="payroll-employee-profile-summary-label-job"
                                >
                                  Job title:
                                </Text>
                                <Text
                                  id="payroll-employee-profile-summary-label-period"
                                  data-cy="payroll-employee-profile-summary-label-period"
                                >
                                  Pay period:
                                </Text>
                                <Text
                                  id="payroll-employee-profile-summary-label-date"
                                  data-cy="payroll-employee-profile-summary-label-date"
                                >
                                  Pay Date:
                                </Text>
                              </div>
                              <div
                                className="flex flex-col gap-2 font-bold"
                                id="payroll-employee-profile-payslip-summary-values"
                                data-cy="payroll-employee-profile-payslip-summary-values"
                              >
                                <Text
                                  id="payroll-employee-profile-summary-value-name"
                                  data-cy="payroll-employee-profile-summary-value-name"
                                >
                                  {[
                                    activeMergedPayroll?.employeeInfo
                                      ?.firstName,
                                    activeMergedPayroll?.employeeInfo
                                      ?.middleName,
                                  ]
                                    .filter(Boolean)
                                    .join(' ')}
                                </Text>
                                <Text
                                  id="payroll-employee-profile-summary-value-job"
                                  data-cy="payroll-employee-profile-summary-value-job"
                                >
                                  {
                                    activeMergedPayroll?.employeeInfo?.employeeJobInformation?.find(
                                      (job: any) => job.isPositionActive,
                                    )?.position?.name
                                  }
                                </Text>
                                <Text
                                  id="payroll-employee-profile-summary-value-period"
                                  data-cy="payroll-employee-profile-summary-value-period"
                                >
                                  {' '}
                                  {dayjs(openPayPeriods?.[0]?.startDate).format(
                                    'MMM-YYYY',
                                  )}
                                </Text>
                                <Text
                                  id="payroll-employee-profile-summary-value-date"
                                  data-cy="payroll-employee-profile-summary-value-date"
                                >
                                  {dayjs(openPayPeriods?.[0]?.updatedAt).format(
                                    'MMM-DD-YYYY',
                                  )}
                                </Text>
                              </div>
                            </div>
                          </div>
                          <div
                            id="payroll-employee-profile-payslip-summary-right"
                            data-cy="payroll-employee-profile-payslip-summary-right"
                          >
                            <div
                              className="flex flex-col justify-center items-center m-2"
                              id="payroll-employee-profile-payslip-netpay-view-container"
                              data-cy="payroll-employee-profile-payslip-netpay-view-container"
                            >
                              <span
                                className="font-bold text-xl"
                                id="payroll-employee-profile-payslip-netpay-label"
                                data-cy="payroll-employee-profile-payslip-netpay-label"
                              >
                                Employee Net Pay
                              </span>
                              <span
                                className="text-violet-500 text-4xl font-bold mb-2"
                                id="payroll-employee-profile-payslip-netpay-value"
                                data-cy="payroll-employee-profile-payslip-netpay-value"
                              >
                                {activeMergedPayroll?.netPay}
                              </span>
                              <span
                                className="font-bold text-xl"
                                id="payroll-employee-profile-payslip-basic-label"
                                data-cy="payroll-employee-profile-payslip-basic-label"
                              >
                                Employee Basic Salary
                              </span>
                              <span
                                className=" text-2xl font-bold"
                                id="payroll-employee-profile-payslip-basic-value"
                                data-cy="payroll-employee-profile-payslip-basic-value"
                              >
                                {
                                  activeMergedPayroll?.employeeInfo
                                    ?.basicSalaries[0]?.basicSalary
                                }{' '}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Divider
                          className="my-2"
                          data-cy="payroll-employee-profile-payslip-hidden-divider-mid"
                        />

                        <header
                          className=" border-b pb-2 mb-2"
                          id="payroll-employee-profile-earnings-header-view-header"
                          data-cy="payroll-employee-profile-earnings-header-view-header"
                        >
                          <h2
                            className="text-xl font-semibold"
                            id="payroll-employee-profile-earnings-header-view-title"
                            data-cy="payroll-employee-profile-earnings-header-view-title"
                          >
                            Employee Earnings
                          </h2>
                        </header>

                        {/* Total Allowance */}
                        <div
                          id="payroll-employee-profile-allowances-section-view-container"
                          data-cy="payroll-employee-profile-allowances-section-view-container"
                        >
                          <div
                            className="flex flex-col w-full gap-4"
                            id="payroll-employee-profile-allowances-list-view-container"
                            data-cy="payroll-employee-profile-allowances-list-view-container"
                          >
                            <div
                              className=" pl-4 flex justify-between  items-center my-2"
                              id="payroll-employee-profile-allowances-header-view-container"
                              data-cy="payroll-employee-profile-allowances-header-view-container"
                            >
                              <Text
                                className="text-xl"
                                id="payroll-employee-profile-allowances-header-label"
                                data-cy="payroll-employee-profile-allowances-header-label"
                              >
                                Employee Allowance
                              </Text>
                              <Text
                                className="text-xl pr-10"
                                id="payroll-employee-profile-allowances-header-amount"
                                data-cy="payroll-employee-profile-allowances-header-amount"
                              >
                                Amount
                              </Text>
                            </div>
                            <div
                              className="flex justify-between"
                              id="payroll-employee-profile-allowances-values-view-row"
                              data-cy="payroll-employee-profile-allowances-values-view-row"
                            >
                              <div
                                className="flex flex-col gap-2 justify-center items-start pl-4 text-gray-600"
                                id="payroll-employee-profile-allowances-types-view-column"
                                data-cy="payroll-employee-profile-allowances-types-view-column"
                              >
                                {activeMergedPayroll?.breakdown?.allowances?.map(
                                  (item: any, index: any) => (
                                    <Text
                                      className="text-gray-600"
                                      key={`allowance-type-${index}`}
                                      id={`payroll-employee-profile-allowance-type-view-text-${index}`}
                                      data-cy={`payroll-employee-profile-allowance-type-view-text-${index}`}
                                    >
                                      {item.type}
                                    </Text>
                                  ),
                                )}
                              </div>

                              <div
                                className="flex flex-col gap-2 text-right font-bold pr-10"
                                id="payroll-employee-profile-allowances-amounts-view-column"
                                data-cy="payroll-employee-profile-allowances-amounts-view-column"
                              >
                                {activeMergedPayroll?.breakdown?.allowances?.map(
                                  (item: any, index: any) => (
                                    <Text
                                      key={`allowance-amount-${index}`}
                                      id={`payroll-employee-profile-allowance-amount-view-text-${index}`}
                                      data-cy={`payroll-employee-profile-allowance-amount-view-text-${index}`}
                                    >
                                      {parseFloat(item.amount).toFixed(2)}
                                    </Text>
                                  ),
                                )}
                              </div>
                            </div>

                            <div
                              className=" pl-4 flex justify-between  items-center my-2 pr-10"
                              id="payroll-employee-profile-allowances-total-view-row"
                              data-cy="payroll-employee-profile-allowances-total-view-row"
                            >
                              <Text
                                className="text-purple"
                                id="payroll-employee-profile-allowances-total-label"
                                data-cy="payroll-employee-profile-allowances-total-label"
                              >
                                Entitled Allowance:
                              </Text>
                              <Text
                                className="text-purple"
                                id="payroll-employee-profile-allowances-total-value"
                                data-cy="payroll-employee-profile-allowances-total-value"
                              >
                                {totalAmount(
                                  activeMergedPayroll?.breakdown?.allowances ||
                                    [],
                                )}{' '}
                              </Text>
                            </div>
                          </div>
                          <Divider data-cy="payroll-employee-profile-allowances-divider" />

                          <div
                            className="flex flex-col w-full gap-4"
                            id="payroll-employee-profile-benefits-view-container"
                            data-cy="payroll-employee-profile-benefits-view-container"
                          >
                            <div
                              className=" pl-4 flex justify-between  items-center my-2"
                              id="payroll-employee-profile-benefits-header-view-container"
                              data-cy="payroll-employee-profile-benefits-header-view-container"
                            >
                              <Text
                                className="text-xl"
                                id="payroll-employee-profile-benefits-header-label"
                                data-cy="payroll-employee-profile-benefits-header-label"
                              >
                                Employee Benefits
                              </Text>
                              <Text
                                className="text-xl pr-10"
                                id="payroll-employee-profile-benefits-header-amount"
                                data-cy="payroll-employee-profile-benefits-header-amount"
                              >
                                Amount
                              </Text>
                            </div>
                            <div
                              className="flex justify-between gap-2 w-full"
                              id="payroll-employee-profile-benefits-values-view-row"
                              data-cy="payroll-employee-profile-benefits-values-view-row"
                            >
                              <div
                                className="flex flex-col gap-2 justify-center items-start pl-4"
                                id="payroll-employee-profile-benefits-types-view-column"
                                data-cy="payroll-employee-profile-benefits-types-view-column"
                              >
                                {activeMergedPayroll?.breakdown?.merits?.map(
                                  (item: any, index: any) => (
                                    <Text
                                      className="text-gray-600"
                                      key={`benefits-type-${index}`}
                                      id={`payroll-employee-profile-benefit-type-view-text-${index}`}
                                      data-cy={`payroll-employee-profile-benefit-type-view-text-${index}`}
                                    >
                                      {item.type}
                                    </Text>
                                  ),
                                )}
                                {activeMergedPayroll?.breakdown
                                  ?.variablePay && (
                                  <Text
                                    className="text-gray-600"
                                    id="payroll-employee-profile-variablepay-type-view-text"
                                    data-cy="payroll-employee-profile-variablepay-type-view-text"
                                  >
                                    {
                                      activeMergedPayroll?.breakdown
                                        ?.variablePay?.type
                                    }
                                  </Text>
                                )}
                              </div>
                              <div
                                className="flex flex-col gap-2 text-right justify-end items-start pr-10"
                                id="payroll-employee-profile-benefits-amounts-view-column"
                                data-cy="payroll-employee-profile-benefits-amounts-view-column"
                              >
                                {activeMergedPayroll?.breakdown?.merits?.map(
                                  (item: any, index: any) => (
                                    <Text
                                      className="font-bold"
                                      key={`benefits-amount-${index}`}
                                      id={`payroll-employee-profile-benefit-amount-view-text-${index}`}
                                      data-cy={`payroll-employee-profile-benefit-amount-view-text-${index}`}
                                    >
                                      {parseFloat(item.amount).toFixed(2)}
                                    </Text>
                                  ),
                                )}
                                {activeMergedPayroll?.breakdown
                                  ?.variablePay && (
                                  <Text
                                    className="font-bold"
                                    id="payroll-employee-profile-variablepay-amount-view-text"
                                    data-cy="payroll-employee-profile-variablepay-amount-view-text"
                                  >
                                    {parseFloat(
                                      activeMergedPayroll?.breakdown
                                        ?.variablePay?.amount,
                                    ).toFixed(2)}{' '}
                                  </Text>
                                )}
                              </div>
                            </div>

                            <div
                              className=" pl-4 flex justify-between  items-center my-2"
                              id="payroll-employee-profile-benefits-total-view-row"
                              data-cy="payroll-employee-profile-benefits-total-view-row"
                            >
                              <Text
                                className="text-purple "
                                id="payroll-employee-profile-benefits-total-label"
                                data-cy="payroll-employee-profile-benefits-total-label"
                              >
                                Entitled Benefit:
                              </Text>
                              <Text
                                className="text-purple pr-10"
                                id="payroll-employee-profile-benefits-total-value"
                                data-cy="payroll-employee-profile-benefits-total-value"
                              >
                                {totalAmount([
                                  ...(activeMergedPayroll?.breakdown?.merits ||
                                    []),
                                  ...(activeMergedPayroll?.breakdown
                                    ?.variablePay
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
                        <div
                          className="flex flex-col"
                          id="payroll-employee-profile-deductions-section-view-container"
                          data-cy="payroll-employee-profile-deductions-section-view-container"
                        >
                          <div
                            className=" p-4 flex justify-between  items-center my-2"
                            id="payroll-employee-profile-deductions-header-view-container"
                            data-cy="payroll-employee-profile-deductions-header-view-container"
                          >
                            <Text
                              className="text-xl"
                              id="payroll-employee-profile-deductions-header-label"
                              data-cy="payroll-employee-profile-deductions-header-label"
                            >
                              Employee Deductions
                            </Text>
                            <Text
                              className="text-xl pr-10"
                              id="payroll-employee-profile-deductions-header-amount"
                              data-cy="payroll-employee-profile-deductions-header-amount"
                            >
                              Amount
                            </Text>
                          </div>

                          <div
                            className="flex justify-between gap-2 w-full"
                            id="payroll-employee-profile-deductions-values-view-row"
                            data-cy="payroll-employee-profile-deductions-values-view-row"
                          >
                            <div
                              className="flex flex-col gap-2 justify-center items-start pl-4"
                              id="payroll-employee-profile-deductions-types-view-column"
                              data-cy="payroll-employee-profile-deductions-types-view-column"
                            >
                              {activeMergedPayroll?.breakdown?.pension?.map(
                                (item: any, index: any) => (
                                  <Text
                                    className="text-gray-600"
                                    key={`pension-type-${index}`}
                                    id={`payroll-employee-profile-pension-type-view-text-${index}`}
                                    data-cy={`payroll-employee-profile-pension-type-view-text-${index}`}
                                  >
                                    {item.type}
                                  </Text>
                                ),
                              )}
                              {activeMergedPayroll?.breakdown?.totalDeductionWithPension?.map(
                                (item: any, index: any) => (
                                  <Text
                                    className="text-gray-600"
                                    key={`deduction-type-${index}`}
                                    id={`payroll-employee-profile-deduction-type-view-text-${index}`}
                                    data-cy={`payroll-employee-profile-deduction-type-view-text-${index}`}
                                  >
                                    {item.type}
                                  </Text>
                                ),
                              )}
                            </div>
                            <div
                              className="flex flex-col gap-2 text-right justify-end items-start pr-10"
                              id="payroll-employee-profile-deductions-amounts-view-column"
                              data-cy="payroll-employee-profile-deductions-amounts-view-column"
                            >
                              {activeMergedPayroll?.breakdown?.pension?.map(
                                (item: any, index: any) => (
                                  <Text
                                    className="font-bold"
                                    key={`pension-amount-${index}`}
                                    id={`payroll-employee-profile-pension-amount-view-text-${index}`}
                                    data-cy={`payroll-employee-profile-pension-amount-view-text-${index}`}
                                  >
                                    {parseFloat(item.amount).toFixed(2)}
                                  </Text>
                                ),
                              )}
                              {activeMergedPayroll?.breakdown?.totalDeductionWithPension?.map(
                                (item: any, index: any) => (
                                  <Text
                                    className="font-bold"
                                    key={`deduction-amount-${index}`}
                                    id={`payroll-employee-profile-deduction-amount-view-text-${index}`}
                                    data-cy={`payroll-employee-profile-deduction-amount-view-text-${index}`}
                                  >
                                    {parseFloat(item.amount).toFixed(2)}
                                  </Text>
                                ),
                              )}
                            </div>
                          </div>
                          <div
                            className="pl-4 my-6 flex justify-between "
                            id="payroll-employee-profile-deductions-total-view-row"
                            data-cy="payroll-employee-profile-deductions-total-view-row"
                          >
                            <Text
                              className="text-purple"
                              id="payroll-employee-profile-deductions-total-label"
                              data-cy="payroll-employee-profile-deductions-total-label"
                            >
                              {' '}
                              Total Deduction
                            </Text>
                            <Text
                              className="text-purple pr-10"
                              id="payroll-employee-profile-deductions-total-value"
                              data-cy="payroll-employee-profile-deductions-total-value"
                            >
                              {totalAmount([
                                ...(activeMergedPayroll?.breakdown?.pension ||
                                  []),
                                ...(activeMergedPayroll?.breakdown
                                  ?.totalDeductionWithPension || []),
                              ])}{' '}
                            </Text>
                          </div>
                        </div>

                        <Divider
                          className="my-2"
                          data-cy="payroll-employee-profile-bank-info-divider"
                        />
                        <header
                          className=" border-b pb-2 mb-2"
                          id="payroll-employee-profile-bank-info-header"
                          data-cy="payroll-employee-profile-bank-info-header"
                        >
                          <h2
                            className="text-xl font-semibold"
                            id="payroll-employee-profile-bank-info-title"
                            data-cy="payroll-employee-profile-bank-info-title"
                          >
                            Employee Bank Information
                          </h2>
                        </header>
                        <div
                          id="payroll-employee-profile-bank-info-section-view-container"
                          data-cy="payroll-employee-profile-bank-info-section-view-container"
                        >
                          <div
                            className=" p-4 flex justify-between  items-center my-2"
                            id="payroll-employee-profile-bank-info-header-row"
                            data-cy="payroll-employee-profile-bank-info-header-row"
                          >
                            <Text
                              className="text-xl"
                              id="payroll-employee-profile-bank-detail-label"
                              data-cy="payroll-employee-profile-bank-detail-label"
                            >
                              Employee Bank Details
                            </Text>
                            <Text
                              className="text-xl pr-10"
                              id="payroll-employee-profile-bank-detail-amount-label"
                              data-cy="payroll-employee-profile-bank-detail-amount-label"
                            >
                              Details
                            </Text>
                          </div>
                          <div
                            className="flex justify-between  w-full"
                            id="payroll-employee-profile-bank-info-values-row"
                            data-cy="payroll-employee-profile-bank-info-values-row"
                          >
                            <div
                              className="flex flex-col gap-2 pl-4"
                              id="payroll-employee-profile-bank-info-labels-column"
                              data-cy="payroll-employee-profile-bank-info-labels-column"
                            >
                              <Text
                                id="payroll-employee-profile-bank-name-label"
                                data-cy="payroll-employee-profile-bank-name-label"
                              >
                                Bank Information:
                              </Text>
                              <Text
                                id="payroll-employee-profile-bank-account-label"
                                data-cy="payroll-employee-profile-bank-account-label"
                              >
                                Account Number:
                              </Text>
                            </div>
                            <div
                              className="flex flex-col gap-3 font-bold"
                              id="payroll-employee-profile-bank-info-values-column"
                              data-cy="payroll-employee-profile-bank-info-values-column"
                            >
                              <Text
                                id="payroll-employee-profile-bank-name-value"
                                data-cy="payroll-employee-profile-bank-name-value"
                              >
                                {
                                  activeMergedPayroll?.employeeInfo
                                    ?.employeeInformation?.bankInformation
                                    ?.bankName
                                }
                              </Text>
                              <Text
                                id="payroll-employee-profile-bank-account-value"
                                data-cy="payroll-employee-profile-bank-account-value"
                              >
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
                  </>
                )}
              </TabPane>

              <TabPane
                id="payroll-employee-profile-history-tab-view-tabpane"
                data-cy="payroll-employee-profile-history-tab-view-tabpane"
                tab="Payroll History"
                key="2"
              >
                <div
                  id="payroll-employee-profile-history-content-view-container"
                  data-cy="payroll-employee-profile-history-content-view-container"
                >
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
                            data-cy={`payroll-employee-profile-history-collapse-view-component-${period.id}`}
                            size="large"
                            className="p-4 m-2"
                            key={index}
                          >
                            <Collapse.Panel
                              key={period.id}
                              id={`payroll-employee-profile-history-panel-view-panel-${period.id}`}
                              data-cy={`payroll-employee-profile-history-panel-view-panel-${period.id}`}
                              header={`${dayjs(period.startDate).format('MMMM-YYYY')}`}
                            >
                              <div
                                className="flex gap-6 w-full m-4"
                                id={`payroll-employee-profile-history-period-view-container-${period.id}`}
                                data-cy={`payroll-employee-profile-history-period-view-container-${period.id}`}
                              >
                                <div
                                  className="flex flex-col gap-4 w-1/3"
                                  id={`payroll-employee-profile-history-labels-view-column-${period.id}`}
                                  data-cy={`payroll-employee-profile-history-labels-view-column-${period.id}`}
                                >
                                  <Text
                                    className=" text-gray-600"
                                    id={`payroll-employee-profile-history-salary-label-${period.id}`}
                                    data-cy={`payroll-employee-profile-history-salary-label-${period.id}`}
                                  >
                                    Salary Period
                                  </Text>
                                  <Text
                                    className=" text-gray-600"
                                    id={`payroll-employee-profile-history-paydate-label-${period.id}`}
                                    data-cy={`payroll-employee-profile-history-paydate-label-${period.id}`}
                                  >
                                    Pay Date
                                  </Text>
                                </div>
                                <div
                                  className="flex flex-col gap-4 font-bold"
                                  id={`payroll-employee-profile-history-values-view-column-${period.id}`}
                                  data-cy={`payroll-employee-profile-history-values-view-column-${period.id}`}
                                >
                                  <Text
                                    id={`payroll-employee-profile-history-salary-value-${period.id}`}
                                    data-cy={`payroll-employee-profile-history-salary-value-${period.id}`}
                                  >
                                    {dayjs(period.startDate).format('MMM-YYYY')}
                                  </Text>
                                  <Text
                                    id={`payroll-employee-profile-history-paydate-value-${period.id}`}
                                    data-cy={`payroll-employee-profile-history-paydate-value-${period.id}`}
                                  >
                                    {dayjs(period.updatedAt).format(
                                      'MMM-DD-YYYY',
                                    )}
                                  </Text>
                                </div>
                              </div>
                              <PayrollDetails
                                data-cy={`payroll-employee-profile-history-details-view-component-${period.id}`}
                                activeMergedPayroll={activeMergedPayroll}
                              />
                            </Collapse.Panel>
                          </Collapse>
                        );
                      })
                  ) : (
                    <EmptyImage data-cy="payroll-employee-profile-history-empty-view-component" />
                  )}
                </div>
              </TabPane>
              <TabPane
                id="payroll-employee-profile-settlement-tab-view-tabpane"
                data-cy="payroll-employee-profile-settlement-tab-view-tabpane"
                tab="Settlement Tracking"
                key="3"
              >
                <SettlementDetail data-cy="payroll-employee-profile-settlement-view-component" />
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default EmployeeProfile;
