import { useSingleApproval } from '@/store/server/features/approver/queries';
import { useAddBranchTransferRequest } from '@/store/server/features/employees/approval/mutation';
import { useGetBranches } from '@/store/server/features/organizationStructure/branchs/queries';
import { APPROVALTYPES } from '@/types/enumTypes';
import { Button, Form, Row, Select } from 'antd';
import React, { useEffect } from 'react';

const BranchTransferRequest = ({ employeeData }: { employeeData: any }) => {
  const [form] = Form.useForm();
  const { Option } = Select;
  const { data: branchOfficeData } = useGetBranches();
  const { mutate: createBranchTransferRequest } = useAddBranchTransferRequest();

  const { data: approvalDepartmentData, refetch: getDepartmentApproval } =
    useSingleApproval(
      employeeData?.employeeJobInformation[0]?.departmentId || '',
      APPROVALTYPES?.BRANCHREQUEST,
    );

  const { data: approvalEmployeeData, refetch: getUserApproval } =
    useSingleApproval(employeeData?.id || '', APPROVALTYPES?.BRANCHREQUEST);

  useEffect(() => {
    if (employeeData?.employeeJobInformation[0]?.departmentId)
      getDepartmentApproval();
  }, [employeeData]);
  useEffect(() => {
    if (employeeData?.id) getUserApproval();
  }, [employeeData]);

  const handleSubmit = (requestBranchId: any) => {
    const payload = {
      ...requestBranchId,
      userId: employeeData?.id,
      currentBranchId:
        employeeData?.employeeJobInformation?.find(
          (e: any) => e.isPositionActive === true,
        )?.branch?.id || '-',
      approvalType: APPROVALTYPES?.BRANCHREQUEST,
      approvalWorkflowId:
        approvalEmployeeData?.length > 0
          ? approvalEmployeeData[0]?.id
          : approvalDepartmentData[0]?.id,
    };

    createBranchTransferRequest(payload, {
      onSuccess: () => {
        form.resetFields();
      },
    });
  };
  return (
    <div>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          className="w-full font-semibold text-xs"
          name={'requestBranchId'}
          id="requestBranchId"
          label="Branch Office"
          rules={[{ required: true, message: 'Please select a branch office' }]}
        >
          <Select
            className="w-full"
            placeholder="Select a branch office"
            allowClear
          >
            {branchOfficeData?.items?.map((branch, index: number) => (
              <Option key={index} value={branch?.id}>
                {branch?.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Row className="flex justify-end gap-3">
            <Button type="primary" htmlType="submit">
              Request
            </Button>
          </Row>
        </Form.Item>
      </Form>
    </div>
  );
};

export default BranchTransferRequest;
