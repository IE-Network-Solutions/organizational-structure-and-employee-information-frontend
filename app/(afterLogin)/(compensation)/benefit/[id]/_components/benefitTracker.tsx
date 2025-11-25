import { Table, Select, Divider, Form } from 'antd';
import { Card } from 'antd';
import React, { useEffect } from 'react';
import { FiChevronLeft } from 'react-icons/fi';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';
import { EmployeeDetails } from '../../../_components/employeeDetails';
import dayjs from 'dayjs';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import { useEmployeeSettlementTracking } from '@/store/server/features/payroll/settlementTracking/queries';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Option } = Select;

const BenefitTracking = () => {
  const [form] = Form.useForm();
  const { data: payPeriodData } = useGetPayPeriod();
  const {
    setEmployeeBenefitData,
    employeeBenefitData,
    detailCurrentPage,
    setDetailCurrentPage,
    detailPageSize,
    setDetailPageSize,
  } = useBenefitEntitlementStore();

  const handleBackData = () => {
    setEmployeeBenefitData(null);
  };

  const { isMobile, isTablet } = useIsMobile();

  const { data: payPeriods, isLoading: payLoading } = useGetPayPeriod();
  const compensationItemEntitlementId =
    employeeBenefitData?.id ||
    employeeBenefitData?.[0]?.compensationItemEntitlementId;
  const userId =
    employeeBenefitData?.userId ||
    employeeBenefitData?.[0]?.compensationItemEntitlement?.employeeId;

  const { data: employeeEntitlementData, isLoading } =
    useEmployeeSettlementTracking(compensationItemEntitlementId, userId);

  const settlementTracking = employeeEntitlementData?.settlementTracking || [];

  // Pagination logic
  const startIndex = (detailCurrentPage - 1) * detailPageSize;
  const endIndex = startIndex + detailPageSize;
  const paginatedTracking = settlementTracking.slice(startIndex, endIndex);

  useEffect(() => {
    const formattedData = paginatedTracking.map((benefit: any) => ({
      mode: benefit.mode || undefined,
      userId: benefit.userId,
      payPeriodId: benefit.payPeriodId || undefined,
    }));
    form.setFieldsValue({ benefits: formattedData });
  }, [paginatedTracking, form]);

  const periods =
    payPeriodData?.filter((item: any) =>
      settlementTracking.map((st: any) => st.payPeriodId).includes(item.id),
    ) ?? [];

  const startDates = periods.map((p: any) => new Date(p.startDate).getTime());
  const endDates = periods.map((p: any) => new Date(p.endDate).getTime());

  const earliestStart = startDates.length
    ? new Date(Math.min(...startDates)).toLocaleDateString()
    : '';
  const latestEnd = endDates.length
    ? new Date(Math.max(...endDates)).toLocaleDateString()
    : '';
  return (
      <Card
        bodyStyle={{ padding: 0, margin: 0 }}
        headStyle={{ padding: 0, margin: 0 }}
        title={
          <div
            className="flex items-center gap-3 cursor-pointer"
            id="compensation-benefit-tracker-header"
            data-cy="compensation-benefit-tracker-header"
          >
            <FiChevronLeft
              onClick={handleBackData}
              size={20}
              data-cy="compensation-benefit-tracker-back-icon"
            />
            {employeeEntitlementData?.compensationItem?.name}
          </div>
        }
        loading={isLoading}
        className="px-4 max-w-5xl mx-auto bg-white"
      >
        <div
          className="grid gap-4 text-sm my-3"
          id="compensation-benefit-tracker-summary"
          data-cy="compensation-benefit-tracker-summary"
        >
          {/* Name */}
          <div
            className="grid grid-cols-3 items-center space-x-7"
            id="compensation-benefit-tracker-name-row"
            data-cy="compensation-benefit-tracker-name-row"
          >
            <span id="compensation-benefit-tracker-name-label" data-cy="compensation-benefit-tracker-name-label" className="text-gray-500">Name</span>
            <div
              className="col-span-2 font-medium flex items-start gap-2"
              id="compensation-benefit-tracker-name-value"
              data-cy="compensation-benefit-tracker-name-value"
            >
              <EmployeeDetails data-cy="compensation-benefit-tracker-name-employee-details" empId={employeeEntitlementData?.employeeId} />
            </div>
          </div>

          <div
            className="grid grid-cols-3 items-center space-x-7"
            id="compensation-benefit-tracker-total-row"
            data-cy="compensation-benefit-tracker-total-row"
          >
            <span id="compensation-benefit-tracker-total-amount-take-label" data-cy="compensation-benefit-tracker-total-amount-take-label" className="text-gray-500">Total Amount Take</span>
            <div
              className="font-medium text-start text-nowrap px-1"
              id="compensation-benefit-tracker-total-value"
              data-cy="compensation-benefit-tracker-total-value"
            >
              {Number(
                settlementTracking.reduce(
                  (acc: any, item: any) => acc + (Number(item.amount) || 0),
                  0,
                ) || 0,
              ).toLocaleString()}
            </div>
          </div>

           {/* Expected pay per period */}
          <div
            className="grid grid-cols-3 items-center space-x-7"
            id="compensation-benefit-tracker-expected-row"
            data-cy="compensation-benefit-tracker-expected-row"
          >
            <span id="compensation-benefit-tracker-expected-label" data-cy="compensation-benefit-tracker-expected-label" className="text-gray-500">Expected pay per period</span>
            <div
              className="font-medium text-start text-nowrap px-1"
              id="compensation-benefit-tracker-expected-value"
              data-cy="compensation-benefit-tracker-expected-value"
            >
              {Number(
                settlementTracking.find((item: any) => item.isPaid === false)
                  ?.amount || 0,
              ).toLocaleString()}
            </div>
          </div>

          {/* Period */}          
          <div
            className="grid grid-cols-3 items-center space-x-7"
            id="compensation-benefit-tracker-period-row"
            data-cy="compensation-benefit-tracker-period-row"
          >
            <span id="compensation-benefit-tracker-period-label" data-cy="compensation-benefit-tracker-period-label" className="text-gray-500">Period</span>
            <div
              className="font-medium text-start text-nowrap px-1"
              id="compensation-benefit-tracker-period-value"
              data-cy="compensation-benefit-tracker-period-value"
            >
              {dayjs(earliestStart).format('MMM DD, YYYY')} -{' '}
              {dayjs(latestEnd).format('MMM DD, YYYY')}
            </div>
          </div>

          {/* Total paid amount */}
          <div
            className="grid grid-cols-3 items-center space-x-7"
            id="compensation-benefit-tracker-paid-row"
            data-cy="compensation-benefit-tracker-paid-row"
          >
            <span id="compensation-benefit-tracker-paid-label" data-cy="compensation-benefit-tracker-paid-label" className="text-gray-500">Total paid amount</span>
            <div
              className="text-green-600 font-medium text-start col-span-1 px-1"
              id="compensation-benefit-tracker-paid-value"
              data-cy="compensation-benefit-tracker-paid-value"
            >
              {Number(
                settlementTracking
                  .filter((item: any) => item.isPaid === true)
                  .reduce(
                    (acc: any, item: any) => acc + (Number(item.amount) || 0),
                    0,
                  ) || 0,
              ).toLocaleString()}
            </div>
          </div>

          {/* Remaining amount */}
          <div
            className="grid grid-cols-3 items-center space-x-7"
            id="compensation-benefit-tracker-remaining-row"
            data-cy="compensation-benefit-tracker-remaining-row"
          >
            <span id="compensation-benefit-tracker-remaining-label" data-cy="compensation-benefit-tracker-remaining-label" className="text-gray-500">Remaining amount</span>
            <div
              className="text-yellow-500 font-medium text-start col-span-1 px-1"
              id="compensation-benefit-tracker-remaining-value"
              data-cy="compensation-benefit-tracker-remaining-value"
            >
              {Number(
                settlementTracking
                  .filter((item: any) => item.isPaid === false)
                  .reduce(
                    (acc: any, item: any) => acc + (Number(item.amount) || 0),
                    0,
                  ) || 0,
              ).toLocaleString()}
            </div>
          </div>
        </div>

        <Divider data-cy="compensation-benefit-tracker-divider" className="my-4" />
        <h3
          className="text-sm font-light mb-2"
          id="compensation-benefit-tracker-paid-label"
          data-cy="compensation-benefit-tracker-paid-label"
        >
          Paid Back
        </h3>

        <div
          className="overflow-x-auto scrollbar-hide"
          id="compensation-benefit-tracker-table-scroll"
          data-cy="compensation-benefit-tracker-table-scroll"
        >
          <div id="compensation-benefit-tracker-table-wrapper" data-cy="compensation-benefit-tracker-table-wrapper" className="min-w-[600px] sm:min-w-[700px] md:min-w-[800px]">
            <Form
              form={form}
              layout="vertical"
              id="compensation-benefit-tracker-form"
              data-cy="compensation-benefit-tracker-form"
            >
              <Form.List data-cy="compensation-benefit-tracker-form-list" name="benefits">
                {(fields) => (
                  <Table
                    dataSource={fields}
                    data-cy="compensation-benefit-tracker-table"
                    columns={[
                      {
                        title: 'Date',
                        dataIndex: 'date',
                        key: 'date',
                        width: 100,
                        fixed: 'left',
                        render: (notused, notuseds, index) => (
                          <Form.Item
                            name={[index, 'createdAt']}
                            data-cy="compensation-benefit-tracker-form-item"
                            className="mb-0"
                          >
                            <span id="compensation-benefit-tracker-form-item-date-value" data-cy="compensation-benefit-tracker-form-item-date-value" className="text-xs sm:text-sm">
                              {dayjs(
                                paginatedTracking?.[index]?.createdAt,
                              ).format('MMM DD, YYYY')}
                            </span>
                          </Form.Item>
                        ),
                      },
                      {
                        title: 'Paid Amount',
                        dataIndex: 'amount',
                        key: 'amount',
                        width: 100,
                        render: (notused, notuseds, index) => (
                          <Form.Item data-cy="compensation-benefit-tracker-form-item-amount" name={[index, 'amount']} className="mb-0">
                            <span id="compensation-benefit-tracker-form-item-amount-value" data-cy="compensation-benefit-tracker-form-item-amount-value" className="text-xs sm:text-sm">
                              {Number(
                                paginatedTracking?.[index]?.amount,
                              )?.toLocaleString()}
                            </span>
                          </Form.Item>
                        ),
                      },
                      {
                        title: 'Pay Period',
                        dataIndex: 'payPeriodId',
                        key: 'payPeriodId',
                        width: 180,
                        render: (notused, notuseds, index) => (
                          <Form.Item
                            data-cy="compensation-benefit-tracker-form-item-pay-period"
                            name={[index, 'payPeriodId']}
                            className="mb-0"
                          >
                            <Select
                              data-cy="compensation-benefit-tracker-form-item-pay-period-select"
                              placeholder="Select Period"
                              allowClear
                              className="w-full"
                              loading={payLoading}
                              disabled={paginatedTracking?.[index]?.isPaid}
                              size="small"
                            >
                              {payPeriods?.map((period: any) => (
                                <Option data-cy="compensation-benefit-tracker-form-item-pay-period-option" key={period.id} value={period.id}>
                                  <span id="compensation-benefit-tracker-form-item-pay-period-option-value" data-cy="compensation-benefit-tracker-form-item-pay-period-option-value" className="text-xs sm:text-sm">
                                    {dayjs(period.startDate).format(
                                      'MMM DD, YYYY',
                                    )}{' '}
                                    –{' '}
                                    {dayjs(period.endDate).format(
                                      'MMM DD, YYYY',
                                    )}
                                  </span>
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        ),
                      },
                      {
                        title: 'Reason',
                        dataIndex: 'reason',
                        key: 'reason',
                        width: 120,
                        render: (notused, notuseds, index) => (
                          <Form.Item data-cy="compensation-benefit-tracker-form-item-reason" name={[index, 'reason']} className="mb-0">
                            <span id="compensation-benefit-tracker-form-item-reason-value" data-cy="compensation-benefit-tracker-form-item-reason-value" className="text-xs sm:text-sm">
                              {paginatedTracking?.[index]?.reason || '-'}
                            </span>
                          </Form.Item>
                        ),
                      },
                    ]}
                    pagination={false}
                    rowKey={(field) => field.key}
                    scroll={{ x: 'max-content' }}
                    size="small"
                    style={{ fontSize: '12px' }}
                    id="compensation-benefit-tracker-table"
                    data-cy="compensation-benefit-tracker-table"
                  />
                )}
              </Form.List>
            </Form>
          </div>
        </div>

        <div
          className="items-center my-6"
          id="compensation-benefit-tracker-pagination-wrapper"
          data-cy="compensation-benefit-tracker-pagination-wrapper"
        >
          {isMobile || isTablet ? (
              <CustomMobilePagination
                data-cy="compensation-benefit-tracker-mobile-pagination"
                totalResults={settlementTracking.length}
                pageSize={detailPageSize}
                onChange={(page) => setDetailCurrentPage(page)}
                onShowSizeChange={(page) => setDetailCurrentPage(page)}
              />
          ) : (
              <CustomPagination
                data-cy="compensation-benefit-tracker-pagination"
                current={detailCurrentPage}
                total={settlementTracking.length}
                pageSize={detailPageSize}
                onChange={(page) => setDetailCurrentPage(page)}
                onShowSizeChange={(pageSize) => {
                  setDetailPageSize(pageSize);
                  setDetailCurrentPage(1);
                }}
              />
          )}
        </div>
      </Card>
  );
};

export default BenefitTracking;
