import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Col, Form, Input, InputNumber, Row, Select } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomLabel from '@/components/form/customLabel/customLabel';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { useSetAttendanceNotificationRule } from '@/store/server/features/timesheet/attendanceNotificationRule/mutation';

const CreateRuleSidebar = () => {
  const {
    isShowCreateRuleSidebar: isShow,
    setIsShowCreateRuleSidebar: setIsShow,
  } = useTimesheetSettingsStore();

  const { mutate: setAttendanceRule } = useSetAttendanceNotificationRule();

  const [form] = Form.useForm();

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[56px] text-base',
      size: 'large',
      onClick: () => setIsShow(false),
    },
    {
      label: 'Create',
      key: 'create',
      className: 'h-[56px] text-base',
      size: 'large',
      type: 'primary',
      onClick: () => form.submit(),
    },
  ];

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';

  const onFinish = () => {
    const value = form.getFieldsValue();
    setAttendanceRule({
      title: value.title,
    });
    form.resetFields();
    setIsShow(false);
  };

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => setIsShow(false)}
        modalHeader={<CustomDrawerHeader>Create Rule</CustomDrawerHeader>}
        footer={
          <CustomDrawerFooterButton
            className="max-w-[320px] ml-auto"
            buttons={footerModalItems}
          />
        }
        width="50%"
      >
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
                rules={[{ required: true, message: 'Required' }]}
                name="title"
              >
                <Input className={controlClass} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Type"
                rules={[{ required: true, message: 'Required' }]}
                name="type"
              >
                <Select
                  className={controlClass}
                  options={[
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Days Set"
                rules={[{ required: true, message: 'Required' }]}
                name="daysSet"
              >
                <InputNumber
                  min={1}
                  className="w-full py-[11px] mt-2.5"
                  placeholder="Enter radius in km"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Description"
                rules={[{ required: true, message: 'Required' }]}
                name="description"
              >
                <Input.TextArea className="w-full py-4 px-5 mt-2.5" rows={6} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default CreateRuleSidebar;
