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
import { useEffect } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { FormInstance } from 'antd/lib';

const FiscalYearForm: React.FC<{ form: FormInstance }> = ({ form }) => {
  const { isMobile } = useIsMobile();

  const {
    setCurrent,
    setCalendarType,
    setSelectedFiscalYear,
    setFiscalYearStart,
    setFiscalYearEnd,
    setFiscalYearFormValues,
    selectedFiscalYear,
    isEditMode,
    formValidation,
    setFormValidation,
    isFormValid,
    setIsFormValid,
    fiscalYearFormValues,
    calendarType,
    setOpenFiscalYearDrawer,
    hasOverlapError,
    setHasOverlapError,
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
  /* eslint-disable-next-line @typescript-eslint/naming-convention */
  const validateEndDate = (_: any, value: any) => {
    /* eslint-enable-next-line @typescript-eslint/naming-convention */

    const startDate = form.getFieldValue('fiscalYearStartDate');

    // If end date is empty, don't show any error here - let the required field validation handle it
    if (!value) {
      return Promise.resolve();
    }

    // If start date is empty, show this message first
    if (!startDate) {
      return Promise.reject(new Error('Please select the start date first.'));
    }

    const expectedEndDate = dayjs(startDate).add(1, 'year');

    if (!dayjs(value).isSame(expectedEndDate, 'day')) {
      return Promise.reject(
        new Error(
          `End date must be exactly one year after the start date (${expectedEndDate.format('YYYY-MM-DD')}).`,
        ),
      );
    }

    if (startDate && value) {
      if (doesOverlap(dayjs(startDate), dayjs(value))) {
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
    // Reset form fields
    form.resetFields();

    // Reset all state variables
    setSelectedFiscalYear(null);
    setCalendarType('');
    setFiscalYearFormValues({});
    setFormValidation({
      fiscalYearName: '',
      fiscalYearStartDate: null,
      fiscalYearEndDate: null,
    });
    setIsFormValid(false);
    setHasOverlapError(false);

    // Close the drawer
    setOpenFiscalYearDrawer(false);
  };

  useEffect(() => {
    if (isEditMode && selectedFiscalYear) {
      const sessionCount = selectedFiscalYear?.sessions?.length;
      let calendarType = '';
      if (sessionCount === 4) {
        calendarType = 'Quarter';
      } else if (sessionCount === 2) {
        calendarType = 'Semester';
      } else if (sessionCount === 1) {
        calendarType = 'Year';
      }

      setCalendarType(calendarType);

      form.setFieldsValue({
        fiscalYearName: selectedFiscalYear?.name,
        fiscalYearStartDate: dayjs(selectedFiscalYear?.startDate),
        fiscalYearEndDate: dayjs(selectedFiscalYear?.endDate),
        fiscalYearCalenderId: `${calendarType}`,
        fiscalYearDescription: dayjs(selectedFiscalYear?.description),
      });
    }
  }, [isEditMode, selectedFiscalYear, setCalendarType, form]);

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
      setFiscalYearFormValues(currentValues);
      if (currentValues.fiscalYearStartDate)
        setFiscalYearStart(currentValues.fiscalYearStartDate);
      if (currentValues.fiscalYearEndDate)
        setFiscalYearEnd(currentValues.fiscalYearEndDate);
      if (currentValues.fiscalYearCalenderId)
        setCalendarType(currentValues.fiscalYearCalenderId);
      // Wait for state to update before moving to next step
      setTimeout(() => {
        setCurrent(1);
      }, 0);
    } catch (error) {
      message.error('Failed to proceed to next step. Please try again.');
    }
  };

  // Initialize form with stored values when component mounts or when returning from next step

  useEffect(() => {
    try {
      // Priority 1: If we have stored form values (returning from next step), restore them
      if (Object.keys(fiscalYearFormValues).length > 0) {
        form.setFieldsValue(fiscalYearFormValues);
        const calType = fiscalYearFormValues.fiscalYearCalenderId || calendarType || '';
        setCalendarType(calType);
        // Ensure form field is set if calendarType exists
        if (calType && !fiscalYearFormValues.fiscalYearCalenderId) {
          form.setFieldsValue({ fiscalYearCalenderId: calType });
        }
        setFormValidation({
          fiscalYearName: fiscalYearFormValues.fiscalYearName,
          fiscalYearStartDate: fiscalYearFormValues.fiscalYearStartDate,
          fiscalYearEndDate: fiscalYearFormValues.fiscalYearEndDate,
        });
        // Set fiscal year dates in store for session generation
        if (fiscalYearFormValues.fiscalYearStartDate) {
          setFiscalYearStart(fiscalYearFormValues.fiscalYearStartDate);
        }
        if (fiscalYearFormValues.fiscalYearEndDate) {
          setFiscalYearEnd(fiscalYearFormValues.fiscalYearEndDate);
        }
      }
      // Priority 2: If in edit mode and no stored values, initialize with original data
      else if (isEditMode && selectedFiscalYear) {
        const sessionCount = selectedFiscalYear?.sessions?.length;
        let newCalendarType = '';
        if (sessionCount >= 4) {
          newCalendarType = 'Quarter';
        } else if (sessionCount === 2) {
          newCalendarType = 'Semester';
        } else if (sessionCount === 1) {
          newCalendarType = 'Year';
        }

        setCalendarType(newCalendarType);

        const formValues = {
          fiscalYearName: selectedFiscalYear?.name,
          fiscalYearStartDate: dayjs(selectedFiscalYear?.startDate),
          fiscalYearEndDate: dayjs(selectedFiscalYear?.endDate),
          fiscalYearCalenderId: newCalendarType,
          fiscalYearDescription: selectedFiscalYear?.description,
        };

        form.setFieldsValue(formValues);
        // Set form validation state for edit mode
        setFormValidation({
          fiscalYearName: selectedFiscalYear?.name,
          fiscalYearStartDate: dayjs(selectedFiscalYear?.startDate),
          fiscalYearEndDate: dayjs(selectedFiscalYear?.endDate),
        });
      }
      // Priority 3: Reset form when in create mode and no stored values
      else if (!isEditMode && Object.keys(fiscalYearFormValues).length === 0) {
        form.resetFields();
        setCalendarType('');
        setFormValidation({
          fiscalYearName: '',
          fiscalYearStartDate: null,
          fiscalYearEndDate: null,
        });
        setIsFormValid(false);
        setHasOverlapError(false);
      }
    } catch (error) {
      message.error('Failed to initialize form. Please refresh the page.');
    }
  }, [
    selectedFiscalYear,
    isEditMode,
    form,
    fiscalYearFormValues,
    setCalendarType,
    setFormValidation,
    setIsFormValid,
    setFiscalYearStart,
    setFiscalYearEnd,
    setHasOverlapError,
  ]);

  useEffect(() => {
    if (
      allFiscalYears &&
      Array.isArray(allFiscalYears.items) &&
      allFiscalYears.items.length === 0
    ) {
      // No fiscal years left, so clear the fields
      form.setFieldsValue({
        fiscalYearStartDate: null,
        fiscalYearEndDate: null,
      });
      setFiscalYearStart(null);
      setFiscalYearEnd(null);
    }
  }, [allFiscalYears, form, setFiscalYearStart, setFiscalYearEnd]);

  // Update form validation state when form values change
  useEffect(() => {
    try {
      const checkFormValidity = () => {
        // Get current form values
        const currentValues = form.getFieldsValue();

        const isValid = Boolean(
          currentValues.fiscalYearName &&
            currentValues.fiscalYearStartDate &&
            currentValues.fiscalYearEndDate &&
            currentValues.fiscalYearCalenderId,
        );
        setIsFormValid(isValid);
      };

      checkFormValidity();
    } catch (error) {
      message.error('Failed to validate form. Please refresh the page.');
    }
  }, [formValidation, setIsFormValid, calendarType, form]);

  // Always sync form values to store so month drawer gets latest values
  useEffect(() => {
    const values = form.getFieldsValue();
    if (values.fiscalYearStartDate)
      setFiscalYearStart(values.fiscalYearStartDate);
    if (values.fiscalYearEndDate) setFiscalYearEnd(values.fiscalYearEndDate);
    if (values.fiscalYearCalenderId)
      setCalendarType(values.fiscalYearCalenderId);
  }, [
    form.getFieldValue('fiscalYearStartDate'),
    form.getFieldValue('fiscalYearEndDate'),
    form.getFieldValue('fiscalYearCalenderId'),
  ]);

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
            {required && <span className="text-red-500 ml-1">*</span>}
          </>
        )}
        className="flex flex-col [&_.ant-form-item-label]:pb-1 [&_.ant-form-item]:mb-2"
        onValuesChange={(nonused, allValues) => {
          try {
            setFormValidation({
              fiscalYearName: allValues.fiscalYearName,
              fiscalYearStartDate: allValues.fiscalYearStartDate,
              fiscalYearEndDate: allValues.fiscalYearEndDate,
            });

            setFiscalYearFormValues(allValues);

            // --- Add these lines ---
            if (allValues.fiscalYearStartDate)
              setFiscalYearStart(allValues.fiscalYearStartDate);
            if (allValues.fiscalYearEndDate)
              setFiscalYearEnd(allValues.fiscalYearEndDate);
            if (allValues.fiscalYearCalenderId)
              setCalendarType(allValues.fiscalYearCalenderId);
            // -----------------------

            // Check form validity immediately when values change
            const isValid = Boolean(
              allValues.fiscalYearName &&
                allValues.fiscalYearStartDate &&
                allValues.fiscalYearEndDate &&
                allValues.fiscalYearCalenderId,
            );
            setIsFormValid(isValid);

            // Trigger validation for date fields when values change (catches copy-paste)
            if (allValues.fiscalYearStartDate) {
              form.validateFields(['fiscalYearStartDate']);
            }
            if (allValues.fiscalYearEndDate) {
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
                  className="mt-1 w-full font-normal text-sm"
                  placeholder="Enter name"
                  data-cy="org-settings-fiscal-year-name-input-value"
                  id="org-settings-fiscal-year-name-input-value"
                />
              </Form.Item>

              <Row
                gutter={[16, 8]}
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
                      className="w-full font-normal text-sm mt-1"
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
                    rules={[
                      { required: true, message: 'Please select an end date!' },
                      { validator: validateEndDate },
                    ]}
                  >
                    <DatePicker
                      size="middle"
                      onChange={(value: any) => handleEndDateChange(value)}
                      onBlur={() => {
                        // Trigger validation on blur to catch copy-paste scenarios
                        form.validateFields(['fiscalYearEndDate']);
                      }}
                      className="w-full font-normal text-sm mt-2"
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
                  value={calendarType || form.getFieldValue('fiscalYearCalenderId')}
                  disabled={isEditMode}
                  className="w-full mt-2 [&_.ant-radio-wrapper]:!h-auto [&_.ant-radio-wrapper]:!py-2 [&_.ant-radio-wrapper]:!px-3 [&_.ant-radio-wrapper]:!border [&_.ant-radio-wrapper]:!border-gray-300 [&_.ant-radio-wrapper]:!rounded-md [&_.ant-radio-wrapper]:!m-0 [&_.ant-radio-wrapper]:!w-full [&_.ant-radio-wrapper]:!flex [&_.ant-radio-wrapper]:!items-start [&_.ant-radio-wrapper:hover]:!border-primary [&_.ant-radio-wrapper-checked]:!border-primary [&_.ant-radio-wrapper-checked]:!bg-transparent [&_.ant-radio]:!mr-2 [&_.ant-radio]:!mt-0"
                  data-cy="org-settings-fiscal-year-calendar-input-value"
                  id="org-settings-fiscal-year-calendar-input-value"
                >
                  <div className="flex flex-col gap-1">
                    <Radio
                      value="Year"
                      data-cy="org-settings-fiscal-year-calendar-input-option-monthly"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Monthly</span>
                        <span className="text-xs text-gray-500 mt-1">
                          The fiscal year will be divided through out 12 months
                        </span>
                      </div>
                    </Radio>
                    <Radio
                      value="Quarter"
                      data-cy="org-settings-fiscal-year-calendar-input-option-quarterly"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Quarterly</span>
                        <span className="text-xs text-gray-500 mt-1">
                          The fiscal year will be divided through out 3 months
                        </span>
                      </div>
                    </Radio>
                    <Radio
                      value="Semester"
                      data-cy="org-settings-fiscal-year-calendar-input-option-bianual"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Biannual</span>
                        <span className="text-xs text-gray-500 mt-1">
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
                className={`flex justify-end pt-2 pb-0 sm:p-2 gap-3 ${
                  isMobile
                    ? 'shadow-[10px_20px_50px_0px_#00000033]'
                    : 'shadow-none'
                }`}
              >
                <Button
                  type="default"
                  onClick={handleClose}
                  className="flex justify-center text-sm font-medium p-4 px-10 h-10"
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
                    className="flex justify-center text-sm font-medium p-4 px-10 h-10"
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
