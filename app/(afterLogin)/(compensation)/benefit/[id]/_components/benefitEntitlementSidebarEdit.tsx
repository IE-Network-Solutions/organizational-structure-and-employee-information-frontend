'use client';
import { Button, Form, Input, InputNumber, Modal, Select, Spin } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useUpdatedBenefitEntitlementSettlement } from '@/store/server/features/compensation/benefit/mutations';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useEffect } from 'react';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useEmployeeSettlementTracking } from '@/store/server/features/payroll/settlementTracking/queries';
import NotificationMessage from '@/components/common/notification/notificationMessage';

dayjs.extend(isBetween);

const { TextArea } = Input;

const inputClassName = 'w-full rounded-md border-gray-300';
const payPeriodOptionFormat = (start: string, end: string) =>
  `${dayjs(start).format('MMM DD,YYYY')} - ${dayjs(end).format('MMM DD,YYYY')}`;
type BenefitEntitlementProps = {
  title: string;
};

const BenefitEntitlementSideBarEdit = ({ title }: BenefitEntitlementProps) => {
  const {
    isBenefitEntitlementSidebarUpdateOpen,
    benefitData,
    setIsBenefitEntitlementSidebarUpdateOpen,
    totalAmount,
    setTotalAmount,
    settlementPeriod,
    setSettlementPeriod,
    data,
    setData,
    setEditBenefitData,
  } = useBenefitEntitlementStore();

  const { mutate: updateBenefitEntitlement, isLoading: updateBenefitLoading } =
    useUpdatedBenefitEntitlementSettlement();
  const { data: employeeEntitlementData, isLoading } =
    useEmployeeSettlementTracking(benefitData?.id, benefitData?.userId);
  const { data: allUsers, isLoading: allUserLoading } = useGetAllUsers();
  const { data: departments, isLoading: depLoading } =
    useGetDepartmentsWithUsers();
  const [form] = Form.useForm();

  const { data: payPeriods, isLoading: payLoading } = useGetPayPeriod();

  const onClose = () => {
    form.resetFields();
    setData([]);
    setTotalAmount(0);
    setSettlementPeriod(0);
    setEditBenefitData(null);
    setIsBenefitEntitlementSidebarUpdateOpen(false);
  };

  const onFormSubmit = (formValues: any) => {
    const paymentAmount = (formValues?.payments || []).reduce(
      (acc: number, item: { amount?: number }) =>
        acc + Number(item.amount || 0),
      0,
    );
    const totalAmountChecker = totalAmount == paymentAmount;
    if (totalAmountChecker == false) {
      NotificationMessage.warning({
        message: `Total Amount should be equal to the sum of all payments. total amount ${totalAmount} and payment amount ${paymentAmount}`,
      });
    } else {
      updateBenefitEntitlement(
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
    const payments = (employeeEntitlementData?.settlementTracking || []).map(
      (entry: any) => ({
        amount: parseFloat(entry.amount),
        payPeriodId: entry.payPeriodId || null,
        isPaid: entry.isPaid,
        id: entry.id,
        reason: entry?.reason,
      }),
    );
    const totalAmount = (
      employeeEntitlementData?.settlementTracking || []
    ).reduce(
      (acc: number, item: { amount?: number }) =>
        acc + Number(item.amount || 0),
      0,
    );
    setTotalAmount(totalAmount);
    setSettlementPeriod(
      Number(employeeEntitlementData?.settlementTracking?.length) || 0,
    );
    form.setFieldsValue({
      payments,
      userId: employeeEntitlementData?.employeeId,
    });
    setData(payments);
  }, [
    employeeEntitlementData,
    form,
    isLoading,
    setData,
    setSettlementPeriod,
    setTotalAmount,
  ]);

  return (
    <Modal
      title={
        <span
          className="block text-base font-semibold text-gray-900 text-left"
          id="compensation-benefit-sidebar-edit-title"
          data-cy="compensation-benefit-sidebar-edit-title"
        >
          Edit Benefit Entitlement
        </span>
      }
      open={isBenefitEntitlementSidebarUpdateOpen}
      onCancel={onClose}
      closable
      closeIcon={
        <CloseOutlined
          className="text-gray-500 hover:text-gray-700"
          style={{ fontSize: 14 }}
        />
      }
      footer={
        <div
          className="flex justify-end gap-2 pt-4"
          id="compensation-benefit-sidebar-edit-footer"
          data-cy="compensation-benefit-sidebar-edit-footer"
        >
          <Button
            type="default"
            className="h-10 px-4 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50"
            loading={updateBenefitLoading}
            onClick={onClose}
            id="compensation-benefit-sidebar-edit-cancel-button"
            data-cy="compensation-benefit-sidebar-edit-cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            className="h-10 px-4 rounded-md"
            loading={updateBenefitLoading}
            onClick={() => form.submit()}
            id="compensation-benefit-sidebar-edit-update-button"
            data-cy="compensation-benefit-sidebar-edit-update-button"
          >
            Edit
          </Button>
        </div>
      }
      width={640}
      centered
      mask={true}
      maskClosable={false}
      zIndex={10002}
      styles={{
        content: {
          borderRadius: 8,
          border: '1px solid #e5e7eb',
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        },
        header: {
          borderBottom: 'none',
          padding: '12px 24px 8px',
          textAlign: 'left',
        },
        body: { padding: '8px 12px' },
        footer: { borderTop: 'none' },
      }}
      data-cy="compensation-benefit-edit-entitlement-modal"
    >
      <div className="border border-gray-200 rounded-lg px-4 py-4">
        <Spin
          spinning={allUserLoading || payLoading || isLoading || depLoading}
          data-cy="compensation-benefit-sidebar-edit-spin"
        >
          <Form
            layout="vertical"
            form={form}
            onFinish={onFormSubmit}
            requiredMark={CustomLabel}
            id="compensation-benefit-sidebar-edit-form"
            data-cy="compensation-benefit-sidebar-edit-form"
            className="[&_.ant-form-item-label>label]:text-sm [&_.ant-form-item-label>label]:font-medium [&_.ant-form-item-label>label]:text-gray-700"
          >
            {/* Top row - Total Amount & Pay Period */}
            <div
              className="grid grid-cols-2 gap-4 mb-5"
              id="compensation-benefit-sidebar-edit-grid"
              data-cy="compensation-benefit-sidebar-edit-grid"
            >
              <Form.Item
                data-cy="compensation-benefit-sidebar-edit-total-amount-item"
                label="Total Amount"
                className="mb-0"
                required
                rules={[
                  { required: true, message: 'Total Amount is required' },
                ]}
              >
                <InputNumber
                  className="w-full h-10 rounded-md border-gray-300"
                  value={totalAmount}
                  onChange={(value) => setTotalAmount(value || 0)}
                  disabled
                  id="compensation-benefit-sidebar-edit-total-input"
                  data-cy="compensation-benefit-sidebar-edit-total-input"
                />
              </Form.Item>
              <Form.Item
                data-cy="compensation-benefit-sidebar-edit-settlement-period-item"
                label="Pay Period"
                className="mb-0"
                required
                rules={[
                  { required: true, message: 'Pay Period is required' },
                ]}
              >
                <InputNumber
                  disabled
                  className="w-full h-10 rounded-md border-gray-300"
                  value={settlementPeriod}
                  onChange={(value) => setSettlementPeriod(value || 0)}
                  id="compensation-benefit-sidebar-edit-settlement-input"
                  data-cy="compensation-benefit-sidebar-edit-settlement-input"
                />
              </Form.Item>
            </div>

            {/* Benefit distribution - all periods inside one border */}
            {data?.length > 0 && (
              <div
                className="border border-gray-200 rounded-lg p-4 mb-5"
                id="compensation-benefit-sidebar-edit-table-wrapper"
                data-cy="compensation-benefit-sidebar-edit-table-wrapper"
              >
                {data.map((record: any, index: number) => {
                  const isPaid = !!form.getFieldValue([
                    'payments',
                    index,
                    'isPaid',
                  ]);
                  return (
                    <div
                      key={record.id ?? index}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 last:mb-0"
                      data-cy={`compensation-benefit-sidebar-edit-payment-row-${index}`}
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
                          className="rounded-md border-gray-300 w-full min-h-10 resize-none"
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

            {/* Department */}
            <Form.Item
              name="department"
              label="Department"
              className="mb-5"
              id="compensation-benefit-sidebar-edit-department-item"
              data-cy="compensation-benefit-sidebar-edit-department-item"
            >
              <Select
                placeholder="Select department"
                allowClear
                showSearch
                className={`${inputClassName} h-10`}
                loading={depLoading}
                filterOption={(input: string, option: any) =>
                  (option?.label ?? '')
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={departments?.map((dept: any) => ({
                  value: dept.name,
                  label: dept.name,
                }))}
                id="compensation-benefit-sidebar-edit-department-select"
                data-cy="compensation-benefit-sidebar-edit-department-select"
              />
            </Form.Item>

            {/* Select Employees */}
            <Form.Item
              name="userId"
              label="Select Employees"
              rules={[{ required: true, message: 'Please select employees' }]}
              id="compensation-benefit-sidebar-edit-employee-item"
              data-cy="compensation-benefit-sidebar-edit-employee-item"
              className="mb-0"
            >
              <Select
                disabled
                showSearch
                placeholder="Select employee"
                className="w-full min-h-10 rounded-md [&_.ant-select-selector]:rounded-md [&_.ant-select-selector]:border-gray-300 [&_.ant-select-selection-overflow-item]:rounded"
                allowClear
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={allUsers?.items?.map((item: any) => ({
                  ...item,
                  value: item?.id,
                  label:
                    `${item?.firstName ?? ''} ${item?.lastName ?? ''}`.trim(),
                }))}
                loading={allUserLoading}
                id="compensation-benefit-sidebar-edit-employee-select"
                data-cy="compensation-benefit-sidebar-edit-employee-select"
              />
            </Form.Item>
          </Form>
        </Spin>
      </div>
    </Modal>
  );
};

export default BenefitEntitlementSideBarEdit;
