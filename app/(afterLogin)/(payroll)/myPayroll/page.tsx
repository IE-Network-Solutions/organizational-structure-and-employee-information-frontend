'use client';

import React, { useEffect, useMemo } from 'react';
import {
  Breadcrumb,
  Card,
  Col,
  Divider,
  Row,
  Tabs,
  Tag,
  Typography,
  Space,
  Skeleton,
  Progress,
  Button,
} from 'antd';
import CustomPagination from '@/components/customPagination';
import CustomBreadcrumb from '@/components/common/breadCramp';
import EmptyState from '@/components/empty';
import { DownloadOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PayrollDetails from '../employee-information/[id]/_components/PayrollDetails';
import PayslipInfoItem from '../_components/payslipInfoItem';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  useGetActivePayroll,
  useGetPayPeriod,
  useGetPayrollHistory,
} from '@/store/server/features/payroll/payroll/queries';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import dayjs from 'dayjs';
import useEmployeeStore from '@/store/uistate/features/payroll/employeeInfoStore';
import { usePayrollStore } from '@/store/uistate/features/payroll/payroll';
import {
  useGetSettlementTracking,
  useEmployeeSettlementTracking,
} from '@/store/server/features/payroll/settlementTracking/queries';
import { useGetAllowance } from '@/store/server/features/payroll/employeeInformation/queries';

const { Text } = Typography;

