import React from 'react';
import { Row, Col, Tag, Typography, Tooltip } from 'antd';
import { IoCheckmarkSharp } from 'react-icons/io5';
import { IoIosClose } from 'react-icons/io';
import { FaStar } from 'react-icons/fa';
import { MdKey } from 'react-icons/md';

const { Text } = Typography;

type Task = {
  taskId: string;
  taskName: string;
  priority: 'low' | 'medium' | 'high';
  status: 'reported' | 'pending' | 'completed' | 'Done';
  actualValue: string;
  isAchieved: boolean;
  customReason: string;
  achieveMK: boolean;
  milestone: any;
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
          justify="space-between" // Only justifying the space between taskName and others
        >
          <Col className="flex gap-2">
            {task?.isAchieved ? (
              <div className="py-1 px-1 w-4 h-4 text-white flex items-center justify-center rounded-md bg-green-600">
                <IoCheckmarkSharp size={14} />
              </div>
            ) : (
              <Tooltip title="Not Achieved">
                <div className="py-1 text-xl px-1 w-4 h-4 text-white flex items-center justify-center rounded-md bg-red-600">
                  <IoIosClose />
                </div>
              </Tooltip>
            )}
            <Text className="text-xs flex flex-col">
              <span className="flex items-center gap-1">
                {`${taskIndex + 1}. ${task.taskName}`}{' '}
                {task?.achieveMK ? (
                  task?.milestone ? (
                    <FaStar size={11} />
                  ) : (
                    <MdKey size={12} className="" />
                  )
                ) : (
                  ''
                )}
              </span>
              {task?.customReason && (
                <Tooltip title={task.customReason}>
                  <Text className="text-[10px] mb-2">
                    {`Reason: ${task.customReason?.length >= 100 ? task.customReason.slice(0, 100) + '...' : task.customReason}`}
                  </Text>
                </Tooltip>
              )}
            </Text>
          </Col>

          {/* This section is now justified to space between taskName and the rest */}
          <Col>
            <Text type="secondary" className="text-[10px] mr-2">
              <span className="text-xl" style={{ color: 'blue' }}>
                &bull;
              </span>{' '}
              Priority
            </Text>
            <Tag
              className="font-bold border-none w-16 text-center capitalize text-[10px]"
              color={
                task?.priority === 'high'
                  ? 'red'
                  : task?.priority === 'medium'
                    ? 'orange'
                    : 'green'
              }
            >
              {task?.priority || 'None'}
            </Tag>
            <Text type="secondary" className="text-[10px] mr-2">
              <span className="text-xl" style={{ color: 'blue' }}>
                &bull;
              </span>{' '}
              Actual Value
            </Text>
            <Tag
              className="font-bold border-none w-16 text-center capitalize text-[10px]"
              color={'blue'}
            >
              {task?.actualValue || 'None'}
            </Tag>
            <Text type="secondary" className="text-[10px] mr-2">
              <span className="text-xl" style={{ color: 'blue' }}>
                &bull;
              </span>{' '}
              Target
            </Text>
            <Tag
              className="font-bold border-none w-10 text-center cap text-blue text-[10px]"
              color="#B2B2FF"
            >
              {0}
            </Tag>
          </Col>
        </Row>
      ))}
    </div>
  );
};

export default TasksDisplayer;
