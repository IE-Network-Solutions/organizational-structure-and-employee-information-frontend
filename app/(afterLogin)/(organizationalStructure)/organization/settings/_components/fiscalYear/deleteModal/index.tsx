import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteFiscalYear } from '@/store/server/features/organizationStructure/fiscalYear/mutation';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import React from 'react';

function CustomDeleteFiscalYear() {
  const {
    isDeleteMode,
    selectedFiscalYear,
    setSelectedFiscalYear,
    setDeleteMode,
  } = useFiscalYearDrawerStore();

  const { mutate: deleteFiscalYear } = useDeleteFiscalYear();
  const handleDeleteScheudle = (id: string) => {
    deleteFiscalYear(id);
  };
  return (
    <DeleteModal
      open={isDeleteMode}
      onCancel={() => {
        setSelectedFiscalYear(null);
        setDeleteMode(false);
      }}
      onConfirm={() => handleDeleteScheudle(selectedFiscalYear?.id ?? '')}
    />
  );
}

export default CustomDeleteFiscalYear;
