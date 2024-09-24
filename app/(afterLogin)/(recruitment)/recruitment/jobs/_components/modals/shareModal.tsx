import React, { useState } from 'react';
import { Modal, Input, Space } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ visible, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(
      'https://youtu.be/h9uAqr3N7WA?feature=shared',
    );
    setCopied(true);
  };
  return (
    <Modal
      title="Share to other Media"
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Input
          addonAfter={
            copied ? (
              <CheckOutlined style={{ color: '#52c41a' }} />
            ) : (
              <CopyOutlined onClick={copyLink} />
            )
          }
          defaultValue="https://youtu.be/h9uAqr3N7WA?feature=shared"
          readOnly
        />
      </Space>
    </Modal>
  );
};

export default ShareModal;
