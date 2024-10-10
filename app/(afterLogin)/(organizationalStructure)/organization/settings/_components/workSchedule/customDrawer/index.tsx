import WorkSchedule from '@/app/(afterLogin)/(onboarding)/onboarding/_components/steper/workSchedule';
import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { DayOfWeek } from '@/store/server/features/organizationStructure/workSchedule/interface';
import { useUpdateSchedule } from '@/store/server/features/organizationStructure/workSchedule/mutation';
import { useCreateSchedule } from '@/store/server/features/organizationStructure/workSchedule/mutation';
import { useWorkScheduleDrawerStore } from '@/store/uistate/features/organizations/settings/workSchedule/useStore';
import { ScheduleDetail } from '@/store/uistate/features/organizationStructure/workSchedule/interface';
import useScheduleStore from '@/store/uistate/features/organizationStructure/workSchedule/useStore';
import { Form } from 'antd';
import React, { useEffect } from 'react';

const CustomWorkingScheduleDrawer: React.FC = () => {
  // prettier-ignore

  const {
    isOpen,
    workingHour,
    closeDrawer,
    selectedSchedule,
    isEditMode,
  } = useWorkScheduleDrawerStore();
  // prettier-ignore

  const { name, detail } = useScheduleStore();

  const handleCancel = () => {
    closeDrawer();
  };

  const { mutate: updateSchedule } = useUpdateSchedule();
  const { mutate: createSchedule } = useCreateSchedule();

  const handleSubmit = () => {
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
    if (isEditMode) {
      updateSchedule({
        id: selectedSchedule?.id || '',
        schedule: {
          name: name,
          detail: transformedDetails,
        },
      });
    } else {
      createSchedule({
        name: name,
        detail: transformedDetails,
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
            <CustomButton
              className="bg-gray-200 text-gray-700 hover:bg-gray-300"
              title="Cancel"
              onClick={handleCancel}
            />
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
