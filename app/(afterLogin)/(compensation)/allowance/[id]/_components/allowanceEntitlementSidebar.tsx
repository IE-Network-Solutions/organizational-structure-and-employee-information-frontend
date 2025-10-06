import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Button, Form, Select, Spin, Checkbox } from 'antd';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';
// import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useCreateAllowanceEntitlement } from '@/store/server/features/compensation/allowance/mutations';
import { useParams } from 'next/navigation';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useState } from 'react';

const AllowanceEntitlementSideBar = () => {
  const {
    isAllowanceEntitlementSidebarOpen,
    resetStore,
    // departmentUsers,
    // setDepartmentUsers,
    // selectedDepartment,
    setSelectedDepartment,
  } = useAllowanceEntitlementStore();
  const { mutate: createAllowanceEntitlement } =
    useCreateAllowanceEntitlement();
  const [form] = Form.useForm();
  // const { data: departments, isLoading } = useGetDepartmentsWithUsers();
  const { id } = useParams();
  const { data: allUsers, isLoading: allUserLoading } = useGetAllUsers();
  const [showDepartmentLeadsOnly, setShowDepartmentLeadsOnly] = useState(false);
  const [showNonLeadsOnly, setShowNonLeadsOnly] = useState(false);

  const onClose = () => {
    form.resetFields();
    resetStore();
    setSelectedDepartment(null);
    setShowDepartmentLeadsOnly(false);
    setShowNonLeadsOnly(false);
  };

  const onFormSubmit = (formValues: any) => {
    createAllowanceEntitlement({
      compensationItemId: id,
      employeeIds: formValues.employees,
      active: true,
    });
    onClose();
  };

  // Filter users based on checkbox filters
  const filteredUsers = allUsers?.items?.filter((user: any) => {
    if (!showDepartmentLeadsOnly && !showNonLeadsOnly) return true;
    
    // Check if user is a department lead
    const isDepartmentLead = user?.employeeJobInformation?.find(
      (job: any) => job.isPositionActive
    )?.departmentLeadOrNot;
    
    if (showDepartmentLeadsOnly) {
      return isDepartmentLead === true;
    }
    
    if (showNonLeadsOnly) {
      return isDepartmentLead === false || isDepartmentLead === null;
    }
    
    return true;
  });

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
    isAllowanceEntitlementSidebarOpen && (
      <CustomDrawerLayout
        open={isAllowanceEntitlementSidebarOpen}
        onClose={onClose}
        modalHeader={
          <CustomDrawerHeader
            className="flex justify-center"
            data-testid="entitlement-sidebar-header"
          >
            <span>Add Allowance Entitlement</span>
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
            >
              Cancel
            </Button>

            <Button
              type="primary"
              key="create"
              className="h-10 px-3 w-40"
              size="large"
              loading={allUserLoading}
              onClick={() => form.submit()}
            >
              Create
            </Button>
          </div>
        }
        width="30%"
        customMobileHeight="37vh"
        data-testid="allowance-entitlement-sidebar"
      >
        <Spin
          spinning={allUserLoading}
          data-testid="entitlement-sidebar-loading"
        >
          <Form
            layout="vertical"
            form={form}
            onFinish={(values) => onFormSubmit(values)}
            requiredMark={CustomLabel}
            data-testid="entitlement-form"
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

            <div className="mb-4 space-y-2">
              <Checkbox
                checked={showDepartmentLeadsOnly}
                onChange={(e) => {
                  setShowDepartmentLeadsOnly(e.target.checked);
                  if (e.target.checked) {
                    setShowNonLeadsOnly(false);
                  }
                }}
                data-testid="department-leads-filter"
              >
                Show Team Leads
              </Checkbox>
              
              <Checkbox
                checked={showNonLeadsOnly}
                onChange={(e) => {
                  setShowNonLeadsOnly(e.target.checked);
                  if (e.target.checked) {
                    setShowDepartmentLeadsOnly(false);
                  }
                }}
                data-testid="non-leads-filter"
              >
                Show Subbordinates
              </Checkbox>
            </div>

            <Form.Item
              className="form-item"
              name="employees"
              label="Select Employees"
              rules={[{ required: true, message: 'Please select employees' }]}
              data-testid="employees-form-item"
            >
              <Select
                showSearch
                placeholder="Select a person"
                mode="multiple"
                className="w-full h-10 mt-2"
                allowClear
                maxTagCount={1}
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={filteredUsers?.map((item: any) => ({
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
                data-testid="employees-select"
              />
            </Form.Item>
            {/* <Form.Item
              name="employees"
              label="Select Employees"
              rules={[{ required: true, message: 'Please select employees' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select employees"
                disabled={!selectedDepartment}
              >
                {departmentUsers?.map((user) => (
                  <Select.Option key={user.id} value={user.id}>
                    {user?.firstName} {user?.middleName} {user?.lastName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item> */}
          </Form>
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default AllowanceEntitlementSideBar;
