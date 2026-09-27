'use client';

import { Button, Popconfirm, Tooltip } from 'antd';
import { MdEdit } from 'react-icons/md';

interface EditToolbarProps {
  isEditing: boolean;
  /** True while a layout change is on its way to the API. */
  isSaving: boolean;
  onStartEditing: () => void;
  onOpenCatalog: () => void;
  onReset: () => void;
  onDone: () => void;
}

/**
 * "Edit" is a pencil icon only; Add, Reset and Done stay labeled.
 */
export default function EditToolbar({
  isEditing,
  isSaving,
  onStartEditing,
  onOpenCatalog,
  onReset,
  onDone,
}: EditToolbarProps) {
  if (!isEditing) {
    return (
      <Tooltip title="Edit dashboard">
        <Button
          type="text"
          shape="circle"
          aria-label="Edit dashboard"
          icon={<MdEdit size={18} />}
          onClick={onStartEditing}
          data-cy="dashboard-customize-edit-button"
        />
      </Tooltip>
    );
  }

  return (
    <div
      className="flex items-center gap-2"
      data-cy="dashboard-customize-toolbar"
    >
      {isSaving && (
        <span
          className="text-xs text-gray-500"
          data-cy="dashboard-customize-saving-indicator"
        >
          Saving…
        </span>
      )}
      <Button onClick={onOpenCatalog} data-cy="dashboard-customize-add-button">
        Add
      </Button>
      <Popconfirm
        title="Reset dashboard"
        description="This restores the default layout for your current plan."
        okText="Reset"
        cancelText="Cancel"
        onConfirm={onReset}
        data-cy="dashboard-customize-reset-confirm"
      >
        <Button data-cy="dashboard-customize-reset-button">Reset</Button>
      </Popconfirm>
      <Button
        type="primary"
        onClick={onDone}
        data-cy="dashboard-customize-done-button"
      >
        Done
      </Button>
    </div>
  );
}
