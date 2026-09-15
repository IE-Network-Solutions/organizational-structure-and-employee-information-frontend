'use client';

import { useState } from 'react';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import { LuSettings2 } from 'react-icons/lu';
import CustomBreadcrumb from '@/components/common/breadCramp';
import AuditLogView from './_components/AuditLogView';

const AuditLogPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Keep filters stable when navigating to `/audit-log/[id]` and pressing back
  // by reflecting the filter state in the URL.
  useEffect(() => {
    const next = new URLSearchParams(searchParams.toString());

    // Normalize module key
    next.delete('modules');

    if (selectedModule) next.set('module', selectedModule);
    else next.delete('module');

    if (selectedAction) next.set('action', selectedAction);
    else next.delete('action');

    if (dateFrom) next.set('startDate', dateFrom.format('YYYY-MM-DD'));
    else next.delete('startDate');

    if (dateTo) next.set('endDate', dateTo.format('YYYY-MM-DD'));
    else next.delete('endDate');

    if (selectedUserId) next.set('performedBy', selectedUserId);
    else next.delete('performedBy');

    if (employeeOrRemarksSearch.trim()) next.set('q', employeeOrRemarksSearch);
    else next.delete('q');

    next.set('page', String(currentPage));
    next.set('limit', String(pageSize));

    const nextString = next.toString();
    const currentString = searchParams.toString();
    if (nextString !== currentString) {
      router.replace(`?${nextString}`, { scroll: false });
    }
  }, [
    searchParams,
    router,
    selectedAction,
    selectedModule,
    selectedUserId,
    employeeOrRemarksSearch,
    dateFrom,
    dateTo,
    currentPage,
    pageSize,
  ]);

  return (
    <div
      className="bg-white min-h-screen"
      data-cy="audit-log-page-container"
      id="audit-log-page-container"
    >
      <div
        data-cy="audit-log-breadcrumb-container"
        id="audit-log-breadcrumb-container"
      >
        <CustomBreadcrumb
          onBack={() => router.back()}
          title="Audit log"
          subtitle="Track all the events that have happened in the system"
          titleExtra={
            <Button
              type="default"
              icon={<LuSettings2 size={18} />}
              className="h-10"
              onClick={() => setSettingsOpen(true)}
              data-cy="audit-log-settings-button"
              id="audit-log-settings-button"
            >
              Settings
            </Button>
          }
        />
      </div>
      <AuditLogView
        settingsOpen={settingsOpen}
        onSettingsOpenChange={setSettingsOpen}
      />
    </div>
  );
};

export default AuditLogPage;
