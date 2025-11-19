import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteCandidate } from '@/store/server/features/recruitment/candidate/mutation';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import React from 'react';

const DeleteCandidate: React.FC = () => {
  const { deleteCandidateModal, setDeleteCandidateModal } = useCandidateState();
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
        />
      </div>
    )
  );
};

export default DeleteCandidate;
