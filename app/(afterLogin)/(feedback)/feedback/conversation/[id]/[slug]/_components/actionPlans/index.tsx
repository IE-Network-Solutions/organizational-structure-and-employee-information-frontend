import React, { useState } from 'react';
import { Card, Avatar, List, Tag, Button, Space, Popconfirm } from 'antd';
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdEdit,
  MdDelete,
} from 'react-icons/md';
import { useGetAllActionPlansByConversationInstanceId } from '@/store/server/features/CFR/conversation/action-plan/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useDeleteActionPlanByid,
  useEditActionPlan,
} from '@/store/server/features/CFR/conversation/action-plan/mutation';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import dayjs from 'dayjs';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useForm } from 'antd/es/form/Form';
import EditActionPlans from '../editActionPlane';

interface Employee {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  profileImage: string;
  description: string;
  deadline: string;
}

const dummyData: Employee[] = [
  {
    id: '1',
    firstName: 'John',
    middleName: 'J',
    lastName: 'Doe',
    profileImage: 'https://via.placeholder.com/40',
    description: 'Software Engineer at XYZ Corp',
    deadline: '2024-12-15',
  },
  {
    id: '2',
    firstName: 'Jane',
    middleName: 'J',
    lastName: 'Smith',
    profileImage: 'https://via.placeholder.com/40',
    description: 'Marketing Manager at ABC Ltd.',
    deadline: '2024-12-20',
  },
  {
    id: '3',
    firstName: 'Emily',
    middleName: 'J',
    lastName: 'Johnson',
    profileImage: 'https://via.placeholder.com/40',
    description: 'Product Designer at Tech Solutions',
    deadline: '2024-12-25',
  },
];

