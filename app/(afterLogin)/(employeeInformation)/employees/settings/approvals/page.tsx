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

  const pageSlug = 'approvals-settings';

  return (
    <div
      className="p-5 rounded-2xl bg-white h-full"
      id={`settings-${pageSlug}-container`}
      data-cy={`settings-${pageSlug}-container`}
    >
      {addDepartmentApproval ? (
        departmentApproval ? (
          <div
            id={`settings-${pageSlug}-workflow-setting`}
            data-cy={`settings-${pageSlug}-workflow-setting`}
          >
            <div
              className="flex justify-between mb-4"
              id={`settings-${pageSlug}-workflow-setting-header`}
              data-cy={`settings-${pageSlug}-workflow-setting-header`}
            >
              <Button
                className="flex items-center justify-center space-x-2 px-4 py-2 font-bold bg-[#3636F0] text-white hover:bg-[#2d2dbf]"
                onClick={() => setDepartmentApproval(false)}
                id={`settings-${pageSlug}-workflow-setting-back-btn`}
                data-cy={`settings-${pageSlug}-workflow-setting-back-btn`}
              >
                <IoArrowBack
                  className="text-white"
                  data-cy="settings-approvals-back-btn-icon"
                />
                <span data-cy="settings-approvals-back-btn-text"> Back</span>
              </Button>
              <div
                className="text-2xl font-bold "
                id={`settings-${pageSlug}-workflow-setting-title`}
                data-cy={`settings-${pageSlug}-workflow-setting-title`}
              ></div>
            </div>
            <ApprovalWorkFlowSettingComponent
              handleSubmit={handleSubmit}
              isSuccess={isSuccess}
              form={form}
              title={'Department transfer '}
              data-cy={`settings-${pageSlug}-workflow-setting-component`}
            />
          </div>
        ) : (
          <div
            id={`settings-${pageSlug}-workflow-config`}
            data-cy={`settings-${pageSlug}-workflow-config`}
          >
            <div
              className="mb-4 flex justify-between"
              id={`settings-${pageSlug}-workflow-config-header`}
              data-cy={`settings-${pageSlug}-workflow-config-header`}
            >
              <Button
                className="flex items-center justify-center space-x-2 px-4 py-2 font-bold bg-[#3636F0] text-white hover:bg-[#2d2dbf]"
                onClick={() => setAddDepartmentApproval(false)}
                id={`settings-${pageSlug}-workflow-config-back-btn`}
                data-cy={`settings-${pageSlug}-workflow-config-back-btn`}
              >
                <IoArrowBack
                  className="text-white"
                  data-cy="settings-approvals-back-btn-icon"
                />
                <span data-cy="settings-approvals-back-btn-text"> Back</span>
              </Button>
              <div
                className="text-2xl font-bold "
                id={`settings-${pageSlug}-workflow-config-title`}
                data-cy={`settings-${pageSlug}-workflow-config-title`}
              ></div>
            </div>
            <ApprovalWorkFlowComponent
              onChange={onChange}
              data-cy={`settings-${pageSlug}-workflow-config-component`}
            />
          </div>
        )
      ) : (
        <div
          id={`settings-${pageSlug}-list`}
          data-cy={`settings-${pageSlug}-list`}
        >
          <div
            className="mb-4 flex justify-between"
            id={`settings-${pageSlug}-list-header`}
            data-cy={`settings-${pageSlug}-list-header`}
          >
            <div
              className="text-lg font-bold "
              id={`settings-${pageSlug}-list-title`}
              data-cy={`settings-${pageSlug}-list-title`}
            >
              List Of Approval
            </div>
            <PermissionWraper
              permissions={[Permissions.CreateApprover]}
              id={`settings-${pageSlug}-add-approval-guard`}
              data-cy={`settings-${pageSlug}-add-approval-guard`}
            >
              <Button
                type="primary"
                className="hidden sm:flex h-10 w-10 sm:w-auto"
                onClick={() => setAddDepartmentApproval(true)}
                icon={<FaPlus />}
                id={`settings-${pageSlug}-add-approval-btn`}
                data-cy={`settings-${pageSlug}-add-approval-btn`}
              >
                <span
                  className="hidden sm:inline"
                  data-cy="settings-approvals-add-btn-text"
                >
                  {' '}
                  Add Approval
                </span>
              </Button>
            </PermissionWraper>
          </div>

          <div
            className="flex flex-col gap-4"
            id={`settings-${pageSlug}-filters`}
            data-cy={`settings-${pageSlug}-filters`}
          >
            <ApprovalBranchFilter
              data-cy={`settings-${pageSlug}-branch-filter`}
            />
          </div>
          <div
            className="overflow-x-auto scrollbar-none  w-full"
            id={`settings-${pageSlug}-table-wrapper`}
            data-cy={`settings-${pageSlug}-table-wrapper`}
          >
            <ApprovalTable data-cy={`settings-${pageSlug}-table`} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;
