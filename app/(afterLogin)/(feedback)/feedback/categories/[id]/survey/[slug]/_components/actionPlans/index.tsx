import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useDeleteActionPlanById,
  useResolveActionPlanById,
} from '@/store/server/features/organization-development/categories/mutation';
import { useGetAllActionPlan } from '@/store/server/features/organization-development/categories/queries';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import { Avatar, Button, Card, List, Tooltip } from 'antd';
import React from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { IoCheckmarkSharp } from 'react-icons/io5';
import { MdOutlineModeEditOutline } from 'react-icons/md';
import { RiDeleteBin5Line } from 'react-icons/ri';

interface Params {
  id: string;
}
function ActionPlans({ id }: Params) {
  const { data: actionPlanData } = useGetAllActionPlan(id);
  const { data: employeeData, isLoading: userLoading } = useGetAllUsers();
  const {
    setSelectedActionPlan,
    selectedActionPlan,
    visibleItems,
    setVisibleItems,
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
    resolveActionPlan({ status: 'solved', id: id });
  };
  return (
    <div>
      <List
        loading={userLoading}
        itemLayout="horizontal"
        dataSource={actionPlanData}
        renderItem={(item: any) => (
          <Card key={item.id}>
            <List.Item
              className="flex justify-between gap-2 cursor-pointer"
              onClick={() => setVisibleItems(item.id)} // Toggle visibility for this item
            >
              <div className="flex justify-start gap-4">
                {visibleItems[item.id] ? (
                  <FaChevronUp className="font-bold" />
                ) : (
                  <FaChevronDown className="font-bold" />
                )}
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
                  loading={actionPlanDeletingLoading}
                  onClick={() => setSelectedActionPlan(item?.id)}
                  danger
                >
                  <RiDeleteBin5Line />
                </Button>
                {item?.status !== 'solved' && (
                  <Tooltip title="Resolve Action Plan">
                    <Button
                      hidden={item?.status === 'solved'}
                      className="cursor-pointer"
                      type="primary"
                      loading={actionPlanResolvingLoading}
                      onClick={() => handleResolveHandler(item?.id)}
                      icon={<IoCheckmarkSharp />}
                    />
                  </Tooltip>
                )}
              </div>
            </List.Item>
            {visibleItems[item.id] && (
              <>
                <List.Item className="flex justify-start gap-2">
                  <div className="flex flex-col text-gray-400 text-sm">
                    <p>Responsible Person</p>
                    <p>Description</p>
                  </div>
                  {employeeData?.items?.map((user: any) => {
                    return (
                      user?.id === item.responsiblePerson && (
                        <List.Item.Meta
                          key={user.id}
                          avatar={
                            <Avatar className="mt-2" src={user?.profileImage} />
                          }
                          title={
                            <span className="text-sm">
                              {user?.firstName +
                                ' ' +
                                user?.middleName +
                                ' ' +
                                user?.lastName}
                            </span>
                          }
                          description={item.description}
                        />
                      )
                    );
                  })}
                </List.Item>
                <List.Item className="flex justify-end">
                  <Button
                    disabled={item?.status === 'solved'}
                    onClick={() => handleResolveHandler(item?.id)}
                    className="flex justify-end bg-blue disabled:bg-gray-500 disabled:text-black text-white"
                  >
                    {item?.status === 'solved' ? 'Resolved' : 'Resolve'}
                  </Button>
                </List.Item>
              </>
            )}
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
