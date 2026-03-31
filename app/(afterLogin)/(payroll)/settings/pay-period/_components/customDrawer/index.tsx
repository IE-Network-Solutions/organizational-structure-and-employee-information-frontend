import React, { useEffect } from 'react';
//import CustomDrawerLayout from '@/components/common/customDrawer';
import { Button, DatePicker, Form, Input, Modal, Select } from 'antd';
import useEditDrawerStore from '@/store/uistate/features/payroll/settings/drawer';
import dayjs from 'dayjs';
import { useEditPayPeriod } from '@/store/server/features/payroll/setting/tax-rule/mutation';
import { useChangePayPeriodStatus } from '@/store/server/features/payroll/setting/tax-rule/mutation';
import utc from 'dayjs/plugin/utc';
import { useIsMobile } from '@/hooks/useIsMobile';

dayjs.extend(utc);

interface CustomDrawerProps {
  visible: boolean;
  onClose: () => void;
  width?: string;
}

const CustomDrawer: React.FC<CustomDrawerProps> = ({
  visible,
  onClose,
  width,
}) => {
  const { id, startDate, endDate, status, reset } = useEditDrawerStore();
  const { mutate: editPayPeriod, isLoading } = useEditPayPeriod();
  const { mutate: changePayPeriodStatus, isLoading: isChangingStatus } =
    useChangePayPeriodStatus();

  const [form] = Form.useForm();
  const { isMobile, isTablet } = useIsMobile();
  const modalWidth = width || (isMobile ? '100%' : isTablet ? '480px' : '30%');

  useEffect(() => {
    form.setFieldsValue({
      month: startDate ? dayjs(startDate).format('MMMM') : '',
      startDate: startDate ? dayjs(startDate) : null,
      endDate: endDate ? dayjs(endDate) : null,
      status: status || undefined,
    });
  }, [form, startDate, endDate, status, reset]);

  const onFinish = () => {
    const values = form.getFieldsValue();
    const nextStatus = values.status as string | undefined;
    editPayPeriod(
      {
        payPeriodId: id,
        data: {
          startDate: values.startDate
            ? dayjs(values.startDate).format('YYYY-MM-DD')
            : null,
          endDate: values.endDate
            ? dayjs(values.endDate).format('YYYY-MM-DD')
            : null,
        },
      },
      {
        onSuccess: () => {
          if (!id) {
            onClose();
            return;
          }

          // Backend endpoint toggles status; only call when user changed selection.
          if (nextStatus && nextStatus !== status) {
            changePayPeriodStatus(
              { payPeriodId: id },
              {
                onSuccess: () => onClose(),
                onError: () => onClose(),
              },
            );
            return;
          }

          onClose();
        },
      },
    );
  };

  // Status is edited via the form dropdown (like UI screenshot).

  return (
    <Modal
      data-cy="payroll-payperiod-edit-drawer"
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={modalWidth}
      destroyOnClose
      maskClosable={false}
      closable={false}
      className="!p-0"
    >
      {/* Header */}
      <div
        id="payroll-payperiod-edit-modal-header"
        data-cy="payroll-payperiod-edit-modal-header"
        className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100"
      >
        <h2
          id="payroll-payperiod-edit-modal-title"
          data-cy="payroll-payperiod-edit-modal-title"
          className="text-[22px] font-bold text-gray-900 tracking-tight"
        >
          Edit Pay Period
        </h2>

        <button
          id="payroll-payperiod-edit-modal-close-click-button"
          data-cy="payroll-payperiod-edit-modal-close-click-button"
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-md hover:bg-gray-100"
          aria-label="Close modal"
        >
          <span
            id="payroll-payperiod-edit-modal-close-icon"
            data-cy="payroll-payperiod-edit-modal-close-icon"
            className="text-lg leading-none"
          >
            ✕
          </span>
        </button>
      </div>

      {/* Body */}
      <div
        id="payroll-payperiod-edit-modal-body-view-container"
        data-cy="payroll-payperiod-edit-modal-body-view-container"
        className="px-6 pt-4 pb-2 bg-gray-50/60"
      >
        <div
          id="payroll-payperiod-edit-modal-card-view-container"
          data-cy="payroll-payperiod-edit-modal-card-view-container"
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6"
        >
          <Form
            id="payroll-payperiod-edit-drawer-form"
            data-cy="payroll-payperiod-edit-drawer-form"
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="flex flex-col gap-5"
          >
            {/* Month */}
            <Form.Item
              id="payroll-payperiod-edit-drawer-month-formitem"
              data-cy="payroll-payperiod-edit-drawer-month-formitem"
              label="Month"
              name="month"
              rules={[{ required: true, message: 'Please enter the month' }]}
            >
              <Input
                id="payroll-payperiod-edit-drawer-month-input"
                data-cy="payroll-payperiod-edit-drawer-month-input"
                className="h-10"
                disabled
              />
            </Form.Item>

            {/* Start Date */}
            <Form.Item
              id="payroll-payperiod-edit-drawer-start-formitem"
              data-cy="payroll-payperiod-edit-drawer-start-formitem"
              label="Start Date"
              name="startDate"
              rules={[
                { required: true, message: 'Please select a start date' },
              ]}
            >
              <DatePicker
                id="payroll-payperiod-edit-drawer-start-date-picker"
                data-cy="payroll-payperiod-edit-drawer-start-date-picker"
                className="h-10 w-full"
                value={form.getFieldValue('startDate')}
                onChange={(date) => form.setFieldValue('startDate', date)}
              />
            </Form.Item>

            {/* End Date */}
            <Form.Item
              id="payroll-payperiod-edit-drawer-end-formitem"
              data-cy="payroll-payperiod-edit-drawer-end-formitem"
              label="End Date"
              name="endDate"
              rules={[{ required: true, message: 'Please select an end date' }]}
            >
              <DatePicker
                id="payroll-payperiod-edit-drawer-end-date-picker"
                data-cy="payroll-payperiod-edit-drawer-end-date-picker"
                className="h-10 w-full"
                value={form.getFieldValue('endDate')}
                onChange={(date) => form.setFieldValue('endDate', date)}
              />
            </Form.Item>

            <Form.Item
              id="payroll-payperiod-edit-drawer-status-formitem"
              data-cy="payroll-payperiod-edit-drawer-status-formitem"
              label="Status"
              name="status"
              rules={[{ required: true, message: 'Please select a status' }]}
            >
              <Select
                id="payroll-payperiod-edit-drawer-status-select"
                data-cy="payroll-payperiod-edit-drawer-status-select"
                className="w-full"
                options={[
                  { label: 'Open', value: 'OPEN' },
                  { label: 'Closed', value: 'CLOSED' },
                ]}
              />
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* Footer */}
      <div
        id="payroll-payperiod-edit-modal-footer"
        data-cy="payroll-payperiod-edit-modal-footer"
        className="w-full flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-100 bg-white"
      >
        <Button
          id="payroll-payperiod-edit-drawer-cancel"
          data-cy="payroll-payperiod-edit-drawer-cancel"
          type="default"
          className="h-10"
          onClick={onClose}
          disabled={isChangingStatus}
        >
          Cancel
        </Button>
        <Button
          id="payroll-payperiod-edit-drawer-submit"
          data-cy="payroll-payperiod-edit-drawer-submit"
          type="primary"
          className="h-10"
          onClick={() => form.submit()}
          loading={isLoading}
          disabled={isChangingStatus}
        >
          Edit
        </Button>
      </div>
    </Modal>
  );
};

export default CustomDrawer;
