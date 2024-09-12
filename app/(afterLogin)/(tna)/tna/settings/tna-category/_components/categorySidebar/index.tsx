import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Form, Input } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';

const TnaCategorySidebar = () => {
  const {
    isShowTnaCategorySidebar: isShow,
    setIsShowTnaCategorySidebar: setIsShow,
  } = useTnaSettingsStore();
  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-14',
      size: 'large',
      onClick: () => onClose(),
    },
    {
      label: 'Create',
      key: 'create',
      className: 'h-14',
      type: 'primary',
      size: 'large',
      onClick: () => onClose(),
    },
  ];

  const onClose = () => {
    setIsShow(false);
  };

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader className="flex justify-center">
            Add TNA Category
          </CustomDrawerHeader>
        }
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
      >
        <Form layout="vertical" requiredMark={CustomLabel}>
          <Form.Item
            name="title"
            label="TNA Name"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
          >
            <Input className="control" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
          >
            <Input.TextArea
              className="control-tarea"
              rows={6}
              placeholder="Enter the Description"
            />
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default TnaCategorySidebar;
