'use client';
import React from 'react';
import { Modal, List, Button, Checkbox, message } from 'antd';
import {
  useProbationStore,
  ProbationTask,
} from '@/store/uistate/features/probation';

interface ProbationTemplateProps {
  id: string;
  isVisible: boolean;
  onClose: () => void;
}

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// Mock template tasks - replace with actual API call
const templateTasks: ProbationTask[] = [
  {
    id: 'template-1',
    title: 'Complete company orientation',
    description: 'Attend mandatory company orientation session',
    isCompleted: false,
    dueDate: '2024-02-01',
    approverId: 'hr1',
    weight: 20,
    approver: {
      id: 'hr1',
      firstName: 'Jane',
      lastName: 'HR',
      avatar: '/userIcon.png',
    },
  },
  {
    id: 'template-2',
    title: 'Submit employment documents',
    description: 'Submit all required employment documentation',
    isCompleted: false,
    dueDate: '2024-02-05',
    approverId: 'hr1',
    weight: 15,
    approver: {
      id: 'hr1',
      firstName: 'Jane',
      lastName: 'HR',
      avatar: '/userIcon.png',
    },
  },
  {
    id: 'template-3',
    title: 'Complete safety training',
    description: 'Complete workplace safety training modules',
    isCompleted: false,
    dueDate: '2024-02-10',
    approverId: 'safety1',
    weight: 25,
    approver: {
      id: 'safety1',
      firstName: 'Mike',
      lastName: 'Safety',
      avatar: '/userIcon.png',
    },
  },
  {
    id: 'template-4',
    title: 'Meet with direct supervisor',
    description:
      'Initial meeting with direct supervisor to discuss role expectations',
    isCompleted: false,
    dueDate: '2024-02-15',
    approverId: 'manager1',
    weight: 20,
    approver: {
      id: 'manager1',
      firstName: 'John',
      lastName: 'Manager',
      avatar: '/userIcon.png',
    },
  },
  {
    id: 'template-5',
    title: 'Complete probation review',
    description: 'Final probation review meeting and assessment',
    isCompleted: false,
    dueDate: '2024-03-01',
    approverId: 'manager1',
    weight: 20,
    approver: {
      id: 'manager1',
      firstName: 'John',
      lastName: 'Manager',
      avatar: '/userIcon.png',
    },
  },
];

const ProbationTemplate: React.FC<ProbationTemplateProps> = ({
  id,
  isVisible,
  onClose,
}) => {
  const [selectedTasks, setSelectedTasks] = React.useState<string[]>([]);
  const { addTask } = useProbationStore();

  const handleTaskSelect = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks((prev) => [...prev, taskId]);
    } else {
      setSelectedTasks((prev) => prev.filter((id) => id !== taskId));
    }
  };

  const handleAddSelectedTasks = () => {
    if (selectedTasks.length === 0) {
      message.warning('Please select at least one task');
      return;
    }

    const tasksToAdd = templateTasks.filter((task) =>
      selectedTasks.includes(task.id),
    );

    tasksToAdd.forEach((task) => {
      const newTask: ProbationTask = {
        ...task,
        id: `${task.id}-${Date.now()}`, // Generate unique ID
        createdDate: new Date().toISOString(),
      };
      addTask(newTask);
    });

    message.success(`${tasksToAdd.length} task(s) added successfully`);
    setSelectedTasks([]);
    onClose();
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === templateTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(templateTasks.map((task) => task.id));
    }
  };

  const modalSlug = toSlug(id);

  return (
    <Modal
      title="Add Tasks from Template"
      open={isVisible}
      onCancel={onClose}
      width={
        typeof window !== 'undefined' && window.innerWidth < 640 ? '95%' : 600
      }
      footer={[
        <Button key="cancel" onClick={onClose} data-cy="probation-template-cancel-btn">
          Cancel
        </Button>,
        <Button
          key="add"
          type="primary"
          onClick={handleAddSelectedTasks}
          disabled={selectedTasks.length === 0}
          data-cy="probation-template-add-selected-btn"
        >
          Add Selected Tasks ({selectedTasks.length})
        </Button>,
      ]}
      data-cy={`probation-template-modal-${modalSlug}`}
    >
      <div
        className="mb-4"
        id="probation-template-select-all-wrapper"
        data-cy="probation-template-select-all-wrapper"
      >
        <Button
          onClick={handleSelectAll}
          size="small"
          id="probation-template-select-all-btn"
          data-cy="probation-template-select-all-btn"
        >
          {selectedTasks.length === templateTasks.length
            ? 'Deselect All'
            : 'Select All'}
        </Button>
      </div>

      <List
        dataSource={templateTasks}
        renderItem={(task) => {
          const taskSlug = toSlug(task.id);
          return (
            <List.Item
              id={`probation-template-task-${taskSlug}`}
              data-cy={`probation-template-task-${taskSlug}`}
            >
              <div className="flex items-start w-full">
                <Checkbox
                  checked={selectedTasks.includes(task.id)}
                  onChange={(e) => handleTaskSelect(task.id, e.target.checked)}
                  className="mr-3 mt-1"
                  id={`probation-template-checkbox-${taskSlug}`}
                  data-cy={`probation-template-checkbox-${taskSlug}`}
                />
                <div className="flex-1" id={`probation-template-task-content-${taskSlug}`} data-cy={`probation-template-task-content-${taskSlug}`}>
                  <div className="font-medium" id={`probation-template-task-title-${taskSlug}`} data-cy={`probation-template-task-title-${taskSlug}`}>
                    {task.title}
                  </div>
                  <div className="text-sm text-gray-600 mt-1" id={`probation-template-task-desc-${taskSlug}`} data-cy={`probation-template-task-desc-${taskSlug}`}>
                    {task.description}
                  </div>
                  <div className="text-xs text-gray-500 mt-1" id={`probation-template-task-meta-${taskSlug}`} data-cy={`probation-template-task-meta-${taskSlug}`}>
                    Weight: {task.weight}% | Due: {task.dueDate} | Assigned to:{' '}
                    {task.approverId}
                  </div>
                </div>
              </div>
            </List.Item>
          );
        }}
      />
    </Modal>
  );
};

export default ProbationTemplate;
