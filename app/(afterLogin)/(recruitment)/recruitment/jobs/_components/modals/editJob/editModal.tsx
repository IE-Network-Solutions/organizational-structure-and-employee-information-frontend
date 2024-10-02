import React from 'react';
import { Modal, Button, Form, Input } from 'antd';

interface EditModalProps {
  visible: boolean;
  onClose: () => void;
  jobTitle: string;
}

const EditJob: React.FC<EditModalProps> = ({ visible, onClose, jobTitle }) => {
  return (
    <Modal
      title="Edit Job"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary">
          Save Changes
        </Button>,
      ]}
    >
      <Form layout="vertical">
        <Form.Item label="Job Title">
          <Input defaultValue={jobTitle} />
        </Form.Item>
        <Form.Item label="Job Description">
          <Input.TextArea rows={4} placeholder="Enter job description" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditJob;
