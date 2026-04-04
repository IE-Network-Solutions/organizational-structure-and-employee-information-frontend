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
  InputNumber,
  Modal,
} from 'antd';
import AddParticipantsPopconfirm from './AddParticipant';
import { LoadingOutlined, UserOutlined } from '@ant-design/icons';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { useEffect, useState } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { MdClose } from 'react-icons/md';
import {
  useDeleteMeetingAttendees,
  useUpdateMeetingAttendees,
} from '@/store/server/features/CFR/meeting/attendees/mutations';
import { useGetMeetingAttendees } from '@/store/server/features/CFR/meeting/attendees/queries';

const statusColorMap: Record<string, string> = {
  absent: 'red',
  Confirmed: 'green',
  attended: 'blue',
  late: 'orange',
};

/** Panel strip: photo fills the circle without letterboxing (object-fit cover). */
const panelPreviewAvatarClassName =
  'shrink-0 overflow-hidden opacity-100 rounded-[100px] border-[2px] border-solid border-[#D9D9D9] [&_img]:h-full [&_img]:w-full [&_img]:object-cover';

function ParticipantPreviewAvatar({
  userId,
  guestUser,
}: {
  userId?: string | null;
  guestUser?: any;
}) {
  const isEmp = userId != null && userId !== '';
  const { data: userDetails, isLoading } = useGetEmployee(
    isEmp ? String(userId) : '',
  );

  if (isEmp && isLoading) {
    return (
      <Avatar
        size={28}
        icon={<UserOutlined />}
        className={panelPreviewAvatarClassName}
      />
    );
  }

  const fullName = isEmp
    ? `${userDetails?.firstName ?? ''} ${userDetails?.middleName ?? ''} ${userDetails?.lastName ?? ''}`.trim() ||
      '—'
    : guestUser?.name || 'Guest';
  const profileImage = isEmp ? userDetails?.profileImage : undefined;
  const initial = (fullName?.charAt(0) || '?').toUpperCase();

  return (
    <Tooltip title={fullName}>
      <Avatar
        size={28}
        src={profileImage || undefined}
        icon={isEmp && !profileImage ? <UserOutlined /> : undefined}
        className={
          !isEmp
            ? `${panelPreviewAvatarClassName} !bg-[#E6F4FF] !text-[#1677FF] font-medium`
            : panelPreviewAvatarClassName
        }
      >
        {!isEmp ? initial : null}
      </Avatar>
    </Tooltip>
  );
}

interface ParticipantsListProps {
  meeting: any;
  loading: boolean;
  canEdit: boolean;
  /** Compact avatar strip + View All modal (meeting detail panel). */
  variant?: 'list' | 'panel';
}

