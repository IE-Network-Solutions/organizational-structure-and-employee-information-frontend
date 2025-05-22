'use client';
import { Button, Card, Typography } from 'antd';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
import PositionCards from './positionCards';
import { usePositionState } from '@/store/uistate/features/employees/positions';
import CreatePosition from './createPosition';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const { Title } = Typography;

const Positions: React.FC = () => {
  const { setOpenPositionDrawer } = usePositionState();

  const showDrawer = () => {
    setOpenPositionDrawer(true);
  };
  return (
    <div className="w-full h-auto p-0 ">
      <Card className="border-none">
        <div className="flex items-center justify-between">
          <Title level={5}>Employee Positions</Title>
          <AccessGuard permissions={[Permissions.CreatePosition]}>
            <Button
              type="primary"
              className="h-10 w-10 sm:w-auto"
              icon={<FaPlus />}
              onClick={showDrawer}
            >
              <span className="hidden lg:inline">New Position</span>
            </Button>
          </AccessGuard>
        </div>
        <PositionCards />
      </Card>

      <CreatePosition />
    </div>
  );
};

export default Positions;
