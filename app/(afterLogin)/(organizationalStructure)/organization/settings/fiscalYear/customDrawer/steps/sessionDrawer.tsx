import React, { useCallback, useState } from 'react';
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
  onNavigateToStep: (step: number, options?: { sync?: boolean }) => void;
}

const SessionDrawer: React.FC<SessionDrawerProps> = ({
  form,
  isCreateLoading,
  isUpdateLoading,
  onNavigateToStep,
}) => {
  const { isMobile } = useIsMobile();
  const {
    fiscalYearEnd,
    fiscalYearStart,
    isEditMode,
    sessionData,
    updateSessionFields,
  } = useFiscalYearDrawerStore();

  const [hasErrors, setHasErrors] = useState(false);
  const [firstErrorMsg, setFirstErrorMsg] = useState<string | null>(null);

  const updateErrorState = useCallback(() => {
    const fieldsError = form.getFieldsError();
    const errorFields = fieldsError.filter((field) => field.errors.length > 0);
    setHasErrors(errorFields.length > 0);
    setFirstErrorMsg(errorFields.length > 0 ? errorFields[0].errors[0] : null);
  }, [form]);

  const validateSessionStartDate = useCallback(
    (rule: any, value: any) => {
      if (!value) return Promise.resolve();

      const sessionIndex = parseInt(rule.field.match(/\d+/)?.[0] || '0');
      const rows = Array.isArray(sessionData) ? sessionData : [];
      const currentSession = rows[sessionIndex];
      if (!currentSession) return Promise.resolve();

      const startDate = value;
      const endDate = currentSession.sessionEndDate;

      if (startDate && endDate && dayjs(startDate).isAfter(dayjs(endDate))) {
        return Promise.reject(
          new Error('Start date cannot be after end date!'),
        );
      }

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

      if (sessionIndex > 0) {
        const previousSession = rows[sessionIndex - 1];
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

      const sessionIndex = parseInt(rule.field.match(/\d+/)?.[0] || '0');
      const rows = Array.isArray(sessionData) ? sessionData : [];
      const currentSession = rows[sessionIndex];
      if (!currentSession) return Promise.resolve();

      const startDate = currentSession.sessionStartDate;
      const endDate = value;

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

      if (sessionIndex < rows.length - 1) {
        const nextSession = rows[sessionIndex + 1];
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

  const handleSessionChange = useCallback(
    (index: number, field: string, value: any) => {
      const rows = Array.isArray(sessionData) ? [...sessionData] : [];
      rows[index] = {
        ...rows[index],
        [field]: value,
      };
      form.setFieldsValue({ sessionData: rows });
      updateSessionFields(form.getFieldsValue());
    },
    [sessionData, form, updateSessionFields],
  );

  const handleNext = useCallback(() => {
    form
      .validateFields()
      .then(() => {
        updateSessionFields(form.getFieldsValue());
        onNavigateToStep(2);
      })
      .catch(() => undefined);
  }, [form, updateSessionFields, onNavigateToStep]);

  const handlePrevious = useCallback(() => {
    updateSessionFields(form.getFieldsValue());
    onNavigateToStep(0, { sync: false });
  }, [form, updateSessionFields, onNavigateToStep]);

  const renderSessionForm = (session: any, index: number) => (
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
          style={isMobile ? { minWidth: 0 } : undefined}
        >
          <Form.Item
            name={['sessionData', index, 'sessionDateRange']}
            rules={[
              { required: true, message: 'Please select session dates!' },
            ]}
            data-cy={`org-settings-fiscal-year-session-date-range-${index}`}
            id={`org-settings-fiscal-year-session-date-range-${index}`}
            className="mb-0"
            getValueFromEvent={(value) => {
              if (value && value.length === 2) {
                handleSessionChange(index, 'sessionStartDate', value[0]);
                handleSessionChange(index, 'sessionEndDate', value[1]);
              }
              return value;
            }}
            getValueProps={(value) => {
              if (!value && sessionData[index]) {
                const session = sessionData[index];
                if (session.sessionStartDate && session.sessionEndDate) {
                  return {
                    value: [session.sessionStartDate, session.sessionEndDate],
                  };
                }
              }
              return { value };
            }}
          >
            <RangePicker
              size="middle"
              className="w-full font-normal text-sm h-8"
              data-cy={`org-settings-fiscal-year-session-date-range-picker-${index}`}
              id={`org-settings-fiscal-year-session-date-range-picker-${index}`}
              onChange={(dates) => {
                if (dates && dates.length === 2) {
                  form.validateFields([
                    { field: `sessionData.${index}.sessionStartDate` },
                    { field: `sessionData.${index}.sessionEndDate` },
                  ]);
                }
              }}
            />
          </Form.Item>
          <Form.Item
            name={['sessionData', index, 'sessionStartDate']}
            hidden
            rules={[{ validator: validateSessionStartDate }]}
          />
          <Form.Item
            name={['sessionData', index, 'sessionEndDate']}
            hidden
            rules={[{ validator: validateSessionEndDate }]}
          />
        </Col>
      </Row>
    </div>
  );

  return (
    <div
      className="flex flex-col"
      data-cy="org-settings-fiscal-year-session-drawer-container"
      id="org-settings-fiscal-year-session-drawer-container"
    >
      <div
        className="flex items-center justify-center py-8"
        data-cy="org-settings-fiscal-year-session-drawer-loading"
        style={{
          display: isCreateLoading || isUpdateLoading ? 'flex' : 'none',
        }}
      >
        <Spin size="large" />
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
          updateSessionFields(allValues);
          updateErrorState();
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
          {Array.isArray(sessionData) &&
            sessionData.map((session, index) =>
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
                  disabled={hasErrors}
                  className="flex justify-center text-sm font-normal h-8 !min-h-[32px] px-6"
                  data-cy="org-settings-fiscal-year-session-next-btn"
                  id="org-settings-fiscal-year-session-next-btn"
                >
                  {isEditMode ? 'Continue' : 'Continue'}
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
