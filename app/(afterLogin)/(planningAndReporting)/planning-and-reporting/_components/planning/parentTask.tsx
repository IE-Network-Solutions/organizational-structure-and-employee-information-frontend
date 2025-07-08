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
        <div className="grid grid-cols-12 w-full pr-2">
          {/* Task Title and Icon */}
          <div className="col-span-6 ">
            <span className="text-xs">{task?.task}</span>
            {task?.achieveMK &&
              (keyResult?.metricType?.name === 'Milestone' ? (
                <FaStar size={12} className="text-yellow-500" />
              ) : (
                <MdKey size={12} className="text-gray-500" />
              ))}
          </div>

          {/* Details */}
          <div className="col-span-6 flex gap-1 text-[10px] ml-auto justify-end flex-wrap items-center">
            <Tag
              className="font-semibold border-none text-center capitalize px-2 py-0 h-5"
              color={getPriorityColor(task?.priority)}
            >
              {task?.priority || 'None'}
            </Tag>

            <Text type="secondary">
              <span className="text-blue mr-1">&bull;</span>Weight:
            </Text>
            <Tag
              className="font-semibold border-none text-blue px-2 py-0 h-5"
              color="#B2B2FF"
            >
              {task?.weight || 0}
            </Tag>

            {keyResult?.metricType?.name !== 'Milestone' &&
              keyResult?.metricType?.name !== 'Achieve' && (
                <>
                  <Text type="secondary">
                    <span className="text-blue mr-1">&bull;</span>Target:
                  </Text>
                  <Tag
                    className="font-semibold border-none text-blue px-2 py-0 h-5"
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
      ) : null,
    }));
  };

  const treeData = [
    {
      title: (
        <div className="flex items-center gap-2 w-full">
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
    <div className="w-full max-w-[850px]">
      <Tree
        treeData={treeData}
        showIcon
        showLine={{ showLeafIcon: false }}
        switcherIcon={null}
        defaultExpandAll
      />
    </div>
  );
};

export default ParentTaskTree;
