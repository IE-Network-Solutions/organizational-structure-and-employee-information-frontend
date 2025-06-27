import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Button, Col, DatePicker, Form, Input, Row, Spin } from 'antd';
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
    if (isEditMode && selectedFiscalYear) {
      // In edit mode, check if calendar type has changed
      const currentSessionCount = selectedFiscalYear?.sessions?.length || 0;
      const expectedSessionCount = getSessionCount();

      if (
        currentSessionCount !== expectedSessionCount &&
        calendarType &&
        fiscalYearStart &&
        fiscalYearEnd
      ) {
        // Calendar type has changed, regenerate session data
        const newSessionData = generateSessionData();
        setSessionData(newSessionData);
        form.setFieldsValue({ sessionData: newSessionData });
      } else {
        // Load existing session data for edit mode (no calendar type change)
        const sessions = selectedFiscalYear?.sessions || [];
        const updatedSessionData = sessions.map((session: any) => ({
          sessionName: session.name || '',
          sessionStartDate: session.startDate ? dayjs(session.startDate) : null,
          sessionEndDate: session.endDate ? dayjs(session.endDate) : null,
          sessionDescription: session.description || '',
        }));

        setSessionData(updatedSessionData);
        form.setFieldsValue({ sessionData: updatedSessionData });
      }
    } else if (
      !isEditMode &&
      calendarType &&
      fiscalYearStart &&
      fiscalYearEnd
    ) {
      // Generate new session data for create mode only when we have all required data
      const newSessionData = generateSessionData();
      setSessionData(newSessionData);
      form.setFieldsValue({ sessionData: newSessionData });
    } else if (!isEditMode) {
      // Reset session data when in create mode but missing required data
      setSessionData([]);
      form.setFieldsValue({ sessionData: [] });
    }
  }, [
    isEditMode,
    selectedFiscalYear,
    calendarType,
    fiscalYearStart,
    fiscalYearEnd,
    form,
    setSessionData,
    getSessionCount,
  ]);

  // Session validation function
  const validateSessionDates = useCallback(
    (rule: any, value: any) => {
      if (!value) return Promise.resolve();

      const fieldName = rule.field;
      const sessionIndex = parseInt(fieldName.match(/\d+/)?.[0] || '0');
      const isStartDate = fieldName.includes('sessionStartDate');

      const currentSession = sessionData[sessionIndex];
      if (!currentSession) return Promise.resolve();

      const startDate = isStartDate ? value : currentSession.sessionStartDate;
      const endDate = isStartDate ? currentSession.sessionEndDate : value;

      // Check if start date is after end date
      if (startDate && endDate && dayjs(startDate).isAfter(dayjs(endDate))) {
        return Promise.reject(
          new Error('Start date cannot be after end date!'),
        );
      }

      // Check if dates are within fiscal year range
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

      if (
        fiscalYearEnd &&
        endDate &&
        dayjs(endDate).isAfter(dayjs(fiscalYearEnd), 'day')
      ) {
        return Promise.reject(
          new Error('Session end date cannot be after fiscal year end date!'),
        );
      }

      // Check for overlap with previous session
      if (sessionIndex > 0 && isStartDate) {
        const previousSession = sessionData[sessionIndex - 1];
        if (
          previousSession?.sessionEndDate &&
          dayjs(startDate).isBefore(dayjs(previousSession.sessionEndDate))
        ) {
          return Promise.reject(
            new Error(
              `Session ${sessionIndex + 1} start date cannot overlap with the previous session's end date.`,
            ),
          );
        }
      }

      return Promise.resolve();
    },
    [sessionData, fiscalYearStart, fiscalYearEnd],
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
    const currentValues = form.getFieldsValue();
    setSessionFormValues(currentValues);
    setCurrent(2);
  }, [form, setSessionFormValues, setCurrent]);

  // Handle previous step
  const handlePrevious = useCallback(() => {
    // Store current session form values before going back
    const currentSessionValues = form.getFieldsValue();
    setSessionFormValues(currentSessionValues);

    // Go back to fiscal year step while preserving fiscal year data
    setCurrent(0);
  }, [form, setSessionFormValues, setCurrent]);

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
            onChange={(e) =>
              handleSessionChange(index, 'sessionName', e.target.value)
            }
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
                { validator: validateSessionDates },
              ]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                className="w-full"
                onChange={(date) =>
                  handleSessionChange(index, 'sessionStartDate', date)
                }
              />
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
                { validator: validateSessionDates },
              ]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                className="w-full"
                onChange={(date) =>
                  handleSessionChange(index, 'sessionEndDate', date)
                }
              />
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
            onChange={(e) =>
              handleSessionChange(index, 'sessionDescription', e.target.value)
            }
          />
        </Form.Item>
      </div>
    ),
    [handleSessionChange, validateSessionDates],
  );

  return (
    <div className="flex-1 bg-white p-0 items-center w-full h-full">
      <div className="flex justify-start items-center gap-2 font-bold text-2xl text-black my-2 px-2">
        Set up Session
      </div>

      <Form form={form} layout="vertical">
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
            <Button
              type="primary"
              onClick={handleNext}
              className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-10 border-none"
            >
              {isCreateLoading || isUpdateLoading ? (
                <Spin />
              ) : (
                <span>Next</span>
              )}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SessionDrawer;
