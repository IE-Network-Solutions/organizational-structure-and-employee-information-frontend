import CustomDrawerLayout from '@/components/common/customDrawer';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { Form, Select } from 'antd';
import type { SelectProps } from 'antd';
import React, { useEffect, useState } from 'react';
import CustomLabel from '@/components/form/customLabel/customLabel';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { BreakTypeStatus, formatBreakTypeToStatus } from '@/helpers/formatTo';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import { useSetCurrentAttendance } from '@/store/server/features/timesheet/attendance/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useRemoteAttendanceCameraStore } from '@/store/uistate/features/timesheet/remoteAttendanceCamera';

type LabelRender = SelectProps['labelRender'];

interface CustomSelectOption extends BreakTypeStatus {
  label: string;
  value: string;
}

const CheckOutSidebar = () => {
  const [options, setOptions] = useState<CustomSelectOption[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const {
    isShowCheckOutSidebar,
    setIsShowCheckOutSidebar,
    breakTypes,
    currentAttendance,
  } = useMyTimesheetStore();
  const { userId } = useAuthenticationStore();
  const { mutate: setCurrentAttendance, isSuccess } = useSetCurrentAttendance();
  const { capturedAttendancePhotoUrl, setCapturedAttendancePhotoUrl } =
    useRemoteAttendanceCameraStore();

  const [form] = Form.useForm();

  useEffect(() => {
    const nOptions: CustomSelectOption[] = breakTypes.map((item) => {
      return {
        label: item.title,
        value: item.id ?? '',
        ...formatBreakTypeToStatus(item, currentAttendance),
      };
    });

    setOptions(nOptions);
  }, [breakTypes, currentAttendance]);

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[40px] sm:h-[56px] text-base px-10',
      size: 'large',
      onClick: () => setIsShowCheckOutSidebar(false),
      id: 'time-attendance-check-out-sidebar-cancel-button',
      'data-cy': 'time-attendance-check-out-sidebar-cancel-button',
    },
    {
      label: 'Check-out',
      key: 'checkOut',
      className: 'h-[40px] sm:h-[56px] text-base px-10',
      size: 'large',
      type: 'primary',
      onClick: () => form.submit(),
      id: 'time-attendance-check-out-sidebar-check-out-button',
      'data-cy': 'time-attendance-check-out-sidebar-check-out-button',
    },
  ];

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[40px] sm:h-[51px] w-full';

  const selectLabel: LabelRender = (props) => {
    const { value } = props;
    const option = options.find((item) => item.value === value);
    return option ? (
      <div
        data-cy="my-timesheet-components-checkoutsidebar-index-tsx-index-div-81"
        className="font-bold text-gray-900"
      >
        {option.label}
      </div>
    ) : (
      ''
    );
  };
  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      setIsShowCheckOutSidebar(false);
      setCapturedAttendancePhotoUrl(null);
    }
  }, [isSuccess, setCapturedAttendancePhotoUrl]);

  const onFinish = () => {
    const photo = capturedAttendancePhotoUrl;
    if (!photo) {
      NotificationMessage.error({
        message: 'Photo required',
        description:
          'Please capture your attendance photo before checking out.',
      });
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const value = form.getFieldsValue();
          setCurrentAttendance({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            userId: userId,
            isSignIn: false,
            breakTypeId: value.type,
            file: photo,
          });
        },
        () => {
          NotificationMessage.error({
            message: `No access to geolocation`,
            description: `To check-in/check-out we need to have access to geolocation.`,
          });
        },
      );
    } else {
      NotificationMessage.error({
        message: `No access to geolocation`,
        description: `To check-in/check-out we need to have access to geolocation.`,
      });
    }
  };

  return (
    isShowCheckOutSidebar && (
      <CustomDrawerLayout
        open={isShowCheckOutSidebar}
        onClose={() => {
          setIsShowCheckOutSidebar(false);
          setCapturedAttendancePhotoUrl(null);
        }}
        modalHeader={
          <CustomDrawerHeader
            className="px-3"
            data-cy="time-attendance-check-out-sidebar-header"
          >
            Check-out
          </CustomDrawerHeader>
        }
        footer={
          <CustomDrawerFooterButton
            className="w-full bg-[#fff] flex justify-center p-4"
            buttons={footerModalItems}
          />
        }
        width="400px"
        data-cy="time-attendance-check-out-sidebar"
      >
        <Form
          layout="vertical"
          form={form}
          requiredMark={CustomLabel}
          onFinish={onFinish}
          autoComplete="off"
          className="px-3"
          id="time-attendance-check-out-sidebar-form"
          data-cy="time-attendance-check-out-sidebar-form"
        >
          <Form.Item
            name="type"
            label="Checkin type"
            id="time-attendance-check-out-sidebar-type-select"
            data-cy="time-attendance-check-out-sidebar-type-select"
            rules={[{ required: true, message: 'Required' }]}
            className={itemClass}
          >
            <Select
              className={controlClass}
              value={selectedType}
              labelRender={selectLabel}
              suffixIcon={
                <MdKeyboardArrowDown
                  data-cy="time-attendance-check-out-sidebar-type-select-input-icon"
                  size={16}
                  className="text-gray-900"
                />
              }
              onChange={setSelectedType}
              id="time-attendance-check-out-sidebar-type-select-input"
              data-cy="time-attendance-check-out-sidebar-type-select-input"
            >
              {options.map((option, key) => (
                <Select.Option
                  id={`time-attendance-check-out-sidebar-type-option-${key}`}
                  data-cy={`time-attendance-check-out-sidebar-type-option-${key}`}
                  value={option.value}
                  key={option.value}
                  disabled={option.disabled}
                >
                  <div
                    className="p-4 pr-1.5 flex items-center justify-between"
                    id={`time-attendance-check-out-sidebar-type-option-${key}-container`}
                    data-cy={`time-attendance-check-out-sidebar-type-option-${key}-container`}
                  >
                    <div
                      className="flex items-center gap-2"
                      id={`time-attendance-check-out-sidebar-type-option-${key}-label-container`}
                      data-cy={`time-attendance-check-out-sidebar-type-option-${key}-label-container`}
                    >
                      {selectedType === option.value ? (
                        <div
                          className="w-6 h-6 rounded-full border-[7px] border-primary"
                          id={`time-attendance-check-out-sidebar-type-option-${key}-selected-indicator`}
                          data-cy={`time-attendance-check-out-sidebar-type-option-${key}-selected-indicator`}
                        ></div>
                      ) : (
                        <div
                          className="w-6 h-6 rounded-full bg-gray-200 border"
                          id={`time-attendance-check-out-sidebar-type-option-${key}-unselected-indicator`}
                          data-cy={`time-attendance-check-out-sidebar-type-option-${key}-unselected-indicator`}
                        ></div>
                      )}
                      <span
                        className="text-sm font-bold text-gray-900"
                        id={`time-attendance-check-out-sidebar-type-option-${key}-label`}
                        data-cy={`time-attendance-check-out-sidebar-type-option-${key}-label`}
                      >
                        {option.label}
                      </span>
                    </div>
                    <StatusBadge
                      theme={option.status.theme}
                      transparentBg={true}
                      className="p-0"
                      data-cy={`time-attendance-check-out-sidebar-type-option-${key}-status-badge`}
                    >
                      {option.status.text}
                    </StatusBadge>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default CheckOutSidebar;
