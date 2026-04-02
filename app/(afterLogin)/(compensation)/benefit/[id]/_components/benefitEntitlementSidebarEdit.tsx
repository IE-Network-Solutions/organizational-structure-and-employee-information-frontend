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
  /** Deduction type detail (fixed deduction): labels use "deduction" instead of "benefit". */
  forDeductionDetail?: boolean;
};

const BenefitEntitlementSideBarEdit = ({
  forDeductionDetail = false,
}: BenefitEntitlementProps) => {
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
        <div
          className="flex w-full items-center justify-between gap-4"
          data-cy="compensation-benefit-sidebar-edit-modal-title-row"
        >
          <span
            className="inline-flex min-h-6 items-center text-base font-semibold leading-6 text-gray-900"
            id="compensation-benefit-sidebar-edit-title"
            data-cy="compensation-benefit-sidebar-edit-title"
          >
            {forDeductionDetail
              ? 'Edit Deduction Entitlement'
              : 'Edit Benefit Entitlement'}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
            data-cy="compensation-benefit-sidebar-edit-close"
          >
            <CloseOutlined style={{ fontSize: 16, color: '#262626' }} />
          </button>
        </div>
      }
      open={isBenefitEntitlementSidebarUpdateOpen}
      onCancel={onClose}
      closable={false}
      footer={
        <div
          className="flex w-full justify-end gap-3"
          id="compensation-benefit-sidebar-edit-footer"
          data-cy="compensation-benefit-sidebar-edit-footer"
        >
          <Button
            type="default"
            className="h-8 px-4 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-normal hover:bg-gray-50"
            loading={updateBenefitLoading}
            onClick={onClose}
            id="compensation-benefit-sidebar-edit-cancel-button"
            data-cy="compensation-benefit-sidebar-edit-cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            className="h-8 px-4 rounded-md text-sm font-normal"
            loading={updateBenefitLoading}
            onClick={() => form.submit()}
            id="compensation-benefit-sidebar-edit-update-button"
            data-cy="compensation-benefit-sidebar-edit-update-button"
          >
            Edit
          </Button>
        </div>
      }
      width={720}
      centered
      style={{ maxWidth: 'calc(100vw - 32px)' }}
      mask={true}
      maskClosable={false}
      zIndex={10002}
      rootClassName="[&_.ant-modal-title]:!block [&_.ant-modal-title]:!w-full [&_.ant-form-item-label>label]:!font-normal [&_.ant-form-item-label>label]:text-[#262626] max-sm:[&_.ant-modal-body]:[-ms-overflow-style:none] max-sm:[&_.ant-modal-body]:[scrollbar-width:none] max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!hidden max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!w-0 max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!h-0"
      classNames={{
        header:
          '!mb-0 flex !items-center !rounded-t-lg border-0 !px-6 !py-4 !min-h-0',
        body: '!px-6 !pb-0 !pt-0 hide-scrollbar',
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
      data-cy="compensation-benefit-edit-entitlement-modal"
    >
      <div
        className="rounded-lg border border-solid border-[#D9D9D9] bg-white px-6 py-5"
        data-cy="compensation-benefit-sidebar-edit-modal-inner"
      >
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
            className="[&_.ant-form-item-label>label]:text-sm [&_.ant-form-item-label>label]:font-normal [&_.ant-form-item-label>label]:text-[#262626]"
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
                rules={[{ required: true, message: 'Pay Period is required' }]}
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
            {/* Keep the actual value in the form, but render UI like the design (tags below the field). */}
            <Form.Item name="userId" hidden>
              <Input />
            </Form.Item>
            <Form.Item
              label="Select Employees"
              required
              id="compensation-benefit-sidebar-edit-employee-item"
              data-cy="compensation-benefit-sidebar-edit-employee-item"
              className="mb-0"
            >
              <div data-cy="compensation-benefit-sidebar-edit-employee-field-wrap">
                <div
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 flex items-center justify-between text-sm text-gray-400"
                  id="compensation-benefit-sidebar-edit-employee-select"
                  data-cy="compensation-benefit-sidebar-edit-employee-select"
                >
                  <span data-cy="compensation-benefit-sidebar-edit-employee-placeholder">
                    Select employee
                  </span>
                  <DownOutlined style={{ fontSize: 12, color: '#BFBFBF' }} />
                </div>

                <div
                  className="mt-2 flex flex-wrap gap-2"
                  id="compensation-benefit-sidebar-edit-employee-tags"
                  data-cy="compensation-benefit-sidebar-edit-employee-tags"
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

export default BenefitEntitlementSideBarEdit;
