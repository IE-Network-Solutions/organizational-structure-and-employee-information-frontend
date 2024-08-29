import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Col, Form, Input, InputNumber, Row, Select } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomLabel from '@/components/form/customLabel/customLabel';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';

const CreateRuleSidebar = () => {
  const { isShowCreateRule: isShow, setIsShowCreateRule: setIsShow } =
    useTimesheetSettingsStore();

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
      onClick: () => setIsShow(false),
    },
  ];

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';

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
          className={itemClass}
        >
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Form.Item label="Rule Name" required name="name">
                <Input className={controlClass} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Type" required name="type">
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
              <Form.Item label="Days Set" required name="daysSet">
                <InputNumber
                  min={1}
                  className="w-full py-[11px] mt-2.5"
                  placeholder="Enter radius in km"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Description" required name="description">
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
