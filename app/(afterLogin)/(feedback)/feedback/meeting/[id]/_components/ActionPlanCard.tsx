import { useDeleteMeetingActionPlan } from '@/store/server/features/CFR/meeting/action-plan/mutations';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { LoadingOutlined, UserOutlined } from '@ant-design/icons';
import { Dropdown, Button, Avatar, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import { FiMoreVertical } from 'react-icons/fi';

interface ActionPlanCardProps {
  issue: string;
  id: string;
  description: string;
  deadline: string;
  status: 'Completed' | 'In_Progress' | 'Pending';
  priority: 'High' | 'Medium' | 'Low';
  responsibleUsers: { responsibleId: string }[];
  canEdit: boolean;
}

function priorityBadgeClass(priority: ActionPlanCardProps['priority']) {
  switch (priority) {
    case 'High':
      return 'border-[#FF4D4F] bg-[#FFF1F0] text-[#FF4D4F]';
    case 'Medium':
      return 'border-[#FA8C16] bg-[#FFF7E6] text-[#FA8C16]';
    default:
      return 'border-[#1677FF] bg-[#E6F4FF] text-[#1677FF]';
  }
}

/** Date + bottom status: 22px height, 1×8px padding, 12px regular @ 70% black */
const neutralMetaTagClass =
  'inline-flex h-[22px] shrink-0 items-center justify-center rounded border border-solid border-[#E5E7EB] bg-white px-2 py-px text-[12px] font-normal leading-none text-black/70 box-border';

function ResponsibleOverlapAvatar({
  empId,
  zIndex,
}: {
  empId: string;
  zIndex: number;
}) {
  const { data: userDetails, isLoading, error } = useGetEmployee(empId);

  if (isLoading) {
    return (
      <Avatar
        size={28}
        icon={<LoadingOutlined className="text-xs" />}
        className="shrink-0 border-2 border-solid border-white bg-gray-100"
        style={{ zIndex }}
      />
    );
  }
  if (error || !userDetails) {
    return (
      <Avatar
        size={28}
        icon={<UserOutlined />}
        className="shrink-0 border-2 border-solid border-white bg-[#E6F4FF] text-[#1677FF]"
        style={{ zIndex }}
      />
    );
  }

  const userName =
    `${userDetails?.firstName ?? ''} ${userDetails?.middleName ?? ''} ${userDetails?.lastName ?? ''}`.trim() ||
    '—';
  const profileImage = userDetails?.profileImage;
  const initial = (userName?.charAt(0) || '?').toUpperCase();

  return (
    <Tooltip title={userName}>
      <Avatar
        size={28}
        src={profileImage || undefined}
        icon={!profileImage ? <UserOutlined /> : undefined}
        className="shrink-0 border-2 border-solid border-white bg-gray-100 text-xs font-medium"
        style={{ zIndex }}
      >
        {!profileImage ? initial : null}
      </Avatar>
    </Tooltip>
  );
}

export default function ActionPlanCard({
  issue,
  id,
  description,
  deadline,
  status,
  priority,
  responsibleUsers,
  canEdit,
}: ActionPlanCardProps) {
  const { setActionPlanData, setOpenAddActionPlan } = useMeetingStore();
  const { mutate: deleteActionPlan, isLoading } = useDeleteMeetingActionPlan();

  const handleEditActionPlan = (value: any) => {
    setActionPlanData(value);
    setOpenAddActionPlan(true);
  };

  const handleDeleteActionPlan = (planId: string) => {
    deleteActionPlan(planId);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      label: 'Edit',
      onClick: () =>
        handleEditActionPlan({
          id,
          issue,
          description,
          deadline,
          status,
          priority,
          responsibleUsers,
        }),
    },
    {
      key: 'delete',
      danger: true,
      label: 'Delete',
      onClick: () => handleDeleteActionPlan(id),
    },
  ];

  const isResolved = status === 'Completed';
  const statusLabel = isResolved ? 'Completed' : 'Unresolved';
  const statusBadgeClass = isResolved
    ? 'border-[#52C41A] bg-white text-[#52C41A]'
    : 'border-[#FAAD14] bg-white text-[#FAAD14]';

  const bodyText = (description || issue || '—').trim();

  return (
    <div
      className="box-border flex h-[108px] w-full max-w-full min-w-0 shrink-0 flex-col gap-2 overflow-hidden rounded-lg border border-solid border-[#E5E7EB] bg-white p-[10px] opacity-100"
      data-cy={`feedback-meeting-components-actionplancard-card-${id}`}
      id={`feedback-meeting-components-actionplancard-card-${id}`}
    >
      <div
        className="flex shrink-0 items-center justify-between gap-2"
        data-cy={`feedback-meeting-components-actionplancard-header-${id}`}
        id={`feedback-meeting-components-actionplancard-header-${id}`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="shrink-0 text-[16px] font-extrabold leading-none text-[#111827]"
            data-cy={`feedback-meeting-components-actionplancard-label-issue-${id}`}
            id={`feedback-meeting-components-actionplancard-label-issue-${id}`}
          >
            Issue
          </span>
          <span
            className={`inline-flex h-[22px] shrink-0 items-center justify-center rounded border border-solid px-2 py-px text-[12px] font-medium capitalize leading-none box-border ${priorityBadgeClass(priority)}`}
            data-cy={`feedback-meeting-components-actionplancard-tag-priority-${id}`}
            id={`feedback-meeting-components-actionplancard-tag-priority-${id}`}
          >
            {priority}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={neutralMetaTagClass}
            data-cy={`feedback-meeting-components-actionplancard-value-deadline-${id}`}
            id={`feedback-meeting-components-actionplancard-value-deadline-${id}`}
          >
            {deadline ? dayjs(deadline).format('MMM D YYYY') : '—'}
          </span>
          {canEdit ? (
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Tooltip title="More actions">
                <Button
                  loading={isLoading}
                  type="text"
                  size="small"
                  className="flex h-[22px] w-[22px] min-w-[22px] items-center justify-center p-0"
                  data-cy={`feedback-meeting-components-actionplancard-button-more-${id}`}
                  icon={
                    <FiMoreVertical
                      className="text-base text-gray-500"
                      data-cy={`feedback-meeting-components-actionplancard-icon-more-${id}`}
                      id={`feedback-meeting-components-actionplancard-icon-more-${id}`}
                    />
                  }
                  id={`feedback-meeting-components-actionplancard-button-more-${id}`}
                />
              </Tooltip>
            </Dropdown>
          ) : null}
        </div>
      </div>

      <p
        className="min-h-0 flex-1 overflow-hidden text-[14px] font-normal leading-snug text-[#323B49] line-clamp-2"
        data-cy={`feedback-meeting-components-actionplancard-description-${id}`}
        id={`feedback-meeting-components-actionplancard-description-${id}`}
      >
        {bodyText}
      </p>

      <div
        className="flex shrink-0 items-center justify-between gap-2"
        data-cy={`feedback-meeting-components-actionplancard-footer-${id}`}
        id={`feedback-meeting-components-actionplancard-footer-${id}`}
      >
        <div
          className="flex min-w-0 items-center pl-0.5"
          data-cy={`feedback-meeting-components-actionplancard-avatar-row-${id}`}
        >
          {responsibleUsers?.length > 0 ? (
            responsibleUsers.map((res, index) => (
              <div
                key={res.responsibleId}
                className={index === 0 ? 'shrink-0' : 'shrink-0 -ml-2'}
                data-cy={`feedback-meeting-components-actionplancard-avatar-wrap-${res.responsibleId}`}
              >
                <ResponsibleOverlapAvatar
                  empId={res.responsibleId}
                  zIndex={responsibleUsers.length - index}
                />
              </div>
            ))
          ) : (
            <span
              className="text-xs text-gray-400"
              data-cy={`feedback-meeting-components-actionplancard-responsible-empty-${id}`}
            >
              —
            </span>
          )}
        </div>
        <span
          className={`inline-flex h-[22px] shrink-0 items-center justify-center rounded border border-solid px-2 py-px text-[12px] font-medium capitalize leading-none box-border ${statusBadgeClass}`}
          data-cy={`feedback-meeting-components-actionplancard-tag-status-${id}`}
          id={`feedback-meeting-components-actionplancard-tag-status-${id}`}
        >
          {statusLabel}
        </span>
      </div>
    </div>
  );
}
