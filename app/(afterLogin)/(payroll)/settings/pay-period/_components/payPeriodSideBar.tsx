'use-client';
// import CustomDrawerFooterButton, {
//   CustomDrawerFooterButtonProps,
// } from '@/components/common/customDrawer/customDrawerFooterButton';
// import CustomDrawerLayout from '@/components/common/customDrawer';
// import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import {
  Form,
  Select,
  Spin,
  DatePicker,
  Button,
  Popover,
  message,
  Modal,
  Radio,
} from 'antd';
import { CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import CustomLabel from '@/components/form/customLabel/customLabel';
import usePayPeriodStore from '@/store/uistate/features/payroll/settings/payPeriod';
import {
  useGetActiveFiscalYears,
  useGetAllFiscalYears,
} from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useCreatePayPeriods } from '@/store/server/features/payroll/setting/tax-rule/mutation';
import { useFetchActiveFiscalYearPayPeriods } from '@/store/server/features/payroll/setting/tax-rule/queries';
import dayjs from 'dayjs';
import { useState, useEffect, useCallback } from 'react';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
const { RangePicker } = DatePicker;
// const { Option } = Select;

const PayPeriodSideBar = () => {
  const [form] = Form.useForm();
  const [, setActivePicker] = useState<{
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
  const { data: existingPayPeriods } = useFetchActiveFiscalYearPayPeriods(
    selectedFiscalYear?.id,
  );

  const calculateEqualIntervals = (
    start: dayjs.Dayjs,
    end: dayjs.Dayjs,
    days: number,
  ): [dayjs.Dayjs, dayjs.Dayjs][] => {
    const intervals: [dayjs.Dayjs, dayjs.Dayjs][] = [];
    let current = start;

    while (current.isBefore(end)) {
      const next = current.add(days, 'day').subtract(1, 'day');
      intervals.push([current, next.isAfter(end) ? end : next] as [
        dayjs.Dayjs,
        dayjs.Dayjs,
      ]);
      current = next.add(1, 'day');
    }

    return intervals;
  };

  const calculateMonthlyIntervals = (
    start: dayjs.Dayjs,
    end: dayjs.Dayjs,
  ): [dayjs.Dayjs, dayjs.Dayjs][] => {
    const intervals: [dayjs.Dayjs, dayjs.Dayjs][] = [];
    let current = start;

    while (current.isBefore(end)) {
      const next = current.add(1, 'month');
      intervals.push([
        current,
        next.isAfter(end) ? end : next.subtract(1, 'day'),
      ] as [dayjs.Dayjs, dayjs.Dayjs]);
      current = next;
    }

    return intervals;
  };

  const calculateDivisions = useCallback(
    (mode: string) => {
      if (!selectedFiscalYear) return;
      const { startDate, endDate } = selectedFiscalYear;
      const start = dayjs(startDate);
      const end = dayjs(endDate);

      let intervals: [dayjs.Dayjs, dayjs.Dayjs][] = [];
      if (mode === 'Weekly') {
        intervals = calculateEqualIntervals(start, end, 7);
      } else if (mode === 'Bi-weekly') {
        intervals = calculateEqualIntervals(start, end, 14);
      } else if (mode === 'Monthly') {
        intervals = calculateMonthlyIntervals(start, end);
      }
      setDivisions(intervals);
    },
    [selectedFiscalYear, setDivisions],
  );

  useEffect(() => {
    if (selectedFiscalYear) calculateDivisions(payPeriodMode);
  }, [selectedFiscalYear, payPeriodMode, calculateDivisions]);

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

  // const allMonths = selectedFiscalYear?.sessions?.flatMap(
  //   (session) => session.months,
  // );
  // const monthsWithStartEndDates = allMonths?.map((month) => ({
  //   id: month?.id,
  //   startDate: month?.startDate,
  //   monthName: dayjs(month?.startDate).format('MMMM'),
  //   endDate: month?.endDate,
  // }));

  const checkDateOverlap = (
    start1: dayjs.Dayjs,
    end1: dayjs.Dayjs,
    start2: dayjs.Dayjs,
    end2: dayjs.Dayjs,
  ) => {
    return start1.isSameOrBefore(end2) && end1.isSameOrAfter(start2);
  };

  const onFormSubmit = () => {
    const errors: string[] = [];

    divisions.forEach((division, index) => {
      const start = dayjs(division[0]);
      const end = dayjs(division[1]);
      const inclusiveDays = end.diff(start, 'day') + 1;

      if (payPeriodMode === 'Monthly' && inclusiveDays > 31) {
        errors.push(
          `Pay period ${index + 1}: Monthly pay period cannot exceed 31 days (${inclusiveDays} days selected).`,
        );
      }

      if (Array.isArray(existingPayPeriods)) {
        existingPayPeriods.forEach(
          (existing: { startDate: string; endDate: string }) => {
            const existingStart = dayjs(existing.startDate);
            const existingEnd = dayjs(existing.endDate);
            if (checkDateOverlap(start, end, existingStart, existingEnd)) {
              errors.push(
                `Pay period ${index + 1}: Overlaps with existing pay period (${existingStart.format('MMM D, YYYY')} - ${existingEnd.format('MMM D, YYYY')}).`,
              );
            }
          },
        );
      }

      divisions.forEach((otherDivision, otherIndex) => {
        if (index !== otherIndex) {
          const otherStart = dayjs(otherDivision[0]);
          const otherEnd = dayjs(otherDivision[1]);
          if (checkDateOverlap(start, end, otherStart, otherEnd)) {
            errors.push(
              `Pay period ${index + 1} overlaps with pay period ${otherIndex + 1}.`,
            );
          }
        }
      });
    });

    if (errors.length > 0) {
      errors.forEach((error) => {
        message.error(error);
      });

      form.setFields(
        divisions.map((unused, index) => {
          const fieldErrors = errors.filter((err) =>
            err.includes(`Pay period ${index + 1}`),
          );
          return {
            name: `range${index}`,
            errors: fieldErrors.length > 0 ? [fieldErrors[0]] : [],
          };
        }),
      );
      return;
    }

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

  // const handleMonthSelect = (value: string, index: number) => {
  //   const newDivisions = [...divisions];
  //   newDivisions[index] = {
  //     ...newDivisions[index],
  //     monthId: value,
  //   };
  //   setDivisions(newDivisions);
  // };

  const handleFiscalYearChange = (value: string) => {
    const selected = fiscalYearsData?.items.find((year) => year.id === value);
    setSelectedFiscalYear(selected || null);
  };

  const onClose = () => {
    form.resetFields();
    resetStore();
    setSelectedFiscalYear(null);
  };

  // const footerModalItems: CustomDrawerFooterButtonProps[] = [
  //   {
  //     label: 'Cancel',
  //     key: 'cancel',
  //     className: 'h-12',
  //     size: 'large',
  //     loading: false,
  //     onClick: () => onClose(),
  //   },
  //   {
  //     label: (
  //       <span data-cy="payroll-payperiod-sidebar-create-button-label">
  //         Create
  //       </span>
  //     ),
  //     key: 'create',
  //     'data-cy': 'payroll-payperiod-sidebar-create-button',
  //     className: 'h-12',
  //     type: 'primary',
  //     size: 'large',
  //     loading: createPayPeriodsLoading,
  //     onClick: () => form.submit(),
  //   },
  // ];

  const footerModalItems = [
    {
      label: 'Cancel',
      key: 'cancel',
      dataCy: 'payroll-payperiod-sidebar-cancel-button',
      className:
        'h-8 rounded-md border border-gray-300 bg-white px-4 text-sm font-normal text-gray-700 hover:bg-gray-50',
      loading: false,
      onClick: () => onClose(),
    },
    {
      label: (
        <span data-cy="payroll-payperiod-sidebar-create-button-label">
          Create
        </span>
      ),
      key: 'create',
      dataCy: 'payroll-payperiod-sidebar-create-button',
      className: 'h-8 rounded-md px-4 text-sm font-normal',
      type: 'primary' as const,
      loading: createPayPeriodsLoading,
      onClick: () => form.submit(),
    },
  ];

  const modeOptions = [
    {
      label: 'Monthly',
      value: 'Monthly',
      description: 'Pay period is generated once per month.',
    },
    {
      label: 'Bi-weekly',
      value: 'Bi-weekly',
      description:
        'Pay period is generated every two weeks (14–15 day intervals).',
    },
    {
      label: 'Weekly',
      value: 'Weekly',
      description: 'Pay period is generated every week (7-day intervals).',
    },
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
    <Modal
      data-cy="payroll-payperiod-sidebar-modal"
      open={isPayPeriodSidebarVisible}
      onCancel={onClose}
      footer={null}
      centered
      width={640}
      destroyOnClose
      mask
      maskClosable={false}
      closable={false}
      zIndex={10002}
      style={{ maxWidth: 'calc(100vw - 32px)' }}
      rootClassName="[&_.ant-modal-content]:!rounded-xl [&_.ant-modal-content]:!overflow-hidden [&_.ant-modal-title]:!block [&_.ant-modal-title]:!w-full [&_.ant-form-item-label>label]:!font-normal [&_.ant-form-item-label>label]:text-[#262626] max-sm:[&_.ant-modal-body]:[-ms-overflow-style:none] max-sm:[&_.ant-modal-body]:[scrollbar-width:none] max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!hidden max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!w-0 max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!h-0"
      classNames={{
        body: '!p-0 hide-scrollbar',
      }}
      styles={{
        content: { borderRadius: 12, padding: 0 },
        body: { borderBottom: 'none' },
      }}
    >
      {/* Header */}
      <div
        id="payroll-payperiod-sidebar-modal-header"
        data-cy="payroll-payperiod-sidebar-modal-header"
        className="flex items-center justify-between gap-4 px-6 py-4"
      >
        <span
          id="payroll-payperiod-sidebar-header-title"
          data-cy="payroll-payperiod-sidebar-header-title"
          className="inline-flex min-h-6 items-center text-base font-semibold leading-6 text-gray-900"
        >
          Edit Pay Periods
        </span>
        <button
          id="payroll-payperiod-sidebar-modal-close-click-button"
          data-cy="payroll-payperiod-sidebar-modal-close-click-button"
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
          aria-label="Close modal"
        >
          <CloseOutlined
            id="payroll-payperiod-sidebar-modal-close-icon"
            data-cy="payroll-payperiod-sidebar-modal-close-icon"
            style={{ fontSize: 16, color: '#262626' }}
          />
        </button>
      </div>
      {/* Body */}
      <div
        id="payroll-payperiod-sidebar-modal-body-view-container"
        data-cy="payroll-payperiod-sidebar-modal-body-view-container"
        className="bg-white px-6 pb-2 pt-0"
      >
        <div
          id="payroll-payperiod-sidebar-modal-card-view-container"
          data-cy="payroll-payperiod-sidebar-modal-card-view-container"
          className="mt-4 px-6 py-5"
        >
          <Spin data-cy="payroll-payperiod-sidebar-spinner" spinning={false}>
            <Form
              id="payroll-payperiod-sidebar-form"
              data-cy="payroll-payperiod-sidebar-form"
              layout="vertical"
              form={form}
              onFinish={() => onFormSubmit()}
              requiredMark={CustomLabel}
              className="flex flex-col gap-5"
            >
              <Form.Item
                id="payroll-payperiod-sidebar-fiscalyear-formitem"
                data-cy="payroll-payperiod-sidebar-fiscalyear-formitem"
                name="fiscalYear"
                label="Fiscal Year"
                rules={[
                  { required: true, message: 'Please select a fiscal year' },
                ]}
              >
                <Select
                  id="payroll-payperiod-sidebar-fiscalyear-select"
                  data-cy="payroll-payperiod-sidebar-fiscalyear-select"
                  placeholder="Select fiscal year"
                  onChange={handleFiscalYearChange}
                  options={fiscalYearsData?.items.map((year) => ({
                    label: `${dayjs(year.startDate).format('MMMM D, YYYY')} - ${dayjs(year.endDate).format('MMMM D, YYYY')}`,
                    value: year.id,
                  }))}
                />
              </Form.Item>

              <Form.Item
                id="payroll-payperiod-sidebar-mode-formitem"
                data-cy="payroll-payperiod-sidebar-mode-formitem"
                name="payPeriodMode"
                label="Pay Period Breakdown"
                required={false}
                rules={[
                  {
                    required: true,
                    message: 'Please select a pay period breakdown',
                  },
                ]}
              >
                <Radio.Group
                  id="payroll-payperiod-sidebar-mode-radio-group"
                  data-cy="payroll-payperiod-sidebar-mode-radio-group"
                  className="mt-2 space-y-3 w-full"
                  value={payPeriodMode}
                  onChange={(e) => setPayPeriodMode(e.target.value)}
                >
                  {modeOptions.map((option) => (
                    <Radio
                      key={option.value}
                      value={option.value}
                      className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all w-full ${
                        payPeriodMode === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      data-cy={`payroll-payperiod-sidebar-mode-card-${option.value.toLowerCase()}`}
                    >
                      <div
                        className="ml-2 flex flex-col"
                        data-cy={`payroll-payperiod-sidebar-mode-card-description-container-${option.value.toLowerCase()}`}
                      >
                        <span
                          className="text-sm font-medium text-gray-700"
                          data-cy={`payroll-payperiod-sidebar-mode-card-title-${option.value.toLowerCase()}`}
                        >
                          {option.label}
                        </span>
                        {option.description && (
                          <span
                            className="text-xs text-gray-500 mt-0.5"
                            data-cy={`payroll-payperiod-sidebar-mode-card-description-${option.value.toLowerCase()}`}
                          >
                            {option.description}
                          </span>
                        )}
                      </div>
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
              {payPeriodMode && (
                <div
                  id="payroll-payperiod-sidebar-mode-label"
                  data-cy="payroll-payperiod-sidebar-mode-label"
                  className="mt-1 text-sm font-medium text-gray-700"
                >{`${payPeriodMode} pay periods`}</div>
              )}
              {formattedDivisions.length > 0 && (
                <div
                  id="payroll-payperiod-sidebar-divisions-container"
                  data-cy="payroll-payperiod-sidebar-divisions-container"
                  className="mt-4 space-y-3"
                >
                  {divisions.map((range, index) => (
                    <div
                      id={`payroll-payperiod-sidebar-division-${index}`}
                      data-cy={`payroll-payperiod-sidebar-division-${index}`}
                      key={index}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                    >
                      <div
                        id={`payroll-payperiod-sidebar-division-form-${index}`}
                        data-cy={`payroll-payperiod-sidebar-division-form-${index}`}
                        className="w-full"
                      >
                        <Form.Item
                          name={`range${index}`}
                          data-cy={`payroll-payperiod-sidebar-division-formitem-${index}`}
                          validateTrigger={['onChange']}
                          rules={[
                            {
                              required: true,
                              message: 'Please select a date range',
                            },
                            {
                              validator: async (unused, value) => {
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
                                const inclusiveDays =
                                  end.diff(start, 'day') + 1;
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
                                  !(
                                    inclusiveDays === 14 || inclusiveDays === 15
                                  )
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
                                  if (inclusiveDays > 31) {
                                    return Promise.reject(
                                      new Error(
                                        'Monthly pay period cannot exceed 31 days.',
                                      ),
                                    );
                                  }
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
                            data-cy={`payroll-payperiod-sidebar-division-rangepicker-${index}`}
                            value={[dayjs(range[0]), dayjs(range[1])]}
                            className="w-full"
                            onOpenChange={(open) => {
                              if (!open)
                                setActivePicker({ index: null, part: null });
                              else setActivePicker({ index, part: 'start' });
                            }}
                            onCalendarChange={(dates, unused, info) => {
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

                              const fiscalEndDate = activeFiscalYear?.endDate
                                ? dayjs(activeFiscalYear.endDate)
                                : null;
                              const nextRangeLimit =
                                index + 1 < divisions.length
                                  ? dayjs(divisions[index + 1][1]).subtract(
                                      1,
                                      'day',
                                    )
                                  : null;

                              if (
                                payPeriodMode === 'Weekly' ||
                                payPeriodMode === 'Bi-weekly'
                              ) {
                                let effectiveMaxEnd = maxAllowedEnd;
                                if (
                                  fiscalEndDate &&
                                  fiscalEndDate.isBefore(effectiveMaxEnd)
                                ) {
                                  effectiveMaxEnd = fiscalEndDate;
                                }
                                if (
                                  nextRangeLimit &&
                                  nextRangeLimit.isBefore(effectiveMaxEnd)
                                ) {
                                  effectiveMaxEnd = nextRangeLimit;
                                }

                                if (end.isBefore(minAllowedEnd))
                                  end = minAllowedEnd;
                                if (end.isAfter(effectiveMaxEnd))
                                  end = effectiveMaxEnd;

                                if (end.isAfter(maxAllowedEnd)) {
                                  end = maxAllowedEnd;
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
                                    const nextRules =
                                      getSpanRulesForMode(payPeriodMode);
                                    const nextStartDate = dayjs(end).add(
                                      1,
                                      'day',
                                    );
                                    const nextMaxAllowedEnd = nextStartDate.add(
                                      nextRules.max - 1,
                                      'day',
                                    );
                                    const nextEndDate = dayjs(
                                      newDivisions[index + 1][1],
                                    );
                                    if (
                                      nextEndDate.isAfter(nextMaxAllowedEnd)
                                    ) {
                                      newDivisions[index + 1][1] =
                                        nextMaxAllowedEnd;
                                    }
                                  }
                                }

                                if (index - 1 >= 0) {
                                  const prevStart = dayjs(
                                    newDivisions[index - 1][0],
                                  );
                                  const prevEnd = dayjs(
                                    newDivisions[index - 1][1],
                                  );
                                  if (dayjs(start).isAfter(prevEnd)) {
                                    const newPrevEnd = dayjs(start).subtract(
                                      1,
                                      'day',
                                    );
                                    const prevRules =
                                      getSpanRulesForMode(payPeriodMode);
                                    const prevMinAllowedEnd = prevStart.add(
                                      prevRules.min - 1,
                                      'day',
                                    );
                                    const prevMaxAllowedEnd = prevStart.add(
                                      prevRules.max - 1,
                                      'day',
                                    );

                                    if (
                                      newPrevEnd.isBefore(prevMinAllowedEnd)
                                    ) {
                                      newDivisions[index][0] = prevEnd.add(
                                        1,
                                        'day',
                                      );
                                      const newStart = prevEnd.add(1, 'day');
                                      const newMinAllowedEnd = newStart.add(
                                        rules.min - 1,
                                        'day',
                                      );
                                      const newMaxAllowedEnd = newStart.add(
                                        rules.max - 1,
                                        'day',
                                      );
                                      let newEnd = end;
                                      if (newEnd.isBefore(newMinAllowedEnd)) {
                                        newEnd = newMinAllowedEnd;
                                      }
                                      if (newEnd.isAfter(newMaxAllowedEnd)) {
                                        newEnd = newMaxAllowedEnd;
                                      }
                                      newDivisions[index][1] = newEnd;
                                      form.setFieldsValue({
                                        [`range${index}`]: [newStart, newEnd],
                                      });
                                    } else {
                                      const adjustedPrevEnd =
                                        newPrevEnd.isAfter(prevMaxAllowedEnd)
                                          ? prevMaxAllowedEnd
                                          : newPrevEnd;
                                      newDivisions[index - 1][1] =
                                        adjustedPrevEnd;
                                      form.setFieldsValue({
                                        [`range${index - 1}`]: [
                                          prevStart,
                                          adjustedPrevEnd,
                                        ],
                                      });
                                    }
                                  }
                                }

                                setDivisions(newDivisions);
                              } else if (payPeriodMode === 'Monthly') {
                                const fiscalEndDate =
                                  selectedFiscalYear?.endDate
                                    ? dayjs(selectedFiscalYear.endDate)
                                    : null;
                                const fiscalStartDate =
                                  selectedFiscalYear?.startDate
                                    ? dayjs(selectedFiscalYear.startDate)
                                    : null;

                                let adjustedStart = start;
                                let adjustedEnd = end;

                                if (
                                  fiscalEndDate &&
                                  adjustedEnd.isAfter(fiscalEndDate)
                                ) {
                                  adjustedEnd = fiscalEndDate;
                                }
                                if (
                                  fiscalStartDate &&
                                  adjustedStart.isBefore(fiscalStartDate)
                                ) {
                                  adjustedStart = fiscalStartDate;
                                }

                                const newDivisions = [...divisions];
                                newDivisions[index] = [
                                  adjustedStart,
                                  adjustedEnd,
                                ];
                                form.setFieldsValue({
                                  [`range${index}`]: [
                                    adjustedStart,
                                    adjustedEnd,
                                  ],
                                });

                                setDivisions(newDivisions);
                              }
                            }}
                            disabledDate={(currentDate) => {
                              const fiscalEndDate = selectedFiscalYear?.endDate
                                ? dayjs(selectedFiscalYear.endDate)
                                : null;
                              const fiscalStartDate =
                                selectedFiscalYear?.startDate
                                  ? dayjs(selectedFiscalYear.startDate)
                                  : null;

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

                              return false;
                            }}
                          />
                        </Form.Item>
                        {/* <Form.Item
                        name={`monthId${index}`}
                        data-cy={`payroll-payperiod-sidebar-division-monthid-formitem-${index}`}
                        label="Pay Period month"
                        rules={[
                          {
                            required: true,
                            message: 'Please select pay period month',
                          },
                        ]}
                      >
                        <Select
                          data-cy={`payroll-payperiod-sidebar-division-monthid-select-${index}`}
                          placeholder="Select a month"
                          style={{ width: 200 }}
                          onChange={(value) => handleMonthSelect(value, index)}
                        >
                          {(() => {
                            const suitableMonths =
                              monthsWithStartEndDates ?? [];
                            return suitableMonths.map((month) => (
                              <Option
                                data-cy={`payroll-payperiod-sidebar-division-monthid-option-${month.id}`}
                                key={month.id}
                                value={month.id}
                              >
                                {`${month?.monthName}`}
                              </Option>
                            ));
                          })()}
                        </Select>
                      </Form.Item> */}
                      </div>
                      <div
                        id={`payroll-payperiod-sidebar-division-footer-${index}`}
                        data-cy={`payroll-payperiod-sidebar-division-footer-${index}`}
                        className="flex flex-row justify-between items-center mt-2"
                      >
                        <p
                          id={`payroll-payperiod-sidebar-division-footer-text-${index}`}
                          data-cy={`payroll-payperiod-sidebar-division-footer-text-${index}`}
                          className="text-sm text-gray-500"
                        >
                          {dayjs(range[0]).format('MMMM D, YYYY')} -{' '}
                          {dayjs(range[1]).format('MMMM D, YYYY')}
                        </p>
                        {index === divisions.length - 1 && (
                          <Popover
                            data-cy={`payroll-payperiod-sidebar-division-footer-popover-${index}`}
                            content={
                              <span data-cy="settings-pay-period-components-payperiodsidebar-tsx-payperiodsidebar-span-756">{`${dayjs(range[0]).format('MMMM D, YYYY')} - ${dayjs(range[1]).format('MMMM D, YYYY')}`}</span>
                            }
                            title="Delete Pay Period Range"
                            trigger="hover"
                            placement="left"
                          >
                            <Button
                              data-cy={`payroll-payperiod-sidebar-division-footer-button-${index}`}
                              type="primary"
                              size="small"
                              icon={
                                <DeleteOutlined
                                  data-cy={`payroll-payperiod-sidebar-division-footer-button-icon-${index}`}
                                />
                              }
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
        </div>
      </div>
      {/* Footer */}
      <div
        id="payroll-payperiod-sidebar-modal-footer"
        data-cy="payroll-payperiod-sidebar-modal-footer"
        className="flex w-full items-center justify-end gap-3 bg-white px-6 pb-6 pt-4"
      >
        {footerModalItems.map((item) => (
          <Button
            key={item.key}
            id={
              item.key === 'create'
                ? 'payroll-payperiod-sidebar-create-button'
                : 'payroll-payperiod-sidebar-cancel-button'
            }
            data-cy={item.dataCy}
            type={item.type}
            className={item.className}
            loading={item.loading}
            onClick={item.onClick}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </Modal>
  );
};

export default PayPeriodSideBar;
