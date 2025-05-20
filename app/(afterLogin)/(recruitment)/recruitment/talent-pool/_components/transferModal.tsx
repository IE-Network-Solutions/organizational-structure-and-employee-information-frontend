import React, { useEffect } from 'react';
import { Button, Form, Select } from 'antd';
import { useGetJobInformation } from '@/store/server/features/recruitment/jobs/query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useEmployeeDepartments } from '@/store/server/features/employees/employeeManagment/queries';

interface TransferCandidateModalProps {
  selectedCandidate: any;
  visible: boolean;
  onConfirm: (value: any) => void;
  onCancel: () => void;
}

const TransferTalentPoolToCandidateModal: React.FC<
  TransferCandidateModalProps
> = ({ visible, onConfirm, onCancel, selectedCandidate }) => {
  const [form] = Form.useForm();

  const { data: jobInformations } = useGetJobInformation();
  const { userId } = useAuthenticationStore();
  const { data: EmployeeDepartment } = useEmployeeDepartments();

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleFinish = (values: any) => {
    const fullData = {
      ...values,
      jobCandidateInformationId: selectedCandidate?.jobCandidateInformationId,
      createdBy: userId,
    };
    onConfirm(fullData);
  };
  return (
    <CustomDrawerLayout
      open={visible}
      onClose={onCancel}
      modalHeader={
        <div className="flex justify-start  text-xl font-extrabold text-gray-800">
          Re-onboard
        </div>
      }
      width="40%"
      footer={
        <div className="flex justify-center items-center space-x-5 p-2">
          <Button
            onClick={onCancel}
            className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-10 hover:border-gray-500 border-gray-300 "
          >
            Cancel
          </Button>
          <Button
            className=" p-4 px-10 h-10"
            type="primary"
            onClick={handleFinish}
          >
            Re-onboard
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={CustomLabel}
      >
        <Form.Item
          name="departmentId"
          label={
            <span className="text-md my-2 font-semibold text-gray-700">
              Select Department
            </span>
          }
          rules={[
            {
              required: true,
              message: 'Please select the department ',
            },
          ]}
        >
          <Select
            id="selectDepartment"
            placeholder="Select Department"
            allowClear
            className="w-full h-10"
          >
            {EmployeeDepartment &&
              EmployeeDepartment?.map((item: any) => (
                <Select.Option key={item?.id} value={item?.id}>
                  {item?.name}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="jobInformations"
          label={
            <span className="text-md my-2 font-semibold text-gray-700">
              Job Information
            </span>
          }
          rules={[
            {
              required: true,
              message: 'Please input the job information IDs!',
            },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Select Job Information"
            className="h-10"
          >
            {jobInformations?.items?.map((jobInformation: any) => (
              <Select.Option key={jobInformation.id} value={jobInformation.id}>
                {jobInformation.jobTitle}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default TransferTalentPoolToCandidateModal;
