'use-client';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Form, Select, Spin, DatePicker, Button, Popover } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import CustomLabel from '@/components/form/customLabel/customLabel';
import usePayPeriodStore from '@/store/uistate/features/payroll/settings/payPeriod';
import {
  useGetActiveFiscalYears,
  useGetAllFiscalYears,
} from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useCreatePayPeriods } from '@/store/server/features/payroll/setting/tax-rule/mutation';
import dayjs from 'dayjs';
import { useMemo, useState, useEffect } from 'react';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
const { RangePicker } = DatePicker;
const { Option } = Select;

const PayPeriodSideBar = () => {
  const [form] = Form.useForm();
  const [activePicker, setActivePicker] = useState<{
    index: number | null;
    part: 'start' | 'end' | null;
  }>({ index: null, part: null });

  const {
    isPayPeriodSidebarVisible,
    payPeriodMode,
    selectedFiscalYear,
    setSelectedFiscalYear,
    setPayPeriodMode,
    divisions,
    setDivisions,
    resetStore,
    currentPage,
    pageSize,
  } = usePayPeriodStore();
  const { mutate: createPayPeriods, isLoading: createPayPeriodsLoading } =
    useCreatePayPeriods();
  const { data: activeFiscalYear } = useGetActiveFiscalYears();
  const { data: fiscalYearsData } = useGetAllFiscalYears(pageSize, currentPage);

  const calculateDivisions = (mode: string) => {
    if (!selectedFiscalYear) return;
    const { startDate, endDate } = selectedFiscalYear;
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    let intervals: any = [];
    if (mode === 'Weekly') {
      intervals = calculateEqualIntervals(start, end, 7);
    } else if (mode === 'Bi-weekly') {
      intervals = calculateEqualIntervals(start, end, 14);
    } else if (mode === 'Monthly') {
      intervals = calculateMonthlyIntervals(start, end);
    }
    setDivisions(intervals);
  };

  const calculateEqualIntervals = (
    start: dayjs.Dayjs,
    end: dayjs.Dayjs,
    days: number,
  ) => {
    const intervals = [];
    let current = start;

    while (current.isBefore(end)) {
      const next = current.add(days, 'day').subtract(1, 'day');
      intervals.push([current, next.isAfter(end) ? end : next]);
      current = next.add(1, 'day');
    }

    return intervals;
  };

  const calculateMonthlyIntervals = (start: dayjs.Dayjs, end: dayjs.Dayjs) => {
    const intervals = [];
    let current = start;

    while (current.isBefore(end)) {
      const next = current.add(1, 'month');
      intervals.push([
        current,
        next.isAfter(end) ? end : next.subtract(1, 'day'),
      ]);
      current = next;
    }

    return intervals;
  };

  useMemo(() => {
    if (selectedFiscalYear) calculateDivisions(payPeriodMode);
  }, [selectedFiscalYear, payPeriodMode]);

  const formattedDivisions = divisions.map(
    (range: [dayjs.Dayjs, dayjs.Dayjs]) =>
      `${dayjs(range[0]).format('MMMM D, YYYY')} - ${dayjs(range[1]).format('MMMM D, YYYY')}`,
  );

  useEffect(() => {
    const fields: Record<string, [dayjs.Dayjs, dayjs.Dayjs]> = {};
    divisions.forEach((r: [dayjs.Dayjs, dayjs.Dayjs], idx: number) => {
      fields[`range${idx}`] = [dayjs(r[0]), dayjs(r[1])];
    });
    form.setFieldsValue(fields);
  }, [divisions, form]);

  const allMonths = activeFiscalYear?.sessions?.flatMap(
    (session) => session.months,
  );
  const monthsWithStartEndDates = allMonths?.map((month) => ({
    id: month?.id,
    startDate: month?.startDate,
    monthName: dayjs(month?.startDate).format('MMMM'),
    endDate: month?.endDate,
  }));

  const onFormSubmit = () => {
    const transformedData = divisions.map((division) => ({
      startDate: dayjs(division[0]).format('YYYY-MM-DD'),
      endDate: dayjs(division[1]).format('YYYY-MM-DD'),
      monthId: division.monthId,
      status: 'CLOSED',
      activeFiscalYearId: selectedFiscalYear?.id,
    }));
    createPayPeriods(transformedData, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleDeleteDivision = (index: number) => {
    const updatedDivisions = divisions.filter((unused, i) => i !== index);
    setDivisions(updatedDivisions);
  };

  const handleMonthSelect = (value: string, index: number) => {
    const newDivisions = [...divisions];
    newDivisions[index] = {
      ...newDivisions[index],
      monthId: value,
    };
    setDivisions(newDivisions);
  };

  const handleFiscalYearChange = (value: string) => {
    const selected = fiscalYearsData?.items.find((year) => year.id === value);
    setSelectedFiscalYear(selected || null);
  };

  const onClose = () => {
    form.resetFields();
    resetStore();
    setSelectedFiscalYear(null);
  };

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-12',
      size: 'large',
      loading: false,
      onClick: () => onClose(),
    },
    {
      label: <span>Create</span>,
      key: 'create',
      className: 'h-12',
      type: 'primary',
      size: 'large',
      loading: createPayPeriodsLoading,
      onClick: () => form.submit(),
    },
  ];

  const modeOptions = [
    { label: 'Weekly', value: 'Weekly' },
    { label: 'Bi-weekly', value: 'Bi-weekly' },
    { label: 'Monthly', value: 'Monthly' },
  ];

  const getSpanRulesForMode = (mode: string) => {
    if (mode === 'Weekly')
      return { min: 7, max: 7, allowed: new Set([7]) } as const;
    if (mode === 'Bi-weekly')
      return { min: 14, max: 15, allowed: new Set([14, 15]) } as const;
    if (mode === 'Monthly') return { min: 28, max: 31 } as const;
    return { min: 1, max: Infinity } as const;
  };

  return (
    isPayPeriodSidebarVisible && (
      <CustomDrawerLayout
        open={isPayPeriodSidebarVisible}
        onClose={onClose}
        modalHeader={
          <CustomDrawerHeader className="flex justify-center">
            <span>Add Pay Periods</span>
          </CustomDrawerHeader>
        }
        footer={
          <CustomDrawerFooterButton
            className="w-full bg-[#fff] flex justify-between space-x-5 p-4"
            buttons={footerModalItems}
          />
        }
        width="30%"
        customMobileHeight="50vh"
      >
        <Spin spinning={false}>
          <Form
            layout="vertical"
            form={form}
            onFinish={() => onFormSubmit()}
            requiredMark={CustomLabel}
            className="px-3"
          >
            <Form.Item
              name="fiscalYear"
              label="Fiscal Year"
              rules={[
                { required: true, message: 'Please select a fiscal year' },
              ]}
            >
              <Select
                placeholder="Select fiscal year"
                onChange={handleFiscalYearChange}
                options={fiscalYearsData?.items.map((year) => ({
                  label: `${dayjs(year.startDate).format('MMMM D, YYYY')} - ${dayjs(year.endDate).format('MMMM D, YYYY')}`,
                  value: year.id,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="payPeriodMode"
              label="Pay Period mode"
              rules={[
                { required: true, message: 'Please select pay period mode' },
              ]}
            >
              <Select
                className="mt-2 h-10"
                placeholder="Select pay period mode"
                options={modeOptions}
                allowClear
                onChange={(value) => setPayPeriodMode(value)}
              />
            </Form.Item>
            {payPeriodMode && (
              <div className="text-center text-l">{`${payPeriodMode} pay periods`}</div>
            )}
            {formattedDivisions.length > 0 && (
              <div className="mt-4">
                {divisions.map((range, index) => (
                  <div key={index} className="my-2">
                    <div className="flex justify-between">
                      <Form.Item
                        name={`range${index}`}
                        validateTrigger={['onChange']}
                        rules={[
                          {
                            required: true,
                            message: 'Please select a date range',
                          },
                          {
                            validator: async (notused, value) => {
                              if (
                                !value ||
                                value.length !== 2 ||
                                !value[0] ||
                                !value[1]
                              ) {
                                return Promise.reject(
                                  new Error('Please select a date range'),
                                );
                              }
                              const start = dayjs(value[0]);
                              const end = dayjs(value[1]);
                              const inclusiveDays = end.diff(start, 'day') + 1;
                              if (
                                payPeriodMode === 'Weekly' &&
                                inclusiveDays !== 7
                              ) {
                                return Promise.reject(
                                  new Error(
                                    'Weekly range must be exactly 7 days.',
                                  ),
                                );
                              }
                              if (
                                payPeriodMode === 'Bi-weekly' &&
                                !(inclusiveDays === 14 || inclusiveDays === 15)
                              ) {
                                return Promise.reject(
                                  new Error(
                                    'Bi-weekly range must be 14 or 15 days.',
                                  ),
                                );
                              }
                              if (
                                payPeriodMode === 'Monthly' &&
                                !(inclusiveDays >= 28 && inclusiveDays <= 31)
                              ) {
                                return Promise.reject(
                                  new Error(
                                    'Monthly range must be between 28 and 31 days.',
                                  ),
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <RangePicker
                          value={[dayjs(range[0]), dayjs(range[1])]}
                          onOpenChange={(open) => {
                            if (!open)
                              setActivePicker({ index: null, part: null });
                            else setActivePicker({ index, part: 'start' });
                          }}
                          onCalendarChange={(dates, notused, info) => {
                            if (
                              info?.range === 'start' ||
                              info?.range === 'end'
                            ) {
                              setActivePicker({ index, part: info.range });
                            }
                          }}
                          onChange={(values) => {
                            if (
                              !values ||
                              values.length !== 2 ||
                              !values[0] ||
                              !values[1]
                            )
                              return;

                            const [start, rawEnd] = values as [
                              dayjs.Dayjs,
                              dayjs.Dayjs,
                            ];
                            const rules = getSpanRulesForMode(payPeriodMode);
                            const minAllowedEnd = start.add(
                              rules.min - 1,
                              'day',
                            );
                            const maxAllowedEnd = start.add(
                              rules.max - 1,
                              'day',
                            );

                            let end = rawEnd;
                            if (end.isBefore(minAllowedEnd))
                              end = minAllowedEnd;
                            if (end.isAfter(maxAllowedEnd)) end = maxAllowedEnd;

                            const fiscalEndDate = activeFiscalYear?.endDate
                              ? dayjs(activeFiscalYear.endDate)
                              : null;
                            if (fiscalEndDate && end.isAfter(fiscalEndDate)) {
                              end = fiscalEndDate;
                            }
                            if (index + 1 < divisions.length) {
                              const nextRangeEnd = dayjs(
                                divisions[index + 1][1],
                              );
                              const latestAllowedBeforeNext =
                                nextRangeEnd.subtract(1, 'day');
                              if (end.isAfter(latestAllowedBeforeNext)) {
                                end = latestAllowedBeforeNext;
                              }
                            }

                            const newDivisions = [...divisions];

                            newDivisions[index] = [start, end];
                            form.setFieldsValue({
                              [`range${index}`]: [start, end],
                            });

                            if (index + 1 < newDivisions.length) {
                              const nextStart = dayjs(
                                newDivisions[index + 1][1],
                              );
                              if (dayjs(end).isBefore(nextStart)) {
                                newDivisions[index + 1][0] = dayjs(end).add(
                                  1,
                                  'day',
                                );
                              }
                            }

                            if (index - 1 >= 0) {
                              const prevEnd = dayjs(newDivisions[index - 1][1]);
                              if (dayjs(start).isAfter(prevEnd)) {
                                newDivisions[index - 1][1] = dayjs(
                                  start,
                                ).subtract(1, 'day');
                              }
                            }

                            setDivisions(newDivisions);
                          }}
                          disabledDate={(currentDate) => {
                            const nextRangeEnd =
                              index + 1 < divisions.length
                                ? dayjs(divisions[index + 1][1])
                                : null;
                            const prevRangeEnd =
                              index - 1 >= 0
                                ? dayjs(divisions[index - 1][1])
                                : null;
                            const startDate = range[0] ? dayjs(range[0]) : null;
                            const fiscalEndDate = activeFiscalYear?.endDate
                              ? dayjs(activeFiscalYear.endDate)
                              : null;
                            const fiscalStartDate = activeFiscalYear?.startDate
                              ? dayjs(activeFiscalYear.startDate)
                              : null;

                            if (
                              nextRangeEnd &&
                              (currentDate.isSame(nextRangeEnd, 'day') ||
                                currentDate.isAfter(nextRangeEnd))
                            ) {
                              return true;
                            }

                            if (
                              fiscalEndDate &&
                              currentDate.isAfter(fiscalEndDate)
                            ) {
                              return true;
                            }

                            if (
                              fiscalStartDate &&
                              currentDate.isBefore(fiscalStartDate)
                            ) {
                              return true;
                            }

                            if (
                              prevRangeEnd &&
                              currentDate.isBefore(prevRangeEnd.add(1, 'day'))
                            ) {
                              return true;
                            }

                            // Only constrain window when selecting the end date for this specific range
                            if (
                              activePicker.index === index &&
                              activePicker.part === 'end' &&
                              startDate
                            ) {
                              const rules = getSpanRulesForMode(payPeriodMode);
                              const minAllowedEnd = startDate.add(
                                rules.min - 1,
                                'day',
                              );
                              const maxAllowedEnd = startDate.add(
                                rules.max - 1,
                                'day',
                              );
                              if (
                                currentDate.isBefore(minAllowedEnd) ||
                                currentDate.isAfter(maxAllowedEnd)
                              ) {
                                return true;
                              }
                            }

                            return false;
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        name={`monthId${index}`}
                        label="Pay Period month"
                        rules={[
                          {
                            required: true,
                            message: 'Please select pay period month',
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select a month"
                          style={{ width: 200 }}
                          onChange={(value) => handleMonthSelect(value, index)}
                        >
                          {(() => {
                            const suitableMonths =
                              monthsWithStartEndDates ?? [];
                            return suitableMonths.map((month) => (
                              <Option key={month.id} value={month.id}>
                                {`${month?.monthName}`}
                              </Option>
                            ));
                          })()}
                        </Select>
                      </Form.Item>
                    </div>
                    <div className="flex flex-row justify-between items-center mt-2">
                      <p className="text-sm text-gray-500">
                        {dayjs(range[0]).format('MMMM D, YYYY')} -{' '}
                        {dayjs(range[1]).format('MMMM D, YYYY')}
                      </p>
                      {index === divisions.length - 1 && (
                        <Popover
                          content={
                            <span>{`${dayjs(range[0]).format('MMMM D, YYYY')} - ${dayjs(range[1]).format('MMMM D, YYYY')}`}</span>
                          }
                          title="Delete Pay Period Range"
                          trigger="hover"
                          placement="left"
                        >
                          <Button
                            type="primary"
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteDivision(index)}
                            danger
                          />
                        </Popover>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Form>
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default PayPeriodSideBar;
