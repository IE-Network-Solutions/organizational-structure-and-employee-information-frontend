import React, { useEffect, useCallback, useState, useRef } from 'react';
import { Button, Col, DatePicker, Form, Input, Row, Spin, Popover } from 'antd';
import { FormInstance } from 'antd/lib';
import dayjs from 'dayjs';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import { useIsMobile } from '@/hooks/useIsMobile';

const { RangePicker } = DatePicker;

interface SessionDrawerProps {
  form: FormInstance;
  isCreateLoading: boolean;
  isUpdateLoading: boolean;
  isFiscalYear?: boolean;
}

interface SessionData {
  sessionName: string;
  sessionStartDate: dayjs.Dayjs | null;
  sessionEndDate: dayjs.Dayjs | null;
  sessionDescription: string;
}

const SessionDrawer: React.FC<SessionDrawerProps> = ({
  form,
  isCreateLoading,
  isUpdateLoading,
}) => {
  const { isMobile } = useIsMobile();
  // Ref to track last processed fiscal year dates to avoid infinite loops
  const lastProcessedFiscalYearRef = useRef<{
    start: string | null;
    end: string | null;
  }>({ start: null, end: null });

  const {
    calendarType,
    setCurrent,
    fiscalYearEnd,
    fiscalYearStart,
    setSessionFormValues,
    isEditMode,
    selectedFiscalYear,
    sessionData,
    setSessionData,
  } = useFiscalYearDrawerStore();

  // State to track form errors
  const [hasErrors, setHasErrors] = useState(false);
  const [firstErrorMsg, setFirstErrorMsg] = useState<string | null>(null);

  // Calculate number of sessions based on calendar type
  const getSessionCount = useCallback(() => {
    switch (calendarType) {
      case 'Quarter':
        return 4;
      case 'Semester':
        return 2;
      case 'Year':
        return 1;
      default:
        return 0;
    }
  }, [calendarType]);

  // Generate session data based on fiscal year dates and session count
  const generateSessionData = useCallback((): SessionData[] => {
    if (!fiscalYearStart || !fiscalYearEnd) return [];

    const sessionCount = getSessionCount();
    const sessions: SessionData[] = [];

    if (sessionCount === 0) return sessions;

    const startDate = dayjs(fiscalYearStart);
    const endDate = dayjs(fiscalYearEnd);
    const totalDays = endDate.diff(startDate, 'day');
    const daysPerSession = Math.floor(totalDays / sessionCount);

    for (let i = 0; i < sessionCount; i++) {
      const sessionStartDate =
        i === 0 ? startDate : startDate.add(i * daysPerSession, 'day');
      const sessionEndDate =
        i === sessionCount - 1
          ? endDate
          : startDate.add((i + 1) * daysPerSession - 1, 'day');

      sessions.push({
        sessionName: `Session ${i + 1}`,
        sessionStartDate,
        sessionEndDate,
        sessionDescription: '',
      });
    }

    return sessions;
  }, [fiscalYearStart, fiscalYearEnd, getSessionCount]);

  // Initialize sessions when component mounts or calendar type changes
  useEffect(() => {
    // Priority 1: Check if fiscal year dates have changed and regenerate
    if (calendarType && fiscalYearStart && fiscalYearEnd) {
      const currentStart = dayjs(fiscalYearStart).format('YYYY-MM-DD');
      const currentEnd = dayjs(fiscalYearEnd).format('YYYY-MM-DD');
      const fyStartChanged =
        lastProcessedFiscalYearRef.current.start !== null &&
        lastProcessedFiscalYearRef.current.start !== currentStart;
      const fyEndChanged =
        lastProcessedFiscalYearRef.current.end !== null &&
        lastProcessedFiscalYearRef.current.end !== currentEnd;

      if (
        fyStartChanged ||
        fyEndChanged ||
        lastProcessedFiscalYearRef.current.start === null ||
        lastProcessedFiscalYearRef.current.end === null
      ) {
        const newSessionData = generateSessionData();
        setSessionData(newSessionData);
        // Set form values including date ranges
        const formValues = newSessionData.map((session) => ({
          ...session,
          sessionDateRange:
            session.sessionStartDate && session.sessionEndDate
              ? [session.sessionStartDate, session.sessionEndDate]
              : null,
        }));
        form.setFieldsValue({ sessionData: formValues });
        form.validateFields();

        // Update the ref to track the processed dates
        lastProcessedFiscalYearRef.current = {
          start: currentStart,
          end: currentEnd,
        };

        setSessionFormValues({
          sessionData: newSessionData,
          fiscalYearStart,
          fiscalYearEnd,
          lastGeneratedFiscalYearStart: fiscalYearStart,
          lastGeneratedFiscalYearEnd: fiscalYearEnd,
        });
      }
    }
    // Priority 2: Edit mode with API data
    else if (isEditMode && selectedFiscalYear && selectedFiscalYear.sessions) {
      const sessions = selectedFiscalYear.sessions;
      const updatedSessionData = sessions.map((session: any) => ({
        id: session?.id,
        sessionName: session.name || '',
        sessionStartDate: session.startDate ? dayjs(session.startDate) : null,
        sessionEndDate: session.endDate ? dayjs(session.endDate) : null,
        sessionDescription: session.description || '',
        sessionDateRange:
          session.startDate && session.endDate
            ? [dayjs(session.startDate), dayjs(session.endDate)]
            : null,
      }));
      setSessionData(updatedSessionData);
      form.setFieldsValue({ sessionData: updatedSessionData });
      form.validateFields();

      // Update the ref to track the processed dates
      lastProcessedFiscalYearRef.current = {
        start: fiscalYearStart
          ? dayjs(fiscalYearStart).format('YYYY-MM-DD')
          : null,
        end: fiscalYearEnd ? dayjs(fiscalYearEnd).format('YYYY-MM-DD') : null,
      };

      setSessionFormValues({
        sessionData: updatedSessionData,
        fiscalYearStart,
        fiscalYearEnd,
        lastGeneratedFiscalYearStart: fiscalYearStart,
        lastGeneratedFiscalYearEnd: fiscalYearEnd,
      });
    }
    // Priority 3: Reset session data when missing required data
    else if (!calendarType || !fiscalYearStart || !fiscalYearEnd) {
      setSessionData([]);
      form.setFieldsValue({ sessionData: [] });
      form.validateFields();
    }
  }, [
    calendarType,
    fiscalYearStart,
    fiscalYearEnd,
    isEditMode,
    selectedFiscalYear,
    form,
    setSessionData,
    generateSessionData,
    setSessionFormValues,
  ]);

  // Session validation function
  const validateSessionStartDate = useCallback(
    (rule: any, value: any) => {
      if (!value) return Promise.resolve();

      const fieldName = rule.field;
      const sessionIndex = parseInt(fieldName.match(/\d+/)?.[0] || '0');
      const currentSession = sessionData[sessionIndex];
      if (!currentSession) return Promise.resolve();

      const startDate = value;
      const endDate = currentSession.sessionEndDate;

      // Start date after end date
      if (startDate && endDate && dayjs(startDate).isAfter(dayjs(endDate))) {
        return Promise.reject(
          new Error('Start date cannot be after end date!'),
        );
      }

      // Start date before fiscal year start
      if (
        fiscalYearStart &&
        startDate &&
        dayjs(startDate).isBefore(dayjs(fiscalYearStart), 'day')
      ) {
        return Promise.reject(
          new Error(
            'Session start date cannot be before fiscal year start date!',
          ),
        );
      }

      // Overlap with previous session
      if (sessionIndex > 0) {
        const previousSession = sessionData[sessionIndex - 1];
        if (
          previousSession?.sessionEndDate &&
          (dayjs(startDate).isBefore(dayjs(previousSession.sessionEndDate)) ||
            dayjs(startDate).isSame(
              dayjs(previousSession.sessionEndDate),
              'day',
            ))
        ) {
          return Promise.reject(
            new Error(
              `Session ${sessionIndex + 1} start date cannot overlap with or be equal to the previous session's end date.`,
            ),
          );
        }
      }

      return Promise.resolve();
    },
    [sessionData, fiscalYearStart],
  );

  const validateSessionEndDate = useCallback(
    (rule: any, value: any) => {
      if (!value) return Promise.resolve();

      const fieldName = rule.field;
      const sessionIndex = parseInt(fieldName.match(/\d+/)?.[0] || '0');
      const currentSession = sessionData[sessionIndex];
      if (!currentSession) return Promise.resolve();

      const startDate = currentSession.sessionStartDate;
      const endDate = value;

      // End date before start date
      if (startDate && endDate && dayjs(startDate).isAfter(dayjs(endDate))) {
        return Promise.reject(
          new Error('End date cannot be before start date!'),
        );
      }

      const end = dayjs(endDate);
      const fyEnd = dayjs(fiscalYearEnd);

      if (fyEnd && end && end.isAfter(fyEnd, 'day')) {
        return Promise.reject(
          new Error('Session end date cannot be after fiscal year end date!'),
        );
      }

      // Overlap with next session
      if (sessionIndex < sessionData.length - 1) {
        const nextSession = sessionData[sessionIndex + 1];
        if (
          nextSession?.sessionStartDate &&
          (dayjs(endDate).isAfter(dayjs(nextSession.sessionStartDate)) ||
            dayjs(endDate).isSame(dayjs(nextSession.sessionStartDate), 'day'))
        ) {
          return Promise.reject(
            new Error(
              `Session ${sessionIndex + 1} end date cannot overlap with or be equal to the next session's start date.`,
            ),
          );
        }
      }

      return Promise.resolve();
    },
    [sessionData, fiscalYearEnd],
  );

  // Handle session field changes
  const handleSessionChange = useCallback(
    (index: number, field: keyof SessionData, value: any) => {
      setSessionData((prev: SessionData[]) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          [field]: value,
        };
        // Update form values to keep them in sync
        form.setFieldsValue({ sessionData: updated });

        return updated;
      });
    },
    [setSessionData, form],
  );

  // Handle next step
  const handleNext = useCallback(() => {
    form
      .validateFields()
      .then(() => {
        // Save current session form values before going to next step
        const currentSessionValues = form.getFieldsValue();
        setSessionFormValues({
          ...currentSessionValues,
          fiscalYearStart,
          fiscalYearEnd,
          lastGeneratedFiscalYearStart: fiscalYearStart,
          lastGeneratedFiscalYearEnd: fiscalYearEnd,
        });
        setCurrent(2);
      })
      .catch(() => {
        // Do nothing, errors will be shown by the form
      });
  }, [form, setSessionFormValues, setCurrent, fiscalYearStart, fiscalYearEnd]);

  // Handle previous step
  const handlePrevious = useCallback(() => {
    // Store current session form values before going back
    const currentSessionValues = form.getFieldsValue();
    setSessionFormValues({
      ...currentSessionValues,
      fiscalYearStart,
      fiscalYearEnd,
      lastGeneratedFiscalYearStart: fiscalYearStart,
      lastGeneratedFiscalYearEnd: fiscalYearEnd,
    });
    setCurrent(0);
  }, [form, setSessionFormValues, setCurrent, fiscalYearStart, fiscalYearEnd]);

  // Update error state on form changes
  const updateErrorState = useCallback(() => {
    const fieldsError = form.getFieldsError();
    const errorFields = fieldsError.filter((field) => field.errors.length > 0);
    setHasErrors(errorFields.length > 0);
    setFirstErrorMsg(errorFields.length > 0 ? errorFields[0].errors[0] : null);
  }, [form]);

  useEffect(() => {
    updateErrorState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData]);

  // Render session form items
  const renderSessionForm = useCallback(
    (session: SessionData, index: number) => (
      <div
        key={index}
        className="mb-4"
        data-cy={`org-settings-fiscal-year-session-${index}`}
        id={`org-settings-fiscal-year-session-${index}`}
      >
        <Row gutter={8} align="middle">
          <Col
            span={isMobile ? undefined : 12}
            flex={isMobile ? 'auto' : undefined}
            style={isMobile ? { minWidth: 0 } : undefined}
          >
            <Form.Item
              name={['sessionData', index, 'sessionName']}
              rules={[
                { required: true, message: 'Please input the session name!' },
              ]}
              data-cy={`org-settings-fiscal-year-session-name-${index}`}
              id={`org-settings-fiscal-year-session-name-${index}`}
              className="mb-0"
            >
              <Input
                size="middle"
                className="w-full font-normal text-sm h-8"
                placeholder="Enter session name"
                data-cy={`org-settings-fiscal-year-session-name-input-${index}`}
                id={`org-settings-fiscal-year-session-name-input-${index}`}
              />
            </Form.Item>
          </Col>
          <Col
            span={isMobile ? undefined : 12}
            flex={isMobile ? 'none' : undefined}
          >
            <Form.Item
              name={['sessionData', index, 'sessionDateRange']}
              getValueFromEvent={(dates) => {
                if (dates && dates.length === 2) {
                  handleSessionChange(index, 'sessionStartDate', dates[0]);
                  handleSessionChange(index, 'sessionEndDate', dates[1]);
                  return dates;
                }
                handleSessionChange(index, 'sessionStartDate', null);
                handleSessionChange(index, 'sessionEndDate', null);
                return null;
              }}
              normalize={(value) => {
                // When form values are set programmatically, convert from individual dates to range
                if (!value && sessionData[index]) {
                  const session = sessionData[index];
                  if (session.sessionStartDate && session.sessionEndDate) {
                    return [session.sessionStartDate, session.sessionEndDate];
                  }
                }
                return value;
              }}
              rules={[
                {
                  required: true,
                  message: 'Please select the session date range!',
                },
                {
                  validator: async (unused, value) => {
                    if (!value || !Array.isArray(value) || value.length !== 2) {
                      return Promise.reject(
                        new Error('Please select both start and end dates!'),
                      );
                    }
                    const [startDate, endDate] = value;
                    // Validate start date
                    const startDateError = await validateSessionStartDate(
                      { field: `sessionData.${index}.sessionStartDate` },
                      startDate,
                    ).catch((err) => err);
                    if (startDateError) {
                      return Promise.reject(startDateError);
                    }
                    // Validate end date
                    const endDateError = await validateSessionEndDate(
                      { field: `sessionData.${index}.sessionEndDate` },
                      endDate,
                    ).catch((err) => err);
                    if (endDateError) {
                      return Promise.reject(endDateError);
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              data-cy={`org-settings-fiscal-year-session-date-range-${index}`}
              id={`org-settings-fiscal-year-session-date-range-${index}`}
              className="mb-0"
            >
              <RangePicker
                size="middle"
                format="YYYY-MM-DD"
                className={
                  isMobile
                    ? 'h-10 w-11 min-w-11 px-0 justify-center [&_.ant-picker-input]:hidden [&_.ant-picker-range-separator]:hidden [&_.ant-picker-active-bar]:hidden [&_.ant-picker-suffix]:m-0'
                    : 'w-full h-8 [&_.ant-picker-input]:h-8'
                }
                data-cy={`org-settings-fiscal-year-session-date-range-input-${index}`}
                id={`org-settings-fiscal-year-session-date-range-input-${index}`}
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
    ),
    [validateSessionStartDate, validateSessionEndDate],
  );

  return (
    <div
      className="flex-1 bg-white p-0 items-center w-full h-full"
      data-cy="org-settings-fiscal-year-session-drawer-container"
      id="org-settings-fiscal-year-session-drawer-container"
    >
      <div
        className="px-0 -mt-2"
        data-cy="org-settings-fiscal-year-session-drawer-description-container"
      >
        <p
          className="text-sm text-[rgba(0,0,0,0.45)] mb-4"
          data-cy="org-settings-fiscal-year-session-drawer-description"
        >
          {calendarType === 'Semester' &&
            'For Biannually Selections Fiscal Year months must be separated between 6 months for each session. You can change the fiscal year any time you wish with in the system.'}
          {calendarType === 'Quarter' &&
            'For Quarterly Selections Fiscal Year months must be separated between 3 months for each session. You can change the fiscal year any time you wish with in the system.'}
          {calendarType === 'Year' &&
            'For Yearly Selections Fiscal Year months will be divided throughout 12 months. You can change the fiscal year any time you wish with in the system.'}
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={(label, { required }) => (
          <>
            <span data-cy="org-settings-fiscal-year-session-drawer-form-label">
              {label}
            </span>
            {required && (
              <span
                className="text-red-500 ml-1"
                data-cy="org-settings-fiscal-year-session-drawer-form-required-astrix"
              >
                *
              </span>
            )}
          </>
        )}
        onValuesChange={(nonused, allValues) => {
          setSessionData(allValues.sessionData);
        }}
        onFieldsChange={updateErrorState}
        data-cy="org-settings-fiscal-year-session-drawer-form"
        id="org-settings-fiscal-year-session-drawer-form"
        className="px-0"
      >
        <div
          className="px-2 py-1 border border-gray-200 rounded-lg"
          data-cy="org-settings-fiscal-year-session-drawer-sessions-container"
        >
          <h3
            className="font-bold text-base mb-4"
            data-cy="org-settings-fiscal-year-session-drawer-sessions-title"
          >
            Sessions
          </h3>
          {sessionData.map((session, index) =>
            renderSessionForm(session, index),
          )}
        </div>

        <Form.Item
          className="mb-0 mt-4"
          data-cy="org-settings-fiscal-year-session-previous-btn-form-item"
          id="org-settings-fiscal-year-session-previous-btn-form-item"
        >
          <div
            className={`flex justify-end w-full pt-2 pb-0  gap-3 shadow-none`}
            data-cy="org-settings-fiscal-year-session-previous-btn-container"
            id="org-settings-fiscal-year-session-previous-btn-container"
          >
            <Button
              type="default"
              onClick={handlePrevious}
              className="flex justify-center text-sm font-normal h-8 !min-h-[32px] px-6 border-gray-300 bg-transparent hover:bg-gray-50"
              data-cy="org-settings-fiscal-year-session-previous-btn"
              id="org-settings-fiscal-year-session-previous-btn"
            >
              Reset
            </Button>
            <Popover
              content={hasErrors && firstErrorMsg ? firstErrorMsg : ''}
              trigger={hasErrors ? 'hover' : undefined}
              placement="top"
              data-cy="org-settings-fiscal-year-session-next-btn-popover"
              id="org-settings-fiscal-year-session-next-btn-popover"
            >
              <span
                data-cy="org-fiscalyear-customdrawer-steps-sessiondrawer-span-3"
                id="org-fiscalyear-customdrawer-steps-sessiondrawer-span-3"
              >
                <Button
                  type="primary"
                  onClick={handleNext}
                  className="flex justify-center text-sm font-normal h-8 !min-h-[32px] px-6 min-w-[100px]"
                  disabled={hasErrors}
                  data-cy="org-settings-fiscal-year-session-next-btn"
                  id="org-settings-fiscal-year-session-next-btn"
                >
                  {isCreateLoading || isUpdateLoading ? (
                    <Spin data-cy="org-settings-fiscal-year-session-next-btn-spinner" />
                  ) : (
                    <span
                      data-cy="org-settings-fiscal-year-session-next-btn-text"
                      id="org-settings-fiscal-year-session-next-btn-text"
                    >
                      Next
                    </span>
                  )}
                </Button>
              </span>
            </Popover>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SessionDrawer;
