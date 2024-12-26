import CustomDrawerFooterButton, {
    CustomDrawerFooterButtonProps,
  } from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Form, Select, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useCreateAllowanceEntitlement } from '@/store/server/features/compensation/allowance/mutation';
import { useParams } from 'next/navigation';
import CustomLabel from '@/components/form/customLabel/customLabel';
  
  const AllowanceEntitlementSideBar = () => {
  
    const { isAllowanceEntitlementOpen, setIsAllowanceEntitlementOpen } = useAllowanceEntitlementStore();
    const { setIsBenefitRecurring, setIsRateBenefit, selectedBenefitRecord} = useCompensationSettingStore();
    const {mutate: createAllowanceEntitlement} = useCreateAllowanceEntitlement();
    const [form] = Form.useForm();
    const { data: departments, isLoading } = useGetDepartmentsWithUsers();
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
    const [departmentUsers, setDepartmentUsers] = useState<any[]>([]);
    const {id} = useParams();
  
    useEffect(() => {
      if (selectedBenefitRecord) {
        setIsRateBenefit(selectedBenefitRecord.isRate);
        setIsBenefitRecurring(selectedBenefitRecord.isRecurring);
        form.setFieldsValue({
          name: selectedBenefitRecord.name || '',
          description: selectedBenefitRecord.description || '',
          isRate: !!selectedBenefitRecord.isRate, // Ensure boolean value
          isAllEmployee: selectedBenefitRecord.applicableTo === 'GLOBAL',
          isRecurring: !!selectedBenefitRecord.isRecurring, // Ensure boolean value
          defaultAmount: selectedBenefitRecord.defaultAmount
            ? parseInt(selectedBenefitRecord.defaultAmount.match(/\d+/)?.[0], 10) // Extract number from string
            : '',
          mode: selectedBenefitRecord.mode || undefined, // Set undefined if no value
          frequency: selectedBenefitRecord.frequency || undefined, // Set undefined if no value
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          isRate: false,
          isAllEmployee: false,
          isRecurring: false,
        })
      }
    }, [selectedBenefitRecord, form]);
    
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
        label: selectedBenefitRecord ? <span>Edit</span> : <span>Create</span>,
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
      setIsAllowanceEntitlementOpen(false);
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
  
    // Handle department change
    const handleDepartmentChange = (value: string) => {
      setSelectedDepartment(value);
      // Find the selected department and set its users
      const department = departments.find((dept: any) => dept.name === value);
      if (department) {
        setDepartmentUsers(department.users); // Assuming `users` is an array inside each department
        // Set all users as selected for the department
        form.setFieldsValue({
          employees: department.users.map((user: any) => user.id), // Pre-select all users for the department
        });
      }
    };
  
    return (
      isAllowanceEntitlementOpen && (
        <CustomDrawerLayout
          open={isAllowanceEntitlementOpen}
          onClose={onClose}
          modalHeader={
            <CustomDrawerHeader className="flex justify-center">
              {selectedBenefitRecord ? (
                <span>Edit Allowance Entitlement</span>
              ) : (
                <span>Add Allowance Entitlement</span>
              )}
            </CustomDrawerHeader>
          }
          footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
          width="600px"
        >
          <Spin spinning={isLoading}>
            <Form
              layout="vertical"
              form={form}
              onFinish={(values) => onFormSubmit(values)} // Assuming you have onFormSubmit function
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