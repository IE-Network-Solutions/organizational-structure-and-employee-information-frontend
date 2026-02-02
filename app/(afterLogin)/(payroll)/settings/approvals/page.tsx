'use client';
import { useCreateApproverMutation } from '@/store/server/features/approver/mutation';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { APPROVALTYPES } from '@/types/enumTypes';
import { Button, Form } from 'antd';
import React, { useMemo } from 'react';
import ApprovalTable from './_component/ApprovalTable';
import { FaPlus } from 'react-icons/fa';
import PermissionWraper from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { PayrollApprovalWorkFlow } from './_component/payrollapprovalWorkFlow';
import PayrollApprovalWorkFlowSetting from './_component/payrollApprovalWorkFlowSetting';
import { useApprovalFilter } from '@/store/server/features/approver/queries';
import { useApprovalBranchStore } from '@/store/uistate/features/employees/branchTransfer/workflow';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';

const Approvals = () => {
  const {
    setApproverType,
    setDepartmentApproval,
    setAddDepartmentApproval,
    addDepartmentApproval,
    departmentApproval,
    approverType,
    selections,
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

  // Get departments and find the one with level 0
  const { data: departments } = useGetDepartments();
  const level0Department = useMemo(() => {
    if (!departments || !Array.isArray(departments)) return null;
    return departments.find((dept: any) => dept.level === 0) || null;
  }, [departments]);

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

  const pageSlug = 'approvals-payroll-settings';

  return (
    <div
      className="px-5 py-4 rounded-2xl bg-white h-full"
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
              className="mb-4"
              id={`settings-${pageSlug}-workflow-setting-header`}
              data-cy={`settings-${pageSlug}-workflow-setting-header`}
            >
              <PayrollApprovalWorkFlowSetting
                handleSubmit={handleSubmit}
                isSuccess={isSuccess}
                form={form}
                title={'Department transfer '}
                data-cy={`settings-${pageSlug}-workflow-setting-component`}
              />
            </div>
          </div>
        ) : (
          <div
            id={`settings-${pageSlug}-workflow-config`}
            data-cy={`settings-${pageSlug}-workflow-config`}
          >
            <PayrollApprovalWorkFlow
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
              className=" py-2 text-lg font-bold "
              id={`settings-${pageSlug}-list-title`}
              data-cy={`settings-${pageSlug}-list-title`}
            >
              Approval Types
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
                disabled={allFilterData?.items?.length >= 1}
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
            className="flex flex-col gap-4"
            id={`settings-${pageSlug}-filters`}
            data-cy={`settings-${pageSlug}-filters`}
          ></div>
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
