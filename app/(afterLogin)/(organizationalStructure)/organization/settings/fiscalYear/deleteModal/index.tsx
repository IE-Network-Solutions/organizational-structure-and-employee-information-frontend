import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteFiscalYear } from '@/store/server/features/organizationStructure/fiscalYear/mutation';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import React from 'react';

function CustomDeleteFiscalYears() {
  const {
    isDeleteMode,
    selectedFiscalYear,
    setSelectedFiscalYear,
    setDeleteMode,
  } = useFiscalYearDrawerStore();

  const { mutate: deleteFiscalYear } = useDeleteFiscalYear();
  const handleDeleteScheudle = (id: string) => {
    deleteFiscalYear(id);
    setDeleteMode(false);
  };

  return (
    <DeleteModal
      open={isDeleteMode}
      onCancel={() => {
        setSelectedFiscalYear(null);
        setDeleteMode(false);
      }}
      onConfirm={() => handleDeleteScheudle(selectedFiscalYear?.id ?? '')}
      data-cy="org-settings-fiscal-year-delete-modal"
    />
  );
}

export default CustomDeleteFiscalYears;
