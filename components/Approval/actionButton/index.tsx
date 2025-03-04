import { Button, Space } from 'antd';
import { FiTrash2 } from 'react-icons/fi';
import DeletePopover from '@/components/common/actionButton/deletePopover';
import { FC } from 'react';

interface ActionButtonsProps {
  disableDelete?: boolean;
  loading?: boolean;
  itMyRequest?: boolean;
  onDelete?: (e?: any) => void;
  onDetail?: (e?: any) => void;
  id?: any;
}

const ApprovalActionButtons: FC<ActionButtonsProps> = ({
  disableDelete = false,
  loading = false,
  onDelete,
  onDetail,
  itMyRequest,
  id,
}) => {
  return (
    <Space size={10}>
      {itMyRequest && onDelete && (
        <DeletePopover onDelete={onDelete} disabled={disableDelete}>
          <Button
            className="w-[30px] h-[30px]"
            danger
            disabled={disableDelete}
            loading={loading}
            id={`${id}buttonPopOverActionForOnDeleteActionId`}
            icon={<FiTrash2 size={16} />}
            type="primary"
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        </DeletePopover>
      )}
      {onDetail && (
        <Button
          className="w-[60px] px-2 h-[30px]"
          icon={'Detail'}
          id={`${id}buttonPopOverActionForOnDetailActionId`}
          loading={loading}
          onClick={onDetail}
        />
      )}
    </Space>
  );
};

export default ApprovalActionButtons;
