import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Button, Form, Input, Select, Spin, Switch } from 'antd';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';
// import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useCreateAllowanceEntitlement } from '@/store/server/features/compensation/allowance/mutations';
import { useParams } from 'next/navigation';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useFetchAllowanceEntitlements } from '@/store/server/features/compensation/allowance/queries';
import DuplicateDeductionModal from '@/components/common/duplicateDeductionModal';
import { useState } from 'react';

const AllowanceEntitlementSideBar = () => {
  const {
    isAllowanceEntitlementSidebarOpen,
    resetStore,
    // departmentUsers,
    // setDepartmentUsers,
    // selectedDepartment,
    setSelectedDepartment,
    setIsRate,
    isRate,
  } = useAllowanceEntitlementStore();
  const {
    mutate: createAllowanceEntitlement,
    isLoading: createAllowanceEntitlementLoading,
  } = useCreateAllowanceEntitlement();
  const [form] = Form.useForm();
  // const { data: departments, isLoading } = useGetDepartmentsWithUsers();
  const { data: allUsers, isLoading: allUserLoading } = useGetAllUsers();

  // State for duplicate confirmation modal
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<any>(null);
  const [duplicateEmployeeNames, setDuplicateEmployeeNames] = useState<
    string[]
  >([]);

  const { id } = useParams();
  const { data: existingEntitlements, isLoading: entitlementsLoading } =
    useFetchAllowanceEntitlements(id);

  const onClose = () => {
    form.resetFields();
    resetStore();
    setSelectedDepartment(null);
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
      // Handle nested structure like in allDeductionTable
      entitlementsArray = existingEntitlements.compensationItmeEntitlement;
    } else if (
      existingEntitlements?.items &&
      Array.isArray(existingEntitlements?.items)
    ) {
      // Handle paginated response
      entitlementsArray = existingEntitlements.items;
    }

    if (entitlementsArray.length === 0) {
      return { hasDuplicates: false, duplicateNames: [] };
    }

    // Normalize to string to avoid type mismatch (number vs string)
    const existingEmployeeIds = entitlementsArray.map((entitlement: any) =>
      String(entitlement.employeeId),
    );

    const duplicateIds = selectedEmployeeIds
      .map((empId: any) => String(empId))
      .filter((empId: string) => existingEmployeeIds.includes(empId));

    if (duplicateIds.length === 0) {
      return { hasDuplicates: false, duplicateNames: [] };
    }

    // Get names of duplicate employees
    const duplicateNames = duplicateIds.map((empId) => {
      const user = allUsers?.items?.find((user: any) => user.id === empId);
      return user ? `${user.firstName} ${user.lastName}` : `Employee ${empId}`;
    });

    return { hasDuplicates: true, duplicateNames };
  };

  const onFormSubmit = (formValues: any) => {
    const selectedEmployeeIds = formValues?.employees || [];
    const { hasDuplicates, duplicateNames } =
      checkForDuplicates(selectedEmployeeIds);

    if (hasDuplicates) {
      // Show confirmation modal for duplicates
      setDuplicateEmployeeNames(duplicateNames);
      setPendingFormData(formValues);
      setShowDuplicateModal(true);
    } else {
      // No duplicates, proceed with creation
      proceedWithCreation(formValues);
    }
  };

  const proceedWithCreation = (formValues: any) => {
    createAllowanceEntitlement(
      {
        compensationItemId: id,
        employeeIds: formValues?.employees || [],
        totalAmount: Number(formValues?.totalAmount || 0),
        settlementPeriod: Number(formValues?.settlementPeriod || 0),
        active: true,
        isRate: formValues?.isRate,
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

  // const handleDepartmentChange = (value: string) => {
  //   setSelectedDepartment(value);
  //   const department = departments.find((dept: any) => dept.name === value);
  //   if (department) {
  //     setDepartmentUsers(department.users);
  //     form.setFieldsValue({
  //       employees: department.users.map((user: any) => user.id),
  //     });
  //   }
  // };

  return (
    <>
      {isAllowanceEntitlementSidebarOpen && (
        <CustomDrawerLayout
          open={isAllowanceEntitlementSidebarOpen}
          onClose={onClose}
          modalHeader={
            <CustomDrawerHeader className="flex justify-center">
              <span>Add Deduction Entitlement</span>
            </CustomDrawerHeader>
          }
          footer={
            <div className="flex flex-row gap-4 justify-center py-3">
              <Button
                type="default"
                className="h-10 px-3 w-40"
                size="large"
                loading={allUserLoading}
                onClick={() => onClose()}
                disabled={createAllowanceEntitlementLoading}
              >
                Cancel
              </Button>

              <Button
                type="primary"
                key="create"
                className="h-10 px-3 w-40"
                size="large"
                loading={createAllowanceEntitlementLoading}
                disabled={entitlementsLoading}
                onClick={() => form.submit()}
              >
                Create
              </Button>
            </div>
          }
          width="600px"
        >
          <Spin spinning={allUserLoading}>
            <Form
              layout="vertical"
              form={form}
              onFinish={onFormSubmit}
              requiredMark={CustomLabel}
            >
              {/* <Form.Item
                name="department"
                label="Select Department"
                rules={[
                  { required: true, message: 'Please select a department' },
                ]}
              >
                <Select
                  placeholder="Select a department"
                  onChange={handleDepartmentChange}
                >
                  {departments?.map((department: any) => (
                    <Select.Option key={department.id} value={department.name}>
                      {department.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item> */}

              <Form.Item
                name="employees"
                label="Select Employees"
                rules={[{ required: true, message: 'Please select employees' }]}
              >
                <Select
                  showSearch
                  placeholder="Select a person"
                  mode="multiple"
                  className="w-full h-14"
                  allowClear
                  filterOption={(input: any, option: any) =>
                    (option?.label ?? '')
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={allUsers?.items?.map((item: any) => ({
                    ...item,
                    value: item?.id,
                    label: item?.firstName + ' ' + item?.lastName,
                  }))}
                  loading={allUserLoading}
                />
              </Form.Item>
              <Form.Item label="Per day" name="isRate">
                <Switch onChange={(checked) => setIsRate(checked)} />
              </Form.Item>
              <div style={{ display: 'flex', gap: '20px' }}>
                <Form.Item
                  name="totalAmount"
                  label={isRate ? 'Per day' : 'Total Amount'}
                  rules={[
                    { required: true, message: 'Total amount is required!' },
                    {
                      validator: (notused, value) => {
                        if (value < 0) {
                          return Promise.reject(
                            new Error('Total amount cannot be less than 0!'),
                          );
                        }
                        if (isRate && value > 30) {
                          return Promise.reject(
                            new Error(
                              'Total amount cannot be greater than 30!',
                            ),
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  className="form-item w-full"
                >
                  <Input
                    className="control"
                    type="number"
                    min={0}
                    max={isRate ? 30 : undefined}
                    placeholder={isRate ? 'Enter per day' : 'Total Amount'}
                    style={{ height: '32px', padding: '4px 8px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="settlementPeriod"
                  label={'Settlement Period'}
                  rules={[
                    {
                      required: true,
                      message: 'settlement period is required!',
                    },
                  ]}
                  className="form-item w-full"
                >
                  <Input
                    className="control"
                    type="number"
                    placeholder={'settlement Period'}
                    style={{ height: '32px', padding: '4px 8px' }}
                  />
                </Form.Item>
              </div>
            </Form>
          </Spin>
        </CustomDrawerLayout>
      )}

      {/* Duplicate Confirmation Modal */}
      <DuplicateDeductionModal
        open={showDuplicateModal}
        onConfirm={handleDuplicateConfirm}
        onCancel={handleDuplicateCancel}
        loading={createAllowanceEntitlementLoading}
        employeeNames={duplicateEmployeeNames}
      />
    </>
  );
};

export default AllowanceEntitlementSideBar;
