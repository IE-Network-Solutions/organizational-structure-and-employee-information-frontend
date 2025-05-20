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

  /* eslint-disable-next-line @typescript-eslint/naming-convention */
  const validateStartDate = (_: any, value: any) => {
    /* eslint-enable-next-line @typescript-eslint/naming-convention */
    if (!value) {
      return Promise.reject(new Error('Please select a start date.'));
    }
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

    return Promise.resolve();
  };
  /* eslint-disable-next-line @typescript-eslint/naming-convention */
  const validateEndDate = (_: any, value: any) => {
    /* eslint-enable-next-line @typescript-eslint/naming-convention */

    const startDate = form.getFieldValue('fiscalYearStartDate');

    if (!value) {
      return Promise.reject(new Error('Please select an end date.'));
    }

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
    setSelectedFiscalYear(null);
    setCalendarType('');
    setOpenFiscalYearDrawer(false);
  };

  // const handleValuesChange = (val: string) => setCalendarType(val);
  // const handleStartDateChange = (val: any) => setFiscalYearStart(val);
  // const handleEndDateChange = (val: any) => setFiscalYearEnd(val);

  // const handleNext = () => {
  //   const currentValues = form.getFieldsValue();
  //   setFiscalYearFormValues(currentValues);
  //   setCurrent(1);
  // };

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
  });

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
        if (sessionCount === 4) {
          newCalendarType = 'Quarter';
        } else if (sessionCount === 2) {
          newCalendarType = 'Semester';
        } else if (sessionCount === 1) {
          newCalendarType = 'Year';
        }

        setCalendarType(newCalendarType);

        form.setFieldsValue({
          fiscalYearName: selectedFiscalYear?.name,
          fiscalYearStartDate: dayjs(selectedFiscalYear?.startDate),
          fiscalYearEndDate: dayjs(selectedFiscalYear?.endDate),
          fiscalYearCalenderId: newCalendarType,
          fiscalYearDescription: dayjs(selectedFiscalYear?.description),
        });
      } else if (Object.keys(fiscalYearFormValues).length > 0) {
        // If we have stored form values (returning from next step), restore them
        form.setFieldsValue(fiscalYearFormValues);
        setFormValidation({
          fiscalYearName: fiscalYearFormValues.fiscalYearName,
          fiscalYearStartDate: fiscalYearFormValues.fiscalYearStartDate,
          fiscalYearEndDate: fiscalYearFormValues.fiscalYearEndDate,
        });
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
  ]);

  // Update form validation state when form values change
  useEffect(() => {
    try {
      const checkFormValidity = () => {
        const isValid = Boolean(
          formValidation.fiscalYearName &&
            formValidation.fiscalYearStartDate &&
            formValidation.fiscalYearEndDate &&
            calendarType,
        );
        setIsFormValid(isValid);
      };

      checkFormValidity();
    } catch (error) {
      message.error('Failed to validate form. Please refresh the page.');
    }
  }, [formValidation, setIsFormValid, calendarType]);

  return (
    <div className="flex flex-col min-h-[100vh]">
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
          } catch (error) {
            message.error('Failed to update form values. Please try again.');
          }
        }}
        className="flex flex-col flex-grow"
      >
        <div className="px-3 sm:px-0 flex-grow">
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
                    { required: true, message: 'Please select a start date!' },
                    { validator: validateStartDate },
                  ]}
                >
                  <DatePicker
                    onChange={(value: any) => handleStartDateChange(value)}
                    className="h-10 w-full font-normal text-xl mt-2"
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
                    className="h-10 w-full font-normal text-xl mt-2"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              id="fiscalYearCalenderId"
              name="fiscalYearCalenderId"
              label={<span className="font-medium">Fiscal Year Calendar</span>}
              initialValue={calendarType}
              rules={[
                { required: true, message: 'Please select a calendar type!' },
              ]}
            >
              <Select
                placeholder="Select Calendar"
                className="h-10 w-full font-normal text-xl mt-2"
                onChange={(value) => handleValuesChange(value)}
                value={calendarType}
              >
                <Select.Option value="Quarter">Quarter</Select.Option>
                <Select.Option value="Semester">Semester</Select.Option>
                <Select.Option value="Year">Year</Select.Option>
              </Select>
            </Form.Item>
          </div>
        </div>

        <Form.Item className="mb-0">
          <div
            className={`flex justify-center pt-3 pb-3 sm:p-2 space-x-5 ${
              isMobile ? 'shadow-[10px_20px_50px_0px_#00000033]' : 'shadow-none'
            }`}
          >
            {departments?.length > 0 && (
              <Button
                type="default"
                onClick={handleClose}
                className="h-[40px] text-base px-10"
              >
                Cancel
              </Button>
            )}
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
      </Form>
    </div>
  );
};

export default FiscalYearForm;
