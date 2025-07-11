import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  useCreateFiscalYear,
  useUpdateFiscalYear,
} from '@/store/server/features/organizationStructure/fiscalYear/mutation';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import React, { useEffect } from 'react';
import { FormInstance } from 'antd/lib';
import { Form } from 'antd';
import {
  Month,
  Session,
} from '@/store/server/features/organizationStructure/fiscalYear/interface';
import FiscalYearForm from './steps/fiscalYearDrawer';
import MonthDrawer from './steps/monthDrawer';
import SessionDrawer from './steps/sessionDrawer';
import dayjs from 'dayjs';

interface FiscalYearDrawerProps {
  form?: FormInstance;
  handleNextStep?: () => void;
}
const CustomWorFiscalYearDrawer: React.FC<FiscalYearDrawerProps> = () => {
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [form3] = Form.useForm();

  const {
    current,
    isEditMode,
    selectedFiscalYear,
    calendarType,
    setEditMode,
    setSelectedFiscalYear,
    fiscalYearFormValues,
    sessionFormValues,
    monthRangeValues,
    setCurrent,
    setMonthRangeFormValues,
    setFiscalYearFormValues,
    setSessionFormValues,
    openfiscalYearDrawer,
    setOpenFiscalYearDrawer,
    resetFormState,
    setCalendarType,
    setFiscalYearStart,
    setFiscalYearEnd,
    setSessionData,
  } = useFiscalYearDrawerStore();

  useEffect(() => {
    const formValues = form3?.getFieldsValue();
    setMonthRangeFormValues(formValues);
  }, [form3, setMonthRangeFormValues]);

  const { mutate: updateFiscalYear, isLoading: updateIsLoading } =
    useUpdateFiscalYear();

  const { mutate: createFiscalYear, isLoading: createIsLoading } =
    useCreateFiscalYear();

  const handleCancel = () => {
    setOpenFiscalYearDrawer(false);
    setEditMode(false);
    setSelectedFiscalYear(null);
    setCurrent(0);

    // Reset all form fields
    form1.resetFields();
    form2.resetFields();
    form3.resetFields();

    // Clear all stored form values from the store
    setFiscalYearFormValues({});
    setSessionFormValues({});
    setMonthRangeFormValues(null);

    // Reset form validation state
    resetFormState();

    // Reset calendar type and dates
    setCalendarType('');
    setFiscalYearStart(null);
    setFiscalYearEnd(null);

    // Reset session data
    setSessionData([]);
  };

  React.useEffect(() => {
    if (
      isEditMode &&
      selectedFiscalYear &&
      Array.isArray(monthRangeValues) &&
      monthRangeValues.length > 0
    ) {
      form1.setFieldsValue(fiscalYearFormValues);
      form2.setFieldsValue(sessionFormValues);
      form3.setFieldsValue(
        monthRangeValues.reduce(
          (acc, month) => {
            const key = month.monthNumber;
            acc[`monthName_${key}`] = month.monthName;
            acc[`monthStartDate_${key}`] = month.monthStartDate;
            acc[`monthEndDate_${key}`] = month.monthEndDate;
            acc[`monthDescription_${key}`] = month.monthDescription;
            return acc;
          },
          {} as Record<string, any>,
        ),
      );
    }
  }, [isEditMode, selectedFiscalYear, monthRangeValues]);

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
      startDate: fiscalYearFormValues?.fiscalYearStartDate
        ? dayjs(fiscalYearFormValues.fiscalYearStartDate).format('YYYY-MM-DD')
        : undefined,
      endDate: fiscalYearFormValues?.fiscalYearEndDate
        ? dayjs(fiscalYearFormValues.fiscalYearEndDate).format('YYYY-MM-DD')
        : undefined,
      description: fiscalYearFormValues?.fiscalYearDescription,
      sessions: fiscalYearData?.map((session: Session, sessionIdx: number) => {
        // Get the session from selectedFiscalYear (if in edit mode)
        const originalSession =
          isEditMode && selectedFiscalYear?.sessions?.[sessionIdx];
        return {
          ...(isEditMode && originalSession?.id
            ? { id: originalSession.id }
            : {}),
          name: session?.name,
          description: session?.description,
          startDate: session?.startDate
            ? dayjs(session.startDate).format('YYYY-MM-DD')
            : undefined,
          endDate: session?.endDate
            ? dayjs(session.endDate).format('YYYY-MM-DD')
            : undefined,
          months: session?.months?.map((month: Month, monthIdx: number) => {
            // Get the month from the original session (if in edit mode)
            const originalMonth =
              isEditMode && originalSession?.months?.[monthIdx];
            return {
              ...(isEditMode && originalMonth?.id
                ? { id: originalMonth.id }
                : {}),
              name: month?.name,
              description: month?.description,
              startDate: month?.startDate
                ? dayjs(month.startDate).format('YYYY-MM-DD')
                : undefined,
              endDate: month?.endDate
                ? dayjs(month.endDate).format('YYYY-MM-DD')
                : undefined,
            };
          }),
        };
      }),
    };

    if (isEditMode) {
      updateFiscalYear(
        {
          id: selectedFiscalYear?.id,
          fiscalYear: fiscalYearPayload,
        },
        {
          onSuccess: () => {
            form1.resetFields();
            form2.resetFields();
            form3.resetFields();
            setMonthRangeFormValues(null);
            setFiscalYearFormValues({});
            setSessionFormValues({});
            setSessionData([]);
            setCurrent(0);
            setOpenFiscalYearDrawer(false);
          },
        },
      );
    } else {
      createFiscalYear(fiscalYearPayload, {
        onSuccess: () => {
          form1.resetFields();
          form2.resetFields();
          form3.resetFields();
          setMonthRangeFormValues(null);
          setFiscalYearFormValues({});
          setSessionFormValues({});
          setSessionData([]);
          setCurrent(0);
          setOpenFiscalYearDrawer(false);
        },
      });
    }
  };

  const formContent = (
    <
      // Form layout="vertical" onFinish={handleSubmit}
    >
      {current === 0 && <FiscalYearForm form={form1} />}
      {current === 1 && (
        <SessionDrawer
          form={form2}
          isCreateLoading={createIsLoading}
          isUpdateLoading={updateIsLoading}
          isFiscalYear={true}
        />
      )}
      {current === 2 && (
        <MonthDrawer
          form={form3}
          isCreateLoading={createIsLoading}
          isUpdateLoading={updateIsLoading}
          onSubmit={handleSubmit} // <-- pass the handler
          isFiscalYear={true}
          open={openfiscalYearDrawer} // <-- add this
        />
      )}
    </>
  );

  return (
    <>
      <CustomDrawerLayout
        modalHeader={
          <h1 className="flex justify-start text-base font-bold text-gray-800">
            {isEditMode ? 'Edit Fiscal Year' : 'Add New Fiscal Year'}
          </h1>
        }
        onClose={handleCancel}
        open={openfiscalYearDrawer}
        width="35%"
        footer={null}
        customPadding="0px"
      >
        {formContent}
      </CustomDrawerLayout>
    </>
  );
};

export default CustomWorFiscalYearDrawer;
