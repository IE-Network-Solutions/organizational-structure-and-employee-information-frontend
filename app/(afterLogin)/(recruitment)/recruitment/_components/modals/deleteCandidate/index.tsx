import { useDeleteCandidate } from '@/store/server/features/recruitment/candidate/mutation';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { Modal } from 'antd';
import React from 'react';

const DeleteCandidate: React.FC = () => {
  const {
    deleteCandidateModal,
    setDeleteCandidateModal,
    deleteCandidateName,
    setDeleteTriggerRect,
  } = useCandidateState();
  const { mutate: deleteCandidate } = useDeleteCandidate();

  const handleCandidateDelete = () => {
    deleteCandidate();
    setDeleteCandidateModal(false);
    setDeleteTriggerRect(null);
  };

  return (
    deleteCandidateModal && (
      <div
        id="talent-acquisition-candidate-modal-delete-confirmation"
        data-cy="talent-acquisition-candidate-modal-delete-confirmation"
      >
        <Modal
          open={deleteCandidateModal}
          onCancel={() => setDeleteCandidateModal(false)}
          onOk={handleCandidateDelete}
          title="Delete Candidate"
          okText="Delete"
          okButtonProps={{ danger: true }}
        >
          {
            <span
              className="text-gray-700"
              data-cy="talent-acquisition-delete-candidate-message"
            >
              Are you Sure you want to delete{' '}
              <span
                className="font-semibold"
                data-cy="talent-acquisition-delete-candidate-name"
              >
                {deleteCandidateName || 'this candidate'}
              </span>{' '}
              from candidates ?
            </span>
          }
        </Modal>
      </div>
    )
  );
};

export default DeleteCandidate;
