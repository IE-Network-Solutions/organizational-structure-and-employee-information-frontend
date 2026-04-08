'use client';
import {
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Spin,
  Table,
  Tag,
} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
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
import { TableSkeleton } from '@/components/tableSkeleton';

dayjs.extend(isBetween);

const { Option } = Select;
const inputClassName = 'w-full rounded-md border-gray-300';
const CONTROL_40H =
  'h-10 [&_.ant-input-number-input]:h-10 [&_.ant-input-number-input]:leading-10';
const SELECT_40H =
  'h-10 [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!items-center [&_.ant-select-selection-search-input]:!h-10';

type BenefitEntitlementProps = {
  title: string;
  /** Deduction type detail (fixed deduction): labels use "deduction" instead of "benefit". */
  forDeductionDetail?: boolean;
};

const BenefitEntitlementSideBar = ({
  title,
  forDeductionDetail = false,
}: BenefitEntitlementProps) => {
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
  const params = useParams();
  const idParam = params?.['id'];
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const [form] = Form.useForm();
  const { TextArea } = Input;

  const { data: benefitDatas } = useFetchBenefit(id ?? '');
  const { data: payPeriods, isLoading: payLoading } = useGetPayPeriod();
  const { data: existingEntitlements, isLoading: entitlementsLoading } =
    useFetchBenefitEntitlement(id ?? '');

  const selectedEmployeeIds = Form.useWatch('employeeIds', form) as
    | string[]
    | undefined;

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
        compensationItemId: id ?? '',
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
  }, [
    totalAmount,
    settlementPeriod,
    payPeriods,
    form,
    benefitDatas?.isPeriodic,
  ]);
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
            className={`w-full ${CONTROL_40H}`}
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
          rules={
            benefitDatas?.isPeriodic !== false
              ? [{ required: true, message: 'Pay Period is required' }]
              : []
          }
          data-cy={`benefit-entitlement-sidebar-pay-period-item-${index}`}
        >
          <Select
            placeholder="Pay Period"
            allowClear
            className={`w-full ${SELECT_40H}`}
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
            rows={1}
            className="w-full h-10 min-h-10 resize-none rounded-md border-gray-300 font-normal placeholder:font-normal"
            style={{ height: 40 }}
            data-cy={`benefit-entitlement-sidebar-reason-textarea-${index}`}
          />
        </Form.Item>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={
          <div
            className="flex w-full items-center justify-between gap-4"
            data-cy="compensation-benefit-sidebar-modal-title-row"
          >
            <span
              className="inline-flex min-h-6 items-center text-base font-semibold leading-6 text-gray-900"
              id="compensation-benefit-sidebar-title"
              data-cy="compensation-benefit-sidebar-title"
            >
              {forDeductionDetail
                ? 'Add Deduction Entitlement'
                : 'Add Benefit Entitlement'}
              {forDeductionDetail && title ? (
                <span
                  className="ml-1 font-normal text-gray-600"
                  data-cy="compensation-benefit-sidebar-title-type-name"
                ></span>
              ) : null}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
              data-cy="compensation-benefit-sidebar-close"
            >
              <CloseOutlined style={{ fontSize: 16, color: '#262626' }} />
            </button>
          </div>
        }
        open={isBenefitEntitlementSidebarOpen}
        onCancel={onClose}
        closable={false}
        footer={
          <div
            className="flex w-full justify-end gap-3"
            id="compensation-benefit-sidebar-footer"
            data-cy="compensation-benefit-sidebar-footer"
          >
            <Button
              type="default"
              className="h-8 px-4 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-normal hover:bg-gray-50"
              loading={createBenefitLoading}
              onClick={onClose}
              id="compensation-benefit-sidebar-cancel-button"
              data-cy="compensation-benefit-sidebar-cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="h-8 px-4 rounded-md text-sm font-normal"
              loading={createBenefitLoading}
              disabled={entitlementsLoading}
              onClick={() => form.submit()}
              id="compensation-benefit-sidebar-create-button"
              data-cy="compensation-benefit-sidebar-create-button"
            >
              Continue
            </Button>
          </div>
        }
        width={560}
        centered
        style={{ maxWidth: 'calc(100vw - 32px)' }}
        mask={true}
        maskClosable={false}
        zIndex={10002}
        rootClassName="[&_.ant-modal-title]:!block [&_.ant-modal-title]:!w-full [&_.ant-form-item-label>label]:!font-normal [&_.ant-form-item-label>label]:text-[#262626] max-sm:[&_.ant-modal-body]:[-ms-overflow-style:none] max-sm:[&_.ant-modal-body]:[scrollbar-width:none] max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!hidden max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!w-0 max-sm:[&_.ant-modal-body::-webkit-scrollbar]:!h-0"
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
        data-cy="compensation-benefit-sidebar-modal"
      >
        <div
          className="rounded-lg border border-solid border-[#D9D9D9] bg-white px-6 py-5"
          data-cy="compensation-benefit-sidebar-modal-inner"
        >
          <Spin
            data-cy="compensation-benefit-sidebar-loading"
            spinning={allUserLoading || payLoading || depLoading}
          >
            <Form
              layout="vertical"
              form={form}
              onFinish={onFormSubmit}
              requiredMark={CustomLabel}
              id="compensation-benefit-sidebar-form"
              data-cy="compensation-benefit-sidebar-form"
              className="[&_.ant-form-item-label>label]:text-sm [&_.ant-form-item-label>label]:font-normal [&_.ant-form-item-label>label]:text-[#262626]"
            >
              <div
                className={`grid gap-4 mb-5 ${benefitDatas?.isPeriodic === false ? 'grid-cols-1' : 'grid-cols-2'}`}
                id="compensation-benefit-sidebar-amount-grid"
                data-cy="compensation-benefit-sidebar-amount-grid"
              >
                <Form.Item
                  data-cy="compensation-benefit-sidebar-total-amount-item"
                  required
                  name="totalAmount"
                  label="Total Amount"
                  className="mb-0"
                >
                  <InputNumber
                    className={`${inputClassName} ${CONTROL_40H}`}
                    placeholder="0"
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
                        <span data-cy="benefit-sidebar-settlement-period-label">
                          Settlement Period
                        </span>
                      ) : (
                        <span data-cy="benefit-sidebar-payout-period-label">
                          Payout Period
                        </span>
                      )
                    }
                    data-cy="compensation-benefit-sidebar-settlement-period-item"
                    className="mb-0"
                  >
                    <InputNumber
                      className={`${inputClassName} ${CONTROL_40H}`}
                      placeholder="0"
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
                  className="border border-gray-200 rounded-lg py-4 mb-5"
                  id="compensation-benefit-sidebar-payments-table-wrapper"
                  data-cy="compensation-benefit-sidebar-payments-table-wrapper"
                >
                  {entitlementsLoading ? (
                    <TableSkeleton columns={columns} />
                  ) : (
                    <Table
                      data-cy="compensation-benefit-sidebar-payments-table"
                      columns={columns}
                      dataSource={data}
                      bordered={false}
                      className="mb-0"
                      showHeader={false}
                      pagination={false}
                    />
                  )}
                </div>
              )}

              <Form.Item
                name="department"
                label="Department"
                className="mb-5"
                id="compensation-benefit-sidebar-department-item"
                data-cy="compensation-benefit-sidebar-department-item"
              >
                <Select
                  loading={depLoading}
                  placeholder="Select department"
                  className="w-full h-10 mt-2"
                  allowClear
                  showSearch
                  onChange={(value) => handleDepartmentChange(value)}
                  filterOption={(input: string, option: any) =>
                    (option?.label ?? '')
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={departments?.map((dept: any) => ({
                    value: dept.name,
                    label: dept.name,
                  }))}
                  id="compensation-benefit-sidebar-department-select"
                  data-cy="compensation-benefit-sidebar-department-select"
                />
              </Form.Item>

              <Form.Item
                name="employeeIds"
                label="Select Employees"
                rules={[{ required: true, message: 'Please select employees' }]}
                id="compensation-benefit-sidebar-employees-item"
                data-cy="compensation-benefit-sidebar-employees-item"
                className="mb-0"
              >
                <Select
                  showSearch
                  placeholder="Select employee"
                  mode="multiple"
                  // className={`w-full rounded-md ${SELECT_40H} [&_.ant-select-selection-placeholder]:!h-10 [&_.ant-select-selection-placeholder]:!leading-10 [&_.ant-select-selection-placeholder]:!display-flex [&_.ant-select-selection-placeholder]:!items-center`}
                  className="w-full h-10 mt-2"
                  allowClear
                  maxTagCount={0}
                  filterOption={(input: any, option: any) =>
                    (option?.label ?? '')
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={allUsers?.items?.map((item: any) => ({
                    ...item,
                    value: item?.id,
                    label:
                      `${item?.firstName ?? ''} ${item?.middleName ?? ''} ${item?.lastName ?? ''}`.trim(),
                  }))}
                  loading={allUserLoading}
                  id="compensation-benefit-sidebar-employees-select"
                  data-cy="compensation-benefit-sidebar-employees-select"
                />
              </Form.Item>
              {Array.isArray(selectedEmployeeIds) &&
                selectedEmployeeIds.length > 0 && (
                  <div
                    className="mt-2 flex flex-wrap gap-2"
                    id="compensation-benefit-sidebar-employees-tags"
                    data-cy="compensation-benefit-sidebar-employees-tags"
                  >
                    {selectedEmployeeIds.map((empId) => {
                      const user = allUsers?.items?.find(
                        (u: any) => u.id === empId,
                      );
                      const label = user
                        ? `${user?.firstName ?? ''} ${user?.middleName ?? ''} ${user?.lastName ?? ''}`.trim()
                        : String(empId);
                      return (
                        <Tag
                          key={empId}
                          className="m-0 rounded-md px-2 py-1 text-sm font-normal bg-[#E6E6E6] border-[#D0D0D0] text-[#262626]"
                          closable={false}
                        >
                          {label}
                        </Tag>
                      );
                    })}
                  </div>
                )}
            </Form>
          </Spin>
        </div>
      </Modal>

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
