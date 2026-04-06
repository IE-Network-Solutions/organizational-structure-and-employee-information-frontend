'use client';
// import CustomDrawerFooterButton, {
//   CustomDrawerFooterButtonProps,
// } from '@/components/common/customDrawer/customDrawerFooterButton';
// import CustomDrawerLayout from '@/components/common/customDrawer';
// import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Form, Select, Spin, DatePicker, Button, Modal, Radio } from 'antd';
import { CalendarOutlined, CloseOutlined } from '@ant-design/icons';
import { IoIosArrowBack } from 'react-icons/io';
import { useIsMobile } from '@/hooks/useIsMobile';
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

const PayPeriodSideBar = () => {
  const { isMobile } = useIsMobile();
  const [form] = Form.useForm();
  const [step, setStep] = useState<1 | 2>(1);
  const [divisionErrors, setDivisionErrors] = useState<Record<number, string>>(
    {},
  );

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
      const errorMap: Record<number, string> = {};
      //eslint-disable-next-line
      divisions.forEach((_unused, index) => {
        const fieldErrors = errors.filter((err) =>
          err.includes(`Pay period ${index + 1}`),
        );
        if (fieldErrors.length > 0) {
          errorMap[index] = fieldErrors[0];
        }
      });
      setDivisionErrors(errorMap);
      return;
    }
    setDivisionErrors({});

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

  // const handleDeleteDivision = (index: number) => {
  //   const updatedDivisions = divisions.filter((unused, i) => i !== index);
  //   setDivisions(updatedDivisions);
  // };

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
    setStep(1);
    setDivisionErrors({});
  };

  const handleContinue = () => {
    form.validateFields(['fiscalYear', 'payPeriodMode']).then(() => {
      setStep(2);
    });
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

  // const footerModalItems = [
  //   {
  //     label: 'Cancel',
  //     key: 'cancel',
  //     dataCy: 'payroll-payperiod-sidebar-cancel-button',
  //     className:
  //       'h-8 rounded-md border border-gray-300 bg-white px-4 text-sm font-normal text-gray-700 hover:bg-gray-50',
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
  //     dataCy: 'payroll-payperiod-sidebar-create-button',
  //     className: 'h-8 rounded-md px-4 text-sm font-normal',
  //     type: 'primary' as const,
  //     loading: createPayPeriodsLoading,
  //     onClick: () => form.submit(),
  //   },
  // ];

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

  const handleDivisionDateChange = (
    index: number,
    start: dayjs.Dayjs,
    rawEnd: dayjs.Dayjs,
  ) => {
    const rules = getSpanRulesForMode(payPeriodMode);
    const minAllowedEnd = start.add(rules.min - 1, 'day');
    const maxAllowedEnd = start.add(rules.max - 1, 'day');
    let end = rawEnd;

    const fiscalEndDate = activeFiscalYear?.endDate
      ? dayjs(activeFiscalYear.endDate)
      : null;
    const nextRangeLimit =
      index + 1 < divisions.length
        ? dayjs(divisions[index + 1][1]).subtract(1, 'day')
        : null;

    if (payPeriodMode === 'Weekly' || payPeriodMode === 'Bi-weekly') {
      let effectiveMaxEnd = maxAllowedEnd;
      if (fiscalEndDate && fiscalEndDate.isBefore(effectiveMaxEnd))
        effectiveMaxEnd = fiscalEndDate;
      if (nextRangeLimit && nextRangeLimit.isBefore(effectiveMaxEnd))
        effectiveMaxEnd = nextRangeLimit;

      if (end.isBefore(minAllowedEnd)) end = minAllowedEnd;
      if (end.isAfter(effectiveMaxEnd)) end = effectiveMaxEnd;
      if (end.isAfter(maxAllowedEnd)) end = maxAllowedEnd;

      const newDivisions = [...divisions];
      newDivisions[index] = [start, end];
      form.setFieldsValue({ [`range${index}`]: [start, end] });

      if (index + 1 < newDivisions.length) {
        const nextStart = dayjs(newDivisions[index + 1][1]);
        if (dayjs(end).isBefore(nextStart)) {
          newDivisions[index + 1][0] = dayjs(end).add(1, 'day');
          const nextRules = getSpanRulesForMode(payPeriodMode);
          const nextStartDate = dayjs(end).add(1, 'day');
          const nextMaxAllowedEnd = nextStartDate.add(nextRules.max - 1, 'day');
          const nextEndDate = dayjs(newDivisions[index + 1][1]);
          if (nextEndDate.isAfter(nextMaxAllowedEnd)) {
            newDivisions[index + 1][1] = nextMaxAllowedEnd;
          }
        }
      }

      if (index - 1 >= 0) {
        const prevStart = dayjs(newDivisions[index - 1][0]);
        const prevEnd = dayjs(newDivisions[index - 1][1]);
        if (dayjs(start).isAfter(prevEnd)) {
          const newPrevEnd = dayjs(start).subtract(1, 'day');
          const prevRules = getSpanRulesForMode(payPeriodMode);
          const prevMinAllowedEnd = prevStart.add(prevRules.min - 1, 'day');
          const prevMaxAllowedEnd = prevStart.add(prevRules.max - 1, 'day');

          if (newPrevEnd.isBefore(prevMinAllowedEnd)) {
            newDivisions[index][0] = prevEnd.add(1, 'day');
            const newStart = prevEnd.add(1, 'day');
            const newMinAllowedEnd = newStart.add(rules.min - 1, 'day');
            const newMaxAllowedEnd = newStart.add(rules.max - 1, 'day');
            let newEnd = end;
            if (newEnd.isBefore(newMinAllowedEnd)) newEnd = newMinAllowedEnd;
            if (newEnd.isAfter(newMaxAllowedEnd)) newEnd = newMaxAllowedEnd;
            newDivisions[index][1] = newEnd;
            form.setFieldsValue({
              [`range${index}`]: [newStart, newEnd],
            });
          } else {
            const adjustedPrevEnd = newPrevEnd.isAfter(prevMaxAllowedEnd)
              ? prevMaxAllowedEnd
              : newPrevEnd;
            newDivisions[index - 1][1] = adjustedPrevEnd;
            form.setFieldsValue({
              [`range${index - 1}`]: [prevStart, adjustedPrevEnd],
            });
          }
        }
      }

      setDivisions(newDivisions);
    } else if (payPeriodMode === 'Monthly') {
      const fiscalEndDateM = selectedFiscalYear?.endDate
        ? dayjs(selectedFiscalYear.endDate)
        : null;
      const fiscalStartDateM = selectedFiscalYear?.startDate
        ? dayjs(selectedFiscalYear.startDate)
        : null;

      let adjustedStart = start;
      let adjustedEnd = end;

      if (fiscalEndDateM && adjustedEnd.isAfter(fiscalEndDateM))
        adjustedEnd = fiscalEndDateM;
      if (fiscalStartDateM && adjustedStart.isBefore(fiscalStartDateM))
        adjustedStart = fiscalStartDateM;

      const newDivisions = [...divisions];
      newDivisions[index] = [adjustedStart, adjustedEnd];
      form.setFieldsValue({
        [`range${index}`]: [adjustedStart, adjustedEnd],
      });
      setDivisions(newDivisions);
    }
  };

  const disabledDate = (currentDate: dayjs.Dayjs) => {
    const fiscalEndDate = selectedFiscalYear?.endDate
      ? dayjs(selectedFiscalYear.endDate)
      : null;
    const fiscalStartDate = selectedFiscalYear?.startDate
      ? dayjs(selectedFiscalYear.startDate)
      : null;
    if (fiscalEndDate && currentDate.isAfter(fiscalEndDate)) return true;
    if (fiscalStartDate && currentDate.isBefore(fiscalStartDate)) return true;
    return false;
  };

  const modalTitle = (
    <div
      className="flex min-h-10 w-full items-center justify-between"
      data-cy="payroll-payperiod-sidebar-modal-title-row"
    >
      <div
        className="flex min-w-0 flex-1 items-center gap-3"
        data-cy="payroll-payperiod-sidebar-modal-title-left"
      >
        {step === 2 ? (
          <button
            id="payroll-payperiod-sidebar-modal-back-click-button"
            data-cy="payroll-payperiod-sidebar-modal-back-click-button"
            type="button"
            onClick={() => setStep(1)}
            className="m-[-4px] inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md p-0 text-gray-700 hover:bg-gray-100"
            aria-label="Back"
          >
            <IoIosArrowBack className="h-5 w-5 shrink-0" />
          </button>
        ) : (
          <span
            className="w-8 shrink-0"
            aria-hidden
            data-cy="payroll-payperiod-sidebar-modal-back-spacer"
          />
        )}
        <h1
          id="payroll-payperiod-sidebar-header-title"
          data-cy="payroll-payperiod-sidebar-header-title"
          className="m-0 flex-1 text-center text-base font-bold text-gray-800"
        >
          {step === 1 ? 'Create Pay Periods' : 'Edit Pay Period'}
        </h1>
      </div>
      <button
        id="payroll-payperiod-sidebar-modal-close-click-button"
        data-cy="payroll-payperiod-sidebar-modal-close-click-button"
        type="button"
        onClick={onClose}
        className="m-[-4px] mr-[-4px] inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md p-0 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        aria-label="Close modal"
      >
        <CloseOutlined
          id="payroll-payperiod-sidebar-modal-close-icon"
          data-cy="payroll-payperiod-sidebar-modal-close-icon"
          style={{ fontSize: 16, color: '#262626' }}
        />
      </button>
    </div>
  );

  return (
    <Modal
      data-cy="payroll-payperiod-sidebar-modal"
      title={modalTitle}
      open={isPayPeriodSidebarVisible}
      onCancel={onClose}
      footer={null}
      centered
      width={isMobile ? '95%' : 640}
      destroyOnClose
      mask
      maskClosable={false}
      closable={false}
      zIndex={10002}
      style={{ maxWidth: 'calc(100vw - 32px)' }}
      rootClassName="[&_.ant-modal-content]:!rounded-xl [&_.ant-modal-content]:!overflow-hidden [&_.ant-modal-title]:!block [&_.ant-modal-title]:!w-full [&_.ant-form-item-label>label]:!font-normal [&_.ant-form-item-label>label]:text-[#262626] max-sm:[&_.ant-modal-body]:[-ms-overflow-style:none] max-sm:[&_.ant-modal-body]:[scrollbar-width:none] max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!hidden max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!w-0 max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!h-0"
      classNames={{
        body: 'hide-scrollbar',
      }}
      styles={{
        content: { borderRadius: 12 },
        header: {
          borderBottom: 'none',
          marginBottom: 16,
          paddingLeft: 24,
          paddingRight: 24,
        },
        body: {
          padding: '0 24px 24px',
          maxHeight: 'calc(100vh - 240px)',
          overflowY: 'auto',
        },
      }}
    >
      <div
        id="payroll-payperiod-sidebar-modal-body-view-container"
        data-cy="payroll-payperiod-sidebar-modal-body-view-container"
        className="bg-white"
      >
        <div
          id="payroll-payperiod-sidebar-modal-card-view-container"
          data-cy="payroll-payperiod-sidebar-modal-card-view-container"
          className="pt-0"
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
              {step === 1 && (
                <>
                  <Form.Item
                    id="payroll-payperiod-sidebar-fiscalyear-formitem"
                    data-cy="payroll-payperiod-sidebar-fiscalyear-formitem"
                    name="fiscalYear"
                    label="Fiscal Year"
                    rules={[
                      {
                        required: true,
                        message: 'Please select a fiscal year',
                      },
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
                              ? 'border-primary'
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
                </>
              )}

              {step === 2 && divisions.length > 0 && (
                <div
                  id="payroll-payperiod-sidebar-divisions-container"
                  data-cy="payroll-payperiod-sidebar-divisions-container"
                  className="rounded-lg border border-gray-200 p-4 space-y-2"
                >
                  {divisions.map((range, index) => (
                    <div
                      id={`payroll-payperiod-sidebar-division-${index}`}
                      data-cy={`payroll-payperiod-sidebar-division-${index}`}
                      key={index}
                      className="flex flex-col gap-1"
                    >
                      <div
                        className="flex items-center gap-2"
                        data-cy={`payroll-payperiod-sidebar-division-${index}`}
                      >
                        <span
                          className="w-[190px] shrink-0 rounded border border-gray-300 bg-gray-50 px-2.5 py-2 text-xs text-gray-700 text-center whitespace-nowrap"
                          data-cy={`payroll-payperiod-sidebar-division-label-${index}`}
                        >
                          {dayjs(range[0]).format('MMM D,YYYY')} -{' '}
                          {dayjs(range[1]).format('MMM D,YYYY')}
                        </span>

                        <div
                          className={`flex flex-1 items-center rounded-md border bg-white h-9 min-w-0 ${divisionErrors[index] ? 'border-red-500' : 'border-gray-300'}`}
                          data-cy={`payroll-payperiod-sidebar-division-range-${index}`}
                        >
                          <DatePicker
                            data-cy={`payroll-payperiod-sidebar-division-start-${index}`}
                            value={dayjs(range[0])}
                            format="YYYY-MM-DD"
                            className="h-full flex-1 min-w-0 !border-0 !shadow-none !rounded-none !rounded-l-md [&_.ant-picker-input>input]:text-center"
                            suffixIcon={null}
                            allowClear={false}
                            disabledDate={disabledDate}
                            onChange={(date) => {
                              if (!date) return;
                              handleDivisionDateChange(
                                index,
                                date,
                                dayjs(range[1]),
                              );
                              setDivisionErrors((prev) => {
                                const next = { ...prev };
                                delete next[index];
                                return next;
                              });
                            }}
                          />
                          <span
                            className="shrink-0 px-1 text-gray-400 text-sm select-none"
                            data-cy={`payroll-payperiod-sidebar-division-arrow-${index}`}
                          >
                            →
                          </span>
                          <DatePicker
                            data-cy={`payroll-payperiod-sidebar-division-end-${index}`}
                            value={dayjs(range[1])}
                            format="YYYY-MM-DD"
                            className="h-full flex-1 min-w-0 !border-0 !shadow-none !rounded-none [&_.ant-picker-input>input]:text-center"
                            suffixIcon={null}
                            allowClear={false}
                            disabledDate={disabledDate}
                            onChange={(date) => {
                              if (!date) return;
                              handleDivisionDateChange(
                                index,
                                dayjs(range[0]),
                                date,
                              );
                              setDivisionErrors((prev) => {
                                const next = { ...prev };
                                delete next[index];
                                return next;
                              });
                            }}
                          />
                          <span
                            className="shrink-0 pr-2.5 text-gray-400 flex items-center"
                            data-cy={`payroll-payperiod-sidebar-division-calendar-${index}`}
                          >
                            <CalendarOutlined style={{ fontSize: 14 }} />
                          </span>
                        </div>
                      </div>
                      {divisionErrors[index] && (
                        <span
                          className="pl-[198px] text-xs text-red-500"
                          data-cy={`payroll-payperiod-sidebar-division-error-${index}`}
                        >
                          {divisionErrors[index]}
                        </span>
                      )}
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
        className="flex w-full items-center justify-end gap-3 bg-white pb-6 pt-4"
      >
        {step === 1 ? (
          <>
            <Button
              id="payroll-payperiod-sidebar-cancel-button"
              data-cy="payroll-payperiod-sidebar-cancel-button"
              className="h-8 rounded-md border border-gray-300 bg-white px-4 text-sm font-normal text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              id="payroll-payperiod-sidebar-continue-button"
              data-cy="payroll-payperiod-sidebar-continue-button"
              type="primary"
              className="h-8 rounded-md px-4 text-sm font-normal"
              disabled={!selectedFiscalYear || !payPeriodMode}
              onClick={handleContinue}
            >
              Continue
            </Button>
          </>
        ) : (
          <>
            <Button
              id="payroll-payperiod-sidebar-cancel-button-step2"
              data-cy="payroll-payperiod-sidebar-cancel-button-step2"
              className="h-8 rounded-md border border-gray-300 bg-white px-4 text-sm font-normal text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              id="payroll-payperiod-sidebar-continue-button-step2"
              data-cy="payroll-payperiod-sidebar-continue-button-step2"
              type="primary"
              className="h-8 rounded-md px-4 text-sm font-normal"
              loading={createPayPeriodsLoading}
              onClick={() => form.submit()}
            >
              Continue
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default PayPeriodSideBar;
