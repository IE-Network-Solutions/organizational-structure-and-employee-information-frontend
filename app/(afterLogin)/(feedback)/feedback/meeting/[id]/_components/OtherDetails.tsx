import { EnvironmentOutlined } from '@ant-design/icons';
import { Card, TimePicker, Input, Button, Form } from 'antd';
import dayjs from 'dayjs';
import { GoClock } from 'react-icons/go';
import { IoIosLink } from 'react-icons/io';
import { useEffect, useState } from 'react';
import { useUpdateMeeting } from '@/store/server/features/CFR/meeting/mutations';

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

  const duration = (
    dayjs(meeting?.endAt).diff(dayjs(meeting?.startAt), 'minute') / 60
  ).toFixed(2);

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
    >
      <h2 className="text-lg font-semibold">Other Details</h2>
      <Form form={form} layout="vertical" onFinish={handleConfirm}>
        {/* Start and End Time */}
        <div className="flex gap-5">
          {isEditing ? (
            <>
              <Form.Item
                name="startAt"
                rules={[
                  { required: true, message: 'Please select start time' },
                ]}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="endAt"
                rules={[{ required: true, message: 'Please select end time' }]}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </>
          ) : (
            <>
              <p
                className="w-full border p-3 rounded-lg cursor-pointer"
                onClick={() => (canEdit ? setIsEditing(true) : null)}
                title="Click to edit start time"
              >
                {dayjs(meeting?.startAt)?.format('HH:mm')}
              </p>
              <p
                className="w-full border p-3 rounded-lg cursor-pointer"
                onClick={() => (canEdit ? setIsEditing(true) : null)}
                title="Click to edit end time"
              >
                {dayjs(meeting?.endAt)?.format('HH:mm')}
              </p>
            </>
          )}
        </div>

        {/* Other User */}

        {/* Duration and Location Type */}
        <div className="flex gap-5 mt-3">
          <div className="w-full border p-3 rounded-lg flex items-center gap-3">
            <GoClock size={16} />
            <p>
              {duration} hour{Number(duration) !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="w-full border p-3 rounded-lg flex items-center gap-3 capitalize">
            <EnvironmentOutlined />
            {
              <p
                className="w-full cursor-pointer"
                onClick={() => (canEdit ? setIsEditing(true) : null)}
                title="Click to edit location type"
              >
                {meeting?.locationType}
              </p>
            }
          </div>
        </div>

        {/* Physical Location */}
        {(meeting?.locationType === 'in-person' ||
          meeting?.locationType === 'hybrid') && (
          <div className="w-full border p-3 rounded-lg flex items-center gap-3 mt-3">
            <EnvironmentOutlined />
            {isEditing ? (
              <Form.Item
                name="physicalLocation"
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Input placeholder="Physical Location" />
              </Form.Item>
            ) : (
              <p
                className="w-full cursor-pointer"
                onClick={() => (canEdit ? setIsEditing(true) : null)}
                title="Click to edit physical location"
              >
                {meeting?.physicalLocation || '-'}
              </p>
            )}
          </div>
        )}

        {/* Virtual Link */}
        {(meeting?.locationType === 'virtual' ||
          meeting?.locationType === 'hybrid') && (
          <div className="w-full border p-3 rounded-lg flex items-center gap-3 mt-3">
            <IoIosLink size={16} />
            {isEditing ? (
              <Form.Item
                name="virtualLink"
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Input placeholder="Virtual Link" />
              </Form.Item>
            ) : (
              <p
                className="w-full cursor-pointer"
                onClick={() => (canEdit ? setIsEditing(true) : null)}
                title="Click to edit virtual link"
              >
                {meeting?.virtualLink}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-2 mt-3">
            <Button
              htmlType="submit"
              type="primary"
              loading={isLoading}
              className="text-[10px] h-5 min-w-16 border-none shadow-none"
            >
              Save
            </Button>
            <Button
              onClick={() => {
                form.resetFields();
                setIsEditing(false);
              }}
              loading={isLoading}
              className="text-[10px] h-5 min-w-16"
            >
              Cancel
            </Button>
          </div>
        )}
      </Form>
    </Card>
  );
}
