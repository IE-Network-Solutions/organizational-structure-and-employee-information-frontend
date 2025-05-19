import React, { useEffect } from 'react';
import { Button, Form, Input, Select } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import { useUpdateAllowance } from '@/store/server/features/payroll/employeeInformation/mutation';
import { useGetAllowance } from '@/store/server/features/payroll/employeeInformation/queries';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Option } = Select;

const Drawer: React.FC = () => {
  const [form] = Form.useForm();

  const {
    isDrawerVisible,
    closeDrawer,
    selectedPayrollData,
    setSelectedPayrollData,
    selectedAllowance,
    isEditMode,
  } = useDrawerStore();
  const { mutate: update } = useUpdateAllowance();
  const { data: AllowanceData } = useGetAllowance();

  const onFinish = async () => {
    const updatedFormValues = form.getFieldsValue();
    const formattedData = updatedFormValues?.entitled_allowance;
    const employeeId = selectedAllowance?.key;

    update(
      { data: formattedData, employeeId: employeeId },
      {
        onSuccess: () => {
          closeDrawer();
        },
      },
    );
  };

  useEffect(() => {
    if (selectedPayrollData && isEditMode) {
      form.setFieldsValue({
        name: selectedPayrollData?.name,
        job_information: selectedPayrollData?.job_information,
        basic_salary: selectedPayrollData?.salary,
        entitled_allowance: selectedPayrollData?.allowances
          ?.filter((item: any) => item.entitlementId)
          ?.map((item: any) => item.name),
        bank_information: selectedPayrollData?.bank_information,
        branch: selectedPayrollData?.branch,
        account_number: selectedPayrollData?.account,
        criteria: selectedPayrollData?.criteria,
      });
    } else {
      form.resetFields();
    }
  }, [selectedPayrollData]);

  const { isMobile } = useIsMobile();

  return (
    <CustomDrawerLayout
      open={isDrawerVisible && selectedPayrollData?.key}
      onClose={() => {
        setSelectedPayrollData(null);
        closeDrawer;
      }}
      modalHeader={
        <span className="text-lg font-semibold">Payroll Information </span>
      }
      width="700px"
      footer={
        <div className="flex justify-center items-center w-full h-full">
          <div className="flex justify-between items-center gap-4 p-4">
            <Button
              type="default"
              className="h-10 px-10"
              onClick={() => {
                closeDrawer();
              }}
            >
              Cancel
            </Button>

            <Button
              type="primary"
              className="h-10 px-10"
              onClick={() => {
                form.submit();
              }}
            >
              Update
            </Button>
          </div>
        </div>
      }
    >
      <Form form={form} className="p-2" layout="vertical" onFinish={onFinish}>
        <Form.Item label="Full Name" name="name">
          <Input placeholder="Full Name" disabled className="h-10" />
        </Form.Item>

        <Form.Item label="Job Information" name="job_information">
          <Input disabled placeholder="Job Information" className="h-10" />
        </Form.Item>

        <Form.Item label="Basic Salary" name="basic_salary">
          <Input
            disabled
            placeholder="Your basic Salary"
            className="w-full h-10"
          ></Input>
        </Form.Item>
        <Form.Item
          label="Entitled Allowance"
          name="entitled_allowance"
          rules={[{ required: true, message: 'Please select Allowance' }]}
        >
          <Select
            mode="multiple"
            placeholder="Select allowanace type"
            className="w-full"
            style={{
              minHeight: isMobile ? 'auto' : 48,
              overflow: 'auto',
            }}
          >
            {AllowanceData?.filter(
              (items: any) =>
                items.type == 'ALLOWANCE' && items?.applicableTo !== 'GLOBAL',
            )?.map((item: any) => (
              <Option key={item.id} value={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Bank Information" name="bank_information">
          <Input
            disabled
            placeholder="Enat Bank"
            className="w-full h-10"
          ></Input>
        </Form.Item>
        <Form.Item label="Branch" name="branch">
          <Input
            disabled
            placeholder="22 branch"
            className="w-full h-10"
          ></Input>
        </Form.Item>

        <Form.Item label="Account Number" name="account_number">
          <Input
            disabled
            placeholder="account number"
            className="w-full h-10"
          ></Input>
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default Drawer;
