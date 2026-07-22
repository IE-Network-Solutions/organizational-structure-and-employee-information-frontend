import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import { Button, Col, DatePicker, Form, Input, Row } from 'antd';
import { FormInstance } from 'antd/lib';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { useIsMobile } from '@/hooks/useIsMobile';

const { RangePicker } = DatePicker;

interface DrawerProps {
  form: FormInstance<any> | undefined;
  isCreateLoading: boolean;
  isUpdateLoading: boolean;
  // onNextStep: any;
  isFiscalYear?: boolean;
  open: boolean; // <-- add this
}
/* eslint-disable-next-line @typescript-eslint/naming-convention */
const classifyMonths = (
  startMonth: number,
  endMonth: number,
  calendarType: string,
) => {
  /* eslint-disable-next-line @typescript-eslint/naming-convention */
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  /* eslint-enable @typescript-eslint/naming-convention */

  const sections: { [key: number]: number[] } = {};

  let sectionSize = 12;
  if (calendarType === 'Quarter') sectionSize = 3;
  else if (calendarType === 'Semester') sectionSize = 6;
  else sectionSize = 12;

  months.forEach((month, index) => {
    const section = Math.floor(index / sectionSize) + 1;
    if (!sections[section]) sections[section] = [];
    sections[section].push(month);
  });

  return sections;
};
/* eslint-enable @typescript-eslint/naming-convention */

const MonthDrawer: React.FC<
  DrawerProps & { onSubmit: (values: any) => void }
