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
  Tag,
  Skeleton,
  Space,
  Progress,
  Pagination,
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
  useGetActivePayroll,
  useGetPayPeriod,
  useGetPayrollHistory,
} from '@/store/server/features/payroll/payroll/queries';
import {
  useGetSettlementTracking,
  useEmployeeSettlementTracking,
} from '@/store/server/features/payroll/settlementTracking/queries';
import { useGetAllowance } from '@/store/server/features/payroll/employeeInformation/queries';
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
import { useIsMobile } from '@/hooks/useIsMobile';
import { EmptyImage } from '@/components/emptyIndicator';
import { PayPeriod } from '@/store/server/features/payroll/payroll/interface';
import { usePayrollStore } from '@/store/uistate/features/payroll/payroll';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const InfoItem = ({
  label,
  value,
  tags,
  large,
}: {
  label: string;
  value: string | number;
  tags?: { label: string; value: string | number }[];
  large?: boolean;
}) => (
  <div className="info-item" data-cy="payroll-info-item">
    <Text
      style={{
        fontSize: '14px',
        color: 'rgba(0, 0, 0, 0.65)',
        display: 'block',
        marginBottom: '2px',
      }}
      data-cy="payroll-info-item-label"
    >
      {label}
    </Text>
    <Text
      style={{
        fontSize: large ? '18px' : '16px',
        color: 'rgba(0, 0, 0, 0.65)',
        display: 'block',
        marginBottom: '2px',
      }}
      data-cy="payroll-info-item-value"
    >
      {value}
    </Text>
    {tags && tags.length > 0 && (
      <Space wrap size={[8, 8]} data-cy="payroll-info-item-tags">
        {tags.map((tag, index) => (
          <Tag
            key={index}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
              border: '1px solid #D9D9D9',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '14px',
              margin: 0,
            }}
            data-cy="payroll-info-item-tag"
          >
            <span
              style={{
                color: 'rgba(0, 0, 0, 0.65)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '120px',
              }}
              data-cy="payroll-info-item-tag-label"
            >
              {tag.label}
            </span>
            <span
              style={{ color: 'rgba(0, 0, 0, 0.65)', whiteSpace: 'nowrap' }}
              data-cy="payroll-info-item-tag-value"
            >
              {' '}
              : {tag.value}
            </span>
          </Tag>
        ))}
      </Space>
    )}
  </div>
);

