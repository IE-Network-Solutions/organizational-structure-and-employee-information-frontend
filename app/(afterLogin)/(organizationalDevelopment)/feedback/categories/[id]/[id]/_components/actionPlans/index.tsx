import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useDeleteActionPlanById } from '@/store/server/features/organization-development/categories/mutation';
import { useGetAllActionPlan } from '@/store/server/features/organization-development/categories/queries';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import { Avatar, Button, Card, List } from 'antd';
import React from 'react';
import { FaChevronUp } from 'react-icons/fa';
import { MdOutlineModeEditOutline } from 'react-icons/md';
import { RiDeleteBin5Line } from 'react-icons/ri';

interface Params {
  id: string;
}
function ActionPlans({ id }: Params) {
  const { data: actionPlanData } = useGetAllActionPlan(id);
  const { data: employeeData, isLoading: userLoading } = useGetAllUsers();
  const { setSelectedActionPlan, selectedActionPlan, setOpen } =
    useOrganizationalDevelopment();
  const { mutate: deleteEmployeeData } = useDeleteActionPlanById();
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
    setSelectedActionPlan(item);
  };
  return (
    <div>
      <List
        loading={userLoading}
        itemLayout="horizontal"
        dataSource={actionPlanData}
        renderItem={(item: any) => (
          <Card>
            <List.Item className="flex justify-between gap-2">
              <div className="flex justify-start gap-4">
                <FaChevronUp className="font-bold" />
                <div>{item?.actionToBeTaken}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="primary"
                  onClick={() => handleEditActionPlan(item?.id)}
                >
                  <MdOutlineModeEditOutline />
                </Button>
                <Button
                  type="primary"
                  onClick={() => setSelectedActionPlan(item?.id)}
                  danger
                >
                  <RiDeleteBin5Line />
                </Button>
              </div>
            </List.Item>
            <List.Item className="flex justify-start gap-2">
              <div className="flex flex-col text-gray-400 text-sm">
                <p>Responsible Person</p>
                <p>Description</p>
              </div>
              {employeeData?.items?.map((user: any) => {
                return (
                  user?.id === item.responsiblePerson && (
                    <List.Item.Meta
                      avatar={
                        <Avatar className="mt-2" src={user?.profileImage} />
                      }
                      title={
                        <span className="text-sm">
                          {user?.firstName + ' ' + user?.lastName}
                        </span>
                      }
                      description={item.description}
                    />
                  )
                );
              })}
            </List.Item>
          </Card>
        )}
      />
      <DeleteModal
        onCancel={() => setSelectedActionPlan(null)}
        onConfirm={confirmDeleteActionPlanHandler}
        open={selectedActionPlan !== null}
      />
    </div>
  );
}

export default ActionPlans;
