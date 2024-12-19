import { Input, Form, DatePicker, Button, Row, Col, Select } from 'antd';
import { FormInstance } from 'antd/lib';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import TextArea from 'antd/es/input/TextArea';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import dayjs from 'dayjs';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useEffect, useMemo, useRef } from 'react';
import { useDebounce } from '@/utils/useDebounce';

interface FiscalYearProps {
  form: FormInstance<any>;
}

const FiscalYear: React.FC<FiscalYearProps> = ({ form }) => {
  const {
    selectedFiscalYear,
    isEditMode,
    setCurrent,
    calendarType,
    setCalendarType,
    setSelectedFiscalYear,
    setFiscalYearStart,
    setFiscalYearEnd,
    fiscalYearEnd,
    fiscalYearStart,
  } = useFiscalYearDrawerStore();

  const { data: activeCalendar } = useGetActiveFiscalYears();
  const { data: departments } = useGetDepartments();

  //  =========> START DATE AND END DATE VALIDATION AREA <============
  const validateStartDate = (_: any, value: any) => {
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

    if (dayjs(value).isBefore(dayjs(), 'day')) {
      return Promise.reject(new Error('Start date cannot be in the past.'));
    }

    return Promise.resolve();
  };

  const validateEndDate = (_: any, value: any) => {
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
  const gelilaaa = form?.getFieldsValue();

  console.log(gelilaaa, 'gelilaaa');

  const handleClose = () => {
    setSelectedFiscalYear(null);
    setCalendarType(null);
  };

  const handleValuesChange = (val: string) => setCalendarType(val);
  const handleStartDateChange = (val: any) => setFiscalYearStart(val);
  const handleEndDateChange = (val: any) => setFiscalYearEnd(val);

  return (
    <div className="flex-1 bg-gray-50 p-4 md:p-8 lg:p-12 rounded-lg my-4 md:my-8 items-center w-full h-full">
      <div className="flex justify-start items-center gap-2 font-bold text-2xl text-black my-4">
        Set up Fiscal Year
      </div>
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
            label={<span className="font-medium"> Fiscal Year Start Date</span>}
            rules={[{ validator: validateStartDate }]}
          >
            <DatePicker
              onChange={(value: any) => handleStartDateChange(value)}
              className="h-12 w-full font-normal text-xl mt-2"
            />
          </Form.Item>
          <span className="text-xs font-normal mt-0 flex items-start mb-4 ml-1">
            Active Calendar End date:
            <span className="font-semibold">
              {activeCalendar?.endDate
                ? dayjs(activeCalendar.endDate).format('YYYY-MM-DD')
                : 'N/A'}{' '}
            </span>
          </span>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Form.Item
            id="fiscalYearEndDateId"
            name="fiscalYearEndDate"
            label={<span className="font-medium">Fiscal Year End Date</span>}
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
        label={<span className="font-medium">Fiscal Year Calender</span>}
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
      <Form.Item
        id="fiscalYearDescriptionId"
        name="fiscalYearDescription"
        label={<span className="font-medium"> Description</span>}
        rules={[
          {
            required: false,
            message: 'Please input the fiscal year description!',
          },
        ]}
      >
        <TextArea
          placeholder="Enter description"
          rows={4}
          className={'h-32 font-normal text-sm mt-2'}
          size="large"
        />
      </Form.Item>

      <Form.Item className="">
        <div className="flex justify-center  w-full px-6 py-6 gap-6 my-3">
          {departments?.length > 0 ? (
            <Button
              onClick={handleClose}
              className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-12 hover:border-gray-500 border-gray-300"
            >
              Cancel
            </Button>
          ) : null}
          <Button
            onClick={() => setCurrent(1)}
            className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-12  border-none"
          >
            Next
          </Button>
        </div>
      </Form.Item>
    </div>
  );
};

export default FiscalYear;
