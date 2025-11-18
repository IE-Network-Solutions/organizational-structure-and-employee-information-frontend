import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import { useSessionStore } from '@/store/uistate/features/organizationStructure/session';
import { Button, Col, DatePicker, Form, Input, Row, Spin } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { FormInstance } from 'antd/lib';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { generateSessionData } from '../sessionIdentifier';
import { useIsMobile } from '@/hooks/useIsMobile';

interface SessionDrawerProps {
  form: FormInstance;
  isCreateLoading: boolean;
  isUpdateLoading: boolean;
  isFiscalYear?: boolean;
}

const SessionDrawer: React.FC<SessionDrawerProps> = ({
  form,
  isCreateLoading,
  isUpdateLoading,
}) => {
  const { sessionId } = useSessionStore();
  const {
    calendarType,
    setCurrent,
    fiscalYearEnd,
    fiscalYearStart,
    setSessionFormValues,
    isEditMode,
    selectedFiscalYear,
    setCalendarType,
  } = useFiscalYearDrawerStore();

  const getNumberOfSessionsCalenderType = () => {
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
  };

  const [sessionData, setSessionData] = useState(
    generateSessionData(
      fiscalYearStart,
      fiscalYearEnd,
      getNumberOfSessionsCalenderType(),
    ),
  );
  const { isMobile } = useIsMobile();

  const validateSessionDates = (rule: any, value: any, callback: any) => {
    const startDate = value;
    const endDate = form.getFieldValue(
      `sessionEndDate_${rule.field.split('_')[1]}`,
    );

    if (startDate && endDate && startDate.isAfter(endDate)) {
      callback('Start date cannot be after end date!');
      return;
    }

    if (
      (fiscalYearStart && startDate.isBefore(dayjs(fiscalYearStart), 'day')) ||
      (fiscalYearEnd && endDate.isAfter(dayjs(fiscalYearEnd), 'day'))
    ) {
      callback(`Session dates must be within the fiscal year range!`);
      return;
    }

    const sessionIndex = rule.field.split('_')[1];
    const previousEndDate = form.getFieldValue(
      `sessionEndDate_${parseInt(sessionIndex) - 1}`,
    );
    if (previousEndDate && startDate.isBefore(previousEndDate)) {
      callback(
        `Session ${sessionIndex} start date cannot overlap with the previous session's end date.`,
      );
      return;
    }

    callback();
  };

  useEffect(() => {
    const updatedSessionData = sessionData?.map((session: any) => ({
      ...session,
      sessionStartDate: session.sessionStartDate
        ? dayjs(session.sessionStartDate)
        : null,
      sessionEndDate: session.sessionEndDate
        ? dayjs(session.sessionEndDate)
        : null,
    }));

    form?.setFieldsValue({
      sessionData: updatedSessionData,
    });
  }, [sessionData, form]);

  const handleSessionChange = (index: number, field: string, value: any) => {
    const updatedSessionData = [...sessionData];
    updatedSessionData[index] = {
      ...updatedSessionData[index],
      [field]: value,
    };
  };

  const handleNext = () => {
    const currentValues = form.getFieldsValue();
    setSessionFormValues(currentValues);
    setCurrent(2);
  };

  useEffect(() => {
    if (isEditMode && selectedFiscalYear) {
      const sessions = selectedFiscalYear?.sessions || [];

      const inferredCalendarType =
        sessions.length >= 4
          ? 'Quarter'
          : sessions.length === 2
            ? 'Semester'
            : sessions.length === 1
              ? 'Year'
              : '';

      setCalendarType(inferredCalendarType);

      let updatedSessionData;

      if (inferredCalendarType === 'Year') {
        updatedSessionData = sessions?.length
          ? [
              {
                sessionName: sessions[0]?.name || '',
                sessionStartDate: sessions[0]?.startDate
                  ? dayjs(sessions[0]?.startDate)
                  : null,
                sessionEndDate: sessions[0]?.endDate
                  ? dayjs(sessions[0]?.endDate)
                  : null,
                sessionDescription: sessions[0]?.description || '',
              },
            ]
          : [];
      } else if (
        inferredCalendarType === 'Semester' ||
        inferredCalendarType === 'Quarter'
      ) {
        updatedSessionData = sessions.map((session: any) => ({
          sessionName: session.name || '',
          sessionStartDate: session.startDate ? dayjs(session.startDate) : null,
          sessionEndDate: session.endDate ? dayjs(session.endDate) : null,
          sessionDescription: session.description || '',
        }));
      } else {
        updatedSessionData = [];
      }

      setSessionData(updatedSessionData);
      if (updatedSessionData && updatedSessionData.length > 0) {
        form.setFieldsValue({
          sessionData: updatedSessionData,
        });
      }
    }
  }, [isEditMode, selectedFiscalYear, form]);

  return (
    <div
      className={`flex-1 {isFiscalYear ? 'bg-white' : 'bg-gray-50'} p-0  items-center w-full h-full`}
      data-cy="org-settings-session-drawer-container"
      id="org-settings-session-drawer-container"
    >
      <div className="flex justify-start items-center gap-2 font-bold text-2xl text-black my-2 px-2" data-cy="org-settings-session-drawer-title" id="org-settings-session-drawer-title">
        Set up Session
      </div>
      <Form form={form} layout="vertical" data-cy="org-settings-session-drawer-form" id="org-settings-session-drawer-form">
        {sessionData?.map((item, index) => {
          return (
            <div className="px-3 sm:px-0" key={index} data-cy={`org-settings-session-drawer-form-item-${index}`} id={`org-settings-session-drawer-form-item-${index}`}>
              <Form.Item
                data-cy={`org-settings-session-drawer-form-item-name-${index}`}
                id={`sessionNameId_${index}`}
                name={['sessionData', index, 'sessionName']}
                initialValue={item.sessionName}
                label={
                  <span className="font-medium" data-cy={`org-settings-session-drawer-form-item-name-label-${index}`} id={`org-settings-session-drawer-form-item-name-label-${index}`}>Session {index + 1} Name</span>
                }
                rules={[
                  { required: true, message: 'Please input the session name!' },
                ]}
              >
                <Input
                  size="large"
                  className="w-full font-normal text-sm"
                  placeholder="Enter session name"
                  onChange={(e) => {
                    handleSessionChange(index, 'sessionName', e.target.value);
                  }}
                  data-cy={`org-settings-session-drawer-form-item-name-input-${index}`}
                  id={`org-settings-session-drawer-form-item-name-input-${index}`}
                />
              </Form.Item>

              <Row gutter={[16, 6]} className="mb-4" data-cy={`org-settings-session-drawer-form-item-dates-${index}`} id={`org-settings-session-drawer-form-item-dates-${index}`}>
                <Col xs={24} sm={24} md={12} lg={12} xl={12} data-cy="org-components-session-sessiondrawer-index-col-1" id="org-components-session-sessiondrawer-index-col-1">
                  <Form.Item
                    name={['sessionData', index, 'sessionStartDate']}
                    label={<span className="font-medium" data-cy={`org-settings-session-drawer-form-item-dates-label-${index}`} id={`org-settings-session-drawer-form-item-dates-label-${index}`}>Session {index + 1} Start Date</span>}
                    rules={[
                      {
                        required: true,
                        message: 'Please input the session Start Date!',
                      },
                      { validator: validateSessionDates },
                    ]}
                    data-cy={`org-settings-session-drawer-form-item-dates-start-${index}`}
                    id={`org-settings-session-drawer-form-item-dates-start-${index}`}
                  >
                    <DatePicker
                      format="YYYY-MM-DD"
                      className="w-full"
                      onChange={(date) => {
                        handleSessionChange(
                          index,
                          'sessionStartDate',
                          date.format('YYYY-MM-DD'),
                        );
                      }}
                      data-cy={`org-settings-session-drawer-form-item-dates-start-input-${index}`}
                      id={`org-settings-session-drawer-form-item-dates-start-input-${index}`}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12} lg={12} xl={12} data-cy="org-components-session-sessiondrawer-index-col-2" id="org-components-session-sessiondrawer-index-col-2">
                  <Form.Item
                    name={['sessionData', index, 'sessionEndDate']}
                    label={<span className="font-medium" data-cy={`org-settings-session-drawer-form-item-dates-label-${index}`} id={`org-settings-session-drawer-form-item-dates-label-${index}`}>Session {index + 1} End Date</span>}
                    rules={[
                      {
                        required: true,
                        message: 'Please input the session End Date!',
                      },
                      { validator: validateSessionDates },
                    ]}
                    data-cy={`org-settings-session-drawer-form-item-dates-end-${index}`}
                    id={`org-settings-session-drawer-form-item-dates-end-${index}`}
                  >
                    <DatePicker
                      format="YYYY-MM-DD"
                      className="w-full"
                      onChange={(date) => {
                        handleSessionChange(
                          index,
                          'sessionEndDate',

                          date.format('YYYY-MM-DD'),
                        );
                      }}
                      data-cy={`org-settings-session-drawer-form-item-dates-end-input-${index}`}
                      id={`org-settings-session-drawer-form-item-dates-end-input-${index}`}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                data-cy={`org-settings-session-drawer-form-item-description-${index}`}
                id={`sessionDescriptionId_${index}`}
                name={['sessionData', index, 'sessionDescription']}
                label={<span className="font-medium" data-cy="org-components-session-sessiondrawer-index-span-1" id="org-components-session-sessiondrawer-index-span-1">Description</span>}
                initialValue={item.sessionDescription}
              >
                <TextArea
                  placeholder="Enter description"
                  rows={2}
                  className="h-32 font-normal text-sm mt-2"
                  size="large"
                  onChange={(e) =>
                    handleSessionChange(
                      index,
                      'sessionDescription',
                      e.target.value,
                    )
                  }
                  data-cy={`org-settings-session-drawer-form-item-description-input-${index}`}
                  id={`org-settings-session-drawer-form-item-description-input-${index}`}
                />
              </Form.Item>
            </div>
          );
        })}

        <Form.Item className="mb-0" data-cy="org-settings-session-drawer-next-btn-form-item" id="org-settings-session-drawer-next-btn-form-item">
          <div
            className={`flex justify-center pt-3 pb-3 sm:p-2 space-x-5 ${isMobile ? 'shadow-[10px_20px_50px_0px_#00000033]' : 'shadow-none'}`}
            data-cy="org-settings-session-drawer-form-item-next-btn-container"
            id="org-settings-session-drawer-form-item-next-btn-container"
          >
            <Button
              type="default"
              onClick={() => setCurrent(0)}
              className="flex justify-center text-sm font-medium p-4 px-10 h-10"
              data-cy="org-settings-session-drawer-form-item-previous-btn"
              id="org-settings-session-drawer-form-item-previous-btn"
            >
              Previous
            </Button>
            <Button
              type="primary"
              onClick={handleNext}
              className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-10 border-none"
              data-cy="org-settings-session-drawer-form-item-next-btn"
              id="org-settings-session-drawer-form-item-next-btn"
            >
              {isCreateLoading || isUpdateLoading ? (
                <Spin data-cy="org-settings-session-drawer-form-item-next-btn-spinner" />
              ) : sessionId ? (
                <span data-cy="org-settings-session-drawer-form-item-next-btn-text" id="org-settings-session-drawer-form-item-next-btn-text">Edit</span>
              ) : (
                <span data-cy="org-settings-session-drawer-form-item-next-btn-text" id="org-settings-session-drawer-form-item-next-btn-text">Next</span>
              )}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SessionDrawer;
