import React from 'react';
import { Modal, Button, Checkbox, Typography, Spin, Empty } from 'antd';
import {
  useUpdateCreateWeeklyPriorityBulk,
  useCreateWeeklyPriorityBulk,
} from '@/store/server/features/okrplanning/weeklyPriority/mutations';
import {
  CheckedItem,
  useWeeklyPriorityStore,
} from '@/store/uistate/features/weeklyPriority/useStore';

const { Title } = Typography;

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
      ) : priorities?.length > 0 ? (
        <div style={{ marginBottom: 24 }}>
          {priorities?.map((priority) => (
            <div key={priority.id} style={{ marginBottom: 16 }}>
              <Checkbox
                checked={checkedList.some((i) => i.taskId === priority.id)}
                onChange={(e) =>
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
                  })
                }
              >
                {priority.task}
              </Checkbox>
            </div>
          ))}
        </div>
      ) : (
        <Empty description={`Please add ${planningType} plan first`} />
      )}
    </Modal>
  );
};

export default WeeklyPriorityModal;
