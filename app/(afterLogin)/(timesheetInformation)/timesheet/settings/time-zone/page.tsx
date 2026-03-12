'use client';
import { useUpdateTimeZone } from '@/store/server/features/timesheet/timeZone/mutation';
import { useGetTimeZone } from '@/store/server/features/timesheet/timeZone/queries';
import AccessGuard from '@/utils/permissionGuard';
import { Button, Form, Select } from 'antd';
import { Permissions } from '@/types/commons/permissionEnum';
import { IoLocationOutline } from 'react-icons/io5';
import { LuClock3 } from 'react-icons/lu';

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
      className="px-5 rounded-2xl bg-white h-full"
      id="time-attendance-settings-time-zone-container"
      data-cy="time-attendance-settings-time-zone-container"
    >
      <div
        className="rounded-xl border border-gray-200 bg-white p-4"
        id="time-attendance-settings-time-zone-content"
        data-cy="time-attendance-settings-time-zone-content"
      >
        <Form
          onFinish={handleFinish}
          id="time-attendance-settings-time-zone-form"
          data-cy="time-attendance-settings-time-zone-form"
        >
          <div
            id="time-attendance-settings-time-zone-description-container"
            data-cy="time-attendance-settings-time-zone-description-container"
            className="flex items-center gap-2 text-gray-600"
          >
            <IoLocationOutline
              size={20}
              data-cy="time-attendance-settings-time-zone-current-location-icon"
            />
            <span
              id="time-attendance-settings-time-zone-description"
              data-cy="time-attendance-settings-time-zone-description"
            >
              Your Current Timezone
            </span>
          </div>
          <div
            className="mt-2 text-[42px] font-bold leading-[1.1] text-gray-900"
            id="time-attendance-settings-time-zone-current-value"
            data-cy="time-attendance-settings-time-zone-current-value"
          >
            {data?.timezone || '+00:00'} GMT
          </div>
          <div
            id="time-attendance-settings-time-zone-current-value-container"
            data-cy="time-attendance-settings-time-zone-current-value-container"
            className="mt-2 flex items-center gap-2 text-xl text-gray-600"
          >
            <LuClock3
              size={20}
              data-cy="time-attendance-settings-time-zone-current-clock-icon"
            />
            <span
              id="time-attendance-settings-time-zone-current-city"
              data-cy="time-attendance-settings-time-zone-current-city"
            >
              {data?.timezone}
            </span>
          </div>
          <div
            id="time-attendance-settings-time-zone-timezone-select-divider"
            data-cy="time-attendance-settings-time-zone-timezone-select-divider"
            className="my-4 border-t border-gray-200"
          />

          <label
            id="time-attendance-settings-time-zone-timezone-select-label"
            data-cy="time-attendance-settings-time-zone-timezone-select-label"
            className="text-sm font-medium text-gray-900"
            htmlFor="time-attendance-settings-time-zone-timezone-select"
          >
            Select Timezone{' '}
            <span
              id="time-attendance-settings-time-zone-timezone-select-label-asterisk"
              data-cy="time-attendance-settings-time-zone-timezone-select-label-asterisk"
              className="text-red-500"
            >
              *
            </span>
          </label>
          <div
            id="time-attendance-settings-time-zone-timezone-select-container"
            data-cy="time-attendance-settings-time-zone-timezone-select-container"
            className="mt-2 flex items-start gap-3"
          >
            <Form.Item
              name="timezone"
              rules={[
                { required: true, message: 'Please select your timezone!' },
              ]}
              id="time-attendance-settings-time-zone-timezone-field"
              data-cy="time-attendance-settings-time-zone-timezone-field"
              className="mb-0 flex-1"
            >
              <Select
                showSearch
                className="h-10"
                placeholder="Select"
                options={gmtOffsets}
                id="time-attendance-settings-time-zone-timezone-select"
                data-cy="time-attendance-settings-time-zone-timezone-select"
              />
            </Form.Item>
            <Form.Item
              id="time-attendance-settings-time-zone-submit-field"
              data-cy="time-attendance-settings-time-zone-submit-field"
              className="mb-0"
            >
              <AccessGuard
                permissions={[Permissions.UpdateTimeZone]}
                data-cy="time-attendance-settings-time-zone-submit-button-access-guard"
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  className="h-10 px-6 rounded-lg"
                  id="time-attendance-settings-time-zone-submit-button"
                  data-cy="time-attendance-settings-time-zone-submit-button"
                >
                  Update Timezone
                </Button>
              </AccessGuard>
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
};
export default TimezoneSelect;
