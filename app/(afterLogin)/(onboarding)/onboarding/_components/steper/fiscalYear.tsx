import { Input, Form, DatePicker, Button, Row, Col, Select } from 'antd';
import { FormInstance } from 'antd/lib';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import TextArea from 'antd/es/input/TextArea';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import dayjs from 'dayjs';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useEffect, useMemo } from 'react';

interface FiscalYearProps {
  form: FormInstance;
}

const FiscalYear: React.FC<FiscalYearProps> = ({ form }) => {
  const { selectedFiscalYear, isEditMode, setCurrent, setCalendarType } =
    useFiscalYearDrawerStore();

  const { data: activeCalendar } = useGetActiveFiscalYears();
  const { data: departments } = useGetDepartments();

  const activeCalendarEndDate = useMemo(
    () => (activeCalendar?.endDate ? dayjs(activeCalendar.endDate) : null),
    [activeCalendar],
  );
  useEffect(() => {
    if (isEditMode && selectedFiscalYear) {
      form.setFieldsValue({
        fiscalYearName: selectedFiscalYear?.name,
        fiscalYearStartDate: selectedFiscalYear?.startDate
          ? dayjs(selectedFiscalYear?.startDate)
          : undefined,
        fiscalYearEndDate: selectedFiscalYear?.endDate
          ? dayjs(selectedFiscalYear?.endDate)
          : undefined,
        fiscalYearCalenderId: selectedFiscalYear?.fiscalYearCalenderId,
        fiscalYearDescription: selectedFiscalYear?.description,
      });
    }
  }, [selectedFiscalYear, isEditMode, form]);

  return (
    <div className="flex-1 bg-gray-50 p-4 md:p-8 lg:p-12 rounded-lg my-4 md:my-8 items-center w-full h-full">
      <div className="flex justify-start items-center gap-2 font-bold text-2xl text-black my-4">
        Set up Fiscal Year
      </div>
      <Form.Item
        id="fiscalNameId"
        name="fiscalYearName"
        validateTrigger="onSubmit"
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
            validateTrigger="onSubmit"
            label={<span className="font-medium"> Fiscal Year Start Date</span>}
            rules={[
              /* eslint-disable @typescript-eslint/naming-convention */
              ({}) => ({
                validator(_, value) {
                  /* eslint-enable @typescript-eslint/naming-convention */

                  if (!value || !activeCalendarEndDate) {
                    return Promise.resolve();
                  }
                  if (value.isBefore(activeCalendarEndDate)) {
                    return Promise.reject(
                      new Error(
                        'The start date must be after the active calendar end date.',
                      ),
                    );
                  }
                  const endDate = value.add(1, 'year');
                  form.setFieldsValue({
                    fiscalYearEndDate: endDate,
                  });
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker className="h-12 w-full font-normal text-xl mt-2" />
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
            validateTrigger="onSubmit"
            label={<span className="font-medium">Fiscal Year End Date</span>}
            rules={[
              {
                required: true,
                message: 'Please input fiscal year ending date!',
              },
              ({ getFieldValue }) => ({
                /* eslint-disable @typescript-eslint/naming-convention */

                validator(_, value) {
                  /* eslint-enable @typescript-eslint/naming-convention */

                  const startDate = getFieldValue('fiscalYearStartDate');
                  if (!value || !startDate) {
                    return Promise.resolve();
                  }
                  if (value.diff(startDate, 'year') !== 1) {
                    return Promise.reject(
                      new Error(
                        'The end date must be exactly one year after the start date.',
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker className="h-12 w-full font-normal text-xl mt-2" />
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
          onChange={(value) => setCalendarType(value)}
        >
          <Select.Option value="Quarter">Quarter</Select.Option>
          <Select.Option value="Semester">Semester</Select.Option>
          <Select.Option value="Year">Year</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        id="fiscalYearDescriptionId"
        name="fiscalYearDescription"
        validateTrigger="onSubmit"
        label={<span className="font-medium"> Description</span>}
        rules={[
          {
            required: true,
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
              onClick={close}
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
