'use client';

import { useState } from 'react';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import { LuSettings2 } from 'react-icons/lu';
import CustomBreadcrumb from '@/components/common/breadCramp';
import AuditLogView from './_components/AuditLogView';

const AuditLogPage = () => {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);

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
