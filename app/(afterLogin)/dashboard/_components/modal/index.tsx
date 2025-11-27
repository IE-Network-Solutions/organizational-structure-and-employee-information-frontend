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
      data-cy="job-info-access-modal"
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
      <h5
        id="job-info-access-modal-title"
        data-cy="job-info-access-modal-title"
        className="mb-10"
      >
        To access additional data, please enter your job information.
      </h5>

      <div
        id="job-info-access-modal-buttons"
        data-cy="job-info-access-modal-buttons"
        className="flex justify-center gap-4"
      >
        <Button
          id="job-info-access-modal-cancel-button"
          data-cy="job-info-access-modal-cancel-button"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          id="job-info-access-modal-confirm-button"
          data-cy="job-info-access-modal-confirm-button"
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
