import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Col, DatePicker, Form, Input, Select, Row, Space } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomLabel from '@/components/form/customLabel/customLabel';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import React from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useUpdateClosedDate } from '@/store/server/features/organizationStructure/fiscalYear/mutation';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'crypto';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const ClosedDateSidebar = () => {
  const {
    isShowClosedDateSidebar: isShow,
    setIsShowClosedDateSidebar: setIsShow,
    selectedClosedDate,
    dateType,
    setDateType,
  } = useTimesheetSettingsStore();

  const { data: fiscalActiveYear } = useGetActiveFiscalYears();

  const { mutate: updateFiscalActiveYear, isLoading } = useUpdateClosedDate();

  const [form] = Form.useForm();
  React.useEffect(() => {
    if (selectedClosedDate) {
      const formattedClosedDate = {
        ...selectedClosedDate,
        date: dayjs(selectedClosedDate.startDate) || null,
      };
      form.setFieldsValue(formattedClosedDate);
      setDateType(selectedClosedDate.type as 'day' | 'month');
    }
  }, [selectedClosedDate, form]);

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[56px] text-base',
      size: 'large',
      onClick: () => setIsShow(false),
    },
    {
      label: 'Add',
      key: 'add',
      className: 'h-[56px] text-base',
      size: 'large',
      type: 'primary',
      loading: isLoading,
      onClick: () => form.submit(),
    },
  ];

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';

  const onAddClosedDate = (values: any) => {
    const fiscalYearId = fiscalActiveYear?.id;

    const startDate = dayjs(values.date[0]);
    const endDate = dayjs(values.date[1]);

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
          date: values.date.format('YYYY-MM-DD') || null,
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
      <CustomDrawerLayout
        open={isShow}
        onClose={() => setIsShow(false)}
        modalHeader={<CustomDrawerHeader>Closed Date</CustomDrawerHeader>}
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
      >
        <Form
          layout="vertical"
          requiredMark={CustomLabel}
          autoComplete="off"
          form={form}
          className={itemClass}
          onFinish={onFinish}
        >
          <Space direction="vertical" className="w-full" size={24}>
            <Form.Item
              id="closedDateNameFieldId"
              label="Closed Date Name"
              required
              name="name"
              rules={[
                {
                  required: true,
                  message: 'Please enter the closed date name',
                },
              ]}
            >
              <Input className={controlClass} />
            </Form.Item>
            <Form.Item
              id="closedDateTypeFieldId"
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
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                }
                options={[
                  { value: 'day', label: 'Day' },
                  { value: 'month', label: 'Month' },
                ]}
                onChange={(value) => {
                  setDateType(value);
                  form.setFieldsValue({ date: null });
                }}
              />
            </Form.Item>

            <Form.Item
              id="closedHolidayDescriptionFieldId"
              label="Holiday Description"
              required
              name="description"
            >
              <Input.TextArea
                className="w-full py-4 px-5 mt-2.5"
                placeholder="Description"
                rows={6}
              />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                {dateType === 'day' && (
                  <Form.Item
                    id="closedHolidayFromFieldId"
                    label="Date"
                    required
                    name="date"
                    rules={[
                      { required: true, message: 'Please select a date' },
                    ]}
                  >
                    <DatePicker className={controlClass} format="DD MMM YYYY" />
                  </Form.Item>
                )}
                {dateType === 'month' && (
                  <Form.Item
                    id="closedHolidayRangeFieldId"
                    label="Range"
                    required
                    name="date"
                    rules={[
                      { required: true, message: 'Please select a date range' },
                    ]}
                  >
                    <RangePicker
                      className={controlClass}
                      format="DD MMM YYYY"
                      disabled={!dateType}
                      onChange={(date) => form.setFieldsValue({ date })}
                      disabledDate={disabledEndDate}
                    />
                  </Form.Item>
                )}
              </Col>
            </Row>
          </Space>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default ClosedDateSidebar;
