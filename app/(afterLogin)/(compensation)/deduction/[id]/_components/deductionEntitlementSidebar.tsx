'use client';

import { Button, Form, Input, InputNumber, Modal, Select, Spin } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
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
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGetBasicSalaryById } from '@/store/server/features/employees/employeeManagment/basicSalary/queries';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import dayjs from 'dayjs';

const inputClassName = 'w-full rounded-md border-gray-300';
const CONTROL_40H =
  'h-10 [&_.ant-input-number-input]:h-10 [&_.ant-input-number-input]:leading-10';
const SELECT_40H =
  'h-10 [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!items-center [&_.ant-select-selection-search-input]:!h-10';

function toBasicSalaryRows(data: unknown): any[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data;
  if (
    typeof data === 'object' &&
    Array.isArray((data as { items?: unknown }).items)
  ) {
    return (data as { items: any[] }).items;
  }
  if (
    typeof data === 'object' &&
    (data as { basicSalary?: unknown }).basicSalary != null
  ) {
    return [data];
  }
  return [];
}

function pickActiveBasicSalaryAmount(rows: any[]): number {
  const active = rows.find(
    (item) =>
      item?.status === true ||
      item?.status === 'ACTIVE' ||
      item?.isActive === true ||
      item?.isActive === 'ACTIVE',
  );
  if (!active) return 0;
  const n = Number(active.basicSalary);
  return Number.isFinite(n) ? n : 0;
}

