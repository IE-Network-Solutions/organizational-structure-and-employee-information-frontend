import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  useCreateFiscalYear,
  useUpdateFiscalYear,
} from '@/store/server/features/organizationStructure/fiscalYear/mutation';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import React, { useEffect } from 'react';
import { FormInstance } from 'antd/lib';
import { Form } from 'antd';
import { FiscalYear } from '@/store/server/features/organizationStructure/fiscalYear/interface';
import FiscalYearForm from './steps/fiscalYearDrawer';
import SessionDrawer from './steps/sessionDrawer';
import MonthDrawer from './steps/monthDrawer';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);
import { message } from 'antd'; // for error feedback
import { useGetAllFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';

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
    setEditMode,
    setSelectedFiscalYear,
    setCurrent,
    setMonthRangeFormValues,
    openfiscalYearDrawer,
    setOpenFiscalYearDrawer,
    resetFormState,
    setFiscalYearPayLoad,
  } = useFiscalYearDrawerStore();

  useGetAllFiscalYears();

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

    form1.resetFields();
    resetFormState();
    setFiscalYearPayLoad(null);
  };

  /* eslint-disable-next-line @typescript-eslint/naming-convention */
  const handleSubmit = async () => {
    // 1. Gather data from store
    const {
      fiscalYearFormValues,
      sessionFormValues,
      monthRangeValues,
      // eslint-disable-next-line @typescript-eslint/no-shadow
      fiscalYearPayLoad,
    } = useFiscalYearDrawerStore.getState();

    // 2. Validate essential data availability
    if (
      !fiscalYearFormValues.fiscalYearStartDate ||
      !fiscalYearFormValues.fiscalYearEndDate ||
      !sessionFormValues.sessionData ||
      sessionFormValues.sessionData.length === 0 ||
      !monthRangeValues ||
      monthRangeValues.length === 0
    ) {
      if (!fiscalYearPayLoad) {
        message.error('Missing required fiscal year data.');
        return;
      }
    }

    // 3. Construct the payload
    const payload: FiscalYear = {
      name: fiscalYearFormValues.fiscalYearName,
      startDate: dayjs(fiscalYearFormValues.fiscalYearStartDate),
      endDate: fiscalYearFormValues.fiscalYearEndDate.format('YYYY-MM-DD'),
      description: fiscalYearFormValues.fiscalYearDescription || '',
      sessions: sessionFormValues.sessionData.map((session: any) => ({
        id: session?.id, // Includes ID for updates
        name: session.sessionName,
        startDate: dayjs(session.sessionStartDate).format('YYYY-MM-DD'),
        endDate: dayjs(session.sessionEndDate).format('YYYY-MM-DD'),
        description: session.sessionDescription || '',
        months: monthRangeValues
          .filter((month: any) =>
            dayjs(month.monthStartDate).isBetween(
              dayjs(session.sessionStartDate),
              dayjs(session.sessionEndDate),
              null,
              '[]',
            ),
          )
          .map((month: any) => ({
            id: month?.id, // Includes ID for updates
            name: month.monthName,
            startDate: dayjs(month.monthStartDate).format('YYYY-MM-DD'),
            endDate: dayjs(month.monthEndDate).format('YYYY-MM-DD'),
            description: month.monthDescription || '',
          })),
      })),
    };

    // Calculate isActive
    const now = dayjs();
    const fyStart = dayjs(payload.startDate);
    const fyEnd = dayjs(payload.endDate);

    const activeFiscalYearPayload = {
      ...payload,
      isActive: now.isBetween(fyStart, fyEnd, null, '[]'),
      sessions: payload.sessions?.map((session: any) => {
        const sStart = dayjs(session.startDate);
        const sEnd = dayjs(session.endDate);
        return {
          ...session,
          active: now.isBetween(sStart, sEnd, null, '[]'),
          months: session.months.map((month: any) => ({
            ...month,
            active: now.isBetween(
              dayjs(month.startDate),
              dayjs(month.endDate),
              null,
              '[]',
            ),
          })),
        };
      }),
    };

    // 4. Submit
    if (isEditMode && selectedFiscalYear?.id) {
      updateFiscalYear(
        {
          id: selectedFiscalYear.id,
          fiscalYear: activeFiscalYearPayload,
        },
        {
          onSuccess: () => {
            handleCancel();
          },
        },
      );
    } else {
      createFiscalYear(activeFiscalYearPayload, {
        onSuccess: () => {
          handleCancel();
        },
      });
    }
  };

  return (
    <CustomDrawerLayout
      modalHeader={
        <h1 className="flex justify-start text-base font-bold text-gray-800">
          {isEditMode ? 'Edit Fiscal Year' : 'Add New Fiscal Year'}
        </h1>
      }
      onClose={handleCancel}
      open={openfiscalYearDrawer}
      width="40%"
      footer={null}
      customPadding="0px"
    >
      <div className="p-0 h-full overflow-y-auto">
        <div style={{ display: current === 0 ? 'block' : 'none' }}>
          <FiscalYearForm form={form1} />
        </div>
        <div style={{ display: current === 1 ? 'block' : 'none' }}>
          <SessionDrawer
            isCreateLoading={createIsLoading}
            isUpdateLoading={updateIsLoading}
            form={form2}
            isFiscalYear={true}
          />
        </div>
        <div style={{ display: current === 2 ? 'block' : 'none' }}>
          <MonthDrawer
            isCreateLoading={createIsLoading}
            isUpdateLoading={updateIsLoading}
            form={form3}
            open={current === 2}
            onSubmit={handleSubmit}
            isFiscalYear={true}
          />
        </div>
      </div>
    </CustomDrawerLayout>
  );
};

export default CustomWorFiscalYearDrawer;
