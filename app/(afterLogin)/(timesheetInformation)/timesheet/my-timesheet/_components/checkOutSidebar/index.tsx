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
import TakePicture from '@/components/common/takePicture';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

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

  const [form] = Form.useForm();

  useEffect(() => {
    const nOptions: CustomSelectOption[] = breakTypes.map((item) => {
      return {
        label: item.title,
        value: item.id,
        ...formatBreakTypeToStatus(item, currentAttendance),
      };
    });

    setOptions(nOptions);
  }, [breakTypes, currentAttendance]);

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[56px] text-base',
      size: 'large',
      onClick: () => setIsShowCheckOutSidebar(false),
    },
    {
      label: 'Check-out',
      key: 'checkOut',
      className: 'h-[56px] text-base',
      size: 'large',
      type: 'primary',
      onClick: () => form.submit(),
    },
  ];

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';

  const selectLabel: LabelRender = (props) => {
    const { value } = props;
    const option = options.find((item) => item.value === value);
    return option ? (
      <div className="font-bold text-gray-900">{option.label}</div>
    ) : (
      ''
    );
  };
  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      setIsShowCheckOutSidebar(false);
    }
  }, [isSuccess]);

  const onFinish = () => {
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
            file: value.photo,
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
        onClose={() => setIsShowCheckOutSidebar(false)}
        modalHeader={<CustomDrawerHeader>Check-out</CustomDrawerHeader>}
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
      >
        <Form
          layout="vertical"
          form={form}
          requiredMark={CustomLabel}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="type"
            label="Checkin type"
            rules={[{ required: true, message: 'Required' }]}
            className={itemClass}
          >
            <Select
              className={controlClass}
              value={selectedType}
              labelRender={selectLabel}
              suffixIcon={
                <MdKeyboardArrowDown size={16} className="text-gray-900" />
              }
              onChange={setSelectedType}
            >
              {options.map((option) => (
                <Select.Option
                  value={option.value}
                  key={option.value}
                  disabled={option.disabled}
                >
                  <div className="p-4 pr-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedType === option.value ? (
                        <div className="w-6 h-6 rounded-full border-[7px] border-primary"></div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 border"></div>
                      )}
                      <span className="text-sm font-bold text-gray-900">
                        {option.label}
                      </span>
                    </div>
                    <StatusBadge
                      theme={option.status.theme}
                      transparentBg={true}
                      className="p-0"
                    >
                      {option.status.text}
                    </StatusBadge>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="photo">
            <TakePicture
              onChange={(imgSrc) => {
                form.setFieldValue('photo', imgSrc);
              }}
            />
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default CheckOutSidebar;
