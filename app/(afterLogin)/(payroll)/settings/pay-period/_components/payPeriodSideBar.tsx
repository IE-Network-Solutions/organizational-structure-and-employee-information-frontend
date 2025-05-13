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
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useCreatePayPeriods } from '@/store/server/features/payroll/setting/tax-rule/mutation';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
const { RangePicker } = DatePicker;
const { Option } = Select;

const PayPeriodSideBar = () => {
  const [form] = Form.useForm();
  const {
    isPayPeriodSidebarVisible,
    payPeriodMode,
    setPayPeriodMode,
    divisions,
    setDivisions,
    resetStore,
  } = usePayPeriodStore();
  const { mutate: createPayPeriods } = useCreatePayPeriods();
  const { data: activeFiscalYear } = useGetActiveFiscalYears();

  const calculateDivisions = (mode: string) => {
    if (!activeFiscalYear) return;
    const { startDate, endDate } = activeFiscalYear;
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
    if (activeFiscalYear) calculateDivisions(payPeriodMode);
  }, [activeFiscalYear, payPeriodMode]);

  const formattedDivisions = divisions.map(
    (range: [dayjs.Dayjs, dayjs.Dayjs]) =>
      `${dayjs(range[0]).format('MMMM D, YYYY')} - ${dayjs(range[1]).format('MMMM D, YYYY')}`,
  );

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
      activeFiscalYearId: activeFiscalYear?.id,
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

  const onClose = () => {
    form.resetFields();
    resetStore();
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
      loading: false,
      onClick: () => form.submit(),
    },
  ];

  const modeOptions = [
    { label: 'Weekly', value: 'Weekly' },
    { label: 'Bi-weekly', value: 'Bi-weekly' },
    { label: 'Monthly', value: 'Monthly' },
  ];

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
      >
        <Spin spinning={false}>
          <Form
            layout="vertical"
            form={form}
            onFinish={() => onFormSubmit()}
            requiredMark={CustomLabel}
          >
            <Form.Item name="ActiveFiscalYear" label="Active Fiscal Year">
              <Select
                placeholder={`${dayjs(activeFiscalYear?.startDate).format('MMMM D, YYYY')} -- ${dayjs(activeFiscalYear?.endDate).format('MMMM D, YYYY')}`}
                disabled
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
                      <RangePicker
                        value={[dayjs(range[0]), dayjs(range[1])]}
                        onChange={(values) => {
                          if (!values || values.length !== 2) return;

                          const [start, end] = values;
                          const newDivisions = [...divisions];

                          newDivisions[index] = [start, end];

                          if (index + 1 < newDivisions.length) {
                            const nextStart = dayjs(newDivisions[index + 1][1]);
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

                          if (
                            nextRangeEnd &&
                            (currentDate.isSame(nextRangeEnd, 'day') ||
                              currentDate.isAfter(nextRangeEnd))
                          ) {
                            return true;
                          }

                          if (
                            currentDate.isAfter(
                              dayjs(activeFiscalYear?.endDate),
                            )
                          ) {
                            return true;
                          }

                          if (
                            prevRangeEnd &&
                            currentDate.isBefore(prevRangeEnd.add(1, 'day'))
                          ) {
                            return true;
                          }

                          if (startDate && currentDate.isBefore(startDate)) {
                            return true;
                          }

                          return false;
                        }}
                      />
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
                            // const rangeStart = dayjs(range[0]);
                            // const rangeEnd = dayjs(range[1]);
                            // const rangeAverage = rangeStart.add(
                            //   rangeEnd.diff(rangeStart) / 2,
                            //   'ms',
                            // );

                            const suitableMonths =
                              monthsWithStartEndDates ?? [];
                            // .filter((month) => {
                            //   const startDate = dayjs(month.startDate);
                            //   return startDate.isSameOrBefore(
                            //     rangeEnd,
                            //     'month',
                            //   );
                            // })
                            // .map((month) => ({
                            //   ...month,
                            //   distance: Math.abs(
                            //     dayjs(month.startDate).diff(
                            //       rangeAverage,
                            //       'days',
                            //     ),
                            //   ),
                            // }))
                            // .sort((a, b) => a.distance - b.distance)
                            // .slice(0, 3)
                            // .sort((a, b) => {
                            //   const startDateA = dayjs(a.startDate);
                            //   const startDateB = dayjs(b.startDate);
                            //   return startDateA.isBefore(startDateB) ? -1 : 1;
                            // });
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
