'use client';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Form, Input, InputNumber, Select, Spin, Table } from 'antd';
import { useCreateBenefitEntitlementSettlement } from '@/store/server/features/compensation/benefit/mutations';
import { useParams } from 'next/navigation';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useFetchBenefit,
  useFetchBenefitEntitlement,
} from '@/store/server/features/compensation/benefit/queries';
import { useEffect, useState } from 'react';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { Button } from 'antd';
import DuplicateDeductionModal from '@/components/common/duplicateDeductionModal';

dayjs.extend(isBetween);

const { Option } = Select;

type BenefitEntitlementProps = {
  title: string;
};

const BenefitEntitlementSideBar = ({ title }: BenefitEntitlementProps) => {
  const {
    setDepartmentUsers,
    isBenefitEntitlementSidebarOpen,
    setSelectedDepartment,
    resetStore,
    totalAmount,
    setTotalAmount,
    settlementPeriod,
    setSettlementPeriod,
    data,
    setData,
  } = useBenefitEntitlementStore();

  const { mutate: createBenefitEntitlement, isLoading: createBenefitLoading } =
    useCreateBenefitEntitlementSettlement();
  const { data: allUsers, isLoading: allUserLoading } = useGetAllUsers();
  const { data: departments, isLoading: depLoading } =
    useGetDepartmentsWithUsers();
  const { id } = useParams();
  const [form] = Form.useForm();
  const { TextArea } = Input;

  const { data: benefitDatas } = useFetchBenefit(id);
  const { data: payPeriods, isLoading: payLoading } = useGetPayPeriod();
  const { data: existingEntitlements, isLoading: entitlementsLoading } =
    useFetchBenefitEntitlement(id);

  // State for duplicate confirmation modal
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<any>(null);
  const [duplicateEmployeeNames, setDuplicateEmployeeNames] = useState<
    string[]
  >([]);

  const onClose = () => {
    form.resetFields();
    resetStore();
    setShowDuplicateModal(false);
    setPendingFormData(null);
    setDuplicateEmployeeNames([]);
  };

  // Function to check for duplicate employees
  const checkForDuplicates = (selectedEmployeeIds: string[]) => {
    if (!existingEntitlements) {
      return { hasDuplicates: false, duplicateNames: [] };
    }

    // Handle different possible data structures
    let entitlementsArray = [];

    if (Array.isArray(existingEntitlements)) {
      entitlementsArray = existingEntitlements;
    } else if (
      existingEntitlements?.compensationItmeEntitlement &&
      Array.isArray(existingEntitlements?.compensationItmeEntitlement)
    ) {
      entitlementsArray = existingEntitlements.compensationItmeEntitlement;
    } else if (
      existingEntitlements?.items &&
      Array.isArray(existingEntitlements?.items)
    ) {
      entitlementsArray = existingEntitlements.items;
    }

    if (entitlementsArray.length === 0) {
      return { hasDuplicates: false, duplicateNames: [] };
    }

    const existingEmployeeIds = entitlementsArray.map((entitlement: any) =>
      String(entitlement.employeeId),
    );

    const duplicateIds = selectedEmployeeIds
      .map((empId: any) => String(empId))
      .filter((empId: string) => existingEmployeeIds.includes(empId));

    if (duplicateIds.length === 0) {
      return { hasDuplicates: false, duplicateNames: [] };
    }

    const duplicateNames = duplicateIds.map((empId) => {
      const user = allUsers?.items?.find((user: any) => user.id === empId);
      return user ? `${user.firstName} ${user.lastName}` : `Employee ${empId}`;
    });

    return { hasDuplicates: true, duplicateNames };
  };

  const onFormSubmit = (formValues: any) => {
    // For non-periodic benefits, skip payment validation
    if (benefitDatas?.isPeriodic !== false) {
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
        return;
      }
    }

    // Check for duplicates before proceeding
    const selectedEmployeeIds = formValues?.employeeIds || [];
    const { hasDuplicates, duplicateNames } =
      checkForDuplicates(selectedEmployeeIds);

    if (hasDuplicates) {
      setDuplicateEmployeeNames(duplicateNames);
      setPendingFormData(formValues);
      setShowDuplicateModal(true);
    } else {
      proceedWithCreation(formValues);
    }
  };

  const proceedWithCreation = (formValues: any) => {
    createBenefitEntitlement(
      {
        ...formValues,
        compensationItemId: id,
        employeeIds: formValues?.employeeIds || [],
        totalAmount: formValues?.totalAmount || 0,
        settlementPeriod: Number(formValues?.settlementPeriod || 0),
        isRate: benefitDatas?.isRate,
      },
      {
        onSuccess: () => {
          form.resetFields();
          onClose();
        },
        onError: () => {},
      },
    );
  };

  const handleDuplicateConfirm = () => {
    if (pendingFormData) {
      proceedWithCreation(pendingFormData);
    }
    setShowDuplicateModal(false);
    setPendingFormData(null);
    setDuplicateEmployeeNames([]);
  };

  const handleDuplicateCancel = () => {
    setShowDuplicateModal(false);
    setPendingFormData(null);
    setDuplicateEmployeeNames([]);
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    const department = departments.find((dept: any) => dept.name === value);
    if (department) {
      setDepartmentUsers(department.users);
      form.setFieldsValue({
        employeeIds: department.users.map((user: any) => user.id),
      });
    }
  };

  useEffect(() => {
    // For non-periodic benefits, don't generate payment data
    if (benefitDatas?.isPeriodic === false) {
      setData([]);
      form.setFieldsValue({ payments: [] });
      return;
    }

    if (!payPeriods?.length) return;

    const now = dayjs();
    const nextMonth = now.add(1, 'month');

    const validPayPeriods = payPeriods.filter((period: any) => {
      const start = dayjs(period.startDate);
      const end = dayjs(period.endDate);
      return (
        start.isSame(now, 'month') ||
        end.isSame(now, 'month') ||
        start.isSame(nextMonth, 'month') ||
        end.isSame(nextMonth, 'month')
      );
    });

    const amountPerPeriod =
      totalAmount && settlementPeriod ? totalAmount / settlementPeriod : 0;

    const newData = Array.from({ length: settlementPeriod }, (notused, i) => {
      const paymentDate = dayjs().add(i, 'month');

      const matchedPeriod = validPayPeriods.find((period: any) => {
        const start = dayjs(period.startDate);
        const end = dayjs(period.endDate);
        return dayjs(paymentDate).isBetween(start, end, 'day', '[]'); // FIX HERE
      });

      // Calculate rounded amount for each period
      const roundedAmount = Number(amountPerPeriod.toFixed(2));

      return {
        key: i,
        amount: roundedAmount,
        payPeriodId: matchedPeriod?.id ?? null,
      };
    });

    // Calculate the sum of all rounded amounts
    const sumOfAmounts = newData.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    // Adjust the last element to ensure sum equals total
    if (newData.length > 0) {
      const lastIndex = newData.length - 1;
      const difference = totalAmount - sumOfAmounts;

      if (Math.abs(difference) > 0.001) {
        // If sum is smaller, add the difference to last element
        // If sum is greater, subtract the difference from last element (difference will be negative)
        const lastAmount = Number(newData[lastIndex].amount);
        newData[lastIndex].amount = Number(
          (lastAmount + difference).toFixed(2),
        );
      }
    }

    setData(newData);
    form.setFieldsValue({ payments: newData });
  }, [totalAmount, settlementPeriod, payPeriods, form, benefitDatas?.isPeriodic]);
  const columns = [
    {
      dataIndex: 'amount',
      key: 'amount',
      render: (notused: any, notuseds: any, index: number) => (
        <Form.Item
          label={'Amount'}
          name={['payments', index, 'amount']}
          className="mb-0"
          data-cy={`benefit-entitlement-sidebar-amount-item-${index}`}
        >
          <InputNumber
            className="w-full"
            data-cy={`benefit-entitlement-sidebar-amount-input-${index}`}
          />
        </Form.Item>
      ),
    },
    {
      dataIndex: 'payPeriodId',
      key: 'payPeriodId',
      render: (notused: any, notuseds: any, index: number) => (
        <Form.Item
          label={'Pay Period'}
          required={benefitDatas?.isPeriodic !== false}
          name={['payments', index, 'payPeriodId']}
          className="mb-0"
          rules={benefitDatas?.isPeriodic !== false ? [{ required: true, message: 'Pay Period is required' }] : []}
          data-cy={`benefit-entitlement-sidebar-pay-period-item-${index}`}
        >
          <Select
            placeholder="Pay Period"
            allowClear
            className="w-full"
            data-cy={`benefit-entitlement-sidebar-pay-period-select-${index}`}
          >
            {payPeriods
              ?.filter((period: any) => {
                const start = dayjs(period.startDate);
                const end = dayjs(period.endDate);
                return (
                  start.isSame(dayjs(), 'month') ||
                  end.isSame(dayjs(), 'month') ||
                  start.isSame(dayjs().add(1, 'month'), 'month') ||
                  end.isSame(dayjs().add(1, 'month'), 'month')
                );
              })
              .map((period: any) => (
                <Option
                  key={period.id}
                  value={period.id}
                  data-cy={`benefit-entitlement-sidebar-pay-period-option-${period.id}-${index}`}
                >
                  <span
                    data-cy={`benefit-entitlement-sidebar-pay-period-option-text-${period.id}-${index}`}
                  >
                    {dayjs(period.startDate).format('MMM DD, YYYY')} –{' '}
                    {dayjs(period.endDate).format('MMM DD, YYYY')}
                  </span>
                </Option>
              ))}
          </Select>
        </Form.Item>
      ),
    },
    {
      dataIndex: 'reason',
      key: 'reason',
      render: (notused: any, notuseds: any, index: number) => (
        <Form.Item
          label="Reason"
          required={benefitDatas?.isPeriodic !== false}
          name={['payments', index, 'reason']}
          className="mb-0"
          data-cy={`benefit-entitlement-sidebar-reason-item-${index}`}
        >
          <TextArea
            placeholder="Reason"
            autoSize
            data-cy={`benefit-entitlement-sidebar-reason-textarea-${index}`}
          />
        </Form.Item>
      ),
    },
  ];

  return (
    <>
      {isBenefitEntitlementSidebarOpen && (
        <CustomDrawerLayout
          data-cy="compensation-benefit-sidebar-layout"
          open={isBenefitEntitlementSidebarOpen}
          onClose={onClose}
          modalHeader={
            <CustomDrawerHeader
              data-cy="compensation-benefit-sidebar-header"
              className="flex justify-center"
            >
              <span
                className="text-2xl"
                id="compensation-benefit-sidebar-title"
                data-cy="compensation-benefit-sidebar-title"
              >
                {title}
              </span>
            </CustomDrawerHeader>
          }
          footer={
            <div
              className="flex flex-row gap-4 justify-center py-3"
              id="compensation-benefit-sidebar-footer"
              data-cy="compensation-benefit-sidebar-footer"
            >
              <Button
                type="default"
                className="h-10 px-3 w-40"
                size="large"
                loading={createBenefitLoading}
                onClick={() => onClose()}
                id="compensation-benefit-sidebar-cancel-button"
                data-cy="compensation-benefit-sidebar-cancel-button"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                key="create"
                className="h-10 px-3 w-40"
                size="large"
                loading={createBenefitLoading}
                disabled={entitlementsLoading}
                onClick={() => form.submit()}
                id="compensation-benefit-sidebar-create-button"
                data-cy="compensation-benefit-sidebar-create-button"
              >
                Create
              </Button>
            </div>
          }
          width="35%"
          customPadding="16px"
        >
          <Spin
            data-cy="compensation-benefit-sidebar-loading"
            spinning={allUserLoading || payLoading}
          >
            <Form
              layout="vertical"
              className="p-2"
              form={form}
              onFinish={onFormSubmit}
              requiredMark={CustomLabel}
              id="compensation-benefit-sidebar-form"
              data-cy="compensation-benefit-sidebar-form"
            >
              <div
                className={`grid gap-4 ${benefitDatas?.isPeriodic === false ? 'grid-cols-1' : 'grid-cols-2'}`}
                id="compensation-benefit-sidebar-amount-grid"
                data-cy="compensation-benefit-sidebar-amount-grid"
              >
                <Form.Item
                  data-cy="compensation-benefit-sidebar-total-amount-item"
                  required
                  name="totalAmount"
                  label="Total Amount"
                >
                  <InputNumber
                    className="w-full h-10 mt-1"
                    value={totalAmount}
                    onChange={(value) => setTotalAmount(value || 0)}
                    id="compensation-benefit-sidebar-total-amount-input"
                    data-cy="compensation-benefit-sidebar-total-amount-input"
                  />
                </Form.Item>
                {benefitDatas?.isPeriodic !== false && (
                  <Form.Item
                    required
                    name="settlementPeriod"
                    label={
                      benefitDatas?.mode === 'CREDIT' ? (
                        <span>Settlement Period </span>
                      ) : (
                        <span>Payout Period</span>
                      )
                    }
                    data-cy="compensation-benefit-sidebar-settlement-period-item"
                  >
                    <InputNumber
                      className="w-full h-10 mt-1"
                      value={settlementPeriod}
                      onChange={(value) => setSettlementPeriod(value || 0)}
                      id="compensation-benefit-sidebar-settlement-input"
                      data-cy="compensation-benefit-sidebar-settlement-input"
                    />
                  </Form.Item>
                )}
              </div>

              {data && data.length > 0 && (
                <div
                  id="compensation-benefit-sidebar-payments-table-wrapper"
                  data-cy="compensation-benefit-sidebar-payments-table-wrapper"
                >
                  <Table
                    data-cy="compensation-benefit-sidebar-payments-table"
                    columns={columns}
                    dataSource={data}
                    bordered={false}
                    className="mb-4"
                    pagination={false}
                  />
                </div>
              )}

              <Form.Item
                name="department"
                label="Select Department"
                className="form-item min-h-10"
                id="compensation-benefit-sidebar-department-item"
                data-cy="compensation-benefit-sidebar-department-item"
              >
                <Select
                  loading={depLoading}
                  placeholder="Select a department"
                  className="w-full h-10 mt-1"
                  allowClear
                  showSearch
                  onChange={(value) => handleDepartmentChange(value)}
                  filterOption={(input, option) =>
                    (option?.children as any)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  id="compensation-benefit-sidebar-department-select"
                  data-cy="compensation-benefit-sidebar-department-select"
                >
                  {departments?.map((dept: any) => (
                    <Option
                      data-cy="compensation-benefit-sidebar-department-option"
                      key={dept.id}
                      value={dept.name}
                    >
                      {dept.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="employeeIds"
                label="Select Employees"
                rules={[{ required: true, message: 'Please select employees' }]}
                id="compensation-benefit-sidebar-employees-item"
                data-cy="compensation-benefit-sidebar-employees-item"
              >
                <Select
                  showSearch
                  placeholder="Select a person"
                  mode="multiple"
                  className="w-full h-10 mt-1"
                  allowClear
                  maxTagCount={1}
                  filterOption={(input: any, option: any) =>
                    (option?.label ?? '')
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={allUsers?.items?.map((item: any) => ({
                    ...item,
                    value: item?.id,
                    label:
                      item?.firstName +
                      ' ' +
                      item?.middleName +
                      ' ' +
                      item?.lastName,
                  }))}
                  loading={allUserLoading}
                  id="compensation-benefit-sidebar-employees-select"
                  data-cy="compensation-benefit-sidebar-employees-select"
                />
              </Form.Item>
            </Form>
          </Spin>
        </CustomDrawerLayout>
      )}

      {/* Duplicate Confirmation Modal */}
      <DuplicateDeductionModal
        data-cy="compensation-benefit-sidebar-duplicate-modal"
        open={showDuplicateModal}
        onConfirm={handleDuplicateConfirm}
        onCancel={handleDuplicateCancel}
        loading={createBenefitLoading}
        employeeNames={duplicateEmployeeNames}
      />
    </>
  );
};

export default BenefitEntitlementSideBar;
