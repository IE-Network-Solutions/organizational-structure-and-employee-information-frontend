import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Form, Input, Spin } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useEffect } from 'react';
// import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useCompensationSettingStore } from '@/store/uistate/features/compensation/settings';
import {
  useCreateAllowanceType,
  useUpdateCompensation,
} from '@/store/server/features/compensation/settings/mutations';
// import { RadioChangeEvent } from 'antd/lib';
// import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';

const { TextArea } = Input;

export const COMPENSATION_MODE = ['CREDIT', 'DEBIT']; // CREDIT IS CONSIDERED AS TO BE PAID TO THE EMPLOYEE, LIKE A GIFT
export const COMPENSATION_PERIOD = ['MONTHLY', 'WEEKLY'];

const DeductiontypeSideBar = () => {
  const {
    isDeductionOpen,
    setIsDeductionOpen,
    // isRateBenefit,
    setIsAllEmployee,
    // isAllEmployee,
    // setIsRateBenefit,
    resetStore,
    selectedDeductionRecord,
    // selectedDepartment,
    // selectedDepartementArray,
    // setSelectedDepartementArray,
    // setSelectedDepartment,
    departmentUsers,
    // setDepartmentUsers,
  } = useCompensationSettingStore();
  const { mutate: createAllowanceType, isLoading } = useCreateAllowanceType();
  const { mutate: updateAllowanceType, isLoading: updateIsLOading } =
    useUpdateCompensation();

  const [form] = Form.useForm();
  // const { data: departments } = useGetDepartmentsWithUsers();

  useEffect(() => {
    if (selectedDeductionRecord) {
      setIsAllEmployee(selectedDeductionRecord.applicableTo == 'GLOBAL');
      // setBenefitMode(selectedDeductionRecord.mode);
      form.setFieldsValue({
        name: selectedDeductionRecord.name,
        description: selectedDeductionRecord.description,
        isRate: selectedDeductionRecord.isRate,
        defaultAmount: selectedDeductionRecord.defaultAmount,
        isAllEmployee:
          selectedDeductionRecord.applicableTo == 'GLOBAL' ? true : false,
        mode: selectedDeductionRecord.mode,
      });
    }
  }, [selectedDeductionRecord, form]);

  useEffect(() => {
    if (departmentUsers.length === 0) {
      form.setFieldsValue({
        employees: [], // Set default selected users
      });
    }
    if (departmentUsers && departmentUsers.length > 0) {
      form.setFieldsValue({
        employees: departmentUsers.map((user) => user.id), // Set default selected users
      });
    }
  }, [departmentUsers, form]);

  const onClose = () => {
    setIsDeductionOpen(false);
    form.resetFields();
    resetStore();
  };

  // const onRateToggle = (checked: any) => {
  //   setIsRateBenefit(checked);
  // };

  const onFormSubmit = (formValues: any) => {
    const value = {
      name: formValues.name,
      description: formValues.description,
      type: 'DEDUCTION',
      mode: 'DEBIT',
      isRate: false,
      defaultAmount: 0,
      applicableTo: 'PER-EMPLOYEE',
    };
    {
      selectedDeductionRecord?.id
        ? updateAllowanceType(
            { id: selectedDeductionRecord?.id, values: value },
            {
              onSuccess: () => {
                form.resetFields();
                onClose();
              },
            },
          )
        : createAllowanceType(value, {
            onSuccess: () => {
              form.resetFields();
              onClose();
            },
          });
    }
  };

  // const handleDepartmentChange = (value: string[]) => {
  //   if (value.length === 0) {
  //     setDepartmentUsers([]);
  //     return;
  //   }
  //   setSelectedDepartementArray(value);
  //   const department = departments.filter((dept: any) =>
  //     value.includes(dept.id),
  //   );
  //   if (department.length > 0) {
  //     let departmentUsers: any = []; // Initialize users as an empty array
  //     department.forEach((dep: any) => {
  //       if (dep?.users) {
  //         departmentUsers = departmentUsers.concat(dep.users); // Concatenate users from each department
  //       }
  //     });
  //     setDepartmentUsers(departmentUsers);
  //   }
  // };

  // const handleAllEmployeeChange = (checked: any) => {
  //   setIsAllEmployee(checked);
  // };

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-14',
      size: 'large',
      loading: false,
      onClick: () => onClose(),
      disabled: selectedDeductionRecord?.id ? updateIsLOading : isLoading,
    },
    {
      label: selectedDeductionRecord?.id ? (
        <span>Update</span>
      ) : (
        <span>Create</span>
      ),
      key: 'create',
      className: 'h-14',
      type: 'primary',
      size: 'large',
      loading: selectedDeductionRecord?.id ? updateIsLOading : isLoading,
      // disabled: selectedDeductionRecord,
      onClick: () => form.submit(),
    },
  ];

  return (
    isDeductionOpen && (
      <CustomDrawerLayout
        open={isDeductionOpen}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader className="flex justify-center">
            {selectedDeductionRecord?.id ? (
              <span>Edit Deduction Type</span>
            ) : (
              <span>Add Deduction Type</span>
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
            onFinish={onFormSubmit}
            requiredMark={CustomLabel}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Name is Required!' }]}
              className="form-item"
            >
              <Input
                className="control"
                placeholder="Deduction Name"
                style={{ height: '32px', padding: '4px 8px' }}
              />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Description is Required!' }]}
              className="form-item"
            >
              <TextArea
                className="control"
                autoSize={{ minRows: 3, maxRows: 5 }}
                placeholder="Description"
                style={{ height: '32px', padding: '4px 8px' }}
              />
            </Form.Item>

            <>
              <div style={{ display: 'flex', gap: '20px' }}>
                {/* <Form.Item
                    name="isRate"
                    label={'Is Rate'}
                    className="form-item"
                    initialValue={!selectedDeductionRecord && false}
                  >
                    <Switch
                      checkedChildren={<CheckOutlined />}
                      unCheckedChildren={<CloseOutlined />}
                      onChange={onRateToggle}
                    />
                  </Form.Item> */}
                {/* <Form.Item
                    name="isAllEmployee"
                    label="All Employees are entitled"
                    className="form-item"
                    initialValue={
                      !selectedDeductionRecord
                        ? true
                        : selectedDeductionRecord.applicableTo == 'GLOBAL'
                          ? true
                          : false
                    }
                    rules={[
                      {
                        required: true,
                        message: 'Employee selection is Required!',
                      },
                    ]}
                  >
                    <Switch
                      checkedChildren={<CheckOutlined />}
                      unCheckedChildren={<CloseOutlined />}
                      checked={form.getFieldValue('isAllEmployee')}
                      onChange={handleAllEmployeeChange}
                      disabled={selectedDeductionRecord}
                    />
                  </Form.Item> */}
              </div>
              {/* <div style={{ display: 'flex', gap: '20px' }}> */}
              {/* <Form.Item
                    name="defaultAmount"
                    label={isRateBenefit ? 'Rate Amount' : 'Fixed Amount'}
                    className="form-item"
                    rules={[{ required: true, message: 'Amount is Required' }]}
                  >
                    <Input
                      className="control"
                      type="number"
                      placeholder="Benefit Amount"
                      style={{ height: '32px', padding: '4px 8px' }}
                    />
                  </Form.Item> */}
              {/* {!selectedDeductionRecord && (
                    <Form.Item
                      name="NoOfPayPeriod"
                      label={'Number of Pay Period'}
                      rules={[
                        {
                          required: true,
                          message: 'Number of Pay Period is required!',
                        },
                      ]}
                      className="form-item"
                    >
                      <Input
                        className="control"
                        type="number"
                        placeholder={'Number of Pay Period'}
                        style={{ height: '32px', padding: '4px 8px' }}
                      />
                    </Form.Item>
                  )} */}
              {/* </div> */}
              {/* {!isAllEmployee && !selectedDeductionRecord && (
                  <> */}
              {/* <Form.Item
                      className="form-item"
                      name="department"
                      label="Select Department"
                      
                    >
                      <Select
                        mode='multiple'
                        placeholder="Select a department"
                        onChange={handleDepartmentChange}
                        allowClear
                      >
                        {departments?.map((department: any) => (
                          <Select.Option
                            key={department.id}
                            value={department.id}
                          >
                            {department.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item> */}

              {/* <Form.Item
                      className="form-item"
                      name="employees"
                      label="Select Employees"
                    >
                      <Select
                        mode="multiple"
                        placeholder="Select employees"
                        disabled={selectedDepartementArray?.length<1}
                      >
                        {departmentUsers?.map((user) => (
                          <Select.Option key={user.id} value={user.id}>
                            {user?.firstName} {user?.lastName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item> */}
              {/* </>
                )} */}
            </>
          </Form>
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default DeductiontypeSideBar;
