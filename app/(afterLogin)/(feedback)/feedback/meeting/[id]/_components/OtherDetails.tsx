import { EnvironmentOutlined } from '@ant-design/icons';
import { Card, TimePicker, Input, Button, Form } from 'antd';
import dayjs from 'dayjs';
import { GoClock } from 'react-icons/go';
import { IoIosLink } from 'react-icons/io';
import { useEffect, useState } from 'react';
import { useUpdateMeeting } from '@/store/server/features/CFR/meeting/mutations';
import NotificationMessage from '@/components/common/notification/notificationMessage';

type Meeting = {
  startAt: string;
  endAt: string;
  otherUser?: string;
  locationType: 'in-person' | 'virtual' | 'hybrid' | string;
  physicalLocation?: string;
  publicAccessLink?: string;
  virtualLink?: string;
  id: string;
};

interface OtherDetailsProps {
  meeting: Meeting;
  loading: boolean;
  canEdit: boolean;
}

export default function OtherDetails({
  meeting,
  loading,
  canEdit,
}: OtherDetailsProps) {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: updateMeeting, isLoading } = useUpdateMeeting();

  const totalMinutes = dayjs(meeting?.endAt).diff(
    dayjs(meeting?.startAt),
    'minute',
  );

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const duration = `${hours}h ${minutes}m`;

  useEffect(() => {
    form.setFieldsValue({
      startAt: dayjs(meeting?.startAt),
      endAt: dayjs(meeting?.endAt),
      otherUser: meeting?.otherUser || '',
      locationType: meeting?.locationType,
      physicalLocation: meeting?.physicalLocation || '',
      virtualLink: meeting?.virtualLink || '',
    });
  }, [meeting, form, isEditing]);

  const handleConfirm = (values: any) => {
    const updatedMeetingObj = {
      startAt: values.startAt,
      endAt: values.endAt,
      locationType: values.locationType,
      physicalLocation: values.physicalLocation,
      virtualLink: values.virtualLink,
      id: meeting.id,
    };
    updateMeeting(updatedMeetingObj, {
      onSuccess() {
        setIsEditing(false);
      },
    });
  };

  return (
    <Card
      bodyStyle={{ padding: 0 }}
      loading={loading}
      className="p-4 space-y-3 border-none"
      data-cy="feedback-meeting-components-otherdetails-card"
      id="feedback-meeting-components-otherdetails-card"
    >
      <h2
        className="text-lg font-bold"
        data-cy="feedback-meeting-components-otherdetails-heading"
        id="feedback-meeting-components-otherdetails-heading"
      >
        Other Details
      </h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleConfirm}
        data-cy="feedback-meeting-components-otherdetails-form"
        id="feedback-meeting-components-otherdetails-form"
      >
        {/* Start and End Time */}
        <div
          className="flex gap-5"
          data-cy="feedback-meeting-components-otherdetails-div-time"
          id="feedback-meeting-components-otherdetails-div-time"
        >
          {isEditing ? (
            <>
              <Form.Item
                name="startAt"
                rules={[
                  { required: true, message: 'Please select start time' },
                ]}
                style={{ flex: 1, marginBottom: 0 }}
                data-cy="feedback-meeting-components-otherdetails-form-item-start"
                id="feedback-meeting-components-otherdetails-form-item-start"
              >
                <TimePicker
                  format="hh:mm A"
                  use12Hours
                  style={{ width: '100%' }}
                  data-cy="feedback-meeting-components-otherdetails-timepicker-start"
                  id="feedback-meeting-components-otherdetails-timepicker-start"
                />
              </Form.Item>
              <Form.Item
                name="endAt"
                dependencies={['startAt']}
                rules={[
                  { required: true, message: 'Please select end time' },
                  ({ getFieldValue }) => ({
                    validator(notused, value) {
                      const start = getFieldValue('startAt');
                      if (!value || !start || value.isAfter(start)) {
                        return Promise.resolve();
                      }
                      NotificationMessage.warning({
                        message: 'Warning',
                        description: 'End time must be after start time',
                      });
                      return Promise.reject(
                        new Error('End time must be after start time'),
                      );
                    },
                  }),
                ]}
                style={{ flex: 1, marginBottom: 0 }}
                data-cy="feedback-meeting-components-otherdetails-form-item-end"
                id="feedback-meeting-components-otherdetails-form-item-end"
              >
                <TimePicker
                  format="hh:mm A"
                  use12Hours
                  style={{ width: '100%' }}
                  data-cy="feedback-meeting-components-otherdetails-timepicker-end"
                  id="feedback-meeting-components-otherdetails-timepicker-end"
                />
              </Form.Item>
            </>
          ) : (
            <>
              <p
                className="w-full border p-3 rounded-lg cursor-pointer font-bold text-[#687588]"
                onClick={() => (canEdit ? setIsEditing(true) : null)}
                title="Click to edit start time"
                data-cy="feedback-meeting-components-otherdetails-text-start"
                id="feedback-meeting-components-otherdetails-text-start"
              >
                {dayjs(meeting?.startAt)?.format('HH:mm A')}
              </p>
              <p
                className="w-full border p-3 rounded-lg cursor-pointer font-bold text-[#687588]"
                onClick={() => (canEdit ? setIsEditing(true) : null)}
                title="Click to edit end time"
                data-cy="feedback-meeting-components-otherdetails-text-end"
                id="feedback-meeting-components-otherdetails-text-end"
              >
                {dayjs(meeting?.endAt)?.format('HH:mm A')}
              </p>
            </>
          )}
        </div>

        {/* Other User */}

        {/* Duration and Location Type */}
        <div
          className="flex gap-5 mt-3"
          data-cy="feedback-meeting-components-otherdetails-div-summary"
          id="feedback-meeting-components-otherdetails-div-summary"
        >
          <div
            className="w-full border p-3 rounded-lg flex items-center gap-3"
            data-cy="feedback-meeting-components-otherdetails-div-duration"
            id="feedback-meeting-components-otherdetails-div-duration"
          >
            <GoClock size={16} />
            <p
              data-cy="feedback-meeting-components-otherdetails-text-duration"
              id="feedback-meeting-components-otherdetails-text-duration"
            >
              {duration}
            </p>
          </div>

          <div
            className="w-full border p-3 rounded-lg flex items-center gap-3 capitalize"
            data-cy="feedback-meeting-components-otherdetails-div-location-type"
            id="feedback-meeting-components-otherdetails-div-location-type"
          >
            <EnvironmentOutlined
              id="feedback-meeting-components-otherdetails-icon-location-type"
              data-cy="feedback-meeting-components-otherdetails-icon-location-type"
            />
            {
              <p
                className="w-full cursor-pointer"
                onClick={() => (canEdit ? setIsEditing(true) : null)}
                title="Click to edit location type"
                data-cy="feedback-meeting-components-otherdetails-text-location-type"
                id="feedback-meeting-components-otherdetails-text-location-type"
              >
                {meeting?.locationType}
              </p>
            }
          </div>
        </div>

        {/* Physical Location */}
        {(meeting?.locationType === 'in-person' ||
          meeting?.locationType === 'hybrid') && (
          <div
            className="w-full border p-3 rounded-lg flex items-center gap-3 mt-3"
            data-cy="feedback-meeting-components-otherdetails-div-physical"
            id="feedback-meeting-components-otherdetails-div-physical"
          >
            <EnvironmentOutlined />
            {isEditing ? (
              <Form.Item
                name="physicalLocation"
                style={{ flex: 1, marginBottom: 0 }}
                data-cy="feedback-meeting-components-otherdetails-form-item-physical"
                id="feedback-meeting-components-otherdetails-form-item-physical"
              >
                <Input
                  placeholder="Physical Location"
                  data-cy="feedback-meeting-components-otherdetails-input-physical"
                  id="feedback-meeting-components-otherdetails-input-physical"
                />
              </Form.Item>
            ) : (
              <p
                className="w-full cursor-pointer"
                onClick={() => (canEdit ? setIsEditing(true) : null)}
                title="Click to edit physical location"
                data-cy="feedback-meeting-components-otherdetails-text-physical"
                id="feedback-meeting-components-otherdetails-text-physical"
              >
                {meeting?.physicalLocation || '-'}
              </p>
            )}
          </div>
        )}

        {/* Virtual Link */}
        {(meeting?.locationType === 'virtual' ||
          meeting?.locationType === 'hybrid') && (
          <div
            className="w-full border p-3 rounded-lg flex items-center gap-3 mt-3"
            data-cy="feedback-meeting-components-otherdetails-div-virtual"
            id="feedback-meeting-components-otherdetails-div-virtual"
          >
            <IoIosLink
              size={16}
              id="feedback-meeting-components-otherdetails-icon-virtual"
              data-cy="feedback-meeting-components-otherdetails-icon-virtual"
            />
            {isEditing ? (
              <Form.Item
                name="virtualLink"
                style={{ flex: 1, marginBottom: 0 }}
                data-cy="feedback-meeting-components-otherdetails-form-item-virtual"
                id="feedback-meeting-components-otherdetails-form-item-virtual"
              >
                <Input
                  placeholder="Virtual Link"
                  data-cy="feedback-meeting-components-otherdetails-input-virtual"
                  id="feedback-meeting-components-otherdetails-input-virtual"
                />
              </Form.Item>
            ) : (
              <p
                className="w-full cursor-pointer"
                onClick={() => (canEdit ? setIsEditing(true) : null)}
                title="Click to edit virtual link"
                data-cy="feedback-meeting-components-otherdetails-text-virtual"
                id="feedback-meeting-components-otherdetails-text-virtual"
              >
                {meeting?.virtualLink}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {isEditing && (
          <div
            className="flex justify-end gap-2 mt-3"
            data-cy="feedback-meeting-components-otherdetails-div-buttons"
            id="feedback-meeting-components-otherdetails-div-buttons"
          >
            <Button
              htmlType="submit"
              type="primary"
              loading={isLoading}
              className="h-10 min-w-16 border-none shadow-none"
              data-cy="feedback-meeting-components-otherdetails-button-save"
              id="feedback-meeting-components-otherdetails-button-save"
            >
              Save
            </Button>
            <Button
              onClick={() => {
                form.resetFields();
                setIsEditing(false);
              }}
              loading={isLoading}
              className="h-10 min-w-16"
              data-cy="feedback-meeting-components-otherdetails-button-cancel"
              id="feedback-meeting-components-otherdetails-button-cancel"
            >
              Cancel
            </Button>
          </div>
        )}
      </Form>
    </Card>
  );
}
