import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Col, DatePicker, Form, Input, Row, Radio, Modal } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import React from 'react';
import { useUpdateClosedDate } from '@/store/server/features/organizationStructure/fiscalYear/mutation';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';
import dayjs from 'dayjs';

const ClosedDateSidebar = () => {
  const {
    isShowClosedDateSidebar: isShow,
    setIsShowClosedDateSidebar: setIsShow,
    selectedClosedDate,
    isTo,
    setIsTo,
  } = useTimesheetSettingsStore();

  const { data: fiscalActiveYear } = useGetActiveFiscalYears();

  const { mutate: updateFiscalActiveYear, isLoading } = useUpdateClosedDate();

  const [form] = Form.useForm();
  React.useEffect(() => {
    if (selectedClosedDate) {
      const formattedClosedDate = {
        ...selectedClosedDate,
        startDate: dayjs(selectedClosedDate.date),
      };
      form.setFieldsValue(formattedClosedDate);
    }
  }, [selectedClosedDate, form]);

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[40px] text-sm border-1 border-[#D9D9D9] text-[#4d4d4d]',
      size: 'large',
      onClick: () => {
        (setIsShow(false), form.resetFields());
      },
      id: 'time-attendance-settings-closed-date-sidebar-cancel-button',
      'data-cy': 'time-attendance-settings-closed-date-sidebar-cancel-button',
    },
    {
      label: selectedClosedDate ? 'Edit' : 'Create',
      key: 'add',
      className: 'h-[40px] text-sm',
      size: 'large',
      type: 'primary',
      loading: isLoading,
      onClick: () => form.submit(),
      id: 'time-attendance-settings-closed-date-sidebar-submit-button',
      'data-cy': 'time-attendance-settings-closed-date-sidebar-submit-button',
    },
  ];

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[40px] w-full';

  const onAddClosedDate = (values: any) => {
    const fiscalYearId = fiscalActiveYear?.id;
    const startDate = dayjs(values.startDate);
    const endDate = isTo && values.endDate ? dayjs(values.endDate) : startDate; // Use endDate if "To" is selected

    const closedDates = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      closedDates.push({
        id: uuidv4() as UUID,
        name: values.name,
        type: values.type,
        description: values.description,
        date: currentDate.format('YYYY-MM-DD'),
      });
      currentDate = currentDate.add(1, 'day');
    }

    if (fiscalYearId) {
      const existingClosedDates = fiscalActiveYear.closedDates || [];
      const updatedClosedDates = [...existingClosedDates, ...closedDates];

      updateFiscalActiveYear(
        { fiscalYearId, closedDates: updatedClosedDates },
        {
          onSuccess: () => {
            setIsShow(false);
            form.resetFields();
          },
        },
      );
    }
  };

  const onUpdateClosedDate = (values: any) => {
    const fiscalYearId = fiscalActiveYear?.id;

    if (fiscalYearId) {
      const existingClosedDates = fiscalActiveYear.closedDates || [];
      const indexToUpdate = existingClosedDates.findIndex(
        (date) => date.id === selectedClosedDate.id,
      );

      if (indexToUpdate > -1) {
        const updatedClosedDates = [...existingClosedDates];
        updatedClosedDates[indexToUpdate] = {
          ...updatedClosedDates[indexToUpdate],
          name: values.name,
          type: values.type,
          description: values.description,
          date: dayjs(values.startDate).format('YYYY-MM-DD'),
        };

        updateFiscalActiveYear(
          {
            fiscalYearId,
            closedDates: updatedClosedDates,
          },
          {
            onSuccess: () => {
              setIsShow(false);
              form.resetFields();
            },
          },
        );
      }
    }
  };

  const onFinish = (values: any) => {
    if (selectedClosedDate) {
      onUpdateClosedDate(values);
    } else {
      onAddClosedDate(values);
    }
  };

  const disabledEndDate = (current: any) => {
    const startDate = form.getFieldValue('startDate');
    return current && startDate
      ? current.isBefore(startDate, 'day') || current.isSame(startDate, 'day')
      : false;
  };

  return (
    isShow && (
      <Modal
        open={isShow}
        onCancel={() => setIsShow(false)}
        title={
          <div
            className="text-lg font-semibold text-[#4d4d4d]"
            id="time-attendance-settings-closed-date-sidebar-header-container"
            data-cy="time-attendance-settings-closed-date-sidebar-header-container"
          >
            Closed Date
          </div>
        }
        footer={
          <div
            className="flex justify-end"
            id="time-attendance-settings-closed-date-sidebar-footer-container"
            data-cy="time-attendance-settings-closed-date-sidebar-footer-container"
          >
            <CustomDrawerFooterButton
              buttons={footerModalItems}
              data-cy="time-attendance-settings-closed-date-sidebar-footer-button"
            />
          </div>
        }
        data-cy="time-attendance-settings-closed-date-sidebar"
      >
        <Form
          layout="vertical"
          requiredMark={CustomLabel}
          autoComplete="off"
          form={form}
          className={itemClass}
          onFinish={onFinish}
          id="time-attendance-settings-closed-date-sidebar-form"
          data-cy="time-attendance-settings-closed-date-sidebar-form"
        >
          <Form.Item
            id="closedDateNameFieldId"
            data-cy="time-attendance-settings-closed-date-sidebar-name-field-id"
            label={
              <span
                data-cy="time-attendance-settings-closed-date-sidebar-name-label"
                className="text-sm font-normal text-gray-900 pr-1"
              >
                Name
              </span>
            }
            required
            name="name"
            rules={[
              {
                required: true,
                message: 'Please enter the closed date name',
              },
            ]}
          >
            <Input
              className={controlClass}
              id="time-attendance-settings-closed-date-sidebar-name-input"
              data-cy="time-attendance-settings-closed-date-sidebar-name-input"
            />
          </Form.Item>
          <Row
            gutter={16}
            id="time-attendance-settings-closed-date-sidebar-date-row"
            data-cy="time-attendance-settings-closed-date-sidebar-date-row"
          >
            <Col
              span={12}
              data-cy="time-attendance-settings-closed-date-sidebar-from-column"
            >
              <Form.Item
                id="closedHolidayFromFieldId"
                data-cy="time-attendance-settings-closed-date-sidebar-from-field-id"
                label={
                  <span
                    data-cy="time-attendance-settings-closed-date-sidebar-from-label"
                    className="text-sm font-normal text-gray-900 pr-1"
                  >
                    From
                  </span>
                }
                required
                name="startDate"
                rules={[
                  { required: true, message: 'Please select the start date' },
                ]}
              >
                <DatePicker
                  className={controlClass}
                  format="DD MMM YYYY"
                  id="time-attendance-settings-closed-date-sidebar-from-picker"
                  data-cy="time-attendance-settings-closed-date-sidebar-from-picker"
                />
              </Form.Item>
            </Col>
            <Col
              span={12}
              data-cy="time-attendance-settings-closed-date-sidebar-to-column"
            >
              <Form.Item
                id="closedHolidayDateToFieldId"
                data-cy="time-attendance-settings-closed-date-sidebar-to-field-id"
                label={
                  <Radio
                    checked={isTo}
                    onClick={() => setIsTo(!isTo)}
                    data-cy="time-attendance-settings-closed-date-sidebar-to-radio"
                  >
                    <span
                      data-cy="time-attendance-settings-closed-date-sidebar-to-label"
                      className="text-sm font-normal text-gray-900 pr-1"
                    >
                      To
                    </span>
                  </Radio>
                }
                name="endDate"
              >
                <DatePicker
                  className={controlClass}
                  disabled={!isTo}
                  format="DD MMM YYYY"
                  disabledDate={disabledEndDate}
                  id="time-attendance-settings-closed-date-sidebar-to-picker"
                  data-cy="time-attendance-settings-closed-date-sidebar-to-picker"
                />
              </Form.Item>
            </Col>
          </Row>
          {/* <Form.Item
              id="closedDateTypeFieldId"
              data-cy="time-attendance-settings-closed-date-sidebar-type-field-id"
              label="Type"
              required
              name="type"
              rules={[
                {
                  required: true,
                  message: 'Please Select the closed date Type',
                },
              ]}
            >
              <Select
                className={controlClass}
                suffixIcon={
                  <MdKeyboardArrowDown
                    size={16}
                    className="text-gray-900"
                    data-cy="time-attendance-settings-closed-date-sidebar-type-select-icon"
                  />
                }
                options={[
                  { value: 'day', label: 'Day' },
                  { value: 'month', label: 'Month' },
                ]}
                id="time-attendance-settings-closed-date-sidebar-type-select"
                data-cy="time-attendance-settings-closed-date-sidebar-type-select"
              />
            </Form.Item> */}
          <Form.Item
            id="closedHolidayDescriptionFieldId"
            data-cy="time-attendance-settings-closed-date-sidebar-description-field-id"
            label={
              <span
                data-cy="time-attendance-settings-closed-date-sidebar-description-label"
                className="text-sm font-normal text-gray-900 pr-1"
              >
                Description
              </span>
            }
            required
            name="description"
          >
            <Input.TextArea
              className="w-full h-14 px-5 mt-2.5"
              placeholder="Description"
              rows={6}
              id="time-attendance-settings-closed-date-sidebar-description-textarea"
              data-cy="time-attendance-settings-closed-date-sidebar-description-textarea"
            />
          </Form.Item>
        </Form>
      </Modal>
    )
  );
};

export default ClosedDateSidebar;
