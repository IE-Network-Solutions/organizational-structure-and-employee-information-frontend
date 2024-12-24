import FiscalYear from '@/app/(afterLogin)/(onboarding)/onboarding/_components/steper/fiscalYear';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  useCreateFiscalYear,
  useUpdateFiscalYear,
} from '@/store/server/features/organizationStructure/fiscalYear/mutation';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import React, { useEffect } from 'react';
import SessionDrawer from '../../session/sessionDrawer';
import MonthDrawer from '../../month/monthDrawer';
import { FormInstance } from 'antd/lib';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { Form } from 'antd';

interface FiscalYearDrawerProps {
  form: FormInstance;
  handleNextStep?: () => void;
}
const CustomWorFiscalYearDrawer: React.FC<FiscalYearDrawerProps> = ({
  handleNextStep,
}) => {
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [form3] = Form.useForm();

  const {
    current,
    isEditMode,
    selectedFiscalYear,
    calendarType,
    isFiscalYearOpen,
    workingHour,
    closeFiscalYearDrawer,
    setEditMode,
    setSelectedFiscalYear,
    fiscalYearFormValues,
    sessionFormValues,
    setCurrent,
    setMonthRangeFormValues,
  } = useFiscalYearDrawerStore();
  const { data: departments } = useGetDepartments();

  useEffect(() => {
    const formValues = form3?.getFieldsValue();
    setMonthRangeFormValues(formValues);
  }, [form3, setMonthRangeFormValues]);

  const { mutate: updateFiscalYear, isLoading: updateIsLoading } =
    useUpdateFiscalYear();

  const { mutate: createFiscalYear, isLoading: createIsLoading } =
    useCreateFiscalYear();

  const handleCancel = () => {
    closeFiscalYearDrawer();
    setEditMode(false);
    setSelectedFiscalYear(null);
    setCurrent(0);
    form1.resetFields();
    form2.resetFields();
    form3.resetFields();
  };

  React.useEffect(() => {
    if (isEditMode && selectedFiscalYear) {
      form1.setFieldsValue(fiscalYearFormValues);
      form2.setFieldsValue(sessionFormValues);
    } else {
      form1.resetFields();
      form2.resetFields();
      form3.resetFields();
    }
  }, [isEditMode, selectedFiscalYear]);

  const getTransformedFiscalYear = (
    monthFormValues: any,
    sessionFormValues: any,
  ) => {
    const months = Object.keys(monthFormValues)
      .filter((key) => key.startsWith('monthName_'))
      /* eslint-disable-next-line @typescript-eslint/naming-convention */
      .map((_, index) => ({
        /* eslint-enable @typescript-eslint/naming-convention */
        name: monthFormValues[`monthName_${index + 1}`],
        description: monthFormValues[`monthDescription_${index + 1}`],
        startDate: monthFormValues[`monthStartDate_${index + 1}`],
        endDate: monthFormValues[`monthEndDate_${index + 1}`],
      }));

    const sessions = [];
    if (calendarType === 'Quarter') {
      sessions.push(
        ...sessionFormValues?.sessionData.map((session: any, index: any) => ({
          name: session.sessionName || `Session ${index + 1}`,
          description:
            session.sessionDescription ||
            `Description for Session ${index + 1}`,
          startDate: session.sessionStartDate || '',
          endDate: session.sessionEndDate || '',
          months: months.slice(index * 3, (index + 1) * 3),
        })),
      );
    } else if (calendarType === 'Semester') {
      sessions.push(
        ...sessionFormValues?.sessionData.map((session: any, index: any) => ({
          name: session.sessionName || `Session ${index + 1}`,
          description:
            session.sessionDescription ||
            `Description for Session ${index + 1}`,
          startDate: session.sessionStartDate || '',
          endDate: session.sessionEndDate || '',
          months: months.slice(index * 6, (index + 1) * 6),
        })),
      );
    } else if (calendarType === 'Year') {
      sessions.push(
        ...sessionFormValues?.sessionData.map((session: any) => ({
          name: session?.sessionName || 'Session 1',
          description:
            session?.sessionDescription || 'Description for Session 1',
          startDate: session?.sessionStartDate || '',
          endDate: session?.sessionEndDate || '',
          months,
        })),
      );
    }

    return sessions;
  };

  const handleSubmit = (monthFormValues: any) => {
    const fiscalYearData = getTransformedFiscalYear(
      monthFormValues,
      sessionFormValues,
    );

    const fiscalYearPayload = {
      name: fiscalYearFormValues?.fiscalYearName,
      startDate: fiscalYearFormValues?.fiscalYearStartDate,
      endDate: fiscalYearFormValues?.fiscalYearEndDate,
      description: fiscalYearFormValues?.fiscalYearDescription,
      sessions: fiscalYearData?.map((session: any) => ({
        name: session?.name,
        description: session?.description,
        startDate: session?.startDate,
        endDate: session?.endDate,
        months: session?.months.map((month: any) => ({
          name: month?.name,
          description: month?.description,
          startDate: month?.startDate,
          endDate: month?.endDate,
        })),
      })),
    };

    if (isEditMode) {
      updateFiscalYear({
        id: selectedFiscalYear?.id,
        fiscalYear: fiscalYearPayload,
      });
    } else {
      createFiscalYear(fiscalYearPayload);
      form1.resetFields();
      form2.resetFields();
      form3.resetFields();
    }
  };

  const formContent = (
    <Form layout="vertical" onFinish={handleSubmit}>
      {current === 0 && <FiscalYear form={form1} />}
      {current === 1 && (
        <SessionDrawer
          form={form2}
          isCreateLoading={createIsLoading}
          isUpdateLoading={updateIsLoading}
        />
      )}
      {current === 2 && (
        <MonthDrawer
          form={form3}
          isCreateLoading={createIsLoading}
          isUpdateLoading={updateIsLoading}
          onNextStep={handleNextStep}
        />
      )}
    </Form>
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
