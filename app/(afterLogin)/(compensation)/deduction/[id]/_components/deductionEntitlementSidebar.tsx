import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Button, Form, Input, InputNumber, Select, Spin } from 'antd';
import {
  useAllowanceEntitlementStore,
  PayPeriodScheduleRow,
} from '@/store/uistate/features/compensation/allowance';
import { useCreateAllowanceEntitlementSettlement } from '@/store/server/features/compensation/allowance/mutations';
import { useParams } from 'next/navigation';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useFetchAllowance,
  useFetchAllowanceEntitlements,
} from '@/store/server/features/compensation/allowance/queries';
import DuplicateDeductionModal from '@/components/common/duplicateDeductionModal';
import { useState, useEffect, useCallback } from 'react';
import { useGetBasicSalaryById } from '@/store/server/features/employees/employeeManagment/basicSalary/queries';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import dayjs from 'dayjs';

const DeductionEntitlementSideBar = () => {
  const {
    isAllowanceEntitlementSidebarOpen,
    resetStore,
    setSelectedDepartment,
    deductionPayPeriodSchedule,
    setDeductionPayPeriodSchedule,
    selectedEmployeeForDeduction,
    setSelectedEmployeeForDeduction,
    selectedEmployeeBasicSalary,
    setSelectedEmployeeBasicSalary,
    deductionTotalAmount,
    setDeductionTotalAmount,
    deductionRate,
    setDeductionRate,
    updatePayPeriodScheduleRow,
  } = useAllowanceEntitlementStore();

  const {
    mutate: createAllowanceEntitlementSettlement,
    isLoading: createAllowanceEntitlementLoading,
  } = useCreateAllowanceEntitlementSettlement();

  const [form] = Form.useForm();
  const { data: allUsers, isLoading: allUserLoading } = useGetAllUsers();
  const { data: payPeriods, isLoading: payPeriodsLoading } = useGetPayPeriod();

  // State for duplicate confirmation modal
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateEmployeeNames, setDuplicateEmployeeNames] = useState<
    string[]
  >([]);

  const { id } = useParams();
  const { data: deductionTypeData, isLoading: deductionTypeLoading } =
    useFetchAllowance(id);
  const { data: existingEntitlements } = useFetchAllowanceEntitlements(id);

  // Fetch basic salary for selected employee
  const { data: basicSalaryData, isLoading: basicSalaryLoading } =
    useGetBasicSalaryById(selectedEmployeeForDeduction ?? '');

  // Update rate from deduction type
  useEffect(() => {
    if (deductionTypeData?.defaultAmount) {
      setDeductionRate(Number(deductionTypeData.defaultAmount));
    }
  }, [deductionTypeData, setDeductionRate]);

  // Update basic salary when employee is selected
  useEffect(() => {
    if (basicSalaryData && Array.isArray(basicSalaryData)) {
      const activeBasicSalary = basicSalaryData.find(
        (item: any) => item.status,
      );
      if (activeBasicSalary) {
        const salary = Number(activeBasicSalary.basicSalary);
        setSelectedEmployeeBasicSalary(salary);
        // Reset schedule when basic salary changes so it recalculates
        setDeductionPayPeriodSchedule([]);
      } else {
        // No active basic salary found
        setSelectedEmployeeBasicSalary(0);
      }
    } else if (basicSalaryData && !Array.isArray(basicSalaryData)) {
      // Handle case where API returns single object
      const salary = Number(basicSalaryData.basicSalary || 0);
      setSelectedEmployeeBasicSalary(salary);
      setDeductionPayPeriodSchedule([]);
    }
  }, [
    basicSalaryData,
    setSelectedEmployeeBasicSalary,
    setDeductionPayPeriodSchedule,
  ]);

  // Calculate payment schedule when employee, total amount, and rate are available
  const calculatePaymentSchedule = useCallback(() => {
    if (
      !selectedEmployeeBasicSalary ||
      !deductionTotalAmount ||
      !deductionRate
    ) {
      setDeductionPayPeriodSchedule([]);
      return;
    }

    const monthlyDeduction =
      (selectedEmployeeBasicSalary * deductionRate) / 100;

    if (monthlyDeduction <= 0) {
      setDeductionPayPeriodSchedule([]);
      return;
    }

    const schedule: PayPeriodScheduleRow[] = [];
    let remainingAmount = deductionTotalAmount;

    while (remainingAmount > 0) {
      const amount = Math.min(monthlyDeduction, remainingAmount);
      schedule.push({
        amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
        payPeriodId: '',
      });
      remainingAmount -= amount;
    }

    setDeductionPayPeriodSchedule(schedule);
  }, [
    selectedEmployeeBasicSalary,
    deductionTotalAmount,
    deductionRate,
    setDeductionPayPeriodSchedule,
  ]);

  // Recalculate schedule when dependencies change
  useEffect(() => {
    calculatePaymentSchedule();
  }, [calculatePaymentSchedule]);

  const onClose = () => {
    form.resetFields();
    resetStore();
    setSelectedDepartment(null);
    setShowDuplicateModal(false);
    setDuplicateEmployeeNames([]);
    setDeductionPayPeriodSchedule([]);
    setSelectedEmployeeForDeduction(null);
    setSelectedEmployeeBasicSalary(0);
    setDeductionTotalAmount(0);
  };

  // Function to check for duplicate employees
  const checkForDuplicates = (selectedEmployeeIds: string[]) => {
    if (!existingEntitlements) {
      return { hasDuplicates: false, duplicateNames: [] };
    }

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

  const onFormSubmit = () => {
    const selectedEmployeeIds = [selectedEmployeeForDeduction];

    const { hasDuplicates, duplicateNames } = checkForDuplicates(
      selectedEmployeeIds as string[],
    );

    if (hasDuplicates) {
      setDuplicateEmployeeNames(duplicateNames);
      setShowDuplicateModal(true);
    } else {
      proceedWithCreation();
    }
  };

  const proceedWithCreation = () => {
    // Rate-based deduction with payment schedule
    // Use the /employee-settlement-tracking endpoint with 'payments' array format
    createAllowanceEntitlementSettlement(
      {
        compensationItemId: id,
        employeeIds: [selectedEmployeeForDeduction],
        totalAmount: deductionTotalAmount,
        settlementPeriod: deductionPayPeriodSchedule.length,
        active: true,
        isRate: true,
        // Must use 'payments' key (not 'paymentSchedule') to match the API expected format
        payments: deductionPayPeriodSchedule.map((row) => ({
          amount: row.amount,
          payPeriodId: row.payPeriodId,
        })),
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: () => {},
      },
    );
  };

  const handleDuplicateConfirm = () => {
    proceedWithCreation();
    setShowDuplicateModal(false);
    setDuplicateEmployeeNames([]);
  };

  const handleDuplicateCancel = () => {
    setShowDuplicateModal(false);
    setDuplicateEmployeeNames([]);
  };

  const handleEmployeeChange = (value: string) => {
    setSelectedEmployeeForDeduction(value);
    // Reset basic salary and schedule when employee changes
    setSelectedEmployeeBasicSalary(0);
    setDeductionPayPeriodSchedule([]);
  };

  const handleTotalAmountChange = (value: number | null) => {
    setDeductionTotalAmount(value || 0);
  };

  const handlePayPeriodChange = (index: number, payPeriodId: string) => {
    updatePayPeriodScheduleRow(index, payPeriodId);
  };

  // Check if all pay periods are selected
  const areAllPayPeriodsSelected =
    deductionPayPeriodSchedule.length > 0 &&
    deductionPayPeriodSchedule.every((row) => row.payPeriodId);

  // Validate that schedule amounts are correctly calculated (not just the rate)
  const isScheduleValid =
    deductionPayPeriodSchedule.length > 0 &&
    deductionPayPeriodSchedule.every((row) => row.amount > 1); // Amount should be > 1 (not just rate percentage)

  const isSubmitDisabled =
    !selectedEmployeeForDeduction ||
    !deductionTotalAmount ||
    !selectedEmployeeBasicSalary || // Must have basic salary loaded
    basicSalaryLoading || // Must wait for basic salary to load
    !areAllPayPeriodsSelected ||
    !isScheduleValid; // Ensure schedule has valid calculated amounts

  return (
    <>
      {isAllowanceEntitlementSidebarOpen && (
        <CustomDrawerLayout
          open={isAllowanceEntitlementSidebarOpen}
          onClose={onClose}
          modalHeader={
            <CustomDrawerHeader
              className="flex justify-center"
              data-cy="compensation-deduction-sidebar-header"
            >
              <span
                id="compensation-deduction-sidebar-title-text"
                data-cy="compensation-deduction-sidebar-title-text"
              >
                {deductionTypeData?.name || 'Add Deduction Entitlement'}
              </span>
            </CustomDrawerHeader>
          }
          footer={
            <div
              className="flex flex-row gap-4 justify-center py-3"
              id="compensation-deduction-sidebar-footer"
              data-cy="compensation-deduction-sidebar-footer"
            >
              <Button
                type="default"
                className="h-10 px-3 w-40"
                size="large"
                loading={allUserLoading}
                onClick={() => onClose()}
                disabled={createAllowanceEntitlementLoading}
                id="compensation-deduction-sidebar-cancel-button"
                data-cy="compensation-deduction-sidebar-cancel-button"
              >
                Cancel
              </Button>

              <Button
                type="primary"
                key="create"
                className="h-10 px-3 w-40"
                size="large"
                loading={createAllowanceEntitlementLoading}
                disabled={isSubmitDisabled}
                onClick={() => form.submit()}
                id="compensation-deduction-sidebar-create-button"
                data-cy="compensation-deduction-sidebar-create-button"
              >
                Create
              </Button>
            </div>
          }
          width="600px"
          data-cy="compensation-deduction-sidebar-layout"
        >
          <Spin
            spinning={
              allUserLoading || deductionTypeLoading || basicSalaryLoading
            }
            data-cy="compensation-deduction-sidebar-loading"
          >
            <Form
              layout="vertical"
              form={form}
              onFinish={onFormSubmit}
              requiredMark={CustomLabel}
              id="compensation-deduction-sidebar-form"
              data-cy="compensation-deduction-sidebar-form"
            >
              {/* Rate-based deduction form */}
              <Form.Item
                name="employee"
                label="Select Employee"
                rules={[
                  { required: true, message: 'Please select an employee' },
                ]}
                id="compensation-deduction-sidebar-employee-item"
                data-cy="compensation-deduction-sidebar-employee-item"
              >
                <Select
                  showSearch
                  placeholder="Select an employee"
                  className="w-full"
                  allowClear
                  filterOption={(input: any, option: any) =>
                    (option?.label ?? '')
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={allUsers?.items?.map((item: any) => ({
                    value: item?.id,
                    label:
                      `${item?.firstName || ''} ${item?.middleName || ''} ${item?.lastName || ''}`
                        .replace(/\s+/g, ' ')
                        .trim(),
                  }))}
                  loading={allUserLoading}
                  onChange={handleEmployeeChange}
                  id="compensation-deduction-sidebar-employee-select"
                  data-cy="compensation-deduction-sidebar-employee-select"
                />
              </Form.Item>

              <Form.Item
                name="totalAmount"
                label="Total Amount"
                rules={[
                  { required: true, message: 'Total amount is required!' },
                  {
                    // eslint-disable-next-line
                    validator: (_, value) => {
                      if (value && value < 0) {
                        return Promise.reject(
                          new Error('Total amount cannot be less than 0!'),
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                id="compensation-deduction-sidebar-total-amount-item"
                data-cy="compensation-deduction-sidebar-total-amount-item"
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  placeholder="Enter total amount to be deducted"
                  onChange={handleTotalAmountChange}
                  id="compensation-deduction-sidebar-total-amount-input"
                  data-cy="compensation-deduction-sidebar-total-amount-input"
                />
              </Form.Item>

              {/* Show loading state for basic salary */}
              {selectedEmployeeForDeduction && basicSalaryLoading && (
                <div className="text-sm text-gray-500 mb-4">
                  Loading employee basic salary...
                </div>
              )}

              {/* Show error if no basic salary found */}
              {selectedEmployeeForDeduction &&
                !basicSalaryLoading &&
                !selectedEmployeeBasicSalary && (
                  <div className="text-sm text-red-500 mb-4">
                    No active basic salary found for this employee. Please set
                    up the employee&apos;s basic salary first.
                  </div>
                )}

              {/* Dynamic payment schedule rows */}
              {deductionPayPeriodSchedule.length > 0 && (
                <div
                  className="space-y-4"
                  id="compensation-deduction-sidebar-schedule-container"
                  data-cy="compensation-deduction-sidebar-schedule-container"
                >
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 text-gray-700">
                      Payment Schedule
                    </h4>
                  </div>
                  {deductionPayPeriodSchedule.map((row, index) => (
                    <div
                      key={index}
                      className="flex gap-4"
                      id={`compensation-deduction-sidebar-schedule-row-${index}`}
                      data-cy={`compensation-deduction-sidebar-schedule-row-${index}`}
                    >
                      <Form.Item
                        label="Amount"
                        className="flex-1 mb-0"
                        id={`compensation-deduction-sidebar-schedule-amount-item-${index}`}
                        data-cy={`compensation-deduction-sidebar-schedule-amount-item-${index}`}
                      >
                        <Input
                          value={row.amount.toLocaleString()}
                          disabled
                          className="bg-gray-100"
                          id={`compensation-deduction-sidebar-schedule-amount-input-${index}`}
                          data-cy={`compensation-deduction-sidebar-schedule-amount-input-${index}`}
                        />
                      </Form.Item>

                      <Form.Item
                        label="Pay Period"
                        className="flex-1 mb-0"
                        rules={[
                          {
                            required: true,
                            message: 'Pay period is required',
                          },
                        ]}
                        id={`compensation-deduction-sidebar-schedule-period-item-${index}`}
                        data-cy={`compensation-deduction-sidebar-schedule-period-item-${index}`}
                      >
                        <Select
                          placeholder="Select pay period"
                          value={row.payPeriodId || undefined}
                          onChange={(value) =>
                            handlePayPeriodChange(index, value)
                          }
                          loading={payPeriodsLoading}
                          options={payPeriods
                            ?.filter((period: any) => {
                              // Filter out inactive pay periods
                              if (period.isActive === false) return false;
                              // Filter out past pay periods (where end date is before today)
                              const endDate = dayjs(period.endDate);
                              const today = dayjs().startOf('day');
                              return (
                                endDate.isAfter(today) ||
                                endDate.isSame(today, 'day')
                              );
                            })
                            .map((period: any) => ({
                              value: period.id,
                              label: `${dayjs(period.startDate).format('MMM DD, YYYY')} – ${dayjs(period.endDate).format('MMM DD, YYYY')}`,
                              disabled: deductionPayPeriodSchedule.some(
                                (r, i) =>
                                  i !== index && r.payPeriodId === period.id,
                              ),
                            }))}
                          id={`compensation-deduction-sidebar-schedule-period-select-${index}`}
                          data-cy={`compensation-deduction-sidebar-schedule-period-select-${index}`}
                        />
                      </Form.Item>
                    </div>
                  ))}
                </div>
              )}
            </Form>
          </Spin>
        </CustomDrawerLayout>
      )}

      {/* Duplicate Confirmation Modal */}
      <DuplicateDeductionModal
        data-cy="compensation-deduction-sidebar-duplicate-modal"
        open={showDuplicateModal}
        onConfirm={handleDuplicateConfirm}
        onCancel={handleDuplicateCancel}
        loading={createAllowanceEntitlementLoading}
        employeeNames={duplicateEmployeeNames}
      />
    </>
  );
};

export default DeductionEntitlementSideBar;
