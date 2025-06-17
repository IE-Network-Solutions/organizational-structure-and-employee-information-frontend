import React, { useState } from 'react';
import { Modal, Button, Checkbox, Typography, Spin } from 'antd';
import {
  useUpdateCreateWeeklyPriorityBulk,
  useCreateWeeklyPriorityBulk,
} from '@/store/server/features/okrplanning/weeklyPriority/mutations';

const { Title } = Typography;

type CheckedItem = {
  taskId: string;
  title: string;
  planId: string;
  departmentId: string;
  userId: string;
  session: string;
  month: string;
  createdBy: string;
  status: string;
  failureReason: string;
  id?: string;
};

interface WeeklyPriorityModalProps {
  open: boolean;
  onCancel: () => void;
  onAdd: (selected: number[]) => void;
  priorities: { id: string; task: string; planId: string }[];
  isLoading: boolean;
  departmentId: string;
  userId: string;
  session: string;
  month: string;
  selectedTask?: any;
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
}) => {
  const [checkedList, setCheckedList] = useState<CheckedItem[]>([]);
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
  }, [selectedTask, departmentId, userId, session, month]);

  const handleCheck = (
    checked: boolean,
    item: {
      taskId: string;
      title: string;
      planId: string;
      departmentId: string;
      userId: string;
      session: string;
      month: string;
      createdBy: string;
      status: string;
      failureReason: string;
    },
  ) => {
    setCheckedList((prev) =>
      checked ? [...prev, item] : prev.filter((i) => i.taskId !== item.taskId),
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
    <Modal
      open={open}
      onCancel={handleClose}
      footer={
        <div className="flex justify-center gap-4">
          <Button loading={isLoadings} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="primary"
            disabled={checkedList.length === 0}
            onClick={handleAdd}
            loading={isLoadings}
          >
            {selectedTask == null ? 'Add priority' : 'Update priority'}
          </Button>
        </div>
      }
      centered
      bodyStyle={{ maxHeight: 400, overflowY: 'auto' }}
      className="scrollbar-none"
      title={
        <Title level={4} style={{ margin: 0, textAlign: 'center' }}>
          {' '}
          {selectedTask == null
            ? 'Add Weekly priority'
            : 'Update Weekly priority'}
        </Title>
      }
    >
      {isLoading ? (
        <Spin />
      ) : (
        <div style={{ marginBottom: 24 }}>
          {priorities?.map((priority) => (
            <div key={priority.id} style={{ marginBottom: 16 }}>
              <Checkbox
                checked={checkedList.some((i) => i.taskId === priority.id)}
                onChange={(e) =>
                  handleCheck(e.target.checked, {
                    taskId: priority.id,
                    title: priority.task,
                    planId: priority.planId,
                    departmentId,
                    userId,
                    session,
                    month,
                    createdBy: userId,
                    status: 'PENDING',
                    failureReason: '',
                  })
                }
              >
                {priority.task}
              </Checkbox>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default WeeklyPriorityModal;
