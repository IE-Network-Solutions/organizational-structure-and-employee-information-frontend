import React from 'react';
import { Tree, Tag, Typography } from 'antd';
import { MdKey } from 'react-icons/md';
import { FaStar } from 'react-icons/fa';
import { useIsMobile } from '@/hooks/useIsMobile';
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
const {isMobile} = useIsMobile();
  
  const generateTreeData = (tasks: any[]): any[] => {
    return tasks.map((task, index) => ({
      title: (
        <div className="w-full min-w-0">
          {/* Mobile Layout */}
          <div className="block md:hidden max-w-[250px] sm:max-w-full">
            {/* Task Title and Icon */}
            <div className="flex items-center gap-2 mb-2 w-full min-w-0">
              <span className="text-xs flex-1 min-w-0 truncate">
                {task?.task}
              </span>
              {task?.achieveMK && (
                <div className="flex-shrink-0">
                  {keyResult?.metricType?.name === 'Milestone' ? (
                    <FaStar size={12} className="text-yellow-500" />
                  ) : (
                    <MdKey size={12} className="text-gray-500" />
                  )}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex justify-between flex-wrap gap-2 items-center w-full">
              <Tag
                className="font-semibold border-none text-center capitalize px-2 py-0 h-5 text-xs"
                color={getPriorityColor(task?.priority)}
              >
                {task?.priority || 'None'}
              </Tag>

              <div className="flex items-center gap-1">
                <Text type="secondary" className="text-xs">
                  <span className="text-blue mr-1">&bull;</span>Weight
                </Text>
                <Tag
                  className="font-semibold border-none text-blue px-2 py-0 h-5 text-xs"
                  color="#B2B2FF"
                >
                  {task?.weight || 0}
                </Tag>
              </div>

              {keyResult?.metricType?.name !== 'Milestone' &&
                keyResult?.metricType?.name !== 'Achieve' && (
                  <div className="flex items-center gap-1">
                    <Text type="secondary" className="text-xs">
                      <span className="text-blue mr-1">&bull;</span>Target
                    </Text>
                    <Tag
                      className="font-semibold border-none text-blue px-2 py-0 h-5 text-xs"
                      color="#B2B2FF"
                    >
                      {Number(task?.targetValue)?.toLocaleString() || 'N/A'}
                    </Tag>
                  </div>
                )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex md:items-center md:justify-between w-full">
            {/* Task Title and Icon */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm truncate">{task?.task}</span>
              {task?.achieveMK &&
                (keyResult?.metricType?.name === 'Milestone' ? (
                  <FaStar size={14} className="text-yellow-500 flex-shrink-0" />
                ) : (
                  <MdKey size={14} className="text-gray-500 flex-shrink-0" />
                ))}
            </div>

            {/* Details */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Tag
                className="font-semibold border-none text-center capitalize px-3 py-1 h-6 text-sm"
                color={getPriorityColor(task?.priority)}
              >
                {task?.priority || 'None'}
              </Tag>

              <div className="flex items-center gap-1">
                <Text type="secondary" className="text-sm">
                  <span className="text-blue mr-1">&bull;</span>Weight
                </Text>
                <Tag
                  className="font-semibold border-none text-blue px-3 py-1 h-6 text-sm"
                  color="#B2B2FF"
                >
                  {task?.weight || 0}
                </Tag>
              </div>

              {keyResult?.metricType?.name !== 'Milestone' &&
                keyResult?.metricType?.name !== 'Achieve' && (
                  <div className="flex items-center gap-1">
                    <Text type="secondary" className="text-sm">
                      <span className="text-blue mr-1">&bull;</span>Target
                    </Text>
                    <Tag
                      className="font-semibold border-none text-blue px-3 py-1 h-6 text-sm"
                      color="#B2B2FF"
                    >
                      {Number(task?.targetValue)?.toLocaleString() || 'N/A'}
                    </Tag>
                  </div>
                )}
            </div>
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
        <div className="flex items-center gap-2 w-full text-sm font-medium text-gray-800 max-w-[200px]">
          <div className="border-2 rounded-full w-3 h-3 flex items-center justify-center border-[#B2B2FF] shrink-0">
            <span className="rounded-full bg-blue w-1 h-1"></span>
          </div>
          <Text className="text-xs md:text-sm truncate" strong>
            {parentTaskName}
          </Text>
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
        className={isMobile ? 'mobile-switcher' : 'desktop-switcher'}
      />
    </div>
  );
};

export default ParentTaskTree;