export default function MyPayroll() {
  const { userId } = useAuthenticationStore();
  const { data: payPeriodData } = useGetPayPeriod();
  const { data: employee, isLoading: isEmployeeLoading } = useGetEmployee(
    userId!,
  );
  const { pageSize } = usePayrollStore();
  const { data: payroll, isLoading: isPayrollLoading } = useGetActivePayroll(
    `&employeeId=${userId}`,
    pageSize,
    1,
  );
  const { data: payrollHistory } = useGetPayrollHistory(userId!);
  const [historyCurrentPage, setHistoryCurrentPage] = React.useState(1);
  const [historyPageSize, setHistoryPageSize] = React.useState(3);

  const {
    activeMergedPayroll,
    activePayPeriod,
    setMergedPayroll,
    setActiveMergedPayroll,
    setActivePayPeriod,
  } = useEmployeeStore();
  const payslipRef = React.useRef(null);
  const pendingDownloadRef = React.useRef(false);
  const [payslipPayroll, setPayslipPayroll] = React.useState<any>(null);
  const [payslipPeriod, setPayslipPeriod] = React.useState<any>(null);

  const templatePayroll = payslipPayroll ?? activeMergedPayroll;
  const templatePeriod = payslipPeriod ?? activePayPeriod;

  const downloadPayslip = (payrollItem?: any, period?: any) => {
    pendingDownloadRef.current = true;
    setPayslipPayroll({
      ...(payrollItem || activeMergedPayroll || {}),
      employeeInfo:
        payrollItem?.employeeInfo ||
        activeMergedPayroll?.employeeInfo ||
        employee,
    });
    setPayslipPeriod(payrollItem ? period : activePayPeriod);
  };

  React.useLayoutEffect(() => {
    if (!pendingDownloadRef.current || !payslipRef.current) return;
    pendingDownloadRef.current = false;

    const payslipElement = payslipRef.current as HTMLElement;
    html2canvas(payslipElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const totalPages = Math.ceil(imgHeight / pageHeight);

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        const yPosition = -(i * pageHeight);
        pdf.addImage(imgData, 'PNG', 0, yPosition, imgWidth, imgHeight);
      }

      const periodLabel = templatePeriod?.startDate
        ? dayjs(templatePeriod.startDate).format('MMMM-YYYY')
        : '';
      pdf.save(
        `${templatePayroll?.employeeInfo?.firstName || employee?.firstName}_${
          templatePayroll?.employeeInfo?.lastName || employee?.lastName
        }_Payslip_${periodLabel}.pdf`,
      );
    });
  }, [payslipPayroll, payslipPeriod, templatePayroll, templatePeriod, employee]);

  const openPayPeriods = useMemo(
    () => payPeriodData?.filter((period: any) => period.status === 'OPEN'),
    [payPeriodData],
  );

  useEffect(() => {
    if (payPeriodData && activeMergedPayroll?.payPeriodId) {
      const currentPayPeriod = payPeriodData.find(
        (payPeriod: any) => payPeriod.id === activeMergedPayroll.payPeriodId,
      );
      setActivePayPeriod(currentPayPeriod);
    }
  }, [activeMergedPayroll, payPeriodData, setActivePayPeriod]);

  useEffect(() => {
    if (payroll?.items && employee) {
      const mergedData = payroll.items.map((pay: any) => ({
        ...pay,
        employeeInfo: employee || null,
      }));

      setMergedPayroll(mergedData);

      const activeMergedData =
        mergedData?.find(
          (pay: any) => openPayPeriods?.[0]?.id === pay.payPeriodId,
        ) || mergedData?.[0];

      setActiveMergedPayroll(activeMergedData || null);
    }
  }, [
    payroll?.items,
    employee,
    openPayPeriods,
    setMergedPayroll,
    setActiveMergedPayroll,
  ]);

  const loading = isEmployeeLoading || isPayrollLoading;

  const renderInformation = () => {
    if (loading)
      return <Skeleton active data-cy="my-payroll-info-loading-skeleton" />;
    if (!activeMergedPayroll)
      return (
        <EmptyState
          compact
          description="No payroll data available for this period."
          data-cy="my-payroll-info-empty"
        />
      );

    const breakdown = activeMergedPayroll?.breakdown;

    // Project Incentive lives in merits; do not also add breakdown.incentives
    const entitledBenefitTotal =
      (breakdown?.merits?.reduce(
        (acc: number, item: any) => acc + parseFloat(item.amount || '0'),
        0,
      ) || 0) +
      (breakdown?.variablePay
        ? parseFloat(breakdown.variablePay.amount || '0')
        : 0);

    const entitledDeductionTotal =
      // (breakdown?.pension?.reduce(
      //   (acc: number, item: any) => acc + parseFloat(item.amount || '0'),
      //   0,
      // ) || 0) +
      breakdown?.totalDeductionWithPension?.reduce(
        (acc: number, item: any) => acc + parseFloat(item.amount || '0'),
        0,
      ) || 0;

    return (
      <Row
        gutter={[
          { xs: 16, sm: 24, md: 32, lg: 24 },
          { xs: 16, sm: 24, md: 32, lg: 24 },
        ]}
      >
        <Col xs={24} lg={12}>
          <Card
            title={
              <Text
                strong
                style={{
                  fontSize: '15px',
                  color: 'rgba(0, 0, 0, 0.65)',
                  fontWeight: 600,
                }}
              >
                Payroll Information
              </Text>
            }
            bordered
            style={{ borderRadius: '8px', border: '1px solid #e0e0e0' }}
            headStyle={{ borderBottom: 'none', padding: '16px 20px 0 20px' }}
            bodyStyle={{ padding: '0 20px 20px 20px' }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <PayslipInfoItem data-cy="my-payroll-info-item"
                  label="Basic Salary"
                  value={
                    activeMergedPayroll?.employeeInfo?.basicSalaries?.[0]
                      ?.basicSalary || '--'
                  }
                />
              </Col>
              <Col span={12}>
                <PayslipInfoItem data-cy="my-payroll-info-item"
                  label="Account Number"
                  value={
                    activeMergedPayroll?.employeeInfo?.employeeInformation
                      ?.bankInformation?.accountNumber || '--'
                  }
                />
              </Col>
              <Col span={12}>
                <PayslipInfoItem data-cy="my-payroll-info-item"
                  label="Bank Information"
                  value={
                    activeMergedPayroll?.employeeInfo?.employeeInformation
                      ?.bankInformation?.bankName || '--'
                  }
                />
              </Col>
              <Col span={12}>
                <PayslipInfoItem data-cy="my-payroll-info-item"
                  label="Branch"
                  value={
                    activeMergedPayroll?.employeeInfo
                      ?.employeeJobInformation?.[0]?.branch?.name || '--'
                  }
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Row justify="space-between" align="middle">
                <Text
                  strong
                  style={{
                    fontSize: '15px',
                    color: 'rgba(0, 0, 0, 0.65)',
                    fontWeight: 600,
                  }}
                >
                  {dayjs(activePayPeriod?.startDate).format('MMMM')} Pay Slip
                </Text>
                <Button
                  onClick={downloadPayslip}
                  icon={<DownloadOutlined style={{ fontSize: '18px' }} />}
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #d9d9d9',
                    color: '#595959',
                    fontSize: '16px',
                    fontWeight: 400,
                    height: '42px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0 16px',
                    boxShadow: 'none',
                  }}
                >
                  Download
                </Button>
              </Row>
            }
            bordered
            style={{ borderRadius: '8px', border: '1px solid #e0e0e0' }}
            headStyle={{ borderBottom: 'none', padding: '16px 20px 0 20px' }}
            bodyStyle={{ padding: '0 20px 20px 20px' }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <PayslipInfoItem data-cy="my-payroll-info-item"
                  label="Salary Period"
                  value={dayjs(activePayPeriod?.startDate).format('MMM-YYYY')}
                />
              </Col>
              <Col span={12}>
                <PayslipInfoItem data-cy="my-payroll-info-item"
                  label="Pay Date"
                  value={dayjs(activePayPeriod?.updatedAt).format(
                    'MMM-DD-YYYY',
                  )}
                />
              </Col>
            </Row>
            <Divider style={{ margin: '8px 0', borderColor: '#e0e0e0' }} />
            <PayslipInfoItem data-cy="my-payroll-info-item"
              label="Entitled Allowance"
              value={parseFloat(
                activeMergedPayroll?.totalAllowance || '0',
              ).toFixed(2)}
              large
              tags={breakdown?.allowances?.map((a: any) => ({
                label: a.type,
                value: parseFloat(a.amount || '0').toFixed(2),
              }))}
            />
            <Divider style={{ margin: '8px 0', borderColor: '#e0e0e0' }} />
            <PayslipInfoItem data-cy="my-payroll-info-item"
              label="Entitled Benefit"
              value={entitledBenefitTotal.toFixed(2)}
              large
              tags={[
                ...(breakdown?.merits?.map((m: any) => ({
                  label: m.type,
                  value: parseFloat(m.amount || '0').toFixed(2),
                })) || []),
                ...(breakdown?.variablePay
                  ? [
                      {
                        label: breakdown.variablePay.type,
                        value: parseFloat(
                          breakdown.variablePay.amount || '0',
                        ).toFixed(2),
                      },
                    ]
                  : []),
              ]}
            />
            <Divider style={{ margin: '8px 0', borderColor: '#e0e0e0' }} />
            <PayslipInfoItem data-cy="my-payroll-info-item"
              label="Entitled Deduction"
              value={entitledDeductionTotal.toFixed(2)}
              large
              tags={[
                // ...(breakdown?.pension?.map((p: any) => ({
                //   label: p.type,
                //   value: parseFloat(p.amount || '0').toFixed(2),
                // })) || []),
                ...(breakdown?.totalDeductionWithPension?.map((d: any) => ({
                  label: d.type,
                  value: parseFloat(d.amount || '0').toFixed(2),
                })) || []),
              ]}
            />
            <Divider style={{ margin: '8px 0', borderColor: '#e0e0e0' }} />
            <Row gutter={16}>
              <Col span={12}>
                <PayslipInfoItem data-cy="my-payroll-info-item"
                  label="Gross Earning"
                  value={parseFloat(
                    activeMergedPayroll?.grossSalary || '0',
                  ).toFixed(2)}
                />
              </Col>
              <Col span={12}>
                <PayslipInfoItem data-cy="my-payroll-info-item"
                  label="Net Pay"
                  value={parseFloat(activeMergedPayroll?.netPay || '0').toFixed(
                    2,
                  )}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div
      className="responsive-container"
      style={{
        padding: '24px 0',
        backgroundColor: '#fff',
        minHeight: '100vh',
      }}
      data-cy="my-payroll-page-container"
    >
      <style data-cy="my-payroll-page-styles">{`
        .info-item { margin-bottom: 20px; }
        .page-title { font-size: 24px !important; margin-bottom: 4px !important; }
        
        @media (max-width: 768px) {
          .info-item { margin-bottom: 12px !important; }
          .info-item span { font-size: 13px !important; }
          .page-title { font-size: 18px !important; }
          .responsive-container .ant-card-body { padding: 16px !important; }
          .responsive-container .ant-card-head { padding: 16px 16px 0 16px !important; }
          .responsive-container .ant-card-head-title { font-size: 14px !important; }
          .truncated-tag { max-width: 150px !important; }
        }
        .truncated-tag {
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: inline-block;
          vertical-align: bottom;
        }
        .custom-tabs {
          margin-bottom: 24px;
        }
        .full-bleed-header-divider {
          width: calc(100% + 48px) !important;
          margin-left: -24px !important;
          margin-right: -24px !important;
          min-width: calc(100% + 48px) !important;
        }
        .settlement-scroll-hidden {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .settlement-scroll-hidden::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }
        :global(.ant-tabs-tab .ant-tabs-tab-btn) {
          font-size: 16px !important;
        }
        :global(.ant-tabs-tab-active .ant-tabs-tab-btn) {
          font-weight: 700 !important;
          color: #1E40AF !important;
        }
        @media (max-width: 768px) {
          .full-bleed-header-divider {
            width: calc(100% + 48px) !important;
            margin-left: -24px !important;
            margin-right: -24px !important;
          }
        }
      `}</style>
      <CustomBreadcrumb
        title={<span data-cy="my-payroll-title">My Payroll Information</span>}
        subtitle={
          <Breadcrumb
            style={{ marginBottom: '0px', fontSize: '14px' }}
            data-cy="my-payroll-breadcrumb"
            items={[
              {
                title: (
                  <span data-cy="my-payroll-breadcrumb-employee">Payroll</span>
                ),
              },
              {
                title: (
                  <span data-cy="my-payroll-breadcrumb-my-payroll">
                    My Payroll
                  </span>
                ),
              },
            ]}
          />
        }
      />

      <Tabs
        defaultActiveKey="1"
        className="custom-tabs"
        data-cy="my-payroll-tabs"
      >
        <Tabs.TabPane
          tab="Information"
          key="1"
          data-cy="my-payroll-tab-information"
        >
          <div
            style={{ paddingTop: '8px' }}
            data-cy="my-payroll-tab-information-content"
          >
            {renderInformation()}
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane
          tab="Payroll History"
          key="2"
          data-cy="my-payroll-tab-history"
        >
          <div
            style={{ paddingTop: '24px' }}
            data-cy="my-payroll-tab-history-content"
          >
            {!payPeriodData ||
            !payrollHistory ||
            payrollHistory.length === 0 ? (
              <EmptyState
                compact
                description="No payroll history found."
                data-cy="my-payroll-history-empty"
              />
            ) : (
              <>
                <Row
                  gutter={[
                    { xs: 16, sm: 24, md: 32, lg: 48 },
                    { xs: 16, sm: 24, md: 32, lg: 48 },
                  ]}
                  data-cy="my-payroll-history-cards-row"
                >
                  {payrollHistory
                    .slice(
                      (historyCurrentPage - 1) * historyPageSize,
                      historyCurrentPage * historyPageSize,
                    )
                    .map((historyItem: any, index: number) => {
                      const period = payPeriodData?.find(
                        (p: any) => p.id === historyItem.payPeriodId,
                      );
                      const breakdown = historyItem.breakdown;

                      const entitledBenefitTotal =
                        (breakdown?.merits?.reduce(
                          (acc: number, item: any) =>
                            acc + parseFloat(item.amount || '0'),
                          0,
                        ) || 0) +
                        (breakdown?.variablePay
                          ? parseFloat(breakdown.variablePay.amount || '0')
                          : 0);

                      const entitledDeductionTotal =
                        // (breakdown?.pension?.reduce(
                        //   (acc: number, item: any) =>
                        //     acc + parseFloat(item.amount || '0'),
                        //   0,
                        // ) || 0) +
                        breakdown?.totalDeductionWithPension?.reduce(
                          (acc: number, item: any) =>
                            acc + parseFloat(item.amount || '0'),
                          0,
                        ) || 0;

                      return (
                        <Col
                          xs={24}
                          md={12}
                          lg={8}
                          key={index}
                          data-cy="my-payroll-history-card-column"
                        >
                          <Card
                            title={
                              <Row justify="space-between" align="middle">
                                <Text
                                  strong
                                  style={{
                                    fontSize: '15px',
                                    color: 'rgba(0, 0, 0, 0.65)',
                                    fontWeight: 600,
                                  }}
                                  data-cy="my-payroll-history-card-title"
                                >
                                  {period
                                    ? dayjs(period.startDate).format(
                                        'MMMM-YYYY',
                                      )
                                    : 'Unknown'}
                                </Text>
                                <Button
                                  onClick={() =>
                                    downloadPayslip(historyItem, period)
                                  }
                                  icon={
                                    <DownloadOutlined
                                      style={{ fontSize: '16px' }}
                                    />
                                  }
                                  data-cy="my-payroll-history-download-button"
                                  style={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #d9d9d9',
                                    color: '#595959',
                                    fontSize: '14px',
                                    fontWeight: 400,
                                    height: '36px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '0 12px',
                                    boxShadow: 'none',
                                  }}
                                >
                                  Download
                                </Button>
                              </Row>
                            }
                            bordered
                            style={{
                              borderRadius: '8px',
                              border: '1px solid #e0e0e0',
                            }}
                            headStyle={{
                              borderBottom: 'none',
                              padding: '16px 20px 0 20px',
                            }}
                            bodyStyle={{ padding: '16px 20px' }}
                            data-cy="my-payroll-history-card"
                          >
                            <Row gutter={[16, 16]}>
                              <Col span={12}>
                                <PayslipInfoItem data-cy="my-payroll-info-item"
                                  label="Salary Period"
                                  value={
                                    period
                                      ? dayjs(period.startDate).format(
                                          'MMM-YYYY',
                                        )
                                      : '--'
                                  }
                                />
                              </Col>
                              <Col span={12}>
                                <PayslipInfoItem data-cy="my-payroll-info-item"
                                  label="Pay Date"
                                  value={
                                    period
                                      ? dayjs(period.updatedAt).format(
                                          'MMM-DD-YYYY',
                                        )
                                      : '--'
                                  }
                                />
                              </Col>
                            </Row>
                            <Divider
                              style={{
                                margin: '12px 0',
                                borderColor: '#e0e0e0',
                              }}
                            />
                            <PayslipInfoItem data-cy="my-payroll-info-item"
                              label="Entitled Allowance"
                              value={parseFloat(
                                historyItem.totalAllowance || '0',
                              ).toFixed(2)}
                              large
                              tags={breakdown?.allowances?.map((a: any) => ({
                                label: a.type,
                                value: parseFloat(a.amount || '0').toFixed(2),
                              }))}
                            />
                            <Divider
                              style={{
                                margin: '12px 0',
                                borderColor: '#e0e0e0',
                              }}
                            />
                            <PayslipInfoItem data-cy="my-payroll-info-item"
                              label="Entitled Benefit"
                              value={entitledBenefitTotal.toFixed(2)}
                              large
                              tags={[
                                ...(breakdown?.merits?.map((m: any) => ({
                                  label: m.type,
                                  value: parseFloat(m.amount || '0').toFixed(2),
                                })) || []),
                                ...(breakdown?.variablePay
                                  ? [
                                      {
                                        label: breakdown.variablePay.type,
                                        value: parseFloat(
                                          breakdown.variablePay.amount || '0',
                                        ).toFixed(2),
                                      },
                                    ]
                                  : []),
                              ]}
                            />
                            <Divider
                              style={{
                                margin: '12px 0',
                                borderColor: '#e0e0e0',
                              }}
                            />
                            <PayslipInfoItem data-cy="my-payroll-info-item"
                              label="Entitled Deduction"
                              value={entitledDeductionTotal.toFixed(2)}
                              large
                              tags={[
                                // ...(breakdown?.pension?.map((p: any) => ({
                                //   label: p.type,
                                //   value: parseFloat(p.amount || '0').toFixed(2),
                                // })) || []),
                                ...(breakdown?.totalDeductionWithPension?.map(
                                  (d: any) => ({
                                    label: d.type,
                                    value: parseFloat(d.amount || '0').toFixed(
                                      2,
                                    ),
                                  }),
                                ) || []),
                              ]}
                            />
                            <Divider
                              style={{
                                margin: '8px 0',
                                borderColor: '#e0e0e0',
                              }}
                            />
                            <Row gutter={16}>
                              <Col span={12}>
                                <PayslipInfoItem data-cy="my-payroll-info-item"
                                  label="Gross Earning"
                                  value={parseFloat(
                                    historyItem.grossSalary || '0',
                                  ).toFixed(2)}
                                />
                              </Col>
                              <Col span={12}>
                                <PayslipInfoItem data-cy="my-payroll-info-item"
                                  label="Net Pay"
                                  value={parseFloat(
                                    historyItem.netPay || '0',
                                  ).toFixed(2)}
                                />
                              </Col>
                            </Row>
                          </Card>
                        </Col>
                      );
                    })}
                </Row>
                <div
                  style={{ marginTop: '32px' }}
                  data-cy="my-payroll-history-pagination-wrapper"
                >
                  <CustomPagination
                    current={historyCurrentPage}
                    total={payrollHistory.length}
                    pageSize={historyPageSize}
                    onChange={(page, size) => {
                      setHistoryCurrentPage(page);
                      setHistoryPageSize(size);
                    }}
                    onShowSizeChange={(size) => {
                      setHistoryPageSize(size);
                      setHistoryCurrentPage(1);
                    }}
                    data-cy="my-payroll-history-pagination"
                  />
                </div>
              </>
            )}
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane
          tab="Settlement Tracking"
          key="3"
          data-cy="my-payroll-tab-settlement"
        >
          <div
            style={{ paddingTop: '24px' }}
            data-cy="my-payroll-tab-settlement-content"
          >
            <SettlementView userId={userId!} />
          </div>
        </Tabs.TabPane>
      </Tabs>

      {/* Hidden Payslip for PDF generation */}
      <div
        className="h-0 overflow-hidden"
        data-cy="my-payroll-hidden-payslip-wrapper"
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
          data-cy="my-payroll-payslip-content"
        >
          <header
            className="text-center border-b pb-4 mb-4"
            data-cy="my-payroll-payslip-header"
          >
            <h2
              className="text-xl font-semibold"
              data-cy="my-payroll-payslip-title"
            >
              Payslip for the month of{' '}
              <span
                className="text-violet-500"
                data-cy="my-payroll-payslip-period"
              >
                {dayjs(templatePeriod?.startDate).format('MMMM-YYYY')}
              </span>
            </h2>
          </header>
          <div
            className="flex justify-between"
            data-cy="my-payroll-payslip-summary"
          >
            <div
              className="mx-2 flex flex-col gap-2"
              data-cy="my-payroll-payslip-info"
            >
              <div
                className="font-bold text-xl"
                data-cy="my-payroll-payslip-summary-title"
              >
                Employee Pay Summary
              </div>
              <div
                className="flex gap-6 w-full"
                data-cy="my-payroll-payslip-info-grid"
              >
                <div
                  className="flex flex-col gap-2"
                  data-cy="my-payroll-payslip-labels"
                >
                  <Text data-cy="my-payroll-payslip-label-name">
                    Employee name:
                  </Text>
                  <Text data-cy="my-payroll-payslip-label-job">Job title:</Text>
                  <Text data-cy="my-payroll-payslip-label-period">
                    Pay period:
                  </Text>
                  <Text data-cy="my-payroll-payslip-label-date">Pay Date:</Text>
                </div>
                <div
                  className="flex flex-col gap-2 font-bold"
                  data-cy="my-payroll-payslip-values"
                >
                  <Text data-cy="my-payroll-payslip-value-name">
                    {[employee?.firstName, employee?.middleName]
                      .filter(Boolean)
                      .join(' ')}
                  </Text>
                  <Text data-cy="my-payroll-payslip-value-job">
                    {
                      employee?.employeeJobInformation?.find(
                        (job: any) => job.isPositionActive,
                      )?.position?.name
                    }
                  </Text>
                  <Text data-cy="my-payroll-payslip-value-period">
                    {dayjs(templatePeriod?.startDate).format('MMM-YYYY')}
                  </Text>
                  <Text data-cy="my-payroll-payslip-value-date">
                    {dayjs(templatePeriod?.updatedAt).format('MMM-DD-YYYY')}
                  </Text>
                </div>
              </div>
            </div>
            <div
              className="flex flex-col justify-center items-center m-2"
              data-cy="my-payroll-payslip-amounts"
            >
              <span
                className="font-bold text-xl"
                data-cy="my-payroll-payslip-net-label"
              >
                Employee Net Pay
              </span>
              <span
                className="text-violet-500 text-4xl font-bold mb-2"
                data-cy="my-payroll-payslip-net-value"
              >
                {templatePayroll?.netPay}
              </span>
              <span
                className="font-bold text-xl"
                data-cy="my-payroll-payslip-basic-label"
              >
                Employee Basic Salary
              </span>
              <span
                className=" text-2xl font-bold"
                data-cy="my-payroll-payslip-basic-value"
              >
                {templatePayroll?.employeeInfo?.basicSalaries?.[0]?.basicSalary}{' '}
              </span>
            </div>
          </div>
          <Divider className="my-2" />
          <header
            className=" border-b pb-2 mb-2"
            data-cy="my-payroll-payslip-earnings-header"
          >
            <h2
              className="text-xl font-semibold"
              data-cy="my-payroll-payslip-earnings-title"
            >
              Employee Earnings
            </h2>
          </header>
          <div
            className="flex flex-col w-full gap-4"
            data-cy="my-payroll-payslip-earnings-grid"
          >
            <div
              className=" pl-4 flex justify-between items-center my-2"
              data-cy="my-payroll-payslip-earnings-labels"
            >
              <Text
                className="text-xl"
                data-cy="my-payroll-payslip-earnings-label-allowance"
              >
                Employee Allowance
              </Text>
              <Text
                className="text-xl pr-10"
                data-cy="my-payroll-payslip-earnings-label-amount"
              >
                Amount
              </Text>
            </div>
            <div
              className="flex justify-between"
              data-cy="my-payroll-payslip-allowances"
            >
              <div
                className="flex flex-col gap-2 pl-4"
                data-cy="my-payroll-payslip-allowance-names"
              >
                {templatePayroll?.breakdown?.allowances?.map(
                  (item: any, index: any) => (
                    <Text
                      key={index}
                      data-cy={`my-payroll-payslip-allowance-name-${index}`}
                    >
                      {item.type}
                    </Text>
                  ),
                )}
              </div>
              <div
                className="flex flex-col gap-2 text-right font-bold pr-10"
                data-cy="my-payroll-payslip-allowance-amounts"
              >
                {templatePayroll?.breakdown?.allowances?.map(
                  (item: any, index: any) => (
                    <Text
                      key={index}
                      data-cy={`my-payroll-payslip-allowance-amount-${index}`}
                    >
                      {parseFloat(item.amount).toFixed(2)}
                    </Text>
                  ),
                )}
              </div>
            </div>
          </div>
          <PayrollDetails activeMergedPayroll={templatePayroll || undefined} />
        </div>
      </div>
      <style jsx data-cy="my-payroll-local-styles">{`
        .custom-tabs {
          margin-bottom: 24px;
        }
        :global(.ant-tabs-tab .ant-tabs-tab-btn) {
          font-size: 16px !important;
        }
        :global(.ant-tabs-tab-active .ant-tabs-tab-btn) {
          font-weight: 700 !important;
          color: #1e40af !important;
        }
      `}</style>
    </div>
  );
}