const EmployeeProfile = () => {
  const { data: payPeriodData } = useGetPayPeriod();
  const { profileFileList } = useEmployeeManagementStore();
  const router = useRouter();

  const openPayPeriods = useMemo(
    () => payPeriodData?.filter((period: any) => period.status === 'OPEN'),
    [payPeriodData],
  );
  const { id } = useParams();
  const empId = id as string;

  const { data: employee, isLoading } = useGetEmployee(empId);

  const { pageSize } = usePayrollStore();
  const { data: payroll, isLoading: isPayrollLoading } = useGetActivePayroll(
    `&employeeId=${empId}`,
    pageSize,
    1,
  );
  const { data: payrollHistory } = useGetPayrollHistory(empId);
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const historyPageSize = 3;

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

  const serviceYear = useMemo(() => {
    const joinedDate = employee?.employeeInformation?.joinedDate;
    if (!joinedDate) return '-';
    const start = dayjs(joinedDate);
    const now = dayjs();
    const years = now.diff(start, 'year');
    const months = now.diff(start.add(years, 'year'), 'month');

    const yearStr = years > 0 ? `${years} year${years > 1 ? 's' : ''}` : '';
    const monthStr =
      months > 0 ? `${months} month${months > 1 ? 's' : ''}` : '';

    if (yearStr && monthStr) return `${yearStr}, ${monthStr}`;
    return yearStr || monthStr || 'Less than a month';
  }, [employee]);

  const formattedAddress = useMemo(() => {
    const addresses = employee?.employeeInformation?.addresses;
    if (!addresses || typeof addresses !== 'object') return '--';
    const parts = [
      (addresses as any).subCity,
      (addresses as any).city,
      (addresses as any).country,
    ].filter(Boolean);
    return parts.length ? parts.join(' ') : '--';
  }, [employee]);

  const renderInformation = () => {
    if (isLoading || isPayrollLoading)
      return <Skeleton active data-cy="payroll-info-loading-skeleton" />;
    if (!activeMergedPayroll)
      return (
        <Text type="secondary" data-cy="payroll-info-empty">
          No payroll data available for this period.
        </Text>
      );

    const breakdown = activeMergedPayroll?.breakdown;

    const entitledBenefitTotal =
      (breakdown?.merits?.reduce(
        (acc: number, item: any) => acc + parseFloat(item.amount || '0'),
        0,
      ) || 0) +
      (breakdown?.variablePay
        ? parseFloat(breakdown.variablePay.amount || '0')
        : 0) +
      (breakdown?.incentives
        ? parseFloat(breakdown.incentives.amount || '0')
        : 0);

    const entitledDeductionTotal =
      (breakdown?.pension?.reduce(
        (acc: number, item: any) => acc + parseFloat(item.amount || '0'),
        0,
      ) || 0) +
      (breakdown?.totalDeductionWithPension?.reduce(
        (acc: number, item: any) => acc + parseFloat(item.amount || '0'),
        0,
      ) || 0);

    return (
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Text
                strong
                style={{ fontSize: '15px', color: '#434343', fontWeight: 600 }}
                data-cy="payroll-employee-detail-payroll-info-header-title"
              >
                Payroll Information
              </Text>
            }
            bordered
            style={{ borderRadius: '8px', border: '1px solid #e0e0e0' }}
            headStyle={{ borderBottom: 'none', padding: '16px 20px 0 20px' }}
            bodyStyle={{ padding: '0 20px 20px 20px' }}
          >
            <Row gutter={[16, 24]}>
              <Col span={12}>
                <InfoItem
                  label="Basic Salary"
                  value={
                    activeMergedPayroll?.employeeInfo?.basicSalaries?.[0]
                      ?.basicSalary || '--'
                  }
                />
              </Col>
              <Col span={12}>
                <InfoItem
                  label="Account Number"
                  value={
                    activeMergedPayroll?.employeeInfo?.employeeInformation
                      ?.bankInformation?.accountNumber || '--'
                  }
                />
              </Col>
              <Col span={12}>
                <InfoItem
                  label="Bank Information"
                  value={
                    activeMergedPayroll?.employeeInfo?.employeeInformation
                      ?.bankInformation?.bankName || '--'
                  }
                />
              </Col>
              <Col span={12}>
                <InfoItem
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
                    color: '#434343',
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
                <InfoItem
                  label="Salary Period"
                  value={dayjs(activePayPeriod?.startDate).format('MMM-YYYY')}
                />
              </Col>
              <Col span={12}>
                <InfoItem
                  label="Pay Date"
                  value={dayjs(activePayPeriod?.updatedAt).format(
                    'MMM-DD-YYYY',
                  )}
                />
              </Col>
            </Row>
            <Divider style={{ margin: '8px 0', borderColor: '#f0f0f0' }} />
            <InfoItem
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
            <Divider style={{ margin: '8px 0', borderColor: '#f0f0f0' }} />
            <InfoItem
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
                ...(breakdown?.incentives
                  ? [
                      {
                        label: 'Incentive',
                        value: parseFloat(
                          breakdown.incentives.amount || '0',
                        ).toFixed(2),
                      },
                    ]
                  : []),
              ]}
            />
            <Divider style={{ margin: '8px 0', borderColor: '#f0f0f0' }} />
            <InfoItem
              label="Entitled Deduction"
              value={entitledDeductionTotal.toFixed(2)}
              large
              tags={[
                ...(breakdown?.pension?.map((p: any) => ({
                  label: p.type,
                  value: parseFloat(p.amount || '0').toFixed(2),
                })) || []),
                ...(breakdown?.totalDeductionWithPension?.map((d: any) => ({
                  label: d.type,
                  value: parseFloat(d.amount || '0').toFixed(2),
                })) || []),
              ]}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  const renderHistory = () => {
    if (!payPeriodData || !payrollHistory || payrollHistory.length === 0) {
      return (
        <div
          style={{ textAlign: 'center', padding: '40px' }}
          data-cy="payroll-history-empty-wrapper"
        >
          <EmptyImage data-cy="payroll-history-empty" />
          <Text type="secondary" data-cy="payroll-history-empty-text">
            No payroll history found.
          </Text>
        </div>
      );
    }

    return (
      <>
        <Row
          gutter={[
            { xs: 16, sm: 24, md: 32, lg: 48 },
            { xs: 16, sm: 24, md: 32, lg: 48 },
          ]}
          data-cy="payroll-history-cards-row"
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
                  : 0) +
                (breakdown?.incentives
                  ? parseFloat(breakdown.incentives.amount || '0')
                  : 0);

              const entitledDeductionTotal =
                (breakdown?.pension?.reduce(
                  (acc: number, item: any) =>
                    acc + parseFloat(item.amount || '0'),
                  0,
                ) || 0) +
                (breakdown?.totalDeductionWithPension?.reduce(
                  (acc: number, item: any) =>
                    acc + parseFloat(item.amount || '0'),
                  0,
                ) || 0);

              return (
                <Col
                  xs={24}
                  md={12}
                  lg={8}
                  key={index}
                  data-cy="payroll-history-card-column"
                >
                  <Card
                    title={
                      <Text
                        strong
                        style={{
                          fontSize: '16px',
                          color: '#262626',
                        }}
                        data-cy="payroll-history-card-title"
                      >
                        {period
                          ? dayjs(period.startDate).format('MMMM-YYYY')
                          : 'Unknown'}
                      </Text>
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
                    data-cy="payroll-history-card"
                  >
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <InfoItem
                          label="Salary Period"
                          value={
                            period
                              ? dayjs(period.startDate).format('MMM-YYYY')
                              : '--'
                          }
                        />
                      </Col>
                      <Col span={12}>
                        <InfoItem
                          label="Pay Date"
                          value={
                            period
                              ? dayjs(period.updatedAt).format('MMM-DD-YYYY')
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
                    <InfoItem
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
                    <InfoItem
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
                        ...(breakdown?.incentives
                          ? [
                              {
                                label: 'Incentive',
                                value: parseFloat(
                                  breakdown.incentives.amount || '0',
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
                    <InfoItem
                      label="Entitled Deduction"
                      value={entitledDeductionTotal.toFixed(2)}
                      large
                      tags={[
                        ...(breakdown?.pension?.map((p: any) => ({
                          label: p.type,
                          value: parseFloat(p.amount || '0').toFixed(2),
                        })) || []),
                        ...(breakdown?.totalDeductionWithPension?.map(
                          (d: any) => ({
                            label: d.type,
                            value: parseFloat(d.amount || '0').toFixed(2),
                          }),
                        ) || []),
                      ]}
                    />
                    <Divider
                      style={{
                        margin: '12px 0',
                        borderColor: '#e0e0e0',
                      }}
                    />
                    <Row gutter={16}>
                      <Col span={12}>
                        <InfoItem
                          label="Gross Earning"
                          value={parseFloat(
                            historyItem.grossSalary || '0',
                          ).toFixed(2)}
                        />
                      </Col>
                      <Col span={12}>
                        <InfoItem
                          label="Net Pay"
                          value={parseFloat(historyItem.netPay || '0').toFixed(
                            2,
                          )}
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
          data-cy="payroll-history-pagination-wrapper"
        >
          <style data-cy="payroll-history-pagination-styles">{`
            .custom-pagination {
              display: flex !important;
              width: 100% !important;
              justify-content: flex-start !important;
              align-items: center !important;
            }
            .custom-pagination .ant-pagination-options {
              margin-left: auto !important;
              display: flex;
              align-items: center;
            }
            .custom-pagination .ant-pagination-options-quick-jumper {
              color: #8c8c8c;
              font-size: 13px;
            }
            .custom-pagination .ant-pagination-options-quick-jumper input {
              border-radius: 4px;
            }
          `}</style>
          <Pagination
            className="custom-pagination"
            current={historyCurrentPage}
            total={payrollHistory.length}
            pageSize={historyPageSize}
            onChange={(page) => setHistoryCurrentPage(page)}
            showSizeChanger={false}
            showQuickJumper
            itemRender={(page, type, originalElement) => {
              if (type === 'jump-prev' || type === 'jump-next') return '...';
              return originalElement;
            }}
            data-cy="payroll-history-pagination"
          />
        </div>
      </>
    );
  };

  const { data: allowanceDatas } = useGetAllowance();
  const { data: settlementTrackingData, isLoading: isSettlementLoading } =
    useGetSettlementTracking({
      employeeId: empId,
    });

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

  const [selectedCompensationId, setSelectedCompensationId] = useState<
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

  const { data: entitlementDetail, isLoading: isDetailLoading } =
    useEmployeeSettlementTracking(currentEntitlementId || '', empId);

  const renderSettlement = () => {
    if (isSettlementLoading)
      return <Skeleton active data-cy="payroll-settlement-loading-skeleton" />;

    if (!settlementTrackingData || settlementTrackingData.length === 0) {
      return (
        <div
          style={{ textAlign: 'center', padding: '40px' }}
          data-cy="payroll-settlement-empty"
        >
          <Text type="secondary">No settlement tracking data available.</Text>
        </div>
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

    return (
      <Row gutter={[24, 24]} data-cy="payroll-settlement-view">
        {/* Sidebar List */}
        <Col xs={24} lg={10}>
          <Space
            direction="vertical"
            style={{ width: '100%' }}
            size={12}
            data-cy="payroll-settlement-list"
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
                data-cy="payroll-settlement-item-card"
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  data-cy="payroll-settlement-item-header"
                >
                  <Text
                    style={{
                      fontSize: '14px',
                      color: 'rgba(0, 0, 0, 0.65)',
                      fontWeight: 500,
                    }}
                    data-cy="payroll-settlement-item-title"
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
                    data-cy="payroll-settlement-item-status-tag"
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
            data-cy="payroll-settlement-details"
          >
            {isDetailLoading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <>
                <Row gutter={[16, 16]} data-cy="payroll-settlement-summary-row">
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
                        data-cy="payroll-settlement-summary-card"
                      >
                        <Text
                          style={{
                            fontSize: '14px',
                            color: 'rgba(0, 0, 0, 0.65)',
                            display: 'block',
                            marginBottom: '4px',
                          }}
                          data-cy="payroll-settlement-summary-label"
                        >
                          {card.label}
                        </Text>
                        <Text
                          style={{
                            fontSize: '30px',
                            color: 'rgba(0, 0, 0, 0.65)',
                            fontWeight: 600,
                          }}
                          data-cy="payroll-settlement-summary-value"
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
                  data-cy="payroll-settlement-progress-wrapper"
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                    data-cy="payroll-settlement-progress-header"
                  >
                    <Text
                      style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.65)' }}
                      data-cy="payroll-settlement-progress-label"
                    >
                      Repayment Progress
                    </Text>
                    <Text
                      style={{
                        color: '#4db818',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                      data-cy="payroll-settlement-progress-percent"
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
                    data-cy="payroll-settlement-progress-bar"
                  />
                </div>

                <div
                  style={{
                    marginTop: '24px',
                    overflowX: 'auto',
                    WebkitOverflowScrolling: 'touch',
                  }}
                  data-cy="payroll-settlement-payments-container"
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
                    data-cy="payroll-settlement-payments-header"
                  >
                    <div
                      style={{
                        flex: 1,
                        borderRight: '1px solid #e0e0e0',
                        paddingRight: '16px',
                      }}
                      data-cy="payroll-settlement-header-date-cell"
                    >
                      <Text
                        strong
                        style={{ fontSize: '14px', color: '#434343' }}
                      >
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
                      data-cy="payroll-settlement-header-amount-cell"
                    >
                      <Text
                        strong
                        style={{ fontSize: '14px', color: '#434343' }}
                      >
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
                      data-cy="payroll-settlement-header-period-cell"
                    >
                      <Text
                        strong
                        style={{ fontSize: '14px', color: '#434343' }}
                      >
                        Pay Period
                      </Text>
                    </div>
                    <div
                      style={{ flex: 1, paddingLeft: '16px' }}
                      data-cy="payroll-settlement-header-reason-cell"
                    >
                      <Text
                        strong
                        style={{ fontSize: '14px', color: '#434343' }}
                      >
                        Reason
                      </Text>
                    </div>
                  </div>

                  <div
                    style={{ padding: '0 8px' }}
                    data-cy="payroll-settlement-payments-list"
                  >
                    {payments.length > 0 ? (
                      payments.map((payment: any, idx: number) => (
                        <div
                          key={idx}
                          style={{
                            padding: '16px 8px',
                            backgroundColor: idx % 2 === 1 ? '#fafafa' : '#fff',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '4px',
                            minWidth: '720px',
                          }}
                          data-cy="payroll-settlement-payment-row"
                        >
                          <div
                            style={{ flex: 1, paddingRight: '16px' }}
                            data-cy="payroll-settlement-payment-date-cell"
                          >
                            <Text
                              style={{ fontSize: '14px', color: '#595959' }}
                            >
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
                            data-cy="payroll-settlement-payment-amount-cell"
                          >
                            <Text
                              style={{ fontSize: '14px', color: '#595959' }}
                            >
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
                            data-cy="payroll-settlement-payment-period-cell"
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
                              data-cy="payroll-settlement-payment-period-tag"
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
                            data-cy="payroll-settlement-payment-reason-cell"
                          >
                            <Text
                              style={{ fontSize: '14px', color: '#595959' }}
                            >
                              {payment.reason || '--'}
                            </Text>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{ textAlign: 'center', padding: '20px' }}
                        data-cy="payroll-settlement-payments-empty"
                      >
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          No payment history recorded.
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </Col>
      </Row>
    );
  };

  return (
    <div
      style={{
        padding: isMobile ? '16px 0' : '24px 0',
        overflowX: 'hidden',
        width: '100%',
      }}
      id="payroll-employee-profile-view-container"
      data-cy="payroll-employee-profile-view-container"
    >
      {/* Header & Breadcrumbs */}
      <div
        className="mb-4"
        data-cy="payroll-employee-detail-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <Button
          icon={<ArrowLeftOutlined style={{ fontSize: '14px' }} />}
          onClick={() => router.back()}
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            border: '1px solid #d9d9d9',
            padding: 0,
            color: '#595959',
            backgroundColor: '#fff',
            boxShadow: 'none',
            flexShrink: 0,
          }}
        />
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
          data-cy="payroll-employee-detail-title-group"
        >
          <Title
            level={4}
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: '24px',
              lineHeight: '1.2',
            }}
          >
            Employee Payroll Detail
          </Title>
          <Text type="secondary" style={{ fontSize: '14px', color: '#8c8c8c' }}>
            Payroll /{' '}
            <Text style={{ fontSize: '14px', color: '#595959' }}>
              Employee Payroll Information
            </Text>
          </Text>
        </div>
      </div>

      <Divider style={{ margin: '12px 0', borderColor: '#f0f0f0' }} />

      {/* Profile Summary Card */}
      <Card
        bordered
        style={{
          borderRadius: '12px',
          border: '1px solid #e0e0e0',
          marginTop: '24px',
          marginBottom: '16px',
          boxShadow: 'none',
        }}
        bodyStyle={{ padding: '20px' }}
      >
        {isLoading ? (
          <Skeleton avatar active paragraph={{ rows: 2 }} />
        ) : (
          <>
            <Space
              size={14}
              style={{ marginBottom: '28px', display: 'flex' }}
              align="center"
            >
              <Avatar
                size={56}
                src={
                  profileFileList.length > 0
                    ? getImageUrl(profileFileList)
                    : employee?.profileImage
                }
                icon={<UserOutlined />}
                style={{ border: '1px solid #f0f0f0' }}
              />
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
                data-cy="payroll-employee-detail-name-email-wrapper"
              >
                <Text
                  style={{
                    fontSize: '14px',
                    color: 'rgba(0, 0, 0, 0.70)',
                    fontWeight: 600,
                    lineHeight: '1.2',
                  }}
                >
                  {[
                    employee?.firstName,
                    employee?.middleName,
                    employee?.lastName,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                </Text>
                <Text
                  style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.45)' }}
                >
                  {employee?.email}
                </Text>
              </div>
            </Space>

            <Row gutter={[0, 16]} style={{ paddingLeft: '16px' }}>
              <Col xs={12} sm={6}>
                <div
                  data-cy="payroll-employee-detail-joined-date-wrapper"
                  style={{ paddingRight: '8px' }}
                >
                  <Text
                    style={{
                      fontSize: '14px',
                      color: 'rgba(0, 0, 0, 0.40)',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Joined at
                  </Text>
                  <Text
                    style={{
                      fontSize: '16px',
                      color: 'rgba(0, 0, 0, 0.70)',
                      display: 'block',
                      fontWeight: 700,
                    }}
                  >
                    {employee?.employeeInformation?.joinedDate
                      ? dayjs(employee.employeeInformation.joinedDate).format(
                          'DD MMMM, YYYY',
                        )
                      : '--'}
                  </Text>
                </div>
              </Col>

              <Col
                xs={12}
                sm={6}
                style={{
                  borderLeft: '1px solid #f0f0f0',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                }}
              >
                <div data-cy="payroll-employee-detail-address-wrapper">
                  <Text
                    style={{
                      fontSize: '14px',
                      color: 'rgba(0, 0, 0, 0.40)',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Address
                  </Text>
                  <Text
                    style={{
                      fontSize: '16px',
                      color: 'rgba(0, 0, 0, 0.70)',
                      display: 'block',
                      fontWeight: 700,
                    }}
                  >
                    {formattedAddress}
                  </Text>
                </div>
              </Col>

              <Col
                xs={12}
                sm={6}
                style={{
                  borderLeft: '1px solid #f0f0f0',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                }}
              >
                <div data-cy="payroll-employee-detail-service-year-wrapper">
                  <Text
                    style={{
                      fontSize: '14px',
                      color: 'rgba(0, 0, 0, 0.40)',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Service Year
                  </Text>
                  <Text
                    style={{
                      fontSize: '16px',
                      color: 'rgba(0, 0, 0, 0.70)',
                      display: 'block',
                      fontWeight: 700,
                    }}
                  >
                    {serviceYear}
                  </Text>
                </div>
              </Col>

              <Col
                xs={12}
                sm={6}
                style={{
                  borderLeft: '1px solid #f0f0f0',
                  paddingLeft: '8px',
                }}
              >
                <div data-cy="payroll-employee-detail-office-wrapper">
                  <Text
                    style={{
                      fontSize: '14px',
                      color: 'rgba(0, 0, 0, 0.40)',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Office
                  </Text>
                  <Text
                    style={{
                      fontSize: '16px',
                      color: 'rgba(0, 0, 0, 0.70)',
                      display: 'block',
                      fontWeight: 700,
                    }}
                  >
                    {employee?.employeeJobInformation?.find(
                      (e: any) => e.isPositionActive,
                    )?.branch?.name || '--'}
                  </Text>
                </div>
              </Col>
            </Row>
          </>
        )}
      </Card>

      {/* Tabs Section */}
      <Tabs defaultActiveKey="1" className="custom-tabs">
        <TabPane tab="Information" key="1">
          <div
            style={{ paddingTop: '8px' }}
            data-cy="payroll-employee-detail-info-tab-content"
          >
            {renderInformation()}
          </div>
        </TabPane>
        <TabPane tab="Payroll History" key="2">
          <div
            style={{ paddingTop: '8px' }}
            data-cy="payroll-employee-detail-history-tab-content"
          >
            {renderHistory()}
          </div>
        </TabPane>
        <TabPane tab="Settlement Tracking" key="3">
          <div
            style={{ paddingTop: '8px' }}
            data-cy="payroll-employee-detail-settlement-tab-content"
          >
            {renderSettlement()}
          </div>
        </TabPane>
      </Tabs>

      {/* Hidden Payslip for PDF generation */}
      <div
        className="h-0 overflow-hidden"
        data-cy="payroll-employee-detail-hidden-payslip-wrapper"
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
          data-cy="payroll-employee-detail-payslip-content"
        >
          <header
            className="text-center border-b pb-4 mb-4"
            data-cy="payroll-employee-detail-payslip-header"
          >
            <h2
              className="text-xl font-semibold"
              data-cy="payroll-employee-detail-payslip-title"
            >
              Payslip for the month of{' '}
              <span
                className="text-violet-500"
                data-cy="payroll-employee-detail-payslip-period"
              >
                {dayjs(activePayPeriod?.startDate).format('MMMM-YYYY')}
              </span>
            </h2>
          </header>
          <div
            className="flex justify-between"
            data-cy="payroll-employee-detail-payslip-summary"
          >
            <div
              className="mx-2 flex flex-col gap-2"
              data-cy="payroll-employee-detail-payslip-info"
            >
              <div
                className="font-bold text-xl"
                data-cy="payroll-employee-detail-payslip-summary-title"
              >
                Employee Pay Summary
              </div>
              <div
                className="flex gap-6 w-full"
                data-cy="payroll-employee-detail-payslip-info-grid"
              >
                <div
                  className="flex flex-col gap-2"
                  data-cy="payroll-employee-detail-payslip-labels"
                >
                  <Text data-cy="payroll-employee-detail-payslip-label-name">
                    Employee name:
                  </Text>
                  <Text data-cy="payroll-employee-detail-payslip-label-job">
                    Job title:
                  </Text>
                  <Text data-cy="payroll-employee-detail-payslip-label-period">
                    Pay period:
                  </Text>
                  <Text data-cy="payroll-employee-detail-payslip-label-date">
                    Pay Date:
                  </Text>
                </div>
                <div
                  className="flex flex-col gap-2 font-bold"
                  data-cy="payroll-employee-detail-payslip-values"
                >
                  <Text data-cy="payroll-employee-detail-payslip-value-name">
                    {[employee?.firstName, employee?.middleName]
                      .filter(Boolean)
                      .join(' ')}
                  </Text>
                  <Text data-cy="payroll-employee-detail-payslip-value-job">
                    {
                      employee?.employeeJobInformation?.find(
                        (job: any) => job.isPositionActive,
                      )?.position?.name
                    }
                  </Text>
                  <Text data-cy="payroll-employee-detail-payslip-value-period">
                    {dayjs(activePayPeriod?.startDate).format('MMM-YYYY')}
                  </Text>
                  <Text data-cy="payroll-employee-detail-payslip-value-date">
                    {dayjs(activePayPeriod?.updatedAt).format('MMM-DD-YYYY')}
                  </Text>
                </div>
              </div>
            </div>
            <div
              className="flex flex-col justify-center items-center m-2"
              data-cy="payroll-employee-detail-payslip-amounts"
            >
              <span
                className="font-bold text-xl"
                data-cy="payroll-employee-detail-payslip-net-label"
              >
                Employee Net Pay
              </span>
              <span
                className="text-violet-500 text-4xl font-bold mb-2"
                data-cy="payroll-employee-detail-payslip-net-value"
              >
                {activeMergedPayroll?.netPay}
              </span>
              <span
                className="font-bold text-xl"
                data-cy="payroll-employee-detail-payslip-basic-label"
              >
                Employee Basic Salary
              </span>
              <span
                className=" text-2xl font-bold"
                data-cy="payroll-employee-detail-payslip-basic-value"
              >
                {
                  activeMergedPayroll?.employeeInfo?.basicSalaries[0]
                    ?.basicSalary
                }{' '}
              </span>
            </div>
          </div>
          <Divider className="my-2" />
          <header
            className=" border-b pb-2 mb-2"
            data-cy="payroll-employee-detail-payslip-earnings-header"
          >
            <h2
              className="text-xl font-semibold"
              data-cy="payroll-employee-detail-payslip-earnings-title"
            >
              Employee Earnings
            </h2>
          </header>
          <div
            className="flex flex-col w-full gap-4"
            data-cy="payroll-employee-detail-payslip-earnings-grid"
          >
            <div
              className=" pl-4 flex justify-between items-center my-2"
              data-cy="payroll-employee-detail-payslip-earnings-labels"
            >
              <Text
                className="text-xl"
                data-cy="payroll-employee-detail-payslip-earnings-label-allowance"
              >
                Employee Allowance
              </Text>
              <Text
                className="text-xl pr-10"
                data-cy="payroll-employee-detail-payslip-earnings-label-amount"
              >
                Amount
              </Text>
            </div>
            <div
              className="flex justify-between"
              data-cy="payroll-employee-detail-payslip-allowances"
            >
              <div
                className="flex flex-col gap-2 pl-4"
                data-cy="payroll-employee-detail-payslip-allowance-names"
              >
                {activeMergedPayroll?.breakdown?.allowances?.map(
                  (item: any, index: any) => (
                    <Text
                      key={index}
                      data-cy={`payroll-employee-detail-payslip-allowance-name-${index}`}
                    >
                      {item.type}
                    </Text>
                  ),
                )}
              </div>
              <div
                className="flex flex-col gap-2 text-right font-bold pr-10"
                data-cy="payroll-employee-detail-payslip-allowance-amounts"
              >
                {activeMergedPayroll?.breakdown?.allowances?.map(
                  (item: any, index: any) => (
                    <Text
                      key={index}
                      data-cy={`payroll-employee-detail-payslip-allowance-amount-${index}`}
                    >
                      {parseFloat(item.amount).toFixed(2)}
                    </Text>
                  ),
                )}
              </div>
            </div>
          </div>
          <PayrollDetails
            activeMergedPayroll={activeMergedPayroll || undefined}
          />
        </div>
      </div>
      <style jsx data-cy="payroll-employee-detail-local-styles">{`
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
};

export default EmployeeProfile;
