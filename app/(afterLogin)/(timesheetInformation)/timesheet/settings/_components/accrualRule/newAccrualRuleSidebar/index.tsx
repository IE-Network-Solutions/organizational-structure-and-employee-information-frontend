import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Form, Input, Select, Space } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomLabel from '@/components/form/customLabel/customLabel';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { useSetAccrualRule } from '@/store/server/features/timesheet/accrualRule/mutation';
import { AccrualRulePeriod } from '@/types/timesheet/settings';

const AddTypesSidebar = () => {
  const {
    isShowNewAccrualRuleSidebar: isShow,
    setIsShowNewAccrualRuleSidebar: setIsShow,
  } = useTimesheetSettingsStore();

  const { mutate: createAccrualRule } = useSetAccrualRule();

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

  const onFinish = () => {
    const value = form.getFieldsValue();
    createAccrualRule({
      title: value.title,
      period: value.period,
    });
    form.resetFields();
    setIsShow(false);
  };

  const periodOption = [
    {
      value: AccrualRulePeriod.MONTHLY,
      label: 'Monthly',
    },
    {
      value: AccrualRulePeriod.QUARTER,
      label: 'Quarter',
    },
    {
      value: AccrualRulePeriod.YEAR,
      label: 'Year',
    },
  ];

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => setIsShow(false)}
        modalHeader={<CustomDrawerHeader>Accrual Rule</CustomDrawerHeader>}
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
              label="Accrual Name"
              rules={[{ required: true, message: 'Required' }]}
              name="title"
            >
              <Input className={controlClass} />
            </Form.Item>
            <Form.Item
              label="Accrual Period"
              rules={[{ required: true, message: 'Required' }]}
              name="period"
            >
              <Select className={controlClass} options={periodOption} />
            </Form.Item>
          </Space>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default AddTypesSidebar;
