'use client';
import { Button, Typography } from 'antd';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
import CustomFieldsDrawer from './customFieldsDrawer';
import { useRecruitmentSettingsStore } from '@/store/uistate/features/recruitment/settings';
import CustomFieldsCard from './customFieldsCard';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const { Title } = Typography;

const CustomAddJobFields: React.FC = () => {
  const { setIsCustomFieldsDrawerOpen } = useRecruitmentSettingsStore();

  const onClose = () => {
    setIsCustomFieldsDrawerOpen(false);
  };
  const showDrawer = () => {
    setIsCustomFieldsDrawerOpen(true);
  };
  return (
    <div className="p-5 rounded-2xl bg-white h-full">
      <div className="flex items-center justify-between">
        <Title level={5}>Custom Fields</Title>
        <AccessGuard permissions={[Permissions.CreateCustomFields]}>
          <Button
            type="primary"
            id="createUserButton"
            className="h-10 w-10 sm:w-auto"
            icon={<FaPlus />}
            onClick={showDrawer}
          >
            <span className="hidden lg:inline">New Field</span>
          </Button>
        </AccessGuard>
      </div>
      <CustomFieldsCard />
      <CustomFieldsDrawer onClose={onClose} />
    </div>
  );
};

export default CustomAddJobFields;
