import {
  Input,
  Form,
  DatePicker,
  Button,
  Row,
  Col,
  Radio,
  message,
  Popconfirm,
} from 'antd';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import {
  useGetActiveFiscalYears,
  useGetAllFiscalYears,
} from '@/store/server/features/organizationStructure/fiscalYear/queries';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import { FormInstance } from 'antd/lib';

const FiscalYearForm: React.FC<{
  form: FormInstance;
  onNavigateToStep: (step: number, options?: { sync?: boolean }) => void;
}> = ({ form, onNavigateToStep }) => {
  const {
    setCalendarType,
    setFiscalYearStart,
    setFiscalYearEnd,
    selectedFiscalYear,
    isEditMode,
    isFormValid,
    calendarType,
    setOpenFiscalYearDrawer,
    hasOverlapError,
    setHasOverlapError,
    updateFiscalYearFields,
    resetWizard,
  } = useFiscalYearDrawerStore();

  const { data: activeCalendar } = useGetActiveFiscalYears();
  const { data: allFiscalYears } = useGetAllFiscalYears();

  const doesOverlap = (start: dayjs.Dayjs, end: dayjs.Dayjs) => {
    if (!allFiscalYears?.items) return false;
    return allFiscalYears.items.some((fy: any) => {
      // If editing, skip the current fiscal year
      if (isEditMode && selectedFiscalYear && fy.id === selectedFiscalYear.id)
        return false;
      const fyStart = dayjs(fy.startDate);
      const fyEnd = dayjs(fy.endDate);
      return (
        start.isSameOrBefore(fyEnd, 'day') && end.isSameOrAfter(fyStart, 'day')
      );
    });
  };

  const validateStartDate = (nonused: any, value: any) => {
    // Skip active calendar validation in edit mode
    if (!isEditMode) {
      if (
        activeCalendar?.endDate &&
        dayjs(value).isBefore(
          dayjs(activeCalendar?.endDate).add(1, 'day'),
          'day',
        )
      ) {
        return Promise.reject(
          new Error(
            `Start date must be after or equal to (${dayjs(activeCalendar.endDate).add(1, 'day').format('YYYY-MM-DD')}).`,
          ),
        );
      }

      if (activeCalendar && dayjs(value).isBefore(dayjs(), 'day')) {
        return Promise.reject(new Error('Start date cannot be in the past.'));
      }
    }

    const endDate = form.getFieldValue('fiscalYearEndDate');
    if (value && endDate) {
      if (doesOverlap(dayjs(value), dayjs(endDate))) {
        setHasOverlapError(true);
        return Promise.reject(
          new Error('This fiscal year overlaps with an existing fiscal year.'),
        );
      }
    }
    setHasOverlapError(false);
    return Promise.resolve();
  };
  const handleClose = () => {
    form.resetFields();
    resetWizard();
    setOpenFiscalYearDrawer(false);
  };

  const handleValuesChange = (val: string) => {
    try {
      setCalendarType(val);
      // Also update the form field value so validation works
      form.setFieldsValue({ fiscalYearCalenderId: val });
    } catch (error) {
      message.error('Failed to update calendar type. Please try again.');
    }
  };

  const handleStartDateChange = (val: any) => {
    try {
      setFiscalYearStart(val);
      // Re-validate end date when start date changes
      const endDateValue = form.getFieldValue('fiscalYearEndDate');
      if (endDateValue) {
        form.validateFields(['fiscalYearEndDate']);
      }
    } catch (error) {
      message.error('Failed to update start date. Please try again.');
    }
  };

  const handleEndDateChange = (val: any) => {
    try {
      setFiscalYearEnd(val);
    } catch (error) {
      message.error('Failed to update end date. Please try again.');
    }
  };

  const handleNext = async () => {
    try {
      const currentValues = form.getFieldsValue();
      updateFiscalYearFields(currentValues);
      onNavigateToStep(1);
    } catch (error) {
      message.error('Failed to proceed to next step. Please try again.');
    }
  };

  return (
    <div
      className="flex flex-col"
      data-cy="org-settings-fiscal-year-drawer-form-container"
      id="org-settings-fiscal-year-drawer-form-container"
    >
      <Form
        data-cy="org-settings-fiscal-year-drawer-form"
        id="org-settings-fiscal-year-drawer-form"
        form={form}
        layout="vertical"
        requiredMark={(label, { required }) => (
          <>
            {label}
            {required && (
              <span
                className="text-red-500 ml-1"
                data-cy="org-settings-fiscal-year-drawer-form-required-astrix"
              >
                *
              </span>
            )}
          </>
        )}
        className="flex flex-col [&_.ant-form-item-label]:pb-1 [&_.ant-form-item]:mb-2"
        onValuesChange={(changedValues, allValues) => {
          try {
            let nextValues = allValues;

            // Auto-fill end date whenever start date changes (picker or typed+Enter).
            if (
              Object.prototype.hasOwnProperty.call(
                changedValues,
                'fiscalYearStartDate',
              )
            ) {
              const startDate = changedValues.fiscalYearStartDate;
              const autoEndDate = startDate
                ? dayjs(startDate).add(1, 'year')
                : null;
              form.setFieldsValue({ fiscalYearEndDate: autoEndDate });
              nextValues = {
                ...allValues,
                fiscalYearEndDate: autoEndDate,
              };
            }

            updateFiscalYearFields(nextValues);

            // Trigger validation for date fields when values change (catches copy-paste)
            if (nextValues.fiscalYearStartDate) {
              form.validateFields(['fiscalYearStartDate']);
            }
            if (nextValues.fiscalYearEndDate) {
              form.validateFields(['fiscalYearEndDate']);
            }
          } catch (error) {
            message.error('Failed to update form values. Please try again.');
          }
        }}
      >
        <div
          className="flex flex-col"
          data-cy="org-settings-fiscal-year-drawer-form-content"
          id="org-settings-fiscal-year-drawer-form-content"
        >
          <div
            className=""
            data-cy="org-settings-fiscal-year-drawer-form-content-div"
            id="org-settings-fiscal-year-drawer-form-content-div"
          >
            <div
              className="px-0 -mt-2"
              data-cy="org-settings-fiscal-year-drawer-form-content-div-inner"
              id="org-settings-fiscal-year-drawer-form-content-div-inner"
            >
              <Form.Item
                data-cy="org-settings-fiscal-year-name-input"
                id="fiscalNameId"
                name="fiscalYearName"
                label={
                  <span
                    className="font-medium"
                    data-cy="org-fiscalyear-customdrawer-steps-fiscalyeardrawer-span-1"
                    id="org-fiscalyear-customdrawer-steps-fiscalyeardrawer-span-1"
                  >
                    Fiscal Year
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: 'Please input the fiscal year name!',
                  },
                ]}
              >
                <Input
                  className="mt-1 w-full font-normal text-sm h-10"
                  placeholder="Enter name"
                  data-cy="org-settings-fiscal-year-name-input-value"
                  id="org-settings-fiscal-year-name-input-value"
                />
              </Form.Item>

              <Row
                gutter={[16, 8]}
                align="middle"
                data-cy="org-settings-fiscal-year-start-date-input-row"
                id="org-settings-fiscal-year-start-date-input-row"
              >
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  lg={12}
                  xl={12}
                  data-cy="org-settings-fiscal-year-start-date-input-col"
                  id="org-settings-fiscal-year-start-date-input-col"
                >
                  <Form.Item
                    data-cy="org-settings-fiscal-year-start-date-input"
                    id="fiscalYearStartDateId"
                    name="fiscalYearStartDate"
                    label={
                      <span
                        className="font-medium"
                        data-cy="org-fiscalyear-customdrawer-steps-fiscalyeardrawer-span-2"
                        id="org-fiscalyear-customdrawer-steps-fiscalyeardrawer-span-2"
                      >
                        Fiscal Year Starting Date
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: 'Please select a start date!',
                      },
                      { validator: validateStartDate },
                    ]}
                  >
                    <DatePicker
                      size="middle"
                      data-cy="org-settings-fiscal-year-start-date-input-datepicker"
                      id="org-settings-fiscal-year-start-date-input-datepicker"
                      onChange={(value: any) => handleStartDateChange(value)}
                      onBlur={() => {
                        // Trigger validation on blur to catch copy-paste scenarios
                        form.validateFields(['fiscalYearStartDate']);
                        // Re-validate end date if it exists
                        const endDateValue =
                          form.getFieldValue('fiscalYearEndDate');
                        if (endDateValue) {
                          form.validateFields(['fiscalYearEndDate']);
                        }
                      }}
                      className="w-full font-normal text-sm mt-1 h-10"
                      placeholder="Select date"
                    />
                  </Form.Item>
                </Col>
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  lg={12}
                  xl={12}
                  data-cy="org-settings-fiscal-year-end-date-input-col"
                  id="org-settings-fiscal-year-end-date-input-col"
                >
                  <Form.Item
                    data-cy="org-settings-fiscal-year-end-date-input"
                    id="fiscalYearEndDateId"
                    name="fiscalYearEndDate"
                    label={
                      <span
                        className="font-medium"
                        data-cy="org-fiscalyear-customdrawer-steps-fiscalyeardrawer-span-3"
                        id="org-fiscalyear-customdrawer-steps-fiscalyeardrawer-span-3"
                      >
                        Fiscal Year Ending Date
                      </span>
                    }
                    rules={[]}
                  >
                    <DatePicker
                      size="middle"
                      onChange={(value: any) => handleEndDateChange(value)}
                      onBlur={() => {
                        // Trigger validation on blur to catch copy-paste scenarios
                        form.validateFields(['fiscalYearEndDate']);
                      }}
                      className="w-full font-normal text-sm mt-1 h-10"
                      placeholder="Select date"
                      data-cy="org-settings-fiscal-year-end-date-input-value"
                      id="org-settings-fiscal-year-end-date-input-value"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                data-cy="org-settings-fiscal-year-calendar-input"
                id="fiscalYearCalenderId"
                name="fiscalYearCalenderId"
                label={
                  <span
                    className="font-medium"
                    data-cy="org-fiscalyear-customdrawer-steps-fiscalyeardrawer-span-4"
                    id="org-fiscalyear-customdrawer-steps-fiscalyeardrawer-span-4"
                  >
                    Fiscal Period Breakdown
                  </span>
                }
                rules={[
                  { required: true, message: 'Please select a calendar type!' },
                ]}
              >
                <Radio.Group
                  onChange={(e) => handleValuesChange(e.target.value)}
                  value={
                    calendarType || form.getFieldValue('fiscalYearCalenderId')
                  }
                  className="w-full mt-2 [&_.ant-radio-wrapper]:!h-auto [&_.ant-radio-wrapper]:!py-2 [&_.ant-radio-wrapper]:!px-3 [&_.ant-radio-wrapper]:!border [&_.ant-radio-wrapper]:!border-gray-300 [&_.ant-radio-wrapper]:!rounded-md [&_.ant-radio-wrapper]:!shadow-sm [&_.ant-radio-wrapper]:!m-0 [&_.ant-radio-wrapper]:!w-full [&_.ant-radio-wrapper]:!flex [&_.ant-radio-wrapper]:!items-start [&_.ant-radio-wrapper:hover]:!border-primary [&_.ant-radio-wrapper-checked]:!border-primary [&_.ant-radio-wrapper-checked]:!bg-transparent [&_.ant-radio]:!mr-2 [&_.ant-radio]:!mt-0"
                  data-cy="org-settings-fiscal-year-calendar-input-value"
                  id="org-settings-fiscal-year-calendar-input-value"
                >
                  <div
                    className="flex flex-col gap-4"
                    data-cy="org-settings-fiscal-year-calendar-radio-group-container"
                  >
                    <Radio
                      value="Year"
                      data-cy="org-settings-fiscal-year-calendar-input-option-monthly"
                    >
                      <div
                        className="flex flex-col"
                        data-cy="org-settings-fiscal-year-calendar-input-option-monthly-content"
                      >
                        <span
                          className="font-medium text-sm"
                          data-cy="org-settings-fiscal-year-calendar-input-option-monthly-title"
                        >
                          Annually
                        </span>
                        <span
                          className="text-xs text-[rgba(0,0,0,0.45)] mt-1"
                          data-cy="org-settings-fiscal-year-calendar-input-option-monthly-description"
                        >
                          The fiscal year will be divided through out 12 months
                        </span>
                      </div>
                    </Radio>
                    <Radio
                      value="Quarter"
                      data-cy="org-settings-fiscal-year-calendar-input-option-quarterly"
                    >
                      <div
                        className="flex flex-col"
                        data-cy="org-settings-fiscal-year-calendar-input-option-quarterly-content"
                      >
                        <span
                          className="font-medium text-sm"
                          data-cy="org-settings-fiscal-year-calendar-input-option-quarterly-title"
                        >
                          Quarterly
                        </span>
                        <span
                          className="text-xs text-[rgba(0,0,0,0.45)] mt-1"
                          data-cy="org-settings-fiscal-year-calendar-input-option-quarterly-description"
                        >
                          The fiscal year will be divided through out 3 months
                        </span>
                      </div>
                    </Radio>
                    <Radio
                      value="Semester"
                      data-cy="org-settings-fiscal-year-calendar-input-option-bianual"
                    >
                      <div
                        className="flex flex-col"
                        data-cy="org-settings-fiscal-year-calendar-input-option-bianual-content"
                      >
                        <span
                          className="font-medium text-sm"
                          data-cy="org-settings-fiscal-year-calendar-input-option-bianual-title"
                        >
                          Semiannual
                        </span>
                        <span
                          className="text-xs text-[rgba(0,0,0,0.45)] mt-1"
                          data-cy="org-settings-fiscal-year-calendar-input-option-bianual-description"
                        >
                          The fiscal year will be divided through out 6 months
                        </span>
                      </div>
                    </Radio>
                  </div>
                </Radio.Group>
              </Form.Item>
            </div>
          </div>
          <div
            className="mt-1"
            data-cy="org-settings-fiscal-year-cancel-btn-container"
            id="org-settings-fiscal-year-cancel-btn-container"
          >
            <Form.Item
              className="mb-0"
              data-cy="org-settings-fiscal-year-cancel-btn-form-item"
              id="org-settings-fiscal-year-cancel-btn-form-item"
            >
              <div
                data-cy="org-settings-fiscal-year-cancel-btn-div"
                id="org-settings-fiscal-year-cancel-btn-div"
                className={`flex justify-end items-center w-full pt-2 pb-0 gap-3 shadow-none`}
              >
                <Button
                  type="default"
                  onClick={handleClose}
                  className="flex justify-center text-sm font-normal h-8 !min-h-[32px] px-6 border-gray-300"
                  data-cy="org-settings-fiscal-year-cancel-btn"
                  id="org-settings-fiscal-year-cancel-btn"
                >
                  Reset
                </Button>
                <Popconfirm
                  data-cy="org-settings-fiscal-year-next-btn-popconfirm"
                  id="org-settings-fiscal-year-next-btn-popconfirm"
                  title="Invalid Fiscal Year"
                  description={
                    hasOverlapError
                      ? 'The selected dates overlap with an existing fiscal year. Please choose different dates.'
                      : 'Please fill in all required fields (Fiscal Year Name, Start Date, End Date, and Calendar Type) to continue'
                  }
                  placement="top"
                  onConfirm={handleNext}
                  disabled={!isFormValid || hasOverlapError}
                >
                  <Button
                    data-cy="org-settings-fiscal-year-next-btn"
                    id="org-settings-fiscal-year-next-btn"
                    onClick={handleNext}
                    disabled={!isFormValid || hasOverlapError}
                    type="primary"
                    className="flex justify-center text-sm font-normal h-8 !min-h-[32px] px-6 min-w-[100px]"
                  >
                    Continue
                  </Button>
                </Popconfirm>
              </div>
            </Form.Item>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default FiscalYearForm;