const DeductionEntitlementSideBar = () => {
  const {
    isAllowanceEntitlementSidebarOpen,
    resetStore,
    setSelectedDepartment,
    deductionPayPeriodSchedule,
    setDeductionPayPeriodSchedule,
    selectedEmployeeForDeduction,
    setSelectedEmployeeForDeduction,
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

  // Update rate from deduction type (store copy for other consumers)
  useEffect(() => {
    if (deductionTypeData?.defaultAmount != null) {
      const n = Number(deductionTypeData.defaultAmount);
      if (Number.isFinite(n)) setDeductionRate(n);
    }
  }, [deductionTypeData, setDeductionRate]);

  /** Salary from API in the same render as fetch — avoids schedule using stale 0 from Zustand. */
  const resolvedBasicSalary = useMemo(
    () => pickActiveBasicSalaryAmount(toBasicSalaryRows(basicSalaryData)),
    [basicSalaryData],
  );

  useEffect(() => {
    setSelectedEmployeeBasicSalary(resolvedBasicSalary);
  }, [resolvedBasicSalary, setSelectedEmployeeBasicSalary]);

  const effectiveRatePercent = useMemo(() => {
    const fromStore = Number(deductionRate);
    if (Number.isFinite(fromStore) && fromStore > 0) return fromStore;
    const fromType = Number(deductionTypeData?.defaultAmount);
    return Number.isFinite(fromType) && fromType > 0 ? fromType : 0;
  }, [deductionRate, deductionTypeData?.defaultAmount]);

  /**
   * Builds schedule rows: sequential min(monthlyCap, remaining) until total is
   * allocated. Each row starts with payPeriodId '' — user picks distinct periods
   * in the Payment Schedule UI. See proceedWithCreation / API payload.
   */
  const calculatePaymentSchedule = useCallback(() => {
    const salary = resolvedBasicSalary;
    const total = Number(deductionTotalAmount);
    const rate = effectiveRatePercent;

    if (
      !Number.isFinite(salary) ||
      salary <= 0 ||
      !Number.isFinite(total) ||
      total <= 0 ||
      !Number.isFinite(rate) ||
      rate <= 0
    ) {
      setDeductionPayPeriodSchedule([]);
      return;
    }

    const monthlyDeduction = (salary * rate) / 100;

    if (monthlyDeduction <= 0) {
      setDeductionPayPeriodSchedule([]);
      return;
    }

    const schedule: PayPeriodScheduleRow[] = [];
    let remainingAmount = total;

    while (remainingAmount > 0) {
      const amount = Math.min(monthlyDeduction, remainingAmount);
      schedule.push({
        amount: Math.round(amount * 100) / 100,
        payPeriodId: '',
      });
      remainingAmount -= amount;
    }

    setDeductionPayPeriodSchedule(schedule);
  }, [
    resolvedBasicSalary,
    deductionTotalAmount,
    effectiveRatePercent,
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
    form.setFieldsValue({ employee: value });
    setSelectedEmployeeBasicSalary(0);
    setDeductionPayPeriodSchedule([]);
  };

  const handleTotalAmountChange = (value: number | null) => {
    const next = value || 0;
    setDeductionTotalAmount(next);
    form.setFieldsValue({ totalAmount: next });
  };

  const handlePayPeriodChange = (index: number, payPeriodId: string) => {
    updatePayPeriodScheduleRow(index, payPeriodId);
  };

  const areAllPayPeriodsSelected =
    deductionPayPeriodSchedule.length > 0 &&
    deductionPayPeriodSchedule.every((row) => row.payPeriodId);

  const isScheduleValid =
    deductionPayPeriodSchedule.length > 0 &&
    deductionPayPeriodSchedule.every((row) => row.amount > 1);

  const isSubmitDisabled =
    !selectedEmployeeForDeduction ||
    !Number(deductionTotalAmount) ||
    resolvedBasicSalary <= 0 ||
    basicSalaryLoading ||
    !areAllPayPeriodsSelected ||
    !isScheduleValid;

  return (
    <>
      <Modal
        title={
          <div
            className="flex w-full items-center justify-between gap-4"
            data-cy="compensation-deduction-sidebar-modal-title-row"
          >
            <span
              className="inline-flex min-h-6 min-w-0 flex-1 items-center text-left text-base font-semibold leading-6 text-gray-900"
              id="compensation-deduction-sidebar-title-text"
              data-cy="compensation-deduction-sidebar-title-text"
            >
              Add Deduction Entitlement
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
              data-cy="compensation-deduction-sidebar-close"
            >
              <CloseOutlined style={{ fontSize: 16, color: '#262626' }} />
            </button>
          </div>
        }
        open={isAllowanceEntitlementSidebarOpen}
        onCancel={onClose}
        closable={false}
        mask
        maskClosable={false}
        zIndex={10002}
        width={640}
        centered
        style={{ maxWidth: 'calc(100vw - 32px)' }}
        footer={
          <div
            className="flex w-full justify-end gap-3"
            id="compensation-deduction-sidebar-footer"
            data-cy="compensation-deduction-sidebar-footer"
          >
            <Button
              type="default"
              className="h-10 px-4 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-normal hover:bg-gray-50"
              loading={createAllowanceEntitlementLoading}
              onClick={onClose}
              disabled={createAllowanceEntitlementLoading}
              id="compensation-deduction-sidebar-cancel-button"
              data-cy="compensation-deduction-sidebar-cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="h-10 px-4 rounded-md text-sm font-normal"
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
        data-cy="compensation-deduction-sidebar-modal"
      >
        <div
          className="rounded-lg border border-solid border-[#D9D9D9] bg-white px-6 py-5"
          data-cy="compensation-deduction-sidebar-modal-inner"
        >
          <Spin
            spinning={
              allUserLoading ||
              deductionTypeLoading ||
              basicSalaryLoading ||
              payPeriodsLoading
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
              className="[&_.ant-form-item-label>label]:text-sm [&_.ant-form-item-label>label]:font-normal [&_.ant-form-item-label>label]:text-[#262626]"
            >
              <div
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6"
                data-cy="compensation-deduction-sidebar-top-fields"
              >
                <Form.Item
                  name="employee"
                  label="Select Employee"
                  rules={[
                    { required: true, message: 'Please select an employee' },
                  ]}
                  className="mb-0"
                  id="compensation-deduction-sidebar-employee-item"
                  data-cy="compensation-deduction-sidebar-employee-item"
                >
                  <Select
                    showSearch
                    placeholder="Select employee"
                    className="w-full h-10"
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
                    {
                      required: true,
                      message: 'Total amount is required',
                    },
                    {
                      validator: (notused, value) => {
                        void notused;
                        if (value != null && value < 0) {
                          return Promise.reject(
                            new Error('Total amount cannot be less than 0'),
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  className="mb-0"
                  id="compensation-deduction-sidebar-total-amount-item"
                  data-cy="compensation-deduction-sidebar-total-amount-item"
                >
                  <InputNumber
                    className={`${inputClassName} ${CONTROL_40H} w-full`}
                    min={0}
                    placeholder="0"
                    value={deductionTotalAmount}
                    onChange={handleTotalAmountChange}
                    formatter={(val) =>
                      val === undefined || val === null
                        ? ''
                        : `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(display) =>
                      display ? Number(display.replace(/,/g, '')) : 0
                    }
                    id="compensation-deduction-sidebar-total-amount-input"
                    data-cy="compensation-deduction-sidebar-total-amount-input"
                  />
                </Form.Item>
              </div>

              {selectedEmployeeForDeduction && basicSalaryLoading && (
                <div
                  className="mt-4 text-sm text-gray-500"
                  data-cy="deduction-sidebar-loading-salary"
                >
                  Loading employee basic salary...
                </div>
              )}

              {selectedEmployeeForDeduction &&
                !basicSalaryLoading &&
                resolvedBasicSalary <= 0 && (
                  <div
                    className="mt-4 text-sm text-red-500"
                    data-cy="deduction-sidebar-no-salary-error"
                  >
                    No active basic salary found for this employee. Please set
                    up the employee&apos;s basic salary first.
                  </div>
                )}

              {deductionPayPeriodSchedule.length > 0 && (
                <>
                  <h3
                    className="mt-6 mb-4 text-sm font-semibold text-[#262626]"
                    data-cy="compensation-deduction-sidebar-schedule-heading"
                  >
                    Payment Schedule
                  </h3>
                  <div
                    className="rounded-lg border border-gray-200 px-4 py-4"
                    id="compensation-deduction-sidebar-schedule-container"
                    data-cy="compensation-deduction-sidebar-schedule-container"
                  >
                    {deductionPayPeriodSchedule.map((row, index) => (
                      <div
                        key={index}
                        className="mb-4 grid grid-cols-1 gap-4 last:mb-0 sm:grid-cols-2 sm:gap-6"
                        id={`compensation-deduction-sidebar-schedule-row-${index}`}
                        data-cy={`compensation-deduction-sidebar-schedule-row-${index}`}
                      >
                        <Form.Item
                          label="Amount"
                          className="mb-0"
                          id={`compensation-deduction-sidebar-schedule-amount-item-${index}`}
                          data-cy={`compensation-deduction-sidebar-schedule-amount-item-${index}`}
                        >
                          <Input
                            disabled
                            value={Number(row.amount).toLocaleString('en-US', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}
                            className={`${inputClassName} h-10 cursor-not-allowed bg-[#F5F5F5] text-[#434343]`}
                            id={`compensation-deduction-sidebar-schedule-amount-input-${index}`}
                            data-cy={`compensation-deduction-sidebar-schedule-amount-input-${index}`}
                          />
                        </Form.Item>

                        <Form.Item
                          label="Pay Period"
                          className="mb-0"
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
                            className={`w-full ${SELECT_40H}`}
                            options={(() => {
                              const raw = payPeriods as unknown as
                                | any[]
                                | { items?: any[] }
                                | undefined;
                              const periodsList: any[] = Array.isArray(raw)
                                ? raw
                                : raw &&
                                    typeof raw === 'object' &&
                                    Array.isArray(raw.items)
                                  ? raw.items
                                  : [];
                              const today = dayjs().startOf('day');
                              return periodsList
                                .filter((period: any) => {
                                  if (period.isActive === false) return false;
                                  const endDate = dayjs(period.endDate);
                                  return (
                                    endDate.isAfter(today) ||
                                    endDate.isSame(today, 'day')
                                  );
                                })
                                .map((period: any) => ({
                                  value: String(period.id),
                                  label: `${dayjs(period.startDate).format('MMM DD, YYYY')} – ${dayjs(period.endDate).format('MMM DD, YYYY')}`,
                                  disabled: deductionPayPeriodSchedule.some(
                                    (r, i) =>
                                      i !== index &&
                                      r.payPeriodId === String(period.id),
                                  ),
                                }));
                            })()}
                            id={`compensation-deduction-sidebar-schedule-period-select-${index}`}
                            data-cy={`compensation-deduction-sidebar-schedule-period-select-${index}`}
                          />
                        </Form.Item>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Form>
          </Spin>
        </div>
      </Modal>

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
