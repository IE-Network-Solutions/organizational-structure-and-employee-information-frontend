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
    <div
      className="p-5 rounded-2xl bg-white h-full"
      data-cy="talent-acquisition-custom-fields-page-container"
    >
      <div
        className="flex items-center justify-between"
        data-cy="talent-acquisition-custom-fields-page-header"
      >
        <Title level={5} data-cy="talent-acquisition-custom-fields-page-title">
          Custom Fields
        </Title>
        <AccessGuard permissions={[Permissions.CreateCustomFields]}>
          <Button
            type="primary"
            id="createUserButton"
            data-cy="talent-acquisition-custom-fields-button-new"
            className="h-10 w-10 sm:w-auto"
            icon={
              <FaPlus data-cy="talent-acquisition-custom-fields-button-new-icon" />
            }
            onClick={showDrawer}
          >
            <span
              className="hidden lg:inline"
              data-cy="talent-acquisition-custom-fields-button-new-text"
            >
              New Field
            </span>
          </Button>
        </AccessGuard>
      </div>
      <CustomFieldsCard />
      <CustomFieldsDrawer onClose={onClose} />
    </div>
  );
};

export default CustomAddJobFields;
