'use client';

import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteBlueprint } from '@/store/server/features/timesheet/workSchedule/mutation';
import { useGetBlueprint } from '@/store/server/features/timesheet/workSchedule/queries';
import { useWorkScheduleUiStore } from '@/store/uistate/features/timesheet/workSchedule';

const DeleteBlueprintModal = () => {
  const { isDeleteModalOpen, selectedBlueprintId, closeDeleteModal } =
    useWorkScheduleUiStore();
  const { data: blueprint } = useGetBlueprint(
    isDeleteModalOpen ? selectedBlueprintId : null,
  );
  const { mutate: deleteBlueprint, isLoading } = useDeleteBlueprint();

  return (
    <DeleteModal
      open={isDeleteModalOpen}
      loading={isLoading}
      title="Delete Work Schedule"
      hideImage
      danger
      customMessage={
        <span data-cy="time-attendance-settings-work-schedule-delete-message">
          Delete{' '}
          <strong data-cy="time-attendance-settings-work-schedule-delete-title">
            {blueprint?.title || 'this work schedule'}
          </strong>
          ? Related mock assignments, future instances, and swap requests will
          also be removed.
        </span>
      }
      onCancel={closeDeleteModal}
      onConfirm={() => {
        if (!selectedBlueprintId) return;
        deleteBlueprint(selectedBlueprintId, {
          onSuccess: closeDeleteModal,
        });
      }}
      data-cy="time-attendance-settings-work-schedule-delete-modal"
    />
  );
};

export default DeleteBlueprintModal;
