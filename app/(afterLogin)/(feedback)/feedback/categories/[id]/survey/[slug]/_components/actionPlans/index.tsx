import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useDeleteActionPlanById,
  useResolveActionPlanById,
} from '@/store/server/features/organization-development/categories/mutation';
import { useGetAllActionPlan } from '@/store/server/features/organization-development/categories/queries';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import { Avatar, Button, Card, List, Tooltip, Tag } from 'antd';
import { IoCheckmarkSharp } from 'react-icons/io5';
import { MdOutlineModeEditOutline } from 'react-icons/md';
import { RiDeleteBin5Line } from 'react-icons/ri';

interface Params {
  id: string;
}
function ActionPlans({ id }: Params) {
  const { data: actionPlanData, refetch: refetchActionPlan } =
    useGetAllActionPlan(id);
  const { data: employeeData, isLoading: userLoading } = useGetAllUsers();
  const {
    setSelectedActionPlan,
    selectedActionPlan,
    setNumberOfActionPlan,
    setSelectedEditActionPlan,
    setOpen,
  } = useOrganizationalDevelopment();
  const { mutate: deleteEmployeeData, isLoading: actionPlanDeletingLoading } =
    useDeleteActionPlanById();
  const { mutate: resolveActionPlan, isLoading: actionPlanResolvingLoading } =
    useResolveActionPlanById();

  const confirmDeleteActionPlanHandler = () => {
    if (selectedActionPlan) {
      deleteEmployeeData(selectedActionPlan, {
        onSuccess: () => {
          setSelectedActionPlan(null);
        },
      });
    } else {
      return;
    }
  };
  const handleEditActionPlan = (item: string) => {
    setOpen(true);
    setNumberOfActionPlan(1);
    setSelectedEditActionPlan(null);
    setSelectedEditActionPlan(item);
  };
  const handleResolveHandler = (id: string) => {
    resolveActionPlan(
      { status: 'solved', id: id },
      {
        onSuccess: () => {
          refetchActionPlan();
        },
      },
    );
  };
  return (
    <div id="action-plans-container" data-cy="action-plans-container">
      <List
        id="action-plans-list"
        data-cy="action-plans-list"
        loading={userLoading}
        itemLayout="horizontal"
        dataSource={actionPlanData}
        renderItem={(item: any) => {
          // Support multiple responsible users
          const responsibleUsers = Array.isArray(item.responsiblePerson)
            ? item.responsiblePerson
            : [item.responsiblePerson];
          const responsibleUserObjs = responsibleUsers
            .map((id: string) =>
              employeeData?.items?.find((user: any) => user?.id === id),
            )
            .filter(Boolean);
          return (
            <Card key={item.id} id={`action-plan-card-${item.id}`} data-cy={`action-plan-card-${item.id}`} className="mb-4">
              <div id={`action-plan-card-${item.id}-content`} data-cy={`action-plan-card-${item.id}-content`} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div id={`action-plan-card-${item.id}-details`} data-cy={`action-plan-card-${item.id}-details`}>
                  <div id={`action-plan-card-${item.id}-title`} data-cy={`action-plan-card-${item.id}-title`} className="font-bold text-base mb-1">
                    {item?.actionToBeTaken}
                  </div>
                  <div id={`action-plan-card-${item.id}-description`} data-cy={`action-plan-card-${item.id}-description`} className="text-gray-600 text-sm mb-2">
                    {item?.description}
                  </div>
                  <div id={`action-plan-card-${item.id}-responsible-persons`} data-cy={`action-plan-card-${item.id}-responsible-persons`} className="flex items-center gap-2 mb-2">
                    <Avatar.Group
                      data-cy={`action-plan-card-${item.id}-avatar-group`}
                      maxCount={4}
                      maxStyle={{
                        color: '#f56a00',
                        backgroundColor: '#fde3cf',
                      }}
                    >
                      {responsibleUserObjs.map((user: any) => (
                        <Tooltip
                          key={user.id}
                          id={`action-plan-card-${item.id}-avatar-tooltip-${user.id}`}
                          data-cy={`action-plan-card-${item.id}-avatar-tooltip-${user.id}`}
                          title={`${user.firstName} ${user.middleName} ${user.lastName}`}
                        >
                          <Avatar
                            data-cy={`action-plan-card-${item.id}-avatar-${user.id}`}
                            src={user.profileImage}
                            style={{ backgroundColor: '#87d068' }}
                          >
                            {user.firstName?.[0]}
                          </Avatar>
                        </Tooltip>
                      ))}
                    </Avatar.Group>
                  </div>
                  <Tag id={`action-plan-card-${item.id}-status-tag`} data-cy={`action-plan-card-${item.id}-status-tag`} color={item?.status === 'solved' ? 'green' : 'blue'}>
                    {item?.status === 'solved' ? 'Resolved' : 'Pending'}
                  </Tag>
                </div>
                <div id={`action-plan-card-${item.id}-actions`} data-cy={`action-plan-card-${item.id}-actions`} className="flex gap-2 self-start md:self-center">
                  {item?.status !== 'solved' && (
                    <>
                      <Button
                        id={`action-plan-card-${item.id}-edit-button`}
                        data-cy={`action-plan-card-${item.id}-edit-button`}
                        type="primary"
                        onClick={() => handleEditActionPlan(item?.id)}
                      >
                        <MdOutlineModeEditOutline data-cy={`action-plan-card-${item.id}-edit-icon`} />
                      </Button>
                      <Button
                        id={`action-plan-card-${item.id}-delete-button`}
                        data-cy={`action-plan-card-${item.id}-delete-button`}
                        type="primary"
                        loading={actionPlanDeletingLoading}
                        onClick={() => setSelectedActionPlan(item?.id)}
                        danger
                      >
                        <RiDeleteBin5Line data-cy={`action-plan-card-${item.id}-delete-icon`} />
                      </Button>
                      <Tooltip id={`action-plan-card-${item.id}-resolve-tooltip`} data-cy={`action-plan-card-${item.id}-resolve-tooltip`} title="Resolve Action Plan">
                        <Button
                          id={`action-plan-card-${item.id}-resolve-button`}
                          data-cy={`action-plan-card-${item.id}-resolve-button`}
                          className="cursor-pointer"
                          type="primary"
                          loading={actionPlanResolvingLoading}
                          onClick={() => handleResolveHandler(item?.id)}
                          icon={<IoCheckmarkSharp data-cy={`action-plan-card-${item.id}-resolve-button-icon`} id={`action-plan-card-${item.id}-resolve-button-icon`} />}
                        />
                      </Tooltip>
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        }}
      />
      <DeleteModal
        data-cy="action-plan-delete-modal"
        onCancel={() => setSelectedActionPlan(null)}
        onConfirm={confirmDeleteActionPlanHandler}
        open={selectedActionPlan !== null}
        loading={actionPlanDeletingLoading}
      />
    </div>
  );
}

export default ActionPlans;
