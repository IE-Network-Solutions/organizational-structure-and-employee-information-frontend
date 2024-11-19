import React from 'react';
import { Row, Col, Tag, Typography, Tooltip, Avatar } from 'antd';
import { IoCheckmarkSharp } from 'react-icons/io5';
import { IoIosClose } from 'react-icons/io';

const { Text } = Typography;

type Task = {
  taskId: string;
  taskName: string;
  priority: 'low' | 'medium' | 'high';
  status: 'reported' | 'pending' | 'completed' | 'Done';
  actualValue: string;
  isAchieved: boolean;
};

type Props = {
  tasks: Task[];
};

const TasksDisplayer: React.FC<Props> = ({ tasks }) => {
  return (
    <div className="ml-4">
      {tasks?.map((task: Task, taskIndex: number) => (
        <Row
          key={task.taskId}
          className="flex task-row space-y-1"
          gutter={4}
          align="middle"
        >
          <Col span={1}>
            {task?.status === 'Done' ? (
              <Tooltip title="Achieved">
                <Avatar
                  size={16}
                  alt="achieved"
                  className="cursor-pointer"
                  shape="square"
                  style={{ backgroundColor: '#148220' }}
                  icon={<IoCheckmarkSharp />}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Not Achieved">
                <Avatar
                  size={16}
                  alt="Reject Plan"
                  className="cursor-pointer"
                  shape="square"
                  style={{ backgroundColor: '#b50d20' }}
                  icon={<IoIosClose />}
                />
              </Tooltip>
            )}
          </Col>
          <Col>
            <Text className="text-xs">{`${taskIndex + 1}. ${task.taskName}`}</Text>
          </Col>
          <Col>
            <Text type="secondary" className="text-xs">
              <span style={{ color: 'blue' }}>&bull;</span> Priority:{' '}
            </Text>
            <Tag color={task.priority === 'high' ? 'red' : 'green'}>
              {task.priority || 'None'}
            </Tag>
          </Col>
          <Col>
            <Text type="secondary" className="text-xs">
              <span style={{ color: 'blue' }}>&bull;</span> Actual Value:{' '}
            </Text>
            <Tag color="blue">{task.actualValue || 'N/A'}</Tag>
          </Col>
          <Col>
            <Text type="secondary" className="text-xs">
              <span style={{ color: 'blue' }}>&bull;</span> Status:{' '}
            </Text>
            <Tag color="blue">{task.status || 'N/A'}</Tag>
          </Col>
        </Row>
      ))}
    </div>
  );
};

export default TasksDisplayer;
