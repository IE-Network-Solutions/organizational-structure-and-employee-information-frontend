import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteSchedule } from '@/store/server/features/organizationStructure/workSchedule/mutation';
import { useDeleteTalentPoolCategory } from '@/store/server/features/recruitment/tallentPoolCategory/mutation';
import { useWorkScheduleDrawerStore } from '@/store/uistate/features/organizations/settings/workSchedule/useStore';
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
  );
}

export default CustomDeleteTalentPool;
