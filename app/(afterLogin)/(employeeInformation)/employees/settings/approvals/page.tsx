'use client';
import { useCreateApproverMutation } from '@/store/server/features/approver/mutation';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { APPROVALTYPES } from '@/types/enumTypes';
import { Button, Form } from 'antd';
import React from 'react';
import ApprovalTable from './_component/ApprovalTable';
import { FaPlus } from 'react-icons/fa';
import { ApprovalWorkFlowComponent } from '@/components/Approval/approvalWorkFlow';
import ApprovalWorkFlowSettingComponent from '@/components/Approval/ApprovalWorkFlowSetting';
import ApprovalBranchFilter from './_component/approvalFilter';
import PermissionWraper from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { IoArrowBack } from 'react-icons/io5';

const Approvals = () => {
  const {
    setApproverType,
    setDepartmentApproval,
    setAddDepartmentApproval,
    addDepartmentApproval,
    departmentApproval,
    approverType,
    workflowApplies,
    selections,
  } = useApprovalStore();

  const onChange = (value: string) => {
    setApproverType(value);
    if (approverType) {
      setDepartmentApproval(true);
    }
  };
  const { mutate: CreateApprover, isSuccess } = useCreateApproverMutation();
  const [form] = Form.useForm();

  const handleSubmit = () => {
    const name = form.getFieldValue('workFlownName');
    const description = form.getFieldValue('description');
    const workflowAppliesId = form.getFieldValue('workflowAppliesId');

    const jsonPayload = {
      name: name,
      description: description,
      entityType: workflowApplies,
      entityId: workflowAppliesId,
      approvalType: APPROVALTYPES.BRANCHREQUEST,
      approvalWorkflowType:
        approverType === 'Sequential'
          ? 'Sequential'
          : approverType === 'Parallel'
            ? 'Parallel'
            : approverType === 'Conditional'
              ? '  '
              : ' ',
      steps: selections.SectionItemType.flatMap((selection, idx) => {
        const users = Array.isArray(selection.user)
          ? selection.user
          : [selection.user];
        return users.map((userId) => ({
          stepOrder: idx + 1,
          userId: userId,
        }));
      }),
    };

    setAddDepartmentApproval(false);
    setDepartmentApproval(false);
    CreateApprover(
      { values: jsonPayload },
      {
        onSuccess: () => {
          setAddDepartmentApproval(false);
          setDepartmentApproval(false);
        },
      },
    );
  };

  return (
    <div className="p-5 rounded-2xl bg-white h-full">
      {addDepartmentApproval ? (
        departmentApproval ? (
          <div className="">
            <div className="flex justify-between mb-4">
              <Button
                className="flex items-center justify-center space-x-2 px-4 py-2 font-bold bg-[#3636F0] text-white hover:bg-[#2d2dbf]"
                onClick={() => setDepartmentApproval(false)}
              >
                <IoArrowBack className="text-white" />
                <span> Back</span>
              </Button>
              <div className="text-2xl font-bold "></div>
            </div>
            <ApprovalWorkFlowSettingComponent
              handleSubmit={handleSubmit}
              isSuccess={isSuccess}
              form={form}
              title={'Department transfer '}
            />
          </div>
        ) : (
          <div className="">
            <div className="mb-4 flex justify-between">
              <Button
                className="flex items-center justify-center space-x-2 px-4 py-2 font-bold bg-[#3636F0] text-white hover:bg-[#2d2dbf]"
                onClick={() => setAddDepartmentApproval(false)}
              >
                <IoArrowBack className="text-white" />
                <span> Back</span>
              </Button>
              <div className="text-2xl font-bold "></div>
            </div>
            <ApprovalWorkFlowComponent onChange={onChange} />
          </div>
        )
      ) : (
        <div>
          <div className="mb-4 flex justify-between">
            <div className="text-lg font-bold ">List Of Approval</div>
            <PermissionWraper permissions={[Permissions.CreateApprover]}>
              <Button
                type="primary"
                className="hidden sm:flex h-10 w-10 sm:w-auto"
                onClick={() => setAddDepartmentApproval(true)}
                icon={<FaPlus />}
              >
                <span className="hidden sm:inline"> Add Approval</span>
              </Button>
            </PermissionWraper>
          </div>

          <div className="flex flex-col gap-4">
            <ApprovalBranchFilter />
          </div>
          <div className="flex  overflow-x-auto scrollbar-none  w-full">
            <ApprovalTable />
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;
