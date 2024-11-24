import React, { useState } from 'react';
import { Card, Avatar, List, Tag, Button, Space } from 'antd';
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdAdd,
  MdEdit,
  MdDelete,
} from 'react-icons/md';
import { useGetAllActionPlansByConversationInstanceId } from '@/store/server/features/conversation/action-plan/queries';

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

interface PropsData{
  slug:string,
}
const ActionPlans: React.FC<PropsData> = ({slug}:PropsData) => {
  const {data:conversationInstanceActionPlan,isLoading:actionPlanLoading}=useGetAllActionPlansByConversationInstanceId(slug);

  const [collapseStates, setCollapseStates] = useState<boolean[]>(
    Array(dummyData.length).fill(true),
  );

  const handleCollapseChange = (index: number) => {
    setCollapseStates((prevStates) =>
      prevStates.map((state, i) => (i === index ? !state : state)),
    );
  };
  return (
    <div>
      {conversationInstanceActionPlan?.items?.map((employee:any, index:number) => (
        <Card
          key={employee.id}
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
              <span>{`${employee.firstName} ${employee.lastName}`}</span>
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
              <Button type="primary" icon={<MdDelete />} size="small" danger />
            </Space>
          }
          className="mb-3"
        >
          {!collapseStates[index] && (
            <List.Item>
              <div className="flex w-full">
                <div className="w-1/3 flex flex-col">
                  <div className="text-gray-500 font-semibold mb-2">
                    Responsible Person
                  </div>
                  <div className="text-gray-500 font-semibold">Deadline</div>
                </div>

                <div className="w-2/3 flex flex-col">
                  <div className="flex items-center mb-2">
                    <Avatar src={employee.profileImage} />
                    <span className="ml-2 font-semibold">
                      {employee.firstName} {employee.lastName}
                    </span>
                  </div>
                  <div>
                    <Tag color="blue">{employee.deadline}</Tag>
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        </Card>
      ))}
    </div>
  );
};

export default ActionPlans;
