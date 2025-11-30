import React, { useRef, useEffect } from 'react';
import { Card, Menu } from 'antd';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';

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
      className="bg-white absolute z-10 shadow-sm right-0 md:right-10 p-0"
      ref={cardRef}
      bodyStyle={{ padding: 0 }}
    >
      <Menu selectable={false} className="min-w-[140px]">
        <Menu.Item
          id={`editCardId${props?.item?.id}`}
          icon={<AiOutlineEdit size={16} />}
          onClick={() => props?.editGroupPermissionHandler(props?.item)}
        >
          Edit
        </Menu.Item>
        <Menu.Item
          id={`deleteCardId${props?.item?.id}`}
          icon={<AiOutlineDelete size={16} />}
          className="text-red-600"
          onClick={props?.deleteGroupPermissionHandler}
        >
          Delete
        </Menu.Item>
      </Menu>
    </Card>
  );
};

export default KebabMenu;
