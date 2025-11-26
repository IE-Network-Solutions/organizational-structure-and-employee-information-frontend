import { Modal, Button } from 'antd';

const JobInfoAccessModal = ({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={520}
      closable={false}
      bodyStyle={{
        padding: '10px 5px',
        textAlign: 'center',
        borderRadius: 10,
      }}
    >
      <h5 className="mb-10">
        To access additional data, please enter your job information.
      </h5>

      <div className="flex justify-center gap-4">
        <Button onClick={onClose}>Cancel</Button>

        <Button
          type="primary"
          style={{ padding: '0 28px' }}
          onClick={onConfirm}
        >
          Job Detail
        </Button>
      </div>
    </Modal>
  );
};

export default JobInfoAccessModal;
