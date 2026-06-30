import {
  useCreateFiscalYear,
  useUpdateFiscalYear,
} from '@/store/server/features/organizationStructure/fiscalYear/mutation';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import React, { useEffect } from 'react';
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
    if (openfiscalYearDrawer && isEditMode && selectedFiscalYear?.id) {
      setMonthRangeFormValues(null);
      setSessionFormValues({});
      setSessionData([]);
      setFiscalYearFormValues({});
    }
  }, [openfiscalYearDrawer, isEditMode, selectedFiscalYear?.id]);

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

    // Helper function to find original month ID by matching date range
    // Tries multiple matching strategies to ensure we find the ID
    const findOriginalMonthId = (
      monthStartDate: string,
      monthEndDate: string,
      originalSession: any,
      monthIndex?: number,
    ) => {
      if (!originalSession?.months || !Array.isArray(originalSession.months)) {
        return null;
      }

      const monthStart = dayjs(monthStartDate);
      const monthEnd = dayjs(monthEndDate);

      if (!monthStart.isValid() || !monthEnd.isValid()) {
        return null;
      }

      // Strategy 1: Exact date match
      let matchingMonth = originalSession.months.find((origMonth: any) => {
        if (!origMonth.startDate || !origMonth.endDate) return false;
        const origStart = dayjs(origMonth.startDate);
        const origEnd = dayjs(origMonth.endDate);

        if (!origStart.isValid() || !origEnd.isValid()) return false;

        return (
          origStart.format('YYYY-MM-DD') === monthStart.format('YYYY-MM-DD') &&
          origEnd.format('YYYY-MM-DD') === monthEnd.format('YYYY-MM-DD')
        );
      });

      // Strategy 2: Match by index if exact match fails
      if (
        !matchingMonth &&
        monthIndex !== undefined &&
        originalSession.months[monthIndex]
      ) {
        matchingMonth = originalSession.months[monthIndex];
      }

      // Strategy 3: Match by overlapping date range (more flexible)
      if (!matchingMonth) {
        matchingMonth = originalSession.months.find((origMonth: any) => {
          if (!origMonth.startDate || !origMonth.endDate) return false;
          const origStart = dayjs(origMonth.startDate);
          const origEnd = dayjs(origMonth.endDate);

          if (!origStart.isValid() || !origEnd.isValid()) return false;

          // Check if dates overlap (within 1 day tolerance)
          return (
            (monthStart.isSameOrAfter(origStart, 'day') &&
              monthStart.isSameOrBefore(origEnd, 'day')) ||
            (monthEnd.isSameOrAfter(origStart, 'day') &&
              monthEnd.isSameOrBefore(origEnd, 'day')) ||
            (monthStart.isSameOrBefore(origStart, 'day') &&
              monthEnd.isSameOrAfter(origEnd, 'day'))
          );
        });
      }

      return matchingMonth?.id || null;
    };

    // Helper function to match months to a session based on date ranges
    // A month belongs to a session if its start date falls within the session's date range
    const getMonthsForSession = (
      sessionStart: string,
      sessionEnd: string,
      originalSession: any,
    ) => {
      if (!sessionStart || !sessionEnd) return [];

      const sessionStartDate = dayjs(sessionStart);
      const sessionEndDate = dayjs(sessionEnd);

      if (!sessionStartDate.isValid() || !sessionEndDate.isValid()) {
        return [];
      }

      return allMonths
        .map((month, monthIndex) => {
          if (!month.startDate || !month.endDate) return null;

          // Create a unique key for this month to track assignments
          const monthKey = `${month.startDate}-${month.endDate}`;

          // Skip if this month has already been assigned to another session
          if (assignedMonthKeys.has(monthKey)) {
            return null;
          }

          const monthStart = dayjs(month.startDate);

          if (!monthStart.isValid()) {
            return null;
          }

          // A month belongs to a session if its start date falls within the session's date range
          // Month must start on or after session start, and BEFORE session end (not on or before the end date)
          // If a month starts exactly when a session ends, it belongs to the next session
          // This prevents months from being assigned to multiple sessions
          const belongsToSession =
            monthStart.isSameOrAfter(sessionStartDate, 'day') &&
            monthStart.isBefore(sessionEndDate, 'day');

          if (belongsToSession) {
            // Mark this month as assigned
            assignedMonthKeys.add(monthKey);

            // Find original month ID if in edit mode - try multiple strategies
            let originalMonthId = null;
            if (isEditMode && originalSession) {
              // Try with index first (most reliable)
              originalMonthId = findOriginalMonthId(
                month.startDate,
                month.endDate,
                originalSession,
                monthIndex,
              );
              // If still no match, try without index (uses other strategies)
              if (!originalMonthId) {
                originalMonthId = findOriginalMonthId(
                  month.startDate,
                  month.endDate,
                  originalSession,
                );
              }
            }

            return {
              ...month,
              ...(originalMonthId ? { id: originalMonthId } : {}),
            };
          }

          return null;
        })
        .filter((month) => month !== null);
    };

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

          const sessionStartStr = startDate
            ? dayjs(startDate).format('YYYY-MM-DD')
            : '';
          const sessionEndStr = endDate
            ? dayjs(endDate).format('YYYY-MM-DD')
            : '';

          // Get the original session from selectedFiscalYear (if in edit mode)
          const originalSession =
            isEditMode && selectedFiscalYear?.sessions?.[index];

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
            const fallbackSessionStart = dayjs(sessionStartStr);
            const fallbackSessionEnd = dayjs(sessionEndStr);

            // Only use unassigned months for slicing fallback
            const unassignedMonths = allMonths.filter((m) => {
              const key = `${m.startDate}-${m.endDate}`;
              if (assignedMonthKeys.has(key)) return false;

              // Verify the month actually belongs to this session
              const mStart = dayjs(m.startDate);
              if (
                !mStart.isValid() ||
                !fallbackSessionStart.isValid() ||
                !fallbackSessionEnd.isValid()
              )
                return false;
              return (
                mStart.isSameOrAfter(fallbackSessionStart, 'day') &&
                mStart.isBefore(fallbackSessionEnd, 'day')
              );
            });
            const slicedMonths = unassignedMonths.slice(0, 3);

            // Add IDs for sliced months if in edit mode
            sessionMonths = slicedMonths.map((month, monthIdx) => {
              const monthKey = `${month.startDate}-${month.endDate}`;
              assignedMonthKeys.add(monthKey);

              // Find original month ID if in edit mode - try multiple strategies
              let originalMonthId = null;
              if (isEditMode && originalSession) {
                // Try with index first (most reliable)
                originalMonthId = findOriginalMonthId(
                  month.startDate,
                  month.endDate,
                  originalSession,
                  monthIdx,
                );
                // If still no match, try without index (uses other strategies)
                if (!originalMonthId) {
                  originalMonthId = findOriginalMonthId(
                    month.startDate,
                    month.endDate,
                    originalSession,
                  );
                }
              }

              return {
                ...month,
                ...(originalMonthId ? { id: originalMonthId } : {}),
              };
            });
          }

          return {
            ...(isEditMode && originalSession?.id
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

          const sessionStartStr = startDate
            ? dayjs(startDate).format('YYYY-MM-DD')
            : '';
          const sessionEndStr = endDate
            ? dayjs(endDate).format('YYYY-MM-DD')
            : '';

          // Get the original session from selectedFiscalYear (if in edit mode)
          const originalSession =
            isEditMode && selectedFiscalYear?.sessions?.[index];

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
            const fallbackSessionStart = dayjs(sessionStartStr);
            const fallbackSessionEnd = dayjs(sessionEndStr);

            // Only use unassigned months for slicing fallback
            const unassignedMonths = allMonths.filter((m) => {
              const key = `${m.startDate}-${m.endDate}`;
              if (assignedMonthKeys.has(key)) return false;

              // Verify the month actually belongs to this session
              const mStart = dayjs(m.startDate);
              if (
                !mStart.isValid() ||
                !fallbackSessionStart.isValid() ||
                !fallbackSessionEnd.isValid()
              )
                return false;
              return (
                mStart.isSameOrAfter(fallbackSessionStart, 'day') &&
                mStart.isBefore(fallbackSessionEnd, 'day')
              );
            });
            const slicedMonths = unassignedMonths.slice(0, 6);

            // Add IDs for sliced months if in edit mode
            sessionMonths = slicedMonths.map((month, monthIdx) => {
              const monthKey = `${month.startDate}-${month.endDate}`;
              assignedMonthKeys.add(monthKey);

              // Find original month ID if in edit mode - try multiple strategies
              let originalMonthId = null;
              if (isEditMode && originalSession) {
                // Try with index first (most reliable)
                originalMonthId = findOriginalMonthId(
                  month.startDate,
                  month.endDate,
                  originalSession,
                  monthIdx,
                );
                // If still no match, try without index (uses other strategies)
                if (!originalMonthId) {
                  originalMonthId = findOriginalMonthId(
                    month.startDate,
                    month.endDate,
                    originalSession,
                  );
                }
              }

              return {
                ...month,
                ...(originalMonthId ? { id: originalMonthId } : {}),
              };
            });
          }

          return {
            ...(isEditMode && originalSession?.id
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

          const sessionStartStr = startDate
            ? dayjs(startDate).format('YYYY-MM-DD')
            : '';
          const sessionEndStr = endDate
            ? dayjs(endDate).format('YYYY-MM-DD')
            : '';

          // Get the original session from selectedFiscalYear (if in edit mode)
          const originalSession =
            isEditMode && selectedFiscalYear?.sessions?.[0];

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

              // Find original month ID if in edit mode - try multiple strategies
              let originalMonthId = null;
              if (isEditMode && originalSession) {
                // Try with index first (most reliable)
                originalMonthId = findOriginalMonthId(
                  month.startDate,
                  month.endDate,
                  originalSession,
                  monthIdx,
                );
                // If still no match, try without index (uses other strategies)
                if (!originalMonthId) {
                  originalMonthId = findOriginalMonthId(
                    month.startDate,
                    month.endDate,
                    originalSession,
                  );
                }
              }

              return {
                ...month,
                ...(originalMonthId ? { id: originalMonthId } : {}),
              };
            });
          }

          return {
            ...(isEditMode && originalSession?.id
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
    const latestSessionValues =
      sessionFormValues?.sessionData?.length > 0
        ? sessionFormValues
        : { sessionData: useFiscalYearDrawerStore.getState().sessionData };

    const fiscalYearData = getTransformedFiscalYear(
      monthFormValues,
      latestSessionValues,
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
        const sessionStart = session?.startDate
          ? dayjs(session.startDate)
          : null;
        const sessionEnd = session?.endDate ? dayjs(session.endDate) : null;
        const isSessionActive =
          sessionStart &&
          sessionEnd &&
          now.isBetween(sessionStart, sessionEnd, null, '[]');

        // Get the original session from selectedFiscalYear (if in edit mode)
        const originalSession =
          isEditMode && selectedFiscalYear?.sessions?.[sessionIdx];

        // Helper function to find month ID if missing
        const findMonthId = (month: Month, monthIdx: number) => {
          // If month already has ID, use it
          if (month.id) return month.id;

          // If not in edit mode or no original session, return null
          if (!isEditMode || !originalSession?.months) return null;

          const monthStart = dayjs(month.startDate);
          const monthEnd = dayjs(month.endDate);

          if (!monthStart.isValid() || !monthEnd.isValid()) return null;

          // Strategy 1: Match by index
          if (originalSession.months[monthIdx]?.id) {
            return originalSession.months[monthIdx].id;
          }

          // Strategy 2: Match by exact date
          const exactMatch = originalSession.months.find((origMonth: any) => {
            if (!origMonth.startDate || !origMonth.endDate) return false;
            const origStart = dayjs(origMonth.startDate);
            const origEnd = dayjs(origMonth.endDate);
            return (
              origStart.format('YYYY-MM-DD') ===
                monthStart.format('YYYY-MM-DD') &&
              origEnd.format('YYYY-MM-DD') === monthEnd.format('YYYY-MM-DD')
            );
          });
          if (exactMatch?.id) return exactMatch.id;

          // Strategy 3: Match by overlapping dates
          const overlapMatch = originalSession.months.find((origMonth: any) => {
            if (!origMonth.startDate || !origMonth.endDate) return false;
            const origStart = dayjs(origMonth.startDate);
            const origEnd = dayjs(origMonth.endDate);
            return (
              (monthStart.isSameOrAfter(origStart, 'day') &&
                monthStart.isSameOrBefore(origEnd, 'day')) ||
              (monthEnd.isSameOrAfter(origStart, 'day') &&
                monthEnd.isSameOrBefore(origEnd, 'day'))
            );
          });
          return overlapMatch?.id || null;
        };

        // Sessions from getTransformedFiscalYear already have IDs included
        // Just add the active property and ensure dates are formatted
        // Ensure months is always an array
        const sessionMonths = Array.isArray(session?.months)
          ? session.months
          : [];

        return {
          ...(session.id ? { id: session.id } : {}),
          name: session?.name,
          description: session?.description,
          startDate: session?.startDate
            ? dayjs(session.startDate).format('YYYY-MM-DD')
            : undefined,
          endDate: session?.endDate
            ? dayjs(session.endDate).format('YYYY-MM-DD')
            : undefined,
          active: !!isSessionActive,
          months: sessionMonths.map((month: Month, monthIdx: number) => {
            const monthStart = month?.startDate ? dayjs(month.startDate) : null;
            const monthEnd = month?.endDate ? dayjs(month.endDate) : null;
            const isMonthActive =
              monthStart &&
              monthEnd &&
              now.isBetween(monthStart, monthEnd, null, '[]');

            // Try to find month ID if missing
            const monthId = month.id || findMonthId(month, monthIdx);

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
      {formContent}
    </Modal>
  );
};

export default CustomWorFiscalYearDrawer;
