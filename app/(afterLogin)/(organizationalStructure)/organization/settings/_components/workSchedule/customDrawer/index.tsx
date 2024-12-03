import { Form } from 'antd';
import { FC } from 'react';
import WorkSchedule from '@/app/(afterLogin)/(onboarding)/onboarding/_components/steper/workSchedule';
import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { DayOfWeek } from '@/store/server/features/organizationStructure/workSchedule/interface';
import { useUpdateSchedule } from '@/store/server/features/organizationStructure/workSchedule/mutation';
import { useCreateSchedule } from '@/store/server/features/organizationStructure/workSchedule/mutation';
import { ScheduleDetail } from '@/store/uistate/features/organizationStructure/workSchedule/interface';
import useScheduleStore from '@/store/uistate/features/organizationStructure/workSchedule/useStore';
import { showValidationErrors } from '@/utils/showValidationErrors';

const CustomWorkingScheduleDrawer: FC = () => {
  const {
    clearState,
    createWorkSchedule,
    id,
    scheduleName,
    standardHours,
    isOpen,
    closeDrawer,
    isEditMode,
  } = useScheduleStore();
  const { mutate: updateSchedule } = useUpdateSchedule();
  const { mutate: createSchedule } = useCreateSchedule();
  const [form] = Form.useForm();

  const handleCancel = () => {
    clearState();
    form.resetFields();
    closeDrawer();
  };

  const handleSubmit = () => {
    createWorkSchedule();
    const transformedDetails: DayOfWeek[] = useScheduleStore
      .getState()
      .detail.map((item: ScheduleDetail) => ({
        id: item.id,
        startTime: item.startTime,
        endTime: item.endTime,
        duration: item.hours,
        workDay: item.status,
        day: item.dayOfWeek,
      }));

    if (isEditMode) {
      form
        .validateFields()
        .then(() => {
          updateSchedule({
            id: id,
            schedule: {
              name: scheduleName,
              detail: transformedDetails,
            },
          });
          handleCancel();
        })
        .catch((errorInfo: any) => {
          showValidationErrors(errorInfo?.errorFields);
        });
    } else {
      form
        .validateFields()
        .then(() => {
          createSchedule({
            name: scheduleName,
            detail: transformedDetails,
          });
          handleCancel();
        })
        .catch((errorInfo: any) => {
          showValidationErrors(errorInfo?.errorFields);
        });
    }
  };

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
            <span>{standardHours.toFixed(1) ?? '-'}</span>
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
