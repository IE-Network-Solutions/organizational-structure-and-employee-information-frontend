import FiscalYear from '@/app/(afterLogin)/(onboarding)/onboarding/_components/steper/fiscalYear';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  useCreateFiscalYear,
  useUpdateFiscalYear,
} from '@/store/server/features/organizationStructure/fiscalYear/mutation';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import useFiscalYearStore from '@/store/uistate/features/organizationStructure/fiscalYear/fiscalYearStore';
import { showValidationErrors } from '@/utils/showValidationErrors';
import { Form } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import SessionDrawer from '../../session/sessionDrawer';
import MonthDrawer from '../../month/monthDrawer';
import { FormInstance } from 'antd/lib';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useDebounce } from '@/utils/useDebounce';
import { Form } from 'antd';

interface FiscalYearDrawerProps {
  form: FormInstance<any>;
  handleNextStep?: () => void;
  updateIsLoading: boolean;
  createIsLoading: boolean;
}
const CustomWorFiscalYearDrawer: React.FC<FiscalYearDrawerProps> = ({
  form,
  handleNextStep,
  createIsLoading,
  updateIsLoading,
}) => {
  // const [form] = Form.useForm();

  const {
    setFormData,
    current,
    isEditMode,
    selectedFiscalYear,
    calendarType,
    isFiscalYearOpen,
    workingHour,
    closeFiscalYearDrawer,
    setEditMode,
    setSelectedFiscalYear,
  } = useFiscalYearDrawerStore();

  const { name, startDate, endDate, description } = useFiscalYearStore();

  const [form] = Form.useForm();
  const handleCancel = () => {
    closeFiscalYearDrawer();
  };

  const { mutate: updateFiscalYear, isLoading: updateIsLoading } =
    useUpdateFiscalYear();

  const { mutate: createFiscalYear, isLoading: createIsLoading } =
    useCreateFiscalYear();
  const handleSubmit = () => {
    form
      .validateFields()
      .then(() => {
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
      })
      .catch((errorInfo: any) => {
        showValidationErrors(errorInfo?.errorFields);
      });
  };

  useEffect(() => {
    if (isEditMode && selectedFiscalYear) {
      form?.setFieldsValue({
        fiscalYearName: selectedFiscalYear?.name,
        fiscalYearDescription: selectedFiscalYear?.description,
        fiscalYearStartDate: dayjs(selectedFiscalYear?.startDate),
        fiscalYearEndDate: dayjs(selectedFiscalYear?.endDate),
        fiscalYearCalenderId: selectedFiscalYear?.calendarType || calendarType,
      });
    }
  }, [isEditMode, selectedFiscalYear, form, calendarType]);

  // const handleSubmit = () => {
  //   console.log(form, 'this is formssss');
  //   const formValues = form?.getFieldsValue();

  //   console.log(formValues, 'formValues');

  //   const groupMonthsIntoSessions = () => {
  //     /* eslint-disable @typescript-eslint/naming-convention */
  //     const months = Object.keys(formValues)
  //       .filter((key) => key.startsWith('monthName_'))
  //       .map((_, index) => ({
  //         name: formValues[`monthName_${index}`],
  //         description: formValues[`monthDescription_${index}`],
  //         startDate: formValues[`monthStartDate_${index}`],
  //         endDate: formValues[`monthEndDate_${index}`],
  //       }));
  //     /* eslint-enable @typescript-eslint/naming-convention */

  //     if (calendarType === 'Quarter') {
  //       return [
  //         { name: 'Session 1', months: months.slice(0, 3) },
  //         { name: 'Session 2', months: months.slice(3, 6) },
  //         { name: 'Session 3', months: months.slice(6, 9) },
  //         { name: 'Session 4', months: months.slice(9, 12) },
  //       ];
  //     } else if (calendarType === 'Semester') {
  //       return [
  //         { name: 'Session 1', months: months.slice(0, 6) },
  //         { name: 'Session 2', months: months.slice(6, 12) },
  //       ];
  //     } else if (calendarType === 'Year') {
  //       return [{ name: 'Session 1', months }];
  //     }

  //     return [];
  //   };

  //   const sessions = groupMonthsIntoSessions();

  //   if (isEditMode) {
  //     updateFiscalYear({
  //       id: selectedFiscalYear?.id,
  //       fiscalYear: {
  //         name: formValues?.fiscalYearName,
  //         description: formValues?.fiscalYearDescription,
  //         startDate: formValues?.fiscalYearStartDate,
  //         endDate: formValues?.fiscalYearEndDate,
  //         sessions: formValues?.sessions,
  //       },
  //     });
  //   } else {
  //     createFiscalYear({
  //       name: formValues?.fiscalYearName,
  //       description: formValues?.fiscalYearDescription,
  //       endDate: formValues?.fiscalYearEndDate,
  //       startDate: formValues?.fiscalYearStartDate,
  //       sessions: sessions.map((session, index) => ({
  //         name: formValues[`sessionName${index}`] || session?.name,
  //         description: formValues[`sessionDescription${index}`] || '',
  //         startDate: formValues[`sessionStartDate_${index}`] || '',
  //         endDate: formValues[`sessionEndDate_${index}`] || '',
  //         months: session?.months,
  //       })),
  //     });
  //   }
  // };

  // const handleValuesChange = useDebounce(setFormData, 1500);

  const formContent = (
    // <Form
    //   form={form}
    //   layout="vertical"
    //   onFinish={() => {
    //     handleSubmit();
    //   }}
    //   preserve={true}
    //   onValuesChange={() => {
    //     handleValuesChange(form?.getFieldsValue());
    //   }}
    //   validateTrigger="onBlur"
    // >
    <div>
      {current === 0 && <FiscalYear form={form} />}
      {current === 1 && (
        <SessionDrawer
          form={form}
          isCreateLoading={createIsLoading}
          isUpdateLoading={updateIsLoading}
        />
      )}
      {current === 2 && (
        <MonthDrawer
          form={form}
          isCreateLoading={createIsLoading}
          isUpdateLoading={updateIsLoading}
          onNextStep={handleNextStep}
        />
      )}
    </div>
    // </Form>
  );
  return departments?.length ? (
    <CustomDrawerLayout
      modalHeader={
        <h1 className="text-2xl font-semibold">
          {isEditMode ? 'Edit New Fiscal Year' : 'Add New Fiscal Year'}
        </h1>
      }
      onClose={handleCancel}
      open={isFiscalYearOpen}
      width="50%"
      footer={
        <div className="flex justify-between items-center w-full h-full">
          <div className="flex justify items-center gap-2">
            <span>Total Working hours:</span>
            <span>{workingHour ?? '-'}</span>
          </div>
        </div>
      }
    >
      {formContent}
    </CustomDrawerLayout>
  ) : (
    formContent
  );
};

export default CustomWorFiscalYearDrawer;
