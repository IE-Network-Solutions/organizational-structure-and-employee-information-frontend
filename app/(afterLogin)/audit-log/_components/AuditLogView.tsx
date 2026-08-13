'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { MOCK_AUDIT_EVENTS } from './mockData';
import { AuditLogFilters, AuditSeverityRule } from './types';
import {
  applySeverityRules,
  createEmptyAuditFilters,
  exportAuditEventsCsv,
  filterAuditEvents,
  loadSeverityRules,
  saveSeverityRules,
  uniquePeople,
} from './utils';
import AuditLogFilterBar from './AuditLogFilterBar';
import AuditLogTable from './AuditLogTable';
import AuditSeverityRulesModal from './AuditSeverityRulesModal';

interface AuditLogViewProps {
  targetId?: string;
  targetName?: string;
  hideTargetColumn?: boolean;
  hideTargetFilter?: boolean;
  settingsOpen?: boolean;
  onSettingsOpenChange?: (open: boolean) => void;
}

const AuditLogView = ({
  targetId,
  targetName,
  hideTargetColumn = false,
  hideTargetFilter = false,
  settingsOpen = false,
  onSettingsOpenChange,
}: AuditLogViewProps) => {
  const router = useRouter();
  const { isMobile, isTablet } = useIsMobile();
  const [filters, setFilters] = useState<AuditLogFilters>(
    createEmptyAuditFilters,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [severityRules, setSeverityRules] =
    useState<AuditSeverityRule[]>(loadSeverityRules);

  const eventsWithSeverity = useMemo(
    () => applySeverityRules(MOCK_AUDIT_EVENTS, severityRules),
    [severityRules],
  );

  const scopedEvents = useMemo(
    () =>
      filterAuditEvents(eventsWithSeverity, createEmptyAuditFilters(), {
        targetId,
        targetName,
      }),
    [eventsWithSeverity, targetId, targetName],
  );

  const filteredEvents = useMemo(
    () =>
      filterAuditEvents(eventsWithSeverity, filters, {
        targetId,
        targetName,
      }),
    [eventsWithSeverity, filters, targetId, targetName],
  );

  const actorOptions = useMemo(
    () => uniquePeople(scopedEvents.map((event) => event.actor)),
    [scopedEvents],
  );
  const targetOptions = useMemo(
    () => uniquePeople(scopedEvents.map((event) => event.target)),
    [scopedEvents],
  );

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, targetId, targetName]);

  const onPageChange = (page: number, currentPageSize?: number) => {
    if (currentPageSize && currentPageSize !== pageSize) {
      setPageSize(currentPageSize);
      setCurrentPage(1);
      return;
    }
    setCurrentPage(page);
  };

  const onPageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters(createEmptyAuditFilters());
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (filteredEvents.length === 0) {
      NotificationMessage.warning({
        message: 'Nothing to export',
        description: 'Adjust filters to include at least one audit event.',
      });
      return;
    }
    exportAuditEventsCsv(filteredEvents);
    NotificationMessage.success({
      message: 'Export started',
      description: `${filteredEvents.length} audit event(s) downloaded as CSV.`,
    });
  };

  return (
    <div
      className="border border-gray-200 rounded-md"
      data-cy="audit-log-view"
      id="audit-log-view"
    >
      <div className="p-3" data-cy="audit-log-filters-container">
        <AuditLogFilterBar
          filters={filters}
          actors={actorOptions}
          targets={targetOptions}
          hideTargetFilter={hideTargetFilter}
          onFiltersChange={setFilters}
          onClear={handleClearFilters}
          onExport={handleExport}
        />
      </div>

      <div className="overflow-x-auto" data-cy="audit-log-table-container">
        <AuditLogTable
          events={paginatedEvents}
          hideTargetColumn={hideTargetColumn}
          onViewDetails={(event) => router.push(`/audit-log/${event.id}`)}
        />
        <div className="px-3" data-cy="audit-log-pagination-container">
          {isMobile || isTablet ? (
            <CustomMobilePagination
              totalResults={filteredEvents.length}
              pageSize={pageSize}
              currentPage={currentPage}
              onChange={onPageChange}
              onShowSizeChange={onPageChange}
              data-cy="audit-log-mobile-pagination"
            />
          ) : (
            <CustomPagination
              current={currentPage}
              total={filteredEvents.length}
              pageSize={pageSize}
              onChange={onPageChange}
              onShowSizeChange={onPageSizeChange}
              data-cy="audit-log-desktop-pagination"
            />
          )}
        </div>
      </div>

      <AuditSeverityRulesModal
        open={settingsOpen}
        rules={severityRules}
        onCancel={() => onSettingsOpenChange?.(false)}
        onSave={(nextRules) => {
          setSeverityRules(nextRules);
          saveSeverityRules(nextRules);
          onSettingsOpenChange?.(false);
          NotificationMessage.success({
            message: 'Severity rules saved',
            description:
              'Audit events now use the updated module, action, and field severity mapping.',
          });
        }}
      />
    </div>
  );
};

export default AuditLogView;
