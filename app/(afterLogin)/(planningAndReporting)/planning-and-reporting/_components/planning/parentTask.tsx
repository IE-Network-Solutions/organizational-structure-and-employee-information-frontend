import React from 'react';
import { Tree, Tag, Typography } from 'antd';
import { MdKey } from 'react-icons/md';
import { FaStar } from 'react-icons/fa';

const { Text } = Typography;

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

const ParentTaskTree = ({ tasks = [], parentTaskName, keyResult }: any) => {
  const generateTreeData = (tasks: any[]): any[] => {
    return tasks.map((task, index) => ({
      title: (
        <div className="grid justify-between items-center gap-2 grid-cols-12 w-[calc(90vw-50%)]">
          {/* Task Title & Icon */}
          <div className="col-span-7">
            <span className="text-xs">{task?.task}</span>
            {task?.achieveMK &&
              (keyResult?.metricType?.name === 'Milestone' ? (
                <FaStar size={12} className="text-yellow-500" />
              ) : (
                <MdKey size={12} className="text-gray-500" />
              ))}
          </div>

          {/* Task Details (Priority, Weight, Target) */}
          <div className="col-span-5">
            <Tag
              className="font-bold border-none w-16 text-center capitalize text-[10px]"
              color={getPriorityColor(task?.priority)}
            >
              {task?.priority || 'None'}
            </Tag>

            <Text type="secondary" className="text-[10px] mr-2">
              <span className="text-xs text-blue">&bull;</span> Weight:
            </Text>
            <Tag
              className="font-bold border-none w-16 text-center text-blue text-[10px]"
              color="#B2B2FF"
            >
              {task?.weight || 0}
            </Tag>

            {/* Show Target if applicable */}
            {keyResult?.metricType?.name !== 'Milestone' &&
              keyResult?.metricType?.name !== 'Achieve' && (
                <>
                  <Text type="secondary" className="text-[10px]">
                    <span className="text-xs text-blue">&bull;</span> Target:
                  </Text>
                  <Tag
                    className="font-bold border-none w-16 text-center text-blue text-[10px]"
                    color="#B2B2FF"
                  >
                    {Number(task?.targetValue)?.toLocaleString() || 'N/A'}
                  </Tag>
                </>
              )}
          </div>
        </div>
      ),
      key: `${parentTaskName}-${index}`,
      children: task.subtasks ? generateTreeData(task.subtasks) : [],
      icon: task?.achieveMK ? (
        keyResult?.metricType?.name === 'Milestone' ? (
          <FaStar size={14} className="text-yellow-500" />
        ) : (
          <MdKey size={14} className="text-gray-500" />
        )
      ) : null, // Child node icon
    }));
  };

  const treeData = [
    {
      title: (
        <div className="flex items-center gap-2">
          <div className="border-2 rounded-full w-3 h-3 flex items-center justify-center border-[#cfaaff]">
            <span className="rounded-full bg-blue w-1 h-1"></span>
          </div>
          <Text strong>{parentTaskName}</Text>
        </div>
      ),
      key: parentTaskName,
      children: generateTreeData(tasks),
    },
  ];

  return (
    <Tree
      treeData={treeData}
      showIcon
      showLine={{ showLeafIcon: false }}
      switcherIcon={null}
      defaultExpandAll
    />
  );
};

export default ParentTaskTree;
