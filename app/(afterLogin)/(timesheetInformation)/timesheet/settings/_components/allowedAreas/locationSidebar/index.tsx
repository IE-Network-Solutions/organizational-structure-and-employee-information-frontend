import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import React from 'react';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { Form, Input, InputNumber, Space } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { useSetAllowedArea } from '@/store/server/features/timesheet/allowedArea/mutation';

const LocationSidebar = () => {
  const { isShowLocationSidebar: isShow, setIsShowLocationSidebar: setIsShow } =
    useTimesheetSettingsStore();

  const { mutate: setAllowedArea } = useSetAllowedArea();

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

  const onFinish = () => {
    const value = form.getFieldsValue();
    setAllowedArea({
      title: value.title,
      latitude: value.latitude,
      longitude: value.longitude,
      distance: value.distance,
    });
    form.resetFields();
    setIsShow(false);
  };

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => setIsShow(false)}
        modalHeader={<CustomDrawerHeader>New Location</CustomDrawerHeader>}
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
      >
        <Form
          layout="vertical"
          requiredMark={CustomLabel}
          autoComplete="off"
          className={itemClass}
          form={form}
          onFinish={onFinish}
        >
          <Space direction="vertical" className="w-full" size={24}>
            <Form.Item
              label="Name of Location"
              rules={[{ required: true, message: 'Required' }]}
              name="title"
            >
              <Input className={controlClass} />
            </Form.Item>
            <Form.Item
              label="Latitude"
              rules={[{ required: true, message: 'Required' }]}
              name="latitude"
            >
              <InputNumber
                className="w-full py-[11px] mt-2.5"
                placeholder="Enter latitude"
              />
            </Form.Item>
            <Form.Item
              label="Longitude"
              rules={[{ required: true, message: 'Required' }]}
              name="longitude"
            >
              <InputNumber
                className="w-full py-[11px] mt-2.5"
                placeholder="Enter longitude"
              />
            </Form.Item>
            <Form.Item
              label="Radius"
              rules={[{ required: true, message: 'Required' }]}
              name="distance"
            >
              <InputNumber
                min={1}
                className="w-full py-[11px] mt-2.5"
                placeholder="Enter radius in km"
              />
            </Form.Item>
          </Space>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default LocationSidebar;
