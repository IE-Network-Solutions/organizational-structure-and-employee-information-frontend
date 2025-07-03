import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import { Button, Col, DatePicker, Form, Input, Row, Spin } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { FormInstance } from 'antd/lib';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

interface DrawerProps {
  form: FormInstance<any> | undefined;
  isCreateLoading: boolean;
  isUpdateLoading: boolean;
  onNextStep: any;
  isFiscalYear?: boolean;
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

const MonthDrawer: React.FC<DrawerProps> = ({
  form,
  isCreateLoading,
  isUpdateLoading,
  onNextStep,
}) => {
  const {
    setCurrent,
    fiscalYearStart,
    fiscalYearEnd,
    calendarType,
    isEditMode,
    setMonthRangeFormValues,
  } = useFiscalYearDrawerStore();

  const { data: departments } = useGetDepartments();

  const fiscalStart = fiscalYearStart ? fiscalYearStart.toDate() : new Date();
  const fiscalEnd = fiscalYearEnd ? fiscalYearEnd.toDate() : new Date();
  const { isMobile } = useIsMobile();

  const startMonth = fiscalStart.getMonth() + 1;
  const endMonth = fiscalEnd.getMonth() + 1;

  const groupedMonths = classifyMonths(startMonth, endMonth, calendarType);

  // Debug logs

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
    const fiscalStarts = dayjs(fiscalStart);
    const startDate = fiscalStarts
      .month(fiscalStarts.month() + (month - 1))
      .date(fiscalStarts.date());

    const endDate = startDate.clone().add(1, 'month').subtract(1, 'day');
    return { startDate, endDate };
  };

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
      if (form) {
        // Reset only the month-related fields
        const fieldNames = transformedData.flatMap((month) => [
          `monthName_${month.monthNumber}`,
          `monthStartDate_${month.monthNumber}`,
          `monthEndDate_${month.monthNumber}`,
          `monthDescription_${month.monthNumber}`,
        ]);
        form.resetFields(fieldNames);
        const fieldsToUpdate = transformedData.reduce(
          (acc: Record<string, any>, month) => {
            const key = month.monthNumber;

            acc[`monthName_${key}`] = month.monthName;
            acc[`monthStartDate_${key}`] = month.monthStartDate;
            acc[`monthEndDate_${key}`] = month.monthEndDate;
            acc[`monthDescription_${key}`] = month.monthDescription;
            return acc;
          },
          {} as Record<string, any>,
        );
        form.setFieldsValue(fieldsToUpdate);
      }
    }
  }, [
    calendarType,
    fiscalYearStart,
    fiscalYearEnd,
    setMonthRangeFormValues,
    form,
  ]);

  return (
    <>
      <div
        className={`flex-1 {isFiscalYear ? 'bg-white' : 'bg-gray-50'} p-0 items-center w-full h-full`}
      >
        <div className="flex justify-start items-center gap-2 font-bold text-2xl text-black my-2 px-2">
          Set up Month
        </div>

        {Object.entries(groupedMonths).map(([section, months]) => {
          return (
            <div key={section} className="px-3 sm:px-0">
              {months.map((month, index) => {
                const { startDate, endDate } = getMonthStartEndDates(month);
                const monthName =
                  generateMonthName(Number(section), index).split(' (')[0] ||
                  'Month';

                return (
                  <React.Fragment key={month}>
                    <Form.Item
                      id={`monthNameId_${month}`}
                      name={`monthName_${month}`}
                      label={
                        <span className="font-medium">
                          {generateMonthName(Number(section), index)}
                        </span>
                      }
                      rules={[
                        {
                          required: true,
                          message: `Please input the month name!`,
                        },
                      ]}
                      initialValue={monthName}
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
                          id={`monthStartDateId_${month}`}
                          name={`monthStartDate_${month}`}
                          label={
                            <span className="font-medium">Start Date</span>
                          }
                          rules={[
                            {
                              required: true,
                              message: 'Please input the start date!',
                            },
                          ]}
                          initialValue={startDate}
                        >
                          <DatePicker className="w-full" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Form.Item
                          id={`monthEndDateId_${month}`}
                          name={`monthEndDate_${month}`}
                          label={<span className="font-medium">End Date</span>}
                          rules={[
                            {
                              required: true,
                              message: 'Please input the end date!',
                            },
                          ]}
                          initialValue={endDate}
                        >
                          <DatePicker className="w-full" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      id={`monthDescriptionId_${month}`}
                      name={`monthDescription_${month}`}
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
            </div>
          );
        })}

        <Form.Item className="mb-0">
          <div
            className={`flex justify-center pt-3 pb-3 sm:p-2 space-x-5 ${isMobile ? 'shadow-[10px_20px_50px_0px_#00000033]' : 'shadow-none'}`}
          >
            <Button
              type="default"
              onClick={() => setCurrent(1)}
              className="flex justify-center text-sm font-medium p-4 px-10 h-10"
            >
              Previous
            </Button>
            <Button
              type="primary"
              htmlType={departments?.length > 0 ? 'submit' : 'button'}
              onClick={() => {
                if (!departments?.length && onNextStep) {
                  onNextStep();
                }
              }}
              className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-10 border-none"
            >
              {isCreateLoading || isUpdateLoading ? (
                <div>
                  <Spin />
                </div>
              ) : isEditMode ? (
                <span>Edit</span>
              ) : departments?.length > 0 ? (
                <span> Create </span>
              ) : (
                <span>Continue</span>
              )}
            </Button>
          </div>
        </Form.Item>
      </div>
    </>
  );
};

export default MonthDrawer;
