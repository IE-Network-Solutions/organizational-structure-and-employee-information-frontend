import React from 'react';
import { Row, Col, Typography, Tag } from 'antd';
import { MdKey } from 'react-icons/md';
import { FaStar } from 'react-icons/fa';

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
    className={`w-full ${parent ? 'ml-8 mb-1' : 'ml-8 mb-1'}`}
  >
    <Col>
      <Text className="text-xs flex items-center gap-1">
        {`${milestoneIndex !== undefined ? milestoneIndex + 1 + '.' : ''}${
          taskIndex + 1
        } ${task?.task}`}
        {task?.achieveMK ? (
          keyResult?.metricType?.name === 'Milestone' ? (
            <FaStar size={11} />
          ) : (
            <MdKey size={12} />
          )
        ) : (
          ''
        )}
      </Text>
    </Col>
    <Col>
      {/* Priority Section */}
      <Text type="secondary" className="text-[10px] mr-2">
        <span className="text-xl text-blue">&bull;</span> Priority
      </Text>
      <Tag
        className="font-bold border-none w-16 text-center capitalize text-[10px]"
        color={getPriorityColor(task?.priority)}
      >
        {task?.priority || 'None'}
      </Tag>

      {/* Weight Section */}
      <Text type="secondary" className="text-[10px] mr-2">
        <span className="text-xl text-blue">&bull;</span> Weight:
      </Text>
      <Tag
        className="font-bold border-none w-16 text-center text-blue text-[10px]"
        color="#B2B2FF"
      >
        {task?.weight || 0}
      </Tag>

      {/* Target Section */}
      {keyResult?.metricType?.name !== 'Milestone' &&
        keyResult?.metricType?.name !== 'Achieve' && (
          <>
            <Text type="secondary" className="text-[10px]">
              <span className="text-xl text-blue">&bull;</span> Target:
            </Text>
            <Tag
              className="font-bold border-none w-16 text-center text-blue text-[10px]"
              color="#B2B2FF"
            >
              {Number(task?.targetValue)?.toLocaleString() || 'N/A'}
            </Tag>
          </>
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
