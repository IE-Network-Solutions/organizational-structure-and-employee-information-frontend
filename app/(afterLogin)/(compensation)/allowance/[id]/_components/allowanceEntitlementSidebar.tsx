import CustomDrawerFooterButton, {
    CustomDrawerFooterButtonProps,
  } from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Form, Select, Spin } from 'antd';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useCreateAllowanceEntitlement } from '@/store/server/features/compensation/allowance/mutations';
import { useParams } from 'next/navigation';
import CustomLabel from '@/components/form/customLabel/customLabel';
  
  const AllowanceEntitlementSideBar = () => {

    const { isAllowanceEntitlementSidebarOpen, resetStore, departmentUsers, setDepartmentUsers, selectedDepartment, setSelectedDepartment } = useAllowanceEntitlementStore();
    const {mutate: createAllowanceEntitlement} = useCreateAllowanceEntitlement();
    const [form] = Form.useForm();
    const { data: departments, isLoading } = useGetDepartmentsWithUsers();
    const {id} = useParams();
    
    const footerModalItems: CustomDrawerFooterButtonProps[] = [
      {
        label: 'Cancel',
        key: 'cancel',
        className: 'h-14',
        size: 'large',
        loading: isLoading,
        onClick: () => onClose(),
      },
      {
        label: <span>Create</span>,
        key: 'create',
        className: 'h-14',
        type: 'primary',
        size: 'large',
        loading: isLoading,
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

    const handleDepartmentChange = (value: string) => {
      setSelectedDepartment(value)
      const department = departments.find((dept: any) => dept.name === value);
      if (department) {
        setDepartmentUsers(department.users);
        form.setFieldsValue({
          employees: department.users.map((user: any) => user.id),
        });
      }
    };
  
    return (
      isAllowanceEntitlementSidebarOpen && (
        <CustomDrawerLayout
          open={isAllowanceEntitlementSidebarOpen}
          onClose={onClose}
          modalHeader={
            <CustomDrawerHeader className="flex justify-center">
                <span>Add Allowance Entitlement</span>
            </CustomDrawerHeader>
          }
          footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
          width="600px"
        >
          <Spin spinning={isLoading}>
            <Form
              layout="vertical"
              form={form}
              onFinish={(values) => onFormSubmit(values)}
              requiredMark={CustomLabel}
            >
              <Form.Item
                name="department"
                label="Select Department"
                rules={[{ required: true, message: 'Please select a department' }]}
              >
                <Select placeholder="Select a department" onChange={handleDepartmentChange}>
                  {departments?.map((department: any) => (
                    <Select.Option key={department.id} value={department.name}>
                      {department.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
  
              <Form.Item
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
                      {user?.firstName} {user?.lastName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Spin>
        </CustomDrawerLayout>
      )
    );
  };
  
  export default AllowanceEntitlementSideBar;