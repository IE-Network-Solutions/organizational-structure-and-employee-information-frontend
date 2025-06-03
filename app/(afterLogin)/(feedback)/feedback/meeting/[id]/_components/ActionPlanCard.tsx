// components/ActionPlan/ActionPlanCard.tsx
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
  function handleEditActionPlan(value: any) {
    setActionPlanData(value);
    setOpenAddActionPlan(true);
  }
  function handleDeleteActionPlan(id: string) {
    deleteActionPlan(id);
  }
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

    if (isLoading)
      return (
        <>
          <LoadingOutlined />
        </>
      );

    if (error || !userDetails) return '-';

    const userName =
      `${userDetails?.firstName} ${userDetails?.middleName} ${userDetails?.lastName} ` ||
      '-';
    const profileImage = userDetails?.profileImage;
    return (
      <div className="flex gap-2 items-center">
        <Tooltip title={type == 'all' ? '' : userName}>
          <Avatar src={profileImage} icon={<UserOutlined />} />
        </Tooltip>

        {type == 'all' && <div>{userName}</div>}
      </div>
    );
  };
  return (
    <div className="bg-white border rounded-xl p-4  space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold">Issue</p>
          <p className="text-gray-600 text-sm">{issue}</p>
          {/* <p className="text-gray-600 text-sm">{description}</p> */}
        </div>
        {canEdit && (
          <Dropdown overlay={menu} trigger={['click']}>
            <Tooltip title="More actions">
              <Button
                loading={isLoading}
                type="text"
                icon={
                  <FiMoreVertical className="text-gray-500 hover:text-blue-500 cursor-pointer text-lg" />
                }
              />
            </Tooltip>
          </Dropdown>
        )}
      </div>
      <div className="grid grid-cols-4 text-sm pt-2">
        <div>
          <p className="font-bold text-gray-700">Responsible Person</p>

          {responsibleUsers?.length > 0 ? (
            <Avatar.Group
              maxCount={5}
              maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}
              className="mt-1"
            >
              {responsibleUsers.map((res: any) => (
                <EmployeeDetails
                  key={res.responsibleId}
                  type="avatar"
                  empId={res.responsibleId}
                />
              ))}
            </Avatar.Group>
          ) : (
            '-'
          )}
        </div>
        <div>
          <p className="font-bold text-gray-700">Deadline</p>
          <p>{dayjs(deadline).format('YYYY-MM-DD')}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">Status</p>
          <Tag
            className="font-bold border-none min-w-16 text-center capitalize text-[10px]"
            color={statusColor}
          >
            {status}
          </Tag>
        </div>
        <div>
          <p className="font-bold text-gray-700">Priority</p>
          <Tag
            className="font-bold border-none min-w-16 text-center capitalize text-[10px]"
            color={priorityColor}
          >
            {priority || 'None'}
          </Tag>
        </div>
      </div>
    </div>
  );
}
