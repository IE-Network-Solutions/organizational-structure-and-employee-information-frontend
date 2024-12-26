import CustomDrawerFooterButton, {
    CustomDrawerFooterButtonProps,
  } from '@/components/common/customDrawer/customDrawerFooterButton';
  import CustomDrawerLayout from '@/components/common/customDrawer';
  import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
  import { Form, Input, Select, Spin } from 'antd';
  import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
  import { useCreateBenefitEntitlement } from '@/store/server/features/compensation/benefit/mutations';
  import { useParams } from 'next/navigation';
  import CustomLabel from '@/components/form/customLabel/customLabel';
  import { useBenefitEntitlementStore } from '@/store/uistate/features/compensation/benefit';
  
  const BenefitEntitlementSideBar = () => {
  
    const { departmentUsers, setDepartmentUsers, isBenefitEntitlementSidebarOpen, selectedDepartment, setSelectedDepartment, resetStore } = useBenefitEntitlementStore();
    const { mutate: createBenefitEntitlement } = useCreateBenefitEntitlement();
    const [ form ] = Form.useForm();
    const { data: departments, isLoading } = useGetDepartmentsWithUsers();
    const { id } = useParams();
    
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
        label:  <span>Create</span>,
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
      createBenefitEntitlement({
        compensationItemId: id,
        employeeIds: formValues.employees,
        totalAmount: Number(formValues.amount),
        settlementPeriod: Number(formValues.settlementPeriod),
    });
      // onClose();
    };
  
    const handleDepartmentChange = (value: string) => {
      setSelectedDepartment(value);
      const department = departments.find((dept: any) => dept.name === value);
      if (department) {
        setDepartmentUsers(department.users);
        form.setFieldsValue({
          employees: department.users.map((user: any) => user.id),
        });
      }
    };
  
    return (
      isBenefitEntitlementSidebarOpen && (
        <CustomDrawerLayout
          open={isBenefitEntitlementSidebarOpen}
          onClose={onClose}
          modalHeader={
            <CustomDrawerHeader className="flex justify-center">
                <span>Add Benefit Entitlement</span>
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
              <div style={{ display: 'flex', gap: '20px' }}>
              <Form.Item
                name="amount"
                label={'Total Amount'}
                rules={[{ required: true, message: 'Required' }]}
                className="form-item"
              >
                <Input className="control" type='number' placeholder='Total Ammount' style={{ height: '32px', padding: '4px 8px' }} />
              </Form.Item>
              <Form.Item
                name="settlementPeriod"
                label={'Settlemnet Period'}
                rules={[{ required: true, message: 'Required' }]}
                className="form-item"
              >
                <Input className="control" type='number' placeholder='Settlement Period' style={{ height: '32px', padding: '4px 8px' }} />
              </Form.Item>
              </div>
              <Form.Item
                name="department"
                label="Select Department"
                rules={[{ required: true, message: 'Please select a department' }]}
                className="form-item"
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
                className="form-item"
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
  
  export default BenefitEntitlementSideBar;