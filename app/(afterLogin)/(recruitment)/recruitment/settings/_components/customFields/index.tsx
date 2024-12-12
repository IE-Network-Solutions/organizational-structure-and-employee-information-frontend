import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import { Card, Typography } from 'antd';
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
    <div className="bg-[#F5F5F5] px-2 h-auto min-h-screen w-full">
      <div className="flex gap-2 items-center mb-4">
        <CustomBreadcrumb
          title="Settings"
          subtitle="Organizational Development Settings"
        />
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <Title level={5}>Custom Fields</Title>
          <AccessGuard permissions={[Permissions.CreateCustomFields]}>
            <CustomButton
              title="New Field"
              id="createUserButton"
              icon={<FaPlus size={13} className="mr-2" />}
              onClick={showDrawer}
              className="bg-blue-600 hover:bg-blue-700 h-12 py-5 text-medium font-semibold"
            />
          </AccessGuard>
        </div>
        <CustomFieldsCard />
      </Card>

      <CustomFieldsDrawer onClose={onClose} />
    </div>
  );
};

export default CustomAddJobFields;
