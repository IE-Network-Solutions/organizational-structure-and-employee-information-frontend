import React, { useRef, useEffect } from 'react';
import { Card } from 'antd';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

const KebabMenu: React.FC<any> = (props) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        props?.handleButtonClick(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [props]);

  return (
    <Card
      className="bg-white absolute z-10 shadow-sm right-0 md:right-10 p-0 rounded-md"
      ref={cardRef}
      bodyStyle={{
        padding: '0',
      }}
    >
      <button
        type="button"
        id={`editCardId${props?.item?.id}`}
        data-cy={`components-common-kebabmenu-edit-${props?.item?.id}`}
        onClick={() => props?.editGroupPermissionHandler(props?.item)}
        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
      >
        <EditOutlinedIcon className="text-gray-700" fontSize="small" />
        <span
          data-cy="components-common-kebabmenu-edit-role-text"
          className="text-sm font-normal text-[#818181] text-nowrap"
        >
          Edit Role
        </span>
      </button>
      <button
        type="button"
        id={`deleteCardId${props?.item?.id}`}
        data-cy={`components-common-kebabmenu-delete-${props?.item?.id}`}
        onClick={props?.deleteGroupPermissionHandler}
        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-50 cursor-pointer"
      >
        <DeleteOutlineOutlinedIcon className="text-red-500" fontSize="small" />
        <span
          data-cy="components-common-kebabmenu-delete-role-text"
          className="text-sm font-normal text-[#818181] text-nowrap"
        >
          Delete Role
        </span>
      </button>
    </Card>
  );
};

export default KebabMenu;
