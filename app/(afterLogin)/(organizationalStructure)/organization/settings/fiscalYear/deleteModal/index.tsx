import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteFiscalYear } from '@/store/server/features/organizationStructure/fiscalYear/mutation';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import React from 'react';

function CustomDeleteFiscalYears() {
  const {
    isDeleteMode,
    selectedFiscalYear,
    setSelectedFiscalYear,
    setDeleteMode,
  } = useFiscalYearDrawerStore();

  const { mutate: deleteFiscalYear, isLoading } = useDeleteFiscalYear();

  const handleDeleteSchedule = () => {
    const id = selectedFiscalYear?.id;
    if (!id) {
      NotificationMessage.error({
        message: 'Cannot delete fiscal year',
        description:
          'This fiscal year record is missing an ID. Refresh the page and try again.',
      });
      return;
    }

    if (selectedFiscalYear?.isActive) {
      NotificationMessage.warning({
        message: 'Cannot delete active fiscal year',
        description:
          'The active fiscal year cannot be deleted. Only inactive or future fiscal years can be removed.',
      });
      setDeleteMode(false);
      return;
    }

    deleteFiscalYear(String(id), {
      onSuccess: () => {
        setSelectedFiscalYear(null);
        setDeleteMode(false);
      },
    });
  };

  return (
    <DeleteModal
      open={isDeleteMode}
      onCancel={() => {
        setSelectedFiscalYear(null);
        setDeleteMode(false);
      }}
      onConfirm={handleDeleteSchedule}
      loading={isLoading}
      data-cy="org-settings-fiscal-year-delete-modal"
    />
  );
}

export default CustomDeleteFiscalYears;
