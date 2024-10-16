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
      <DeleteModal
        open={deleteCandidateModal}
        onCancel={() => setDeleteCandidateModal(false)}
        onConfirm={handleCandidateDelete}
      />
    )
  );
};

export default DeleteCandidate;
