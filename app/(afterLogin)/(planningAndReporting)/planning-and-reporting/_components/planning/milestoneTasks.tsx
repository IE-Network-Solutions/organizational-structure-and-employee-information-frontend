import React from 'react';
import { Row, Col, Typography, Tag } from 'antd';
import { MdKey } from 'react-icons/md';
import { FaStar } from 'react-icons/fa';
import ParentTask from './parentTask';

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
const TaskRow = ({ task, keyResult, parent = false }: any) => (
  <Row
    align="middle"
    justify="space-between"
    className={`w-full ${parent ? 'ml-5 mb-1' : 'ml-5 mb-1'}`}
  >
    <Col>
      <Text className="text-xs flex items-center gap-1">
        <div className="flex items-center gap-1">
          <div className="border-2 rounded-full w-3 h-3 flex items-center justify-center border-[#cfaaff]">
            <span className="rounded-full bg-blue w-1 h-1"></span>
          </div>

          <span>{task?.task} </span>
        </div>

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
  <>
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
        milestone?.parentTask?.map((task: any) => (
          <div key={task.id} className="w-full">
            <ParentTask
              keyResult={keyResult}
              parent={true}
              tasks={task?.tasks}
              parentTaskName={task?.task}
            />
          </div>
        ))}
  </>
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
          keyResult?.parentTask?.map((task: any) => (
            <Row key={task.id} className="w-full">
              <ParentTask
                keyResult={keyResult}
                parent={true}
                keyResultIndex={keyResultIndex}
                tasks={task?.tasks}
                parentTaskName={task?.task}
              />
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