export default function ParticipantsList({
  meeting,
  loading,
  canEdit,
  variant = 'list',
}: ParticipantsListProps) {
  const { mutate: updateAttendance, isLoading: updateAttendeesLoading } =
    useUpdateMeetingAttendees();
  const { mutate: deleteParticipant, isLoading: deleteParticipantLoading } =
    useDeleteMeetingAttendees();
  const { data: meetingAttendees, isLoading: getAttendeesLoading } =
    useGetMeetingAttendees(meeting?.id);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [viewAllModalOpen, setViewAllModalOpen] = useState(false);

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
    useEffect(() => {
      if (visible) {
        const isAbsent = attendanceStatus === 'absent';
        const isLate = attendanceStatus === 'late';

        form.setFieldsValue({
          isAbsent,
          isLate,
          reason: isAbsent ? absentismReason : undefined,
          time: isLate ? lateBy?.toString() : undefined,
        });
      }
    }, [visible, attendanceStatus, absentismReason, lateBy]);
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

    const userName = isEmp
      ? `${userDetails?.firstName} ${userDetails?.middleName} ${userDetails?.lastName}`
      : guest?.name;
    const email = isEmp ? userDetails?.email : guest?.email;
    const profileImage = userDetails?.profileImage;

    if (isEmp && isLoading) {
      return (
        <Spin
          indicator={
            <LoadingOutlined
              id="feedback-meeting-components-participantslist-spin-employee-icon"
              data-cy="feedback-meeting-components-participantslist-spin-employee-icon"
            />
          }
          data-cy="feedback-meeting-components-participantslist-spin-employee"
        />
      );
    }

    const content = (
      <div
        className="w-60"
        data-cy="feedback-meeting-components-participantslist-popconfirm-content"
        id="feedback-meeting-components-participantslist-popconfirm-content"
      >
        <div
          className="flex items-center gap-3 mb-3"
          data-cy="feedback-meeting-components-participantslist-popconfirm-content-div"
          id="feedback-meeting-components-participantslist-popconfirm-content-div"
        >
          <Avatar
            src={profileImage}
            icon={
              <UserOutlined
                data-cy="feedback-meeting-components-participantslist-avatar-icon"
                id="feedback-meeting-components-participantslist-avatar-icon"
              />
            }
            data-cy="feedback-meeting-components-participantslist-avatar"
          />
          <div
            data-cy="feedback-meeting-components-participantslist-popconfirm-content-div-text"
            id="feedback-meeting-components-participantslist-popconfirm-content-div-text"
          >
            <Tooltip
              title={userName}
              data-cy={`feedback-meeting-components-tooltip-${userName}`}
            >
              <p
                className="font-semibold text-sm"
                data-cy="feedback-meeting-components-participantslist-popconfirm-content-div-text-p"
                id="feedback-meeting-components-participantslist-popconfirm-content-div-text-p"
              >
                {' '}
                {userName?.length >= 20
                  ? userName?.slice(0, 20) + '...'
                  : userName}
              </p>
            </Tooltip>
            <Tooltip
              title={email}
              data-cy="feedback-meeting-components-participantslist-popconfirm-content-div-text-tooltip"
              id="feedback-meeting-components-participantslist-popconfirm-content-div-text-tooltip"
            >
              <div
                className="text-sm text-gray-500"
                data-cy="feedback-meeting-components-participantslist-popconfirm-content-div-text-div"
                id="feedback-meeting-components-participantslist-popconfirm-content-div-text-div"
              >
                {email?.length >= 20 ? email?.slice(0, 20) + '...' : email}
              </div>
            </Tooltip>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          className="space-y-3"
          initialValues={{ isLate: false, isAbsent: false }}
          onValuesChange={(changedValues) => {
            if (changedValues.isLate) {
              form.setFieldsValue({ isAbsent: false });
            }
            if (changedValues.isAbsent) {
              form.setFieldsValue({ isLate: false });
            }
          }}
          data-cy="feedback-meeting-components-participantslist-form"
        >
          <div
            className="flex gap-2 items-center"
            data-cy="feedback-meeting-components-participantslist-div-flags"
            id="feedback-meeting-components-participantslist-div-flags"
          >
            <Form.Item
              name="isLate"
              valuePropName="checked"
              className="mb-0"
              data-cy="feedback-meeting-components-participantslist-form-item-islate"
              id="feedback-meeting-components-participantslist-form-item-islate"
            >
              <Checkbox
                id="feedback-meeting-components-participantslist-checkbox-islate"
                data-cy="feedback-meeting-components-participantslist-checkbox-islate"
              >
                Is Late
              </Checkbox>
            </Form.Item>

            <Form.Item
              name="isAbsent"
              valuePropName="checked"
              className="mb-0"
              data-cy="feedback-meeting-components-participantslist-form-item-isabsent"
              id="feedback-meeting-components-participantslist-form-item-isabsent"
            >
              <Checkbox
                id="feedback-meeting-components-participantslist-checkbox-isabsent"
                data-cy="feedback-meeting-components-participantslist-checkbox-isabsent"
              >
                Is Absent
              </Checkbox>
            </Form.Item>
          </div>

          {formValues?.isAbsent && (
            <Form.Item
              name="reason"
              label="Reason"
              rules={[{ required: true, message: 'Please provide a reason' }]}
              data-cy="feedback-meeting-components-participantslist-form-item-reason"
              id="feedback-meeting-components-participantslist-form-item-reason"
            >
              <Input.TextArea
                rows={2}
                placeholder="Reason for absence"
                data-cy="feedback-meeting-components-participantslist-textarea-reason"
                id="feedback-meeting-components-participantslist-textarea-reason"
              />
            </Form.Item>
          )}

          {formValues?.isLate && (
            <Form.Item
              name="time"
              label="Time"
              rules={[
                { required: true, message: 'Please provide the time' },
                {
                  validator: (notused, value) => {
                    if (value === undefined || value === null || value <= 0) {
                      return Promise.reject(
                        new Error('Time must be greater than 0'),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              data-cy="feedback-meeting-components-participantslist-form-item-time"
              id="feedback-meeting-components-participantslist-form-item-time"
            >
              <InputNumber
                className="w-full"
                placeholder="e.g., 10 mins"
                parser={(value) => {
                  const num = value?.replace(/[^\d]/g, '');
                  return num ? Number(num) : '';
                }}
                data-cy="feedback-meeting-components-participantslist-inputnumber-time"
                id="feedback-meeting-components-participantslist-inputnumber-time"
              />
            </Form.Item>
          )}
        </Form>

        <Button
          loading={updateAttendeesLoading}
          className="mt-2"
          type="primary"
          block
          onClick={handleSubmit}
          data-cy="feedback-meeting-components-participantslist-button-submit"
          id="feedback-meeting-components-participantslist-button-submit"
        >
          Submit
        </Button>
      </div>
    );

    const details = (
      <div
        className="flex gap-2 items-center"
        data-cy={`feedback-meeting-components-participantslist-details-${id}`}
        id={`feedback-meeting-components-participantslist-details-${id}`}
      >
        <Avatar
          src={profileImage}
          icon={
            <UserOutlined
              data-cy={`feedback-meeting-components-participantslist-icon-${id}`}
            />
          }
          data-cy={`feedback-meeting-components-participantslist-avatar-display-${id}`}
        />
        <div
          data-cy={`feedback-meeting-components-participantslist-div-text-${id}`}
          id={`feedback-meeting-components-participantslist-div-text-${id}`}
        >
          <span
            className="text-[10px]"
            data-cy={`feedback-meeting-components-participantslist-span-name-${id}`}
            id={`feedback-meeting-components-participantslist-span-name-${id}`}
          >
            {userName?.length >= 20 ? userName?.slice(0, 20) + '...' : userName}
          </span>
          <Tooltip
            title={email}
            id={`feedback-meeting-components-participantslist-tooltip-email-${id}`}
            data-cy={`feedback-meeting-components-participantslist-tooltip-email-${id}`}
          >
            <div
              className="text-[8px] text-gray-500"
              data-cy={`feedback-meeting-components-participantslist-span-email-${id}`}
              id={`feedback-meeting-components-participantslist-span-email-${id}`}
            >
              {email?.length >= 20 ? email?.slice(0, 20) + '...' : email}
            </div>
          </Tooltip>
          {attendanceStatus == 'absent' ? (
            <div
              className="text-[8px] bg-red-100 text-red-500 py-[2px] min-w-10 rounded-lg px-2 mt-1 "
              data-cy={`feedback-meeting-components-participantslist-text-absent-${id}`}
              id={`feedback-meeting-components-participantslist-text-absent-${id}`}
            >
              Absent reason:{' '}
              <strong
                data-cy={`feedback-meeting-components-participantslist-text-absent-strong-${id}`}
              >
                {' '}
                {absentismReason}
              </strong>
            </div>
          ) : attendanceStatus == 'late' ? (
            <div
              className="text-[8px] bg-yellow-100 text-yellow-500 py-[2px] min-w-10 rounded-lg px-2 mt-1"
              data-cy={`feedback-meeting-components-participantslist-text-late-${id}`}
              id={`feedback-meeting-components-participantslist-text-late-${id}`}
            >
              Late By:{' '}
              <strong
                id={`feedback-meeting-components-participantslist-text-late-strong-${id}`}
                data-cy={`feedback-meeting-components-participantslist-text-late-strong-${id}`}
              >
                {lateBy} min{' '}
              </strong>
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
        data-cy={`feedback-meeting-components-participantslist-popconfirm-employee-${id}`}
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
        disabled={canEdit == false}
        data-cy={`feedback-meeting-components-participantslist-popconfirm-guest-${id}`}
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
  const removeParticipantContent = (id: string) => (
    <div
      className="rounded-lg w-full max-w-sm text-center"
      data-cy={`feedback-meeting-components-participantslist-remove-content-${id}`}
      id={`feedback-meeting-components-participantslist-remove-content-${id}`}
    >
      <p
        className="text-gray-800 text-base mb-6 text-left font-bold"
        id={`feedback-meeting-components-participantslist-remove-content-p-${id}`}
        data-cy={`feedback-meeting-components-participantslist-remove-content-p-${id}`}
      >
        Are you sure you want to remove
        <br data-cy="feedback-meeting-components-break" />
        this participant
      </p>
      <div
        className="flex justify-center gap-4"
        id={`feedback-meeting-components-participantslist-remove-content-div-${id}`}
        data-cy={`feedback-meeting-components-participantslist-remove-content-div-${id}`}
      >
        <Button
          loading={deleteParticipantLoading}
          className="border border-gray-400 text-gray-800 w-full rounded-md hover:bg-gray-100"
          data-cy="feedback-meeting-components-participantslist-button-remove-cancel"
          id="feedback-meeting-components-participantslist-button-remove-cancel"
        >
          Cancel
        </Button>
        <Button
          className="bg-red-600 text-white   w-full  rounded-md hover:bg-red-700 border-none"
          loading={deleteParticipantLoading}
          onClick={() => handleDeleteParticipant(id)}
          data-cy="feedback-meeting-components-participantslist-button-remove-confirm"
          id="feedback-meeting-components-participantslist-button-remove-confirm"
        >
          Delete
        </Button>
      </div>
    </div>
  );
  const ConfirmContent = (id: string, option: boolean, status: string) => (
    <div
      className="rounded-lg w-full max-w-sm text-center"
      data-cy={`feedback-meeting-components-participantslist-confirm-content-${id}`}
      id={`feedback-meeting-components-participantslist-confirm-content-${id}`}
    >
      <p
        className="text-gray-800 text-base mb-6 text-left font-bold"
        id={`feedback-meeting-components-participantslist-confirm-content-p-${id}`}
        data-cy={`feedback-meeting-components-participantslist-confirm-content-p-${id}`}
      >
        Are you sure you want to{' '}
        <br
          data-cy={`feedback-meeting-components-participantslist-confirm-content-br-${id}`}
        />{' '}
        confirm MoM?
      </p>
      <div
        className="flex justify-center gap-4"
        id={`feedback-meeting-components-participantslist-confirm-content-div-${id}`}
        data-cy={`feedback-meeting-components-participantslist-confirm-content-div-${id}`}
      >
        <Button
          loading={updateAttendeesLoading}
          className="border border-gray-400 text-gray-800 w-full rounded-md hover:bg-gray-100"
          data-cy="feedback-meeting-components-participantslist-button-confirm-cancel"
          id="feedback-meeting-components-participantslist-button-confirm-cancel"
        >
          Cancel
        </Button>
        <Button
          className="bg-blue text-white   w-full  rounded-md  border-none"
          loading={updateAttendeesLoading}
          onClick={() => handleConfirm(id, option, status)}
          data-cy="feedback-meeting-components-participantslist-button-confirm-submit"
          id="feedback-meeting-components-participantslist-button-confirm-submit"
        >
          Confirm
        </Button>
      </div>
    </div>
  );
  const RevertContent = (id: string, option: boolean, status: string) => (
    <div
      className="rounded-lg w-full max-w-sm text-center"
      data-cy={`feedback-meeting-components-participantslist-revert-content-${id}`}
      id={`feedback-meeting-components-participantslist-revert-content-${id}`}
    >
      <p
        className="text-gray-800 text-base mb-6 text-left font-bold"
        id={`feedback-meeting-components-participantslist-revert-content-p-${id}`}
        data-cy={`feedback-meeting-components-participantslist-revert-content-p-${id}`}
      >
        Are you sure you want to{' '}
        <br
          data-cy={`feedback-meeting-components-participantslist-revert-content-br-${id}`}
        />
        revert MoM?
      </p>
      <div
        className="flex justify-center gap-4"
        id={`feedback-meeting-components-participantslist-revert-content-div-${id}`}
        data-cy={`feedback-meeting-components-participantslist-revert-content-div-${id}`}
      >
        <Button
          loading={updateAttendeesLoading}
          className="border border-gray-400 text-gray-800 w-full rounded-md hover:bg-gray-100"
          data-cy="feedback-meeting-components-participantslist-button-revert-cancel"
          id="feedback-meeting-components-participantslist-button-revert-cancel"
        >
          Cancel
        </Button>
        <Button
          className="bg-red-600 text-white   w-full  rounded-md hover:bg-red-700 border-none"
          loading={updateAttendeesLoading}
          onClick={() => handleConfirm(id, option, status)}
          data-cy="feedback-meeting-components-participantslist-button-revert-submit"
          id="feedback-meeting-components-participantslist-button-revert-submit"
        >
          Revert
        </Button>
      </div>
    </div>
  );

  const attendeeItems = meetingAttendees?.items ?? [];

  const renderParticipantStatus = (p: any, i: number) =>
    userId != p.userId ? (
      hoveredIndex != i ? (
        deleteParticipantLoading == false ? (
          <>
            <Tag
              className="font-bold border-none min-w-16 text-center capitalize text-[8px] mr-0"
              color={
                statusColorMap[
                  p.acknowledgedMom ? 'Confirmed' : p.attendanceStatus
                ]
              }
              onMouseEnter={() => (canEdit ? setHoveredIndex(i) : null)}
              data-cy={`feedback-meeting-components-participantslist-tag-status-${i}`}
              id={`feedback-meeting-components-participantslist-tag-status-${i}`}
            >
              {p.acknowledgedMom ? 'Confirmed' : p.attendanceStatus}
            </Tag>
          </>
        ) : (
          <LoadingOutlined
            className="text-blue-500"
            id={`feedback-meeting-components-participantslist-loading-icon-${i}`}
            data-cy={`feedback-meeting-components-participantslist-loading-icon-${i}`}
          />
        )
      ) : (
        <Popconfirm
          title={removeParticipantContent(p.id)}
          okButtonProps={{ style: { display: 'none' } }}
          cancelButtonProps={{ style: { display: 'none' } }}
          icon={null}
          data-cy={`feedback-meeting-components-participantslist-popconfirm-remove-${i}`}
        >
          <MdClose
            className="cursor-pointer text-gray-500 hover:text-red-500"
            data-cy={`feedback-meeting-components-participantslist-icon-remove-${i}`}
          />
        </Popconfirm>
      )
    ) : p.acknowledgedMom == false ? (
      <Popconfirm
        title={ConfirmContent(p.id, true, p.attendanceStatus)}
        okButtonProps={{ style: { display: 'none' } }}
        cancelButtonProps={{ style: { display: 'none' } }}
        icon={null}
        data-cy={`feedback-meeting-components-participantslist-popconfirm-confirm-${i}`}
      >
        <Button
          loading={updateAttendeesLoading}
          className="text-[8px] py-1 bg-blue text-white border-none rounded-md h-5 min-w-16"
          data-cy={`feedback-meeting-components-participantslist-button-confirm-${i}`}
          id={`feedback-meeting-components-participantslist-button-confirm-${i}`}
        >
          Confirm
        </Button>
      </Popconfirm>
    ) : (
      <Popconfirm
        title={RevertContent(p.id, false, p.attendanceStatus)}
        okButtonProps={{ style: { display: 'none' } }}
        cancelButtonProps={{ style: { display: 'none' } }}
        icon={null}
        data-cy={`feedback-meeting-components-participantslist-popconfirm-revert-${i}`}
      >
        <Button
          loading={updateAttendeesLoading}
          className="text-[8px] py-1 bg-white text-red-500 border border-red-500 rounded-md h-5 min-w-16"
          data-cy={`feedback-meeting-components-participantslist-button-revert-${i}`}
          id={`feedback-meeting-components-participantslist-button-revert-${i}`}
        >
          Revert
        </Button>
      </Popconfirm>
    );

  const renderParticipantRow = (
    p: any,
    i: number,
    wrapClassName: string,
    mode: 'list' | 'modal',
  ) => (
    <div
      key={p.id ?? `participant-${i}`}
      className={wrapClassName}
      onMouseLeave={() => setHoveredIndex(null)}
      data-cy={
        mode === 'modal'
          ? `feedback-meeting-participants-modal-row-${i}`
          : `feedback-meeting-components-participantslist-item-${i}`
      }
      id={
        mode === 'modal'
          ? `feedback-meeting-participants-modal-row-${i}`
          : `feedback-meeting-components-participantslist-item-${i}`
      }
    >
      <div
        className={`flex flex-col items-start min-w-0 ${mode === 'modal' ? 'flex-1 pr-2' : ''}`}
        data-cy={`feedback-meeting-components-participantslist-item-details-${i}`}
        id={`feedback-meeting-components-participantslist-item-details-${i}`}
      >
        <EmployeeDetails
          isEmp={p?.userId != null}
          empId={p?.userId}
          guest={p.guestUser}
          id={p.id}
          attendanceStatus={p.attendanceStatus}
          absentismReason={p.absentismReason}
          lateBy={p.lateBy}
          data-cy={`feedback-meeting-components-participantslist-employee-details-${i}`}
        />
      </div>
      <div className="shrink-0 flex items-start pt-0.5">
        {renderParticipantStatus(p, i)}
      </div>
    </div>
  );

  if (variant === 'panel') {
    return (
      <>
        <div
          className="flex flex-col w-full max-w-full min-w-0 h-[81px] shrink-0 opacity-100 rounded-[8px] border-[1px] border-solid border-[#D9D9D9] pt-[8px] pr-[12px] pb-[8px] pl-[12px] gap-[9px] bg-white overflow-hidden"
          data-cy="feedback-meeting-participants-panel"
          id="feedback-meeting-participants-panel"
        >
          <div className="flex justify-between items-center w-full h-[24px]">
            <h2
              className="text-[14px] font-normal text-black m-0 leading-none"
              data-cy="feedback-meeting-participants-panel-heading"
            >
              Attendees
            </h2>
            <div className="flex items-center gap-3 shrink-0">
              {attendeeItems.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setViewAllModalOpen(true)}
                  className="text-[#1E40AF] text-[14px] font-normal leading-none bg-transparent border-none p-0 cursor-pointer hover:opacity-80"
                  data-cy="feedback-meeting-participants-view-all"
                >
                  View All
                </button>
              ) : null}
              {canEdit && (
                <AddParticipantsPopconfirm
                  meetingId={meeting?.id}
                  loading={loading}
                  attendees={attendeeItems}
                  data-cy="feedback-meeting-components-participantslist-add-participant"
                />
              )}
            </div>
          </div>
          {loading || getAttendeesLoading ? (
            <div
              className="flex justify-center py-2"
              data-cy="feedback-meeting-participants-panel-loading"
            >
              <Spin />
            </div>
          ) : (
            <div className="flex flex-wrap gap-[9px] items-center h-[28px] overflow-hidden">
              {attendeeItems.slice(0, 16).map((p: any, i: number) => (
                <ParticipantPreviewAvatar
                  key={p.id ?? i}
                  userId={p.userId}
                  guestUser={p.guestUser}
                />
              ))}
            </div>
          )}
        </div>

        <Modal
          title={
            <span className="text-base font-semibold text-[#262626]">
              Attendees
            </span>
          }
          open={viewAllModalOpen}
          onCancel={() => setViewAllModalOpen(false)}
          footer={null}
          width={520}
          destroyOnClose
          centered
          data-cy="feedback-meeting-participants-view-all-modal"
        >
          <div className="max-h-[65vh] overflow-y-auto space-y-3 pt-1 pr-1">
            {attendeeItems.map((p: any, i: number) =>
              renderParticipantRow(
                p,
                i,
                'flex justify-between items-start gap-2 border border-[#D9D9D9] rounded-lg p-3 shadow-sm bg-white',
                'modal',
              ),
            )}
          </div>
        </Modal>
      </>
    );
  }

  return (
    <div
      className="p-4 space-y-3"
      data-cy="feedback-meeting-components-participantslist-div"
      id="feedback-meeting-components-participantslist-div"
    >
      <div
        className="flex justify-between items-center py-2"
        data-cy="feedback-meeting-components-participantslist-div-header"
        id="feedback-meeting-components-participantslist-div-header"
      >
        <h2
          className="text-lg font-semibold mb-2"
          data-cy="feedback-meeting-components-participantslist-heading"
          id="feedback-meeting-components-participantslist-heading"
        >
          List of Participants
        </h2>
        {canEdit && (
          <AddParticipantsPopconfirm
            meetingId={meeting?.id}
            loading={loading}
            attendees={attendeeItems}
            data-cy="feedback-meeting-components-participantslist-add-participant"
          />
        )}
      </div>

      {loading || getAttendeesLoading ? (
        <div
          className="flex justify-center"
          data-cy="feedback-meeting-components-participantslist-div-loading"
          id="feedback-meeting-components-participantslist-div-loading"
        >
          <Spin data-cy="feedback-meeting-components-participantslist-spin-loading" />
        </div>
      ) : (
        attendeeItems.map((p: any, i: number) =>
          renderParticipantRow(
            p,
            i,
            'flex justify-between items-center border p-2 rounded-md',
            'list',
          ),
        )
      )}
    </div>
  );
}
