import { useDeleteMeetingActionPlan } from '@/store/server/features/CFR/meeting/action-plan/mutations';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { LoadingOutlined, UserOutlined } from '@ant-design/icons';
import { Tag, Tooltip, Avatar, Menu, Dropdown, Button } from 'antd';
import dayjs from 'dayjs';
import { FiMoreVertical } from 'react-icons/fi';

interface ActionPlanCardProps {
  issue: string;
  id: string;
  description: string;
  deadline: string;
  status: 'Completed' | 'In_Progress' | 'Pending';
  priority: 'High' | 'Medium' | 'Low';
  responsibleUsers: string[];
  canEdit: boolean;
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
  const statusColor = status === 'Completed' ? 'green' : 'orange';
  const priorityColor =
    priority === 'High' ? 'red' : priority === 'Medium' ? 'orange' : 'blue';

  const { setActionPlanData, setOpenAddActionPlan } = useMeetingStore();
  const { mutate: deleteActionPlan, isLoading } = useDeleteMeetingActionPlan();

  const handleEditActionPlan = (value: any) => {
    setActionPlanData(value);
    setOpenAddActionPlan(true);
  };

  const handleDeleteActionPlan = (id: string) => {
    deleteActionPlan(id);
  };

  const menu = (
    <Menu>
      <Menu.Item
        key="edit"
        onClick={() =>
          handleEditActionPlan({
            id,
            issue,
            description,
            deadline,
            status,
            priority,
            responsibleUsers,
          })
        }
      >
        Edit
      </Menu.Item>
      <Menu.Item key="delete" danger onClick={() => handleDeleteActionPlan(id)}>
        Delete
      </Menu.Item>
    </Menu>
  );

  const EmployeeDetails = ({
    empId,
    type,
  }: {
    empId: string;
    type: string;
  }) => {
    const { data: userDetails, isLoading, error } = useGetEmployee(empId);

    if (isLoading) return <LoadingOutlined />;
    if (error || !userDetails) return '-';

    const userName =
      `${userDetails?.firstName} ${userDetails?.middleName} ${userDetails?.lastName}` ||
      '-';
    const profileImage = userDetails?.profileImage;

    return (
      <div className="flex gap-2 items-center">
        <Tooltip title={type === 'all' ? '' : userName}>
          <Avatar src={profileImage} icon={<UserOutlined />} />
        </Tooltip>
        {type === 'all' && <div>{userName}</div>}
      </div>
    );
  };

