import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import { Card, Typography } from 'antd';
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
    <div className="w-full h-auto p-0 sm:p-1 md:p-2 lg:p-3 xl:p-4">
      <div className="flex gap-2 items-center mb-4">
        <CustomBreadcrumb title="Positions" subtitle="Employee Position" />
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <Title level={5}>Employee Positions</Title>
          <AccessGuard permissions={[Permissions.CreatePosition]}>
            <CustomButton
              title="New Position"
              id="createUserButton"
              icon={<FaPlus size={13} className="mr-2" />}
              onClick={showDrawer}
              className="bg-blue-600 hover:bg-blue-700 h-12 py-5 text-medium font-semibold"
            />
          </AccessGuard>
        </div>
        <PositionCards />
      </Card>

      <CreatePosition />
    </div>
  );
};

export default Positions;