> = ({
  form,
  isCreateLoading,
  isUpdateLoading,
  // onNextStep,
  onSubmit, // <-- destructure this
  open, // <-- add this
}) => {
  const { isMobile } = useIsMobile();
  const {
    setCurrent,
    fiscalYearStart,
    fiscalYearEnd,
    calendarType,
    isEditMode,
    selectedFiscalYear,
    setMonthRangeFormValues,
    monthRangeValues,
    sessionData,
  } = useFiscalYearDrawerStore();

  // State to track expanded session (only one can be expanded at a time)
  const [expandedSession, setExpandedSession] = useState<number | null>(null);

  // State to store calculated month data grouped by session
  const [monthDataBySession, setMonthDataBySession] = useState<
    Record<
      number,
      Array<{
        monthNumber: number;
        monthName: string;
        startDate: any;
        endDate: any;
      }>
    >
  >({});

  const lastProcessedMonthConfigRef = useRef<{
    start: string | null;
    end: string | null;
    calendarType: string | null;
  }>({ start: null, end: null, calendarType: null });

  const getOriginalCalendarType = () => {
    const sessionCount = selectedFiscalYear?.sessions?.length;
    if (sessionCount === 4) return 'Quarter';
    if (sessionCount === 2) return 'Semester';
    if (sessionCount === 1) return 'Year';
    return '';
  };

  const getMonthStartEndDates = (month: number) => {
    if (!fiscalYearStart || !fiscalYearEnd) {
      return { startDate: null, endDate: null };
    }

    const fiscalYearStartDate = dayjs(fiscalYearStart);
    const fiscalYearEndDate = dayjs(fiscalYearEnd);

    // Calculate total days in fiscal year
    const totalDays = fiscalYearEndDate.diff(fiscalYearStartDate, 'day') + 1;
    const daysPerMonth = Math.floor(totalDays / 12);

    // Calculate start date for this month
    const startDate = fiscalYearStartDate.add(
      (month - 1) * daysPerMonth,
      'day',
    );

    // Calculate end date for this month
    let endDate;
    if (month === 12) {
      // Last month ends at fiscal year end
      endDate = fiscalYearEndDate;
    } else {
      // Other months end at start of next month minus 1 day
      endDate = fiscalYearStartDate
        .add(month * daysPerMonth, 'day')
        .subtract(1, 'day');
    }

    // Ensure dates don't exceed fiscal year boundaries
    const finalStartDate = startDate.isBefore(fiscalYearStartDate)
      ? fiscalYearStartDate
      : startDate;
    const finalEndDate = endDate.isAfter(fiscalYearEndDate)
      ? fiscalYearEndDate
      : endDate;

    return { startDate: finalStartDate, endDate: finalEndDate };
  };

  const buildGeneratedMonthData = () => {
    if (!calendarType || !fiscalYearStart || !fiscalYearEnd) {
      return { sessionMonthData: {}, transformedData: [] as any[] };
    }

    const groupedMonths = classifyMonths(
      fiscalYearStart.toDate().getMonth() + 1,
      fiscalYearEnd.toDate().getMonth() + 1,
      calendarType,
    );

    const sessionMonthData: Record<
      number,
      Array<{
        monthNumber: number;
        monthName: string;
        startDate: any;
        endDate: any;
      }>
    > = {};

    Object.entries(groupedMonths).forEach(([section, months]) => {
      const sessionIndex = Number(section) - 1;
      sessionMonthData[sessionIndex] =
        months?.map((month, index) => ({
          monthNumber: month,
          monthName: `Month ${index + 1}`,
          startDate: getMonthStartEndDates(month).startDate,
          endDate: getMonthStartEndDates(month).endDate,
        })) || [];
    });

    const transformedData = Object.values(sessionMonthData)
      .flat()
      .map((month) => ({
        monthNumber: month.monthNumber,
        monthName: month.monthName,
        monthStartDate: month.startDate,
        monthEndDate: month.endDate,
        monthDescription: '',
      }));

    return { sessionMonthData, transformedData };
  };

  const buildMonthDataFromSelectedFiscalYear = () => {
    const sessions = selectedFiscalYear?.sessions || [];
    const sessionMonthData: Record<
      number,
      Array<{
        monthNumber: number;
        monthName: string;
        startDate: any;
        endDate: any;
      }>
    > = {};
    const transformedData: any[] = [];
    let monthCounter = 1;

    sessions.forEach((session: any, sessionIndex: number) => {
      const months = Array.isArray(session?.months) ? session.months : [];
      sessionMonthData[sessionIndex] = months.map((month: any) => {
        const monthNumber = monthCounter++;
        const startDate = month.startDate ? dayjs(month.startDate) : null;
        const endDate = month.endDate ? dayjs(month.endDate) : null;
        transformedData.push({
          monthNumber,
          monthName: month.name || `Month ${monthNumber}`,
          monthStartDate: startDate,
          monthEndDate: endDate,
          monthDescription: month.description || '',
        });
        return {
          monthNumber,
          monthName: month.name || `Month ${monthNumber}`,
          startDate,
          endDate,
        };
      });
    });

    return { sessionMonthData, transformedData };
  };

  const applyMonthFieldsToForm = (
    transformedData: any[],
    sessionMonthData: Record<number, any[]>,
  ) => {
    setMonthDataBySession(sessionMonthData);
    setMonthRangeFormValues(transformedData);

    if (Object.keys(sessionMonthData).length > 0 && expandedSession === null) {
      setExpandedSession(0);
    }

    if (!form) return;

    const fieldsToUpdate: { [key: string]: any } = {};
    transformedData.forEach((month) => {
      fieldsToUpdate[`monthName_${month.monthNumber}`] = month.monthName;
      fieldsToUpdate[`monthStartDate_${month.monthNumber}`] =
        month.monthStartDate;
      fieldsToUpdate[`monthEndDate_${month.monthNumber}`] = month.monthEndDate;
      fieldsToUpdate[`monthDescription_${month.monthNumber}`] =
        month.monthDescription || '';
      if (month.monthStartDate && month.monthEndDate) {
        fieldsToUpdate[`monthDateRange_${month.monthNumber}`] = [
          dayjs(month.monthStartDate),
          dayjs(month.monthEndDate),
        ];
      }
    });
    form.setFieldsValue(fieldsToUpdate);
  };

  const initializedRef = useRef(false);

  // Initialize / refresh month data when drawer opens or structure changes
  useEffect(() => {
    const readyToInitialize =
      open && calendarType && fiscalYearStart && fiscalYearEnd && form;

    if (!open) {
      initializedRef.current = false;
      lastProcessedMonthConfigRef.current = {
        start: null,
        end: null,
        calendarType: null,
      };
      return;
    }

    if (!readyToInitialize) return;

    const currentStart = dayjs(fiscalYearStart).format('YYYY-MM-DD');
    const currentEnd = dayjs(fiscalYearEnd).format('YYYY-MM-DD');
    const isFirstInit = !initializedRef.current;
    const hasPriorConfig =
      lastProcessedMonthConfigRef.current.calendarType !== null;
    const configChanged =
      hasPriorConfig &&
      (lastProcessedMonthConfigRef.current.calendarType !== calendarType ||
        lastProcessedMonthConfigRef.current.start !== currentStart ||
        lastProcessedMonthConfigRef.current.end !== currentEnd);

    if (!isFirstInit && !configChanged) return;

    initializedRef.current = true;
    lastProcessedMonthConfigRef.current = {
      start: currentStart,
      end: currentEnd,
      calendarType,
    };

    const originalCalendarType = getOriginalCalendarType();
    const structureMatchesOriginal =
      isEditMode &&
      !!originalCalendarType &&
      calendarType === originalCalendarType;
    const storedMonths = Array.isArray(monthRangeValues)
      ? monthRangeValues
      : [];

    // Prefer already-edited month values when remounting same structure
    if (isFirstInit && storedMonths.length === 12 && !configChanged) {
      const sessionMonthData: Record<number, any[]> = {};
      const monthsPerSession =
        calendarType === 'Quarter' ? 3 : calendarType === 'Semester' ? 6 : 12;
      storedMonths.forEach((month: any, index: number) => {
        const sessionIndex = Math.floor(index / monthsPerSession);
        if (!sessionMonthData[sessionIndex])
          sessionMonthData[sessionIndex] = [];
        sessionMonthData[sessionIndex].push({
          monthNumber: month.monthNumber,
          monthName: month.monthName,
          startDate: month.monthStartDate,
          endDate: month.monthEndDate,
        });
      });
      applyMonthFieldsToForm(storedMonths, sessionMonthData);
      return;
    }

    if (
      isFirstInit &&
      structureMatchesOriginal &&
      selectedFiscalYear?.sessions?.length
    ) {
      const { sessionMonthData, transformedData } =
        buildMonthDataFromSelectedFiscalYear();
      if (transformedData.length > 0) {
        applyMonthFieldsToForm(transformedData, sessionMonthData);
        return;
      }
    }

    const { sessionMonthData, transformedData } = buildGeneratedMonthData();
    if (transformedData.length > 0) {
      applyMonthFieldsToForm(transformedData, sessionMonthData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, calendarType, fiscalYearStart, fiscalYearEnd, form, isEditMode]);

  // Keep form fields in sync when monthRangeValues change from initialization only
  // (avoid re-applying on every keystroke by skipping when form already has matching names)
  useEffect(() => {
    if (
      !form ||
      !Array.isArray(monthRangeValues) ||
      monthRangeValues.length === 0
    ) {
      return;
    }
    const currentFormValues = form.getFieldsValue(true);
    const needsSync = monthRangeValues.some((month) => {
      const key = month.monthNumber;
      const formName = currentFormValues[`monthName_${key}`];
      return formName === undefined || formName === null || formName === '';
    });
    if (!needsSync) return;

    const fieldsToUpdate: Record<string, any> = {};
    monthRangeValues.forEach((month) => {
      const key = month.monthNumber;
      fieldsToUpdate[`monthName_${key}`] = month.monthName;
      fieldsToUpdate[`monthStartDate_${key}`] = month.monthStartDate;
      fieldsToUpdate[`monthEndDate_${key}`] = month.monthEndDate;
      fieldsToUpdate[`monthDescription_${key}`] = month.monthDescription;
      if (month.monthStartDate && month.monthEndDate) {
        fieldsToUpdate[`monthDateRange_${key}`] = [
          dayjs(month.monthStartDate),
          dayjs(month.monthEndDate),
        ];
      }
    });
    form.setFieldsValue(fieldsToUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, monthRangeValues]);

  const validateStartNoOverlap = (
    currentMonthNumber: number,
    form: FormInstance,
  ) => {
    return async (nonused: any, value: any) => {
      if (!value) return;
      const allMonthNumbers = Array.from({ length: 12 }, (nonused, i) => i + 1);
      const currentStart = dayjs(value);
      const currentEndRaw = form.getFieldValue(
        `monthEndDate_${currentMonthNumber}`,
      );
      if (!currentEndRaw) return;

      for (const monthNum of allMonthNumbers) {
        if (monthNum === currentMonthNumber) continue;
        const otherStartRaw = form.getFieldValue(`monthStartDate_${monthNum}`);
        const otherEndRaw = form.getFieldValue(`monthEndDate_${monthNum}`);
        if (!otherStartRaw || !otherEndRaw) continue;
        const otherStart = dayjs(otherStartRaw);
        const otherEnd = dayjs(otherEndRaw);

        // Check if current start date overlaps with other month's range
        const currentStartOverlapsOther =
          currentStart.isSameOrAfter(otherStart) &&
          currentStart.isSameOrBefore(otherEnd);

        if (currentStartOverlapsOther) {
          throw new Error(
            `Start date overlaps with Month ${monthNum} (${otherStart.format('MMM DD')} - ${otherEnd.format('MMM DD')}). Please adjust the start date.`,
          );
        }
      }
    };
  };

  const validateEndNoOverlap = (
    currentMonthNumber: number,
    form: FormInstance,
  ) => {
    return async (nonused: any, value: any) => {
      if (!value) return;
      const allMonthNumbers = Array.from({ length: 12 }, (nonused, i) => i + 1);
      const currentStartRaw = form.getFieldValue(
        `monthStartDate_${currentMonthNumber}`,
      );
      if (!currentStartRaw) return;
      const currentEnd = dayjs(value);

      for (const monthNum of allMonthNumbers) {
        if (monthNum === currentMonthNumber) continue;
        const otherStartRaw = form.getFieldValue(`monthStartDate_${monthNum}`);
        const otherEndRaw = form.getFieldValue(`monthEndDate_${monthNum}`);
        if (!otherStartRaw || !otherEndRaw) continue;
        const otherStart = dayjs(otherStartRaw);
        const otherEnd = dayjs(otherEndRaw);

        // Check if current end date overlaps with other month's range
        const currentEndOverlapsOther =
          currentEnd.isSameOrAfter(otherStart) &&
          currentEnd.isSameOrBefore(otherEnd);

        if (currentEndOverlapsOther) {
          throw new Error(
            `End date overlaps with Month ${monthNum} (${otherStart.format('MMM DD')} - ${otherEnd.format('MMM DD')}). Please adjust the end date.`,
          );
        }
      }
    };
  };

  // Helper function to clear validation errors on potentially affected fields
  const clearRelatedValidationErrors = (changedMonthNumber: number) => {
    if (!form) return;

    const allMonthNumbers = Array.from({ length: 12 }, (nonused, i) => i + 1);

    // Clear validation errors on all other months' date fields
    allMonthNumbers.forEach((monthNum) => {
      if (monthNum !== changedMonthNumber) {
        form.setFields([
          {
            name: `monthStartDate_${monthNum}`,
            errors: [],
          },
          {
            name: `monthEndDate_${monthNum}`,
            errors: [],
          },
        ]);
      }
    });
  };

  const toggleSession = (sessionIndex: number) => {
    setExpandedSession((prev) => (prev === sessionIndex ? null : sessionIndex));
  };

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark={(label, { required }) => (
        <>
          <span data-cy="org-settings-fiscal-year-month-drawer-form-label">
            {label}
          </span>
          {required && (
            <span
              className="text-red-500 ml-1"
              data-cy="org-settings-fiscal-year-month-drawer-form-required-astrix"
            >
              *
            </span>
          )}
        </>
      )}
      onFinish={(values) => {
        // Ensure date ranges are synced to separate date fields before submission
        Object.keys(values).forEach((key) => {
          if (key.startsWith('monthDateRange_')) {
            const monthNumber = key.replace('monthDateRange_', '');
            const dateRange = values[key];
            if (
              dateRange &&
              Array.isArray(dateRange) &&
              dateRange.length === 2
            ) {
              values[`monthStartDate_${monthNumber}`] = dateRange[0];
              values[`monthEndDate_${monthNumber}`] = dateRange[1];
            }
          }
        });

        // Merge with stored monthRangeValues so collapsed-session fields still persist
        const mergedValues = { ...values };
        if (Array.isArray(monthRangeValues)) {
          monthRangeValues.forEach((month: any) => {
            const key = month.monthNumber;
            if (
              mergedValues[`monthName_${key}`] === undefined ||
              mergedValues[`monthName_${key}`] === null ||
              mergedValues[`monthName_${key}`] === ''
            ) {
              mergedValues[`monthName_${key}`] = month.monthName;
            }
            if (!mergedValues[`monthStartDate_${key}`]) {
              mergedValues[`monthStartDate_${key}`] = month.monthStartDate;
            }
            if (!mergedValues[`monthEndDate_${key}`]) {
              mergedValues[`monthEndDate_${key}`] = month.monthEndDate;
            }
            if (mergedValues[`monthDescription_${key}`] === undefined) {
              mergedValues[`monthDescription_${key}`] =
                month.monthDescription || '';
            }
          });
        }

        // Persist latest form values into store for remounts / payload fallback
        const allMonths = Object.values(monthDataBySession).flat();
        setMonthRangeFormValues(
          allMonths.map((month) => ({
            monthNumber: month.monthNumber,
            monthName:
              mergedValues[`monthName_${month.monthNumber}`] || month.monthName,
            monthStartDate:
              mergedValues[`monthStartDate_${month.monthNumber}`] ||
              month.startDate,
            monthEndDate:
              mergedValues[`monthEndDate_${month.monthNumber}`] ||
              month.endDate,
            monthDescription:
              mergedValues[`monthDescription_${month.monthNumber}`] || '',
          })),
        );

        onSubmit(mergedValues);
      }}
      data-cy="org-settings-fiscal-year-month-drawer-form"
      id="org-settings-fiscal-year-month-drawer-form"
      className="px-0"
    >
      <div
        className="flex-1 bg-white p-0 items-center w-full h-full"
        data-cy="org-settings-fiscal-year-month-drawer-form-content"
        id="org-settings-fiscal-year-month-drawer-form-content"
      >
        {sessionData &&
          sessionData.length > 0 &&
          Object.keys(monthDataBySession).length > 0 && (
            <div
              className="space-y-2"
              data-cy="org-settings-fiscal-year-sessions-container"
            >
              {sessionData.map((session, sessionIndex) => {
                const sessionMonths = monthDataBySession[sessionIndex] || [];
                const isExpanded = expandedSession === sessionIndex;
                const sessionName =
                  session.sessionName ||
                  `FY${fiscalYearStart?.format('YYYY')}S${String(sessionIndex + 1).padStart(2, '0')}`;
                const sessionDateRange =
                  session.sessionDateRange ||
                  (session.sessionStartDate && session.sessionEndDate
                    ? [
                        dayjs(session.sessionStartDate),
                        dayjs(session.sessionEndDate),
                      ]
                    : null);

                return (
                  <div
                    key={sessionIndex}
                    className={`border rounded-lg px-4 py-3 ${
                      isExpanded ? 'border-primary' : 'border-gray-200'
                    }`}
                    data-cy={`org-settings-fiscal-year-session-${sessionIndex}`}
                  >
                    {/* Session Header */}
                    <div
                      className="flex items-center justify-between px-3 py-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleSession(sessionIndex)}
                      data-cy={`org-settings-fiscal-year-session-header-${sessionIndex}`}
                    >
                      <div
                        className="flex items-center gap-6 flex-1"
                        data-cy={`org-settings-fiscal-year-session-header-content-${sessionIndex}`}
                      >
                        <span
                          className="font-medium text-base"
                          data-cy={`org-settings-fiscal-year-session-name-${sessionIndex}`}
                        >
                          {sessionName}
                        </span>
                        {sessionDateRange &&
                        sessionDateRange[0] &&
                        sessionDateRange[1] ? (
                          <span
                            className="border border-primary rounded px-2 py-0.5 text-xs text-gray-700"
                            data-cy={`org-settings-fiscal-year-session-date-range-${sessionIndex}`}
                          >
                            {dayjs(sessionDateRange[0]).format('YYYY-MM-DD')} to{' '}
                            {dayjs(sessionDateRange[1]).format('YYYY-MM-DD')}
                          </span>
                        ) : null}
                      </div>
                      <div
                        className="flex items-center"
                        data-cy={`org-settings-fiscal-year-session-toggle-${sessionIndex}`}
                      >
                        {isExpanded ? (
                          <IoIosArrowUp
                            size={20}
                            className="text-gray-600"
                            data-cy={`org-settings-fiscal-year-session-arrow-up-${sessionIndex}`}
                          />
                        ) : (
                          <IoIosArrowDown
                            size={20}
                            className="text-gray-600"
                            data-cy={`org-settings-fiscal-year-session-arrow-down-${sessionIndex}`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Keep month fields mounted when collapsed so Ant Form still registers them */}
                    <div
                      className={`px-3 pb-4 space-y-4 ${
                        isExpanded ? '' : 'hidden'
                      }`}
                      data-cy={`org-settings-fiscal-year-session-months-${sessionIndex}`}
                    >
                      {sessionMonths.map((monthInfo) => (
                        <div
                          key={monthInfo.monthNumber}
                          data-cy={`org-settings-fiscal-year-month-${monthInfo.monthNumber}`}
                        >
                          <Row
                            gutter={16}
                            align="middle"
                            data-cy={`org-settings-fiscal-year-month-row-${monthInfo.monthNumber}`}
                          >
                            <Col
                              span={isMobile ? undefined : 10}
                              flex={isMobile ? 'auto' : undefined}
                              style={isMobile ? { minWidth: 0 } : undefined}
                              data-cy={`org-settings-fiscal-year-month-name-col-${monthInfo.monthNumber}`}
                            >
                              <Form.Item
                                data-cy={`org-settings-fiscal-year-month-name-${monthInfo.monthNumber}`}
                                id={`monthNameId_${monthInfo.monthNumber}`}
                                name={`monthName_${monthInfo.monthNumber}`}
                                rules={[
                                  {
                                    required: true,
                                    message: `Please input the month name!`,
                                  },
                                ]}
                                className="mb-0"
                              >
                                <Input
                                  size="middle"
                                  className="w-full text-sm h-8"
                                  placeholder={`Enter name for ${monthInfo.monthName}`}
                                  data-cy={`org-settings-fiscal-year-month-name-input-${monthInfo.monthNumber}`}
                                />
                              </Form.Item>
                            </Col>
                            <Col
                              span={isMobile ? undefined : 14}
                              flex={isMobile ? 'none' : undefined}
                              data-cy={`org-settings-fiscal-year-month-date-range-col-${monthInfo.monthNumber}`}
                            >
                              <Form.Item
                                data-cy={`org-settings-fiscal-year-month-date-range-${monthInfo.monthNumber}`}
                                name={`monthDateRange_${monthInfo.monthNumber}`}
                                validateTrigger="onChange"
                                getValueFromEvent={(value) => {
                                  if (
                                    !value ||
                                    !Array.isArray(value) ||
                                    value.length !== 2
                                  ) {
                                    return null;
                                  }
                                  // Update the separate start and end date fields for form submission
                                  if (form) {
                                    form.setFieldsValue({
                                      [`monthStartDate_${monthInfo.monthNumber}`]:
                                        value[0],
                                      [`monthEndDate_${monthInfo.monthNumber}`]:
                                        value[1],
                                    });
                                  }
                                  return value;
                                }}
                                normalize={(value) => {
                                  // If value is already a valid range array, return it
                                  if (
                                    value &&
                                    Array.isArray(value) &&
                                    value.length === 2 &&
                                    value[0] &&
                                    value[1]
                                  ) {
                                    return value;
                                  }
                                  // If value is null/undefined, try to get from separate date fields
                                  const startDate = form?.getFieldValue(
                                    `monthStartDate_${monthInfo.monthNumber}`,
                                  );
                                  const endDate = form?.getFieldValue(
                                    `monthEndDate_${monthInfo.monthNumber}`,
                                  );
                                  if (startDate && endDate) {
                                    return [dayjs(startDate), dayjs(endDate)];
                                  }
                                  // Fallback to monthInfo dates if available
                                  if (
                                    monthInfo.startDate &&
                                    monthInfo.endDate
                                  ) {
                                    return [
                                      dayjs(monthInfo.startDate),
                                      dayjs(monthInfo.endDate),
                                    ];
                                  }
                                  return value;
                                }}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please select the date range!',
                                  },
                                  {
                                    validator: async (nonused, value) => {
                                      if (
                                        !value ||
                                        !Array.isArray(value) ||
                                        value.length !== 2
                                      ) {
                                        return;
                                      }
                                      const [startDate, endDate] = value;

                                      // Validate start date
                                      const fiscalYearStartDate =
                                        dayjs(fiscalYearStart);
                                      if (
                                        dayjs(startDate).isBefore(
                                          fiscalYearStartDate,
                                        )
                                      ) {
                                        throw new Error(
                                          `Start date cannot be before fiscal year start (${fiscalYearStartDate.format('YYYY-MM-DD')})`,
                                        );
                                      }

                                      // Validate end date
                                      const fiscalYearEndDate =
                                        dayjs(fiscalYearEnd);
                                      if (
                                        dayjs(endDate).isAfter(
                                          fiscalYearEndDate,
                                        )
                                      ) {
                                        throw new Error(
                                          `End date cannot be after fiscal year end (${fiscalYearEndDate.format('YYYY-MM-DD')})`,
                                        );
                                      }

                                      // Validate start before end
                                      if (
                                        dayjs(startDate).isAfter(dayjs(endDate))
                                      ) {
                                        throw new Error(
                                          'Start date must be before end date',
                                        );
                                      }

                                      // Update separate fields for validation
                                      if (form) {
                                        form.setFieldsValue({
                                          [`monthStartDate_${monthInfo.monthNumber}`]:
                                            startDate,
                                          [`monthEndDate_${monthInfo.monthNumber}`]:
                                            endDate,
                                        });
                                      }
                                    },
                                  },
                                  ...(form
                                    ? [
                                        {
                                          validator: async (
                                            nonused: any,
                                            value: any,
                                          ) => {
                                            if (
                                              !value ||
                                              !Array.isArray(value) ||
                                              value.length !== 2
                                            ) {
                                              return;
                                            }
                                            const [startDate] = value;
                                            return validateStartNoOverlap(
                                              monthInfo.monthNumber,
                                              form,
                                            )(nonused, startDate);
                                          },
                                        },
                                        {
                                          validator: async (
                                            nonused: any,
                                            value: any,
                                          ) => {
                                            if (
                                              !value ||
                                              !Array.isArray(value) ||
                                              value.length !== 2
                                            ) {
                                              return;
                                            }
                                            const [, endDate] = value;
                                            return validateEndNoOverlap(
                                              monthInfo.monthNumber,
                                              form,
                                            )(nonused, endDate);
                                          },
                                        },
                                      ]
                                    : []),
                                ]}
                                className="mb-0"
                              >
                                <RangePicker
                                  className={
                                    isMobile
                                      ? 'h-10 w-11 min-w-11 px-0 justify-center [&_.ant-picker-input]:hidden [&_.ant-picker-range-separator]:hidden [&_.ant-picker-active-bar]:hidden [&_.ant-picker-suffix]:m-0'
                                      : 'w-full h-8 [&_.ant-picker-input]:h-8'
                                  }
                                  size="middle"
                                  disabledDate={(current) => {
                                    if (!current) return false;
                                    const fiscalYearStartDate =
                                      dayjs(fiscalYearStart);
                                    const fiscalYearEndDate =
                                      dayjs(fiscalYearEnd);
                                    return (
                                      current.isBefore(fiscalYearStartDate) ||
                                      current.isAfter(fiscalYearEndDate)
                                    );
                                  }}
                                  onChange={() => {
                                    clearRelatedValidationErrors(
                                      monthInfo.monthNumber,
                                    );
                                  }}
                                  data-cy={`org-settings-fiscal-year-month-date-range-input-${monthInfo.monthNumber}`}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        <Form.Item
          className="mb-0 mt-4"
          data-cy="org-settings-fiscal-year-month-previous-btn-form-item"
          id="org-settings-fiscal-year-month-previous-btn-form-item"
        >
          <div
            className={`flex justify-end w-full pt-2 pb-0  gap-3 shadow-none`}
            data-cy="org-settings-fiscal-year-month-previous-btn-container"
            id="org-settings-fiscal-year-month-previous-btn-container"
          >
            <Button
              type="default"
              onClick={async () => {
                // Persist current form values before going back so remount keeps edits
                const values = await form?.getFieldsValue(true);
                const allMonths = Object.values(monthDataBySession).flat();
                if (allMonths.length > 0 && values) {
                  setMonthRangeFormValues(
                    allMonths.map((month) => ({
                      monthNumber: month.monthNumber,
                      monthName:
                        values[`monthName_${month.monthNumber}`] ||
                        month.monthName,
                      monthStartDate:
                        values[`monthStartDate_${month.monthNumber}`] ||
                        month.startDate,
                      monthEndDate:
                        values[`monthEndDate_${month.monthNumber}`] ||
                        month.endDate,
                      monthDescription: '',
                    })),
                  );
                }
                setCurrent(1); // Go to previous step
              }}
              className="flex justify-center text-sm font-normal h-8 !min-h-[32px] px-6 border-gray-300 bg-transparent hover:bg-gray-50"
              data-cy="org-settings-fiscal-year-month-previous-btn"
              id="org-settings-fiscal-year-month-previous-btn"
            >
              Reset
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isCreateLoading || isUpdateLoading}
              className="flex justify-center text-sm font-normal h-8 !min-h-[32px] px-6 min-w-[100px]"
              data-cy="org-settings-fiscal-year-month-next-btn"
              id="org-settings-fiscal-year-month-next-btn"
            >
              Continue
            </Button>
          </div>
        </Form.Item>
      </div>
    </Form>
  );
};

export default MonthDrawer;
