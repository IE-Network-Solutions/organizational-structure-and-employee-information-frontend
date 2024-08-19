import WorkSchedule from '@/app/(afterLogin)/(onboarding)/onboarding/_components/steper/workSchedule';
import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import { Form } from 'antd';
import React from 'react';

const CustomWorkingScheduleDrawer: React.FC = () => {
  const { isFiscalYearOpen, workingHour, closeFiscalYearDrawer } =
    useDrawerStore();

  const handleCancel = () => {
    closeFiscalYearDrawer();
  };

  const handleSubmit = () => {
    closeFiscalYearDrawer();
  };

  const [form] = Form.useForm();

  return (
    <CustomDrawerLayout
      modalHeader={
        <h1 className="text-2xl font-semibold">Add New Work Schedule</h1>
      }
      onClose={handleCancel}
      open={isFiscalYearOpen}
      width="50%"
      footer={
        <div className="flex justify-stretch items-center">
          <div className="flex justify items-center gap-2">
            <span>Total Working hours:</span>
            <span>{workingHour ?? '-'}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <CustomButton title="Cancel" onClick={handleCancel} />
            <CustomButton title="Create" onClick={handleSubmit} />
          </div>
        </div>
      }
    >
      <WorkSchedule form={form} />
    </CustomDrawerLayout>
  );
};

export default CustomWorkingScheduleDrawer;
