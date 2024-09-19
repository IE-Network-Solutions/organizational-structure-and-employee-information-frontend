import WorkSchedule from '@/app/(afterLogin)/(onboarding)/onboarding/_components/steper/workSchedule';
import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { DayOfWeek } from '@/store/server/features/organizationStructure/workSchedule/interface';
import { useUpdateSchedule } from '@/store/server/features/organizationStructure/workSchedule/mutation';
import { useWorkScheduleDrawerStore } from '@/store/uistate/features/organizations/settings/workSchedule/useStore';
import { ScheduleDetail } from '@/store/uistate/features/organizationStructure/workSchedule/interface';
import useScheduleStore from '@/store/uistate/features/organizationStructure/workSchedule/useStore';
import { Form } from 'antd';
import React, { useEffect } from 'react';

const CustomWorkingScheduleDrawer: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const {
    isOpen,
    workingHour,
    closeDrawer,
    selectedSchedule,
    isEditMode,
    scheduleName,
  } = useWorkScheduleDrawerStore();
  // eslint-enable-next-line @typescript-eslint/naming-convention

  const { detail } = useScheduleStore();

  const handleCancel = () => {
    closeDrawer();
  };

  const { mutate: updateSchedule } = useUpdateSchedule();
  const handleSubmit = () => {
    if (isEditMode) {
      const transformedDetails: DayOfWeek[] = detail.map(
        (item: ScheduleDetail) => ({
          id: item.id,
          startTime: item.startTime,
          endTime: item.endTime,
          duration: item.hours,
          workDay: item.status,
          day: item.dayOfWeek,
        }),
      );
      updateSchedule({
        id: selectedSchedule?.id || '',
        schedule: {
          name: scheduleName,
          detail: transformedDetails,
        },
      });
    }
    closeDrawer();
  };

  const [form] = Form.useForm();

  useEffect(() => {
    if (isEditMode && selectedSchedule) {
      form.setFieldsValue({
        ...selectedSchedule,
      });
    } else {
      form.resetFields();
    }
  }, [isEditMode, selectedSchedule, form]);

  return (
    <CustomDrawerLayout
      modalHeader={
        <h1 className="text-2xl font-semibold">Add New Work Schedule</h1>
      }
      onClose={handleCancel}
      open={isOpen}
      width="50%"
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="flex justify items-center gap-2">
            <span>Total Working hours:</span>
            <span>{workingHour ?? '-'}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <CustomButton title="Cancel" onClick={handleCancel} />
            <CustomButton
              title={isEditMode ? 'Update' : 'Create'}
              onClick={handleSubmit}
            />
          </div>
        </div>
      }
    >
      <WorkSchedule form={form} />
    </CustomDrawerLayout>
  );
};

export default CustomWorkingScheduleDrawer;
