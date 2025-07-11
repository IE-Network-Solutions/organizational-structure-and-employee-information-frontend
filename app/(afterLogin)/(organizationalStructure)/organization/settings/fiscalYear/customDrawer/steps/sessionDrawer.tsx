import React, { useEffect, useCallback, useState, useRef } from 'react';
import { Button, Col, DatePicker, Form, Input, Row, Spin, Popover } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { FormInstance } from 'antd/lib';
import dayjs from 'dayjs';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import { useIsMobile } from '@/hooks/useIsMobile';

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
        form.setFieldsValue({ sessionData: newSessionData });
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
      <div className="px-3 sm:px-0" key={index}>
        <Form.Item
          name={['sessionData', index, 'sessionName']}
          label={<span className="font-medium">Session {index + 1} Name</span>}
          rules={[
            { required: true, message: 'Please input the session name!' },
          ]}
        >
          <Input
            size="large"
            className="w-full font-normal text-sm"
            placeholder="Enter session name"
          />
        </Form.Item>

        <Row gutter={[16, 6]} className="mb-4">
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item
              name={['sessionData', index, 'sessionStartDate']}
              label={`Session ${index + 1} Start Date`}
              rules={[
                {
                  required: true,
                  message: 'Please input the session Start Date!',
                },
                { validator: validateSessionStartDate },
              ]}
            >
              <DatePicker format="YYYY-MM-DD" className="w-full" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item
              name={['sessionData', index, 'sessionEndDate']}
              label={`Session ${index + 1} End Date`}
              rules={[
                {
                  required: true,
                  message: 'Please input the session End Date!',
                },
                { validator: validateSessionEndDate },
              ]}
            >
              <DatePicker format="YYYY-MM-DD" className="w-full" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name={['sessionData', index, 'sessionDescription']}
          label={<span className="font-medium">Description</span>}
        >
          <TextArea
            placeholder="Enter description"
            rows={2}
            className="h-32 font-normal text-sm mt-2"
            size="large"
          />
        </Form.Item>
      </div>
    ),
    [handleSessionChange, validateSessionStartDate, validateSessionEndDate],
  );

  return (
    <div className="flex-1 bg-white p-0 items-center w-full h-full">
      <div className="flex justify-start items-center gap-2 font-bold text-2xl text-black my-2 px-2">
        Set up Session
      </div>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={(nonused, allValues) => {
          setSessionData(allValues.sessionData);
        }}
        onFieldsChange={updateErrorState}
      >
        {sessionData.map((session, index) => renderSessionForm(session, index))}

        <Form.Item className="mb-0">
          <div
            className={`flex justify-center pt-3 pb-3 sm:p-2 space-x-5 ${
              isMobile ? 'shadow-[10px_20px_50px_0px_#00000033]' : 'shadow-none'
            }`}
          >
            <Button
              type="default"
              onClick={handlePrevious}
              className="flex justify-center text-sm font-medium p-4 px-10 h-10"
            >
              Previous
            </Button>
            <Popover
              content={hasErrors && firstErrorMsg ? firstErrorMsg : ''}
              trigger={hasErrors ? 'hover' : undefined}
              placement="top"
            >
              <span>
                <Button
                  type="primary"
                  onClick={handleNext}
                  className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-10 border-none"
                  disabled={hasErrors}
                >
                  {isCreateLoading || isUpdateLoading ? (
                    <Spin />
                  ) : (
                    <span>Next</span>
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
