import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import { Button, Col, DatePicker, Form, Input, Row } from 'antd';
import { FormInstance } from 'antd/lib';
import dayjs from 'dayjs';
import React from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { useIsMobile } from '@/hooks/useIsMobile';

const { RangePicker } = DatePicker;

interface DrawerProps {
  form: FormInstance<any> | undefined;
  isCreateLoading: boolean;
  isUpdateLoading: boolean;
  isFiscalYear?: boolean;
}

const MonthDrawer: React.FC<
  DrawerProps & {
    onSubmit: (values: any) => void;
    onNavigateToStep: (step: number, options?: { sync?: boolean }) => void;
  }
> = ({
  form,
  isCreateLoading,
  isUpdateLoading,
  onSubmit,
  onNavigateToStep,
}) => {
  const { isMobile } = useIsMobile();
  const {
    fiscalYearStart,
    fiscalYearEnd,
    isEditMode,
    monthDataBySession,
    sessionData,
    expandedMonthSession,
    setExpandedMonthSession,
    updateMonthFields,
  } = useFiscalYearDrawerStore();

  const toggleSession = (sessionIndex: number) => {
    setExpandedMonthSession(
      expandedMonthSession === sessionIndex ? null : sessionIndex,
    );
  };

  const validateStartNoOverlap = (
    currentMonthNumber: number,
    form: FormInstance,
  ) => {
    return async (nonused: any, value: any) => {
      if (!value) return;
      const allMonthNumbers = Array.from({ length: 12 }, (nonused, i) => i + 1);
      const currentStart = dayjs(value);
      const currentEndRaw = form.getFieldValue(
        `monthEndDate_${currentMonthNumber}`,
      );
      if (!currentEndRaw) return;

      for (const monthNum of allMonthNumbers) {
        if (monthNum === currentMonthNumber) continue;
        const otherStartRaw = form.getFieldValue(`monthStartDate_${monthNum}`);
        const otherEndRaw = form.getFieldValue(`monthEndDate_${monthNum}`);
        if (!otherStartRaw || !otherEndRaw) continue;
        const otherStart = dayjs(otherStartRaw);
        const otherEnd = dayjs(otherEndRaw);

        // Check if current start date overlaps with other month's range
        const currentStartOverlapsOther =
          currentStart.isSameOrAfter(otherStart) &&
          currentStart.isSameOrBefore(otherEnd);

        if (currentStartOverlapsOther) {
          throw new Error(
            `Start date overlaps with Month ${monthNum} (${otherStart.format('MMM DD')} - ${otherEnd.format('MMM DD')}). Please adjust the start date.`,
          );
        }
      }
    };
  };

  const validateEndNoOverlap = (
    currentMonthNumber: number,
    form: FormInstance,
  ) => {
    return async (nonused: any, value: any) => {
      if (!value) return;
      const allMonthNumbers = Array.from({ length: 12 }, (nonused, i) => i + 1);
      const currentStartRaw = form.getFieldValue(
        `monthStartDate_${currentMonthNumber}`,
      );
      if (!currentStartRaw) return;
      const currentEnd = dayjs(value);

      for (const monthNum of allMonthNumbers) {
        if (monthNum === currentMonthNumber) continue;
        const otherStartRaw = form.getFieldValue(`monthStartDate_${monthNum}`);
        const otherEndRaw = form.getFieldValue(`monthEndDate_${monthNum}`);
        if (!otherStartRaw || !otherEndRaw) continue;
        const otherStart = dayjs(otherStartRaw);
        const otherEnd = dayjs(otherEndRaw);

        // Check if current end date overlaps with other month's range
        const currentEndOverlapsOther =
          currentEnd.isSameOrAfter(otherStart) &&
          currentEnd.isSameOrBefore(otherEnd);

        if (currentEndOverlapsOther) {
          throw new Error(
            `End date overlaps with Month ${monthNum} (${otherStart.format('MMM DD')} - ${otherEnd.format('MMM DD')}). Please adjust the end date.`,
          );
        }
      }
    };
  };

  // Helper function to clear validation errors on potentially affected fields
  const clearRelatedValidationErrors = (changedMonthNumber: number) => {
    if (!form) return;

    const allMonthNumbers = Array.from({ length: 12 }, (nonused, i) => i + 1);

    // Clear validation errors on all other months' date fields
    allMonthNumbers.forEach((monthNum) => {
      if (monthNum !== changedMonthNumber) {
        form.setFields([
          {
            name: `monthStartDate_${monthNum}`,
            errors: [],
          },
          {
            name: `monthEndDate_${monthNum}`,
            errors: [],
          },
        ]);
      }
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark={(label, { required }) => (
        <>
          <span data-cy="org-settings-fiscal-year-month-drawer-form-label">
            {label}
          </span>
          {required && (
            <span
              className="text-red-500 ml-1"
              data-cy="org-settings-fiscal-year-month-drawer-form-required-astrix"
            >
              *
            </span>
          )}
        </>
      )}
      onFinish={(values) => {
        Object.keys(values).forEach((key) => {
          if (key.startsWith('monthDateRange_')) {
            const monthNumber = key.replace('monthDateRange_', '');
            const dateRange = values[key];
            if (
              dateRange &&
              Array.isArray(dateRange) &&
              dateRange.length === 2
            ) {
              values[`monthStartDate_${monthNumber}`] = dateRange[0];
              values[`monthEndDate_${monthNumber}`] = dateRange[1];
            }
          }
        });
        updateMonthFields(values);
        onSubmit(values);
      }}
      data-cy="org-settings-fiscal-year-month-drawer-form"
      id="org-settings-fiscal-year-month-drawer-form"
      className="px-0"
      onValuesChange={(nonused, allValues) => {
        updateMonthFields(allValues);
      }}
    >
      <div
        className="flex-1 bg-white p-0 items-center w-full h-full"
        data-cy="org-settings-fiscal-year-month-drawer-form-content"
        id="org-settings-fiscal-year-month-drawer-form-content"
      >
        {sessionData &&
          sessionData.length > 0 &&
          Object.keys(monthDataBySession).length > 0 && (
            <div
              className="space-y-2"
              data-cy="org-settings-fiscal-year-sessions-container"
            >
              {sessionData.map((session, sessionIndex) => {
                const sessionMonths = monthDataBySession[sessionIndex] || [];
                const isExpanded = expandedMonthSession === sessionIndex;
                const sessionName =
                  session.sessionName ||
                  `FY${fiscalYearStart?.format('YYYY')}S${String(sessionIndex + 1).padStart(2, '0')}`;
                const sessionDateRange =
                  session.sessionDateRange ||
                  (session.sessionStartDate && session.sessionEndDate
                    ? [
                        dayjs(session.sessionStartDate),
                        dayjs(session.sessionEndDate),
                      ]
                    : null);

                return (
                  <div
                    key={sessionIndex}
                    className={`border rounded-lg px-4 py-3 ${
                      isExpanded ? 'border-primary' : 'border-gray-200'
                    }`}
                    data-cy={`org-settings-fiscal-year-session-${sessionIndex}`}
                  >
                    {/* Session Header */}
                    <div
                      className="flex items-center justify-between px-3 py-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleSession(sessionIndex)}
                      data-cy={`org-settings-fiscal-year-session-header-${sessionIndex}`}
                    >
                      <div
                        className="flex items-center gap-6 flex-1"
                        data-cy={`org-settings-fiscal-year-session-header-content-${sessionIndex}`}
                      >
                        <span
                          className="font-medium text-base"
                          data-cy={`org-settings-fiscal-year-session-name-${sessionIndex}`}
                        >
                          {sessionName}
                        </span>
                        {sessionDateRange &&
                        sessionDateRange[0] &&
                        sessionDateRange[1] ? (
                          <span
                            className="border border-primary rounded px-2 py-0.5 text-xs text-gray-700"
                            data-cy={`org-settings-fiscal-year-session-date-range-${sessionIndex}`}
                          >
                            {dayjs(sessionDateRange[0]).format('YYYY-MM-DD')} to{' '}
                            {dayjs(sessionDateRange[1]).format('YYYY-MM-DD')}
                          </span>
                        ) : null}
                      </div>
                      <div
                        className="flex items-center"
                        data-cy={`org-settings-fiscal-year-session-toggle-${sessionIndex}`}
                      >
                        {isExpanded ? (
                          <IoIosArrowUp
                            size={20}
                            className="text-gray-600"
                            data-cy={`org-settings-fiscal-year-session-arrow-up-${sessionIndex}`}
                          />
                        ) : (
                          <IoIosArrowDown
                            size={20}
                            className="text-gray-600"
                            data-cy={`org-settings-fiscal-year-session-arrow-down-${sessionIndex}`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Session Months (when expanded) */}
                    {isExpanded && (
                      <div
                        className="px-3 pb-4 space-y-4"
                        data-cy={`org-settings-fiscal-year-session-months-${sessionIndex}`}
                      >
                        {sessionMonths.map((monthInfo) => (
                          <div
                            key={monthInfo.monthNumber}
                            data-cy={`org-settings-fiscal-year-month-${monthInfo.monthNumber}`}
                          >
                            <Row
                              gutter={16}
                              align="middle"
                              data-cy={`org-settings-fiscal-year-month-row-${monthInfo.monthNumber}`}
                            >
                              <Col
                                span={isMobile ? undefined : 10}
                                flex={isMobile ? 'auto' : undefined}
                                style={isMobile ? { minWidth: 0 } : undefined}
                                data-cy={`org-settings-fiscal-year-month-name-col-${monthInfo.monthNumber}`}
                              >
                                <Form.Item
                                  data-cy={`org-settings-fiscal-year-month-name-${monthInfo.monthNumber}`}
                                  id={`monthNameId_${monthInfo.monthNumber}`}
                                  name={`monthName_${monthInfo.monthNumber}`}
                                  rules={[
                                    {
                                      required: true,
                                      message: `Please input the month name!`,
                                    },
                                  ]}
                                  className="mb-0"
                                >
                                  <Input
                                    size="middle"
                                    className="w-full text-sm h-8"
                                    placeholder={`Enter name for ${monthInfo.monthName}`}
                                    data-cy={`org-settings-fiscal-year-month-name-input-${monthInfo.monthNumber}`}
                                  />
                                </Form.Item>
                              </Col>
                              <Col
                                span={isMobile ? undefined : 14}
                                flex={isMobile ? 'none' : undefined}
                                data-cy={`org-settings-fiscal-year-month-date-range-col-${monthInfo.monthNumber}`}
                              >
                                <Form.Item
                                  data-cy={`org-settings-fiscal-year-month-date-range-${monthInfo.monthNumber}`}
                                  name={`monthDateRange_${monthInfo.monthNumber}`}
                                  validateTrigger="onChange"
                                  getValueFromEvent={(value) => {
                                    if (
                                      !value ||
                                      !Array.isArray(value) ||
                                      value.length !== 2
                                    ) {
                                      return null;
                                    }
                                    // Update the separate start and end date fields for form submission
                                    if (form) {
                                      form.setFieldsValue({
                                        [`monthStartDate_${monthInfo.monthNumber}`]:
                                          value[0],
                                        [`monthEndDate_${monthInfo.monthNumber}`]:
                                          value[1],
                                      });
                                    }
                                    return value;
                                  }}
                                  normalize={(value) => {
                                    // If value is already a valid range array, return it
                                    if (
                                      value &&
                                      Array.isArray(value) &&
                                      value.length === 2 &&
                                      value[0] &&
                                      value[1]
                                    ) {
                                      return value;
                                    }
                                    // If value is null/undefined, try to get from separate date fields
                                    const startDate = form?.getFieldValue(
                                      `monthStartDate_${monthInfo.monthNumber}`,
                                    );
                                    const endDate = form?.getFieldValue(
                                      `monthEndDate_${monthInfo.monthNumber}`,
                                    );
                                    if (startDate && endDate) {
                                      return [dayjs(startDate), dayjs(endDate)];
                                    }
                                    // Fallback to monthInfo dates if available
                                    if (
                                      monthInfo.startDate &&
                                      monthInfo.endDate
                                    ) {
                                      return [
                                        dayjs(monthInfo.startDate),
                                        dayjs(monthInfo.endDate),
                                      ];
                                    }
                                    return value;
                                  }}
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Please select the date range!',
                                    },
                                    {
                                      validator: async (nonused, value) => {
                                        if (
                                          !value ||
                                          !Array.isArray(value) ||
                                          value.length !== 2
                                        ) {
                                          return;
                                        }
                                        const [startDate, endDate] = value;

                                        // Validate start date
                                        const fiscalYearStartDate =
                                          dayjs(fiscalYearStart);
                                        if (
                                          dayjs(startDate).isBefore(
                                            fiscalYearStartDate,
                                          )
                                        ) {
                                          throw new Error(
                                            `Start date cannot be before fiscal year start (${fiscalYearStartDate.format('YYYY-MM-DD')})`,
                                          );
                                        }

                                        // Validate end date
                                        const fiscalYearEndDate =
                                          dayjs(fiscalYearEnd);
                                        if (
                                          dayjs(endDate).isAfter(
                                            fiscalYearEndDate,
                                          )
                                        ) {
                                          throw new Error(
                                            `End date cannot be after fiscal year end (${fiscalYearEndDate.format('YYYY-MM-DD')})`,
                                          );
                                        }

                                        // Validate start before end
                                        if (
                                          dayjs(startDate).isAfter(
                                            dayjs(endDate),
                                          )
                                        ) {
                                          throw new Error(
                                            'Start date must be before end date',
                                          );
                                        }

                                        // Update separate fields for validation
                                        if (form) {
                                          form.setFieldsValue({
                                            [`monthStartDate_${monthInfo.monthNumber}`]:
                                              startDate,
                                            [`monthEndDate_${monthInfo.monthNumber}`]:
                                              endDate,
                                          });
                                        }
                                      },
                                    },
                                    ...(form
                                      ? [
                                          {
                                            validator: async (
                                              nonused: any,
                                              value: any,
                                            ) => {
                                              if (
                                                !value ||
                                                !Array.isArray(value) ||
                                                value.length !== 2
                                              ) {
                                                return;
                                              }
                                              const [startDate] = value;
                                              return validateStartNoOverlap(
                                                monthInfo.monthNumber,
                                                form,
                                              )(nonused, startDate);
                                            },
                                          },
                                          {
                                            validator: async (
                                              nonused: any,
                                              value: any,
                                            ) => {
                                              if (
                                                !value ||
                                                !Array.isArray(value) ||
                                                value.length !== 2
                                              ) {
                                                return;
                                              }
                                              const [, endDate] = value;
                                              return validateEndNoOverlap(
                                                monthInfo.monthNumber,
                                                form,
                                              )(nonused, endDate);
                                            },
                                          },
                                        ]
                                      : []),
                                  ]}
                                  className="mb-0"
                                >
                                  <RangePicker
                                    className={
                                      isMobile
                                        ? 'h-10 w-11 min-w-11 px-0 justify-center [&_.ant-picker-input]:hidden [&_.ant-picker-range-separator]:hidden [&_.ant-picker-active-bar]:hidden [&_.ant-picker-suffix]:m-0'
                                        : 'w-full h-8 [&_.ant-picker-input]:h-8'
                                    }
                                    size="middle"
                                    disabledDate={(current) => {
                                      if (!current) return false;
                                      const fiscalYearStartDate =
                                        dayjs(fiscalYearStart);
                                      const fiscalYearEndDate =
                                        dayjs(fiscalYearEnd);
                                      return (
                                        current.isBefore(fiscalYearStartDate) ||
                                        current.isAfter(fiscalYearEndDate)
                                      );
                                    }}
                                    onChange={() => {
                                      clearRelatedValidationErrors(
                                        monthInfo.monthNumber,
                                      );
                                    }}
                                    data-cy={`org-settings-fiscal-year-month-date-range-input-${monthInfo.monthNumber}`}
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        <Form.Item
          className="mb-0 mt-4"
          data-cy="org-settings-fiscal-year-month-previous-btn-form-item"
          id="org-settings-fiscal-year-month-previous-btn-form-item"
        >
          <div
            className={`flex justify-end w-full pt-2 pb-0  gap-3 shadow-none`}
            data-cy="org-settings-fiscal-year-month-previous-btn-container"
            id="org-settings-fiscal-year-month-previous-btn-container"
          >
            <Button
              type="default"
              onClick={() => {
                if (form) {
                  updateMonthFields(form.getFieldsValue());
                }
                onNavigateToStep(1, { sync: false });
              }}
              className="flex justify-center text-sm font-normal h-8 !min-h-[32px] px-6 border-gray-300 bg-transparent hover:bg-gray-50"
              data-cy="org-settings-fiscal-year-month-previous-btn"
              id="org-settings-fiscal-year-month-previous-btn"
            >
              Reset
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isCreateLoading || isUpdateLoading}
              className="flex justify-center text-sm font-normal h-8 !min-h-[32px] px-6 min-w-[100px]"
              data-cy="org-settings-fiscal-year-month-next-btn"
              id="org-settings-fiscal-year-month-next-btn"
            >
              Continue
            </Button>
          </div>
        </Form.Item>
      </div>
    </Form>
  );
};

export default MonthDrawer;
