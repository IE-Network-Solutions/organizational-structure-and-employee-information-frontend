import {
  useCreateFiscalYear,
  useUpdateFiscalYear,
} from '@/store/server/features/organizationStructure/fiscalYear/mutation';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import React, { useEffect } from 'react';
import { FormInstance } from 'antd/lib';
import { Form, Modal, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { IoIosArrowBack } from 'react-icons/io';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  Month,
  Session,
} from '@/store/server/features/organizationStructure/fiscalYear/interface';
import FiscalYearForm from './steps/fiscalYearDrawer';
import MonthDrawer from './steps/monthDrawer';
import SessionDrawer from './steps/sessionDrawer';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);
import { message } from 'antd'; // for error feedback
import { useGetAllFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useQueryClient } from 'react-query';

interface FiscalYearDrawerProps {
  form?: FormInstance;
  handleNextStep?: () => void;
}
const CustomWorFiscalYearDrawer: React.FC<FiscalYearDrawerProps> = () => {
  const { isMobile } = useIsMobile();
  const queryClient = useQueryClient();
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

  const { data: fiscalYears } = useGetAllFiscalYears();

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

  const handleBack = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  const getModalTitle = () => {
    if (current === 0) {
      return 'Set up your Fiscal year?';
    } else if (current === 1) {
      return 'Set up your Fiscal year?';
    } else if (current === 2) {
      return 'Set up your Fiscal year?';
    }
    return isEditMode ? 'Edit Fiscal Year' : 'Add New Fiscal Year';
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
    // Extract all month numbers from form values
    const monthNumbers = Object.keys(monthFormValues)
      .filter((key) => key.startsWith('monthName_'))
      .map((key) => parseInt(key.replace('monthName_', ''), 10))
      .sort((a, b) => a - b); // Sort to ensure correct order

    const months = monthNumbers.map((monthNumber) => ({
      name: monthFormValues[`monthName_${monthNumber}`],
      description: monthFormValues[`monthDescription_${monthNumber}`] || '',
      startDate: monthFormValues[`monthStartDate_${monthNumber}`],
      endDate: monthFormValues[`monthEndDate_${monthNumber}`],
    }));

    const sessions = [];
    if (calendarType === 'Quarter') {
      sessions.push(
        ...sessionFormValues?.sessionData.map((session: any, index: any) => {
          // Handle both sessionDateRange and separate date fields
          let startDate = session.sessionStartDate;
          let endDate = session.sessionEndDate;

          if (
            session.sessionDateRange &&
            Array.isArray(session.sessionDateRange) &&
            session.sessionDateRange.length === 2
          ) {
            startDate = session.sessionDateRange[0];
            endDate = session.sessionDateRange[1];
          }

          return {
            name: session.sessionName || `Session ${index + 1}`,
            description:
              session.sessionDescription ||
              `Description for Session ${index + 1}`,
            startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : '',
            endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : '',
            months: months.slice(index * 3, (index + 1) * 3),
          };
        }),
      );
    } else if (calendarType === 'Semester') {
      sessions.push(
        ...sessionFormValues?.sessionData.map((session: any, index: any) => {
          // Handle both sessionDateRange and separate date fields
          let startDate = session.sessionStartDate;
          let endDate = session.sessionEndDate;

          if (
            session.sessionDateRange &&
            Array.isArray(session.sessionDateRange) &&
            session.sessionDateRange.length === 2
          ) {
            startDate = session.sessionDateRange[0];
            endDate = session.sessionDateRange[1];
          }

          return {
            name: session.sessionName || `Session ${index + 1}`,
            description:
              session.sessionDescription ||
              `Description for Session ${index + 1}`,
            startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : '',
            endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : '',
            months: months.slice(index * 6, (index + 1) * 6),
          };
        }),
      );
    } else if (calendarType === 'Year') {
      sessions.push(
        ...sessionFormValues?.sessionData.map((session: any) => {
          // Handle both sessionDateRange and separate date fields
          let startDate = session?.sessionStartDate;
          let endDate = session?.sessionEndDate;

          if (
            session?.sessionDateRange &&
            Array.isArray(session.sessionDateRange) &&
            session.sessionDateRange.length === 2
          ) {
            startDate = session.sessionDateRange[0];
            endDate = session.sessionDateRange[1];
          }

          return {
            name: session?.sessionName || 'Session 1',
            description:
              session?.sessionDescription || 'Description for Session 1',
            startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : '',
            endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : '',
            months,
          };
        }),
      );
    }

    return sessions;
  };

  const handleSubmit = (monthFormValues: any) => {
    const fiscalYearData = getTransformedFiscalYear(
      monthFormValues,
      sessionFormValues,
    );

    const now = dayjs();
    // Determine if this fiscal year is active by date
    const fyStart = fiscalYearFormValues?.fiscalYearStartDate
      ? dayjs(fiscalYearFormValues.fiscalYearStartDate)
      : null;
    const fyEnd = fiscalYearFormValues?.fiscalYearEndDate
      ? dayjs(fiscalYearFormValues.fiscalYearEndDate)
      : null;
    const isYearActive =
      fyStart && fyEnd && now.isBetween(fyStart, fyEnd, null, '[]');

    const fiscalYearPayload = {
      name: fiscalYearFormValues?.fiscalYearName,
      startDate: fiscalYearFormValues?.fiscalYearStartDate
        ? dayjs(fiscalYearFormValues.fiscalYearStartDate).format('YYYY-MM-DD')
        : undefined,
      endDate: fiscalYearFormValues?.fiscalYearEndDate
        ? dayjs(fiscalYearFormValues.fiscalYearEndDate).format('YYYY-MM-DD')
        : undefined,
      description: fiscalYearFormValues?.fiscalYearDescription,
      isActive: !!isYearActive,
      sessions: fiscalYearData?.map((session: Session, sessionIdx: number) => {
        // Get the session from selectedFiscalYear (if in edit mode)
        const originalSession =
          isEditMode && selectedFiscalYear?.sessions?.[sessionIdx];
        const sessionStart = session?.startDate
          ? dayjs(session.startDate)
          : null;
        const sessionEnd = session?.endDate ? dayjs(session.endDate) : null;
        const isSessionActive =
          sessionStart &&
          sessionEnd &&
          now.isBetween(sessionStart, sessionEnd, null, '[]');
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
          active: !!isSessionActive,
          months: session?.months?.map((month: Month, monthIdx: number) => {
            // Get the month from the original session (if in edit mode)
            const originalMonth =
              isEditMode && originalSession?.months?.[monthIdx];
            const monthStart = month?.startDate ? dayjs(month.startDate) : null;
            const monthEnd = month?.endDate ? dayjs(month.endDate) : null;
            const isMonthActive =
              monthStart &&
              monthEnd &&
              now.isBetween(monthStart, monthEnd, null, '[]');
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
              active: !!isMonthActive,
            };
          }),
        };
      }),
    };

    if (!fiscalYears) {
      message.error('Fiscal years data not loaded.');
      return;
    }

    const newStart = dayjs(fiscalYearFormValues?.fiscalYearStartDate);
    const newEnd = dayjs(fiscalYearFormValues?.fiscalYearEndDate);

    const hasOverlap = fiscalYears.items.some((fy) => {
      // If editing, skip the current fiscal year
      if (isEditMode && fy.id === selectedFiscalYear?.id) return false;
      const fyStart = dayjs(fy.startDate);
      const fyEnd = dayjs(fy.endDate);
      return (
        newStart.isSameOrBefore(fyEnd, 'day') &&
        newEnd.isSameOrAfter(fyStart, 'day')
      );
    });

    if (hasOverlap) {
      NotificationMessage.warning({
        message:
          'Fiscal year start or end date overlap with an existing fiscal year.',
      });
      return; // Prevent submit
    }

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
          // The mutation already invalidates 'fiscalYears', but explicitly refetch all matching queries
          // This ensures the list updates immediately after creation
          queryClient.refetchQueries('fiscalYears');
        },
      });
    }
  };

  const formContent = (
    <
      // Form layout="vertical" onFinish={handleSubmit}
    >
      {current === 0 && (
        <FiscalYearForm
          form={form1}
          data-cy="org-settings-fiscalyear-customdrawer-index-fiscalyearform-1"
        />
      )}
      {current === 1 && (
        <SessionDrawer
          form={form2}
          isCreateLoading={createIsLoading}
          isUpdateLoading={updateIsLoading}
          isFiscalYear={true}
          data-cy="org-settings-fiscalyear-customdrawer-index-sessiondrawer-1"
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
          data-cy="org-settings-fiscalyear-customdrawer-index-monthdrawer-1"
        />
      )}
    </>
  );

  return (
    <Modal
      title={
        <div
          className="flex items-center justify-between w-full"
          data-cy="org-settings-fiscal-year-modal-back-btn-grand-parent"
        >
          <div
            className="flex items-center gap-3 flex-1"
            data-cy="org-settings-fiscal-year-modal-back-btn-parent"
          >
            {current > 0 && (
              <Button
                type="text"
                icon={<IoIosArrowBack />}
                onClick={handleBack}
                className="p-0 w-auto h-auto"
                data-cy="org-settings-fiscal-year-modal-back-btn"
              />
            )}
            <h1
              className="text-base font-bold text-gray-800 m-0 flex-1 text-center mt-5"
              data-cy="org-settings-fiscal-year-drawer-header"
              id="org-settings-fiscal-year-drawer-header"
            >
              {getModalTitle()}
            </h1>
          </div>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={handleCancel}
            className="p-0 w-auto h-auto ml-auto"
            data-cy="org-settings-fiscal-year-modal-close-btn"
          />
        </div>
      }
      open={openfiscalYearDrawer}
      onCancel={handleCancel}
      footer={null}
      closable={false}
      width={isMobile ? '95%' : '35%'}
      styles={{
        body: {
          padding: '2px',
        },
        header: {
          borderBottom: 'none',
          marginBottom: '16px',
        },
      }}
      data-cy="org-settings-fiscal-year-drawer"
    >
      {formContent}
    </Modal>
  );
};

export default CustomWorFiscalYearDrawer;
