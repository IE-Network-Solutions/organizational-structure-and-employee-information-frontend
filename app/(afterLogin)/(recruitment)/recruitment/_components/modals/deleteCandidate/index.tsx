import { useDeleteCandidate } from '@/store/server/features/recruitment/candidate/mutation';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { CloseOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import React from 'react';

const DeleteCandidate: React.FC = () => {
  const {
    deleteCandidateModal,
    setDeleteCandidateModal,
    setDeleteTriggerRect,
    selectedCandidate,
    deleteTriggerRect,
  } = useCandidateState();
  const { mutate: deleteCandidate, isLoading: deleteLoading } =
    useDeleteCandidate();

  const handleCandidateDelete = () => {
    deleteCandidate();
    setDeleteCandidateModal(false);
    setDeleteTriggerRect(null);
  };

  const handleCancel = () => {
    setDeleteCandidateModal(false);
    setDeleteTriggerRect(null);
  };

  const candidateName =
    (Array.isArray(selectedCandidate)
      ? selectedCandidate?.[0]?.fullName
      : selectedCandidate?.fullName) || 'this candidate';

  const dropdownContent = (
    <div
      className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden delete-candidate-dropdown-content"
      // style={{ width: DELETE_PANEL_WIDTH }}
      data-cy="delete-candidate-dropdown-content"
    >
      <div
        className="flex items-center justify-between px-5 py-2"
        data-cy="delete-candidate-dropdown-header"
      >
        <span
          className="text-sm font-semibold text-gray-900"
          data-cy="delete-candidate-dropdown-title"
        >
          Delete Candidate
        </span>
        <button
          type="button"
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
          onClick={handleCancel}
          aria-label="Close"
          data-cy="delete-candidate-dropdown-close"
        >
          <CloseOutlined />
        </button>
      </div>
      <div
        className="px-2 py-2"
        data-cy="delete-candidate-dropdown-message-container"
      >
        <p
          className="text-xs text-gray-700 text-wrap px-3"
          data-cy="delete-candidate-dropdown-message"
        >
          Are you sure you want to delete{' '}
          <span
            className="font-medium text-gray-900"
            data-cy="delete-candidate-dropdown-candidate-name"
          >
            {candidateName}
          </span>{' '}
          from candidates?
        </p>
      </div>
      <div
        className="flex justify-end gap-3 px-5 pb-5 pt-2"
        data-cy="delete-candidate-dropdown-actions"
      >
        <Button
          className="px-5 h-8 text-sm font-medium border-gray-300"
          onClick={handleCancel}
          data-cy="delete-candidate-dropdown-cancel"
        >
          Cancel
        </Button>
        <Button
          type="primary"
          danger
          className="px-5 h-8 text-sm font-medium"
          loading={deleteLoading}
          onClick={handleCandidateDelete}
          data-cy="delete-candidate-dropdown-confirm"
        >
          Delete
        </Button>
      </div>
    </div>
  );

  return (
    deleteCandidateModal && (
      <div
        id="talent-acquisition-candidate-modal-delete-confirmation"
        data-cy="talent-acquisition-candidate-modal-delete-confirmation"
      >
        <Dropdown
          open={deleteCandidateModal}
          trigger={['click']}
          onOpenChange={(open) => {
            if (!open) handleCancel();
          }}
          placement="bottomLeft"
          overlayClassName="delete-candidate-dropdown-overlay"
          dropdownRender={() => dropdownContent}
        >
          <span
            data-cy="delete-candidate-dropdown-trigger-span"
            style={
              deleteTriggerRect
                ? {
                    position: 'fixed',
                    top: deleteTriggerRect.top,
                    left: deleteTriggerRect.left,
                    width: deleteTriggerRect.width,
                    height: deleteTriggerRect.height,
                    zIndex: 0,
                    pointerEvents: 'none',
                  }
                : undefined
            }
          >
            {deleteTriggerRect ? null : (
              <Button type="link" onClick={() => setDeleteCandidateModal(true)}>
                Delete
              </Button>
            )}
          </span>
        </Dropdown>
      </div>
    )
  );
};

export default DeleteCandidate;
