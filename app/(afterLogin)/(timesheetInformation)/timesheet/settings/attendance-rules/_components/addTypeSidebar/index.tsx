import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Form, Input, Radio, Space, Spin } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomLabel from '@/components/form/customLabel/customLabel';
import React, { useEffect, useState } from 'react';
import CustomRadio from '@/components/form/customRadio';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { useSetAttendanceNotificationType } from '@/store/server/features/timesheet/attendanceNotificationType/mutation';
import { AttendanceTypeUnit } from '@/types/timesheet/attendance';
import { useGetAttendanceNotificationType } from '@/store/server/features/timesheet/attendanceNotificationType/queries';

const AddTypesSidebar = () => {
  const [isErrorUnit, setIsErrorUnit] = useState(false);
  const [typeId, setTypeId] = useState('');
  const {
    isShowRulesAddTypeSidebar: isShow,
    setIsShowRulesAddTypeSidebar: setIsShow,
    attendanceTypeId,
    setAttendanceTypeId,
  } = useTimesheetSettingsStore();
  const {
    data: attendanceTypeData,
    isFetching,
    refetch,
  } = useGetAttendanceNotificationType(typeId);
  const {
    mutate: setAttendanceType,
    isLoading,
    isSuccess,
  } = useSetAttendanceNotificationType();

  const [form] = Form.useForm();

  useEffect(() => {
    setTypeId(attendanceTypeId ?? '');
  }, [attendanceTypeId]);

  useEffect(() => {
    if (typeId) {
      refetch();
    }
  }, [typeId]);

  useEffect(() => {
    if (attendanceTypeData) {
      const item = attendanceTypeData.item;
      form.setFieldValue('title', item.title);
      form.setFieldValue('unit', item.unit);
    }
  }, [attendanceTypeData]);

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess]);

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
      label: attendanceTypeId ? 'Edit' : 'Add',
      key: 'add',
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      type: 'primary',
      loading: isLoading,
      onClick: () => form.submit(),
    },
  ];

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[40px]  w-full';

  const unitOptions = [
    {
      value: AttendanceTypeUnit.HOURS,
      label: 'Hours',
    },
    {
      value: AttendanceTypeUnit.DAYS,
      label: 'Days',
    },
    {
      value: AttendanceTypeUnit.WEEKS,
      label: 'Weeks',
    },
    {
      value: AttendanceTypeUnit.QUARTALS,
      label: 'Quartals',
    },
    {
      value: AttendanceTypeUnit.YEARS,
      label: 'Years',
    },
  ];

  const onFinish = () => {
    const value = form.getFieldsValue();
    setAttendanceType({
      ...(attendanceTypeId && attendanceTypeData!.item),
      title: value.title,
      unit: value.unit,
    });
  };

  const onFinishFailed = () => {
    setIsErrorUnit(!!form.getFieldError('unit').length);
  };

  const onFieldChange = () => {
    setIsErrorUnit(!!form.getFieldError('unit').length);
  };

  const onClose = () => {
    form.resetFields();
    setAttendanceTypeId(null);
    setIsShow(false);
  };

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader>
            {attendanceTypeId ? 'Edit' : 'Add'} Type
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
            onFieldsChange={onFieldChange}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Space.Compact
              direction="vertical"
              className="w-full px-3 sm:px-0 "
            >
              <Form.Item
                id="createAddTypeNameFieldId"
                label="Type Name"
                rules={[{ required: true, message: 'Required' }]}
                name="title"
              >
                <Input className={controlClass} />
              </Form.Item>
              <Form.Item
                label="Unit"
                id="createAddTypeUnitFieldId"
                rules={[{ required: true, message: 'Required' }]}
                name="unit"
              >
                <Radio.Group className={controlClass}>
                  <Space direction="vertical" size={12} className="w-full mb-4">
                    {unitOptions.map((option) => (
                      <CustomRadio
                        key={option.value}
                        label={option.label}
                        value={option.value}
                        isError={isErrorUnit}
                      />
                    ))}
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Space.Compact>
          </Form>
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default AddTypesSidebar;
