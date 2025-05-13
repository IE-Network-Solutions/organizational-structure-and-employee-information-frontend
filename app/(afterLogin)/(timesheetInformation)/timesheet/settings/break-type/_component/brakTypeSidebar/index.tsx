import CustomDrawerLayout from '@/components/common/customDrawer';

import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useSetBreakType } from '@/store/server/features/timesheet/breakType/mutation';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { Col, Form, Input, Row, Space, TimePicker } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

const BreakTypeSidebar = () => {
  const {
    isShowBreakTypeSidebar: isShow,
    setIsShowBreakTypeSidebar: setIsShow,
    selectedBreakType,
    setSelectedBreakType,
  } = useTimesheetSettingsStore();
  const [form] = Form.useForm();
  const { mutate: setBreakType } = useSetBreakType();
  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[40px] sm:h-[51px] w-full';
  React.useEffect(() => {
    if (selectedBreakType) {
      const formattedBreakType = {
        ...selectedBreakType,
        startAt: dayjs(selectedBreakType.startAt, 'HH:mm:ss'),
        endAt: dayjs(selectedBreakType.endAt, 'HH:mm:ss'),
      };
      form.setFieldsValue(formattedBreakType);
    }
  }, [selectedBreakType, form]);
  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      onClick: () => {
        setIsShow(false), form.resetFields();
        setSelectedBreakType(null);
      },
    },
    {
      label: selectedBreakType ? 'Edit' : 'Add',
      key: 'add',
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      type: 'primary',
      onClick: () => form.submit(),
    },
  ];

  const onFinish = (values: any) => {
    const { startAt, endAt, ...otherValues } = values;
    const formattedValues = {
      ...otherValues,
      ...(selectedBreakType ? { id: selectedBreakType.id } : {}),
      startAt: startAt.format('HH:mm'),
      endAt: endAt.format('HH:mm'),
    };

    if (selectedBreakType) {
      setBreakType(formattedValues, {
        onSuccess: () => {
          setIsShow(false), form.resetFields();
          setSelectedBreakType(null);
        },
      });
    } else {
      setBreakType(formattedValues, {
        onSuccess: () => {
          setIsShow(false), form.resetFields();
          setSelectedBreakType(null);
        },
      });
    }
  };

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => setIsShow(false)}
        modalHeader={<CustomDrawerHeader>Break Type</CustomDrawerHeader>}
        footer={
          <div className="p-6 sm:p-0">
            <CustomDrawerFooterButton buttons={footerModalItems} />
          </div>
        }
        width="400px"
      >
        <Form
          layout="vertical"
          requiredMark={CustomLabel}
          autoComplete="off"
          form={form}
          className={itemClass}
          onFinish={onFinish}
        >
          <Space.Compact direction="vertical" className="w-full px-3 sm:px-0 ">
            <Form.Item
              id="breakTypeNameFieldId"
              label="Break Type Name"
              name="title"
              rules={[
                {
                  required: true,
                  message: 'Please enter the break type name',
                },
              ]}
            >
              <Input className={controlClass} />
            </Form.Item>
            <Form.Item
              id="BreakTypeDescriptionFieldId"
              label="Break Type Description"
              name="description"
            >
              <Input.TextArea
                className="w-full py-4 px-5 mt-2.5"
                placeholder="Description"
                rows={6}
              />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  id="startAtFieldId"
                  label="Start At"
                  name="startAt"
                  rules={[
                    { required: true, message: 'Please select the start time' },
                  ]}
                >
                  <TimePicker className={controlClass} format="HH:mm" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  id="endAtFieldId"
                  label="End At"
                  name="endAt"
                  rules={[
                    { required: true, message: 'Please select the end time' },
                    ({ getFieldValue }) => ({
                      /* eslint-disable @typescript-eslint/naming-convention */
                      validator(_, value) {
                        /* eslint-enable @typescript-eslint/naming-convention */
                        const startAt = getFieldValue('startAt');
                        if (!value || !startAt || value.isAfter(startAt)) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error('End time must be after start time.'),
                        );
                      },
                    }),
                  ]}
                >
                  <TimePicker className={controlClass} format="HH:mm" />
                </Form.Item>
              </Col>
            </Row>
          </Space.Compact>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default BreakTypeSidebar;
