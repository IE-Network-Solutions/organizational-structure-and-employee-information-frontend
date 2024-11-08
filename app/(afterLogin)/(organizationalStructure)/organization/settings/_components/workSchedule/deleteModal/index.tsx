import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteSchedule } from '@/store/server/features/organizationStructure/workSchedule/mutation';
import React from 'react';
import useScheduleStore from '@/store/uistate/features/organizationStructure/workSchedule/useStore';

function CustomDeleteWorkingSchduel() {
  const { mutate: deleteScheudle } = useDeleteSchedule();
  const { id, setId, isDeleteMode, setDeleteMode } = useScheduleStore();
  const handleDeleteScheudle = (id: string) => {
    deleteScheudle(id);
    setId('');
    setDeleteMode(false);
  };

  return (
    <DeleteModal
      open={isDeleteMode}
      onCancel={() => {
        setDeleteMode(false);
      }}
      onConfirm={() => handleDeleteScheudle(id ?? '')}
    />
  );
}

export default CustomDeleteWorkingSchduel;
