import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import { useSessionStore } from '@/store/uistate/features/organizationStructure/session';
import { Button, Col, DatePicker, Form, Input, Row, Spin } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { FormInstance } from 'antd/lib';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect } from 'react';

interface DrawerProps {
  form: FormInstance;
  isCreateLoading: boolean;
  isUpdateLoading: boolean;
  onNextStep?: () => void;
}

const MonthDrawer: React.FC<DrawerProps> = ({
  form,
  isCreateLoading,
  isUpdateLoading,
}) => {
  const { sessionId } = useSessionStore();
  const {
    selectedFiscalYear,
    setCurrent,
    fiscalYearStart,
    fiscalYearEnd,
    calendarType,
  } = useFiscalYearDrawerStore();

  const { data: departments } = useGetDepartments();

  const months = [
    'Month-1',
    'Month-2',
    'Month-3',
    'Month-4',
    'Month-5',
    'Month-6',
    'Month-7',
    'Month-8',
    'Month-9',
    'Month-10',
    'Month-11',
    'Month-12',
  ];

  const getMonthRange = (monthIndex: number): { start: Dayjs; end: Dayjs } => {
    if (!fiscalYearStart) return { start: dayjs(), end: dayjs() };

    const startMonth = fiscalYearStart.month();
    const yearOffset = monthIndex >= startMonth ? 0 : 1;
    const currentYear = fiscalYearStart.year() + yearOffset;

    const start =
      monthIndex === startMonth
        ? fiscalYearStart
        : dayjs().year(currentYear).month(monthIndex).startOf('month');
    const end = start.endOf('month');

    return { start, end };
  };

  const validateMonthDates = (rule: any, value: any, callback: any) => {
    if (!value) {
      callback();
      return;
    }

    const fieldName = rule.field;
    const monthIndex = fieldName.split('_')[1];
    const isStartDate = fieldName.startsWith('monthStartDate');

    const startDate = isStartDate
      ? value
      : form.getFieldValue(`monthStartDate_${monthIndex}`);
    const endDate = isStartDate
      ? form.getFieldValue(`monthEndDate_${monthIndex}`)
      : value;

    if (!startDate || !endDate) {
      callback();
      return;
    }

    if (startDate.isAfter(endDate)) {
      callback('Start date cannot be after end date!');
      return;
    }

    if (fiscalYearStart && fiscalYearEnd) {
      if (
        startDate.isBefore(fiscalYearStart, 'day') ||
        endDate.isAfter(fiscalYearEnd, 'day')
      ) {
        callback(
          `Month dates must be within the fiscal year range (${fiscalYearStart.format(
            'DD/MM/YYYY',
          )} - ${fiscalYearEnd.format('DD/MM/YYYY')})!`,
        );
        return;
      }
    }

    if (monthIndex > 0) {
      const previousEndDate = form.getFieldValue(
        `monthEndDate_${parseInt(monthIndex) - 1}`,
      );
      if (previousEndDate && startDate.isBefore(previousEndDate)) {
        callback(
          `This month's start date cannot overlap with the previous month's end date.`,
        );
        return;
      }
    }

    callback();
  };

  useEffect(() => {
    form?.resetFields();

    const initialValues: any = {};
    if (selectedFiscalYear?.sessions?.length > 0) {
      const allMonths = selectedFiscalYear.sessions.flatMap(
        (session: any) => session.months || [],
      );

      allMonths.forEach((month: any, index: number) => {
        initialValues[`monthName_${index}`] = month.name || '';
        initialValues[`monthDescription_${index}`] = month.description || '';
        initialValues[`monthStartDate_${index}`] = month.startDate
          ? dayjs(month.startDate)
          : null;
        initialValues[`monthEndDate_${index}`] = month.endDate
          ? dayjs(month.endDate)
          : null;
      });
    } else {
      months.forEach((month, index) => {
        const { start, end } = getMonthRange(index);
        initialValues[`monthName_${index}`] = month;
        initialValues[`monthStartDate_${index}`] = start;
        initialValues[`monthEndDate_${index}`] = end;
      });
    }

    setTimeout(() => {
      form?.setFieldsValue(initialValues);
      form?.validateFields();
    }, 0);
  }, [selectedFiscalYear?.id, form, fiscalYearStart, calendarType]);

  return (
    <div className="flex-1 bg-gray-50 p-4 md:p-8 lg:p-12 rounded-lg my-4 md:my-8 items-center w-full h-full">
      <div className="flex justify-start items-center gap-2 font-bold text-2xl text-black my-4">
        Set up Month
      </div>
      {months.map((month: any, index: number) => (
        <React.Fragment key={index}>
          <Form.Item
            id={`monthNameId_${index}`}
            name={`monthName_${index}`}
            label={<span className="font-medium">Month Name</span>}
            rules={[
              { required: true, message: `Please input the month name!` },
            ]}
          >
            <Input
              size="large"
              className="w-full text-sm"
              placeholder={`Enter month name`}
            />
          </Form.Item>

          <Row gutter={[16, 10]}>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                id={`monthStartDateId_${index}`}
                name={`monthStartDate_${index}`}
                label={<span className="font-medium">Start Date</span>}
                rules={[
                  { required: true, message: 'Please input the start date!' },
                  { validator: validateMonthDates },
                ]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                id={`monthEndDateId_${index}`}
                name={`monthEndDate_${index}`}
                label={<span className="font-medium">End Date</span>}
                rules={[
                  { required: true, message: 'Please input the end date!' },
                  { validator: validateMonthDates },
                ]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            id={`monthDescriptionId_${index}`}
            name={`monthDescription_${index}`}
            label={<span className="font-medium">Description</span>}
          >
            <TextArea
              placeholder="Enter description"
              className={'h-32 font-normal text-sm mt-2'}
              size="large"
            />
          </Form.Item>
        </React.Fragment>
      ))}

      <Form.Item>
        <div className="flex justify-center w-full px-6 py-6 gap-8">
          <Button
            onClick={() => setCurrent(1)}
            className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-12 hover:border-gray-500 border-gray-300"
          >
            Previous
          </Button>
          <Button
            // htmlType={departments?.length > 0 ? 'submit' : 'button'}
            htmlType="submit"
            // onClick={() => {
            //   if (!departments?.length && onNextStep) {
            //     onNextStep();
            //   }
            // }}
            className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-12 border-none"
          >
            {isCreateLoading || isUpdateLoading ? (
              <div>
                <Spin />
              </div>
            ) : sessionId ? (
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
  );
};

export default MonthDrawer;
