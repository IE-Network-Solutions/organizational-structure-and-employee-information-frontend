import FiscalYear from '@/app/(afterLogin)/(onboarding)/onboarding/_components/steper/fiscalYear';
import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  useCreateFiscalYear,
  useUpdateFiscalYear,
} from '@/store/server/features/organizationStructure/fiscalYear/mutation';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import useFiscalYearStore from '@/store/uistate/features/organizationStructure/fiscalYear/fiscalYearStore';
import { Form } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';

const CustomWorFiscalYearDrawer: React.FC = () => {
  const {
    workingHour,
    isFiscalYearOpen,
    closeFiscalYearDrawer,
    isEditMode,
    selectedFiscalYear,
  } = useFiscalYearDrawerStore();
  const { name, startDate, endDate, description } = useFiscalYearStore();

  const handleCancel = () => {
    closeFiscalYearDrawer();
  };

  const { mutate: updateFiscalYear, isLoading: updateIsLoading } =
    useUpdateFiscalYear();

  const { mutate: createFiscalYear, isLoading: createIsLoading } =
    useCreateFiscalYear();
  const handleSubmit = () => {
    if (isEditMode) {
      updateFiscalYear({
        id: selectedFiscalYear?.id,
        fiscalYear: {
          name: name,
          description: description,
          endDate: endDate,
          startDate: startDate,
        },
      });
    } else {
      createFiscalYear({
        name: name,
        description: description,
        endDate: endDate,
        startDate: startDate,
      });
    }
  };

  const [form] = Form.useForm();

  useEffect(() => {
    if (isEditMode && selectedFiscalYear) {
      form.setFieldsValue({
        ...selectedFiscalYear,
        startDate: dayjs(selectedFiscalYear?.startDate),
        endDate: dayjs(selectedFiscalYear?.endDate),
      });
    } else {
      form.resetFields();
    }
  }, [isEditMode, selectedFiscalYear, form]);

  return (
    <CustomDrawerLayout
      modalHeader={
        <h1 className="text-2xl font-semibold">Add New Work Schedule</h1>
      }
      onClose={handleCancel}
      open={isFiscalYearOpen}
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
              loading={isEditMode ? updateIsLoading : createIsLoading}
              title={isEditMode ? 'Update' : 'Create'}
              onClick={handleSubmit}
            />
          </div>
        </div>
      }
    >
      <FiscalYear form={form} />
    </CustomDrawerLayout>
  );
};

export default CustomWorFiscalYearDrawer;
