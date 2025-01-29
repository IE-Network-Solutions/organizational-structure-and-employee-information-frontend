import React from 'react';
import { Row, Col, Typography, Tag } from 'antd';
import { MdKey } from 'react-icons/md';
import { FaStar } from 'react-icons/fa';
import { NAME } from '@/types/enumTypes';

const { Text } = Typography;

// Utility Function for Priority Color
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'red';
    case 'medium':
      return 'orange';
    default:
      return 'green';
  }
};

// Reusable Task Row Component
const TaskRow = ({
  task,
  taskIndex,
  milestoneIndex,
  keyResult,
  parent = false,
}: any) => (
  <Row
    align="middle"
    justify="space-between"
    className={`w-full px-2 py-1 ${parent ? 'ml-8' : 'ml-4'}`}
  >
    {/* Task Name & Icon */}
    <Col span={12} className="flex items-center space-x-2">
      <Text className="text-xs flex items-center gap-1 font-medium">
        {`${milestoneIndex !== undefined ? milestoneIndex + 1 + '.' : ''}${
          taskIndex + 1
        } ${task?.task}`}
      </Text>
      {task?.achieveMK &&
        (keyResult?.metricType?.name === 'Milestone' ? (
          <FaStar size={11} />
        ) : (
          <MdKey size={12} />
        ))}
    </Col>

    {/* Task Details */}
    <Col span={12} className="flex justify-end items-center space-x-3">
      {/* Priority Section */}
      <div className="flex items-center space-x-1">
        <Text type="secondary" className="text-[10px]">
          <span className="text-xl text-blue">&bull;</span> Priority:
        </Text>
        <Tag
          className="font-bold border-none w-16 text-center capitalize text-[10px]"
          color={getPriorityColor(task?.priority)}
        >
          {task?.priority || 'None'}
        </Tag>
      </div>

      {/* Weight Section */}
      <div className="flex items-center space-x-1">
        <Text type="secondary" className="text-[10px]">
          <span className="text-xl text-blue">&bull;</span> Weight:
        </Text>
        <Tag
          className="font-bold border-none w-12 text-center text-blue text-[10px]"
          color="#B2B2FF"
        >
          {task?.weight || 0}
        </Tag>
      </div>

      {/* Target Section (if applicable) */}
      {keyResult?.metricType?.name !== 'Milestone' &&
        keyResult?.metricType?.name !== 'Achieve' && (
          <div className="flex items-center space-x-1">
            <Text type="secondary" className="text-[10px]">
              <span className="text-xl text-blue">&bull;</span> Target:
            </Text>
            <Tag
              className="font-bold border-none w-16 text-center text-blue text-[10px]"
              color="#B2B2FF"
            >
              {Number(task?.targetValue)?.toLocaleString() || 'N/A'}
              {keyResult?.metricType?.name === NAME.PERCENTAGE && '%'}
            </Tag>
          </div>
        )}
    </Col>
  </Row>
);

// Reusable Milestone Component
const Milestone = ({ milestone, milestoneIndex, keyResult }: any) => (
  <Row className="rounded-lg py-1 pr-3" key={milestone?.id}>
    {/* Milestone Title */}
    {keyResult?.metricType?.name === 'Milestone' && (
      <Col className="ml-5 mb-1" span={24}>
        <strong>
          {`${milestoneIndex + 1}. ${
            milestone?.title || milestone?.description || 'No milestone Title'
          }`}
        </strong>
      </Col>
    )}
    {/* Tasks */}
    {milestone?.tasks?.length > 0
      ? milestone.tasks.map((task: any, taskIndex: number) => (
          <TaskRow
            key={task.id}
            task={task}
            taskIndex={taskIndex}
            milestoneIndex={milestoneIndex}
            keyResult={keyResult}
          />
        ))
      : // Parent Tasks
        milestone?.parentTask?.map((task: any, taskIndex: number) => (
          <Row key={task.id} className="w-full">
            <Col
              className="ml-6 mb-1 font-semibold"
              span={24}
            >{`${milestoneIndex + 1}.${taskIndex + 1} ${task?.task}`}</Col>
            {task?.tasks?.map((ptask: any, pIndex: number) => (
              <TaskRow
                key={ptask.id}
                task={ptask}
                taskIndex={pIndex}
                milestoneIndex={milestoneIndex}
                keyResult={keyResult}
                parent={true}
              />
            ))}
          </Row>
        ))}
  </Row>
);

// Main Component
const MilestoneTasks = ({ keyResult, keyResultIndex }: any) => {
  return (
    <>
      {/* Render Tasks */}
      {keyResult?.tasks?.length > 0
        ? keyResult?.tasks?.map((task: any, taskIndex: number) => (
            <TaskRow
              key={task.id}
              task={task}
              taskIndex={taskIndex}
              keyResult={keyResult}
              keyResultIndex={keyResultIndex}
            />
          ))
        : // Render Parent Tasks
          keyResult?.parentTask?.map((task: any, taskIndex: number) => (
            <Row key={task.id} className="w-full">
              <Col
                className="ml-5 mb-1 font-semibold"
                span={24}
              >{`${taskIndex + 1}. ${task?.task}`}</Col>
              {task?.tasks?.map((ptask: any, pIndex: number) => (
                <TaskRow
                  key={ptask.id}
                  task={ptask}
                  taskIndex={pIndex}
                  keyResult={keyResult}
                  parent={true}
                  keyResultIndex={keyResultIndex}
                />
              ))}
            </Row>
          ))}
      {/* Render Milestones */}
      {keyResult?.milestones?.map((milestone: any, milestoneIndex: number) => (
        <Milestone
          key={milestone.id}
          milestone={milestone}
          milestoneIndex={milestoneIndex}
          keyResult={keyResult}
          keyResultIndex={keyResultIndex}
        />
      ))}
    </>
  );
};

export default MilestoneTasks;
