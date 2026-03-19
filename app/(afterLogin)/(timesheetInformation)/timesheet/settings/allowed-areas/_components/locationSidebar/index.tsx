import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Form,
  Input,
  Space,
  Spin,
  Switch,
  Select,
  Modal,
  Button,
  Slider,
  message,
  InputNumber,
  Tag,
} from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useSetAllowedArea } from '@/store/server/features/timesheet/allowedArea/mutation';
import { useGetAllowedArea } from '@/store/server/features/timesheet/allowedArea/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import EnhancedLocationPicker from '@/components/common/map/EnhancedLocationPicker';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

const LocationSidebar = () => {
  const [areaId, setAreaId] = useState('');
  const [showUsers, setShowUsers] = useState(false);

  const [formValues, setFormValues] = useState({
    latitude: 9.0322,
    longitude: 38.7636,
    distance: 0.01,
  });

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
      form.setFieldValue('distance', Number(item.distance));
      form.setFieldValue('isGlobal', Boolean(item.isGlobal));
      form.setFieldValue(
        'allowedUserAccesses',
        item.allowedUserAccesses?.map((e) => e.userId),
      );
      setFormValues({
        latitude: item.latitude,
        longitude: item.longitude,
        distance: Number(item.distance),
      });
      setShowUsers(!item.isGlobal);
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
      setShowUsers(false);
    }
  }, [allowedAreaData]);

  const onClose = useCallback(() => {
    form.resetFields();
    setAllowedAreaId('');
    setIsShow(false);
  }, [form, setAllowedAreaId, setIsShow]);

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
  const controlClass = 'mt-2.5 h-[40px] w-full';

  const handleLocationChange = (lat: number, lng: number) => {
    form.setFieldValue('latitude', lat);
    form.setFieldValue('longitude', lng);
    setFormValues((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleRadiusChange = (radius: number) => {
    form.setFieldValue('distance', radius);
    setFormValues((prev) => ({ ...prev, distance: radius }));
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocationChange(latitude, longitude);
          message.success('Current location set successfully!');
        },
        () => {
          message.error(
            'Unable to get current location. Please select manually.',
          );
        },
      );
    } else {
      message.error('Geolocation is not supported by this browser.');
    }
  };

  return (
    isShow && (
      <Modal
        data-cy="time-attendance-settings-allowed-areas-sidebar-container"
        open={isShow}
        onCancel={() => onClose()}
        title={
          <div
            className="text-lg font-semibold text-[#4d4d4d]"
            id="time-attendance-settings-allowed-areas-sidebar-header-container"
            data-cy="time-attendance-settings-allowed-areas-sidebar-header-container"
          >
            {allowedAreaId ? 'Edit' : 'New'} Location
          </div>
        }
        footer={
          <div
            className="flex items-center justify-end gap-3"
            id="time-attendance-settings-allowed-areas-sidebar-footer-container"
            data-cy="time-attendance-settings-allowed-areas-sidebar-footer-container"
          >
            <Button
              type="default"
              className="h-10 px-6 rounded-lg"
              onClick={() => onClose()}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="h-10 px-6 rounded-lg"
              onClick={() => form.submit()}
            >
              {allowedAreaId ? 'Update' : 'Create'}
            </Button>
          </div>
        }
        width={880}
        zIndex={10002}
        centered
      >
        <Spin
          spinning={isFetching || isLoading}
          data-cy="time-attendance-settings-allowed-areas-sidebar-spin"
        >
          <Form
            layout="vertical"
            requiredMark={CustomLabel}
            autoComplete="off"
            className={itemClass}
            form={form}
            onFinish={onFinish}
            id="time-attendance-settings-allowed-areas-sidebar-form"
            data-cy="time-attendance-settings-allowed-areas-sidebar-form"
          >
            <div
              className="p-4"
              id="time-attendance-settings-allowed-areas-sidebar-form-container"
              data-cy="time-attendance-settings-allowed-areas-sidebar-form-container"
            >
              <Space.Compact
                direction="vertical"
                className="w-full"
                id="time-attendance-settings-allowed-areas-sidebar-form-fields"
                data-cy="time-attendance-settings-allowed-areas-sidebar-form-fields"
              >
                <Form.Item
                  id="time-attendance-settings-allowed-areas-sidebar-title"
                  data-cy="time-attendance-settings-allowed-areas-sidebar-title"
                  label={
                    <span
                      data-cy="time-attendance-settings-allowed-areas-sidebar-title-label"
                      className="text-sm font-normal text-gray-900 pr-1"
                    >
                      Location Name
                    </span>
                  }
                  rules={[{ required: true, message: 'Required' }]}
                  name="title"
                >
                  <Input
                    className={controlClass}
                    id="time-attendance-settings-allowed-areas-sidebar-title-input"
                    data-cy="time-attendance-settings-allowed-areas-sidebar-title-input"
                  />
                </Form.Item>

                {/* Helper banner */}
                <div
                  className="mt-1 mb-4 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3"
                  id="time-attendance-settings-allowed-areas-sidebar-info-banner"
                  data-cy="time-attendance-settings-allowed-areas-sidebar-info-banner"
                >
                  
                  <div
                    data-cy="time-attendance-settings-allowed-areas-sidebar-info-banner-text"
                    id="time-attendance-settings-allowed-areas-sidebar-info-banner-text"
                    className="flex gap-2 mb-2 items-center"
                  >
                    <div
                    data-cy="time-attendance-settings-allowed-areas-sidebar-info-banner-icon"
                    className="h-4 w-4 flex items-center justify-center rounded-full border border-[#1E40AF] text-[#1E40AF] text-xs font-semibold"
                  >
                    i
                  </div>
                    <div
                      data-cy="time-attendance-settings-allowed-areas-sidebar-info-banner-text-title"
                      id="time-attendance-settings-allowed-areas-sidebar-info-banner-text-title"
                      className="font-normal text-sm text-[#1E40AF] bg-[#e6f4ff]"
                    >
                      How to set your location:
                    </div>
                  </div>
                  <p
                      data-cy="time-attendance-settings-allowed-areas-sidebar-info-banner-text-description"
                      id="time-attendance-settings-allowed-areas-sidebar-info-banner-text-description"
                      className=" bg-[#e6f4ff] m-0 text-sm font-normal text-[#2748b3]"
                    >
                      Click anywhere on the map to set your location. Adjust the
                      radius slider to define the area coverage, or use the
                      &quot;Use Current Location&quot; button for quick setup.
                    </p>
                 
                </div>

                {/* Map Section */}
                <div
                  id="time-attendance-settings-allowed-areas-sidebar-map-container"
                  data-cy="time-attendance-settings-allowed-areas-sidebar-map-container"
                >
                  <div
                    data-cy="time-attendance-settings-allowed-areas-sidebar-map-title"
                    id="time-attendance-settings-allowed-areas-sidebar-map-title"
                    className="flex items-center justify-between mb-2"
                  >
                    <span
                      data-cy="time-attendance-settings-allowed-areas-sidebar-map-title-text"
                      id="time-attendance-settings-allowed-areas-sidebar-map-title-text"
                      className="text-sm font-normal text-gray-900"
                    >
                      Location Map
                    </span>
                    <Button
                      type="default"
                      onClick={handleUseCurrentLocation}
                      className="h-9 px-4 rounded-lg text-sm border-[#D9D9D9] text-[#4d4d4d]"
                      id="time-attendance-settings-allowed-areas-sidebar-use-current-location-btn"
                      data-cy="time-attendance-settings-allowed-areas-sidebar-use-current-location-btn"
                      icon={<LocationOnOutlinedIcon className="text-sm" />}
                    >
                      Use Current Location
                    </Button>
                  </div>
                  <div
                    className="mt-2 rounded-lg border border-gray-200 overflow-hidden"
                    id="time-attendance-settings-allowed-areas-sidebar-map-picker-container"
                    data-cy="time-attendance-settings-allowed-areas-sidebar-map-picker-container"
                  >
                    <EnhancedLocationPicker
                      latitude={formValues.latitude}
                      longitude={formValues.longitude}
                      radius={formValues.distance}
                      onLocationChange={handleLocationChange}
                      onRadiusChange={handleRadiusChange}
                      height="400px"
                      data-cy="time-attendance-settings-allowed-areas-sidebar-map-picker"
                    />
                  </div>
                </div>

                {/* Hidden form fields for map values */}
                <Form.Item
                  data-cy="time-attendance-settings-allowed-areas-sidebar-latitude-form-item"
                  name="latitude"
                  hidden
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  data-cy="time-attendance-settings-allowed-areas-sidebar-longitude-form-item"
                  name="longitude"
                  hidden
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  data-cy="time-attendance-settings-allowed-areas-sidebar-distance-form-item"
                  name="distance"
                  hidden
                >
                  <Input />
                </Form.Item>

                {/* Radius display (mirrors EnhancedLocationPicker behaviour) */}
                <div
                  data-cy="time-attendance-settings-allowed-areas-sidebar-radius-container"
                  id="time-attendance-settings-allowed-areas-sidebar-radius-container"
                  className="mt-4"
                >
                  <div
                    data-cy="time-attendance-settings-allowed-areas-sidebar-radius-label-container"
                    id="time-attendance-settings-allowed-areas-sidebar-radius-label-container"
                    className="flex items-center justify-between mb-2"
                  >
                    <span
                      data-cy="time-attendance-settings-allowed-areas-sidebar-radius-label"
                      id="time-attendance-settings-allowed-areas-sidebar-radius-label"
                      className="text-sm font-normal text-gray-900"
                    >
                      Radius
                    </span>
                    <div
                      data-cy="time-attendance-settings-allowed-areas-sidebar-radius-input-container"
                      id="time-attendance-settings-allowed-areas-sidebar-radius-input-container"
                      className="flex items-center gap-2"
                    >
                      
                      <Tag
              data-cy="components-common-map-enhancedlocationpicker-tsx-enhancedlocationpicker-span-196"
              className="bg-[#e6f4ff] text-[#237fff] border border-[#bcdfff] py-1 px-2 rounded-[4px]"
            >
              {formValues.distance} km
            </Tag>
                    </div>
                  </div>
                  <Slider
                    min={0.01}
                    max={0.5}
                    step={0.001}
                    value={formValues.distance}
                    onChange={(value) => {
                      if (typeof value === 'number') {
                        handleRadiusChange(value);
                      }
                    }}
                    marks={{
                      0.01: '10 m',
                      0.05: '50 m',
                      0.1: '100 m',
                      0.2: '200 m',
                      0.3: '300 m',
                      0.4: '400 m',
                      0.5: '500 m',
                    }}
                    id="time-attendance-settings-allowed-areas-sidebar-radius-slider"
                    data-cy="time-attendance-settings-allowed-areas-sidebar-radius-slider"
                    className="mt-4"
                  />
                </div>

                {/* Lat / Long display (editable, mirrors EnhancedLocationPicker behaviour) */}
                <div
                  data-cy="time-attendance-settings-allowed-areas-sidebar-latitude-longitude-container"
                  id="time-attendance-settings-allowed-areas-sidebar-latitude-longitude-container"
                  className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  <div
                    data-cy="time-attendance-settings-allowed-areas-sidebar-latitude-container"
                    id="time-attendance-settings-allowed-areas-sidebar-latitude-container"
                    className="space-y-1"
                  >
                    <span
                      data-cy="time-attendance-settings-allowed-areas-sidebar-latitude-label"
                      id="time-attendance-settings-allowed-areas-sidebar-latitude-label"
                      className="text-sm font-normal text-gray-900"
                    >
                      Latitude
                    </span>
                    <InputNumber
                      value={formValues.latitude}
                      precision={6}
                      onChange={(value) => {
                        if (value !== null) {
                          handleLocationChange(
                            value as number,
                            formValues.longitude,
                          );
                        }
                      }}
                      className={controlClass}
                      style={{ width: '100%' }}
                      id="time-attendance-settings-allowed-areas-sidebar-latitude-display"
                      data-cy="time-attendance-settings-allowed-areas-sidebar-latitude-display"
                    />
                  </div>
                  <div
                    data-cy="time-attendance-settings-allowed-areas-sidebar-longitude-container"
                    id="time-attendance-settings-allowed-areas-sidebar-longitude-container"
                    className="space-y-1"
                  >
                    <span
                      data-cy="time-attendance-settings-allowed-areas-sidebar-longitude-label"
                      id="time-attendance-settings-allowed-areas-sidebar-longitude-label"
                      className="text-sm font-normal text-gray-900"
                    >
                      Longitude
                    </span>
                    <InputNumber
                      value={formValues.longitude}
                      precision={6}
                      onChange={(value) => {
                        if (value !== null) {
                          handleLocationChange(
                            formValues.latitude,
                            value as number,
                          );
                        }
                      }}
                      className={controlClass}
                      style={{ width: '100%' }}
                      id="time-attendance-settings-allowed-areas-sidebar-longitude-display"
                      data-cy="time-attendance-settings-allowed-areas-sidebar-longitude-display"
                    />
                  </div>
                </div>
                <p
                  data-cy="time-attendance-settings-allowed-areas-sidebar-latitude-longitude-description"
                  id="time-attendance-settings-allowed-areas-sidebar-latitude-longitude-description"
                  className="mt-2 text-center text-xs text-gray-500"
                >
                  You can update the map by changing latitude or longitude.
                </p>

                {/* Global location card */}
                <div
                  data-cy="time-attendance-settings-allowed-areas-sidebar-is-global-container"
                  id="time-attendance-settings-allowed-areas-sidebar-is-global-container"
                  className="mt-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between"
                >
                  <div
                    data-cy="time-attendance-settings-allowed-areas-sidebar-is-global-label-container"
                    id="time-attendance-settings-allowed-areas-sidebar-is-global-label-container"
                    className="flex flex-col gap-0.5"
                  >
                    <span
                      data-cy="time-attendance-settings-allowed-areas-sidebar-is-global-label-text"
                      id="time-attendance-settings-allowed-areas-sidebar-is-global-label-text"
                      className="text-sm font-medium text-gray-900"
                    >
                      Global Location
                    </span>
                    <span
                      data-cy="time-attendance-settings-allowed-areas-sidebar-is-global-label-description"
                      id="time-attendance-settings-allowed-areas-sidebar-is-global-label-description"
                      className="text-xs text-gray-500"
                    >
                      Make this location available globally
                    </span>
                  </div>
                  <Form.Item
                    data-cy="time-attendance-settings-allowed-areas-sidebar-is-global-item"
                    name="isGlobal"
                    valuePropName="checked"
                    noStyle
                  >
                    <Switch
                      defaultChecked
                      onChange={(checked) => setShowUsers(!checked)}
                      id="time-attendance-settings-allowed-areas-sidebar-is-global-switch"
                      data-cy="time-attendance-settings-allowed-areas-sidebar-is-global-switch"
                    />
                  </Form.Item>
                </div>

                {showUsers && (
                  <Form.Item
                    id="time-attendance-settings-allowed-areas-sidebar-users"
                    data-cy="time-attendance-settings-allowed-areas-sidebar-users"
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
                      id="time-attendance-settings-allowed-areas-sidebar-users-select"
                      data-cy="time-attendance-settings-allowed-areas-sidebar-users-select"
                    />
                  </Form.Item>
                )}
              </Space.Compact>
            </div>
          </Form>
        </Spin>
      </Modal>
    )
  );
};

export default LocationSidebar;
