'use client';
import { useUpdateTimeZone } from '@/store/server/features/timesheet/timeZone/mutation';
import { useGetTimeZone } from '@/store/server/features/timesheet/timeZone/queries';
import AccessGuard from '@/utils/permissionGuard';
import { Button, Form, Select } from 'antd';
import { Permissions } from '@/types/commons/permissionEnum';

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

const TimezoneSelect = () => {
  const { data } = useGetTimeZone();
  const { mutate: updateTimeZone, isLoading } = useUpdateTimeZone();

  const handleFinish = (values: any) => {
    if (data) {
      updateTimeZone({ ...values, id: data.id });
    }
  };
  return (
    <div
      className="p-5 rounded-2xl bg-white h-full"
      id="time-attendance-settings-time-zone-container"
      data-cy="time-attendance-settings-time-zone-container"
    >
      {/* <PageHeader title="Time Zone" size="small"></PageHeader> */}
      <h1
        className="text-lg text-bold"
        id="time-attendance-settings-time-zone-title"
        data-cy="time-attendance-settings-time-zone-title"
      >
        Time Zone
      </h1>

      <div
        className="mt-4"
        id="time-attendance-settings-time-zone-content"
        data-cy="time-attendance-settings-time-zone-content"
      >
        <div
          id="time-attendance-settings-time-zone-description"
          data-cy="time-attendance-settings-time-zone-description"
        >
          Update your timezone
        </div>

        <Form
          onFinish={handleFinish}
          id="time-attendance-settings-time-zone-form"
          data-cy="time-attendance-settings-time-zone-form"
        >
          <Form.Item
            name="timezone"
            rules={[
              { required: true, message: 'Please select your timezone!' },
            ]}
            id="time-attendance-settings-time-zone-timezone-field"
            data-cy="time-attendance-settings-time-zone-timezone-field"
          >
            <Select
              showSearch
              placeholder="Select GMT offset"
              style={{ width: 200 }}
              options={gmtOffsets}
              id="time-attendance-settings-time-zone-timezone-select"
              data-cy="time-attendance-settings-time-zone-timezone-select"
            />
          </Form.Item>
          <Form.Item id="time-attendance-settings-time-zone-submit-field" data-cy="time-attendance-settings-time-zone-submit-field">
            <AccessGuard
              permissions={[Permissions.UpdateTimeZone]}
              data-cy="time-attendance-settings-time-zone-submit-button-access-guard"
            >
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                id="time-attendance-settings-time-zone-submit-button"
                data-cy="time-attendance-settings-time-zone-submit-button"
              >
                Update Timezone
              </Button>
            </AccessGuard>
          </Form.Item>
        </Form>
        <hr />
        <div
          className="text-xl"
          id="time-attendance-settings-time-zone-current"
          data-cy="time-attendance-settings-time-zone-current"
        >
          Your Current Timezone:
          <span
            className="font-extrabold"
            id="time-attendance-settings-time-zone-current-value"
            data-cy="time-attendance-settings-time-zone-current-value"
          >
            {data?.timezone} GMT
          </span>{' '}
        </div>
      </div>
    </div>
  );
};
export default TimezoneSelect;
