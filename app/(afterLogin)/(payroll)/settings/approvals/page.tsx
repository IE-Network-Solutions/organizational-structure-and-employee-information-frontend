'use client';
import { useCreateApproverMutation } from '@/store/server/features/approver/mutation';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { APPROVALTYPES } from '@/types/enumTypes';
import { Button, Form, Modal } from 'antd';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import ApprovalTable from './_component/ApprovalTable';
import { FaPlus } from 'react-icons/fa';
import PermissionWraper from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { PayrollApprovalWorkFlow } from './_component/payrollapprovalWorkFlow';
import PayrollApprovalWorkFlowSetting from './_component/payrollApprovalWorkFlowSetting';
import { ApprovalWorkflowFinalizeSummary } from './_component/ApprovalWorkflowFinalizeSummary';
import { useApprovalFilter } from '@/store/server/features/approver/queries';
import { useApprovalBranchStore } from '@/store/uistate/features/employees/branchTransfer/workflow';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import useApprovalsSettingsStore from '@/store/uistate/features/payroll/settings/approvals/approvalsSettingsStore';

const Approvals = () => {
  const {
    setApproverType,
    setDepartmentApproval,
    setAddDepartmentApproval,
    addDepartmentApproval,
    approverType,
    selections,
    level,
    setLevel,
  } = useApprovalStore();
  const { userCurrentPage, pageSize, searchParams } = useApprovalBranchStore();
  const { data: allFilterData } = useApprovalFilter(
    pageSize,
    userCurrentPage,
    searchParams?.entityType ? searchParams.entityType : '',
    searchParams?.entityId ? searchParams.entityId : '',
    searchParams?.name || '',
    APPROVALTYPES.PAYROLL,
  );
  const { setApprovalsAddDisabled } = useApprovalsSettingsStore();

  // Get departments and find the one with level 0
  const { data: departments } = useGetDepartments();
  const level0Department = useMemo(() => {
    if (!departments || !Array.isArray(departments)) return null;
    return departments.find((dept: any) => dept.level === 0) || null;
  }, [departments]);

  const handleApprovalTypeChange = useCallback(
    (value: string) => {
      setApproverType(value);
    },
    [setApproverType],
  );

  const { mutate: CreateApprover, isSuccess } = useCreateApproverMutation();
  const [form] = Form.useForm();
  const [workflowStep, setWorkflowStep] = useState<1 | 2 | 3>(1);

  const handleSubmit = () => {
    const name = form.getFieldValue('workFlownName');
    const description = form.getFieldValue('description');

    // Always use Department as entityType and level 0 department ID as entityId
    const jsonPayload = {
      name: name,
      description: description,
      entityType: 'Department', // Always set to "Department"
      entityId: level0Department?.id || '', // Always use level 0 department ID
      approvalType: APPROVALTYPES.PAYROLL,
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
    setWorkflowStep(1);
    CreateApprover(
      { values: jsonPayload },
      {
        onSuccess: () => {
          setAddDepartmentApproval(false);
          setDepartmentApproval(false);
          setWorkflowStep(1);
        },
      },
    );
  };

  const pageSlug = 'approvals-payroll-settings';

  // Keep the header primary action ("Set Approval") visually disabled in sync with this page.
  const isApprovalsAddDisabled = (allFilterData?.items?.length ?? 0) >= 1;

  useEffect(() => {
    setApprovalsAddDisabled(isApprovalsAddDisabled);
  }, [isApprovalsAddDisabled, setApprovalsAddDisabled]);

  useEffect(() => {
    if (!addDepartmentApproval) return;
    setWorkflowStep(1);
    setApproverType(null);
    setDepartmentApproval(false);
    form.resetFields();
    setLevel(1);
  }, [
    addDepartmentApproval,
    setApproverType,
    setDepartmentApproval,
    form,
    setLevel,
  ]);

  const handleCloseModal = () => {
    setWorkflowStep(1);
    setAddDepartmentApproval(false);
    setDepartmentApproval(false);
  };

  const handleContinueStep2 = () => {
    form
      .validateFields()
      .then(() => setWorkflowStep(3))
      .catch(() => {});
  };

  const handleWorkflowBack = () => {
    if (workflowStep === 2) setWorkflowStep(1);
    else if (workflowStep === 3) setWorkflowStep(2);
  };

  const appliedToLabel =
    level0Department &&
    typeof (level0Department as { name?: string }).name === 'string'
      ? (level0Department as { name: string }).name
      : undefined;

  return (
    <div
      className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden"
      id={`settings-${pageSlug}-container`}
      data-cy={`settings-${pageSlug}-container`}
    >
      <div
        id={`settings-${pageSlug}-list`}
        data-cy={`settings-${pageSlug}-list`}
        className="pt-0 pb-3"
      >
        <div
          className="flex justify-end items-center pb-0"
          id={`settings-${pageSlug}-list-header`}
          data-cy={`settings-${pageSlug}-list-header`}
        >
          <PermissionWraper
            permissions={[Permissions.CreateApprover]}
            id={`settings-${pageSlug}-add-approval-guard`}
            data-cy={`settings-${pageSlug}-add-approval-guard`}
          >
            <Button
              type="primary"
              className="hidden h-10 w-10 sm:w-auto bg-primary hover:!bg-primary/90"
              onClick={() => setAddDepartmentApproval(true)}
              icon={<FaPlus />}
              id={`settings-${pageSlug}-add-approval-btn`}
              data-cy={`settings-${pageSlug}-add-approval-btn`}
              disabled={isApprovalsAddDisabled}
            >
              <span
                className="hidden sm:inline"
                data-cy="settings-approvals-add-btn-text"
              >
                Set Approval
              </span>
            </Button>
          </PermissionWraper>
        </div>

        <div
          className="flex flex-col gap-2"
          id={`settings-${pageSlug}-filters`}
          data-cy={`settings-${pageSlug}-filters`}
        ></div>
        <div
          className="overflow-x-auto w-full"
          id={`settings-${pageSlug}-table-wrapper`}
          data-cy={`settings-${pageSlug}-table-wrapper`}
        >
          <ApprovalTable data-cy={`settings-${pageSlug}-table`} />
        </div>
      </div>

      <Modal
        open={addDepartmentApproval}
        onCancel={handleCloseModal}
        footer={null}
        centered
        width={720}
        destroyOnClose
        maskClosable={false}
        closable={false}
        data-cy={`settings-${pageSlug}-workflow-modal`}
      >
        <PayrollApprovalWorkFlow
          onChange={handleApprovalTypeChange}
          approverType={approverType}
          currentStep={workflowStep}
          onClose={handleCloseModal}
          onBack={workflowStep > 1 ? handleWorkflowBack : undefined}
          onContinueFromStep1={() => setWorkflowStep(2)}
          onContinueFromStep2={handleContinueStep2}
          onCreate={() => form.submit()}
          finalizeContent={
            workflowStep === 3 ? (
              <ApprovalWorkflowFinalizeSummary
                form={form}
                approverType={approverType}
                level={level}
                selections={selections}
                appliedToLabel={appliedToLabel}
              />
            ) : undefined
          }
          data-cy={`settings-${pageSlug}-workflow-config-component`}
        >
          <PayrollApprovalWorkFlowSetting
            handleSubmit={handleSubmit}
            isSuccess={isSuccess}
            form={form}
            title={'Department transfer '}
            wizardMode
            data-cy={`settings-${pageSlug}-workflow-setting-component`}
          />
        </PayrollApprovalWorkFlow>
      </Modal>
    </div>
  );
};

export default Approvals;
