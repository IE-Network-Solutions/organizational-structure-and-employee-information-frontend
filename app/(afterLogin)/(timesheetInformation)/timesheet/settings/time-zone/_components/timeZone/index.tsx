'use client';
import { useUpdateTimeZone } from '@/store/server/features/timesheet/timeZone/mutation';
import { useGetTimeZone } from '@/store/server/features/timesheet/timeZone/queries';
import { Button, Form, Select } from 'antd';

// Define the type for GMT offset options
interface GmtOffsetOption {
  value: string;
  label: string;
}
// eslint-disable-next-line @typescript-eslint/naming-convention
const gmtOffsets: GmtOffsetOption[] = Array.from({ length: 27 }, (_, i) => {
  // eslint-enable-next-line @typescript-eslint/naming-convention
  const hour = i - 12;
  const sign = hour >= 0 ? '+' : '-';
  const absHour = Math.abs(hour).toString().padStart(2, '0');

  const minuteOptions: string[] =
    hour === -12 || hour === 14
      ? ['00']
      : [3, 5, 9, 10].includes(hour)
        ? ['00', '30']
        : [5.75, 8.75, 12.75].includes(hour)
          ? ['45']
          : ['00', '15', '30', '45'];

  return minuteOptions.map((min) => ({
    value: `${sign}${absHour}:${min}`,
    label: `GMT ${sign}${absHour}:${min}`,
  }));
}).flat();

const TimezoneComponent = () => {
  const { data } = useGetTimeZone();
  const { mutate: updateTimeZone, isLoading } = useUpdateTimeZone();

  const handleFinish = (values: any) => {
    if (data) {
      updateTimeZone({ ...values, id: data.id });
    }
  };
  return (
    <>

      <div className="mt-4">

        <Form onFinish={handleFinish}>
          <Form.Item
            name="timezone"
            rules={[
              { required: true, message: 'Please select your timezone!' },
            ]}
          >
            <Select
              showSearch
              placeholder="Select GMT offset"
              style={{ width: 200 }}
              options={gmtOffsets}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Set Timezone
            </Button>
          </Form.Item>
        </Form>
        <hr />
        <div className="text-xl">
          Your Current Timezone:{' '}
          <span className="font-extrabold">{data?.timezone} GMT</span>{' '}
        </div>
      </div>
    </>
  );
};
export default TimezoneComponent;
