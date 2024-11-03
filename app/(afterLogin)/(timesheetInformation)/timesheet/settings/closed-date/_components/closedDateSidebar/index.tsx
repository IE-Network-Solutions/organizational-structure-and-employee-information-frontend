import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Col, DatePicker, Form, Input, Radio, Row, Select, Space } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomLabel from '@/components/form/customLabel/customLabel';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import React, { useState } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useUpdateClosedDate } from '@/store/server/features/organizationStructure/fiscalYear/mutation';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { v4 as uuidv4 } from 'uuid'; // Import the UUID function
import { UUID } from 'crypto';
import dayjs from 'dayjs';

const ClosedDateSidebar = () => {
  const [isTo, setIsTo] = useState<boolean>(false);
  const {
    isShowClosedDateSidebar: isShow,
    setIsShowClosedDateSidebar: setIsShow,
    selectedClosedDate,
  } = useTimesheetSettingsStore();
  const { data: fiscalActiveYear } = useGetActiveFiscalYears();

  const { mutate: updateFiscalActiveYear } = useUpdateClosedDate();

  const [form] = Form.useForm();
  React.useEffect(() => {
    if (selectedClosedDate) {
      const formattedClosedDate = {
        ...selectedClosedDate,
        startDate: dayjs(selectedClosedDate.startDate) || null,
        endDate: dayjs(selectedClosedDate.endDate) || null,
      };
      form.setFieldsValue(formattedClosedDate);
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
      onClick: () => form.submit(),
    },
  ];

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';

  const onAddClosedDate = (values: any) => {
    const fiscalYearId = fiscalActiveYear?.id;
    const closedDates = [
      {
        id: uuidv4() as UUID, // Type assertion
        name: values.name,
        type: values.type,
        description: values.description,
        startDate: values?.startDate || null,
        endDate: values?.endDate || null,
      },
    ];

    if (fiscalYearId) {
      const existingClosedDates = fiscalActiveYear.closedDates || []; // Ensure existing closedDates are available
      const updatedClosedDates = [...existingClosedDates, ...closedDates]; // Combine existing with new closed dates

      // Call the update function with the updated closed dates
      updateFiscalActiveYear({ fiscalYearId, closedDates: updatedClosedDates });
      setIsShow(false);
      form.resetFields();
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
          startDate: values.startDate || null,
          endDate: values.endDate || null,
        };

        updateFiscalActiveYear({
          fiscalYearId,
          closedDates: updatedClosedDates,
        });
      }

      setIsShow(false);
      form.resetFields();
    }
  };

  const onFinish = (values: any) => {
    if (selectedClosedDate) {
      onUpdateClosedDate(values);
    } else {
      onAddClosedDate(values);
    }
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
            >
              <Input className={controlClass} />
            </Form.Item>
            <Form.Item
              id="closedDateTypeFieldId"
              label="Type"
              required
              name="type"
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
                <Form.Item
                  id="closedHolidayFromFieldId"
                  label="From"
                  required
                  name="startDate"
                >
                  <DatePicker className={controlClass} format="DD MMM YYYY" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  id="closedHolidayDateToFieldId"
                  label={
                    <Radio
                      checked={isTo}
                      onClick={() => {
                        setIsTo((prev) => !prev);
                      }}
                    >
                      To
                    </Radio>
                  }
                  name="endDate"
                >
                  <DatePicker
                    className={controlClass}
                    disabled={!isTo}
                    format="DD MMM YYYY"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Space>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default ClosedDateSidebar;
