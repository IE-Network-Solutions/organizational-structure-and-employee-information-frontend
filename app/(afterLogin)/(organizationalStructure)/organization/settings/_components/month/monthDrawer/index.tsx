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
    selectedFiscalYear,
    isEditMode,
    setCalendarType,
    setMonthRangeFormValues,
  } = useFiscalYearDrawerStore();

  const { data: departments } = useGetDepartments();

  const fiscalStart = fiscalYearStart ? fiscalYearStart.toDate() : new Date();
  const fiscalEnd = fiscalYearEnd ? fiscalYearEnd.toDate() : new Date();
  const { isMobile } = useIsMobile();

  const startMonth = fiscalStart.getMonth() + 1;
  const endMonth = fiscalEnd.getMonth() + 1;

  const groupedMonths = classifyMonths(startMonth, endMonth, calendarType);

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
    if (selectedFiscalYear && isEditMode) {
      const sessions = selectedFiscalYear?.sessions || [];
      const inferredCalendarType =
        sessions.length >= 4
          ? 'Quarter'
          : sessions.length === 2
            ? 'Semester'
            : sessions.length === 1
              ? 'Year'
              : '';

      setCalendarType(inferredCalendarType);

      let updatedMonthData: Array<any> = [];

      if (inferredCalendarType === 'Year') {
        updatedMonthData = sessions.flatMap(
          (session: any) =>
            session?.months?.map((month: any) => {
              return {
                monthName: month?.name || '',
                monthStartDate: month?.startDate
                  ? dayjs(month?.startDate)
                  : null,
                monthEndDate: month?.endDate ? dayjs(month?.endDate) : null,
                monthDescription: month?.description || '',
              };
            }) || [],
        );
      } else if (['Semester', 'Quarter'].includes(inferredCalendarType)) {
        updatedMonthData = sessions.flatMap(
          (session: any, sessionIndex: number) =>
            session?.months?.map((month: any, monthIndex: number) => ({
              monthName: `Month ${monthIndex + 1} (${
                inferredCalendarType === 'Quarter'
                  ? `Q${sessionIndex + 1}`
                  : `S${sessionIndex + 1}`
              })`,
              monthStartDate: month?.startDate ? dayjs(month?.startDate) : null,
              monthEndDate: month?.endDate ? dayjs(month?.endDate) : null,
              monthDescription: month?.description || '',
            })) || [],
        );
      }

      if (updatedMonthData?.length > 0) {
        const fieldsToUpdate = updatedMonthData.reduce((acc, month, index) => {
          acc[`monthName_${index}`] = month.monthName;
          acc[`monthStartDate_${index}`] = month.monthStartDate;
          acc[`monthEndDate_${index}`] = month.monthEndDate;
          acc[`monthDescription_${index}`] = month.monthDescription;
          return acc;
        }, {});

        form?.resetFields(Object.keys(fieldsToUpdate));
      }
    }
  }, [selectedFiscalYear, isEditMode, form]);

  useEffect(() => {
    const transformedData = Object.entries(groupedMonths).flatMap(
      ([section, months]) =>
        months?.map((month, index) => ({
          monthName: generateMonthName(Number(section), index),
          monthStartDate: getMonthStartEndDates(month).startDate,
          monthEndDate: getMonthStartEndDates(month).endDate,
          monthDescription: '',
        })),
    );

    if (
      JSON.stringify(transformedData) !==
      JSON.stringify(useFiscalYearDrawerStore.getState().monthRangeValues)
    ) {
      setMonthRangeFormValues(transformedData);
    }
  }, []);

  return (
    <>
      <div
        className={`flex-1 {isFiscalYear ? 'bg-white' : 'bg-gray-50'} p-0 items-center w-full h-full`}
        data-cy="org-settings-month-drawer-container"
        id="org-settings-month-drawer-container"
      >
        <div
          className="flex justify-start items-center gap-2 font-bold text-2xl text-black my-2 px-2"
          data-cy="org-settings-month-drawer-title"
          id="org-settings-month-drawer-title"
        >
          Set up Month
        </div>

        {Object.entries(groupedMonths).map(([section, months]) => {
          return (
            <div
              key={section}
              className="px-3 sm:px-0"
              data-cy={`org-settings-month-drawer-form-item-${section}`}
              id={`org-settings-month-drawer-form-item-${section}`}
            >
              {months.map((month, index) => {
                const { startDate, endDate } = getMonthStartEndDates(month);
                const monthName =
                  generateMonthName(Number(section), index).split(' (')[0] ||
                  'Month';
                return (
                  <React.Fragment
                    key={month}
                    data-cy="org-components-month-monthdrawer-index-react-fragment-1"
                  >
                    <Form.Item
                      data-cy={`org-settings-month-drawer-form-item-name-${month}`}
                      id={`monthNameId_${month}`}
                      name={`monthName_${month}`}
                      label={
                        <span
                          className="font-medium"
                          data-cy="org-components-month-monthdrawer-index-span-1"
                          id="org-components-month-monthdrawer-index-span-1"
                        >
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
                        data-cy="org-components-month-monthdrawer-index-input-1"
                        id="org-components-month-monthdrawer-index-input-1"
                      />
                    </Form.Item>

                    <Row
                      gutter={[16, 10]}
                      data-cy="org-components-month-monthdrawer-index-row-1"
                      id="org-components-month-monthdrawer-index-row-1"
                    >
                      <Col
                        xs={24}
                        sm={24}
                        md={12}
                        lg={12}
                        xl={12}
                        data-cy="org-components-month-monthdrawer-index-col-1"
                        id="org-components-month-monthdrawer-index-col-1"
                      >
                        <Form.Item
                          data-cy={`org-settings-month-drawer-form-item-start-date-${month}`}
                          id={`monthStartDateId_${month}`}
                          name={`monthStartDate_${month}`}
                          label={
                            <span
                              className="font-medium"
                              data-cy="org-components-month-monthdrawer-index-span-2"
                              id="org-components-month-monthdrawer-index-span-2"
                            >
                              Start Date
                            </span>
                          }
                          rules={[
                            {
                              required: true,
                              message: 'Please input the start date!',
                            },
                          ]}
                          initialValue={startDate}
                        >
                          <DatePicker
                            className="w-full"
                            data-cy="org-components-month-monthdrawer-index-datepicker-1"
                            id="org-components-month-monthdrawer-index-datepicker-1"
                          />
                        </Form.Item>
                      </Col>
                      <Col
                        xs={24}
                        sm={24}
                        md={12}
                        lg={12}
                        xl={12}
                        data-cy="org-components-month-monthdrawer-index-col-2"
                        id="org-components-month-monthdrawer-index-col-2"
                      >
                        <Form.Item
                          data-cy={`org-settings-month-drawer-form-item-end-date-${month}`}
                          id={`monthEndDateId_${month}`}
                          name={`monthEndDate_${month}`}
                          label={
                            <span
                              className="font-medium"
                              data-cy="org-components-month-monthdrawer-index-span-3"
                              id="org-components-month-monthdrawer-index-span-3"
                            >
                              End Date
                            </span>
                          }
                          rules={[
                            {
                              required: true,
                              message: 'Please input the end date!',
                            },
                          ]}
                          initialValue={endDate}
                        >
                          <DatePicker
                            className="w-full"
                            data-cy={`org-settings-month-drawer-form-item-end-date-input-${month}`}
                            id={`org-settings-month-drawer-form-item-end-date-input-${month}`}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      data-cy={`org-settings-month-drawer-form-item-description-${month}`}
                      id={`monthDescriptionId_${month}`}
                      name={`monthDescription_${month}`}
                      label={
                        <span
                          className="font-medium"
                          data-cy="org-components-month-monthdrawer-index-span-4"
                          id="org-components-month-monthdrawer-index-span-4"
                        >
                          Description
                        </span>
                      }
                    >
                      <TextArea
                        placeholder={`Enter description for ${monthName}`}
                        className={'h-32 font-normal text-sm mt-2'}
                        size="large"
                        data-cy={`org-settings-month-drawer-form-item-description-input-${month}`}
                        id={`org-settings-month-drawer-form-item-description-input-${month}`}
                      />
                    </Form.Item>
                  </React.Fragment>
                );
              })}
            </div>
          );
        })}

        <Form.Item
          className="mb-0"
          data-cy="org-settings-month-drawer-next-btn-form-item"
          id="org-settings-month-drawer-next-btn-form-item"
        >
          <div
            className={`flex justify-center pt-3 pb-3 sm:p-2 space-x-5 ${isMobile ? 'shadow-[10px_20px_50px_0px_#00000033]' : 'shadow-none'}`}
            data-cy="org-settings-month-drawer-form-item-next-btn-container"
            id="org-settings-month-drawer-form-item-next-btn-container"
          >
            <Button
              type="default"
              onClick={() => setCurrent(1)}
              className="flex justify-center text-sm font-medium p-4 px-10 h-10"
              data-cy="org-settings-month-drawer-form-item-previous-btn"
              id="org-settings-month-drawer-form-item-previous-btn"
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
              data-cy="org-settings-month-drawer-form-item-next-btn"
              id="org-settings-month-drawer-form-item-next-btn"
            >
              {isCreateLoading || isUpdateLoading ? (
                <div
                  data-cy="org-components-month-monthdrawer-index-div-1"
                  id="org-components-month-monthdrawer-index-div-1"
                >
                  <Spin data-cy="org-settings-month-drawer-form-item-next-btn-spinner" />
                </div>
              ) : isEditMode ? (
                <span
                  data-cy="org-settings-month-drawer-form-item-next-btn-text"
                  id="org-settings-month-drawer-form-item-next-btn-text"
                >
                  Edit
                </span>
              ) : departments?.length > 0 ? (
                <span
                  data-cy="org-settings-month-drawer-form-item-next-btn-text"
                  id="org-settings-month-drawer-form-item-next-btn-text"
                >
                  Create
                </span>
              ) : (
                <span
                  data-cy="org-settings-month-drawer-form-item-next-btn-text"
                  id="org-settings-month-drawer-form-item-next-btn-text"
                >
                  Continue
                </span>
              )}
            </Button>
          </div>
        </Form.Item>
      </div>
    </>
  );
};

export default MonthDrawer;
