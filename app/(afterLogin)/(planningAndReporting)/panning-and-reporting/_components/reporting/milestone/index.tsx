import React from 'react';
import { Row, Col, Tag, Typography, Tooltip, Avatar } from 'antd';
import { IoCheckmarkSharp } from 'react-icons/io5';
import { IoIosClose } from 'react-icons/io';

const { Text } = Typography;

type Task = {
  taskId: string;
  taskName: string;
  priority: "low" | "medium" | "high";
  status: "reported" | "pending" | "completed";
  actualValue: string;
  isAchived: boolean;
};

type Props = {
  tasks: Task[];
};

const TasksDisplayer: React.FC<Props> = ({ tasks }) => {
  return (
    <div className='ml-4'>
      {tasks?.map((task: Task, taskIndex: number) => (
        <Row key={task.taskId} className="task-row">
            <Col span={1} className='mr-1'>
                {task.isAchived ?<Tooltip title="Approve Plan">
                    <Avatar
                        size={16}
                        alt="acheived"
                        className="cursor-pointer"
                        shape="square"
                        style={{ backgroundColor: '#148220' }}
                        icon={<IoCheckmarkSharp />}
                    />
                </Tooltip>
                :
                <Tooltip title="not Achived">
                          <Avatar
                            size={16}
                            alt="Reject Plan"
                            className="cursor-pointer"
                            shape="square"
                            style={{ backgroundColor: '#b50d20' }}
                            icon={<IoIosClose />}
                          />
                        </Tooltip>
                }
            </Col>
          <Col span={23}>
            <Row>
              <Col>
                <Text className="text-xs">
                  {`${taskIndex + 1}. ${task.taskName}`}
                </Text>
              </Col>
              <Col>
                <Row justify="start" className="gap-1">
                  <Col>
                    <Text type="secondary" className="text-xs">
                      <span style={{ color: 'blue' }}>&bull;</span> Priority:{' '}
                    </Text>
                    <Tag color={task.priority === 'high' ? 'red' : 'green'}>
                      {task.priority || 'None'}
                    </Tag>
                  </Col>
                  <Col className="text-xs">
                    <Text type="secondary" className="text-xs">
                      <span style={{ color: 'blue' }}>&bull;</span> Actual Value:{' '}
                    </Text>
                    <Tag color="blue">{task.actualValue || 'N/A'}</Tag>
                  </Col>
                  <Col className="text-xs">
                    <Text type="secondary" className="text-xs">
                      <span style={{ color: 'blue' }}>&bull;</span> Status:{' '}
                    </Text>
                    <Tag color="blue">{task.status || 'N/A'}</Tag>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      ))}
    </div>
  );
};

export default TasksDisplayer;
