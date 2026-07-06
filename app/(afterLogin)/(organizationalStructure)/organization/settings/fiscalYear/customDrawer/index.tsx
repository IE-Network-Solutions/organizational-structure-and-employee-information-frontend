import {
  useCreateFiscalYear,
  useUpdateFiscalYear,
} from '@/store/server/features/organizationStructure/fiscalYear/mutation';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import React, { useRef } from 'react';
import { FormInstance } from 'antd/lib';
import { Form, Modal } from 'antd';
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
import {
  monthBelongsToSession,
  resolveOriginalMonthId,
  shouldRegenerateFiscalStructure,
} from '@/store/uistate/features/organizations/settings/fiscalYear/wizardUtils';

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
    setMonthRangeFormValues,
    setFiscalYearFormValues,
    setSessionFormValues,
    openfiscalYearDrawer,
    setOpenFiscalYearDrawer,
    setSessionData,
    goToStep,
    getStepFormValues,
    resetWizard,
    wizardOpenToken,
    sessionStructureKey,
    monthStructureKey,
  } = useFiscalYearDrawerStore();

  const appliedWizardTokenRef = useRef(0);
  const appliedSessionKeyRef = useRef<string | null>(null);
  const appliedMonthKeyRef = useRef<string | null>(null);

  if (
    openfiscalYearDrawer &&
    appliedWizardTokenRef.current !== wizardOpenToken
  ) {
    appliedWizardTokenRef.current = wizardOpenToken;
    form1.setFieldsValue(getStepFormValues(0));
    form2.resetFields();
    form3.resetFields();
    appliedSessionKeyRef.current = null;
    appliedMonthKeyRef.current = null;
  }

  if (
    openfiscalYearDrawer &&
    current === 1 &&
    sessionStructureKey &&
    appliedSessionKeyRef.current !== sessionStructureKey
  ) {
    appliedSessionKeyRef.current = sessionStructureKey;
    form2.setFieldsValue(getStepFormValues(1));
  }

  if (
    openfiscalYearDrawer &&
    current === 2 &&
    monthStructureKey &&
    appliedMonthKeyRef.current !== monthStructureKey
  ) {
    appliedMonthKeyRef.current = monthStructureKey;
    form3.setFieldsValue(getStepFormValues(2));
  }

  if (!openfiscalYearDrawer) {
    appliedWizardTokenRef.current = 0;
    appliedSessionKeyRef.current = null;
    appliedMonthKeyRef.current = null;
  }

  const navigateToStep = (step: number, options?: { sync?: boolean }) => {
    goToStep(step, options);
    const formValues = getStepFormValues(step);
    if (step === 0) form1.setFieldsValue(formValues);
    if (step === 1) form2.setFieldsValue(formValues);
    if (step === 2) form3.setFieldsValue(formValues);
  };

  const { data: fiscalYears } = useGetAllFiscalYears();

  const { mutate: updateFiscalYear, isLoading: updateIsLoading } =
    useUpdateFiscalYear();

  const { mutate: createFiscalYear, isLoading: createIsLoading } =
    useCreateFiscalYear();

  const handleCancel = () => {
    setOpenFiscalYearDrawer(false);
    setEditMode(false);
    setSelectedFiscalYear(null);
    form1.resetFields();
    form2.resetFields();
    form3.resetFields();
    resetWizard();
  };

  const handleBack = () => {
    if (current > 0) {
      navigateToStep(current - 1, { sync: false });
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

  const getTransformedFiscalYear = (
    monthFormValues: any,
    sessionFormValues: any,
    effectiveCalendarType: string = calendarType,
    preserveEntityIds = false,
  ) => {
    const sessionRows = Array.isArray(sessionFormValues?.sessionData)
      ? sessionFormValues.sessionData
      : [];

    // Helper function to extract months from a values object
    const extractMonthsFromValues = (values: any) => {
      const monthNumbers = Object.keys(values || {})
        .filter((key) => key.startsWith('monthName_'))
        .map((key) => parseInt(key.replace('monthName_', ''), 10))
        .sort((a, b) => a - b);

      return monthNumbers
        .map((monthNumber) => {
          const monthName = values[`monthName_${monthNumber}`];
          const monthStartDateRaw = values[`monthStartDate_${monthNumber}`];
          const monthEndDateRaw = values[`monthEndDate_${monthNumber}`];

          // Only include months that have at least a name and dates
          if (!monthName || !monthStartDateRaw || !monthEndDateRaw) {
            return null;
          }

          // Format dates consistently (handle both dayjs objects and strings)
          const monthStartDate = dayjs(monthStartDateRaw).isValid()
            ? dayjs(monthStartDateRaw).format('YYYY-MM-DD')
            : null;
          const monthEndDate = dayjs(monthEndDateRaw).isValid()
            ? dayjs(monthEndDateRaw).format('YYYY-MM-DD')
            : null;

          if (!monthStartDate || !monthEndDate) {
            return null;
          }

          return {
            name: monthName,
            description: values[`monthDescription_${monthNumber}`] || '',
            startDate: monthStartDate,
            endDate: monthEndDate,
          };
        })
        .filter((month) => month !== null);
    };

    // Prefer submitted form values; only fall back to stored range when form is empty
    let allMonths = extractMonthsFromValues(monthFormValues);

    if (
      allMonths.length === 0 &&
      monthRangeValues &&
      Array.isArray(monthRangeValues) &&
      monthRangeValues.length > 0
    ) {
      const monthRangeFormValues = monthRangeValues.reduce(
        (acc: any, month: any) => {
          const key = month.monthNumber;
          acc[`monthName_${key}`] = month.monthName;
          acc[`monthStartDate_${key}`] = month.monthStartDate;
          acc[`monthEndDate_${key}`] = month.monthEndDate;
          acc[`monthDescription_${key}`] = month.monthDescription;
          return acc;
        },
        {},
      );
      allMonths = extractMonthsFromValues(monthRangeFormValues);
    }

    // Sort months by start date to ensure correct order
    allMonths.sort((a, b) => {
      const dateA = dayjs(a.startDate);
      const dateB = dayjs(b.startDate);
      if (dateA.isBefore(dateB)) return -1;
      if (dateA.isAfter(dateB)) return 1;
      return 0;
    });

    // Track which months have been assigned to avoid duplicates
    const assignedMonthKeys = new Set<string>();
    const usedMonthIds = new Set<string>();

    const getMonthsForSession = (
      sessionStart: string,
      sessionEnd: string,
      originalSession: any,
    ) => {
      if (!sessionStart || !sessionEnd) return [];

      let sessionLocalMonthIndex = 0;

      return allMonths
        .map((month) => {
          if (!month.startDate || !month.endDate) return null;

          const monthKey = `${month.startDate}-${month.endDate}`;
          if (assignedMonthKeys.has(monthKey)) {
            return null;
          }

          if (!monthBelongsToSession(month.startDate, sessionStart, sessionEnd)) {
            return null;
          }

          assignedMonthKeys.add(monthKey);

          const originalMonthId =
            preserveEntityIds && originalSession
              ? resolveOriginalMonthId(
                  originalSession,
                  month.startDate,
                  month.endDate,
                  sessionLocalMonthIndex,
                  usedMonthIds,
                )
              : null;

          sessionLocalMonthIndex += 1;

          return {
            ...month,
            ...(originalMonthId ? { id: originalMonthId } : {}),
          };
        })
        .filter((month) => month !== null);
    };

    const sessions = [];
    if (effectiveCalendarType === 'Quarter') {
      sessions.push(
        ...sessionRows.map((session: any, index: any) => {
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

          const sessionStartStr = startDate
            ? dayjs(startDate).format('YYYY-MM-DD')
            : '';
          const sessionEndStr = endDate
            ? dayjs(endDate).format('YYYY-MM-DD')
            : '';

          // Get the original session from selectedFiscalYear (if in edit mode)
          const originalSession =
            preserveEntityIds && selectedFiscalYear?.sessions?.[index];

          // Get months for this session by matching date ranges
          let sessionMonths =
            sessionStartStr && sessionEndStr
              ? getMonthsForSession(
                  sessionStartStr,
                  sessionEndStr,
                  originalSession,
                )
              : [];

          // Fallback to slicing if date matching returns empty array
          // But only assign months that actually belong to this session (verify dates)
          if (
            sessionMonths.length === 0 &&
            allMonths.length > 0 &&
            sessionStartStr &&
            sessionEndStr
          ) {
            const unassignedMonths = allMonths.filter((m) => {
              const key = `${m.startDate}-${m.endDate}`;
              if (assignedMonthKeys.has(key)) return false;

              return monthBelongsToSession(
                m.startDate,
                sessionStartStr,
                sessionEndStr,
              );
            });
            const slicedMonths = unassignedMonths.slice(0, 3);

            sessionMonths = slicedMonths.map((month, monthIdx) => {
              const monthKey = `${month.startDate}-${month.endDate}`;
              assignedMonthKeys.add(monthKey);

              const originalMonthId =
                preserveEntityIds && originalSession
                  ? resolveOriginalMonthId(
                      originalSession,
                      month.startDate,
                      month.endDate,
                      monthIdx,
                      usedMonthIds,
                    )
                  : null;

              return {
                ...month,
                ...(originalMonthId ? { id: originalMonthId } : {}),
              };
            });
          }

          return {
            ...(preserveEntityIds && originalSession?.id
              ? { id: originalSession.id }
              : {}),
            name: session.sessionName || `Session ${index + 1}`,
            description:
              session.sessionDescription ||
              `Description for Session ${index + 1}`,
            startDate: sessionStartStr,
            endDate: sessionEndStr,
            months: Array.isArray(sessionMonths) ? sessionMonths : [],
          };
        }),
      );
    } else if (effectiveCalendarType === 'Semester') {
      sessions.push(
        ...sessionRows.map((session: any, index: any) => {
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

          const sessionStartStr = startDate
            ? dayjs(startDate).format('YYYY-MM-DD')
            : '';
          const sessionEndStr = endDate
            ? dayjs(endDate).format('YYYY-MM-DD')
            : '';

          // Get the original session from selectedFiscalYear (if in edit mode)
          const originalSession =
            preserveEntityIds && selectedFiscalYear?.sessions?.[index];

          // Get months for this session by matching date ranges
          let sessionMonths =
            sessionStartStr && sessionEndStr
              ? getMonthsForSession(
                  sessionStartStr,
                  sessionEndStr,
                  originalSession,
                )
              : [];

          // Fallback to slicing if date matching returns empty array
          // But only assign months that actually belong to this session (verify dates)
          if (
            sessionMonths.length === 0 &&
            allMonths.length > 0 &&
            sessionStartStr &&
            sessionEndStr
          ) {
            const unassignedMonths = allMonths.filter((m) => {
              const key = `${m.startDate}-${m.endDate}`;
              if (assignedMonthKeys.has(key)) return false;

              return monthBelongsToSession(
                m.startDate,
                sessionStartStr,
                sessionEndStr,
              );
            });
            const slicedMonths = unassignedMonths.slice(0, 6);

            sessionMonths = slicedMonths.map((month, monthIdx) => {
              const monthKey = `${month.startDate}-${month.endDate}`;
              assignedMonthKeys.add(monthKey);

              const originalMonthId =
                preserveEntityIds && originalSession
                  ? resolveOriginalMonthId(
                      originalSession,
                      month.startDate,
                      month.endDate,
                      monthIdx,
                      usedMonthIds,
                    )
                  : null;

              return {
                ...month,
                ...(originalMonthId ? { id: originalMonthId } : {}),
              };
            });
          }

          return {
            ...(preserveEntityIds && originalSession?.id
              ? { id: originalSession.id }
              : {}),
            name: session.sessionName || `Session ${index + 1}`,
            description:
              session.sessionDescription ||
              `Description for Session ${index + 1}`,
            startDate: sessionStartStr,
            endDate: sessionEndStr,
            months: Array.isArray(sessionMonths) ? sessionMonths : [],
          };
        }),
      );
    } else if (effectiveCalendarType === 'Year') {
      sessions.push(
        ...sessionRows.map((session: any) => {
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

          const sessionStartStr = startDate
            ? dayjs(startDate).format('YYYY-MM-DD')
            : '';
          const sessionEndStr = endDate
            ? dayjs(endDate).format('YYYY-MM-DD')
            : '';

          // Get the original session from selectedFiscalYear (if in edit mode)
          const originalSession =
            preserveEntityIds && selectedFiscalYear?.sessions?.[0];

          // For Year type, get all months that fall within the session date range
          let sessionMonths =
            sessionStartStr && sessionEndStr
              ? getMonthsForSession(
                  sessionStartStr,
                  sessionEndStr,
                  originalSession,
                )
              : [];

          // Fallback to all unassigned months if date matching returns empty array
          if (sessionMonths.length === 0 && allMonths.length > 0) {
            // Only use unassigned months
            const unassignedMonths = allMonths.filter((m) => {
              const key = `${m.startDate}-${m.endDate}`;
              return !assignedMonthKeys.has(key);
            });

            // Add IDs for months if in edit mode
            sessionMonths = unassignedMonths.map((month, monthIdx) => {
              const monthKey = `${month.startDate}-${month.endDate}`;
              assignedMonthKeys.add(monthKey);

              const originalMonthId =
                preserveEntityIds && originalSession
                  ? resolveOriginalMonthId(
                      originalSession,
                      month.startDate,
                      month.endDate,
                      monthIdx,
                      usedMonthIds,
                    )
                  : null;

              return {
                ...month,
                ...(originalMonthId ? { id: originalMonthId } : {}),
              };
            });
          }

          return {
            ...(preserveEntityIds && originalSession?.id
              ? { id: originalSession.id }
              : {}),
            name: session?.sessionName || 'Session 1',
            description:
              session?.sessionDescription || 'Description for Session 1',
            startDate: sessionStartStr,
            endDate: sessionEndStr,
            months: sessionMonths,
          };
        }),
      );
    }

    return sessions;
  };

  const handleSubmit = (monthFormValues: any) => {
    const mergedFyValues = {
      ...fiscalYearFormValues,
      ...form1.getFieldsValue(),
    };
    setFiscalYearFormValues(mergedFyValues);

    const form2Values = form2.getFieldsValue();
    const sessionRows = Array.isArray(form2Values?.sessionData)
      ? form2Values.sessionData
      : Array.isArray(sessionFormValues?.sessionData)
        ? sessionFormValues.sessionData
        : Array.isArray(useFiscalYearDrawerStore.getState().sessionData)
          ? useFiscalYearDrawerStore.getState().sessionData
          : [];
    const latestSessionValues = { sessionData: sessionRows };

    const effectiveCalendarType =
      mergedFyValues.fiscalYearCalenderId || calendarType;

    const fyStart = mergedFyValues?.fiscalYearStartDate
      ? dayjs(mergedFyValues.fiscalYearStartDate)
      : null;
    const fyEnd = mergedFyValues?.fiscalYearEndDate
      ? dayjs(mergedFyValues.fiscalYearEndDate)
      : null;

    const preserveEntityIds =
      isEditMode &&
      !!selectedFiscalYear &&
      !shouldRegenerateFiscalStructure({
        isEditMode,
        selectedFiscalYear,
        calendarType: effectiveCalendarType,
        fiscalYearStart: fyStart,
        fiscalYearEnd: fyEnd,
      });

    const fiscalYearData = getTransformedFiscalYear(
      monthFormValues,
      latestSessionValues,
      effectiveCalendarType,
      preserveEntityIds,
    );

    const now = dayjs();
    const isYearActive = isEditMode
      ? (selectedFiscalYear?.isActive ?? false)
      : !!(fyStart && fyEnd && now.isBetween(fyStart, fyEnd, null, '[]'));
    const submitUsedMonthIds = new Set<string>();

    const fiscalYearPayload = {
      name: mergedFyValues?.fiscalYearName,
      startDate: fyStart ? fyStart.format('YYYY-MM-DD') : undefined,
      endDate: fyEnd ? fyEnd.format('YYYY-MM-DD') : undefined,
      description: mergedFyValues?.fiscalYearDescription,
      isActive: !!isYearActive,
      sessions: fiscalYearData?.map((session: Session, sessionIdx: number) => {
        const sessionStart = session?.startDate
          ? dayjs(session.startDate)
          : null;
        const sessionEnd = session?.endDate ? dayjs(session.endDate) : null;
        const isSessionActive =
          sessionStart &&
          sessionEnd &&
          now.isBetween(sessionStart, sessionEnd, null, '[]');

        const originalSession =
          preserveEntityIds && selectedFiscalYear?.sessions?.[sessionIdx];

        const sessionMonths = Array.isArray(session?.months)
          ? session.months
          : [];

        return {
          ...(preserveEntityIds && session.id ? { id: session.id } : {}),
          name: session?.name,
          description: session?.description,
          startDate: session?.startDate
            ? dayjs(session.startDate).format('YYYY-MM-DD')
            : undefined,
          endDate: session?.endDate
            ? dayjs(session.endDate).format('YYYY-MM-DD')
            : undefined,
          active: preserveEntityIds
            ? (originalSession?.active ?? !!isSessionActive)
            : !!isSessionActive,
          months: sessionMonths.map((month: Month, monthIdx: number) => {
            const monthStart = month?.startDate ? dayjs(month.startDate) : null;
            const monthEnd = month?.endDate ? dayjs(month.endDate) : null;
            const isMonthActive =
              monthStart &&
              monthEnd &&
              now.isBetween(monthStart, monthEnd, null, '[]');
            const originalMonth = originalSession?.months?.[monthIdx];

            let monthId: string | undefined;
            if (preserveEntityIds) {
              if (month.id && !submitUsedMonthIds.has(month.id)) {
                monthId = month.id;
                submitUsedMonthIds.add(month.id);
              } else if (originalSession && month.startDate && month.endDate) {
                const resolvedId = resolveOriginalMonthId(
                  originalSession,
                  month.startDate,
                  month.endDate,
                  monthIdx,
                  submitUsedMonthIds,
                );
                monthId = resolvedId ?? undefined;
              }
            }

            return {
              ...(monthId ? { id: monthId } : {}),
              name: month?.name,
              description: month?.description,
              startDate: month?.startDate
                ? dayjs(month.startDate).format('YYYY-MM-DD')
                : undefined,
              endDate: month?.endDate
                ? dayjs(month.endDate).format('YYYY-MM-DD')
                : undefined,
              active: preserveEntityIds
                ? (originalMonth?.active ?? !!isMonthActive)
                : !!isMonthActive,
            };
          }),
        };
      }),
    };

    if (!fiscalYears) {
      message.error('Fiscal years data not loaded.');
      return;
    }

    const newStart = dayjs(mergedFyValues?.fiscalYearStartDate);
    const newEnd = dayjs(mergedFyValues?.fiscalYearEndDate);

    const hasOverlap = (fiscalYears?.items ?? []).some((fy) => {
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

    const hasEmptySessionMonths = fiscalYearPayload.sessions?.some(
      (session) => !Array.isArray(session.months) || session.months.length === 0,
    );
    if (hasEmptySessionMonths) {
      NotificationMessage.error({
        message: 'Invalid fiscal year structure',
        description:
          'Each session must include at least one month. Please review session and month dates.',
      });
      return;
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
            setMonthRangeFormValues([]);
            setFiscalYearFormValues({});
            setSessionFormValues({});
            setSessionData([]);
            resetWizard();
            setOpenFiscalYearDrawer(false);
            queryClient.refetchQueries('fiscalYears');
          },
        },
      );
    } else {
      createFiscalYear(fiscalYearPayload, {
        onSuccess: () => {
          form1.resetFields();
          form2.resetFields();
          form3.resetFields();
          setMonthRangeFormValues([]);
          setFiscalYearFormValues({});
          setSessionFormValues({});
          setSessionData([]);
          resetWizard();
          setOpenFiscalYearDrawer(false);
          // The mutation already invalidates 'fiscalYears', but explicitly refetch all matching queries
          // This ensures the list updates immediately after creation
          queryClient.refetchQueries('fiscalYears');
        },
      });
    }
  };

  const formContent = (
    <>
      {openfiscalYearDrawer && current === 0 && (
        <FiscalYearForm
          form={form1}
          onNavigateToStep={navigateToStep}
          data-cy="org-settings-fiscalyear-customdrawer-index-fiscalyearform-1"
        />
      )}
      {openfiscalYearDrawer && current === 1 && (
        <SessionDrawer
          form={form2}
          isCreateLoading={createIsLoading}
          isUpdateLoading={updateIsLoading}
          onNavigateToStep={navigateToStep}
          isFiscalYear={true}
          data-cy="org-settings-fiscalyear-customdrawer-index-sessiondrawer-1"
        />
      )}
      {openfiscalYearDrawer && current === 2 && (
        <MonthDrawer
          form={form3}
          isCreateLoading={createIsLoading}
          isUpdateLoading={updateIsLoading}
          onSubmit={handleSubmit}
          onNavigateToStep={navigateToStep}
          isFiscalYear={true}
          data-cy="org-settings-fiscalyear-customdrawer-index-monthdrawer-1"
        />
      )}
    </>
  );

  return (
    <Modal
      title={
        <div
          className="flex items-center justify-between w-full min-h-[40px]"
          data-cy="org-settings-fiscal-year-modal-back-btn-grand-parent"
        >
          <div
            className="flex items-center gap-3 flex-1 min-w-0"
            data-cy="org-settings-fiscal-year-modal-back-btn-parent"
          >
            {current > 0 ? (
              <IoIosArrowBack
                onClick={handleBack}
                className="p-0 m-[-4px] w-5 h-5 flex items-center justify-center shrink-0 text-gray-700 cursor-pointer"
                data-cy="org-settings-fiscal-year-modal-back-btn"
              />
            ) : (
              <span
                className="w-8 shrink-0"
                aria-hidden
                data-cy="org-settings-fiscal-year-modal-back-spacer"
              />
            )}
            <h1
              className="text-base font-bold text-gray-800 m-0 flex-1 text-center"
              data-cy="org-settings-fiscal-year-drawer-header"
              id="org-settings-fiscal-year-drawer-header"
            >
              {getModalTitle()}
            </h1>
          </div>
          <CloseOutlined
            onClick={handleCancel}
            className="p-0 w-8 h-8 mr-[-4px] flex items-center justify-center shrink-0 text-gray-600 hover:text-gray-800 cursor-pointer"
            data-cy="org-settings-fiscal-year-modal-close-btn"
          />
        </div>
      }
      open={openfiscalYearDrawer}
      onCancel={handleCancel}
      footer={null}
      closable={false}
      destroyOnClose
      width={isMobile ? '95%' : '35%'}
      styles={{
        body: {
          padding: '0 16px 16px',
        },
        header: {
          borderBottom: 'none',
          marginBottom: '16px',
          paddingLeft: '14px',
          paddingRight: '14px',
        },
      }}
      data-cy="org-settings-fiscal-year-drawer"
    >
      {openfiscalYearDrawer ? formContent : null}
    </Modal>
  );
};

export default CustomWorFiscalYearDrawer;
