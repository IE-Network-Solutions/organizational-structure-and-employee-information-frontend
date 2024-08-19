import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteSchedule } from '@/store/server/features/organizationStructure/workSchedule/mutation';
import { useWorkScheduleDrawerStore } from '@/store/uistate/features/organizations/settings/workSchedule/useStore';
import React from 'react';

function CustomDeleteWorkingSchduel() {
  const { setSelectedSchedule, selectedSchedule, isDeleteMode, setDeleteMode } =
    useWorkScheduleDrawerStore();
  const { mutate: deleteScheudle } = useDeleteSchedule();
  const handleDeleteScheudle = (id: string) => {
    deleteScheudle(id);
  };

  return (
    <DeleteModal
      open={isDeleteMode}
      onCancel={() => {
        setSelectedSchedule(null);
        setDeleteMode(false);
      }}
      onConfirm={() => handleDeleteScheudle(selectedSchedule?.id ?? '')}
    />
  );
}

export default CustomDeleteWorkingSchduel;
