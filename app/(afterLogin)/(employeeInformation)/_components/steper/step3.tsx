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

  const disabledDate = (current: Dayjs | null): boolean => {
    if (!current || !startDate) {
      return false;
    }
    const startDayjs = dayjs(startDate);
    const endDayjs = startDayjs.add(1, 'year').add(1, 'day');

    return current.isBefore(endDayjs, 'day');
  };

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
              onChange={(e) => setFiscalDescriptionName(e.target.value || 'jh')}
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
            ]}
          >
            <DatePicker
              className="h-12 w-full font-normal text-xl mt-2"
              value={endDate}
              onChange={(date) => {
                if (startDate && date && date.isBefore(startDate)) {
                  return;
                }
                setFiscalYearEndDate(date ? date : null);
              }}
              disabledDate={disabledDate}
            />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default FiscalYear;
