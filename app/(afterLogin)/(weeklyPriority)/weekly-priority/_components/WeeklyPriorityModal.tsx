import React from 'react';
import { Modal, Button, Checkbox, Spin } from 'antd';
import {
  useUpdateCreateWeeklyPriorityBulk,
  useCreateWeeklyPriorityBulk,
} from '@/store/server/features/okrplanning/weeklyPriority/mutations';
import {
  CheckedItem,
  useWeeklyPriorityStore,
} from '@/store/uistate/features/weeklyPriority/useStore';

interface WeeklyPriorityModalProps {
  open: boolean;
  onCancel: () => void;
  priorities: any[];
  isLoading: boolean;
  departmentId: string;
  userId: string;
  session: string;
  month: string;
  selectedTask: any;
  planningType: string;
  'data-cy'?: string;
}

const WeeklyPriorityModal: React.FC<WeeklyPriorityModalProps> = ({
  open,
  onCancel,
  priorities,
  isLoading,
  departmentId,
  userId,
  session,
  month,
  selectedTask,
  planningType,
  'data-cy': dataCy,
}) => {
  const { checkedList, setCheckedList } = useWeeklyPriorityStore();
  const {
    mutate: createWeeklyPriorityBulkTask,
    isLoading: isLoadingCreateWeeklyPriorityBulkTask,
  } = useCreateWeeklyPriorityBulk();
  const {
    mutate: updateWeeklyPriorityBulkTask,
    isLoading: isLoadingUpdateWeeklyPriorityBulkTask,
  } = useUpdateCreateWeeklyPriorityBulk();

  const isLoadings =
    isLoadingCreateWeeklyPriorityBulkTask ||
    isLoadingUpdateWeeklyPriorityBulkTask;

  // Set initial checked state when selectedTask changes
  React.useEffect(() => {
    if (selectedTask?.tasks?.length > 0) {
      const updatedCheckedList = selectedTask.tasks.map(
        (task: {
          id: string;
          taskId: string;
          title: string;
          planId?: string;
          status: string;
          failureReason: string;
        }) => ({
          id: task.id,
          taskId: task.taskId,
          title: task.title,
          planId: task.planId || '',
          departmentId,
          userId,
          session,
          month,
          createdBy: userId,
          status: task.status,
          failureReason: task.failureReason || '',
        }),
      );
      setCheckedList(updatedCheckedList);
    }
  }, [selectedTask, departmentId, userId, session, month, setCheckedList]);

  const handleCheck = (checked: boolean, item: CheckedItem) => {
    setCheckedList(
      checked
        ? [...checkedList, item]
        : checkedList.filter((i) => i.taskId !== item.taskId),
    );
  };

  const handleAdd = () => {
    const cleanedCheckedList = checkedList.filter((item) => !item.id);
    const uncheckedList =
      selectedTask?.tasks
        ?.filter(
          (task: { taskId: string }) =>
            !checkedList.some((checked) => checked.taskId === task.taskId),
        )
        .map(
          (task: {
            taskId: string;
            title: string;
            planId?: string;
            status: string;
            failureReason: string;
          }) => ({
            taskId: task.taskId,
            title: task.title,
            planId: task.planId || '',
            departmentId,
            userId,
            session,
            month,
            createdBy: userId,
            status: task.status,
            failureReason: task.failureReason || '',
          }),
        ) || [];

    selectedTask == null
      ? createWeeklyPriorityBulkTask(
          { tasks: checkedList },
          {
            onSuccess: () => {
              setCheckedList([]);
              onCancel();
            },
          },
        )
      : updateWeeklyPriorityBulkTask(
          { new: cleanedCheckedList, remove: uncheckedList },
          {
            onSuccess: () => {
              setCheckedList([]);
              onCancel();
            },
          },
        );
  };

  const handleClose = () => {
    setCheckedList([]);
    onCancel();
  };

  return (
    <div data-cy="weekly-priority-modal-wrapper">
      <style data-cy="weekly-priority-modal-styles">{`
        .pixel-perfect-modal .ant-modal-content {
          border-radius: 8px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .pixel-perfect-modal .ant-modal-body {
          padding: 0;
        }
        .pixel-perfect-modal .ant-modal-close {
          top: 20px;
          right: 24px;
          width: 16px;
          height: 16px;
          padding: 0;
        }
        .pixel-perfect-modal .ant-modal-close:hover {
          background: transparent;
        }
        .pixel-perfect-modal .ant-modal-close .ant-modal-close-x {
          display: block;
          width: 16px;
          height: 16px;
          line-height: 16px;
          font-size: 16px;
          color: rgba(0, 0, 0, 0.7);
        }
        .pixel-perfect-modal .ant-checkbox-inner {
            border-radius: 4px;
            width: 18px;
            height: 18px;
            border-color: #d1d5db;
        }
        .pixel-perfect-modal .ant-checkbox-checked .ant-checkbox-inner {
            background-color: #254ec2;
            border-color: #254ec2;
        }
        .priority-item-row {
          transition: all 0.2s ease;
          background-color: #f9fafb;
          border-bottom: 1px solid #f3f4f6;
        }
        .priority-item-row:last-child {
          border-bottom: none;
        }
        .priority-item-row:hover {
          background-color: #f9fafb;
        }
        .priority-item-row.selected {
          background-color: #E6F4FF;
        }
        .priority-item-row.selected:hover {
          background-color: #E6F4FF;
        }
      `}</style>
      <Modal
        data-cy={dataCy}
        open={open}
        onCancel={handleClose}
        width={962}
        style={{ maxWidth: 'calc(100vw - 32px)' }}
        footer={null}
        centered
        className="pixel-perfect-modal"
        title={null}
      >
        <div
          className="w-full flex flex-col"
          data-cy="weekly-priority-modal-sections"
        >
          <div
            className="h-[77px] px-6 pt-5 pb-2 flex flex-col gap-2 text-left"
            data-cy="weekly-priority-modal-header"
          >
            <div
              className="text-[16px] font-bold text-black/70 leading-tight"
              data-cy="weekly-priority-modal-title-text"
            >
              {selectedTask == null ? 'Create Priority' : 'Update Priority'}
            </div>
            <div
              className="text-black/70 text-[14px] font-normal leading-relaxed"
              data-cy="weekly-priority-modal-subtitle"
            >
              Select from your weekly plans to add priority
            </div>
          </div>

          <div className="px-6 py-3" data-cy="weekly-priority-modal-body">
            {isLoading ? (
              <div
                className="py-24 flex justify-center"
                data-cy="weekly-priority-modal-loading"
              >
                <Spin size="large" data-cy="weekly-priority-modal-spin" />
              </div>
            ) : priorities?.length > 0 ? (
              <div
                className="max-h-[460px] overflow-y-auto scrollbar-none border border-gray-100"
                data-cy="weekly-priority-modal-priorities-list"
              >
                {priorities?.map((priority) => {
                  const isChecked = checkedList.some(
                    (i) => i.taskId === priority.id,
                  );
                  return (
                    <div
                      key={priority.id}
                      className={`priority-item-row h-[54px] px-4 md:px-6 flex items-center gap-4 md:gap-5 cursor-pointer ${isChecked ? 'selected' : ''}`}
                      onClick={() =>
                        handleCheck(!isChecked, {
                          taskId: priority.id,
                          title: priority.task,
                          planId: priority.planId || '',
                          departmentId,
                          userId,
                          session,
                          month,
                          createdBy: userId,
                          status: 'PENDING',
                          failureReason: '',
                        })
                      }
                      data-cy={`weekly-priority-modal-priority-item-${priority.id}`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleCheck(e.target.checked, {
                            taskId: priority.id,
                            title: priority.task,
                            planId: priority.planId || '',
                            departmentId,
                            userId,
                            session,
                            month,
                            createdBy: userId,
                            status: 'PENDING',
                            failureReason: '',
                          });
                        }}
                        className="custom-pixel-checkbox flex-shrink-0"
                        data-cy={`weekly-priority-modal-priority-checkbox-${priority.id}`}
                      />
                      <span
                        className="text-[16px] font-normal leading-normal text-black/70 transition-colors"
                        data-cy={`weekly-priority-modal-priority-text-${priority.id}`}
                      >
                        {priority.task}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="py-24 text-center"
                data-cy="weekly-priority-modal-empty"
              >
                <span
                  className="text-[16px] text-gray-400 font-medium"
                  data-cy="weekly-priority-modal-empty-text"
                >
                  Please add {planningType} plan first
                </span>
              </div>
            )}
          </div>

          <div
            className="px-6 pt-0 pb-5 flex justify-end gap-2"
            data-cy="weekly-priority-modal-footer"
          >
            <Button
              onClick={handleClose}
              className="h-[32px] w-[68px] p-0 text-[#4b5563] font-normal border-gray-200 rounded-[6px] hover:text-[#111827] hover:border-gray-400 text-[14px]"
              data-cy="weekly-priority-modal-cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              disabled={checkedList.length === 0}
              onClick={handleAdd}
              loading={isLoadings}
              className="bg-[#1E40AF] hover:bg-[#1b376e] h-[32px] w-[68px] p-0 text-white font-normal rounded-[6px] border-none shadow-sm text-[14px]"
              data-cy="weekly-priority-modal-submit-button"
            >
              {selectedTask == null ? 'Create' : 'Update'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WeeklyPriorityModal;
