import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import React, { useEffect, useState } from 'react';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { Form, Input, InputNumber, Space, Spin } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { useSetAllowedArea } from '@/store/server/features/timesheet/allowedArea/mutation';
import { useGetAllowedArea } from '@/store/server/features/timesheet/allowedArea/queries';

const LocationSidebar = () => {
  const [areaId, setAreaId] = useState('');
  const {
    isShowLocationSidebar: isShow,
    setIsShowLocationSidebar: setIsShow,
    allowedAreaId,
    setAllowedAreaId,
  } = useTimesheetSettingsStore();

  const { mutate: setAllowedArea } = useSetAllowedArea();
  const {
    data: allowedAreaData,
    isFetching,
    refetch,
  } = useGetAllowedArea({ id: areaId });

  const [form] = Form.useForm();

  useEffect(() => {
    setAreaId(allowedAreaId ?? '');
  }, [allowedAreaId]);

  useEffect(() => {
    if (areaId) {
      refetch();
    }
  }, [areaId]);

  useEffect(() => {
    if (allowedAreaData) {
      const item = allowedAreaData.item;
      form.setFieldValue('title', item.title);
      form.setFieldValue('latitude', item.latitude);
      form.setFieldValue('longitude', item.longitude);
      form.setFieldValue('distance', item.distance);
    }
  }, [allowedAreaData]);

  const onClose = () => {
    form.resetFields();
    setAllowedAreaId('');
    setIsShow(false);
  };

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[56px] text-base',
      size: 'large',
      onClick: () => onClose(),
    },
    {
      label: allowedAreaId ? 'Edit' : 'Create',
      key: 'create',
      className: 'h-[56px] text-base',
      size: 'large',
      type: 'primary',
      loading: isFetching,
      onClick: () => form.submit(),
    },
  ];

  const onFinish = () => {
    const value = form.getFieldsValue();
    setAllowedArea({
      ...(allowedAreaData && allowedAreaData!.item),
      title: value.title,
      latitude: value.latitude,
      longitude: value.longitude,
      distance: value.distance,
    });
    onClose();
  };

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader>
            {allowedAreaId ? 'Edit' : 'New'} Location
          </CustomDrawerHeader>
        }
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
      >
        <Spin spinning={isFetching}>
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
                  placeholder="Enter radius"
                />
              </Form.Item>
            </Space>
          </Form>
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default LocationSidebar;
