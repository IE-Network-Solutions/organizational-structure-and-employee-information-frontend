'use client';

import {
  Tag,
  Avatar,
  Button,
  Tooltip,
  Spin,
  Skeleton,
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
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { MdClose } from 'react-icons/md';
import {
  useDeleteMeetingAttendees,
  useUpdateMeetingAttendees,
} from '@/store/server/features/CFR/meeting/attendees/mutations';
import { useGetMeetingAttendees } from '@/store/server/features/CFR/meeting/attendees/queries';
import { meetingFormRequiredMark } from '../../_component/meetingFormRequiredMark';
import './meetingAttendeesViewAllAnchoredModal.css';

const ATTENDEES_VIEW_ALL_MODAL_WIDTH = 425;
const ATTENDEES_VIEW_ALL_MODAL_ESTIMATED_HEIGHT = 280;

function getAttendanceStatusPillClassName(status: string) {
  const s = (status ?? '').toLowerCase();
  if (s === 'attended') {
    return 'border-[#91CAFF] bg-[#E6F4FF] text-[#1677FF]';
  }
  if (s === 'late') {
    return 'border-[#FFD666] bg-[#FFF7E6] text-[#FA8C16]';
  }
  if (s === 'absent') {
    return 'border-[#FFA39E] bg-[#FFF1F0] text-[#FF4D4F]';
  }
  if (s === 'confirmed') {
    return 'border-[#B7EB8F] bg-[#F6FFED] text-[#52C41A]';
  }
  // pending / unknown
  return 'border-[#FFE58F] bg-[#FFFBE6] text-[#FAAD14]';
}

/** Attendees panel: show this many avatars before inline "View All" (when total exceeds this). */
const ATTENDEES_PANEL_AVATAR_CAP = 10;

/** Panel strip: photo fills the circle without letterboxing (object-fit cover). */
const panelPreviewAvatarClassName =
  'shrink-0 overflow-hidden opacity-100 rounded-[100px] border-[2px] border-solid [&_img]:h-full [&_img]:w-full [&_img]:object-cover';

function getAttendanceBorderColorClass(attendanceStatus?: string | null) {
  const s = (attendanceStatus ?? '').toLowerCase();
  if (s === 'attended') return 'border-[#B7EB8F]'; // greenish
  if (s === 'absent') return 'border-[#FFA39E]'; // reddish
  if (s === 'late') return 'border-[#FFD666]'; // yellowish/orange
  // pending / unknown
  return 'border-[#FFE58F]'; // yellowish
}

function ParticipantPreviewAvatar({
  userId,
  guestUser,
  attendanceStatus,
}: {
  userId?: string | null;
  guestUser?: any;
  attendanceStatus?: string | null;
}) {
  const isEmp = userId != null && userId !== '';
  const { data: userDetails, isLoading } = useGetEmployee(
    isEmp ? String(userId) : '',
  );
  const borderClassName = getAttendanceBorderColorClass(attendanceStatus);

  if (isEmp && isLoading) {
    return (
      <Avatar
        size={28}
        icon={<UserOutlined />}
        className={`${panelPreviewAvatarClassName} ${borderClassName}`}
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
            ? `${panelPreviewAvatarClassName} ${borderClassName} !bg-[#E6F4FF] !text-[#1677FF] font-medium`
            : `${panelPreviewAvatarClassName} ${borderClassName}`
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
  /** Compact avatar strip + View All anchored modal (meeting detail panel). */
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
  const [viewAllModalPos, setViewAllModalPos] = useState({ top: 0, left: 0 });
  const viewAllButtonRef = useRef<HTMLButtonElement>(null);

  const measureViewAllAnchor = () => {
    const gap = 8;
    const w = ATTENDEES_VIEW_ALL_MODAL_WIDTH;
    const h = ATTENDEES_VIEW_ALL_MODAL_ESTIMATED_HEIGHT;
    const el = viewAllButtonRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      let left = r.right - w;
      left = Math.min(Math.max(gap, left), window.innerWidth - w - gap);
      const spaceBelow = window.innerHeight - r.bottom - gap;
      const spaceAbove = r.top - gap;
      let top = r.bottom + gap;

      // Prefer the side with more available space so the popup is less likely to clip.
      if (spaceAbove > spaceBelow) {
        top = r.top - h - gap;
      }
      top = Math.min(Math.max(gap, top), window.innerHeight - h - gap);
      return { top, left };
    }
    return { top: gap, left: gap };
  };

  const openViewAllModal = () => {
    setViewAllModalPos(measureViewAllAnchor());
    setViewAllModalOpen(true);
  };

  useLayoutEffect(() => {
    if (!viewAllModalOpen) return;
    setViewAllModalPos(measureViewAllAnchor());
  }, [viewAllModalOpen]);

  const userId = useAuthenticationStore.getState().userId;
  const EmployeeDetails = ({
    empId,
    isEmp,
    guest,
    id,
    attendanceStatus,
    absentismReason,
    lateBy,
    compact = false,
    avatarOnly = false,
    popTrigger = 'click',
  }: {
    empId: string;
    isEmp: boolean;
    guest: any;
    id: string;
    attendanceStatus: string;
    absentismReason: string;
    lateBy: number;
    /** Fixed-height row (e.g. View All popover): 58px row layout. */
    compact?: boolean;
    /** Panel strip mode: render avatar only but keep popconfirm actions. */
    avatarOnly?: boolean;
    popTrigger?: 'click' | 'hover';
  }) => {
    const { data: userDetails, isLoading } = useGetEmployee(isEmp ? empId : '');

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
          requiredMark={meetingFormRequiredMark}
          className="meeting-form-field-spacing space-y-3"
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

        <div
          className="mt-2 flex justify-end"
          data-cy="feedback-meeting-components-participantslist-submit-wrap"
        >
          <Button
            loading={updateAttendeesLoading}
            className="!h-8 !min-h-8 !px-[15px] text-[14px] font-normal"
            type="primary"
            onClick={handleSubmit}
            data-cy="feedback-meeting-components-participantslist-button-submit"
            id="feedback-meeting-components-participantslist-button-submit"
          >
            Submit
          </Button>
        </div>
      </div>
    );

    const secondaryLine =
      attendanceStatus === 'absent'
        ? `Absent: ${absentismReason || '—'}`
        : attendanceStatus === 'late'
          ? `Late by ${lateBy} min`
          : email;

    const details = avatarOnly ? (
      <Avatar
        size={28}
        src={profileImage}
        icon={
          isEmp && !profileImage ? (
            <UserOutlined
              data-cy={`feedback-meeting-components-participantslist-icon-${id}`}
            />
          ) : undefined
        }
        className={`shrink-0 overflow-hidden rounded-[100px] border-[2px] border-solid ${getAttendanceBorderColorClass(
          attendanceStatus,
        )} [&_img]:h-full [&_img]:w-full [&_img]:object-cover ${
          !isEmp ? '!bg-[#E6F4FF] !text-[#1677FF]' : ''
        }`}
        data-cy={`feedback-meeting-components-participantslist-avatar-display-${id}`}
      >
        {!isEmp ? (userName?.charAt(0) || '?').toUpperCase() : null}
      </Avatar>
    ) : compact ? (
      <div
        className="flex min-w-0 flex-1 items-start gap-[8px]"
        data-cy={`feedback-meeting-components-participantslist-details-${id}`}
        id={`feedback-meeting-components-participantslist-details-${id}`}
      >
        <Avatar
          size={24}
          src={profileImage}
          icon={
            <UserOutlined
              data-cy={`feedback-meeting-components-participantslist-icon-${id}`}
            />
          }
          className="!h-6 !min-h-6 !w-6 !min-w-6 shrink-0 [&_.anticon]:text-[12px]"
          data-cy={`feedback-meeting-components-participantslist-avatar-display-${id}`}
        />
        <div
          className="flex min-w-0 flex-1 flex-col gap-[8px]"
          data-cy={`feedback-meeting-components-participantslist-div-text-${id}`}
          id={`feedback-meeting-components-participantslist-div-text-${id}`}
        >
          <Tooltip title={userName}>
            <div
              className="truncate text-[14px] font-bold leading-tight text-[#262626]"
              data-cy={`feedback-meeting-components-participantslist-span-name-${id}`}
              id={`feedback-meeting-components-participantslist-span-name-${id}`}
            >
              {userName}
            </div>
          </Tooltip>
          <Tooltip title={secondaryLine}>
            <div
              className="truncate text-[12px] font-normal leading-tight text-[#8c8c8c]"
              data-cy={`feedback-meeting-components-participantslist-span-email-${id}`}
              id={`feedback-meeting-components-participantslist-span-email-${id}`}
            >
              {secondaryLine}
            </div>
          </Tooltip>
        </div>
      </div>
    ) : (
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
        trigger={popTrigger}
        getPopupContainer={() => document.body}
        zIndex={1080}
        icon={null}
        okButtonProps={{ style: { display: 'none' } }}
        cancelButtonProps={{ style: { display: 'none' } }}
        disabled={avatarOnly ? false : canEdit == false}
        data-cy={`feedback-meeting-components-participantslist-popconfirm-employee-${id}`}
      >
        {details}
      </Popconfirm>
    ) : (
      <Popconfirm
        title={content}
        open={visible}
        onOpenChange={setVisible}
        trigger={popTrigger}
        getPopupContainer={() => document.body}
        zIndex={1080}
        icon={null}
        okButtonProps={{ style: { display: 'none' } }}
        cancelButtonProps={{ style: { display: 'none' } }}
        disabled={avatarOnly ? false : canEdit == false}
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
  /** Prefer API total when the list is paginated (items may be capped). */
  const attendeeTotal =
    typeof meetingAttendees?.totalCount === 'number'
      ? meetingAttendees.totalCount
      : typeof meetingAttendees?.total === 'number'
        ? meetingAttendees.total
        : attendeeItems.length;
  const showAttendeesViewAll = attendeeTotal > ATTENDEES_PANEL_AVATAR_CAP;
  const attendeePanelPreviewItems = showAttendeesViewAll
    ? attendeeItems.slice(0, ATTENDEES_PANEL_AVATAR_CAP)
    : attendeeItems;

  const renderParticipantStatus = (p: any, i: number) =>
    userId != p.userId ? (
      hoveredIndex != i ? (
        deleteParticipantLoading == false ? (
          <>
            <Tag
              className={`!m-0 !inline-flex !h-[22px] !min-h-[22px] min-w-[88px] items-center justify-center !rounded-md !border !border-solid px-3 !py-0 text-[12px] font-normal leading-none ${getAttendanceStatusPillClassName(
                p.acknowledgedMom ? 'confirmed' : p.attendanceStatus,
              )}`}
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
          className="!h-[22px] !min-h-[22px] !rounded-[6px] !border-none !bg-[#1E40AF] !px-[15px] text-[14px] font-normal leading-none !text-white hover:!bg-[#1e3a8a]"
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
        className={`flex min-w-0 ${mode === 'modal' ? 'min-h-0 flex-1 items-start overflow-hidden' : 'flex-col items-start'}`}
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
          compact={mode === 'modal'}
          data-cy={`feedback-meeting-components-participantslist-employee-details-${i}`}
        />
      </div>
      <div
        className={`shrink-0 flex ${mode === 'modal' ? 'items-start pt-0.5' : 'items-start pt-0.5'}`}
        data-cy={`feedback-meeting-participants-row-status-wrap-${i}`}
      >
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
          <div
            className="flex justify-between items-center w-full h-[24px]"
            data-cy="feedback-meeting-participants-panel-header-row"
          >
            <h2
              className="text-[14px] font-normal text-black m-0 leading-none"
              data-cy="feedback-meeting-participants-panel-heading"
            >
              Attendees
            </h2>
            <div
              className="flex items-center gap-3 shrink-0"
              data-cy="feedback-meeting-participants-panel-header-actions"
            >
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
              className="flex min-h-[28px] w-full items-center gap-2 py-1"
              data-cy="feedback-meeting-participants-panel-loading"
            >
              <Skeleton.Avatar active size={28} />
              <Skeleton.Avatar active size={28} />
              <Skeleton.Avatar active size={28} />
              <Skeleton.Input active size="small" style={{ width: 56, height: 14 }} />
            </div>
          ) : (
            <div
              className="flex min-h-[28px] w-full min-w-0 flex-nowrap items-center gap-[9px] overflow-x-auto overflow-y-visible scrollbar-none"
              data-cy="feedback-meeting-participants-panel-avatars-row"
            >
              {showAttendeesViewAll
                ? attendeePanelPreviewItems.map((p: any, i: number) => (
                    <ParticipantPreviewAvatar
                      key={p.id ?? i}
                      userId={p.userId}
                      guestUser={p.guestUser}
                      attendanceStatus={p.attendanceStatus}
                    />
                  ))
                : attendeePanelPreviewItems.map((p: any, i: number) => (
                    <EmployeeDetails
                      key={p.id ?? i}
                      isEmp={p?.userId != null}
                      empId={p?.userId ? String(p.userId) : ''}
                      guest={p.guestUser}
                      id={p.id}
                      attendanceStatus={p.attendanceStatus}
                      absentismReason={p.absentismReason}
                      lateBy={p.lateBy}
                      avatarOnly
                      popTrigger="click"
                    />
                  ))}
              {showAttendeesViewAll ? (
                <button
                  ref={viewAllButtonRef}
                  type="button"
                  onClick={openViewAllModal}
                  className="shrink-0 text-[#1E40AF] text-[14px] font-normal leading-none bg-transparent border-none p-0 cursor-pointer hover:opacity-80"
                  data-cy="feedback-meeting-participants-view-all"
                >
                  View All
                </button>
              ) : null}
            </div>
          )}
        </div>

        <Modal
          title={
            <span
              className="text-[14px] font-bold text-black/70"
              data-cy="feedback-meeting-participants-view-all-modal-title"
            >
              Attendees
            </span>
          }
          closeIcon={
            <MdClose
              size={16}
              className="text-[#8c8c8c]"
              data-cy="feedback-meeting-participants-view-all-modal-close"
            />
          }
          open={viewAllModalOpen}
          onCancel={() => setViewAllModalOpen(false)}
          footer={null}
          width={ATTENDEES_VIEW_ALL_MODAL_WIDTH}
          centered={false}
          wrapClassName="meeting-attendees-view-all-anchored-wrap"
          destroyOnClose
          maskClosable
          style={{
            position: 'fixed',
            top: viewAllModalPos.top,
            left: viewAllModalPos.left,
            margin: 0,
            paddingBottom: 0,
          }}
          styles={{
            wrapper: {
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              padding: 0,
            },
            content: {
              padding: 0,
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow:
                '0 12px 48px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)',
            },
            header: {
              padding: '20px 24px 8px 24px',
              marginBottom: 0,
              borderBottom: 'none',
            },
            body: {
              padding: '12px 24px',
            },
          }}
          data-cy="feedback-meeting-participants-view-all-modal"
        >
          <div
            className="max-h-[43vh] overflow-y-auto scrollbar-none"
            data-cy="feedback-meeting-participants-view-all-modal-body"
          >
            <div
              className="flex flex-col gap-[8px]"
              data-cy="feedback-meeting-participants-view-all-modal-menu"
            >
              {attendeeItems.map((p: any, i: number) =>
                renderParticipantRow(
                  p,
                  i,
                  'box-border flex h-[58px] min-h-[58px] max-h-[58px] items-start justify-between rounded-[8px] border border-solid border-[#D9D9D9] bg-white py-2 px-3',
                  'modal',
                ),
              )}
            </div>
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
          className="flex w-full flex-col gap-3 py-2"
          data-cy="feedback-meeting-components-participantslist-div-loading"
          id="feedback-meeting-components-participantslist-div-loading"
        >
          <Skeleton
            active
            title={false}
            paragraph={{ rows: 4 }}
            data-cy="feedback-meeting-components-participantslist-skeleton-loading"
          />
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
