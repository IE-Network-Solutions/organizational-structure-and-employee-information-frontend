'use client';

import { useEffect } from 'react';
import { Button, DatePicker, Form, Select, TimePicker } from 'antd';
import dayjs from 'dayjs';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import { useWorkScheduleUiStore } from '@/store/uistate/features/timesheet/workSchedule';
import {
  useGetMockEmployees,
  useGetShiftInstances,
} from '@/store/server/features/timesheet/workSchedule/queries';
import { useUpdateShiftInstance } from '@/store/server/features/timesheet/workSchedule/mutation';
import { TIME_FORMAT } from '@/store/server/features/timesheet/workSchedule/helpers';
import { getEmployeeDisplayName } from '@/store/server/features/timesheet/workSchedule/mockService';
import { shiftLabel } from '@/store/server/features/timesheet/workSchedule/helpers';

const ShiftInstanceDrawer = () => {
  const {
    isInstanceDrawerOpen,
    selectedInstanceId,
    closeInstanceDrawer,
    openSwapModal,
  } = useWorkScheduleUiStore();
  const [form] = Form.useForm();
  const { data: instances = [] } = useGetShiftInstances({
    includeCancelled: true,
  });
  const { data: employees = [] } = useGetMockEmployees();
  const { mutate: updateInstance, isLoading } = useUpdateShiftInstance();
  const instance = instances.find((item) => item.id === selectedInstanceId);

  useEffect(() => {
    if (!instance) return;
    form.setFieldsValue({
      date: dayjs(instance.date),
      startTime: dayjs(instance.startTime, TIME_FORMAT),
      endTime: dayjs(instance.endTime, TIME_FORMAT),
      assignedUserId: instance.assignedUserId,
    });
  }, [instance, form]);

  const onClose = () => {
    form.resetFields();
    closeInstanceDrawer();
  };

  const footerButtons: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Close',
      key: 'close',
      className: 'h-[40px] text-sm border-1 border-[#D9D9D9] text-[#4d4d4d]',
      size: 'large',
      onClick: onClose,
    },
    {
      label: 'Save changes',
      key: 'save',
      className: 'h-[40px] text-sm',
      size: 'large',
      type: 'primary',
      loading: isLoading,
      disabled: instance?.isCancelled,
      onClick: () => form.submit(),
    },
  ];

  const handleFinish = (values: {
    startTime: dayjs.Dayjs;
    endTime: dayjs.Dayjs;
    assignedUserId: string;
  }) => {
    if (!instance) return;
    updateInstance(
      {
        id: instance.id,
        input: {
          startTime: values.startTime.format(TIME_FORMAT),
          endTime: values.endTime.format(TIME_FORMAT),
          assignedUserId: values.assignedUserId,
          shiftType:
            values.startTime.format(TIME_FORMAT) !== instance.startTime ||
            values.endTime.format(TIME_FORMAT) !== instance.endTime
              ? 'CUSTOM'
              : instance.shiftType,
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <CustomDrawerLayout
      open={isInstanceDrawerOpen}
      onClose={onClose}
      width="40%"
      modalHeader={
        <CustomDrawerHeader>
          Shift instance
          {instance ? ` · ${instance.blueprintTitle}` : ''}
        </CustomDrawerHeader>
      }
      footer={
        <CustomDrawerFooterButton
          className="w-full bg-[#fff] flex justify-between space-x-5 p-4"
          buttons={footerButtons}
        />
      }
    >
      {!instance ? (
        <p
          className="text-sm text-gray-500"
          data-cy="time-attendance-settings-work-schedule-instance-empty"
        >
          Select a shift to view details.
        </p>
      ) : (
        <div data-cy="time-attendance-settings-work-schedule-instance-drawer">
          <p
            className="text-sm text-gray-500 mb-4"
            data-cy="time-attendance-settings-work-schedule-instance-meta"
          >
            {shiftLabel(instance)} ·{' '}
            {instance.isSwappable ? 'Swappable' : 'Fixed'}
            {instance.isCancelled ? ' · Cancelled' : ''}
            {instance.isOverridden ? ' · Overridden' : ''}
          </p>
          <Form layout="vertical" form={form} onFinish={handleFinish}>
            <Form.Item name="date" label="Date">
              <DatePicker className="w-full" format="DD MMM YYYY" disabled />
            </Form.Item>
            <div
              className="grid grid-cols-2 gap-3"
              data-cy="time-attendance-settings-work-schedule-instance-times"
            >
              <Form.Item
                name="startTime"
                label="Start time"
                rules={[{ required: true, message: 'Required' }]}
              >
                <TimePicker format={TIME_FORMAT} className="w-full" />
              </Form.Item>
              <Form.Item
                name="endTime"
                label="End time"
                rules={[{ required: true, message: 'Required' }]}
              >
                <TimePicker format={TIME_FORMAT} className="w-full" />
              </Form.Item>
            </div>
            <Form.Item
              name="assignedUserId"
              label="Assigned employee"
              rules={[{ required: true, message: 'Required' }]}
            >
              <Select
                options={employees.map((item) => ({
                  value: item.id,
                  label: getEmployeeDisplayName(item),
                }))}
              />
            </Form.Item>
          </Form>
          <div
            className="flex flex-wrap gap-2"
            data-cy="time-attendance-settings-work-schedule-instance-actions"
          >
            {!instance.isCancelled && (
              <Button
                danger
                onClick={() =>
                  updateInstance(
                    {
                      id: instance.id,
                      input: { isCancelled: true },
                    },
                    { onSuccess: onClose },
                  )
                }
                data-cy="time-attendance-settings-work-schedule-instance-cancel"
              >
                Cancel shift instance
              </Button>
            )}
            {instance.isSwappable && !instance.isCancelled && (
              <Button
                onClick={() => {
                  closeInstanceDrawer();
                  openSwapModal(instance.id);
                }}
              >
                Request swap
              </Button>
            )}
          </div>
        </div>
      )}
    </CustomDrawerLayout>
  );
};

export default ShiftInstanceDrawer;