interface PropsData {
  slug: string;
}
const ActionPlans: React.FC<PropsData> = ({ slug }: PropsData) => {
  const { setOpenEdit, openEdit, actionPlanId, setActionPlanId } =
    useOrganizationalDevelopment();
  const [form2] = useForm();

  const { data: conversationInstanceActionPlan } =
    useGetAllActionPlansByConversationInstanceId(slug);
  const { mutate: deleteActionPlan } = useDeleteActionPlanByid();

  const { data: allUserData } = useGetAllUsers();
  const { mutate: updateActionPlan } = useEditActionPlan();

  const [collapseStates, setCollapseStates] = useState<boolean[]>(
    Array(dummyData.length).fill(true),
  );

  const getEmployeeData = (employeeId: string) => {
    const employeeDataDetail = allUserData?.items?.find(
      (emp: any) => emp?.id === employeeId,
    );
    return employeeDataDetail || {}; // Return an empty object if employeeDataDetail is undefined
  };

  const handleCollapseChange = (index: number) => {
    setCollapseStates((prevStates) =>
      prevStates.map((state, i) => (i === index ? !state : state)),
    );
  };

  const handleDeleteActionPlan = (id: string) => {
    deleteActionPlan(id);
  };
  const editActionPlan = (id: string) => {
    if (!id) return;

    setActionPlanId(id);
    setOpenEdit(true);
  };

  const handleEditActionPlan = (values: any) => {
    const updatedData = {
      ...values,
      id: actionPlanId,
      deadline: values.deadline
        ? dayjs(values.deadline).format('YYYY-MM-DD')
        : null,
    };
    updateActionPlan(updatedData, {
      onSuccess: () => {
        setOpenEdit(false);
        form2.resetFields();
      },
    });
  };

  const modalHeader = (
    <div
      className="flex justify-center text-xl font-extrabold text-gray-800 p-4"
      data-cy="action-plans-edit-modal-header"
    >
      Edit Action Plan
    </div>
  );

  return (
    <div data-cy="action-plans-container">
      {conversationInstanceActionPlan?.items?.map(
        (actionPlan: any, index: number) => (
          <Card
            key={actionPlan.id}
            title={
              <div
                className="flex items-center justify-start space-x-2 w-full"
                data-cy={`action-plans-card-title-${index}`}
              >
                <div
                  onClick={() => handleCollapseChange(index)}
                  style={{ cursor: 'pointer' }}
                  data-cy={`action-plans-card-collapse-toggle-${index}`}
                >
                  {collapseStates[index] ? (
                    <MdKeyboardArrowDown
                      data-cy={`action-plans-card-collapse-down-${index}`}
                    />
                  ) : (
                    <MdKeyboardArrowUp
                      data-cy={`action-plans-card-collapse-up-${index}`}
                    />
                  )}
                </div>
                <span
                  data-cy={`action-plans-card-issue-${index}`}
                >{`${actionPlan?.issue}`}</span>
              </div>
            }
            extra={
              <Space data-cy={`action-plans-card-actions-${index}`}>
                <Button
                  htmlType="button"
                  type="primary"
                  onClick={() => {
                    editActionPlan(actionPlan?.id);
                  }}
                  icon={<MdEdit />}
                  size="small"
                  data-cy={`action-plans-card-edit-btn-${index}`}
                />
                <Popconfirm
                  title="Are you sure you want to delete this item?"
                  onConfirm={() => handleDeleteActionPlan(actionPlan?.id)} // Replace with your delete handler function
                  okText="Yes"
                  cancelText="No"
                  placement="topRight"
                  data-cy={`action-plans-card-delete-confirm-${index}`}
                >
                  <Button
                    type="primary"
                    icon={<MdDelete />}
                    size="small"
                    danger
                    data-cy={`action-plans-card-delete-btn-${index}`}
                  />
                </Popconfirm>
              </Space>
            }
            className="mb-3"
          >
            {!collapseStates[index] && (
              <List.Item data-cy={`action-plans-card-content-${index}`}>
                <div
                  className="flex w-full items-start"
                  data-cy={`action-plans-card-content-wrapper-${index}`}
                >
                  {/* Left Section: Labels */}
                  <div
                    className="w-1/3 flex flex-col space-y-4"
                    data-cy={`action-plans-card-labels-${index}`}
                  >
                    <div
                      className="text-gray-500 font-semibold"
                      data-cy={`action-plans-card-label-responsible-${index}`}
                    >
                      Responsible Person
                    </div>
                    <div
                      className="text-gray-500 font-semibold"
                      data-cy={`action-plans-card-label-deadline-${index}`}
                    >
                      Deadline
                    </div>
                    <div
                      className="text-gray-500 font-semibold"
                      data-cy={`action-plans-card-label-comment-${index}`}
                    >
                      Comment
                    </div>
                  </div>

                  {/* Right Section: Values */}
                  <div
                    className="w-2/3 flex flex-col space-y-4"
                    data-cy={`action-plans-card-values-${index}`}
                  >
                    {/* Responsible Person */}
                    <div data-cy={`action-plans-card-responsible-${index}`}>
                      {actionPlan?.assigneeId ? (
                        <div
                          className="flex items-center"
                          data-cy={`action-plans-card-responsible-wrapper-${index}`}
                        >
                          <Avatar
                            src={actionPlan?.profileImage}
                            data-cy={`action-plans-card-responsible-avatar-${index}`}
                          />
                          <span
                            className="ml-2 font-semibold"
                            data-cy={`action-plans-card-responsible-name-${index}`}
                          >
                            {getEmployeeData(actionPlan?.assigneeId)
                              ?.firstName ?? ''}{' '}
                            {getEmployeeData(actionPlan?.assigneeId)
                              ?.middleName ?? ''}{' '}
                            {getEmployeeData(actionPlan?.assigneeId)
                              ?.lastName ?? ''}
                          </span>
                        </div>
                      ) : (
                        <span
                          className="text-gray-400"
                          data-cy={`action-plans-card-responsible-empty-${index}`}
                        >
                          No assignee
                        </span>
                      )}
                    </div>

                    {/* Deadline */}
                    <div data-cy={`action-plans-card-deadline-${index}`}>
                      {actionPlan?.deadline ? (
                        <Tag
                          color="blue"
                          data-cy={`action-plans-card-deadline-tag-${index}`}
                        >
                          {actionPlan?.deadline}
                        </Tag>
                      ) : (
                        <span
                          className="text-gray-400"
                          data-cy={`action-plans-card-deadline-empty-${index}`}
                        >
                          No deadline set
                        </span>
                      )}
                    </div>

                    {/* Comment */}
                    <div data-cy={`action-plans-card-comment-${index}`}>
                      {actionPlan?.comment ? (
                        <span
                          className="text-gray-700"
                          data-cy={`action-plans-card-comment-text-${index}`}
                        >
                          {actionPlan?.comment}
                        </span>
                      ) : (
                        <span
                          className="text-gray-400"
                          data-cy={`action-plans-card-comment-empty-${index}`}
                        >
                          No comments
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          </Card>
        ),
      )}
      <CustomDrawerLayout
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        modalHeader={modalHeader}
        width="40%"
        data-cy="action-plans-edit-drawer"
      >
        <EditActionPlans
          slug={slug}
          onFinish={(values) => handleEditActionPlan(values)}
          form2={form2}
        />
      </CustomDrawerLayout>
    </div>
  );
};

export default ActionPlans;
