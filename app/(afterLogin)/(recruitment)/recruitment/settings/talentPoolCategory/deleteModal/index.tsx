import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteTalentPoolCategory } from '@/store/server/features/recruitment/tallentPoolCategory/mutation';
import { useTalentPoolSettingsStore } from '@/store/uistate/features/recruitment/settings/talentPoolCategory';
import React from 'react';

interface TriggerRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface CustomDeleteTalentPoolProps {
  triggerRect?: TriggerRect | null;
  /** Called after the exit animation fully completes — use to clear triggerRect. */
  onAfterClose?: () => void;
}

function CustomDeleteTalentPool({
  triggerRect,
  onAfterClose,
}: CustomDeleteTalentPoolProps) {
  const {
    setSelectedTalentPool,
    isDeleteMode,
    setDeleteMode,
    selectedTalentPool,
  } = useTalentPoolSettingsStore();
  const { mutate: deleteTalentPOolCategory } = useDeleteTalentPoolCategory();

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
          // triggerRect is cleared via onAfterClose, not here
        }}
        onConfirm={() => {
          deleteTalentPOolCategory(selectedTalentPool?.id ?? '');
          setDeleteMode(false);
          // triggerRect is cleared via onAfterClose, not here
        }}
        onAfterClose={onAfterClose}
        title="Delete Talent Pool category"
        deleteMessage="Are you Sure you want to delete this category?"
        hideImage
        danger
        modalClassName="recruitment-settings-delete-modal"
        triggerRect={triggerRect ?? undefined}
      />
    </div>
  );
}

export default CustomDeleteTalentPool;
