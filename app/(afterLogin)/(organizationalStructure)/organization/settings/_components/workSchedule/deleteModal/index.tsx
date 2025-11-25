import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteSchedule } from '@/store/server/features/organizationStructure/workSchedule/mutation';
import { useCheckScheduleInUse } from '@/store/server/features/organizationStructure/workSchedule/queries';
import React, { useEffect, useState } from 'react';
import useScheduleStore from '@/store/uistate/features/organizationStructure/workSchedule/useStore';
import { Modal } from 'antd';

function CustomDeleteWorkingSchduel() {
  const { mutate: deleteScheudle, isLoading: isDeleting } = useDeleteSchedule();
  const { id, setId, isDeleteMode, setDeleteMode } = useScheduleStore();
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [canShowDeleteModal, setCanShowDeleteModal] = useState(false);

  const { refetch: checkSchedule } = useCheckScheduleInUse(id, false);

  useEffect(() => {
    if (!isDeleteMode || !id) {
      setCanShowDeleteModal(false);
      return;
    }

    setIsChecking(true);
    setCanShowDeleteModal(false);
    checkSchedule()
      .then((result) => {
        setIsChecking(false);
        const hasUsers =
          result?.data?.hasUsers === true ||
          (result?.data?.count !== undefined && result?.data?.count > 0);

        if (hasUsers) {
          setShowWarningModal(true);
          setDeleteMode(false);
          setCanShowDeleteModal(false);
        } else {
          setCanShowDeleteModal(true);
        }
      })
      .catch(() => {
        setIsChecking(false);
        setShowWarningModal(true);
        setDeleteMode(false);
        setCanShowDeleteModal(false);
      });
  }, [isDeleteMode, id, checkSchedule, setDeleteMode]);

  const handleDeleteScheudle = (scheduleId: string) => {
    if (!scheduleId) {
      return;
    }

    deleteScheudle(scheduleId, {
      onSuccess: () => {
        setId('');
        setDeleteMode(false);
        setCanShowDeleteModal(false);
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message || error?.message || '';
        const isAssignedUsersError =
          errorMessage.toLowerCase().includes('user') ||
          errorMessage.toLowerCase().includes('assigned') ||
          error?.response?.status === 400 ||
          error?.response?.status === 409;

        if (isAssignedUsersError) {
          setShowWarningModal(true);
        }
        setDeleteMode(false);
        setCanShowDeleteModal(false);
      },
    });
  };

  const handleWarningClose = () => {
    setShowWarningModal(false);
    setDeleteMode(false);
    setId('');
    setCanShowDeleteModal(false);
  };

  const handleDeleteCancel = () => {
    setDeleteMode(false);
    setId('');
    setCanShowDeleteModal(false);
  };

  return (
    <>
      <DeleteModal
        open={isDeleteMode && canShowDeleteModal && !isChecking}
        loading={isDeleting || isChecking}
        onCancel={handleDeleteCancel}
        onConfirm={() => {
          if (id) {
            handleDeleteScheudle(id);
          }
        }}
      />
      <Modal
        open={showWarningModal}
        onCancel={handleWarningClose}
        onOk={handleWarningClose}
        title="Cannot Delete Work Schedule"
        okText="OK"
        cancelButtonProps={{ style: { display: 'none' } }}
        closable={true}
      >
        <p style={{ marginTop: 16, fontSize: 14 }}>
          Users are currently using this Work Schedule. You cannot delete it.
        </p>
      </Modal>
    </>
  );
}

export default CustomDeleteWorkingSchduel;
