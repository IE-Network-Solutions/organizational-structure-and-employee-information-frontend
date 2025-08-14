import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import React, { useEffect, useState } from 'react';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { Form, Input, Space, Spin } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { useSetAllowedArea } from '@/store/server/features/timesheet/allowedArea/mutation';
import { useGetAllowedArea } from '@/store/server/features/timesheet/allowedArea/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import EnhancedLocationPicker from '@/components/common/map/EnhancedLocationPicker';

const LocationSidebar = () => {
  const [areaId, setAreaId] = useState('');

  const [formValues, setFormValues] = useState({ latitude: 9.0322, longitude: 38.7636, distance: 0.01 });

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
  }, [areaId, refetch]);

  useEffect(() => {
    if (allowedAreaData) {
      const item = allowedAreaData.item;
      form.setFieldValue('title', item.title);
      form.setFieldValue('latitude', item.latitude);
      form.setFieldValue('longitude', item.longitude);
      // Convert from meters to kilometers for UI display
      form.setFieldValue('distance', Number(item.distance) / 1000);
      form.setFieldValue('isGlobal', Boolean(item.isGlobal));
      form.setFieldValue(
        'allowedUserAccesses',
        item.allowedUserAccesses?.map((e) => e.userId),
      );
      setFormValues({
        latitude: item.latitude,
        longitude: item.longitude,
        distance: Number(item.distance) / 1000, // Convert to kilometers for UI
      });
    } else {
      // Set default values for new location - centered on Addis Ababa, Ethiopia
      form.setFieldValue('latitude', 9.0322);
      form.setFieldValue('longitude', 38.7636);
      form.setFieldValue('distance', 0.01); // 10 meters = 0.01 km
      form.setFieldValue('isGlobal', true);
      setFormValues({
        latitude: 9.0322,
        longitude: 38.7636,
        distance: 0.01, // 10 meters = 0.01 km
      });
    }
  }, [allowedAreaData, form]);

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
  }, [isSuccess, onClose]);

  const onFinish = () => {
    const value = form.getFieldsValue();

    // Ensure we have valid coordinates and distance
    const latitude = value.latitude || formValues.latitude || 9.145;
    const longitude = value.longitude || formValues.longitude || 40.4897;
    const distance = value.distance || formValues.distance || 100;

    // Convert from kilometers to meters for backend
    // The backend expects distance in meters, but our UI works in kilometers
    const distanceInMeters = Math.max(Number(distance) * 1000, 10); // Minimum 10 meters

    const payload = {
      ...(allowedAreaData && allowedAreaData!.item),
      title: value.title,
      latitude: Number(latitude),
      longitude: Number(longitude),
      distance: distanceInMeters, // Send distance in meters to backend
      isGlobal: Boolean(value.isGlobal),
      allowedUserAccesses: value.allowedUserAccesses,
    };

    setAllowedArea(payload);
  };

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[40px] sm:h-[51px] w-full';

  const handleLocationChange = (lat: number, lng: number) => {
    form.setFieldValue('latitude', lat);
    form.setFieldValue('longitude', lng);
    setFormValues((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleRadiusChange = (radius: number) => {
    form.setFieldValue('distance', radius);
    setFormValues((prev) => ({ ...prev, distance: radius }));
  };

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => onClose()}
        modalHeader={
          <div className="px-2">
            <CustomDrawerHeader>
              {allowedAreaId ? 'Edit' : 'New'} Location
            </CustomDrawerHeader>
          </div>
        }
        footer={
          <div className="p-4">
            <CustomDrawerFooterButton buttons={footerModalItems} />
          </div>
        }
        width="800px"
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

            <div className="p-4">
              <Space.Compact
                direction="vertical"
                className="w-full"
              >
                <Form.Item
                  id="nameOfLocatioInputFieldId"
                  label="Name of Location"
                  rules={[{ required: true, message: 'Required' }]}
                  name="title"
                >
                  <Input className={controlClass} />
                </Form.Item>
                
                {/* Map Section */}
                <div>
                  <div className="text-sm text-gray-600 mb-2">
                    Double click on the map to set the center point of your allowed area
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Click and drag to explore, then double-click to select your location
                  </div>
                  <div className="mt-2">
                    <EnhancedLocationPicker
                      latitude={formValues.latitude}
                      longitude={formValues.longitude}
                      radius={formValues.distance}
                      onLocationChange={handleLocationChange}
                      onRadiusChange={handleRadiusChange}
                      height="400px"
                    />
                  </div>
                </div>



                {/* Hidden form fields for map values */}
                <Form.Item name="latitude" hidden>
                  <Input />
                </Form.Item>
                <Form.Item name="longitude" hidden>
                  <Input />
                </Form.Item>
                <Form.Item name="distance" hidden>
                  <Input />
                </Form.Item>
              </Space.Compact>
            </div>

          </Form>
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default LocationSidebar;
