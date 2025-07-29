import React, { useRef, useState, useEffect } from 'react';
import { Row, Col, Typography, Tag, Tooltip } from 'antd';
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
      return 'yellow';
    default:
      return 'green';
  }
};

// TruncateWithTooltip: Dynamically truncates text based on width and shows tooltip if truncated
const TruncateWithTooltip: React.FC<{
  text: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ text, className = '', style = {} }) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const checkTruncation = () => {
      const el = textRef.current;
      if (el) {
        setIsTruncated(el.scrollWidth > el.clientWidth);
      }
    };
    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [text, className, style]);

  const span = (
    <span
      ref={textRef}
      className={`truncate ${className}`}
      style={{ maxWidth: '100%', display: 'inline-block', ...style }}
    >
      {text}
    </span>
  );

  return isTruncated ? (
    <Tooltip title={text} placement="top">
      {span}
    </Tooltip>
  ) : (
    span
  );
};

// Reusable Task Row Component
const TaskRow = ({ task, keyResult }: any) => (
  <Row align="middle" justify="space-between" className={`w-full sm:px-10 `}>
    <Col>
      <Text className="text-xs flex items-center gap-1 px-4">
        <div className="flex items-center gap-1 max-w-full">
          <div className="border-2 rounded-full w-3 h-3 flex items-center justify-center border-[#B2B2FF]">
            <span className="rounded-full bg-blue w-1 h-1"></span>
          </div>
          <TruncateWithTooltip text={task?.task} />
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
    {/* Desktop View */}
    <Col className="items-center gap-2 px-6 hidden sm:flex" xs={24} sm={12}>
      {/* Priority Section */}
      <Text type="secondary" className="text-[10px] px-4">
        <span className="text-xl text-blue">&bull;</span> Priority
      </Text>
      <Tag
        className="font-bold border-none w-16 text-center capitalize text-[10px]"
        color={getPriorityColor(task?.priority)}
      >
        {task?.priority || 'None'}
      </Tag>

      {/* Weight Section */}
      <Text type="secondary" className="text-[10px]">
        <span className="text-xl text-blue">&bull;</span> Weight:
      </Text>
      <Tag
        className="font-bold border-none w-16 text-center text-blue text-[10px] ml-2"
        color="#B2B2FF"
      >
        {task?.weight || 0}
      </Tag>

      {/* Target Section */}
      {keyResult?.metricType?.name !== 'Milestone' &&
        keyResult?.metricType?.name !== 'Achieve' && (
          <>
            <Text type="secondary" className="text-[10px">
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
    {/* Mobile View */}
    <Col className="flex gap-2 px-6 sm:hidden" xs={24} sm={12}>
      {/* Priority Section */}
      <div className="flex justify-between gap-2 w-[100%] sm:w-full py-2">
        <Tag
          className="font-bold border-none w-16 text-center capitalize text-[10px]"
          color={getPriorityColor(task?.priority)}
        >
          {task?.priority || 'None'}
        </Tag>

        {/* Weight Section */}
        <div className="flex gap-2">
          <span className="text-xs text-gray-500">
            <span className="text-blue mr-1">&bull;</span>Weight
          </span>
          <Tag
            className="font-semibold border-none text-blue px-1.5 py-0 h-4 text-xs"
            color="#e7e7ff"
          >
            {task?.weight || 0}
          </Tag>
        </div>

        {/* Target Section */}
        {/* {keyResult?.metricType?.name !== 'Milestone' &&
        keyResult?.metricType?.name !== 'Achieve' && (
          <>
            <Text type="secondary" className="text-[10px] hidden sm:block">
              <span className="text-xl text-blue">&bull;</span> Target:
            </Text>
            <Tag
              className="font-bold border-none w-16 text-center text-blue text-[10px]"
              color="#B2B2FF"
            >
              {Number(task?.targetValue)?.toLocaleString() || 'N/A'}
            </Tag>
          </>
        )} */}
      </div>
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
