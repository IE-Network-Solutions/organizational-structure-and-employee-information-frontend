import React from 'react';
import { Collapse, Button, Form, Row, Col, Typography, Tooltip } from 'antd';
import { BiPlus } from 'react-icons/bi';
import { MdKey } from 'react-icons/md';
import { FaStar } from 'react-icons/fa';
import { NAME } from '@/types/enumTypes';
import { groupTasksByKeyResultAndMilestone } from '../dataTransformer/report';

const { Text } = Typography;

interface FailedTasksProps {
  failedPlan: any;
  form: any;
  handleAddBoard: (kId: string) => void;
  handleAddName: (currentBoardValues: Record<string, string>, kId: string) => void;
  handleRemoveBoard: (index: number, kId: string) => void;
  weights: Record<string, number>;
  setWeight: (key: string, value: number) => void;
}

const FailedTasks: React.FC<FailedTasksProps> = ({
  failedPlan,
  form,
  handleAddBoard,
  handleAddName,
  handleRemoveBoard,
  weights,
  setWeight,
}) => {
  const formattedData = failedPlan ? groupTasksByKeyResultAndMilestone(failedPlan) : [];

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-4">Failed Tasks from Previous Plan</h3>
      <Collapse defaultActiveKey={0}>
        {formattedData.map((objective: any, resultIndex: number) => (
          <Collapse.Panel
            key={resultIndex}
            header={
              <div>
                <strong>Objective:</strong> {objective.title}
              </div>
            }
          >
            {objective.keyResults?.map((keyResult: any, index: number) => (
              <div key={keyResult.id} className="ml-4 mt-2">
                <div className="flex items-center">
                  <span className="font-bold">Key Result:</span>
                  <span className="text-sm font-normal ml-2">
                    {keyResult.title}
                  </span>
                </div>

                {keyResult.milestones?.map((milestone: any, milestoneIndex: number) => (
                  <div key={milestone.id} className="ml-4 mt-2">
                    <div className="flex items-center">
                      <span className="font-bold">Milestone:</span>
                      <span className="text-xs ml-2">{milestone.title}</span>
                    </div>
                    {milestone.tasks?.map((task: any, taskIndex: number) => (
                      <div key={task.taskId} className="ml-4">
                        <div className="flex items-center mb-2 justify-between">
                          <div className="flex items-center gap-1">
                            <span className="rounded-lg border-gray-200 border bg-gray-300 w-6 h-6 text-[12px] flex items-center justify-center">
                              {taskIndex + 1}.
                            </span>
                            <span className="text-[12px] font-normal">
                              {task.taskName}
                            </span>
                            {task.achieveMK ? (
                              keyResult.metricType?.name === NAME.MILESTONE ? (
                                <FaStar size={11} />
                              ) : (
                                <MdKey size={12} />
                              )
                            ) : null}
                          </div>
                          <div className="flex items-center">
                            <Button
                              onClick={() => {
                                handleAddBoard(`${keyResult.id}${milestone.id}${task.taskId}`);
                              }}
                              type="link"
                              icon={<BiPlus size={14} />}
                              className="text-[10px]"
                            >
                              Add as Plan Task
                            </Button>
                            <div className="rounded-lg border-gray-100 border bg-gray-300 w-14 h-7 text-xs flex items-center justify-center">
                              {weights[`names-${keyResult.id}${milestone.id}${task.taskId}`] || 0}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {keyResult.tasks?.map((task: any, taskIndex: number) => (
                  <div key={task.taskId} className="ml-4 mt-2">
                    <div className="flex items-center mb-2 justify-between">
                      <div className="flex items-center gap-1">
                        <span className="rounded-lg border-gray-200 border bg-gray-300 w-6 h-6 text-[12px] flex items-center justify-center">
                          {taskIndex + 1}.
                        </span>
                        <span className="text-[12px] font-normal">
                          {task.taskName}
                        </span>
                        {task.achieveMK ? (
                          keyResult.metricType?.name === NAME.MILESTONE ? (
                            <FaStar size={11} />
                          ) : (
                            <MdKey size={12} />
                          )
                        ) : null}
                      </div>
                      <div className="flex items-center">
                        <Button
                          onClick={() => {
                            handleAddBoard(`${keyResult.id}${task.taskId}`);
                          }}
                          type="link"
                          icon={<BiPlus size={14} />}
                          className="text-[10px]"
                        >
                          Add as Plan Task
                        </Button>
                        <div className="rounded-lg border-gray-100 border bg-gray-300 w-14 h-7 text-xs flex items-center justify-center">
                          {weights[`names-${keyResult.id}${task.taskId}`] || 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </Collapse.Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default FailedTasks; 