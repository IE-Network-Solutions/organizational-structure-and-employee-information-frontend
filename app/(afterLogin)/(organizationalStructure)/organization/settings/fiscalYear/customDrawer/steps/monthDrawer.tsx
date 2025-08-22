import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import { Button, Col, DatePicker, Form, Input, Row, Spin } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { FormInstance } from 'antd/lib';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

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
  const {
    setCurrent,
    fiscalYearStart,
    fiscalYearEnd,
    calendarType,
    isEditMode,
    setMonthRangeFormValues,
    monthRangeValues,
  } = useFiscalYearDrawerStore();

  const { isMobile } = useIsMobile();

  // State to store calculated month data
  const [monthData, setMonthData] = useState<
    Array<{
      monthNumber: number;
      monthName: string;
      startDate: any;
      endDate: any;
    }>
  >([]);

  // Calculate month data function

  const calculateMonthData = () => {
    if (calendarType && fiscalYearStart && fiscalYearEnd) {
      const groupedMonths = classifyMonths(
        fiscalYearStart.toDate().getMonth() + 1,
        fiscalYearEnd.toDate().getMonth() + 1,
        calendarType,
      );

      const renderData = Object.entries(groupedMonths).flatMap(
        ([section, months]) =>
          months?.map((month, index) => ({
            monthNumber: month,
            monthName: generateMonthName(Number(section), index),
            startDate: getMonthStartEndDates(month).startDate,
            endDate: getMonthStartEndDates(month).endDate,
          })),
      );

      setMonthData(renderData);
      return renderData;
    }
    return [];
  };

  const generateMonthName = (section: number, index: number) => {
    if (calendarType === 'Quarter') {
      return `Month ${index + 1} (Q${section})`;
    } else if (calendarType === 'Semester') {
      return `Month ${index + 1} (S${section})`;
    } else {
      return `Month ${index + 1}`;
    }
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

  // Validation function for date ranges - user-friendly error messages

  const initializedRef = useRef(false);

  // Initial data calculation
  useEffect(() => {
    const readyToInitialize =
      open && calendarType && fiscalYearStart && fiscalYearEnd && form;

    if (readyToInitialize && !initializedRef.current) {
      initializedRef.current = true;

      const initialData = calculateMonthData();
      if (initialData.length > 0) {
        const transformedData = initialData.map((month) => ({
          monthNumber: month.monthNumber,
          monthName: month.monthName,
          monthStartDate: month.startDate,
          monthEndDate: month.endDate,
          monthDescription: '',
        }));

        setMonthRangeFormValues(transformedData);
        setMonthData(initialData);

        const fieldsToUpdate: { [key: string]: any } = {};
        transformedData.forEach((month) => {
          fieldsToUpdate[`monthName_${month.monthNumber}`] = month.monthName;
          fieldsToUpdate[`monthStartDate_${month.monthNumber}`] =
            month.monthStartDate;
          fieldsToUpdate[`monthEndDate_${month.monthNumber}`] =
            month.monthEndDate;
          fieldsToUpdate[`monthDescription_${month.monthNumber}`] = '';
        });
        form.setFieldsValue(fieldsToUpdate);
      }
    }

    if (!open) {
      initializedRef.current = false;
    }
  }, [open, calendarType, fiscalYearStart, fiscalYearEnd, form]);

  // Update data when fiscal year changes
  useEffect(() => {
    if (calendarType && fiscalYearStart && fiscalYearEnd) {
      const groupedMonths = classifyMonths(
        fiscalYearStart.toDate().getMonth() + 1,
        fiscalYearEnd.toDate().getMonth() + 1,
        calendarType,
      );
      const transformedData = Object.entries(groupedMonths).flatMap(
        ([section, months]) =>
          months?.map((month, index) => ({
            monthNumber: month,
            monthName: generateMonthName(Number(section), index),
            monthStartDate: getMonthStartEndDates(month).startDate,
            monthEndDate: getMonthStartEndDates(month).endDate,
            monthDescription: '',
          })),
      );
      setMonthRangeFormValues(transformedData);
      // Update monthData state for rendering
      const renderData = Object.entries(groupedMonths).flatMap(
        ([section, months]) =>
          months?.map((month, index) => ({
            monthNumber: month,
            monthName: generateMonthName(Number(section), index),
            startDate: getMonthStartEndDates(month).startDate,
            endDate: getMonthStartEndDates(month).endDate,
          })),
      );
      setMonthData(renderData);
    }
  }, [calendarType, fiscalYearStart, fiscalYearEnd, setMonthRangeFormValues]);

  // Only keep setFieldsValue/resetFields in the effect that runs on isEditMode/monthRangeValues
  useEffect(() => {
    if (isEditMode && form) {
      if (Array.isArray(monthRangeValues) && monthRangeValues.length > 0) {
        const fieldsToUpdate: Record<string, any> = {};
        monthRangeValues.forEach((month) => {
          const key = month.monthNumber; // or idx+1 if you want strict order
          fieldsToUpdate[`monthName_${key}`] = month.monthName;
          fieldsToUpdate[`monthStartDate_${key}`] = month.monthStartDate;
          fieldsToUpdate[`monthEndDate_${key}`] = month.monthEndDate;
          fieldsToUpdate[`monthDescription_${key}`] = month.monthDescription;
        });
      }
    } else if (!isEditMode && form) {
      form.resetFields();
    }
    // Only run this effect when edit mode or monthRangeValues change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, form, monthRangeValues]);

  // Ensure form fields are populated with month values whenever monthData changes
  useEffect(() => {
    if (!isEditMode && form && monthData.length > 0) {
      const fieldsToUpdate = monthData.reduce(
        (acc: Record<string, any>, month) => {
          const key = month.monthNumber;
          acc[`monthName_${key}`] = month.monthName;
          acc[`monthStartDate_${key}`] = month.startDate;
          acc[`monthEndDate_${key}`] = month.endDate;
          acc[`monthDescription_${key}`] = '';
          return acc;
        },
        {},
      );
      form.setFieldsValue(fieldsToUpdate);
    }
  }, [isEditMode, form, monthData]);

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

        // Only error if the start date is inside another month's range
        if (
          currentStart.isSameOrAfter(otherStart) &&
          currentStart.isSameOrBefore(otherEnd)
        ) {
          throw new Error(
            `Start date for Month ${currentMonthNumber} overlaps with Month ${monthNum}. Please adjust the dates.`,
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

        // Only error if the end date is inside another month's range
        if (
          currentEnd.isSameOrAfter(otherStart) &&
          currentEnd.isSameOrBefore(otherEnd)
        ) {
          throw new Error(
            `End date for Month ${currentMonthNumber} overlaps with Month ${monthNum}. Please adjust the dates.`,
          );
        }
      }
    };
  };

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <div
        className={`flex-1 {isFiscalYear ? 'bg-white' : 'bg-gray-50'} p-0 items-center w-full h-full`}
      >
        <div className="flex justify-start items-center gap-2 font-bold text-2xl text-black my-2 px-2">
          Set up Month
        </div>

        {monthData.map((monthInfo) => {
          const monthName = monthInfo.monthName.split(' (')[0] || 'Month';

          return (
            <React.Fragment
              key={`${monthInfo.monthNumber}-${monthInfo.startDate?.format('YYYY-MM-DD')}-${monthInfo.endDate?.format('YYYY-MM-DD')}`}
            >
              <Form.Item
                id={`monthNameId_${monthInfo.monthNumber}`}
                name={`monthName_${monthInfo.monthNumber}`}
                label={
                  <span className="font-medium">{monthInfo.monthName}</span>
                }
                rules={[
                  {
                    required: true,
                    message: `Please input the month name!`,
                  },
                ]}
              >
                <Input
                  size="large"
                  className="w-full text-sm"
                  placeholder={`Enter name for ${monthName}`}
                />
              </Form.Item>

              <Row gutter={[16, 10]}>
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                  <Form.Item
                    name={`monthStartDate_${monthInfo.monthNumber}`}
                    label={<span className="font-medium">Start Date</span>}
                    validateTrigger="onChange"
                    rules={[
                      {
                        required: true,
                        message: 'Please input the start date!',
                      },
                      {
                        validator: async (nonused, value) => {
                          if (!value) return;
                          // Only validate start date logic
                          const fiscalYearStartDate = dayjs(fiscalYearStart);
                          if (dayjs(value).isBefore(fiscalYearStartDate)) {
                            throw new Error(
                              `Start date cannot be before fiscal year start (${fiscalYearStartDate.format('YYYY-MM-DD')})`,
                            );
                          }
                          // Optionally, check if start date is after end date (if end date is filled)
                          const endDate = form?.getFieldValue(
                            `monthEndDate_${monthInfo.monthNumber}`,
                          );
                          if (endDate && dayjs(value).isAfter(dayjs(endDate))) {
                            throw new Error(
                              'Start date must be before end date',
                            );
                          }
                        },
                      },
                      ...(form
                        ? [
                            {
                              validator: validateStartNoOverlap(
                                monthInfo.monthNumber,
                                form,
                              ),
                            },
                          ]
                        : []),
                    ]}
                  >
                    <DatePicker
                      className="w-full"
                      disabledDate={(current) => {
                        if (!current) return false;
                        const fiscalYearStartDate = dayjs(fiscalYearStart);
                        const fiscalYearEndDate = dayjs(fiscalYearEnd);
                        return (
                          current.isBefore(fiscalYearStartDate) ||
                          current.isAfter(fiscalYearEndDate)
                        );
                      }}
                      onChange={() => {
                        form?.validateFields([
                          `monthEndDate_${monthInfo.monthNumber}`,
                        ]);
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                  <Form.Item
                    name={`monthEndDate_${monthInfo.monthNumber}`}
                    label={<span className="font-medium">End Date</span>}
                    validateTrigger="onChange"
                    rules={[
                      {
                        required: true,
                        message: 'Please input the end date!',
                      },
                      {
                        validator: async (nonused, value) => {
                          if (!value) return;
                          // Only validate end date logic
                          const fiscalYearEndDate = dayjs(fiscalYearEnd);
                          if (dayjs(value).isAfter(fiscalYearEndDate)) {
                            throw new Error(
                              `End date cannot be after fiscal year end (${fiscalYearEndDate.format('YYYY-MM-DD')})`,
                            );
                          }
                          // Optionally, check if end date is before start date (if start date is filled)
                          const startDate = form?.getFieldValue(
                            `monthStartDate_${monthInfo.monthNumber}`,
                          );
                          if (
                            startDate &&
                            dayjs(value).isBefore(dayjs(startDate))
                          ) {
                            throw new Error(
                              'End date must be after start date',
                            );
                          }
                        },
                      },
                      ...(form
                        ? [
                            {
                              validator: validateEndNoOverlap(
                                monthInfo.monthNumber,
                                form,
                              ),
                            },
                          ]
                        : []),
                    ]}
                  >
                    <DatePicker
                      className="w-full"
                      disabledDate={(current) => {
                        if (!current) return false;
                        const fiscalYearStartDate = dayjs(fiscalYearStart);
                        const fiscalYearEndDate = dayjs(fiscalYearEnd);
                        return (
                          current.isBefore(fiscalYearStartDate) ||
                          current.isAfter(fiscalYearEndDate)
                        );
                      }}
                      onChange={() => {
                        form?.validateFields([
                          `monthStartDate_${monthInfo.monthNumber}`,
                        ]);
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                id={`monthDescriptionId_${monthInfo.monthNumber}`}
                name={`monthDescription_${monthInfo.monthNumber}`}
                label={<span className="font-medium">Description</span>}
              >
                <TextArea
                  placeholder={`Enter description for ${monthName}`}
                  className={'h-32 font-normal text-sm mt-2'}
                  size="large"
                />
              </Form.Item>
            </React.Fragment>
          );
        })}

        <Form.Item className="mb-0">
          <div
            className={`flex justify-center pt-3 pb-3 sm:p-2 space-x-5 ${isMobile ? 'shadow-[10px_20px_50px_0px_#00000033]' : 'shadow-none'}`}
          >
            <Button
              type="default"
              onClick={async () => {
                // Only save current form values to store before going back in edit mode
                if (isEditMode) {
                  const values = await form?.getFieldsValue();
                  setMonthRangeFormValues(
                    Object.keys(values)
                      .filter((key) => key.startsWith('monthName_'))
                      .map((nonused, idx) => ({
                        monthNumber: idx + 1,
                        monthName: values[`monthName_${idx + 1}`],
                        monthStartDate: values[`monthStartDate_${idx + 1}`],
                        monthEndDate: values[`monthEndDate_${idx + 1}`],
                        monthDescription: values[`monthDescription_${idx + 1}`],
                      })),
                  );
                }
                setCurrent(1); // Go to previous step
              }}
              className="flex justify-center text-sm font-medium p-4 px-10 h-10"
            >
              Previous
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-10 border-none"
            >
              {isCreateLoading || isUpdateLoading ? (
                <div>
                  <Spin />
                </div>
              ) : isEditMode ? (
                <span>Edit</span>
              ) : (
                <span>Create</span>
              )}
            </Button>
          </div>
        </Form.Item>
      </div>
    </Form>
  );
};

export default MonthDrawer;
