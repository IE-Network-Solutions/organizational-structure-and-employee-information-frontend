import { Button, Space } from 'antd';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import DeletePopover from '@/components/common/actionButton/deletePopover';
import { FC } from 'react';

interface ActionButtonsProps {
  disabled?: boolean;
  loading?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ActionButtons: FC<ActionButtonsProps> = ({
  disabled = false,
  loading = false,
  onEdit,
  onDelete,
}) => {
  return (
    <Space size={10}>
      {onEdit && (
        <Button
          className="w-[30px] h-[30px]"
          icon={<FiEdit2 size={16} />}
          type="primary"
          loading={loading}
          disabled={disabled}
          onClick={onEdit}
        />
      )}

      {onDelete && (
        <DeletePopover onDelete={onDelete} disabled={disabled}>
          <Button
            className="w-[30px] h-[30px]"
            danger
            disabled={disabled}
            loading={loading}
            icon={<FiTrash2 size={16} />}
            type="primary"
          />
        </DeletePopover>
      )}
    </Space>
  );
};

export default ActionButtons;
