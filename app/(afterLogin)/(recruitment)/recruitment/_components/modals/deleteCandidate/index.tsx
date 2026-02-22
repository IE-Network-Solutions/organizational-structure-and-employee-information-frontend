import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteCandidate } from '@/store/server/features/recruitment/candidate/mutation';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import React from 'react';

const DeleteCandidate: React.FC = () => {
  const {
    deleteCandidateModal,
    setDeleteCandidateModal,
    deleteCandidateName,
  } = useCandidateState();
  const { mutate: deleteCandidate } = useDeleteCandidate();

  const handleCandidateDelete = () => {
    deleteCandidate();
    setDeleteCandidateModal(false);
  };

  return (
    deleteCandidateModal && (
      <div
        id="talent-acquisition-candidate-modal-delete-confirmation"
        data-cy="talent-acquisition-candidate-modal-delete-confirmation"
      >
        <DeleteModal
          open={deleteCandidateModal}
          onCancel={() => setDeleteCandidateModal(false)}
          onConfirm={handleCandidateDelete}
          title="Delete Candidate"
          deleteMessage={
            <span className="text-gray-700">
              Are you Sure you want to delete{' '}
              <span className="font-semibold">{deleteCandidateName || 'this candidate'}</span>{' '}
              from candidates ?
            </span>
          }
        />
      </div>
    )
  );
};

export default DeleteCandidate;
