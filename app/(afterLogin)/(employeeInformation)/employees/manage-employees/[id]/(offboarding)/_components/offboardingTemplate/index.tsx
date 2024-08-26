'use client';
import { Modal, Checkbox, Button, Avatar } from 'antd';
import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import { useOffboardingStore } from '@/store/uistate/features/offboarding';
import { AddTaskModal } from '../addTaskModal';
import { FaPlus } from 'react-icons/fa';

const OffboardingTemplate: React.FC = () => {
  const {
    isTaskTemplateVisible,
    setIsTaskTemplateVisible,
    setIsAddTaskModalVisible,
  } = useOffboardingStore();
  const items = [
    'Check Vacation Payout/Accrual',
    'Disable Access to Other Software Systems',
    'Collect Company Assets',
    'Collect Employee ID Badge',
    'Cobra',
    'Retrieve Company Laptop',
  ];
  const handleAddTaskClick = () => {
    setIsAddTaskModalVisible(true);
  };
  return (
    <>
      <Modal
        title="Add Items"
        centered
        open={isTaskTemplateVisible}
        onCancel={() => setIsTaskTemplateVisible(false)}
        footer={null}
        width={400}
      >
        <Button
          className="bg-blue-600 mr-2 my-3 "
          onClick={handleAddTaskClick}
          icon={<FaPlus />}
        >
          Add Task List
        </Button>

        {items.map((item, index) => (
          <Checkbox key={index} className="flex mb-2">
            {item}
          </Checkbox>
        ))}
        <div className="mt-6 pt-4 border-t">
          <Button type="primary" className="bg-blue-600 mr-2">
            Add Selected Items
          </Button>
          <Button>Cancel</Button>
        </div>
        <AddTaskModal />
      </Modal>
    </>
  );
};

export default OffboardingTemplate;
