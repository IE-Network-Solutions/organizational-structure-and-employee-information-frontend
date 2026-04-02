'use client';

import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { Button, Card, Col, Row, Select, Table, Tag } from 'antd';
import { FaEye } from 'react-icons/fa';
import { PiExportLight } from 'react-icons/pi';
import PayrollReconcilationModal from './_components/modal';
import { useState, useEffect } from 'react';

import {
  useGetPayPeriod,
  useGetActivePayroll,
} from '@/store/server/features/payroll/payroll/queries';
import dayjs from 'dayjs';
import { useGetReconciliation } from '@/store/server/features/payroll/reconcilation/queries';
import { useReconciliationState } from '@/store/uistate/features/payroll/reconcilation';
import useEmployeeStore from '@/store/uistate/features/payroll/employeeInfoStore';
import { useRouter } from 'next/navigation';
import { MdKeyboardArrowLeft } from 'react-icons/md';

const { Option } = Select;
const impactColors = {
  High: 'red',
  Medium: 'orange',
  Low: 'green',
};

const PayrollReconcilation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const {
    previousPayPeriodId,
    currentPayPeriodId,
    componentType,
    setPreviousPayPeriodId,
    setCurrentPayPeriodId,
    setComponentType,
  } = useReconciliationState();

  const { data, isLoading } = useGetReconciliation({
    previousPayPeriodId,
    currentPayPeriodId,
  });
  const { data: payPeriodData } = useGetPayPeriod();
  const { pageSize: employeePageSize, currentPage: employeeCurrentPage } =
    useEmployeeStore();
  const { data: payroll } = useGetActivePayroll(
    '',
    employeePageSize || 10,
    employeeCurrentPage || 1,
  );

  useEffect(() => {
    if (payroll?.items?.length > 0 && payPeriodData?.length > 0) {
      // Set current pay period if not already set
      if (!currentPayPeriodId) {
        const defaultPayPeriodId = payroll.items[0]?.payPeriodId;
        const defaultPayPeriod = payPeriodData?.find(
          (period: any) => period.id === defaultPayPeriodId,
        );

        if (defaultPayPeriod) {
          setCurrentPayPeriodId(defaultPayPeriodId);
        }
      }
    }
  }, [
    payroll?.items,
    payPeriodData,
    currentPayPeriodId,
    setCurrentPayPeriodId,
  ]);

  useEffect(() => {
    // Set previous pay period based on current pay period
    if (
      payPeriodData?.length > 0 &&
      currentPayPeriodId &&
      !previousPayPeriodId
    ) {
      // Sort pay periods by start date to find the previous one
      const sortedPayPeriods = [...payPeriodData].sort(
        (a: any, b: any) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );

      const currentIndex = sortedPayPeriods.findIndex(
        (period: any) => period.id === currentPayPeriodId,
      );

      if (currentIndex > 0) {
        const previousPayPeriod = sortedPayPeriods[currentIndex - 1];
        setPreviousPayPeriodId(previousPayPeriod.id);
      }
    }
  }, [
    payPeriodData,
    currentPayPeriodId,
    previousPayPeriodId,
    setPreviousPayPeriodId,
  ]);

  // Reset componentType when modal closes
  useEffect(() => {
    if (!isModalOpen && componentType) {
      setComponentType('');
    }
  }, [isModalOpen, componentType, setComponentType]);

  const handleGoBack = () => {
    router.back();
  };

  const columns = [
    {
      title: 'Types',
      dataIndex: 'types',
      key: 'types',
      minWidth: 200,
      render: (notused: any, record: any) => (
        <div
          data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-122"
          className="flex items-center gap-2"
        >
          <span data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-123">
            {record.types}
          </span>
        </div>
      ),
    },
    {
      title: 'Previous',
      dataIndex: 'previous',
      key: 'previous',
      minWidth: 150,
      render: (notused: any, record: any) => {
        const previous = record.previous || '--';
        return (
          <span data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-134">
            {previous}
          </span>
        );
      },
    },
    {
      title: 'Current',
      dataIndex: 'current',
      key: 'current',
      minWidth: 150,
      render: (nonused: any, record: any) => {
        const current = record.current || '--';
        return (
          <span data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-144">
            {current}
          </span>
        );
      },
    },

    {
      title: 'Variance(AMT)',
      dataIndex: 'variance',
      key: 'variance',
      minWidth: 150,
      render: (key: string) => {
        if (key == null || key === '' || key === 'NaN' || key === '--') {
          return '--';
        }
        const varianceValue = Number(key);
        if (isNaN(varianceValue)) {
          return '--';
        }
        const className =
          varianceValue < 0
            ? 'text-green-500'
            : varianceValue === 0
              ? 'text-gray-500'
              : 'text-red-500';
        return (
          <span
            data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-167"
            className={className}
          >
            {key}
          </span>
        );
      },
    },
    {
      title: 'Variance(%)',
      dataIndex: 'variancePercentage',
      key: 'variancePercentage',
      minWidth: 150,
      render: (key: string) => {
        if (key == null || key === '' || key === 'NaN' || key === '--') {
          return '--';
        }
        // Extract numeric value from string (handles percentage signs, etc.)
        const numericString = String(key).replace(/[^\d.-]/g, '');
        const varianceValue = Number(numericString);
        if (isNaN(varianceValue)) {
          return '--';
        }
        const className =
          varianceValue < 0
            ? 'text-green-500'
            : varianceValue === 0
              ? 'text-gray-500'
              : 'text-red-500';
        return (
          <span
            data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-191"
            className={className}
          >
            {key}
          </span>
        );
      },
    },
    {
      title: 'Impact',
      dataIndex: 'impact',
      key: 'impact',
      minWidth: 150,
      render: (notused: any, record: any) => record.impact || '--',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      minWidth: 150,
      render: (notused: any, record: any) => (
        <div
          data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-207"
          className="flex items-center gap-2"
        >
          <span data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-208">
            {record.action}
          </span>
        </div>
      ),
    },
  ];

  const handleViewDetails = (type: string) => {
    setComponentType(type);
    setIsModalOpen(true);
  };
  const payrollVarianceData = data?.components?.map((item: any) => ({
    types: item.label,
    previous: Number(item.previous).toLocaleString(),
    current: Number(item.current).toLocaleString(),
    variance:
      item.variance != null && !isNaN(Number(item.variance))
        ? Number(item.variance).toLocaleString()
        : '--',
    variancePercentage:
      item?.variancePercentage != null && item?.variancePercentage !== ''
        ? item.variancePercentage
        : '--',
    impact: (
      <Tag color={impactColors[item.impact as keyof typeof impactColors]}>
        {item.impact}
      </Tag>
    ),
    action: (
      <Button
        className="bg-primary px-[10px]  text-white disabled:bg-gray-400  border-none "
        onClick={() => handleViewDetails(item.type)}
        disabled={
          item.type === 'BASIC_SALARY' &&
          (item.current == '0' ||
            item.previous == '0' ||
            Number(item.current) === 0 ||
            Number(item.previous) === 0)
        }
      >
        <FaEye />
      </Button>
    ),
  }));
  return (
    <div
      className="min-h-screen w-full px-3 sm:px-6 "
      id="manage-employees-page"
      data-cy="manage-employees-page"
    >
      <BlockWrapper className="h-auto w-full bg-white">
        <div
          className="flex flex-wrap justify-between items-center"
          id="manage-employees-header"
          data-cy="manage-employees-header"
        >
          <Button
            value={'back'}
            name="back"
            onClick={handleGoBack}
            className="border-none bg-transparent p-0 mr-2"
            id="payroll-reconciliation-back-btn"
            data-cy="payroll-reconciliation-back-btn"
          >
            <MdKeyboardArrowLeft className="text-lg sm:text-2xl" />
          </Button>
          <CustomBreadcrumb
            title="Payroll Reconciliation"
            subtitle="Employee Payroll Reconciliation"
          />

          <div
            data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-278"
            className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8"
          >
            <Button
              type="primary"
              size="large"
              className="h-10 w-10 sm:w-auto"
              icon={<PiExportLight />}
            >
              <span
                data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-285"
                className="hidden sm:inline"
              >
                Export
              </span>
            </Button>
          </div>
        </div>
        <Row gutter={[16, 16]} align="middle" className="mb-6">
          <Col xs={24} sm={24} md={4} lg={4} xl={4}>
            <div data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-291">
              <Select
                placeholder="Previous Pay Period"
                allowClear
                style={{ width: '100%', height: '48px' }}
                value={previousPayPeriodId}
                onChange={(value) => setPreviousPayPeriodId(value)}
              >
                {payPeriodData?.map((period: any) => (
                  <Option key={period.id} value={period.id}>
                    {dayjs(period.startDate).format('MMM DD, YYYY')} --
                    {dayjs(period.endDate).format('MMM DD, YYYY')}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={24} md={4} lg={4} xl={4}>
            <Select
              allowClear
              className="min-h-12 w-full"
              placeholder="Current Pay Period"
              value={currentPayPeriodId}
              onChange={(value) => setCurrentPayPeriodId(value)}
            >
              {payPeriodData?.map((period: any) => (
                <Option key={period.id} value={period.id}>
                  {dayjs(period.startDate).format('MMM DD, YYYY')} --
                  {dayjs(period.endDate).format('MMM DD, YYYY')}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <div
          data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-326"
          className="grid grid-cols-1 lg:grid lg:grid-cols-3 xl:grid-cols-3 md:grid-cols-1 gap-12"
        >
          {/* Total Payroll Cost */}
          <Card className="rounded-xl shadow-sm border" loading={isLoading}>
            <p
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-329"
              className="text-black text-sm mb-2 font-semibold"
            >
              Total Payroll Cost
            </p>
            <p
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-332"
              className="text-2xl font-bold text-black"
            >
              {data?.summary?.totalPayrollCost
                ? Number(data?.summary?.totalPayrollCost).toLocaleString()
                : 0}
            </p>

            <p
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-338"
              className="text-sm text-black mt-3 font-semibold"
            >
              Previous:{' '}
              <span
                data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-340"
                className="font-semibold"
              >
                {data?.summary?.previousPayrollCost
                  ? Number(data?.summary?.previousPayrollCost).toLocaleString()
                  : 0}
              </span>
            </p>
          </Card>
          {/* Net Variance */}
          <Card className="rounded-xl shadow-sm border" loading={isLoading}>
            <p
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-349"
              className="text-black text-sm mb-2 font-semibold"
            >
              Net Variance
            </p>
            <p
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-352"
              className="text-2xl font-bold text-black"
            >
              {data?.summary?.netVariance
                ? Number(data?.summary?.netVariance).toLocaleString()
                : 0}
            </p>

            <p
              className={`text-sm mt-3 font-semibold ${(() => {
                const varianceValue = Number(
                  data?.summary?.netVariancePercentage || 0,
                );
                if (varianceValue > 0) return 'text-red-500';
                if (varianceValue < 0) return 'text-green-500';
                return '';
              })()}`}
              data-cy="payroll-payroll-reconcilation-page-tsx-p-419"
            >
              {(() => {
                const varianceValue = Number(
                  data?.summary?.netVariancePercentage || 0,
                );
                if (isNaN(varianceValue)) {
                  return '--';
                }
                return varianceValue;
              })()}
            </p>
          </Card>
          {/* Headcount Impact */}
          <Card className="rounded-xl shadow-sm border" loading={isLoading}>
            <p
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-381"
              className="text-black text-sm mb-2 font-semibold"
            >
              Headcount Impact
            </p>
            <p
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-384"
              className="text-2xl font-bold text-black"
            >
              {data?.summary?.headcount} Employees
            </p>

            <div
              data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-388"
              className="flex gap-4 text-sm mt-3 text-black"
            >
              <p data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-389">
                Previous:{' '}
                <span
                  data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-391"
                  className="font-semibold"
                >
                  {data?.summary?.previousHeadcount}
                </span>
              </p>
              <p data-cy="-payroll-payroll-reconcilation-page-tsx-page-p-395">
                Terminations:{' '}
                <span
                  data-cy="-payroll-payroll-reconcilation-page-tsx-page-span-397"
                  className="font-semibold"
                >
                  {data?.summary?.terminations}
                </span>
              </p>
            </div>
          </Card>
        </div>

        <div
          data-cy="-payroll-payroll-reconcilation-page-tsx-page-div-405"
          className="w-full mt-6 overflow-x-auto"
        >
          <Table
            loading={isLoading}
            dataSource={payrollVarianceData}
            columns={columns}
            pagination={false}
          />
        </div>
        <PayrollReconcilationModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          previousPayPeriodId={previousPayPeriodId}
          currentPayPeriodId={currentPayPeriodId}
          componentType={componentType}
        />
      </BlockWrapper>
    </div>
  );
};

export default PayrollReconcilation;
