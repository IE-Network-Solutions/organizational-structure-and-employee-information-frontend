import React from 'react';
import { Tree, Tag, Typography, Popover } from 'antd';
import { MdKey } from 'react-icons/md';
import { FaStar } from 'react-icons/fa';
import { useIsMobile } from '@/hooks/useIsMobile';
const { Text } = Typography;

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

const ParentTaskTree = ({ tasks = [], parentTaskName, keyResult }: any) => {
  const { isMobile, isTablet } = useIsMobile();

  const generateTreeData = (tasks: any[]): any[] => {
    return tasks.map((task, index) => ({
      title: (
        <div
          className="w-full min-w-0"
          data-cy="parent-task-tree-item-container"
        >
          {/* Mobile Layout */}
          <div
            className="block sm:hidden max-w-[250px] sm:max-w-full mt-2"
            data-cy="parent-task-tree-item-mobile-layout"
          >
            {/* Task Title and Icon */}
            <div
              className="flex items-center gap-1 mb-1 w-full min-w-0"
              data-cy="parent-task-tree-item-title-container"
            >
              <span
                className="text-xs flex-1 min-w-0  text-gray-700 text-nowrap"
                data-cy="parent-task-tree-item-title-text"
              >
                {(() => {
                  const isTruncated =
                    isMobile || isTablet
                      ? task?.task?.length > 40
                      : task?.task?.length > 100;
                  const displayText =
                    isMobile || isTablet
                      ? task?.task?.length > 40
                        ? task.task.slice(0, 40) + '...'
                        : task?.task
                      : task?.task?.length > 100
                        ? task.task.slice(0, 100) + '...'
                        : task?.task;
                  return isTruncated ? (
                    <Popover
                      content={task?.task}
                      placement="topLeft"
                      data-cy={`parent-task-tree-item-popover-${index}`}
                    >
                      <span
                        data-cy={`parent-task-tree-item-popover-text-${index}`}
                      >
                        {displayText}
                      </span>
                    </Popover>
                  ) : (
                    <span data-cy={`parent-task-tree-item-text-${index}`}>
                      {displayText}
                    </span>
                  );
                })()}
              </span>
              {task?.achieveMK ? (
                <div
                  className="flex-shrink-0"
                  data-cy="parent-task-tree-item-icon-container"
                >
                  {keyResult?.metricType?.name === 'Milestone' ? (
                    <FaStar
                      size={10}
                      className="text-yellow-500"
                      data-cy={`parent-task-tree-item-icon-milestone-${index}`}
                    />
                  ) : (
                    <MdKey
                      size={10}
                      className="text-gray-500"
                      data-cy={`parent-task-tree-item-icon-key-${index}`}
                    />
                  )}
                </div>
              ) : (
                <span
                  data-cy={`parent-task-tree-item-icon-empty-${index}`}
                ></span>
              )}
            </div>

            {/* Details */}
            <div
              className="flex justify-between gap-2 w-60 py-1"
              data-cy="parent-task-tree-item-mobile-details"
            >
              <Tag
                className="font-semibold border-none text-center capitalize px-1.5 py-0 h-4 text-xs"
                color={getPriorityColor(task?.priority)}
                data-cy={`parent-task-tree-item-mobile-priority-tag-${index}`}
              >
                <span
                  data-cy={`parent-task-tree-item-mobile-priority-tag-text-${index}`}
                >
                  {task?.priority || 'None'}
                </span>
              </Tag>

              <div
                className="flex gap-2"
                data-cy="parent-task-tree-item-mobile-weight-container"
              >
                <span
                  className="text-xs text-gray-500"
                  data-cy="parent-task-tree-item-mobile-weight-label"
                >
                  <span
                    className="text-blue mr-1"
                    data-cy="parent-task-tree-item-mobile-weight-bullet"
                  >
                    &bull;
                  </span>
                  Weight
                </span>
                <Tag
                  className="font-semibold border-none text-blue px-1.5 py-0 h-4 text-xs"
                  color="#e7e7ff"
                  data-cy={`parent-task-tree-item-mobile-weight-tag-${index}`}
                >
                  <span
                    data-cy={`parent-task-tree-item-mobile-weight-tag-text-${index}`}
                  >
                    {task?.weight || 0}
                  </span>
                </Tag>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div
            className="sm:flex justify-between gap-3 hidden"
            data-cy="parent-task-tree-item-desktop-layout"
          >
            {/* Task Title and Icon */}
            <div
              className="flex items-center gap-2 flex-1 min-w-0"
              data-cy="parent-task-tree-item-desktop-title-container"
            >
              <span
                className="text-sm truncate"
                data-cy="parent-task-tree-item-desktop-title-text"
              >
                {(() => {
                  const isTruncated =
                    isMobile || isTablet
                      ? task?.task?.length > 40
                      : task?.task?.length > 80;
                  return isTruncated ? (
                    <Popover
                      content={task?.task}
                      placement="topLeft"
                      data-cy={`parent-task-tree-item-desktop-popover-${index}`}
                    >
                      <span
                        data-cy={`parent-task-tree-item-desktop-popover-text-${index}`}
                      >
                        {isMobile || isTablet
                          ? task?.task?.length > 40
                            ? task.task.slice(0, 40) + '...'
                            : task?.task
                          : task?.task?.length > 80
                            ? task.task.slice(0, 80) + '...'
                            : task?.task}
                      </span>
                    </Popover>
                  ) : (
                    <span
                      data-cy={`parent-task-tree-item-desktop-text-${index}`}
                    >
                      {task?.task}
                    </span>
                  );
                })()}
              </span>
              {task?.achieveMK ? (
                keyResult?.metricType?.name === 'Milestone' ? (
                  <FaStar
                    size={14}
                    className="text-yellow-500 flex-shrink-0"
                    data-cy={`parent-task-tree-item-desktop-icon-milestone-${index}`}
                  />
                ) : (
                  <MdKey
                    size={14}
                    className="text-gray-500 flex-shrink-0"
                    data-cy={`parent-task-tree-item-desktop-icon-key-${index}`}
                  />
                )
              ) : (
                <span
                  data-cy={`parent-task-tree-item-desktop-icon-empty-${index}`}
                ></span>
              )}
            </div>

            {/* Details */}
            <div
              className="flex items-center gap-3 flex-shrink-0"
              data-cy="parent-task-tree-item-desktop-details"
            >
              <Tag
                className="font-semibold border-none text-center capitalize px-3 py-1 h-6 text-sm"
                color={getPriorityColor(task?.priority)}
                data-cy={`parent-task-tree-item-desktop-priority-tag-${index}`}
              >
                <span
                  data-cy={`parent-task-tree-item-desktop-priority-tag-text-${index}`}
                >
                  {task?.priority || 'None'}
                </span>
              </Tag>

              <div
                className="flex items-center gap-1"
                data-cy="parent-task-tree-item-desktop-weight-container"
              >
                <Text
                  type="secondary"
                  className="text-sm"
                  data-cy="parent-task-tree-item-desktop-weight-label"
                >
                  <span
                    className="text-blue mr-1"
                    data-cy="parent-task-tree-item-desktop-weight-bullet"
                  >
                    &bull;
                  </span>
                  Weight
                </Text>
                <Tag
                  className="font-semibold border-none text-blue px-3 py-1 h-6 text-sm"
                  color="#B2B2FF"
                  data-cy={`parent-task-tree-item-desktop-weight-tag-${index}`}
                >
                  <span
                    data-cy={`parent-task-tree-item-desktop-weight-tag-text-${index}`}
                  >
                    {task?.weight || 0}
                  </span>
                </Tag>
              </div>

              {keyResult?.metricType?.name !== 'Milestone' &&
              keyResult?.metricType?.name !== 'Achieve' ? (
                <div
                  className="flex items-center gap-1"
                  data-cy="parent-task-tree-item-desktop-target-container"
                >
                  <Text
                    type="secondary"
                    className="text-sm"
                    data-cy="parent-task-tree-item-desktop-target-label"
                  >
                    <span
                      className="text-blue mr-1"
                      data-cy="parent-task-tree-item-desktop-target-bullet"
                    >
                      &bull;
                    </span>
                    Target
                  </Text>
                  <Tag
                    className="font-semibold border-none text-blue px-3 py-1 h-6 text-sm"
                    color="#B2B2FF"
                    data-cy={`parent-task-tree-item-desktop-target-tag-${index}`}
                  >
                    <span
                      data-cy={`parent-task-tree-item-desktop-target-tag-text-${index}`}
                    >
                      {Number(task?.targetValue)?.toLocaleString() || 'N/A'}
                    </span>
                  </Tag>
                </div>
              ) : (
                <span
                  data-cy={`parent-task-tree-item-desktop-target-empty-${index}`}
                ></span>
              )}
            </div>
          </div>
        </div>
      ),
      key: `${parentTaskName}-${index}`,
      children: task.subtasks ? generateTreeData(task.subtasks) : [],
      icon: task?.achieveMK ? (
        keyResult?.metricType?.name === 'Milestone' ? (
          <FaStar
            size={14}
            className="text-yellow-500"
            data-cy={`parent-task-tree-icon-milestone-${index}`}
          />
        ) : (
          <MdKey
            size={14}
            className="text-gray-500"
            data-cy={`parent-task-tree-icon-key-${index}`}
          />
        )
      ) : (
        <span data-cy={`parent-task-tree-icon-empty-${index}`}></span>
      ),
    }));
  };

  const treeData = [
    {
      title: (
        <div
          className="flex items-center gap-1 w-full text-sm font-medium text-gray-800 max-w-[200px]"
          data-cy="parent-task-tree-title-container"
        >
          <div
            className="border-2 rounded-full w-2.5 h-2.5 flex items-center justify-center border-[#B2B2FF] shrink-0"
            data-cy="parent-task-tree-title-icon"
          >
            <span
              className="rounded-full bg-blue w-0.5 h-0.5"
              data-cy="parent-task-tree-title-icon-dot"
            ></span>
          </div>
          <div
            className="text-xs md:text-sm text-nowrap text-bold"
            data-cy="parent-task-tree-title-text"
          >
            {(() => {
              const isTruncated =
                isMobile || isTablet
                  ? parentTaskName?.length > 40
                  : parentTaskName?.length > 100;
              const displayText =
                isMobile || isTablet
                  ? parentTaskName?.length > 40
                    ? parentTaskName.slice(0, 40) + '...'
                    : parentTaskName
                  : parentTaskName?.length > 100
                    ? parentTaskName.slice(0, 100) + '...'
                    : parentTaskName;
              return isTruncated ? (
                <Popover
                  content={parentTaskName}
                  placement="topLeft"
                  data-cy="parent-task-tree-title-popover"
                >
                  <span data-cy="parent-task-tree-title-popover-text">
                    {displayText}
                  </span>
                </Popover>
              ) : (
                <span data-cy="parent-task-tree-title-text-content">
                  {displayText}
                </span>
              );
            })()}
          </div>
        </div>
      ),
      key: parentTaskName,
      children: generateTreeData(tasks),
    },
  ];

  return (
    <div className="w-full max-w-[850px]" data-cy="parent-task-tree-container">
      <Tree
        treeData={treeData}
        showIcon
        showLine={{ showLeafIcon: false }}
        switcherIcon={null}
        defaultExpandAll
        className={isMobile ? 'mobile-switcher' : 'desktop-switcher'}
        data-cy="parent-task-tree"
      />
    </div>
  );
};

export default ParentTaskTree;