const SettlementView = ({ userId }: { userId: string }) => {
  const { data: allowanceDatas } = useGetAllowance();
  const { data: settlementTrackingData, isLoading } = useGetSettlementTracking({
    employeeId: userId!,
  });
  const [settlementPaymentsPage, setSettlementPaymentsPage] = React.useState(1);
  const [settlementPaymentsPageSize, setSettlementPaymentsPageSize] =
    React.useState(5);

  const groupedSettlements = useMemo(() => {
    if (!settlementTrackingData || !Array.isArray(settlementTrackingData))
      return {};
    return settlementTrackingData.reduce((acc: any, item: any) => {
      const id = item.compensationItemId;
      if (!acc[id]) acc[id] = [];
      acc[id].push(item);
      return acc;
    }, {});
  }, [settlementTrackingData]);

  const [selectedCompensationId, setSelectedCompensationId] = React.useState<
    string | null
  >(null);

  useEffect(() => {
    const keys = Object.keys(groupedSettlements);
    if (keys.length > 0 && !selectedCompensationId) {
      setSelectedCompensationId(keys[0]);
    }
  }, [groupedSettlements, selectedCompensationId]);

  const currentEntitlementId = useMemo(() => {
    if (!selectedCompensationId) return null;
    const group = groupedSettlements[selectedCompensationId];
    return group?.[0]?.compensationItemEntitlementId || group?.[0]?.id;
  }, [groupedSettlements, selectedCompensationId]);

  useEffect(() => {
    setSettlementPaymentsPage(1);
  }, [selectedCompensationId, currentEntitlementId]);

  const { data: entitlementDetail, isLoading: isDetailLoading } =
    useEmployeeSettlementTracking(currentEntitlementId || '', userId!);

  if (isLoading)
    return <Skeleton active data-cy="my-payroll-settlement-loading-skeleton" />;

  if (!settlementTrackingData || settlementTrackingData.length === 0) {
    return (
      <EmptyState
        compact
        description="No settlement tracking data available."
        data-cy="my-payroll-settlement-empty"
      />
    );
  }

  const settlementTracking =
    (entitlementDetail as any)?.settlementTracking || [];

  const totalAmount = settlementTracking.reduce(
    (acc: any, item: any) => acc + (Number(item.amount) || 0),
    0,
  );
  const totalPaid = settlementTracking
    .filter((item: any) => item.isPaid === true)
    .reduce((acc: any, item: any) => acc + (Number(item.amount) || 0), 0);
  const remaining = totalAmount - totalPaid;

  const progressPercent =
    totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

  const payments = settlementTracking.filter(
    (item: any) => item.isPaid === true,
  );
  const paginatedPayments = payments.slice(
    (settlementPaymentsPage - 1) * settlementPaymentsPageSize,
    settlementPaymentsPage * settlementPaymentsPageSize,
  );

  return (
    <Row gutter={[24, 24]} data-cy="my-payroll-settlement-view">
      {/* Sidebar List */}
      <Col xs={24} lg={10}>
        <Space
          direction="vertical"
          style={{ width: '100%' }}
          size={12}
          data-cy="my-payroll-settlement-list"
        >
          {Object.entries(groupedSettlements).map(([compId, items]: any) => (
            <Card
              key={compId}
              onClick={() => setSelectedCompensationId(compId)}
              style={{
                borderRadius: '12px',
                border:
                  selectedCompensationId === compId
                    ? '1px solid #1E40AF'
                    : '1px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              bodyStyle={{ padding: '16px' }}
              data-cy="my-payroll-settlement-item-card"
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                data-cy="my-payroll-settlement-item-header"
              >
                <Text
                  style={{
                    fontSize: '14px',
                    color: 'rgba(0, 0, 0, 0.65)',
                    fontWeight: 500,
                  }}
                  data-cy="my-payroll-settlement-item-title"
                >
                  {allowanceDatas?.find((a: any) => a.id === compId)?.name ||
                    'Settlement Item'}
                </Text>
                <Tag
                  color={
                    items.every((item: any) => item.isPaid === true)
                      ? 'success'
                      : undefined
                  }
                  style={{
                    borderRadius: '4px',
                    margin: 0,
                    backgroundColor: items.every(
                      (item: any) => item.isPaid === true,
                    )
                      ? undefined
                      : '#fffbe6',
                    border: items.every((item: any) => item.isPaid === true)
                      ? undefined
                      : '1px solid #FFE58F',
                    color: items.every((item: any) => item.isPaid === true)
                      ? undefined
                      : '#FAAD14',
                  }}
                  data-cy="my-payroll-settlement-item-status-tag"
                >
                  {items.every((item: any) => item.isPaid === true)
                    ? 'Paid'
                    : 'Pending'}
                </Tag>
              </div>
            </Card>
          ))}
        </Space>
      </Col>

      {/* Main Details View */}
      <Col xs={24} lg={14}>
        <div
          style={{
            border: '1px solid #1E40AF',
            borderRadius: '12px',
            padding: '24px',
            backgroundColor: '#fff',
          }}
          data-cy="my-payroll-settlement-details"
        >
          {isDetailLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <>
              <Row
                gutter={[16, 16]}
                data-cy="my-payroll-settlement-summary-row"
              >
                {[
                  { label: 'Total Amount', value: totalAmount },
                  { label: 'Total Paid', value: totalPaid },
                  { label: 'Remaining', value: remaining },
                ].map((card, i) => (
                  <Col xs={24} sm={8} key={i}>
                    <div
                      style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '16px',
                      }}
                      data-cy="my-payroll-settlement-summary-card"
                    >
                      <Text
                        style={{
                          fontSize: '14px',
                          color: 'rgba(0, 0, 0, 0.65)',
                          display: 'block',
                          marginBottom: '4px',
                        }}
                        data-cy="my-payroll-settlement-summary-label"
                      >
                        {card.label}
                      </Text>
                      <Text
                        style={{
                          fontSize: '30px',
                          color: 'rgba(0, 0, 0, 0.65)',
                          fontWeight: 600,
                        }}
                        data-cy="my-payroll-settlement-summary-value"
                      >
                        {card.value.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Text>
                    </div>
                  </Col>
                ))}
              </Row>

              <div
                style={{
                  marginTop: '16px',
                  padding: '16px',
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                }}
                data-cy="my-payroll-settlement-progress-wrapper"
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                  data-cy="my-payroll-settlement-progress-header"
                >
                  <Text
                    style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.65)' }}
                    data-cy="my-payroll-settlement-progress-label"
                  >
                    Repayment Progress
                  </Text>
                  <Text
                    style={{
                      color: '#4db818',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                    data-cy="my-payroll-settlement-progress-percent"
                  >
                    {progressPercent}%
                  </Text>
                </div>
                <Progress
                  percent={progressPercent}
                  strokeColor="#4db818"
                  showInfo={false}
                  strokeWidth={8}
                  trailColor="#f0f0f0"
                  data-cy="my-payroll-settlement-progress-bar"
                />
              </div>

              <div
                className="settlement-scroll-hidden"
                style={{
                  marginTop: '24px',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                }}
                data-cy="my-payroll-settlement-payments-container"
              >
                <div
                  style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#fafafa',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    minWidth: '720px',
                  }}
                  data-cy="my-payroll-settlement-payments-header"
                >
                  <div
                    style={{
                      flex: 1,
                      borderRight: '1px solid #e0e0e0',
                      paddingRight: '16px',
                    }}
                    data-cy="my-payroll-settlement-header-date-cell"
                  >
                    <Text strong style={{ fontSize: '14px', color: '#434343' }}>
                      Date
                    </Text>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      borderRight: '1px solid #e0e0e0',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                    }}
                    data-cy="my-payroll-settlement-header-amount-cell"
                  >
                    <Text strong style={{ fontSize: '14px', color: '#434343' }}>
                      Pay Amount
                    </Text>
                  </div>
                  <div
                    style={{
                      flex: 2,
                      borderRight: '1px solid #e0e0e0',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                    }}
                    data-cy="my-payroll-settlement-header-period-cell"
                  >
                    <Text strong style={{ fontSize: '14px', color: '#434343' }}>
                      Pay Period
                    </Text>
                  </div>
                  <div
                    style={{ flex: 1, paddingLeft: '16px' }}
                    data-cy="my-payroll-settlement-header-reason-cell"
                  >
                    <Text strong style={{ fontSize: '14px', color: '#434343' }}>
                      Reason
                    </Text>
                  </div>
                </div>

                <div
                  style={{ padding: '0 8px' }}
                  data-cy="my-payroll-settlement-payments-list"
                >
                  {payments.length > 0 ? (
                    paginatedPayments.map((payment: any, idx: number) => (
                      <div
                        key={
                          payment?.id ??
                          `${settlementPaymentsPage}-${idx}-${payment?.createdAt ?? ''}`
                        }
                        style={{
                          padding: '16px 8px',
                          backgroundColor:
                            ((settlementPaymentsPage - 1) *
                              settlementPaymentsPageSize +
                              idx) %
                              2 ===
                            1
                              ? '#fafafa'
                              : '#fff',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '4px',
                          minWidth: '720px',
                        }}
                        data-cy="my-payroll-settlement-payment-row"
                      >
                        <div
                          style={{ flex: 1, paddingRight: '16px' }}
                          data-cy="my-payroll-settlement-payment-date-cell"
                        >
                          <Text style={{ fontSize: '14px', color: '#595959' }}>
                            {payment.date ||
                              dayjs(payment.createdAt).format('MMM DD, YYYY')}
                          </Text>
                        </div>
                        <div
                          style={{
                            flex: 1,
                            paddingLeft: '16px',
                            paddingRight: '16px',
                          }}
                          data-cy="my-payroll-settlement-payment-amount-cell"
                        >
                          <Text style={{ fontSize: '14px', color: '#595959' }}>
                            {parseFloat(payment.amount || '0').toLocaleString(
                              undefined,
                              { minimumFractionDigits: 2 },
                            )}
                          </Text>
                        </div>
                        <div
                          style={{
                            flex: 2,
                            paddingLeft: '16px',
                            paddingRight: '16px',
                          }}
                          data-cy="my-payroll-settlement-payment-period-cell"
                        >
                          <Tag
                            style={{
                              backgroundColor: '#fff',
                              border: '1px solid #d9d9d9',
                              borderRadius: '4px',
                              padding: '2px 8px',
                              fontSize: '13px',
                              color: '#595959',
                            }}
                            data-cy="my-payroll-settlement-payment-period-tag"
                          >
                            {(() => {
                              const p = payment.period || payment.payPeriod;
                              if (!p) return '--';
                              if (typeof p === 'string') return p;
                              if (typeof p === 'object' && p.startDate) {
                                return `${dayjs(p.startDate).format('MMM DD, YYYY')} - ${dayjs(p.endDate).format('MMM DD, YYYY')}`;
                              }
                              return '--';
                            })()}
                          </Tag>
                        </div>
                        <div
                          style={{ flex: 1, paddingLeft: '16px' }}
                          data-cy="my-payroll-settlement-payment-reason-cell"
                        >
                          <Text style={{ fontSize: '14px', color: '#595959' }}>
                            {payment.reason || '--'}
                          </Text>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div data-cy="my-payroll-settlement-payments-empty-wrap">
                      <EmptyState
                        minimal
                        description="No payment history recorded."
                        data-cy="my-payroll-settlement-payments-empty"
                      />
                    </div>
                  )}
                </div>
              </div>
              {payments.length > 0 ? (
                <CustomPagination
                  current={settlementPaymentsPage}
                  total={payments.length}
                  pageSize={settlementPaymentsPageSize}
                  onChange={(page, size) => {
                    setSettlementPaymentsPage(page);
                    setSettlementPaymentsPageSize(size);
                  }}
                  onShowSizeChange={(size) => {
                    setSettlementPaymentsPageSize(size);
                    setSettlementPaymentsPage(1);
                  }}
                  data-cy="my-payroll-settlement-payments-pagination"
                />
              ) : null}
            </>
          )}
        </div>
      </Col>
    </Row>
  );
};
