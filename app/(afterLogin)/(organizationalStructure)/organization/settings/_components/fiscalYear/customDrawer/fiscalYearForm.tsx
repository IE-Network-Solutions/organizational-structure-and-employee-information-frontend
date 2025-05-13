import { Input, Form, DatePicker, Button, Row, Col, Select } from 'antd';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import dayjs from 'dayjs';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useEffect } from 'react';

const FiscalYearForm: React.FC = () => {
  const [form] = Form.useForm();

  const {
    setCurrent,
    setCalendarType,
    setSelectedFiscalYear,
    setFiscalYearStart,
    setFiscalYearEnd,
    setFiscalYearFormValues,
    selectedFiscalYear,
    isEditMode,
    setOpenFiscalYearDrawer,
  } = useFiscalYearDrawerStore();

  const { data: activeCalendar } = useGetActiveFiscalYears();
  const { data: departments } = useGetDepartments();

  /* eslint-disable-next-line @typescript-eslint/naming-convention */
  const validateStartDate = (_: any, value: any) => {
    /* eslint-enable-next-line @typescript-eslint/naming-convention */
    if (!value) {
      return Promise.reject(new Error('Please select a start date.'));
    }
    if (
      activeCalendar?.endDate &&
      dayjs(value).isBefore(dayjs(activeCalendar?.endDate), 'day')
    ) {
      return Promise.reject(
        new Error(
          `Start date must be after or equal to ${dayjs(activeCalendar.endDate).format('YYYY-MM-DD')}.`,
        ),
      );
    }

    if (activeCalendar && dayjs(value).isBefore(dayjs(), 'day')) {
      return Promise.reject(new Error('Start date cannot be in the past.'));
    }

    return Promise.resolve();
  };
  /* eslint-disable-next-line @typescript-eslint/naming-convention */
  const validateEndDate = (_: any, value: any) => {
    /* eslint-enable-next-line @typescript-eslint/naming-convention */

    const startDate = form.getFieldValue('fiscalYearStartDate');

    if (!value) {
      return Promise.reject(new Error('Please select an end date.'));
    }

    if (!startDate) {
      return Promise.reject(new Error('Please select the start date first.'));
    }

    const expectedEndDate = dayjs(startDate).add(1, 'year');

    if (!dayjs(value).isSame(expectedEndDate, 'day')) {
      return Promise.reject(
        new Error(
          `End date must be exactly one year after the start date (${expectedEndDate.format('YYYY-MM-DD')}).`,
        ),
      );
    }

    return Promise.resolve();
  };

  const handleClose = () => {
    setSelectedFiscalYear(null);
    setCalendarType('');
    setOpenFiscalYearDrawer(false);
  };

  const handleValuesChange = (val: string) => setCalendarType(val);
  const handleStartDateChange = (val: any) => setFiscalYearStart(val);
  const handleEndDateChange = (val: any) => setFiscalYearEnd(val);

  const handleNext = () => {
    const currentValues = form.getFieldsValue();
    setFiscalYearFormValues(currentValues);
    setCurrent(1);
  };

  useEffect(() => {
    if (isEditMode && selectedFiscalYear) {
      const sessionCount = selectedFiscalYear?.sessions?.length;
      let calendarType = '';
      if (sessionCount === 4) {
        calendarType = 'Quarter';
      } else if (sessionCount === 2) {
        calendarType = 'Semester';
      } else if (sessionCount === 1) {
        calendarType = 'Year';
      }

      setCalendarType(calendarType);

      form.setFieldsValue({
        fiscalYearName: selectedFiscalYear?.name,
        fiscalYearStartDate: dayjs(selectedFiscalYear?.startDate),
        fiscalYearEndDate: dayjs(selectedFiscalYear?.endDate),
        fiscalYearCalenderId: `${calendarType}`,
        fiscalYearDescription: dayjs(selectedFiscalYear?.description),
      });
    }
  }, [selectedFiscalYear, isEditMode, form]);

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        id="fiscalNameId"
        name="fiscalYearName"
        label={<span className="font-medium">Fiscal Year Name</span>}
        rules={[{ required: true, message: 'Please input the session name!' }]}
      >
        <Input
          size="large"
          className="h-12 mt-2 w-full font-normal text-sm"
          placeholder="Enter session name"
        />
      </Form.Item>

      <Row gutter={[16, 10]}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Form.Item
            id="fiscalYearStartDateId"
            name="fiscalYearStartDate"
            label={<span className="font-medium"> Start Date</span>}
            rules={[{ validator: validateStartDate }]}
          >
            <DatePicker
              onChange={(value: any) => handleStartDateChange(value)}
              className="h-12 w-full font-normal text-xl mt-2"
            />
          </Form.Item>
          {!isEditMode ? (
            <span className="text-xs font-normal mt-0 flex items-start mb-4 ml-1">
              Active Calendar End date:
              <span className="font-semibold">
                {activeCalendar?.endDate
                  ? dayjs(activeCalendar.endDate).format('YYYY-MM-DD')
                  : 'N/A'}
              </span>
            </span>
          ) : (
            ''
          )}
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Form.Item
            id="fiscalYearEndDateId"
            name="fiscalYearEndDate"
            label={<span className="font-medium"> End Date</span>}
            rules={[{ validator: validateEndDate }]}
          >
            <DatePicker
              onChange={(value: any) => handleEndDateChange(value)}
              className="h-12 w-full font-normal text-xl mt-2"
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        id="fiscalYearCalenderId"
        name="fiscalYearCalenderId"
        label={<span className="font-medium">Fiscal Year Calendar</span>}
      >
        <Select
          placeholder="Select Calendar"
          className="h-12 w-full font-normal text-xl mt-2"
          onChange={(value) => handleValuesChange(value)}
        >
          <Select.Option value="Quarter">Quarter</Select.Option>
          <Select.Option value="Semester">Semester</Select.Option>
          <Select.Option value="Year">Year</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item className="mb-5">
        <div className="flex justify-center w-full space-x-5 p-6 sm:p-0 ">
          {departments?.length > 0 && (
            <Button
              type="default"
              onClick={handleClose}
              className="h-[40px] sm:h-[56px] text-base"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="h-[40px] sm:h-[56px] text-base"
            type="primary"
          >
            Next
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default FiscalYearForm;
