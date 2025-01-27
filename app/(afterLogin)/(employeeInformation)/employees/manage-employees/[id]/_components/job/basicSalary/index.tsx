import { useGetBasicSalaryById } from '@/store/server/features/employees/employeeManagment/basicSalary/queries';
import { useGetPositionsById } from '@/store/server/features/employees/positions/queries';
import { Card, Col, Row, Space, Spin, Timeline } from 'antd';
import React from 'react';

interface Ids {
  id: string;
}
export const BasicSalaryDetails = ({
  empId,
}: {
  empId: string;
  fallbackProfileImage?: string;
}) => {
  const { error, isLoading, data: userPosition } = useGetPositionsById(empId);

  if (isLoading)
    return (
      <>
        <Spin />
      </>
    );

  if (error || !userPosition) return '-';

  const userName = userPosition?.name || '-';

  return <Space size="small">{userName}</Space>;
};

const BasicSalary: React.FC<Ids> = ({ id }) => {
  const { isLoading, data: basicSalary } = useGetBasicSalaryById(id);

  return (
    <div>
      <Card title="Basic Salary" className="my-6 mt-0">
        <Row className="my-3 justify-items-center items-center border border-solid p-4 rounded-lg">
          <Col
            span={12}
            className="justify-items-center items-center font-bold"
          >
            Date
          </Col>
          <Col span={12} className="justify-items-center items-center">
            Reason
          </Col>
        </Row>

        <Timeline mode="left" className="border border-solid p-4 rounded-lg">
          {isLoading ? (
            <Timeline.Item>
              <div className="flex justify-center items-center">
                <Spin size="large" />
              </div>
            </Timeline.Item>
          ) : !basicSalary || basicSalary.length === 0 ? (
            <Timeline.Item>
              <div className="text-center text-gray-500">
                No Basic Salary records found.
              </div>
            </Timeline.Item>
          ) : (
            basicSalary
              .slice()
              .reverse()
              .map((item: any) => (
                <Timeline.Item
                  key={item.id}
                  label={new Date(item?.createdAt).toLocaleDateString()}
                >
                  <div>
                    <p>
                      <strong>Basic Salary:</strong> ${item?.basicSalary}
                    </p>
                    <p>
                      <strong>Status:</strong>{' '}
                      {item?.status ? 'Active' : 'Inactive'}
                    </p>
                    <p>
                      <strong>Job Position:</strong>{' '}
                      <BasicSalaryDetails empId={item?.jobInfo?.positionId} />
                    </p>
                  </div>
                </Timeline.Item>
              ))
          )}
        </Timeline>
      </Card>
    </div>
  );
};

export default BasicSalary;
