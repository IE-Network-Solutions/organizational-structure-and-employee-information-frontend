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
  Pagination,
  Progress,
} from 'antd';
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
import { useGetSettlementTracking } from '@/store/server/features/payroll/settlementTracking/queries';

const { Title, Text } = Typography;

const InfoItem = ({
  label,
  value,
  tags,
}: {
  label: string;
  value: string | number;
  tags?: { label: string; value: string | number }[];
}) => (
  <div className="info-item" data-cy="my-payroll-info-item">
    <Text
      style={{
        fontSize: '14px',
        color: '#8c8c8c',
        display: 'block',
        marginBottom: '8px',
      }}
      data-cy="my-payroll-info-item-label"
    >
      {label}
    </Text>
    <Text
      strong
      style={{
        fontSize: '16px',
        color: '#262626',
        display: 'block',
        marginBottom: '8px',
      }}
      data-cy="my-payroll-info-item-value"
    >
      {value}
    </Text>
    {tags && tags.length > 0 && (
      <Space
        wrap
        size={[12, 8]}
        data-cy="my-payroll-info-item-tags"
      >
        {tags.map((tag, index) => (
          <Tag
            key={index}
            style={{
              backgroundColor: '#f5f5f5',
              border: '1px solid #bfbfbf',
              borderRadius: '4px',
              padding: '2px 8px',
              color: '#434343',
              fontSize: '12px',
              margin: '0',
            }}
          >
            {tag.label} : {tag.value}
          </Tag>
        ))}
      </Space>
    )}
  </div>
);

