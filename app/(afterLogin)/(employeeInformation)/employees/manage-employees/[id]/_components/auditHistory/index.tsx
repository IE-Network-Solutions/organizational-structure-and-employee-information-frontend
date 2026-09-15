'use client';

import AuditLogView from '@/app/(afterLogin)/audit-log/_components/AuditLogView';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';

function AuditHistory({ id }: { id: string }) {
  const { data: employeeData } = useGetEmployee(id);
  const targetName = [employeeData?.firstName, employeeData?.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    <div data-cy="employee-audit-history" id="employee-audit-history">
      <AuditLogView
        targetId={id}
        targetName={targetName}
        hideTargetColumn
        hideTargetFilter
      />
    </div>
  );
}

export default AuditHistory;
