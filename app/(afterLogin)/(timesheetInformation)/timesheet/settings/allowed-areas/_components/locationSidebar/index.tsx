import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import React, { useEffect, useState } from 'react';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { Form, Input, InputNumber, Select, Space, Spin, Switch } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { useSetAllowedArea } from '@/store/server/features/timesheet/allowedArea/mutation';
import { useGetAllowedArea } from '@/store/server/features/timesheet/allowedArea/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';

const LocationSidebar = () => {
  const [areaId, setAreaId] = useState('');
  const [showUsers, setShowUsers] = useState(false);
  const {
    isShowLocationSidebar: isShow,
    setIsShowLocationSidebar: setIsShow,
    allowedAreaId,
    setAllowedAreaId,
  } = useTimesheetSettingsStore();

  const { mutate: setAllowedArea, isSuccess, isLoading } = useSetAllowedArea();
  const {
    data: allowedAreaData,
    isFetching,
    refetch,
  } = useGetAllowedArea({ id: areaId });
  const { data: users } = useGetAllUsers();

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
      form.setFieldValue('distance', Number(item.distance));
      form.setFieldValue('isGlobal', Boolean(item.isGlobal));
      form.setFieldValue(
        'allowedUserAccesses',
        item.allowedUserAccesses?.map((e) => e.userId),
      );
      setShowUsers(!item.isGlobal);
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
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      loading: isLoading,
      onClick: () => onClose(),
    },
    {
      label: allowedAreaId ? 'Edit' : 'Create',
      key: 'create',
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      type: 'primary',
      loading: isFetching || isLoading,
      onClick: () => form.submit(),
    },
  ];

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess]);

  const onFinish = () => {
    const value = form.getFieldsValue();
    setAllowedArea({
      ...(allowedAreaData && allowedAreaData!.item),
      title: value.title,
      latitude: value.latitude,
      longitude: value.longitude,
      distance: Number(value.distance),
      isGlobal: Boolean(value.isGlobal),
      allowedUserAccesses: value.allowedUserAccesses,
    });
  };

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[40px] sm:h-[51px] w-full';

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
        footer={
          <div className="p-4">
            <CustomDrawerFooterButton buttons={footerModalItems} />
          </div>
        }
        width="400px"
      >
        <Spin spinning={isFetching || isLoading}>
          <Form
            layout="vertical"
            requiredMark={CustomLabel}
            autoComplete="off"
            className={itemClass}
            form={form}
            onFinish={onFinish}
          >
            <Space.Compact
              direction="vertical"
              className="w-full px-3 sm:px-0 "
            >
              {' '}
              <Form.Item
                id="nameOfLocatioInputFieldId"
                label="Name of Location"
                rules={[{ required: true, message: 'Required' }]}
                name="title"
              >
                <Input className={controlClass} />
              </Form.Item>
              <Form.Item
                id="latitudeOfLocatioInputFieldId"
                label="Latitude"
                rules={[{ required: true, message: 'Required' }]}
                name="latitude"
              >
                <InputNumber
                  className={controlClass}
                  placeholder="Enter latitude"
                />
              </Form.Item>
              <Form.Item
                id="longitudeOfLocatioInputFieldId"
                label="Longitude"
                rules={[{ required: true, message: 'Required' }]}
                name="longitude"
              >
                <InputNumber
                  className={controlClass}
                  placeholder="Enter longitude"
                />
              </Form.Item>
              <Form.Item
                label="Radius"
                id="distanceOfLocatioInputFieldId"
                rules={[{ required: true, message: 'Required' }]}
                name="distance"
              >
                <InputNumber
                  min={0.1}
                  className={controlClass}
                  placeholder="Enter radius in km"
                />
              </Form.Item>
              <Form.Item
                id="isGlobalLocation"
                label="Is Global"
                name="isGlobal"
              >
                <Switch
                  defaultChecked
                  onChange={(checked) => setShowUsers(!checked)}
                />
              </Form.Item>
              {showUsers && (
                <Form.Item
                  id="userAccessList"
                  label="Select Users"
                  name="allowedUserAccesses"
                >
                  <Select
                    mode="multiple"
                    showSearch
                    placeholder="Select a person"
                    className="w-full"
                    optionFilterProp="label"
                    options={users?.items?.map((list: any) => ({
                      value: list?.id,
                      label: `${list?.firstName ? list?.firstName : ''} ${list?.middleName ? list?.middleName : ''} ${list?.lastName ? list?.lastName : ''}`,
                    }))}
                  />
                </Form.Item>
              )}
            </Space.Compact>
          </Form>
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default LocationSidebar;
