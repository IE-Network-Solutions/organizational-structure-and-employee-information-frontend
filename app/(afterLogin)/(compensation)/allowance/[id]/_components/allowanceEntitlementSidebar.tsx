import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Form, Select, Spin } from 'antd';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';
// import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useCreateAllowanceEntitlement } from '@/store/server/features/compensation/allowance/mutations';
import { useParams } from 'next/navigation';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';

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

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-12',
      size: 'large',
      loading: allUserLoading,
      onClick: () => onClose(),
    },
    {
      label: <span>Create</span>,
      key: 'create',
      className: 'h-12',
      type: 'primary',
      size: 'large',
      loading: allUserLoading,
      onClick: () => form.submit(),
    },
  ];

  const onClose = () => {
    form.resetFields();
    resetStore();
    setSelectedDepartment(null);
  };

  const onFormSubmit = (formValues: any) => {
    createAllowanceEntitlement({
      compensationItemId: id,
      employeeIds: formValues.employees,
      active: true,
    });
    onClose();
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
    isAllowanceEntitlementSidebarOpen && (
      <CustomDrawerLayout
        open={isAllowanceEntitlementSidebarOpen}
        onClose={onClose}
        modalHeader={
          <CustomDrawerHeader
            className="flex justify-start"
            data-testid="entitlement-sidebar-header"
          >
            <span>Add Allowance Entitlement</span>
          </CustomDrawerHeader>
        }
        footer={
          <CustomDrawerFooterButton
            className="w-full bg-[#fff] flex justify-between space-x-5 p-4"
            buttons={footerModalItems}
            data-testid="entitlement-sidebar-footer"
          />
        }
        width="600px"
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
