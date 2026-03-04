import React from 'react';
import { Modal, Button, Checkbox, Spin, Empty } from 'antd';
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
          border-radius: 16px;
          padding: 24px 16px 16px 16px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        @media (min-width: 768px) {
          .pixel-perfect-modal .ant-modal-content {
            padding: 32px 24px 24px 24px;
          }
        }
        .pixel-perfect-modal .ant-modal-header {
          margin-bottom: 20px;
          border-bottom: none;
        }
        .pixel-perfect-modal .ant-modal-close {
          top: 16px;
          right: 16px;
        }
        @media (min-width: 768px) {
          .pixel-perfect-modal .ant-modal-close {
            top: 24px;
            right: 24px;
          }
        }
        .pixel-perfect-modal .ant-modal-title {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
        }
        @media (min-width: 768px) {
          .pixel-perfect-modal .ant-modal-title {
            font-size: 20px;
          }
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
          border-bottom: 1px solid #f3f4f6;
        }
        .priority-item-row:last-child {
          border-bottom: none;
        }
        .priority-item-row:hover {
          background-color: #f9fafb;
        }
        .priority-item-row.selected {
          background-color: #eff6ff;
        }
        .priority-item-row.selected:hover {
          background-color: #e0f2fe;
        }
      `}</style>
      <Modal
        data-cy={dataCy}
        open={open}
        onCancel={handleClose}
        width={780}
        style={{ maxWidth: 'calc(100vw - 32px)' }}
        footer={
          <div
            className="flex justify-end gap-2 md:gap-3 pt-4 md:pt-6 px-0 md:px-2"
            data-cy="weekly-priority-modal-footer"
          >
            <Button
              onClick={handleClose}
              className="h-[40px] md:h-[44px] px-4 md:px-8 text-[#374151] font-semibold border-gray-200 rounded-[10px] hover:text-[#111827] hover:border-gray-400 text-sm md:text-base"
              data-cy="weekly-priority-modal-cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              disabled={checkedList.length === 0}
              onClick={handleAdd}
              loading={isLoadings}
              className="bg-[#254ec2] hover:bg-[#1e40af] h-[40px] md:h-[44px] px-6 md:px-10 text-white font-semibold rounded-[10px] border-none shadow-sm text-sm md:text-base"
              data-cy="weekly-priority-modal-submit-button"
            >
              {selectedTask == null ? 'Create' : 'Update'}
            </Button>
          </div>
        }
        centered
        className="pixel-perfect-modal"
        title={
          <div className="text-left" data-cy="weekly-priority-modal-title">
            <div
              className="text-[18px] md:text-[20px] font-bold text-[#111827] leading-tight"
              data-cy="weekly-priority-modal-title-text"
            >
              {selectedTask == null ? 'Create Priority' : 'Update Priority'}
            </div>
            <div
              className="text-[#6b7280] text-[13.5px] md:text-[14.5px] font-normal mt-1 md:mt-1.5 leading-relaxed"
              data-cy="weekly-priority-modal-subtitle"
            >
              Select from your weekly plans to add priority
            </div>
          </div>
        }
      >
        <div
          className="mt-4 border-t border-gray-100 -mx-4 md:-mx-6"
          data-cy="weekly-priority-modal-body"
        >
          {isLoading ? (
            <div
              className="py-24 flex justify-center"
              data-cy="weekly-priority-modal-loading"
            >
              <Spin size="large" data-cy="weekly-priority-modal-spin" />
            </div>
          ) : priorities?.length > 0 ? (
            <div
              className="max-h-[460px] overflow-y-auto scrollbar-none"
              data-cy="weekly-priority-modal-priorities-list"
            >
              {priorities?.map((priority) => {
                const isChecked = checkedList.some(
                  (i) => i.taskId === priority.id,
                );
                return (
                  <div
                    key={priority.id}
                    className={`priority-item-row py-3.5 md:py-4.5 px-4 md:px-6 flex items-center gap-4 md:gap-5 cursor-pointer ${isChecked ? 'selected' : ''}`}
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
                      className={`text-[15.5px] font-medium leading-normal transition-colors ${isChecked ? 'text-[#111827]' : 'text-[#374151]'}`}
                      data-cy={`weekly-priority-modal-priority-text-${priority.id}`}
                    >
                      {priority.task}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-24" data-cy="weekly-priority-modal-empty">
              <Empty
                description={
                  <span
                    className="text-gray-400 font-medium"
                    data-cy="weekly-priority-modal-empty-text"
                  >
                    Please add {planningType} plan first
                  </span>
                }
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default WeeklyPriorityModal;
