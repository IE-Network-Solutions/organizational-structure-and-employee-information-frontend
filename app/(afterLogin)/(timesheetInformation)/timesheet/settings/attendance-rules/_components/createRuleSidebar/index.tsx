import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Skeleton,
} from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
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

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[40px] sm:h-[51px] w-full';

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
      <Modal
        open={isShow}
        onCancel={() => onClose()}
        title={
          <div
            className="text-lg font-semibold text-[#4d4d4d]"
            id="time-attendance-settings-attendance-rules-create-rule-sidebar-header-container"
            data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-header-container"
          >
            {attendanceRuleId ? 'Edit Rule' : 'Create Rule'}
          </div>
        }
        footer={
          <div
            className="flex justify-end gap-2"
            id="time-attendance-settings-attendance-rules-create-rule-sidebar-footer-container"
            data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-footer-container"
          >
            <Button
              type="default"
              onClick={() => onClose()}
              id="time-attendance-settings-attendance-rules-create-rule-sidebar-cancel-button"
              data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-cancel-button"
              className="border border-[#D9D9D9] text-base font-normal text-gray-900"
              disabled={isFetching || isLoading}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={isFetching || isLoading}
              id="time-attendance-settings-attendance-rules-create-rule-sidebar-submit-button"
              data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-create-button"
            >
              {attendanceRuleId ? 'Save' : 'Create'}
            </Button>
          </div>
        }
        data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar"
        zIndex={10002}
        centered
        width={720}
      >
        <Skeleton
          loading={isFetching || isLoading}
          active
          data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-spin"
        >
          <Form
            layout="vertical"
            requiredMark={CustomLabel}
            autoComplete="off"
            form={form}
            className={itemClass}
            onFinish={onFinish}
            id="time-attendance-settings-attendance-rules-create-rule-sidebar-form"
            data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-form"
          >
            <Row
              gutter={[24, 24]}
              id="time-attendance-settings-attendance-rules-create-rule-sidebar-form-row"
              data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-form-row"
            >
              <Col
                data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-title-column"
                span={12}
              >
                <Form.Item
                  label={
                    <span
                      className="text-sm font-normal text-gray-900 pr-1"
                      data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-rule-name-label"
                    >
                      Rule Name
                    </span>
                  }
                  id="createRuleNameFieldId"
                  data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-title-field-id"
                  rules={[{ required: true, message: 'Required' }]}
                  name="title"
                >
                  <Input
                    className={controlClass}
                    id="time-attendance-settings-attendance-rules-create-rule-sidebar-title-input"
                    data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-title-input"
                  />
                </Form.Item>
              </Col>
              <Col
                data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-type-column"
                span={12}
              >
                <Form.Item
                  label={
                    <span
                      className="text-sm font-normal text-gray-900 pr-1"
                      data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-type-label"
                    >
                      Type
                    </span>
                  }
                  id="createRuleTypeFieldId"
                  data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-type-field-id"
                  rules={[{ required: true, message: 'Required' }]}
                  name="type"
                >
                  <Select
                    className={controlClass}
                    suffixIcon={
                      <MdKeyboardArrowDown
                        size={16}
                        className="text-gray-900"
                        data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-type-select-icon"
                      />
                    }
                    options={formatToOptions(
                      attendanceNotificationType,
                      'title',
                      'id',
                    )}
                    id="time-attendance-settings-attendance-rules-create-rule-sidebar-type-select"
                    data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-type-select"
                  />
                </Form.Item>
              </Col>
              <Col
                data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-days-set-column"
                span={24}
              >
                <Form.Item
                  label={
                    <span
                      className="text-sm font-normal text-gray-900 pr-1"
                      data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-days-set-label"
                    >
                      Days Set
                    </span>
                  }
                  id="createRuleDaysSetFieldId"
                  data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-days-set-field-id"
                  rules={[{ required: true, message: 'Required' }]}
                  name="count"
                >
                  <InputNumber
                    min={1}
                    className="w-full py-[11px] mt-2.5"
                    placeholder="Enter days"
                    id="time-attendance-settings-attendance-rules-create-rule-sidebar-days-set-input"
                    data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-days-set-input"
                  />
                </Form.Item>
              </Col>
              <Col
                span={24}
                data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-description-column"
              >
                <Form.Item
                  label={
                    <span
                      className="text-sm font-normal text-gray-900 pr-1"
                      data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-description-label"
                    >
                      Description
                    </span>
                  }
                  id="createRuleDescriptionFieldId"
                  data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-description-field-id"
                  rules={[{ required: true, message: 'Required' }]}
                  name="description"
                >
                  <Input.TextArea
                    className="w-full py-4 px-5 mt-2.5"
                    rows={6}
                    id="time-attendance-settings-attendance-rules-create-rule-sidebar-description-textarea"
                    data-cy="time-attendance-settings-attendance-rules-create-rule-sidebar-description-textarea"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Skeleton>
      </Modal>
    )
  );
};

export default CreateRuleSidebar;
