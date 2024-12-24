import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import { useSessionStore } from '@/store/uistate/features/organizationStructure/session';
import { Button, Col, DatePicker, Form, Input, Row, Spin } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { FormInstance } from 'antd/lib';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { generateSessionData } from '../sessionIdentifier';

interface SessionDrawerProps {
  form: FormInstance;
  isCreateLoading: boolean;
  isUpdateLoading: boolean;
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
    const updatedSessionData = sessionData.map((session: any) => ({
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
        sessions.length === 4
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
    <div className="flex-1 bg-gray-50 p-4 md:p-8 lg:p-12 rounded-lg my-4 md:my-8 items-center w-full h-full">
      <div className="flex justify-start items-center gap-2 font-bold text-2xl text-black my-4">
        Set up Session
      </div>
      <Form form={form} layout="vertical">
        {sessionData.map((item, index) => {
          return (
            <div className="my-3" key={index}>
              <Form.Item
                id={`sessionNameId_${index}`}
                name={['sessionData', index, 'sessionName']}
                initialValue={item.sessionName}
                label={
                  <span className="font-medium">Session {index + 1} Name</span>
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
                      onChange={(date) => {
                        handleSessionChange(
                          index,
                          'sessionStartDate',
                          date.format('YYYY-MM-DD'),
                        );
                      }}
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
                      onChange={(date) => {
                        handleSessionChange(
                          index,
                          'sessionEndDate',

                          date.format('YYYY-MM-DD'),
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                id={`sessionDescriptionId_${index}`}
                name={['sessionData', index, 'sessionDescription']}
                label={<span className="font-medium">Description</span>}
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
                />
              </Form.Item>
            </div>
          );
        })}

        <Form.Item>
          <div className="flex justify-center w-full px-6 py-6 gap-8">
            <Button
              onClick={() => setCurrent(0)}
              className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-12 hover:border-gray-500 border-gray-300"
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-12 border-none"
            >
              {isCreateLoading || isUpdateLoading ? (
                <Spin />
              ) : sessionId ? (
                <span>Edit</span>
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
