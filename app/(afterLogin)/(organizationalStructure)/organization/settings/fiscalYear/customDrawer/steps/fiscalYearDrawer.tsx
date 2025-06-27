import {
  Input,
  Form,
  DatePicker,
  Button,
  Row,
  Col,
  Select,
  Tooltip,
  message,
} from 'antd';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import dayjs from 'dayjs';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useEffect } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

const FiscalYearForm: React.FC = () => {
  const [form] = Form.useForm();
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
  } = useFiscalYearDrawerStore();

  const { data: activeCalendar } = useGetActiveFiscalYears();
  const { data: departments } = useGetDepartments();

  const validateStartDate = (nonused: any, value: any) => {
    // Skip active calendar validation in edit mode
    if (!isEditMode) {
      if (
        activeCalendar?.endDate &&
        dayjs(value).isBefore(dayjs(activeCalendar?.endDate), 'day')
      ) {
        return Promise.reject(
          new Error(
            `Start date must be after or equal to ${dayjs(activeCalendar.endDate).format('YYYY-MM-DD')}.`,
          ),
        );
      }

      if (activeCalendar && dayjs(value).isBefore(dayjs(), 'day')) {
        return Promise.reject(new Error('Start date cannot be in the past.'));
      }
    }

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
      setCurrent(1);
    } catch (error) {
      message.error('Failed to proceed to next step. Please try again.');
    }
  };

  // Initialize form with stored values when component mounts or when returning from next step

  useEffect(() => {
    try {
      if (isEditMode && selectedFiscalYear) {
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
      } else if (!isEditMode && Object.keys(fiscalYearFormValues).length > 0) {
        // If we have stored form values (returning from next step), restore them
        form.setFieldsValue(fiscalYearFormValues);
        setCalendarType(fiscalYearFormValues.fiscalYearCalenderId || '');
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
      } else if (!isEditMode) {
        // Reset form when in create mode and no stored values
        form.resetFields();
        setCalendarType('');
        setFormValidation({
          fiscalYearName: '',
          fiscalYearStartDate: null,
          fiscalYearEndDate: null,
        });
        setIsFormValid(false);
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
  ]);

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

  return (
    <div className="flex flex-col h-[calc(50vh)] md:h-[calc(100vh-100px)]">
      <Form
        form={form}
        layout="vertical"
        onValuesChange={(nonused, allValues) => {
          try {
            setFormValidation({
              fiscalYearName: allValues.fiscalYearName,
              fiscalYearStartDate: allValues.fiscalYearStartDate,
              fiscalYearEndDate: allValues.fiscalYearEndDate,
            });

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
        className="flex flex-col flex-grow h-full"
      >
        <div className="flex flex-col justify-between h-full ">
          <div className="">
            <div className="px-3 sm:px-0">
              <Form.Item
                id="fiscalNameId"
                name="fiscalYearName"
                label={<span className="font-medium">Fiscal Year Name</span>}
                rules={[
                  {
                    required: true,
                    message: 'Please input the fiscal year name!',
                  },
                ]}
              >
                <Input
                  size="large"
                  className="h-12 mt-2 w-full font-normal text-sm"
                  placeholder="Enter fiscal year name"
                />
              </Form.Item>

              <Row gutter={[16, 10]}>
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                  <Form.Item
                    id="fiscalYearStartDateId"
                    name="fiscalYearStartDate"
                    label={<span className="font-medium">Start Date</span>}
                    rules={[
                      {
                        required: true,
                        message: 'Please select a start date!',
                      },
                      { validator: validateStartDate },
                    ]}
                  >
                    <DatePicker
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
                      className="h-12 w-full font-normal text-xl mt-2"
                    />
                  </Form.Item>
                  {!isEditMode ? (
                    <span className="text-xs font-normal mt-0 flex items-start text-nowrap mb-4 ml-1">
                      Active Calendar End date:
                      <span className="font-semibold ">
                        {activeCalendar?.endDate
                          ? dayjs(activeCalendar.endDate).format('YYYY-MM-DD')
                          : 'N/A'}
                      </span>
                    </span>
                  ) : (
                    ''
                  )}
                </Col>
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                  <Form.Item
                    id="fiscalYearEndDateId"
                    name="fiscalYearEndDate"
                    label={<span className="font-medium"> End Date</span>}
                    rules={[
                      { required: true, message: 'Please select an end date!' },
                      { validator: validateEndDate },
                    ]}
                  >
                    <DatePicker
                      onChange={(value: any) => handleEndDateChange(value)}
                      onBlur={() => {
                        // Trigger validation on blur to catch copy-paste scenarios
                        form.validateFields(['fiscalYearEndDate']);
                      }}
                      className="h-12 w-full font-normal text-xl mt-2"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                id="fiscalYearCalenderId"
                name="fiscalYearCalenderId"
                label={
                  <span className="font-medium">Fiscal Year Calendar</span>
                }
                rules={[
                  { required: true, message: 'Please select a calendar type!' },
                ]}
              >
                <Select
                  placeholder="Select Calendar"
                  className="h-12 w-full font-normal text-xl mt-2"
                  onChange={(value) => handleValuesChange(value)}
                  value={isEditMode ? calendarType : undefined}
                >
                  <Select.Option value="Quarter">Quarter</Select.Option>
                  <Select.Option value="Semester">Semester</Select.Option>
                  <Select.Option value="Year">Year</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>
          <div className="mt-auto">
            <Form.Item className="mb-0">
              <div
                className={`flex justify-center pt-3 pb-3 sm:p-2 space-x-5 ${
                  isMobile
                    ? 'shadow-[10px_20px_50px_0px_#00000033]'
                    : 'shadow-none'
                }`}
              >
                <Button
                  type="default"
                  onClick={handleClose}
                  className="flex justify-center text-sm font-medium p-4 px-10 h-10"
                >
                  Cancel
                </Button>
                <Tooltip
                  title={
                    !isFormValid
                      ? 'Please fill in all required fields (Fiscal Year Name, Start Date, End Date, and Calendar Type) to continue'
                      : ''
                  }
                  placement="top"
                >
                  <Button
                    onClick={handleNext}
                    disabled={!isFormValid}
                    className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-10 border-none"
                  >
                    Next
                  </Button>
                </Tooltip>
              </div>
            </Form.Item>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default FiscalYearForm;
