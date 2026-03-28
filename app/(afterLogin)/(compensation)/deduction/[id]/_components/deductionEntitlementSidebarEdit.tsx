'use client';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Spin,
  Tag,
} from 'antd';
import { CloseOutlined, DownOutlined } from '@ant-design/icons';
import { useUpdateAllowanceEntitlementSettlement } from '@/store/server/features/compensation/allowance/mutations';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useEffect } from 'react';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import dayjs from 'dayjs';
import { useEmployeeSettlementTracking } from '@/store/server/features/payroll/settlementTracking/queries';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const { TextArea } = Input;

const inputClassName = 'w-full rounded-md border-gray-300';
const payPeriodOptionFormat = (start: string, end: string) =>
  `${dayjs(start).format('MMM DD,YYYY')} - ${dayjs(end).format('MMM DD,YYYY')}`;

type DeductionEntitlementEditProps = {
  title: string;
};

const DeductionEntitlementSideBarEdit = ({
  title,
}: DeductionEntitlementEditProps) => {
  const {
    isDeductionEntitlementSidebarEditOpen,
    editDeductionData,
    setIsDeductionEntitlementSidebarEditOpen,
    setEditDeductionData,
    editTotalAmount,
    setEditTotalAmount,
    editSettlementPeriod,
    setEditSettlementPeriod,
    editPaymentsData,
    setEditPaymentsData,
  } = useAllowanceEntitlementStore();

  const {
    mutate: updateDeductionEntitlement,
    isLoading: updateDeductionLoading,
  } = useUpdateAllowanceEntitlementSettlement();

  const {
    data: employeeEntitlementData,
    isLoading,
    refetch,
  } = useEmployeeSettlementTracking(
    editDeductionData?.id,
    editDeductionData?.userId,
  );

  const { data: allUsers, isLoading: allUserLoading } = useGetAllUsers();
  const [form] = Form.useForm();

  const { data: payPeriods, isLoading: payLoading } = useGetPayPeriod();

  useEffect(() => {
    if (editDeductionData?.id) {
      form.resetFields();
      setEditPaymentsData([]);
      setEditTotalAmount(0);
      setEditSettlementPeriod(0);
      refetch();
    }
  }, [editDeductionData?.id, editDeductionData?.userId]);

  const onClose = () => {
    form.resetFields();
    setEditPaymentsData([]);
    setEditTotalAmount(0);
    setEditSettlementPeriod(0);
    setEditDeductionData(null);
    setIsDeductionEntitlementSidebarEditOpen(false);
  };

  const onFormSubmit = (formValues: any) => {
    const paymentAmount = (formValues?.payments || []).reduce(
      (acc: number, item: { amount?: number }) =>
        acc + Number(item.amount || 0),
      0,
    );
    const totalAmountChecker = editTotalAmount == paymentAmount;
    if (totalAmountChecker == false) {
      NotificationMessage.warning({
        message: `Total Amount should be equal to the sum of all payments. Total amount ${editTotalAmount} and payment amount ${paymentAmount}`,
      });
    } else {
      updateDeductionEntitlement(
        {
          payments: formValues?.payments || [],
          id: employeeEntitlementData?.id,
        },
        {
          onSuccess: () => {
            form.resetFields();
            onClose();
          },
        },
      );
    }
  };

  useEffect(() => {
    if (!employeeEntitlementData || isLoading) {
      return;
    }

    const payments = (employeeEntitlementData?.settlementTracking || []).map(
      (entry: any) => ({
        amount: parseFloat(entry.amount),
        payPeriodId: entry.payPeriodId || null,
        isPaid: entry.isPaid,
        id: entry.id,
        reason: entry?.reason,
      }),
    );
    const totalAmountValue = (
      employeeEntitlementData?.settlementTracking || []
    ).reduce(
      (acc: number, item: { amount?: number }) =>
        acc + Number(item.amount || 0),
      0,
    );
    setEditTotalAmount(totalAmountValue);
    setEditSettlementPeriod(
      Number(employeeEntitlementData?.settlementTracking?.length) || 0,
    );
    form.setFieldsValue({
      payments,
      userId: employeeEntitlementData?.employeeId,
    });
    setEditPaymentsData(payments);
  }, [
    employeeEntitlementData,
    form,
    isLoading,
    setEditTotalAmount,
    setEditSettlementPeriod,
    setEditPaymentsData,
  ]);

  return (
    <Modal
      title={
        <div
          className="flex w-full items-center justify-between gap-4"
          data-cy="compensation-deduction-sidebar-edit-modal-title-row"
        >
          <span
            className="inline-flex min-h-6 items-center text-base font-semibold leading-6 text-gray-900"
            id="compensation-deduction-sidebar-edit-title"
            data-cy="compensation-deduction-sidebar-edit-title"
          >
            Edit Deduction Entitlement
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
            data-cy="compensation-deduction-sidebar-edit-close"
          >
            <CloseOutlined style={{ fontSize: 16, color: '#262626' }} />
          </button>
        </div>
      }
      open={isDeductionEntitlementSidebarEditOpen}
      onCancel={onClose}
      closable={false}
      mask
      maskClosable={false}
      zIndex={10002}
      width={720}
      centered
      style={{ maxWidth: 'calc(100vw - 32px)' }}
      footer={
        <div
          className="flex w-full justify-end gap-3"
          id="compensation-deduction-sidebar-edit-footer"
          data-cy="compensation-deduction-sidebar-edit-footer"
        >
          <Button
            type="default"
            className="h-10 px-4 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-normal hover:bg-gray-50"
            loading={updateDeductionLoading}
            onClick={onClose}
            id="compensation-deduction-sidebar-edit-cancel-button"
            data-cy="compensation-deduction-sidebar-edit-cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            className="h-10 px-4 rounded-md text-sm font-normal"
            loading={updateDeductionLoading}
            onClick={() => form.submit()}
            id="compensation-deduction-sidebar-edit-update-button"
            data-cy="compensation-deduction-sidebar-edit-update-button"
          >
            Edit
          </Button>
        </div>
      }
      rootClassName="[&_.ant-modal-title]:!block [&_.ant-modal-title]:!w-full [&_.ant-form-item-label>label]:!font-normal [&_.ant-form-item-label>label]:text-[#262626] [&_.ant-form-item-required]:before:!hidden [&_.ant-form-item-required]:after:!hidden max-sm:[&_.ant-modal-body]:[-ms-overflow-style:none] max-sm:[&_.ant-modal-body]:[scrollbar-width:none] max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!hidden max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!w-0 max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!h-0"
      classNames={{
        header:
          '!mb-0 flex !items-center !rounded-t-lg border-0 !px-6 !py-4 !min-h-0',
        body: '!px-6 !pb-0 !pt-0 hide-scrollbar hide-scrollbar-mobile',
        footer: '!mt-0 border-0 !px-6 !pb-6 !pt-4',
      }}
      styles={{
        content: { borderRadius: 8, padding: 0 },
        header: { borderBottom: 'none' },
        body: {
          borderBottom: 'none',
          maxHeight: 'calc(100vh - 240px)',
          overflowY: 'auto',
        },
        footer: { borderTop: 'none' },
      }}
      data-cy="compensation-deduction-edit-entitlement-modal"
    >
      <div
        className="rounded-lg border border-solid border-[#D9D9D9] bg-white px-6 py-5"
        data-cy="compensation-deduction-sidebar-edit-modal-inner"
      >
        <Spin
          spinning={allUserLoading || payLoading || isLoading}
          data-cy="compensation-deduction-sidebar-edit-spin"
        >
          <Form
            layout="vertical"
            form={form}
            onFinish={onFormSubmit}
            requiredMark={CustomLabel}
            id="compensation-deduction-sidebar-edit-form"
            data-cy="compensation-deduction-sidebar-edit-form"
            className="[&_.ant-form-item-label>label]:text-sm [&_.ant-form-item-label>label]:font-normal [&_.ant-form-item-label>label]:text-[#262626]"
          >
            <div
              className="grid grid-cols-2 gap-4 mb-5"
              id="compensation-deduction-sidebar-edit-grid"
              data-cy="compensation-deduction-sidebar-edit-grid"
            >
              <Form.Item
                data-cy="compensation-deduction-sidebar-edit-total-amount-item"
                label="Total Amount"
                className="mb-0"
                required
                rules={[
                  { required: true, message: 'Total Amount is required' },
                ]}
              >
                <InputNumber
                  className={`${inputClassName} h-10`}
                  value={editTotalAmount}
                  onChange={(value) => setEditTotalAmount(value || 0)}
                  disabled
                  id="compensation-deduction-sidebar-edit-total-input"
                  data-cy="compensation-deduction-sidebar-edit-total-input"
                />
              </Form.Item>
              <Form.Item
                data-cy="compensation-deduction-sidebar-edit-pay-period-item"
                label="Pay Period"
                className="mb-0"
                required
                rules={[{ required: true, message: 'Pay Period is required' }]}
              >
                <InputNumber
                  disabled
                  className={`${inputClassName} h-10`}
                  value={editSettlementPeriod}
                  onChange={(value) => setEditSettlementPeriod(value || 0)}
                  id="compensation-deduction-sidebar-edit-settlement-input"
                  data-cy="compensation-deduction-sidebar-edit-settlement-input"
                />
              </Form.Item>
            </div>

            {editPaymentsData?.length > 0 && (
              <div
                className="border border-gray-200 rounded-lg p-4 mb-5"
                id="compensation-deduction-sidebar-edit-table-wrapper"
                data-cy="compensation-deduction-sidebar-edit-table-wrapper"
              >
                {editPaymentsData.map((record: any, index: number) => {
                  const isPaid = !!form.getFieldValue([
                    'payments',
                    index,
                    'isPaid',
                  ]);
                  return (
                    <div
                      key={record.id ?? index}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 last:mb-0"
                      data-cy={`compensation-deduction-sidebar-edit-payment-row-${index}`}
                    >
                      <Form.Item
                        label="Amount"
                        name={['payments', index, 'amount']}
                        className="mb-0"
                        rules={[
                          { required: true, message: 'Amount is required' },
                        ]}
                      >
                        <InputNumber
                          className={`${inputClassName} h-10`}
                          disabled={isPaid}
                        />
                      </Form.Item>
                      <Form.Item
                        label="Pay Period"
                        name={['payments', index, 'payPeriodId']}
                        className="mb-0"
                        rules={[
                          { required: true, message: 'Pay Period is required' },
                        ]}
                      >
                        <Select
                          disabled={isPaid}
                          placeholder="Pay Period"
                          allowClear
                          className={`${inputClassName} h-10`}
                          options={payPeriods?.map((period: any) => ({
                            key: period.id,
                            value: period.id,
                            label: payPeriodOptionFormat(
                              period.startDate,
                              period.endDate,
                            ),
                          }))}
                        />
                      </Form.Item>
                      <Form.Item
                        label="Reason"
                        name={['payments', index, 'reason']}
                        className="mb-0"
                        required
                        rules={[
                          { required: true, message: 'Reason is required' },
                        ]}
                      >
                        <TextArea
                          placeholder="Reason"
                          rows={1}
                          disabled={isPaid}
                          className="rounded-md border-gray-300 w-full min-h-10 resize-none font-normal placeholder:font-normal"
                          style={{ height: 40 }}
                        />
                      </Form.Item>
                      <Form.Item
                        name={['payments', index, 'id']}
                        className="mb-0 hidden"
                        hidden
                      >
                        <Input value={record.id} />
                      </Form.Item>
                      <Form.Item
                        name={['payments', index, 'isPaid']}
                        className="mb-0 hidden"
                        hidden
                      >
                        <Input value={record.isPaid} />
                      </Form.Item>
                    </div>
                  );
                })}
              </div>
            )}

            <Form.Item name="userId" hidden>
              <Input />
            </Form.Item>
            <Form.Item
              label="Select Employees"
              required
              id="compensation-deduction-sidebar-edit-employee-item"
              data-cy="compensation-deduction-sidebar-edit-employee-item"
              className="mb-0"
            >
              <div data-cy="compensation-deduction-sidebar-edit-employee-field-wrap">
                <div
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 flex items-center justify-between text-sm text-gray-400"
                  id="compensation-deduction-sidebar-edit-employee-select"
                  data-cy="compensation-deduction-sidebar-edit-employee-select"
                >
                  <span data-cy="compensation-deduction-sidebar-edit-employee-placeholder">
                    Select employee
                  </span>
                  <DownOutlined style={{ fontSize: 12, color: '#BFBFBF' }} />
                </div>

                <div
                  className="mt-2 flex flex-wrap gap-2"
                  id="compensation-deduction-sidebar-edit-employee-tags"
                  data-cy="compensation-deduction-sidebar-edit-employee-tags"
                >
                  {(() => {
                    const id = employeeEntitlementData?.employeeId;
                    const user = allUsers?.items?.find((u: any) => u.id === id);
                    const label = user
                      ? `${user?.firstName ?? ''} ${user?.middleName ?? ''} ${user?.lastName ?? ''}`.trim()
                      : '';
                    return label ? (
                      <Tag
                        className="m-0 rounded-md px-2 py-1 text-sm font-normal bg-[#E6E6E6] border-[#D0D0D0] text-[#262626]"
                        closable={false}
                      >
                        {label}
                      </Tag>
                    ) : null;
                  })()}
                </div>
              </div>
            </Form.Item>
          </Form>
        </Spin>
      </div>
    </Modal>
  );
};

export default DeductionEntitlementSideBarEdit;
