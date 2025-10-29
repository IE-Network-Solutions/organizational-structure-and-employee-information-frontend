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
      existingEntitlements.compensationItmeEntitlement &&
      Array.isArray(existingEntitlements.compensationItmeEntitlement)
    ) {
      entitlementsArray = existingEntitlements.compensationItmeEntitlement;
    } else if (
      existingEntitlements.items &&
      Array.isArray(existingEntitlements.items)
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
    const paymentAmount = formValues.payments.reduce(
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

    // Check for duplicates before proceeding
    const selectedEmployeeIds = formValues.employeeIds;
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
        employeeIds: formValues.employeeIds,
        totalAmount: formValues.totalAmount,
        settlementPeriod: Number(formValues.settlementPeriod),
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

      return {
        key: i,
        amount: Number(amountPerPeriod).toFixed(2),
        payPeriodId: matchedPeriod?.id ?? null,
      };
    });

    setData(newData);
    form.setFieldsValue({ payments: newData });
  }, [totalAmount, settlementPeriod, payPeriods]);
  const columns = [
    {
      dataIndex: 'amount',
      key: 'amount',
      render: (notused: any, notuseds: any, index: number) => (
        <Form.Item
          label={'Amount'}
          name={['payments', index, 'amount']}
          className="mb-0"
        >
          <InputNumber className="w-full" />
        </Form.Item>
      ),
    },
    {
      dataIndex: 'payPeriodId',
      key: 'payPeriodId',
      render: (notused: any, notuseds: any, index: number) => (
        <Form.Item
          label={'Pay Period'}
          required
          name={['payments', index, 'payPeriodId']}
          className="mb-0"
          rules={[{ required: true, message: 'Pay Period is required' }]}
        >
          <Select placeholder="Pay Period" allowClear className="w-full">
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
                <Option key={period.id} value={period.id}>
                  {dayjs(period.startDate).format('MMM DD, YYYY')} –{' '}
                  {dayjs(period.endDate).format('MMM DD, YYYY')}
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
          required
          name={['payments', index, 'reason']}
          className="mb-0"
        >
          <TextArea placeholder="Reason" autoSize />
        </Form.Item>
      ),
    },
  ];

  return (
    <>
      {isBenefitEntitlementSidebarOpen && (
        <CustomDrawerLayout
          open={isBenefitEntitlementSidebarOpen}
          onClose={onClose}
          modalHeader={
            <CustomDrawerHeader className="flex justify-center">
              <span className="text-2xl">{title}</span>
            </CustomDrawerHeader>
          }
          footer={
            <div className="flex flex-row gap-4 justify-center py-3">
              <Button
                type="default"
                className="h-10 px-3 w-40"
                size="large"
                loading={createBenefitLoading}
                onClick={() => onClose()}
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
              >
                Create
              </Button>
            </div>
          }
          width="35%"
          customPadding="16px"
        >
          <Spin spinning={allUserLoading || payLoading}>
            <Form
              layout="vertical"
              className="p-2"
              form={form}
              onFinish={onFormSubmit}
              requiredMark={CustomLabel}
            >
              <div className="grid grid-cols-2 gap-4">
                <Form.Item required name="totalAmount" label="Total Amount">
                  <InputNumber
                    className="w-full h-10 mt-1"
                    value={totalAmount}
                    onChange={(value) => setTotalAmount(value || 0)}
                  />
                </Form.Item>
                <Form.Item
                  required
                  name="settlementPeriod"
                  label="Settlement Period"
                >
                  <InputNumber
                    className="w-full h-10 mt-1"
                    value={settlementPeriod}
                    onChange={(value) => setSettlementPeriod(value || 0)}
                  />
                </Form.Item>
              </div>

              {data && data.length > 0 && (
                <Table
                  columns={columns}
                  dataSource={data}
                  bordered={false}
                  className="mb-4"
                  pagination={false}
                />
              )}

              <Form.Item
                name="department"
                label="Select Department"
                className="form-item min-h-10"
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
                >
                  {departments?.map((dept: any) => (
                    <Option key={dept.id} value={dept.name}>
                      {dept.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="employeeIds"
                label="Select Employees"
                rules={[{ required: true, message: 'Please select employees' }]}
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
                />
              </Form.Item>
            </Form>
          </Spin>
        </CustomDrawerLayout>
      )}

      {/* Duplicate Confirmation Modal */}
      <DuplicateDeductionModal
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
