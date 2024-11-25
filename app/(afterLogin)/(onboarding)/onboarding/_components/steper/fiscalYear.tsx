import { Input, Form, DatePicker } from 'antd';
import useFiscalYearStore from '@/store/uistate/features/organizationStructure/fiscalYear/fiscalYearStore';
import { FormInstance } from 'antd/lib';
import dayjs, { Dayjs } from 'dayjs';

interface FiscalYearProps {
  form: FormInstance;
}

const FiscalYear: React.FC<FiscalYearProps> = ({ form }) => {
  const {
    name,
    startDate,
    endDate,
    description,
    setFiscalYearName,
    setFiscalYearStartDate,
    setFiscalYearEndDate,
    setFiscalDescriptionName,
  } = useFiscalYearStore();

  const disabledEndDate = (current: Dayjs | null): boolean => {
    if (!current || !startDate) {
      return false;
    }
    return current.isBefore(dayjs(startDate), 'day');
  };

  const disabledStartDate = (current: Dayjs | null): boolean => {
    if (!current || !endDate) {
      return false;
    }
    return current.isAfter(dayjs(endDate), 'day');
  };

  /* eslint-disable @typescript-eslint/naming-convention */

  return (
    <div className="flex-1 bg-gray-50 p-4 md:p-8 lg:p-12 rounded-lg my-4 md:my-8 items-center w-full h-full">
      <div className="bg-white p-4 md:p-8 lg:p-12 rounded-lg h-full w-full">
        <div className="flex justify-start items-center gap-2 font-bold text-2xl text-black mt-8">
          Set up Fiscal Year
        </div>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name,
            startDate,
            endDate,
            description,
          }}
          onFinish={(values) => {
            if (dayjs(values.startDate).isAfter(values.endDate)) {
              form.setFields([
                {
                  name: 'startDate',
                  errors: [
                    'The fiscal year start date cannot be after the end date.',
                  ],
                },
                {
                  name: 'endDate',
                  errors: [
                    'The fiscal year end date cannot be before the start date.',
                  ],
                },
              ]);
            }
          }}
        >
          <Form.Item
            name="name"
            label="Fiscal Year Name"
            className="h-12 w-full font-normal text-xl mt-4"
            rules={[
              { required: true, message: 'Please input fiscal year name!' },
              {
                min: 2,
                message: 'Fiscal year name must be at least 2 characters!',
              },
            ]}
          >
            <Input
              size="large"
              className="h-12 mt-2 w-full font-normal text-sm"
              placeholder="Enter your fiscal year name"
              value={name}
              onChange={(e) => {
                setFiscalYearName(e.target.value);
              }}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            className=" w-full font-normal text-xl mt-12"
            rules={[
              {
                required: true,
                message: 'Please input fiscal year description!',
              },
            ]}
          >
            <Input.TextArea
              className={'h-32 font-normal text-sm mt-2'}
              size="large"
              placeholder="Enter a description"
              onChange={(e) => setFiscalDescriptionName(e.target.value || '')}
              value={description}
              autoSize={{ minRows: 4, maxRows: 6 }}
            />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="Fiscal Year Starting Date"
            className="h-12 w-full font-normal text-xl mt-6"
            rules={[
              {
                required: true,
                message: 'Please input fiscal year starting date!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (
                    value &&
                    getFieldValue('endDate') &&
                    value.isAfter(getFieldValue('endDate'))
                  ) {
                    return Promise.reject(
                      new Error(
                        'The fiscal year start date cannot be after the end date.',
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              className="h-12 w-full font-normal text-xl mt-2"
              value={startDate}
              onChange={(date: Dayjs | null) => {
                setFiscalYearStartDate(date ? date : null);
                if (endDate && date && date.isAfter(endDate)) {
                  setFiscalYearEndDate(null);
                }
              }}
              disabledDate={disabledStartDate}
            />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="Fiscal Year End Date"
            className="h-12 w-full font-normal text-xl mt-12"
            rules={[
              {
                required: true,
                message: 'Please input fiscal year ending date!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (
                    value &&
                    getFieldValue('startDate') &&
                    value.isBefore(getFieldValue('startDate'))
                  ) {
                    return Promise.reject(
                      new Error(
                        'The fiscal year end date cannot be before the start date.',
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              className="h-12 w-full font-normal text-xl mt-2"
              value={endDate}
              onChange={(date) => {
                setFiscalYearEndDate(date ? date : null);
              }}
              disabledDate={disabledEndDate}
            />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
  /* eslint-enable @typescript-eslint/naming-convention */
};

export default FiscalYear;
