import { Button, Space } from 'antd';
import { FiTrash2 } from 'react-icons/fi';
import DeletePopover from '@/components/common/actionButton/deletePopover';
import { FC } from 'react';
import { GrFormEdit } from 'react-icons/gr';

interface ActionButtonsProps {
  disableEdit?: boolean;
  disableDelete?: boolean;
  loading?: boolean;
  onEdit?: (e?: any) => void;
  onDelete?: (e?: any) => void;
  onDetail?: (e?: any) => void;
  id?: any;
}

const ActionButtons: FC<ActionButtonsProps> = ({
  disableEdit = false,
  disableDelete = false,
  loading = false,
  onEdit,
  onDelete,
  onDetail,
  id,
}) => {
  return (
    <Space>
      {onEdit && (
        <Button
          className="action-button-edit bg-blue"
          type="primary"
          icon={<GrFormEdit className="text-white" />}
          id={`${id}buttonPopOverActionForOnEditActionId`}
          loading={loading}
          disabled={disableEdit}
          onClick={onEdit}
        />
      )}

      {onDelete && (
        <DeletePopover onDelete={onDelete} disabled={disableDelete}>
          <Button
            className="action-button-delete"
            danger
            disabled={disableDelete}
            loading={loading}
            id={`${id}buttonPopOverActionForOnDeleteActionId`}
            icon={<FiTrash2 />}
            type="primary"
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        </DeletePopover>
      )}
      {onDetail && (
        <Button
          className="w-7 h-7"
          icon={'Detail'}
          id={`${id}buttonPopOverActionForOnDetailActionId`}
          loading={loading}
          onClick={onDetail}
        />
      )}
    </Space>
  );
};

export default ActionButtons;
