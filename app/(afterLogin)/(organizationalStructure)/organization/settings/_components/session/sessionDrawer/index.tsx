import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import { useSessionStore } from '@/store/uistate/features/organizationStructure/session';
import { Button, Col, DatePicker, Form, Input, Row, Spin } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { FormInstance } from 'antd/lib';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';

interface SessionDrawerProps {
  form: FormInstance<any>;
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
    selectedFiscalYear,
    setCurrent,
    fiscalYearEnd,
    fiscalYearStart,
  } = useFiscalYearDrawerStore();
  console.log(fiscalYearStart);

  const year = fiscalYearEnd ? dayjs(fiscalYearEnd).year() : null;

  const getDateRanges = (year: number | null) => {
    if (!year || !fiscalYearStart || !fiscalYearEnd) return [];

    const ranges = [];
    switch (calendarType) {
      case 'Quarter':
        for (let i = 0; i < 4; i++) {
          const start = dayjs(fiscalYearStart).add(i * 3, 'month');
          let end = start.clone().add(3, 'month').subtract(1, 'day');

          if (start.date() > fiscalYearStart.date()) {
            end = end.date(start.date());
          }

          if (start.isAfter(fiscalYearEnd)) break;

          ranges.push({
            start: start.isBefore(fiscalYearStart) ? fiscalYearStart : start,
            end: end.isAfter(fiscalYearEnd) ? fiscalYearEnd : end,
          });
        }
        break;

      case 'Semester':
        ranges.push(
          {
            start: fiscalYearStart,
            end: dayjs(fiscalYearStart)
              .add(5, 'month')
              .date(fiscalYearStart.date())
              .endOf('day'),
          },
          {
            start: dayjs(fiscalYearStart).add(6, 'month'),
            end: fiscalYearEnd,
          },
        );
        break;

      case 'Year':
        ranges.push({ start: fiscalYearStart, end: fiscalYearEnd });
        break;

      default:
        return [];
    }
    return ranges?.map(({ start, end }) => ({
      start: start.isBefore(fiscalYearStart) ? fiscalYearStart : start,
      end: end.isAfter(fiscalYearEnd) ? fiscalYearEnd : end,
    }));
  };

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
    const dateRanges = getDateRanges(year);

    const defaultValues = dateRanges?.reduce(
      (acc: any, range: any, index: number) => ({
        ...acc,
        [`sessionName${index}`]: `Session ${index + 1}`,
        [`sessionStartDate_${index}`]: range?.start,
        [`sessionEndDate_${index}`]: range?.end,
      }),
      {},
    );

    const sessionValues = selectedFiscalYear
      ? selectedFiscalYear.sessions?.reduce(
          (acc: any, session: any, index: number) => ({
            ...acc,
            [`sessionName${index}`]: session?.name,
            [`sessionDescription${index}`]: session?.description,
            [`sessionStartDate_${index}`]: dayjs(session?.startDate),
            [`sessionEndDate_${index}`]: dayjs(session?.endDate),
          }),
          {},
        )
      : defaultValues;

    form?.setFieldsValue(sessionValues);
  }, [
    // selectedFiscalYear,
    calendarType,
    form,
    year,
    fiscalYearStart,
    fiscalYearEnd,
  ]);

  return (
    <div className="flex-1 bg-gray-50 p-4 md:p-8 lg:p-12 rounded-lg my-4 md:my-8 items-center w-full h-full">
      <div className="flex justify-start items-center gap-2 font-bold text-2xl text-black my-4">
        Set up Session
      </div>

      {getDateRanges(year).map((range, index) => {
        return (
          <div className="my-3" key={index}>
            <Form.Item
              id={`sessionNameId_${index}`}
              name={`sessionName${index}`}
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
              />
            </Form.Item>
            <Row gutter={[16, 6]} className="mb-4">
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Form.Item
                  name={`sessionStartDate_${index}`}
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
                    format="DD-MMM-YYYY"
                    className="w-full"
                    value={form?.getFieldValue(`sessionStartDate_${index}`)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Form.Item
                  name={`sessionEndDate_${index}`}
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
                    format="DD-MMM-YYYY"
                    className="w-full"
                    value={form?.getFieldValue(`sessionEndDate_${index}`)}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              id={`sessionDescriptionId_${index}`}
              name={`sessionDescription${index}`}
              label={<span className="font-medium">Description</span>}
            >
              <TextArea
                placeholder="Enter description"
                rows={2}
                className={'h-32 font-normal text-sm mt-2'}
                size="large"
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
            onClick={() => setCurrent(2)}
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
    </div>
  );
};

export default SessionDrawer;
