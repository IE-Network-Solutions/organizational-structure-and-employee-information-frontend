import React, { useState } from 'react';
import { Card, Avatar, List, Tag, Button, Space, Popconfirm } from 'antd';
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdAdd,
  MdEdit,
  MdDelete,
} from 'react-icons/md';
import { useGetAllActionPlansByConversationInstanceId } from '@/store/server/features/conversation/action-plan/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useDeleteActionPlanByid } from '@/store/server/features/conversation/action-plan/mutation';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  description: string;
  deadline: string;
}

const dummyData: Employee[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    profileImage: 'https://via.placeholder.com/40',
    description: 'Software Engineer at XYZ Corp',
    deadline: '2024-12-15',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    profileImage: 'https://via.placeholder.com/40',
    description: 'Marketing Manager at ABC Ltd.',
    deadline: '2024-12-20',
  },
  {
    id: '3',
    firstName: 'Emily',
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
  const { data: conversationInstanceActionPlan } =
    useGetAllActionPlansByConversationInstanceId(slug);
  const { mutate: deleteActionPlan } = useDeleteActionPlanByid();

  const { data: allUserData } = useGetAllUsers();

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
  return (
    <div>
      {conversationInstanceActionPlan?.items?.map(
        (actionPlan: any, index: number) => (
          <Card
            key={actionPlan.id}
            title={
              <div className="flex items-center justify-start space-x-2 w-full">
                <div
                  onClick={() => handleCollapseChange(index)}
                  style={{ cursor: 'pointer' }}
                >
                  {collapseStates[index] ? (
                    <MdKeyboardArrowDown />
                  ) : (
                    <MdKeyboardArrowUp />
                  )}
                </div>
                <span>{`${actionPlan?.issue}`}</span>
              </div>
            }
            extra={
              <Space>
                <Button icon={<MdAdd />} size="small" />
                <Button
                  htmlType="button"
                  type="primary"
                  icon={<MdEdit />}
                  size="small"
                />
                <Popconfirm
                  title="Are you sure you want to delete this item?"
                  onConfirm={() => handleDeleteActionPlan(actionPlan?.id)} // Replace with your delete handler function
                  okText="Yes"
                  cancelText="No"
                  placement="topRight"
                >
                  <Button
                    type="primary"
                    icon={<MdDelete />}
                    size="small"
                    danger
                  />
                </Popconfirm>
              </Space>
            }
            className="mb-3"
          >
            {!collapseStates[index] && (
              <List.Item>
                <div className="flex w-full items-start">
                  {/* Left Section: Labels */}
                  <div className="w-1/3 flex flex-col space-y-4">
                    <div className="text-gray-500 font-semibold">
                      Responsible Person
                    </div>
                    <div className="text-gray-500 font-semibold">Deadline</div>
                    <div className="text-gray-500 font-semibold">Comment</div>
                  </div>

                  {/* Right Section: Values */}
                  <div className="w-2/3 flex flex-col space-y-4">
                    {/* Responsible Person */}
                    <div>
                      {actionPlan?.assigneeId ? (
                        <div className="flex items-center">
                          <Avatar src={actionPlan?.profileImage} />
                          <span className="ml-2 font-semibold">
                            {getEmployeeData(actionPlan?.assigneeId)
                              ?.firstName ?? ''}{' '}
                            {getEmployeeData(actionPlan?.assigneeId)
                              ?.lastName ?? ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No assignee</span>
                      )}
                    </div>

                    {/* Deadline */}
                    <div>
                      {actionPlan?.deadline ? (
                        <Tag color="blue">{actionPlan?.deadline}</Tag>
                      ) : (
                        <span className="text-gray-400">No deadline set</span>
                      )}
                    </div>

                    {/* Comment */}
                    <div>
                      {actionPlan?.comment ? (
                        <span className="text-gray-700">
                          {actionPlan?.comment}
                        </span>
                      ) : (
                        <span className="text-gray-400">No comments</span>
                      )}
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          </Card>
        ),
      )}
    </div>
  );
};

export default ActionPlans;