  return (
    <div
      className="bg-white border rounded-xl p-4 space-y-3 w-full"
      data-cy={`feedback-meeting-components-actionplancard-card-${id}`}
      id={`feedback-meeting-components-actionplancard-card-${id}`}
    >
      {/* Header */}
      <div
        className="flex justify-between items-start"
        data-cy={`feedback-meeting-components-actionplancard-header-${id}`}
        id={`feedback-meeting-components-actionplancard-header-${id}`}
      >
        <div
          className="flex-1"
          data-cy={`feedback-meeting-components-actionplancard-header-left-${id}`}
          id={`feedback-meeting-components-actionplancard-header-left-${id}`}
        >
          <p
            className="text-sm font-semibold"
            data-cy={`feedback-meeting-components-actionplancard-label-issue-${id}`}
            id={`feedback-meeting-components-actionplancard-label-issue-${id}`}
          >
            Issue
          </p>
          <p
            className="text-gray-600 text-sm break-words"
            data-cy={`feedback-meeting-components-actionplancard-value-issue-${id}`}
            id={`feedback-meeting-components-actionplancard-value-issue-${id}`}
          >
            {issue}
          </p>
        </div>
        {canEdit && (
          <Dropdown overlay={menu} trigger={['click']}>
            <Tooltip title="More actions">
              <Button
                loading={isLoading}
                type="text"
                icon={
                  <FiMoreVertical
                    className="text-gray-500 hover:text-blue-500 cursor-pointer text-lg"
                    data-cy={`feedback-meeting-components-actionplancard-icon-more-${id}`}
                    id={`feedback-meeting-components-actionplancard-icon-more-${id}`}
                  />
                }
                data-cy={`feedback-meeting-components-actionplancard-button-more-${id}`}
                id={`feedback-meeting-components-actionplancard-button-more-${id}`}
              />
            </Tooltip>
          </Dropdown>
        )}
      </div>

      {/* Content Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm pt-2"
        data-cy={`feedback-meeting-components-actionplancard-grid-${id}`}
        id={`feedback-meeting-components-actionplancard-grid-${id}`}
      >
        {/* Responsible Users */}
        <div
          data-cy={`feedback-meeting-components-actionplancard-section-responsible-${id}`}
          id={`feedback-meeting-components-actionplancard-section-responsible-${id}`}
        >
          <p
            className="font-bold text-gray-700"
            data-cy={`feedback-meeting-components-actionplancard-label-responsible-${id}`}
            id={`feedback-meeting-components-actionplancard-label-responsible-${id}`}
          >
            Responsible Person
          </p>
          {responsibleUsers?.length > 0 ? (
            <Avatar.Group
              maxCount={5}
              maxStyle={{ color: '#000', backgroundColor: '#f0f0f0' }}
              className="mt-1"
              data-cy={`feedback-meeting-components-actionplancard-avatar-group-${id}`}
            >
              {responsibleUsers.map((res: any) => (
                <EmployeeDetails
                  key={res.responsibleId}
                  type="avatar"
                  empId={res.responsibleId}
                  data-cy={`feedback-meeting-components-actionplancard-avatar-${res.responsibleId}`}
                />
              ))}
            </Avatar.Group>
          ) : (
            <span
              className="text-gray-500"
              data-cy={`feedback-meeting-components-actionplancard-responsible-empty-${id}`}
              id={`feedback-meeting-components-actionplancard-responsible-empty-${id}`}
            >
              -
            </span>
          )}
        </div>

        {/* Deadline */}
        <div
          data-cy={`feedback-meeting-components-actionplancard-section-deadline-${id}`}
          id={`feedback-meeting-components-actionplancard-section-deadline-${id}`}
        >
          <p
            className="font-bold text-gray-700"
            data-cy={`feedback-meeting-components-actionplancard-label-deadline-${id}`}
            id={`feedback-meeting-components-actionplancard-label-deadline-${id}`}
          >
            Deadline
          </p>
          <p
            data-cy={`feedback-meeting-components-actionplancard-value-deadline-${id}`}
            id={`feedback-meeting-components-actionplancard-value-deadline-${id}`}
          >
            {dayjs(deadline).format('YYYY-MM-DD')}
          </p>
        </div>

        {/* Status */}
        <div
          data-cy={`feedback-meeting-components-actionplancard-section-status-${id}`}
          id={`feedback-meeting-components-actionplancard-section-status-${id}`}
        >
          <p
            className="font-bold text-gray-700"
            data-cy={`feedback-meeting-components-actionplancard-label-status-${id}`}
            id={`feedback-meeting-components-actionplancard-label-status-${id}`}
          >
            Status
          </p>
          <Tag
            className="font-bold border-none min-w-16 text-center capitalize text-[10px]"
            color={statusColor}
            data-cy={`feedback-meeting-components-actionplancard-tag-status-${id}`}
            id={`feedback-meeting-components-actionplancard-tag-status-${id}`}
          >
            {status}
          </Tag>
        </div>

        {/* Priority */}
        <div
          data-cy={`feedback-meeting-components-actionplancard-section-priority-${id}`}
          id={`feedback-meeting-components-actionplancard-section-priority-${id}`}
        >
          <p
            className="font-bold text-gray-700"
            data-cy={`feedback-meeting-components-actionplancard-label-priority-${id}`}
            id={`feedback-meeting-components-actionplancard-label-priority-${id}`}
          >
            Priority
          </p>
          <Tag
            className="font-bold border-none min-w-16 text-center capitalize text-[10px]"
            color={priorityColor}
            data-cy={`feedback-meeting-components-actionplancard-tag-priority-${id}`}
            id={`feedback-meeting-components-actionplancard-tag-priority-${id}`}
          >
            {priority || 'None'}
          </Tag>
        </div>
      </div>
    </div>
  );
}
