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
        <div className="flex items-center gap-2">
          <span>{record.types}</span>
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
        return <span>{previous}</span>;
      },
    },
    {
      title: 'Current',
      dataIndex: 'current',
      key: 'current',
      minWidth: 150,
      render: (nonused: any, record: any) => {
        const current = record.current || '--';
        return <span>{current}</span>;
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
        return <span className={className}>{key}</span>;
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
        return <span className={className}>{key}</span>;
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
        <div className="flex items-center gap-2">
          <span>{record.action}</span>
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
    previous: Number(item.previous).toFixed(2),
    current: Number(item.current).toFixed(2),
    variance:
      item.variance != null && !isNaN(Number(item.variance))
        ? Number(item.variance).toFixed(2)
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

          <div className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8">
            <Button
              type="primary"
              size="large"
              className="h-10 w-10 sm:w-auto"
              icon={<PiExportLight />}
            >
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
        <Row gutter={[16, 16]} align="middle" className="mb-6">
          <Col xs={24} sm={24} md={4} lg={4} xl={4}>
            <div>
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

        <div className="grid grid-cols-1 lg:grid lg:grid-cols-3 xl:grid-cols-3 md:grid-cols-1 gap-12">
          {/* Total Payroll Cost */}
          <Card className="rounded-xl shadow-sm border" loading={isLoading}>
            <p className="text-black text-sm mb-2 font-semibold">
              Total Payroll Cost
            </p>
            <p className="text-2xl font-bold text-black">
              {Number(data?.summary?.totalPayrollCost).toFixed(2)}
            </p>

            <p className="text-sm text-black mt-3 font-semibold">
              Previous:{' '}
              <span className="font-semibold">
                {Number(data?.summary?.previousPayrollCost).toFixed(2)}
              </span>
            </p>
          </Card>
          {/* Net Variance */}
          <Card className="rounded-xl shadow-sm border" loading={isLoading}>
            <p className="text-black text-sm mb-2 font-semibold">
              Net Variance
            </p>
            <p className="text-2xl font-bold text-black">
              {Number(data?.summary?.netVariance).toFixed(2)}
            </p>

            <p className="text-sm text-red-500 mt-3">
              {data?.summary?.netVariancePercentage} ↑
            </p>
          </Card>
          {/* Headcount Impact */}
          <Card className="rounded-xl shadow-sm border" loading={isLoading}>
            <p className="text-black text-sm mb-2 font-semibold">
              Headcount Impact
            </p>
            <p className="text-2xl font-bold text-black">
              {data?.summary?.headcount} Employees
            </p>

            <div className="flex gap-4 text-sm mt-3 text-black">
              <p>
                Previous:{' '}
                <span className="font-semibold">
                  {data?.summary?.previousHeadcount}
                </span>
              </p>
              <p>
                Terminations:{' '}
                <span className="font-semibold">
                  {data?.summary?.terminations}
                </span>
              </p>
            </div>
          </Card>
        </div>

        <div className="w-full mt-6 overflow-x-auto">
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
