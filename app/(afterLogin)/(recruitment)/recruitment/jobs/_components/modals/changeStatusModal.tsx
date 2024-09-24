import React from 'react';
import { Modal, Button, Select } from 'antd';

interface ChangeStatusModalProps {
  visible: boolean;
  onClose: () => void;
}

const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      title="Change Job Status"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary">
          Change Status
        </Button>,
      ]}
    >
      <Select placeholder="Select new status" style={{ width: '100%' }}>
        <Select.Option value="active">Active</Select.Option>
        <Select.Option value="inactive">Inactive</Select.Option>
        <Select.Option value="closed">Closed</Select.Option>
      </Select>
    </Modal>
  );
};

export default ChangeStatusModal;
