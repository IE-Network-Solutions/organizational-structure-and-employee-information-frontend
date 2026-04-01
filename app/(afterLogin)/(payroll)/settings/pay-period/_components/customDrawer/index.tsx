import React, { useEffect } from 'react';
//import CustomDrawerLayout from '@/components/common/customDrawer';
import { CloseOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, Modal, Select } from 'antd';
import useEditDrawerStore from '@/store/uistate/features/payroll/settings/drawer';
import dayjs from 'dayjs';
import { useEditPayPeriod } from '@/store/server/features/payroll/setting/tax-rule/mutation';
import { useChangePayPeriodStatus } from '@/store/server/features/payroll/setting/tax-rule/mutation';
import utc from 'dayjs/plugin/utc';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useIsMobile } from '@/hooks/useIsMobile';
import { FaPencil } from 'react-icons/fa6';

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
  const modalWidth = width || (isMobile ? '100%' : isTablet ? '600px' : '720px');

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
      mask
      maskClosable={false}
      closable={false}
      zIndex={10002}
      style={{ maxWidth: 'calc(100vw - 32px)' }}
      rootClassName="[&_.ant-modal-content]:!rounded-xl [&_.ant-modal-content]:!overflow-hidden [&_.ant-modal-title]:!block [&_.ant-modal-title]:!w-full [&_.ant-form-item-label>label]:!font-normal [&_.ant-form-item-label>label]:text-[#262626] max-sm:[&_.ant-modal-body]:[-ms-overflow-style:none] max-sm:[&_.ant-modal-body]:[scrollbar-width:none] max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!hidden max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!w-0 max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!h-0"
      classNames={{
        body: '!p-0 hide-scrollbar',
      }}
      styles={{
        content: { borderRadius: 12, padding: 0 },
        body: { borderBottom: 'none' },
      }}
    >
      {/* Header */}
      <div
        id="payroll-payperiod-edit-modal-header"
        data-cy="payroll-payperiod-edit-modal-header"
        className="flex items-center justify-between gap-4 px-6 py-4"
      >
        <h2
          id="payroll-payperiod-edit-modal-title"
          data-cy="payroll-payperiod-edit-modal-title"
          className="inline-flex min-h-6 items-center text-base font-semibold leading-6 text-gray-900"
        >
          Edit Pay Period
        </h2>

        <button
          id="payroll-payperiod-edit-modal-close-click-button"
          data-cy="payroll-payperiod-edit-modal-close-click-button"
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
          aria-label="Close modal"
        >
          <CloseOutlined
            id="payroll-payperiod-edit-modal-close-icon"
            data-cy="payroll-payperiod-edit-modal-close-icon"
            style={{ fontSize: 16, color: '#262626' }}
          />
        </button>
      </div>

      {/* Body */}
      <div
        id="payroll-payperiod-edit-modal-body-view-container"
        data-cy="payroll-payperiod-edit-modal-body-view-container"
        className="bg-white px-6 pb-2 pt-0"
      >
        <div
          id="payroll-payperiod-edit-modal-card-view-container"
          data-cy="payroll-payperiod-edit-modal-card-view-container"
          className="mt-4 rounded-lg border border-solid border-[#D9D9D9] bg-white px-6 py-5"
        >
          <Form
            id="payroll-payperiod-edit-drawer-form"
            data-cy="payroll-payperiod-edit-drawer-form"
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={CustomLabel}
            className="flex flex-col gap-4 [&_.ant-form-item-label>label]:text-sm [&_.ant-form-item-label>label]:font-normal [&_.ant-form-item-label>label]:text-[#262626]"
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
        className="flex w-full items-center justify-end gap-3 bg-white px-6 pb-6 pt-4"
      >
        <Button
          id="payroll-payperiod-edit-drawer-cancel"
          data-cy="payroll-payperiod-edit-drawer-cancel"
          type="default"
          className="h-8 rounded-md border border-gray-300 bg-white px-4 text-sm font-normal text-gray-700 hover:bg-gray-50"
          onClick={onClose}
          disabled={isChangingStatus}
        >
          Cancel
        </Button>
        <Button
          id="payroll-payperiod-edit-drawer-submit"
          data-cy="payroll-payperiod-edit-drawer-submit"
          type="primary"
          className="h-8 rounded-md px-4 text-sm font-normal"
          icon={<FaPencil className="text-sm" />}
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
