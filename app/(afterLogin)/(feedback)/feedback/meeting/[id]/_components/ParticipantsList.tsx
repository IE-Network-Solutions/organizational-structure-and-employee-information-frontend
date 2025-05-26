'use client';

import {
  Tag,
  Avatar,
  Button,
  Tooltip,
  Spin,
  Form,
  Checkbox,
  Input,
  Popconfirm,
} from 'antd';
import AddParticipantsPopconfirm from './AddParticipant';
import { LoadingOutlined, UserOutlined } from '@ant-design/icons';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { useState } from 'react';
import {
  useDeleteMeetingAttendees,
  useUpdateMeetingAttendees,
} from '@/store/server/features/CFR/meeting/mutations';
import { useGetMeetingAttendees } from '@/store/server/features/CFR/meeting/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { MdClose } from 'react-icons/md';

const statusColorMap: Record<string, string> = {
  Revert: 'red',
  Confirmed: 'green',
  Confirm: 'blue',
  'Not Confirmed': 'orange',
};

interface ParticipantsListProps {
  meeting: any;
  loading: boolean;
  canEdit: boolean;
}

export default function ParticipantsList({
  meeting,
  loading,
  canEdit,
}: ParticipantsListProps) {
  const { mutate: updateAttendance, isLoading: updateAttendeesLoading } =
    useUpdateMeetingAttendees();
  const { mutate: deleteParticipant, isLoading: deleteParticipantLoading } =
    useDeleteMeetingAttendees();
  const { data: meetingAttendees, isLoading: getAttendeesLoading } =
    useGetMeetingAttendees(meeting?.id);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const userId = useAuthenticationStore.getState().userId;
  const EmployeeDetails = ({
    empId,
    isEmp,
    guest,
    id,
    attendanceStatus,
    absentismReason,
    lateBy,
  }: {
    empId: string;
    isEmp: boolean;
    guest: any;
    id: string;
    attendanceStatus: string;
    absentismReason: string;
    lateBy: number;
  }) => {
    const { data: userDetails, isLoading } = useGetEmployee(empId);

    const [form] = Form.useForm();
    const [visible, setVisible] = useState(false);
    const formValues = Form.useWatch([], form) || {};
    const handleSubmit = async () => {
      try {
        const values = await form.validateFields();
        const { isLate, isAbsent, reason, time } = values;
        const payload = {
          reason: isAbsent ? reason : null,
          lateBy: isLate ? Number(time) : null,
          absentismReason: isAbsent ? reason : null,
          meetingId: meeting?.id,
          userId: isEmp ? empId : null,
          guestUser: isEmp ? null : { name: guest?.name, email: guest?.email },
          attendanceStatus: isAbsent ? 'absent' : isLate ? 'late' : 'attended',
          id,
        };
        updateAttendance(payload, {
          onSuccess: () => {
            form.resetFields();
            setVisible(false);
          },
        });
      } catch (error) {
        // Validation failed
      }
    };

    const handleCheckboxChange = (field: 'isLate' | 'isAbsent') => {
      const current = form.getFieldValue(field);
      const opposite = field === 'isLate' ? 'isAbsent' : 'isLate';
      form.setFieldsValue({ [field]: !current, [opposite]: false });
    };

    const userName = isEmp
      ? `${userDetails?.firstName} ${userDetails?.middleName} ${userDetails?.lastName}`
      : guest?.name;
    const email = isEmp ? userDetails?.email : guest?.email;
    const profileImage = userDetails?.profileImage;

    if (isEmp && isLoading) {
      return <Spin indicator={<LoadingOutlined />} />;
    }

    const content = (
      <div className="w-60">
        <div className="flex items-center gap-3 mb-3">
          <Avatar src={profileImage} icon={<UserOutlined />} />
          <div>
            <p className="font-semibold text-sm">{userName}</p>
            <p className="text-xs text-gray-500">{email}</p>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          className="space-y-3"
          initialValues={{ isLate: false, isAbsent: false }}
        >
          <div className="flex gap-2 items-center">
            <Form.Item name="isLate" className="mb-0">
              <Checkbox onChange={() => handleCheckboxChange('isLate')}>
                Is Late
              </Checkbox>
            </Form.Item>
            <Form.Item name="isAbsent" className="mb-0">
              <Checkbox onChange={() => handleCheckboxChange('isAbsent')}>
                Is Absent
              </Checkbox>
            </Form.Item>
          </div>

          {formValues?.isAbsent && (
            <Form.Item
              name="reason"
              label="Reason"
              rules={[{ required: true, message: 'Please provide a reason' }]}
            >
              <Input.TextArea rows={2} placeholder="Reason for absence" />
            </Form.Item>
          )}

          {formValues?.isLate && (
            <Form.Item
              name="time"
              label="Time"
              rules={[{ required: true, message: 'Please provide the time' }]}
            >
              <Input placeholder="e.g., 10 mins" />
            </Form.Item>
          )}
        </Form>

        <Button
          loading={updateAttendeesLoading}
          className="mt-2"
          type="primary"
          block
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
    );

    const details = (
      <div className="flex gap-2 items-center">
        <Avatar src={profileImage} icon={<UserOutlined />} />
        <div>
          <span className="text-[10px]">{userName}</span>
          <Tooltip title={email}>
            <div className="text-[8px] text-gray-500">
              {email?.length >= 20 ? email?.slice(0, 20) + '...' : email}
            </div>
          </Tooltip>
          {attendanceStatus == 'absent' ? (
            <div className="text-[8px] bg-red-100 text-red-500 py-[2px] rounded-lg px-2 mt-1 ">
              Absent reason: <strong> {absentismReason}</strong>
            </div>
          ) : attendanceStatus == 'late' ? (
            <div className="text-[8px] bg-yellow-100 text-yellow-500 py-[2px] rounded-lg px-2 mt-1">
              Late By: <strong>{lateBy} min </strong>
            </div>
          ) : null}
        </div>
      </div>
    );

    return isEmp ? (
      <Popconfirm
        title={content}
        open={visible}
        onOpenChange={setVisible}
        icon={null}
        okButtonProps={{ style: { display: 'none' } }}
        cancelButtonProps={{ style: { display: 'none' } }}
        disabled={canEdit == false}
      >
        {details}
      </Popconfirm>
    ) : (
      <Popconfirm
        title={content}
        open={visible}
        onOpenChange={setVisible}
        icon={null}
        okButtonProps={{ style: { display: 'none' } }}
        cancelButtonProps={{ style: { display: 'none' } }}
        disabled={canEdit}
      >
        {details}
      </Popconfirm>
    );
  };
  function handleConfirm(
    id: string,
    acknowledgedMom: boolean,
    attendanceStatus: string,
  ) {
    updateAttendance({ id, acknowledgedMom, attendanceStatus });
  }
  function handleDeleteParticipant(id: string) {
    deleteParticipant(id);
  }
  return (
    <div className="p-4 space-y-3">
      <div className="flex justify-between items-center py-2">
        <h2 className="text-lg font-semibold mb-2">List of Participants</h2>
        {canEdit && (
          <AddParticipantsPopconfirm
            meetingId={meeting?.id}
            loading={loading}
          />
        )}
      </div>

      {loading || getAttendeesLoading ? (
        <div className="flex justify-center">
          <Spin />
        </div>
      ) : (
        meetingAttendees?.items?.map((p: any, i: number) => (
          <div
            key={i}
            className="flex justify-between items-center border p-2 rounded-md"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex flex-col items-start  ">
              <EmployeeDetails
                isEmp={p?.userId != null}
                empId={p?.userId}
                guest={p.guestUser}
                id={p.id}
                attendanceStatus={p.attendanceStatus}
                absentismReason={p.absentismReason}
                lateBy={p.lateBy}
              />
            </div>
            {userId != p.userId ? (
              hoveredIndex != i ? (
                deleteParticipantLoading == false ? (
                  <>
                    <Tag
                      className="font-bold border-none min-w-16 text-center capitalize text-[8px] mr-0"
                      color={statusColorMap[p.attendanceStatus]}
                      onMouseEnter={() => (canEdit ? setHoveredIndex(i) : null)}
                    >
                      {p.attendanceStatus}
                    </Tag>
                  </>
                ) : (
                  <LoadingOutlined className="text-blue-500" />
                )
              ) : (
                <Popconfirm
                  title="Are you sure you want to remove this participant?"
                  onConfirm={() => handleDeleteParticipant(p.id)}
                  okText="Delete"
                  cancelText="Cancel"
                  icon={null}
                  okButtonProps={{
                    className: 'bg-red-400 text-white border-none',
                  }}
                  cancelButtonProps={{
                    className: 'hover:bg-gray-100',
                  }}
                >
                  <MdClose className="cursor-pointer min-w-16" />
                </Popconfirm>
              )
            ) : p.acknowledgedMom == false ? (
              <Popconfirm
                title="Are you sure you want to confirm MoM?"
                onConfirm={() => handleConfirm(p.id, true, p.attendanceStatus)}
                okText="Confirm"
                cancelText="Cancel"
                icon={null}
              >
                <Button
                  loading={updateAttendeesLoading}
                  className="text-[8px] py-1 bg-blue text-white border-none rounded-md h-5 min-w-16"
                >
                  Confirm
                </Button>
              </Popconfirm>
            ) : (
              <Popconfirm
                title="Are you sure you want to revert MoM?"
                onConfirm={() => handleConfirm(p.id, false, p.attendanceStatus)}
                okText="Revert"
                cancelText="Cancel"
                icon={null}
              >
                <Button
                  loading={updateAttendeesLoading}
                  className="text-[8px] py-1 bg-white text-red-500 border border-red-500 rounded-md h-5 min-w-16"
                >
                  Revert
                </Button>
              </Popconfirm>
            )}
          </div>
        ))
      )}
    </div>
  );
}
