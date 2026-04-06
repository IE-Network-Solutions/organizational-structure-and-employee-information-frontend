'use client';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Button, Form, Input, InputNumber, Select, Spin, Table } from 'antd';
import { useUpdateAllowanceEntitlementSettlement } from '@/store/server/features/compensation/allowance/mutations';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useEffect } from 'react';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import dayjs from 'dayjs';
import { useEmployeeSettlementTracking } from '@/store/server/features/payroll/settlementTracking/queries';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const { Option } = Select;
const { TextArea } = Input;

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

  // Reset form when edit data changes (new record selected)
  useEffect(() => {
    if (editDeductionData?.id) {
      form.resetFields();
      setEditPaymentsData([]);
      setEditTotalAmount(0);
      setEditSettlementPeriod(0);
      // Refetch data for the new record
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
    // Only update form when we have data and it's not loading
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
  }, [employeeEntitlementData, form, isLoading]);

  const columns = [
    {
      dataIndex: 'amount',
      key: 'amount',
      render: (notused: any, record: any, index: number) => {
        const isPaid = !!form.getFieldValue(['payments', index, 'isPaid']);
        return (
          <>
            <Form.Item
              label={'Amount'}
              name={['payments', index, 'amount']}
              className="mb-0"
            >
              <InputNumber className="w-full" disabled={isPaid} />
            </Form.Item>
            <Form.Item name={['payments', index, 'id']} className="mb-0" hidden>
              <Input className="w-full" value={record.id} />
            </Form.Item>
            <Form.Item
              name={['payments', index, 'isPaid']}
              className="mb-0"
              hidden
            >
              <Input className="w-full" value={record.isPaid} />
            </Form.Item>
          </>
        );
      },
    },
    {
      dataIndex: 'payPeriodId',
      key: 'payPeriodId',
      render: (notused: any, record: any, index: number) => {
        const isPaid = !!form.getFieldValue(['payments', index, 'isPaid']);
        return (
          <Form.Item
            label={'Pay Period'}
            required
            name={['payments', index, 'payPeriodId']}
            className="mb-0"
            rules={[{ required: true, message: 'Pay Period is required' }]}
          >
            <Select
              disabled={isPaid}
              placeholder="Pay Period"
              allowClear
              className="w-full"
            >
              {payPeriods
                ?.filter((period: any) => {
                  // Always show the currently selected pay period
                  if (period.id === record.payPeriodId) return true;
                  // Filter out inactive pay periods
                  if (period.isActive === false) return false;
                  // Filter out past pay periods (where end date is before today)
                  const endDate = dayjs(period.endDate);
                  const today = dayjs().startOf('day');
                  return endDate.isAfter(today) || endDate.isSame(today, 'day');
                })
                .map((period: any) => (
                  <Option key={period.id} value={period.id}>
                    {dayjs(period.startDate).format('MMM DD, YYYY')} –{' '}
                    {dayjs(period.endDate).format('MMM DD, YYYY')}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        );
      },
    },
    {
      dataIndex: 'reason',
      key: 'reason',
      render: (notused: any, record: any, index: number) => {
        const isPaid = !!form.getFieldValue(['payments', index, 'isPaid']);
        return (
          <Form.Item
            label="Reason"
            name={['payments', index, 'reason']}
            className="mb-0"
          >
            <TextArea placeholder="reason" autoSize disabled={isPaid} />
          </Form.Item>
        );
      },
    },
  ];

  return (
    isDeductionEntitlementSidebarEditOpen && (
      <CustomDrawerLayout
        open={isDeductionEntitlementSidebarEditOpen}
        onClose={onClose}
        modalHeader={
          <CustomDrawerHeader className="flex justify-center">
            <span
              id="compensation-deduction-sidebar-edit-title"
              data-cy="compensation-deduction-sidebar-edit-title"
            >
              Update {title}
            </span>
          </CustomDrawerHeader>
        }
        footer={
          <div
            className="flex flex-row gap-4 justify-center py-3"
            id="compensation-deduction-sidebar-edit-footer"
            data-cy="compensation-deduction-sidebar-edit-footer"
          >
            <Button
              type="default"
              className="h-10 px-3 w-40"
              size="large"
              loading={updateDeductionLoading}
              onClick={() => onClose()}
              id="compensation-deduction-sidebar-edit-cancel-button"
              data-cy="compensation-deduction-sidebar-edit-cancel-button"
            >
              Cancel
            </Button>

            <Button
              type="primary"
              key="update"
              className="h-10 px-3 w-40"
              size="large"
              loading={updateDeductionLoading}
              onClick={() => form.submit()}
              id="compensation-deduction-sidebar-edit-update-button"
              data-cy="compensation-deduction-sidebar-edit-update-button"
            >
              Update
            </Button>
          </div>
        }
        width="40%"
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
          >
            <div
              className="grid grid-cols-2 gap-4 mb-1"
              id="compensation-deduction-sidebar-edit-grid"
              data-cy="compensation-deduction-sidebar-edit-grid"
            >
              <Form.Item
                data-cy="compensation-deduction-sidebar-edit-total-amount-item"
                label="Total Amount"
              >
                <InputNumber
                  className="w-full h-10"
                  value={editTotalAmount}
                  onChange={(value) => setEditTotalAmount(value || 0)}
                  disabled
                  id="compensation-deduction-sidebar-edit-total-input"
                  data-cy="compensation-deduction-sidebar-edit-total-input"
                />
              </Form.Item>
              <Form.Item
                data-cy="compensation-deduction-sidebar-edit-settlement-period-item"
                label="Settlement Period"
              >
                <InputNumber
                  disabled
                  className="w-full h-10"
                  value={editSettlementPeriod}
                  onChange={(value) => setEditSettlementPeriod(value || 0)}
                  id="compensation-deduction-sidebar-edit-settlement-input"
                  data-cy="compensation-deduction-sidebar-edit-settlement-input"
                />
              </Form.Item>
            </div>

            {editPaymentsData?.length > 0 && (
              <div
                id="compensation-deduction-sidebar-edit-table-wrapper"
                data-cy="compensation-deduction-sidebar-edit-table-wrapper"
              >
                <Table
                  data-cy="compensation-deduction-sidebar-edit-payments-table"
                  columns={columns}
                  dataSource={editPaymentsData}
                  bordered={false}
                  className="mb-4"
                  pagination={false}
                />
              </div>
            )}
            <Form.Item
              name="userId"
              label="Select Employee"
              rules={[{ required: true, message: 'Please select an employee' }]}
              id="compensation-deduction-sidebar-edit-employee-item"
              data-cy="compensation-deduction-sidebar-edit-employee-item"
            >
              <Select
                disabled
                showSearch
                placeholder="Select a person"
                className="w-full min-h-10"
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
                    `${item?.firstName || ''} ${item?.middleName || ''} ${item?.lastName || ''}`
                      .replace(/\s+/g, ' ')
                      .trim(),
                }))}
                loading={allUserLoading}
                id="compensation-deduction-sidebar-edit-employee-select"
                data-cy="compensation-deduction-sidebar-edit-employee-select"
              />
            </Form.Item>
          </Form>
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default DeductionEntitlementSideBarEdit;
