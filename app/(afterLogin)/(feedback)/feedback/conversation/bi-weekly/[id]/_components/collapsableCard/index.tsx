import React, { useState } from 'react';
import { Card, Avatar, List, Tag } from 'antd';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  description: string;
}

const dummyData: Employee[] = [
  {
    id: '1',
    firstName: 'okr',
    lastName: 'score',
    profileImage: 'https://via.placeholder.com/40',
    description: 'Software Engineer at XYZ Corp',
  },
  {
    id: '2',
    firstName: 'Staff development',
    lastName: 'Smith',
    profileImage: 'https://via.placeholder.com/40',
    description: 'Marketing Manager at ABC Ltd.',
  },
  {
    id: '3',
    firstName: 'challenges',
    lastName: 'and issues',
    profileImage: 'https://via.placeholder.com/40',
    description: 'Product Designer at Tech Solutions',
  },
];

const CollapsibleCardList: React.FC = () => {
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
      {dummyData.map((employee, index) => (
        <Card
          key={employee.id}
          title={`${employee.firstName} ${employee.lastName}`}
          extra={
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
          }
          className="mb-3"
        >
          {!collapseStates[index] && (
            <List.Item>
              <div className="flex w-full">
                <div className="w-1/2 flex items-center">
                  <Avatar src={employee.profileImage} />
                  <span className="ml-2 font-semibold">
                    {employee.firstName} {employee.lastName}
                  </span>
                </div>
                <div className="w-1/2">
                  <Tag color="blue">{employee.description}</Tag>
                </div>
              </div>
            </List.Item>
          )}
        </Card>
      ))}
    </div>
  );
};

export default CollapsibleCardList;
