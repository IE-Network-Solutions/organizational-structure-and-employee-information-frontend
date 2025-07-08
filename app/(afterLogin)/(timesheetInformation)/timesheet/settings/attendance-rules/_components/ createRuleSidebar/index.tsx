import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Col, Form, Input, InputNumber, Row, Select, Spin } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomLabel from '@/components/form/customLabel/customLabel';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { useSetAttendanceNotificationRule } from '@/store/server/features/timesheet/attendanceNotificationRule/mutation';
import { formatToOptions } from '@/helpers/formatTo';
import { useGetAttendanceNotificationRule } from '@/store/server/features/timesheet/attendanceNotificationRule/queries';
import React, { useEffect } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';

const CreateRuleSidebar = () => {
  const {
    isShowCreateRuleSidebar: isShow,
    setIsShowCreateRuleSidebar: setIsShow,
    attendanceNotificationType,
    attendanceRuleId,
    setAttendanceRuleId,
  } = useTimesheetSettingsStore();

  const {
    data: attendanceRuleData,
    isFetching,
    refetch,
  } = useGetAttendanceNotificationRule(attendanceRuleId ?? '');
  const {
    mutate: setAttendanceRule,
    isLoading,
    isSuccess,
  } = useSetAttendanceNotificationRule();

  const [form] = Form.useForm();

  useEffect(() => {
    if (attendanceRuleId) {
      refetch();
    }
  }, [attendanceRuleId]);

  useEffect(() => {
    if (attendanceRuleData) {
      const item = attendanceRuleData.item;
      form.setFieldValue('title', item.title);
      form.setFieldValue('type', item.attendanceNotificationTypeId);
      form.setFieldValue('count', item.value);
      form.setFieldValue('description', item.description);
    }
  }, [attendanceRuleData]);

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess]);

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[56px] text-base',
      size: 'large',
      loading: isFetching || isLoading,
      onClick: () => onClose(),
    },
    {
      label: 'Create',
      key: 'create',
      className: 'h-[56px] text-base',
      size: 'large',
      type: 'primary',
      loading: isFetching || isLoading,
      onClick: () => form.submit(),
    },
  ];

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';

  const onFinish = () => {
    const value = form.getFieldsValue();
    setAttendanceRule({
      ...(attendanceRuleId && attendanceRuleData!.item),
      title: value.title,
      attendanceNotificationType: value.type,
      value: value.count,
      description: value.description,
    });
  };

  const onClose = () => {
    form.resetFields();
    setAttendanceRuleId(null);
    setIsShow(false);
  };

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => onClose()}
        modalHeader={<CustomDrawerHeader>Create Rule</CustomDrawerHeader>}
        footer={
          <CustomDrawerFooterButton
            className="max-w-[320px] ml-auto"
            buttons={footerModalItems}
          />
        }
        width="50%"
      >
        <Spin spinning={isFetching || isLoading}>
          <Form
            layout="vertical"
            requiredMark={CustomLabel}
            autoComplete="off"
            form={form}
            className={itemClass}
            onFinish={onFinish}
          >
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Form.Item
                  label="Rule Name"
                  id="createRuleNameFieldId"
                  rules={[{ required: true, message: 'Required' }]}
                  name="title"
                >
                  <Input className={controlClass} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Type"
                  id="createRuleTypeFieldId"
                  rules={[{ required: true, message: 'Required' }]}
                  name="type"
                >
                  <Select
                    className={controlClass}
                    suffixIcon={
                      <MdKeyboardArrowDown
                        size={16}
                        className="text-gray-900"
                      />
                    }
                    options={formatToOptions(
                      attendanceNotificationType,
                      'title',
                      'id',
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Days Set"
                  id="createRuleDaysSetFieldId"
                  rules={[{ required: true, message: 'Required' }]}
                  name="count"
                >
                  <InputNumber
                    min={1}
                    className="w-full py-[11px] mt-2.5"
                    placeholder="Enter days"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Description"
                  id="createRuleDescriptionFieldId"
                  rules={[{ required: true, message: 'Required' }]}
                  name="description"
                >
                  <Input.TextArea
                    className="w-full py-4 px-5 mt-2.5"
                    rows={6}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default CreateRuleSidebar;
