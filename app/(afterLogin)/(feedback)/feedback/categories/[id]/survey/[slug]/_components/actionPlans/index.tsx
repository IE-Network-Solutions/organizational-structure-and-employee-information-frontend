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
    <div>
      <List
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
            <Card key={item.id} className="mb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="font-bold text-base mb-1">
                    {item?.actionToBeTaken}
                  </div>
                  <div className="text-gray-600 text-sm mb-2">
                    {item?.description}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar.Group
                      maxCount={4}
                      maxStyle={{
                        color: '#f56a00',
                        backgroundColor: '#fde3cf',
                      }}
                    >
                      {responsibleUserObjs.map((user: any) => (
                        <Tooltip
                          key={user.id}
                          title={`${user.firstName} ${user.middleName} ${user.lastName}`}
                        >
                          <Avatar
                            src={user.profileImage}
                            style={{ backgroundColor: '#87d068' }}
                          >
                            {user.firstName?.[0]}
                          </Avatar>
                        </Tooltip>
                      ))}
                    </Avatar.Group>
                  </div>
                  <Tag color={item?.status === 'solved' ? 'green' : 'blue'}>
                    {item?.status === 'solved' ? 'Resolved' : 'Pending'}
                  </Tag>
                </div>
                <div className="flex gap-2 self-start md:self-center">
                  {item?.status !== 'solved' && (
                    <>
                      <Button
                        type="primary"
                        onClick={() => handleEditActionPlan(item?.id)}
                      >
                        <MdOutlineModeEditOutline />
                      </Button>
                      <Button
                        type="primary"
                        loading={actionPlanDeletingLoading}
                        onClick={() => setSelectedActionPlan(item?.id)}
                        danger
                      >
                        <RiDeleteBin5Line />
                      </Button>
                      <Tooltip title="Resolve Action Plan">
                        <Button
                          className="cursor-pointer"
                          type="primary"
                          loading={actionPlanResolvingLoading}
                          onClick={() => handleResolveHandler(item?.id)}
                          icon={<IoCheckmarkSharp />}
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
        onCancel={() => setSelectedActionPlan(null)}
        onConfirm={confirmDeleteActionPlanHandler}
        open={selectedActionPlan !== null}
        loading={actionPlanDeletingLoading}
      />
    </div>
  );
}

export default ActionPlans;
