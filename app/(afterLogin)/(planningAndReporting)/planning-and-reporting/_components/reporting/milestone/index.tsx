import React from 'react';
import { Row, Col, Tag, Typography, Tooltip } from 'antd';
import { IoCheckmarkSharp } from 'react-icons/io5';
import { IoIosClose } from 'react-icons/io';
import { FaStar } from 'react-icons/fa';
import { MdKey } from 'react-icons/md';
import { NAME } from '@/types/enumTypes';

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
      {tasks?.map((task: Task, taskIndex: number) => (
        <Row
          key={task.taskId}
          className="flex task-row space-y-1 my-2"
          gutter={4}
          align="middle"
          justify="space-between" // Only justifying the space between taskName and others
        >
          <Col className="flex gap-2">
           
            <Text className="text-xs flex flex-col">
              
              <div className="flex items-center gap-1">
              {task?.isAchieved ? (
                 <Tooltip title="Achieved">

                   <div className="py-1 px-1 w-3 h-3 text-white flex items-center justify-center rounded-full bg-green-600">
               
              </div> 
                 </Tooltip>
            
            ) : (
              <Tooltip title="Not Achieved">
                <div className="py-1 text-xl px-1 w-3 h-3 text-white flex items-center justify-center rounded-full bg-red-600">
                
                </div>
              </Tooltip>
            )}
          <div className="border-2 rounded-full w-3 h-3 flex items-center justify-center border-[#cfaaff]">
            <span className="rounded-full bg-blue w-1 h-1"></span>
          </div>

          <span>{task?.taskName} </span>
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
            {task?.keyResult?.metricType?.name !== NAME.MILESTONE &&
              task?.keyResult?.metricType?.name !== NAME.ACHIEVE && (
                <>
                  <Text type="secondary" className="text-[10px] mr-2">
                    <span className="text-xl" style={{ color: 'blue' }}>
                      &bull;
                    </span>{' '}
                    Actual
                  </Text>
                  <Tag
                    className="font-bold border-none w-16 text-center capitalize text-[10px]"
                    color={'blue'}
                  >
                    {Number(task?.actualValue)?.toLocaleString() || 'None'}
                  </Tag>
                  <Text type="secondary" className="text-[10px] mr-2">
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
              )}{' '}
            <Text type="secondary" className="text-[10px] mr-2">
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
        </Row>
      ))}
    </div>
  );
};

export default TasksDisplayer;
