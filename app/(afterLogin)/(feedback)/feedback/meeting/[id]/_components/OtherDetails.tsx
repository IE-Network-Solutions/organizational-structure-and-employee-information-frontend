import { EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { Card, TimePicker, Input, Button, Form, Avatar, Skeleton } from 'antd';
import dayjs from 'dayjs';
import { GoClock } from 'react-icons/go';
import { IoIosLink } from 'react-icons/io';
import { IoLocationOutline } from 'react-icons/io5';
import { MdPersonOutline } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { useUpdateMeeting } from '@/store/server/features/CFR/meeting/mutations';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { meetingFormRequiredMark } from '../../_component/meetingFormRequiredMark';

type Meeting = {
  startAt: string;
  endAt: string;
  otherUser?: string;
  locationType: 'in-person' | 'virtual' | 'hybrid' | string;
  physicalLocation?: string;
  publicAccessLink?: string;
  virtualLink?: string;
  id: string;
  chairpersonId?: string;
};

function formatTimeDisplay(iso?: string) {
  if (!iso) return '—';
  return dayjs(iso).format('hh:mm A');
}

function locationSummaryText(meeting?: Meeting | null): string {
  if (!meeting) return '—';
  if (
    meeting?.physicalLocation &&
    (meeting.locationType === 'in-person' || meeting.locationType === 'hybrid')
  ) {
    return meeting.physicalLocation;
  }
  if (
    meeting?.virtualLink &&
    (meeting.locationType === 'virtual' || meeting.locationType === 'hybrid')
  ) {
    const v = meeting.virtualLink;
    return v.length > 48 ? `${v.slice(0, 48)}…` : v;
  }
  if (meeting?.locationType) {
    return String(meeting.locationType).replace(/-/g, ' ');
  }
  return '—';
}

function ChairPersonSummary({ chairpersonId }: { chairpersonId?: string }) {
  const { data: userDetails, isLoading } = useGetEmployee(chairpersonId ?? '');
  const name = userDetails
    ? `${userDetails?.firstName ?? ''} ${userDetails?.middleName ?? ''} ${userDetails?.lastName ?? ''}`.trim() ||
      '—'
    : '—';

  return (
    <div
      className="flex gap-3 items-center border border-[#D9D9D9] rounded-lg p-3 h-full bg-white"
      data-cy="feedback-meeting-otherdetails-chair-card"
    >
      <div
        className="flex h-6 w-6 shrink-0 items-center justify-center"
        data-cy="feedback-meeting-otherdetails-chair-icon-wrap"
      >
        <MdPersonOutline size={20} className="text-black/45" />
      </div>
      <div
        className="min-w-0 flex-1"
        data-cy="feedback-meeting-otherdetails-chair-main"
      >
        <div
          className="text-[14px] text-black/45 mb-0.5"
          data-cy="feedback-meeting-otherdetails-chair-label"
        >
          Chair Person
        </div>
        <div
          className="flex items-center gap-2 min-w-0"
          data-cy="feedback-meeting-otherdetails-chair-row"
        >
          <Avatar
            size={28}
            src={userDetails?.profileImage}
            icon={<UserOutlined />}
          />
          <span
            className="text-[14px] font-medium text-[#262626] truncate"
            data-cy="feedback-meeting-otherdetails-chair-name"
          >
            {isLoading ? '…' : name}
          </span>
        </div>
      </div>
    </div>
  );
}

interface OtherDetailsProps {
  meeting: Meeting;
  loading: boolean;
  canEdit: boolean;
  variant?: 'default' | 'panelSummary';
  /** Increment from parent (e.g. header edit) to open the form editor. */
  editTrigger?: number;
}

export default function OtherDetails({
  meeting,
  loading,
  canEdit,
  variant = 'default',
  editTrigger = 0,
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

  useEffect(() => {
    if (variant === 'panelSummary' && editTrigger > 0) {
      setIsEditing(true);
    }
  }, [editTrigger, variant]);

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

  const showDetailRows =
    variant === 'default' || (variant === 'panelSummary' && isEditing);

  const openEdit = () => {
    if (canEdit) setIsEditing(true);
  };

  return (
    <Card
      bodyStyle={{ padding: 0 }}
      loading={false}
      className={`border-none shadow-none ${variant === 'panelSummary' ? '!p-0' : 'p-4 space-y-3'}`}
      data-cy="feedback-meeting-components-otherdetails-card"
      id="feedback-meeting-components-otherdetails-card"
    >
      {loading ? (
        variant === 'panelSummary' ? (
          <div
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            data-cy="feedback-meeting-otherdetails-panel-loading-skeleton"
          >
            {[0, 1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                active
                paragraph={{ rows: 2 }}
                title={false}
                className="rounded-lg"
              />
            ))}
          </div>
        ) : (
          <>
            <h2
              className="text-lg font-bold"
              data-cy="feedback-meeting-components-otherdetails-heading"
              id="feedback-meeting-components-otherdetails-heading"
            >
              Other Details
            </h2>
            <Skeleton
              active
              title={false}
              paragraph={{ rows: 8 }}
              className="mt-2"
              data-cy="feedback-meeting-otherdetails-default-loading-skeleton"
            />
          </>
        )
      ) : (
        <>
          {variant === 'default' ? (
            <h2
              className="text-lg font-bold"
              data-cy="feedback-meeting-components-otherdetails-heading"
              id="feedback-meeting-components-otherdetails-heading"
            >
              Other Details
            </h2>
          ) : null}
          <Form
            form={form}
            layout="vertical"
            className="meeting-form-field-spacing"
            requiredMark={meetingFormRequiredMark}
            onFinish={handleConfirm}
            data-cy="feedback-meeting-components-otherdetails-form"
            id="feedback-meeting-components-otherdetails-form"
          >
            {variant === 'panelSummary' && !isEditing ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                data-cy="feedback-meeting-components-otherdetails-summary-grid"
              >
                <button
                  type="button"
                  className="text-left w-full"
                  onClick={openEdit}
                  disabled={!canEdit}
                  data-cy="feedback-meeting-components-otherdetails-summary-start"
                >
                  <div
                    className={`flex gap-3 items-center border border-[#D9D9D9] rounded-lg p-3 h-full bg-white ${canEdit ? 'cursor-pointer hover:border-[#91CAFF]' : ''}`}
                    data-cy="feedback-meeting-otherdetails-summary-start-inner"
                  >
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center"
                      data-cy="feedback-meeting-otherdetails-summary-start-icon-wrap"
                    >
                      <GoClock size={20} className="text-black/45" />
                    </div>
                    <div
                      className="min-w-0 flex-1"
                      data-cy="feedback-meeting-otherdetails-summary-start-body"
                    >
                      <div
                        className="text-[14px] text-black/45 mb-0.5"
                        data-cy="feedback-meeting-otherdetails-summary-start-label"
                      >
                        Start Time
                      </div>
                      <div
                        className="text-[14px] font-medium text-[#262626]"
                        data-cy="feedback-meeting-otherdetails-summary-start-value"
                      >
                        {formatTimeDisplay(meeting?.startAt)}
                      </div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  className="text-left w-full"
                  onClick={openEdit}
                  disabled={!canEdit}
                  data-cy="feedback-meeting-components-otherdetails-summary-end"
                >
                  <div
                    className={`flex gap-3 items-center border border-[#D9D9D9] rounded-lg p-3 h-full bg-white ${canEdit ? 'cursor-pointer hover:border-[#91CAFF]' : ''}`}
                    data-cy="feedback-meeting-otherdetails-summary-end-inner"
                  >
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center"
                      data-cy="feedback-meeting-otherdetails-summary-end-icon-wrap"
                    >
                      <GoClock size={20} className="text-black/45" />
                    </div>
                    <div
                      className="min-w-0 flex-1"
                      data-cy="feedback-meeting-otherdetails-summary-end-body"
                    >
                      <div
                        className="text-[14px] text-black/45 mb-0.5"
                        data-cy="feedback-meeting-otherdetails-summary-end-label"
                      >
                        End Time
                      </div>
                      <div
                        className="text-[14px] font-medium text-[#262626]"
                        data-cy="feedback-meeting-otherdetails-summary-end-value"
                      >
                        {formatTimeDisplay(meeting?.endAt)}
                      </div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  className="text-left w-full"
                  onClick={openEdit}
                  disabled={!canEdit}
                  data-cy="feedback-meeting-components-otherdetails-summary-location"
                >
                  <div
                    className={`flex gap-3 items-center border border-[#D9D9D9] rounded-lg p-3 h-full bg-white ${canEdit ? 'cursor-pointer hover:border-[#91CAFF]' : ''}`}
                    data-cy="feedback-meeting-otherdetails-summary-location-inner"
                  >
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center"
                      data-cy="feedback-meeting-otherdetails-summary-location-icon-wrap"
                    >
                      <IoLocationOutline size={20} className="text-black/45" />
                    </div>
                    <div
                      className="min-w-0 flex-1"
                      data-cy="feedback-meeting-otherdetails-summary-location-body"
                    >
                      <div
                        className="text-[14px] text-black/45 mb-0.5"
                        data-cy="feedback-meeting-otherdetails-summary-location-label"
                      >
                        Location
                      </div>
                      <div
                        className="text-[14px] font-medium text-[#262626] break-words"
                        data-cy="feedback-meeting-otherdetails-summary-location-value"
                      >
                        {locationSummaryText(meeting)}
                      </div>
                    </div>
                  </div>
                </button>
                <ChairPersonSummary chairpersonId={meeting?.chairpersonId} />
              </div>
            ) : null}

            {showDetailRows ? (
              <>
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
                          {
                            required: true,
                            message: 'Please select start time',
                          },
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
                                description:
                                  'End time must be after start time',
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
                        {formatTimeDisplay(meeting?.startAt)}
                      </p>
                      <p
                        className="w-full border p-3 rounded-lg cursor-pointer font-bold text-[#687588]"
                        onClick={() => (canEdit ? setIsEditing(true) : null)}
                        title="Click to edit end time"
                        data-cy="feedback-meeting-components-otherdetails-text-end"
                        id="feedback-meeting-components-otherdetails-text-end"
                      >
                        {formatTimeDisplay(meeting?.endAt)}
                      </p>
                    </>
                  )}
                </div>

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
                    <p
                      className="w-full cursor-pointer"
                      onClick={() => (canEdit ? setIsEditing(true) : null)}
                      title="Click to edit location type"
                      data-cy="feedback-meeting-components-otherdetails-text-location-type"
                      id="feedback-meeting-components-otherdetails-text-location-type"
                    >
                      {meeting?.locationType}
                    </p>
                  </div>
                </div>

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
              </>
            ) : null}

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
        </>
      )}
    </Card>
  );
}
