import React from 'react';
import { Row, Col, Tag, Typography, Tooltip } from 'antd';
import { FaStar } from 'react-icons/fa';
import { MdKey } from 'react-icons/md';
import { NAME } from '@/types/enumTypes';
import { FaCheck, FaTimes } from 'react-icons/fa';

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
  keyResult: any;
  weightPlan: number;
  targetValue: number;
};

type Props = {
  tasks: Task[];
};

const TasksDisplayer: React.FC<Props> = ({ tasks }) => {
  return (
    <div className="ml-4">
      {tasks?.map((task: Task) => (
        <Row
          key={task.taskId}
          className="flex task-row space-y-1 my-2 sm:px-10"
          gutter={4}
          align="middle"
          justify="space-between" // Only justifying the space between taskName and others
        >
          <Col className="flex gap-2">
            <Text className="text-xs flex flex-col">
              <div className="flex items-center gap-1 max-w-[250px] sm:max-w-full">
                {task?.isAchieved ? (
                  <Tooltip title="Achieved">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 text-white flex items-center justify-center rounded-full bg-green-600 shrink-0">
                      <FaCheck size={8} />
                    </div>
                  </Tooltip>
                ) : (
                  <Tooltip title="Not Achieved">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 text-white flex items-center justify-center rounded-full bg-red-600 shrink-0">
                      <FaTimes size={8} />
                    </div>
                  </Tooltip>
                )}
                <div className="border-2 rounded-full w-3 h-3 flex items-center justify-center border-[#B2B2FF] shrink-0">
                  <span className="rounded-full bg-blue w-1 h-1"></span>
                </div>

                <span className="truncate">{task?.taskName} </span>
                {task?.achieveMK ? (
                  task?.milestone ? (
                    <FaStar size={11} />
                  ) : (
                    <MdKey size={12} className="" />
                  )
                ) : (
                  ''
                )}
              </div>

              {/* {task?.customReason && (
                <Tooltip title={task.customReason}>
                  <Text className="text-[10px] mb-2">
                    {`Reason: ${task.customReason?.length >= 100 ? task.customReason.slice(0, 100) + '...' : task.customReason}`}
                  </Text>
                </Tooltip>
              )} */}
            </Text>
          </Col>

          {/* This section is now justified to space between taskName and the rest */}
          { /* Desktop View */}
          <Col className="hidden sm:block">
            <Text type="secondary" className="text-[10px]">
              <span className="text-xl" style={{ color: 'blue' }}>
                &bull;
              </span>
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
            {task?.keyResult?.metricType?.name !== NAME.MILESTONE &&
              task?.keyResult?.metricType?.name !== NAME.ACHIEVE && (
                <>
                  <Text type="secondary" className="text-[10px]">
                    <span className="text-xl" style={{ color: 'blue' }}>
                      &bull;
                    </span>
                    Achieved
                  </Text>
                  <Tag
                    className="font-bold border-none w-16 text-center capitalize text-[10px]"
                    color={'blue'}
                  >
                    {Number(task?.actualValue)?.toLocaleString() || 'None'}
                  </Tag>
                  <Text type="secondary" className="text-[10px]">
                    <span className="text-xl" style={{ color: 'blue' }}>
                      &bull;
                    </span>
                    Target
                  </Text>
                  <Tag
                    className="font-bold border-none w-16 text-center capitalize text-[10px]"
                    color={'blue'}
                  >
                    {Number(task?.targetValue)?.toLocaleString() || 'None'}
                  </Tag>
                </>
              )}
            <Text type="secondary" className="text-[10px]">
              <span className="text-xl" style={{ color: 'blue' }}>
                &bull;
              </span>
              Weight
            </Text>
            <Tag
              className="font-bold border-none w-10 text-center cap text-blue text-[10px]"
              color="#B2B2FF"
            >
              {task?.weightPlan || 0}
            </Tag>
          </Col>
          { /* Mobile View */}
          <Col className="block sm:hidden">
          <div className='flex justify-between w-60 py-1'>
          <div>
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
            </div>
            <div className='flex gap-2'>
            <span className="text-xs text-gray-500">
                  <span className="text-blue mr-1">&bull;</span>Weight
                </span>
            <Tag
      className="font-semibold border-none text-blue px-1.5 py-0 h-4 text-xs"
      color="#e7e7ff"
      >
              {task?.weightPlan || 0}
            </Tag>
            </div>
            </div>
          </Col>
        </Row>
      ))}
    </div>
  );
};

export default TasksDisplayer;
