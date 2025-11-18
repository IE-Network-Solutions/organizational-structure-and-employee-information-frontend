import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteTalentPoolCategory } from '@/store/server/features/recruitment/tallentPoolCategory/mutation';
import { useTalentPoolSettingsStore } from '@/store/uistate/features/recruitment/settings/talentPoolCategory';
import React from 'react';

function CustomDeleteTalentPool() {
  const {
    setSelectedTalentPool,
    isDeleteMode,
    setDeleteMode,
    selectedTalentPool,
  } = useTalentPoolSettingsStore();
  const { mutate: deleteTalentPOolCategory } = useDeleteTalentPoolCategory();
  const handleDeleteTalentPoolCategory = (id: string) => {
    deleteTalentPOolCategory(id);
  };

  return (
    <div
      id="talent-acquisition-talent-pool-category-modal-delete"
      data-cy="talent-acquisition-talent-pool-category-modal-delete"
    >
      <DeleteModal
        open={isDeleteMode}
        onCancel={() => {
          setSelectedTalentPool(null);
          setDeleteMode(false);
        }}
        onConfirm={() =>
          handleDeleteTalentPoolCategory(selectedTalentPool?.id ?? '')
        }
      />
    </div>
  );
}

export default CustomDeleteTalentPool;
