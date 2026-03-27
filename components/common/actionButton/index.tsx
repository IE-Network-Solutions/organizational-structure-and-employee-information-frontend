import { FC, useEffect, useState } from 'react';
import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { classNames } from '@/utils/classNames';
import DeletePopover from '@/components/common/actionButton/deletePopover';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PowerSettingsNewOutlinedIcon from '@mui/icons-material/PowerSettingsNewOutlined';

export interface ActionButtonProps {
  onOpen?: (e?: any) => void;
  onEdit?: (e?: any) => void;
  onStatusToggle?: (e?: any) => void;
  statusToggleLabel?: string;
  onDelete?: (e?: any) => void;
  onCancelDelete?: (e?: any) => void;
  className?: string;
  id?: any;
}

const ActionButton: FC<ActionButtonProps> = ({
  onOpen,
  onEdit,
  onStatusToggle,
  statusToggleLabel,
  onDelete,
  onCancelDelete,
  className = '',
  id,
}) => {
  const [open, setOpen] = useState(false);
  const items: MenuProps['items'] = [];

  useEffect(() => {
    const onCloseOpen = () => {
      if (open) {
        setOpen(false);
      }
    };

    document.addEventListener('click', onCloseOpen);

    return () => {
      document.removeEventListener('click', onCloseOpen);
    };
  }, [open]);

  if (onOpen) {
    items.push({
      key: '0',
      label: (
        <Button
          size="large"
          id={`${id}actionButtonForOpenId`}
          className="w-full justify-normal"
          type="text"
          onClick={(e) => {
            setOpen(false);
            onOpen(e);
          }}
        >
          Open
        </Button>
      ),
      className: 'p-0 hover:bg-transparent',
    });
  }

  if (onEdit) {
    items.push({
      key: '1',
      label: (
        <Button
          size="large"
          id={`${id}actionButtonForEditId`}
          className="w-full justify-normal flex items-center gap-2 text-[#4d4d4d] text-sm font-normal"
          type="text"
          onClick={(e) => {
            setOpen(false);
            onEdit(e);
          }}
        >
          <EditOutlinedIcon className="text-sm text-black" />
          Edit
        </Button>
      ),
      className: 'p-0 hover:bg-transparent',
    });
  }

  if (onDelete) {
    items.push({
      key: '2',
      label: (
        <DeletePopover
          onCancel={onCancelDelete}
          onDelete={(e) => {
            setOpen(false);
            onDelete(e);
          }}
        >
          <Button
            id={`${id}deleteActionButtonId`}
            size="large"
            className="w-full justify-normal flex items-center gap-2 text-[#4d4d4d] text-sm font-normal"
            type="text"
          >
            <DeleteOutlinedIcon className="text-sm text-black" />
            Delete
          </Button>
        </DeletePopover>
      ),
      className: 'p-0 hover:bg-transparent',
    });
  }

  if (onStatusToggle) {
    items.push({
      key: '1.5',
      label: (
        <Button
          size="large"
          id={`${id}actionButtonForStatusToggleId`}
          className="w-full justify-normal flex items-center gap-2 text-[#4d4d4d] text-sm font-normal"
          type="text"
          onClick={(e) => {
            setOpen(false);
            onStatusToggle(e);
          }}
        >
          <PowerSettingsNewOutlinedIcon className="text-sm text-black" />
          {statusToggleLabel || 'Toggle Status'}
        </Button>
      ),
      className: 'p-0 hover:bg-transparent',
    });
  }

  return (
    <Dropdown
      menu={{ items }}
      trigger={['click']}
      open={open}
      placement="bottomRight"
      className={classNames(className)}
    >
      <Button
        type="default"
        className="border border-[#D9D9D9] h-7 w-6"
        id={`${id}buttonDropDownActionId`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <MoreHorizIcon />
      </Button>
    </Dropdown>
  );
};

export default ActionButton;
