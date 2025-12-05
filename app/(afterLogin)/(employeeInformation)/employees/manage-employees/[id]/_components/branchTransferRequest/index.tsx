import { useSingleApproval } from '@/store/server/features/approver/queries';
import { useAddBranchTransferRequest } from '@/store/server/features/employees/approval/mutation';
import { useGetBranches } from '@/store/server/features/organizationStructure/branchs/queries';
import { APPROVALTYPES } from '@/types/enumTypes';
import { Button, Form, Row, Select, Tooltip } from 'antd';
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
          ? approvalEmployeeData?.[0]?.id
          : approvalDepartmentData?.[0]?.id,
    };

    createBranchTransferRequest(payload, {
      onSuccess: () => {
        form.resetFields();
      },
    });
  };
  return (
    <div
      id="branch-transfer-request-container"
      data-cy="branch-transfer-request-container"
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        id="branch-transfer-request-form"
        data-cy="branch-transfer-request-form"
      >
        <Form.Item
          className="w-full font-semibold text-xs"
          name={'requestBranchId'}
          id="requestBranchId"
          data-cy="branch-transfer-request-branch-form-item"
          label="Branch Office"
          rules={[{ required: true, message: 'Please select a branch office' }]}
        >
          <Select
            className="w-full"
            placeholder="Select a branch office"
            allowClear
            id="branch-transfer-request-branch-select"
            data-cy="branch-transfer-request-branch-select"
          >
            {branchOfficeData?.items?.map((branch, index: number) => (
              <Option
                key={index}
                value={branch?.id}
                id={`branch-transfer-request-branch-option-${branch?.id}`}
                data-cy={`branch-transfer-request-branch-option-${branch?.id}`}
              >
                {branch?.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          id="branch-transfer-request-submit-form-item"
          data-cy="branch-transfer-request-submit-form-item"
        >
          <Row
            className="flex justify-end gap-3"
            id="branch-transfer-request-submit-row"
            data-cy="branch-transfer-request-submit-row"
          >
            <Tooltip
              title={
                approvalEmployeeData?.length < 1 &&
                approvalDepartmentData?.length < 1
                  ? 'You lack an assigned approver'
                  : ''
              }
              id="branch-transfer-request-submit-tooltip"
              data-cy="branch-transfer-request-submit-tooltip"
            >
              <Button
                type="primary"
                htmlType="submit"
                disabled={
                  approvalEmployeeData?.length < 1 &&
                  approvalDepartmentData?.length < 1
                }
                id="branch-transfer-request-submit-btn"
                data-cy="branch-transfer-request-submit-btn"
              >
                Request
              </Button>
            </Tooltip>
          </Row>
        </Form.Item>
      </Form>
    </div>
  );
};

export default BranchTransferRequest;