export default function MyPayroll() {
  const { userId } = useAuthenticationStore();
  const { data: payPeriodData } = useGetPayPeriod();
  const { data: employee, isLoading: isEmployeeLoading } = useGetEmployee(userId!);
  const { pageSize } = usePayrollStore();
  const { data: payroll, isLoading: isPayrollLoading } = useGetActivePayroll(
    `&employeeId=${userId}`,
    pageSize,
    1,
  );
  const { data: payrollHistory } = useGetPayrollHistory(userId!);
  const [historyCurrentPage, setHistoryCurrentPage] = React.useState(1);
  const historyPageSize = 3;

  const {
    activeMergedPayroll,
    activePayPeriod,
    setMergedPayroll,
    setActiveMergedPayroll,
    setActivePayPeriod,
  } = useEmployeeStore();

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
      const mergedData = payroll.items
        .filter((pay: any) => pay.employeeId === employee.id)
        .map((pay: any) => ({ ...pay, employeeInfo: employee || null }));

      setMergedPayroll(mergedData);

      const activeMergedData = mergedData?.filter(
        (pay: any) => openPayPeriods?.[0]?.id === pay.payPeriodId,
      );
      setActiveMergedPayroll(activeMergedData[0]);
    }
  }, [payroll, employee, openPayPeriods, setMergedPayroll, setActiveMergedPayroll]);

  const loading = isEmployeeLoading || isPayrollLoading;

  const renderInformation = () => {
    if (loading)
      return (
        <Skeleton active data-cy="my-payroll-info-loading-skeleton" />
      );
    if (!activeMergedPayroll)
      return (
        <Text type="secondary" data-cy="my-payroll-info-empty">
          No payroll data available for this period.
        </Text>
      );

    const breakdown = activeMergedPayroll?.breakdown;

    // Calculate total benefit if not directly available as a single field
    const entitledBenefitTotal = (breakdown?.merits?.reduce((acc: number, item: any) => acc + parseFloat(item.amount || '0'), 0) || 0) +
      (breakdown?.variablePay ? parseFloat(breakdown.variablePay.amount || '0') : 0) +
      (breakdown?.incentives ? parseFloat(breakdown.incentives.amount || '0') : 0);

    const entitledDeductionTotal = (breakdown?.pension?.reduce((acc: number, item: any) => acc + parseFloat(item.amount || '0'), 0) || 0) +
      (breakdown?.totalDeductionWithPension?.reduce((acc: number, item: any) => acc + parseFloat(item.amount || '0'), 0) || 0);

    return (
      <Row gutter={[{ xs: 16, sm: 24, md: 32, lg: 48 }, { xs: 16, sm: 24, md: 32, lg: 48 }]}>
        <Col xs={24} lg={12}>
          <Card
            title={<Text strong style={{ fontSize: '16px', color: '#262626' }}>Payroll Information</Text>}
            bordered
            style={{ borderRadius: '8px', border: '1px solid #e0e0e0' }}
            headStyle={{ borderBottom: 'none', padding: '24px 24px 0 24px' }}
            bodyStyle={{ padding: '24px' }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <InfoItem
                  label="Basic Salary"
                  value={activeMergedPayroll?.employeeInfo?.basicSalaries?.[0]?.basicSalary || '--'}
                />
              </Col>
              <Col span={12}>
                <InfoItem
                  label="Account Number"
                  value={activeMergedPayroll?.employeeInfo?.employeeInformation?.bankInformation?.accountNumber || '--'}
                />
              </Col>
              <Col span={12}>
                <InfoItem
                  label="Bank Information"
                  value={activeMergedPayroll?.employeeInfo?.employeeInformation?.bankInformation?.bankName || '--'}
                />
              </Col>
              <Col span={12}>
                <InfoItem
                  label="Branch"
                  value={activeMergedPayroll?.employeeInfo?.employeeJobInformation?.[0]?.branch?.name || '--'}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={<Text strong style={{ fontSize: '16px', color: '#262626' }}>{dayjs(activePayPeriod?.startDate).format('MMMM')} Pay Slip</Text>}
            bordered
            style={{ borderRadius: '8px', border: '1px solid #e0e0e0' }}
            headStyle={{ borderBottom: 'none', padding: '24px 24px 0 24px' }}
            bodyStyle={{ padding: '24px' }}
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
                  value={dayjs(activePayPeriod?.updatedAt).format('MMM-DD-YYYY')}
                />
              </Col>
            </Row>
            <Divider style={{ margin: '8px 0', borderColor: '#e0e0e0' }} />
            <InfoItem
              label="Entitled Allowance"
              value={parseFloat(activeMergedPayroll?.totalAllowance || '0').toFixed(2)}
              tags={breakdown?.allowances?.map((a: any) => ({ label: a.type, value: parseFloat(a.amount || '0').toFixed(2) }))}
            />
            <Divider style={{ margin: '8px 0', borderColor: '#e0e0e0' }} />
            <InfoItem
              label="Entitled Benefit"
              value={entitledBenefitTotal.toFixed(2)}
              tags={[
                ...(breakdown?.merits?.map((m: any) => ({ label: m.type, value: parseFloat(m.amount || '0').toFixed(2) })) || []),
                ...(breakdown?.variablePay ? [{ label: breakdown.variablePay.type, value: parseFloat(breakdown.variablePay.amount || '0').toFixed(2) }] : []),
                ...(breakdown?.incentives ? [{ label: 'Incentive', value: parseFloat(breakdown.incentives.amount || '0').toFixed(2) }] : []),
              ]}
            />
            <Divider style={{ margin: '8px 0', borderColor: '#e0e0e0' }} />
            <InfoItem
              label="Entitled Deduction"
              value={entitledDeductionTotal.toFixed(2)}
              tags={[
                ...(breakdown?.pension?.map((p: any) => ({ label: p.type, value: parseFloat(p.amount || '0').toFixed(2) })) || []),
                ...(breakdown?.totalDeductionWithPension?.map((d: any) => ({ label: d.type, value: parseFloat(d.amount || '0').toFixed(2) })) || []),
              ]}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Row gutter={16}>
              <Col span={12}>
                <InfoItem label="Gross Earning" value={parseFloat(activeMergedPayroll?.grossSalary || '0').toFixed(2)} />
              </Col>
              <Col span={12}>
                <InfoItem label="Net Pay" value={parseFloat(activeMergedPayroll?.netPay || '0').toFixed(2)} />
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
        overflowX: 'hidden',
      }}
      data-cy="my-payroll-page-container"
    >
      <style data-cy="my-payroll-page-styles">{`
        .info-item { margin-bottom: 20px; }
        .page-title { font-size: 20px !important; margin-bottom: 4px !important; }
        
        @media (max-width: 768px) {
          .info-item { margin-bottom: 12px !important; }
          .info-item span { font-size: 13px !important; }
          .page-title { font-size: 18px !important; }
          .responsive-container .ant-card-body { padding: 16px !important; }
          .responsive-container .ant-card-head { padding: 16px 16px 0 16px !important; }
          .responsive-container .ant-card-head-title { font-size: 14px !important; }
        }
      `}</style>
      <Title
        level={2}
        className="page-title"
        style={{ fontWeight: 600 }}
        data-cy="my-payroll-title"
      >
        My Payroll Information
      </Title>

      <Breadcrumb
        style={{ marginBottom: '20px', fontSize: '13px' }}
        data-cy="my-payroll-breadcrumb"
      >
        <Breadcrumb.Item data-cy="my-payroll-breadcrumb-employee">
          Employee
        </Breadcrumb.Item>
        <Breadcrumb.Item data-cy="my-payroll-breadcrumb-my-payroll">
          My Payroll
        </Breadcrumb.Item>
      </Breadcrumb>

      <Divider
        style={{ margin: '0 0 24px 0', borderColor: '#e0e0e0' }}
        data-cy="my-payroll-header-divider"
      />

      <Tabs
        defaultActiveKey="1"
        style={{ marginBottom: '24px' }}
        data-cy="my-payroll-tabs"
      >
        <Tabs.TabPane
          tab="Information"
          key="1"
          data-cy="my-payroll-tab-information"
        >
          <div
            style={{ paddingTop: '24px' }}
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
            {payrollHistory && payrollHistory.length > 0 ? (
              <>
                <Row
                  gutter={[
                    { xs: 16, sm: 24, md: 32, lg: 48 },
                    { xs: 16, sm: 24, md: 32, lg: 48 },
                  ]}
                  data-cy="my-payroll-history-cards-row"
                >
                  {payrollHistory
                    .slice((historyCurrentPage - 1) * historyPageSize, historyCurrentPage * historyPageSize)
                    .map((historyItem: any, index: number) => {
                      const period = payPeriodData?.find((p: any) => p.id === historyItem.payPeriodId);
                      const breakdown = historyItem.breakdown;

                      const entitledBenefitTotal = (breakdown?.merits?.reduce((acc: number, item: any) => acc + parseFloat(item.amount || '0'), 0) || 0) +
                        (breakdown?.variablePay ? parseFloat(breakdown.variablePay.amount || '0') : 0) +
                        (breakdown?.incentives ? parseFloat(breakdown.incentives.amount || '0') : 0);

                      const entitledDeductionTotal = (breakdown?.pension?.reduce((acc: number, item: any) => acc + parseFloat(item.amount || '0'), 0) || 0) +
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
                          data-cy="my-payroll-history-card-column"
                        >
                          <Card
                            title={
                              <Text
                                strong
                                style={{
                                  fontSize: '16px',
                                  color: '#262626',
                                }}
                                data-cy="my-payroll-history-card-title"
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
                              padding: '24px 24px 0 24px',
                            }}
                            bodyStyle={{ padding: '24px' }}
                            data-cy="my-payroll-history-card"
                          >
                            <Row gutter={[16, 16]}>
                              <Col span={12}>
                                <InfoItem
                                  label="Salary Period"
                                  value={period ? dayjs(period.startDate).format('MMM-YYYY') : '--'}
                                />
                              </Col>
                              <Col span={12}>
                                <InfoItem
                                  label="Pay Date"
                                  value={period ? dayjs(period.updatedAt).format('MMM-DD-YYYY') : '--'}
                                />
                              </Col>
                            </Row>
                            <Divider style={{ margin: '8px 0', borderColor: '#e0e0e0' }} />
                            <InfoItem
                              label="Entitled Allowance"
                              value={parseFloat(historyItem.totalAllowance || '0').toFixed(2)}
                              tags={breakdown?.allowances?.map((a: any) => ({ label: a.type, value: parseFloat(a.amount || '0').toFixed(2) }))}
                            />
                            <Divider style={{ margin: '8px 0', borderColor: '#e0e0e0' }} />
                            <InfoItem
                              label="Entitled Benefit"
                              value={entitledBenefitTotal.toFixed(2)}
                              tags={[
                                ...(breakdown?.merits?.map((m: any) => ({ label: m.type, value: parseFloat(m.amount || '0').toFixed(2) })) || []),
                                ...(breakdown?.variablePay ? [{ label: breakdown.variablePay.type, value: parseFloat(breakdown.variablePay.amount || '0').toFixed(2) }] : []),
                                ...(breakdown?.incentives ? [{ label: 'Incentive', value: parseFloat(breakdown.incentives.amount || '0').toFixed(2) }] : []),
                              ]}
                            />
                            <Divider style={{ margin: '8px 0', borderColor: '#e0e0e0' }} />
                            <InfoItem
                              label="Entitled Deduction"
                              value={entitledDeductionTotal.toFixed(2)}
                              tags={[
                                ...(breakdown?.pension?.map((p: any) => ({ label: p.type, value: parseFloat(p.amount || '0').toFixed(2) })) || []),
                                ...(breakdown?.totalDeductionWithPension?.map((d: any) => ({ label: d.type, value: parseFloat(d.amount || '0').toFixed(2) })) || []),
                              ]}
                            />
                            <Divider style={{ margin: '8px 0', borderColor: '#e0e0e0' }} />
                            <Row gutter={16}>
                              <Col span={12}>
                                <InfoItem label="Gross Earning" value={parseFloat(historyItem.grossSalary || '0').toFixed(2)} />
                              </Col>
                              <Col span={12}>
                                <InfoItem label="Net Pay" value={parseFloat(historyItem.netPay || '0').toFixed(2)} />
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
                  <style data-cy="my-payroll-history-pagination-styles">{`
                    .history-pagination {
                      display: flex !important;
                      width: 100% !important;
                      justify-content: flex-start !important;
                      align-items: center !important;
                    }
                    .history-pagination .ant-pagination-options {
                      margin-left: auto !important;
                    }
                  `}</style>
                  <Pagination
                    className="history-pagination"
                    current={historyCurrentPage}
                    total={payrollHistory.length}
                    pageSize={historyPageSize}
                    onChange={(page) => setHistoryCurrentPage(page)}
                    showSizeChanger={false}
                    showQuickJumper
                    itemRender={(page, type, originalElement) => {
                      if (type === 'jump-prev' || type === 'jump-next')
                        return '...';
                      return originalElement;
                    }}
                    data-cy="my-payroll-history-pagination"
                  />
                </div>
              </>
            ) : (
              <div
                style={{ textAlign: 'center', padding: '40px' }}
                data-cy="my-payroll-history-empty"
              >
                <Text type="secondary">No payroll history found.</Text>
              </div>
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
    </div>
  );
}

const SettlementView = ({ userId }: { userId: string }) => {
  const { data: settlementTrackingData, isLoading } = useGetSettlementTracking({
    employeeId: userId,
  });

  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  // Set first item as default selected
  useEffect(() => {
    if (settlementTrackingData && settlementTrackingData.length > 0 && !selectedId) {
      setSelectedId(settlementTrackingData[0].id);
    }
  }, [settlementTrackingData, selectedId]);

  if (isLoading)
    return (
      <Skeleton active data-cy="my-payroll-settlement-loading-skeleton" />
    );

  if (!settlementTrackingData || settlementTrackingData.length === 0) {
    return (
      <div
        style={{ textAlign: 'center', padding: '40px' }}
        data-cy="my-payroll-settlement-empty"
      >
        <Text type="secondary">No settlement tracking data available.</Text>
      </div>
    );
  }

  const selectedItem = settlementTrackingData.find((item: any) => item.id === selectedId) || settlementTrackingData[0];

  const totalAmount = parseFloat(selectedItem.totalAmount || selectedItem.amount || '0');
  const totalPaid = parseFloat(selectedItem.totalPaid || '0');
  const remaining = Math.max(0, totalAmount - totalPaid);
  const progressPercent = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

  // Placeholder history data since top-level list might not have it
  const payments = selectedItem.history || [
    { date: 'Feb 09, 2026', amount: 4679.72, period: 'Jan 07, 2026 - Feb 06, 2026', reason: '' },
    { date: 'Feb 09, 2026', amount: 545454.00, period: 'Feb 06, 2026 - Jun 06, 2026', reason: '' },
    { date: 'Feb 09, 2026', amount: 5652222.00, period: 'Jun 07, 2026 - Aug 06, 2027', reason: '' }
  ];

  return (
    <Row
      gutter={[48, 48]}
      data-cy="my-payroll-settlement-view"
    >
      {/* Sidebar List */}
      <Col xs={24} lg={10}>
        <Space
          direction="vertical"
          style={{ width: '100%' }}
          size={16}
          data-cy="my-payroll-settlement-list"
        >
          {settlementTrackingData.map((item: any) => (
            <Card
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              style={{
                borderRadius: '8px',
                border:
                  selectedId === item.id
                    ? '1px solid #635aff'
                    : '1px solid #e0e0e0',
                cursor: 'pointer',
                boxShadow:
                  selectedId === item.id ? '0 0 0 1px #635aff' : 'none',
              }}
              bodyStyle={{ padding: '16px 24px' }}
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
                  strong
                  style={{ fontSize: '15px', color: '#262626' }}
                  data-cy="my-payroll-settlement-item-title"
                >
                  {item.description || item.payPeriod || 'Settlement Item'}
                </Text>
                <Tag
                  color={
                    item.status === 'PAID' || item.isPaid
                      ? 'success'
                      : 'processing'
                  }
                  style={{
                    margin: 0,
                    borderRadius: '4px',
                    backgroundColor:
                      item.status === 'PAID' || item.isPaid
                        ? '#f6ffed'
                        : '#e6f7ff',
                    border: '1px solid',
                    borderColor:
                      item.status === 'PAID' || item.isPaid
                        ? '#b7eb8f'
                        : '#91d5ff',
                    color:
                      item.status === 'PAID' || item.isPaid
                        ? '#52c41a'
                        : '#1890ff',
                  }}
                  data-cy="my-payroll-settlement-item-status-tag"
                >
                  {item.status === 'PAID' || item.isPaid ? 'Paid' : 'In Progress'}
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
            border: '1px solid #d9e2ff',
            borderRadius: '12px',
            padding: '24px',
            backgroundColor: '#fff',
            height: '100%',
          }}
          data-cy="my-payroll-settlement-details-container"
        >
          {/* Summary Cards */}
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
                    height: '100%',
                  }}
                  data-cy="my-payroll-settlement-summary-card"
                >
                  <Text
                    style={{
                      fontSize: '13px',
                      color: '#8c8c8c',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                    data-cy="my-payroll-settlement-summary-label"
                  >
                    {card.label}
                  </Text>
                  <Text
                    strong
                    style={{ fontSize: '22px', color: '#262626' }}
                    data-cy="my-payroll-settlement-summary-value"
                  >
                    {card.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </div>
              </Col>
            ))}
          </Row>

          {/* Repayment Progress */}
          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              border: '1px solid #f0f0f0',
              borderRadius: '8px',
            }}
            data-cy="my-payroll-settlement-progress-wrapper"
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
              data-cy="my-payroll-settlement-progress-header"
            >
              <Text
                style={{ fontSize: '12px', color: '#8c8c8c' }}
                data-cy="my-payroll-settlement-progress-label"
              >
                Repayment Progress
              </Text>
              <Text
                strong
                style={{ color: '#52c41a', fontSize: '12px' }}
                data-cy="my-payroll-settlement-progress-percent"
              >
                {progressPercent}%
              </Text>
            </div>
            <Progress
              percent={progressPercent}
              strokeColor="#52c41a"
              showInfo={false}
              strokeWidth={10}
              trailColor="#f0f0f0"
              style={{ marginBottom: 0 }}
              data-cy="my-payroll-settlement-progress-bar"
            />
          </div>

          {/* History List */}
          <div
            style={{ marginTop: '24px' }}
            data-cy="my-payroll-settlement-history-section"
          >
            <Row
              style={{
                backgroundColor: '#fafafa',
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
              }}
              data-cy="my-payroll-settlement-history-header"
            >
              <Col span={5}>
                <Text strong style={{ fontSize: '13px' }}>
                  Date
                </Text>
              </Col>
              <Col span={5}>
                <Text strong style={{ fontSize: '13px' }}>
                  Pay Amount
                </Text>
              </Col>
              <Col span={9}>
                <Text strong style={{ fontSize: '13px' }}>
                  Pay Period
                </Text>
              </Col>
              <Col span={5}>
                <Text strong style={{ fontSize: '13px' }}>
                  Reason
                </Text>
              </Col>
            </Row>

            {payments.map((payment: any, idx: number) => (
              <Row
                key={idx}
                style={{
                  padding: '16px 8px',
                  backgroundColor: idx % 2 === 1 ? '#fafafa' : '#fff',
                  alignItems: 'middle',
                }}
                data-cy="my-payroll-settlement-history-row"
              >
                <Col span={6}>
                  <Text
                    style={{ fontSize: '12px', color: '#595959' }}
                    data-cy="my-payroll-settlement-history-date"
                  >
                    {payment.date ||
                      dayjs(payment.createdAt).format('MMM DD, YYYY')}
                  </Text>
                </Col>
                <Col span={6}>
                  <Text
                    style={{ fontSize: '12px', color: '#595959' }}
                    data-cy="my-payroll-settlement-history-amount"
                  >
                    {parseFloat(payment.amount || '0').toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}
                  </Text>
                </Col>
                <Col span={12}>
                  <Tag
                    style={{
                      backgroundColor: '#f5f5f5',
                      border: '1px solid #d9d9d9',
                      color: '#595959',
                      borderRadius: '4px',
                      fontSize: '11px',
                      marginRight: 0,
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    data-cy="my-payroll-settlement-history-period-tag"
                  >
                    {payment.period || payment.payPeriod || '--'}
                  </Tag>
                </Col>
              </Row>
            ))}
          </div>
        </div>
      </Col>
    </Row>
  );
};
