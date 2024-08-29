import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Form, Input, Select, Space } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomLabel from '@/components/form/customLabel/customLabel';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';

const AddTypesSidebar = () => {
  const {
    isShowNewAccrualRuleSidebar: isShow,
    setIsShowNewAccrualRuleSidebar: setIsShow,
  } = useTimesheetSettingsStore();

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
        modalHeader={<CustomDrawerHeader>Accrual Rule</CustomDrawerHeader>}
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
      >
        <Form
          layout="vertical"
          requiredMark={CustomLabel}
          autoComplete="off"
          className={itemClass}
        >
          <Space direction="vertical" className="w-full" size={24}>
            <Form.Item label="Accrual Name" required name="name">
              <Input className={controlClass} />
            </Form.Item>
            <Form.Item label="Accrual Period" required name="unit">
              <Select
                className={controlClass}
                options={[
                  { value: 'days', label: 'Days' },
                  { value: 'week', label: 'Week' },
                ]}
              />
            </Form.Item>
          </Space>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default AddTypesSidebar;
