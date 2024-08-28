import { TbLock } from 'react-icons/tb';
import { GoLocation } from 'react-icons/go';
import React, { useState } from 'react';
import { Button, Col, Dropdown, Popover, Row } from 'antd';
import type { MenuProps } from 'antd';
import { HiOutlineDotsVertical } from 'react-icons/hi';

const AreaCard = () => {
  const buttonClass = 'text-xs font-bold w-full h-[29px] min-w-[125px]';

  const items: MenuProps['items'] = [
    {
      key: '0',
      label: (
        <Button size="large" className="w-full justify-normal" type="text">
          Edit
        </Button>
      ),
      className: 'p-0 hover:bg-transparent',
    },
    {
      key: '1',
      label: (
        <Popover
          trigger="hover"
          placement="bottomRight"
          title={
            <div className="text-base text-gray-900 font-bold">
              Are you sure you want to delete
            </div>
          }
          content={
            <div className="pt-4">
              <Row gutter={20}>
                <Col span={12}>
                  <Button size="small" className={buttonClass}>
                    Cancel
                  </Button>
                </Col>
                <Col span={12}>
                  <Button size="small" className={buttonClass} type="primary">
                    Delete
                  </Button>
                </Col>
              </Row>
            </div>
          }
        >
          <Button size="large" className="w-full justify-normal" type="text">
            Delete
          </Button>
        </Popover>
      ),
      className: 'p-0 hover:bg-transparent',
    },
  ];

  return (
    <div className="border border-t-0 first:border-t px-4 py-2.5 border-gray-200 flex items-center gap-3">
      <TbLock size={16} className="text-gray-500" />
      <div className="flex items-center justify-between flex-1">
        <div className="flex-1">
          <div className="text-xs text-gray-900 leading-5 font-medium">
            Bahir Dar
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <GoLocation size={16} />
            <span className="text-xs">
              Akaky Kaliti subcity, Kilinto area around Tulu dimtu.
            </span>
          </div>
        </div>

        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
          <Button
            icon={<HiOutlineDotsVertical size={20} className="text-gray-500" />}
            className="h-7 w-7"
            type="text"
          />
        </Dropdown>
      </div>
    </div>
  );
};

export default AreaCard;
