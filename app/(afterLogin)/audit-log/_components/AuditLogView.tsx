'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  getAggregateAuditPostLogs,
  useGetAggregateAuditPostLogs,
  useGetAuditSeverityRules,
  useReplaceAuditSeverityRules,
} from '@/store/server/features/tenant-management/audit-logs/queries';
import { AggregateAuditLogParams } from '@/store/server/features/tenant-management/audit-logs/interface';
import { AuditLog } from '@/types/tenant-management';
import {
  AuditLogFilters,
  AuditSeverityRule,
  PrototypeAuditPerson,
} from './types';
import {
  createEmptyAuditFilters,
  exportAuditEventsCsv,
  loadSeverityRules,
  uniquePeople,
} from './utils';
import { mapAuditLogToEvent, toApiAction } from './mapAuditLog';
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

const toPeople = (users: any): PrototypeAuditPerson[] => {
  const list = Array.isArray(users)
    ? users
    : Array.isArray(users?.items)
      ? users.items
      : [];
  return uniquePeople(
    list.map((user: any) => ({
      id: user.id,
      firstName: user.firstName || user.user?.firstName || '',
      lastName: user.lastName || user.user?.lastName || '',
      profileImage: user.profileImage || user.user?.profileImage,
      role: user.role?.name || user.role?.role?.name,
    })),
  );
};

const AuditLogView = ({
  targetId,
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [severityRules, setSeverityRules] =
    useState<AuditSeverityRule[]>(loadSeverityRules);
  const { data: allUsers } = useGetAllUsers();
  const { data: remoteSeverityRules } = useGetAuditSeverityRules();
  const replaceSeverityRules = useReplaceAuditSeverityRules();

  useEffect(() => {
    const list = Array.isArray(remoteSeverityRules)
      ? remoteSeverityRules
      : Array.isArray((remoteSeverityRules as any)?.items)
        ? (remoteSeverityRules as any).items
        : [];
    if (list.length) {
      setSeverityRules(
        list.map((rule: any) => ({
          id: rule.id,
          module: rule.module,
          actionVerb: rule.actionVerb,
          fields: rule.fields || [],
          severity: rule.severity,
        })),
      );
    }
  }, [remoteSeverityRules]);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(filters.search.trim()),
      300,
    );
    return () => clearTimeout(timer);
  }, [filters.search]);

  const queryParams = useMemo<AggregateAuditLogParams>(() => {
    const affectedId = filters.targetId || targetId;
    return {
      modules: filters.module ? [filters.module] : ['all'],
      page: currentPage,
      limit: pageSize,
      orderBy: 'performedAt',
      orderDirection: 'DESC',
      ...(filters.action && { action: toApiAction(filters.action) }),
      ...(filters.actorId && { performedBy: filters.actorId }),
      ...(affectedId && { entityId: affectedId }),
      ...(filters.dateFrom && { startDate: filters.dateFrom }),
      ...(filters.dateTo && { endDate: filters.dateTo }),
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(filters.severities.length && {
        severity: filters.severities.join(','),
      }),
    };
  }, [
    currentPage,
    pageSize,
    filters.action,
    filters.actorId,
    filters.targetId,
    filters.module,
    filters.dateFrom,
    filters.dateTo,
    filters.severities,
    targetId,
    debouncedSearch,
  ]);

  const { data: auditLogsResponse, isLoading } = useGetAggregateAuditPostLogs(
    queryParams,
    true,
  );

  const mappedEvents = useMemo(() => {
    const items = (auditLogsResponse?.items ?? []) as AuditLog[];
    return items.map(mapAuditLogToEvent);
  }, [auditLogsResponse]);

  const visibleEvents = mappedEvents;
  const people = useMemo(() => toPeople(allUsers), [allUsers]);
  const totalItems = auditLogsResponse?.meta?.totalItems || 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, targetId, debouncedSearch]);

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

  const handleExport = async () => {
    try {
      const exportParams: AggregateAuditLogParams = {
        ...queryParams,
        page: 1,
        limit: Math.min(
          Math.max(auditLogsResponse?.meta?.totalItems || pageSize, pageSize),
          1000,
        ),
      };
      const response = await getAggregateAuditPostLogs(exportParams);
      const items = (response?.items ?? []) as AuditLog[];
      const events = items.map(mapAuditLogToEvent);
      if (events.length === 0) {
        NotificationMessage.warning({
          message: 'Nothing to export',
          description: 'Adjust filters to include at least one audit event.',
        });
        return;
      }
      exportAuditEventsCsv(events);
      NotificationMessage.success({
        message: 'Export started',
        description: `${events.length} audit event(s) downloaded as CSV.`,
      });
    } catch {
      NotificationMessage.error({
        message: 'Export failed',
        description: 'Unable to download audit events. Please try again.',
      });
    }
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
          actors={people}
          targets={people}
          hideTargetFilter={hideTargetFilter}
          onFiltersChange={setFilters}
          onClear={handleClearFilters}
          onExport={handleExport}
        />
      </div>

      <div className="overflow-x-auto" data-cy="audit-log-table-container">
        <AuditLogTable
          events={visibleEvents}
          loading={isLoading}
          hideTargetColumn={hideTargetColumn}
          onViewDetails={(event) => {
            sessionStorage.setItem(
              `audit-log-${event.id}`,
              JSON.stringify(event),
            );
            router.push(`/audit-log/${event.id}`);
          }}
        />
        <div className="px-3" data-cy="audit-log-pagination-container">
          {isMobile || isTablet ? (
            <CustomMobilePagination
              totalResults={totalItems}
              pageSize={pageSize}
              currentPage={currentPage}
              onChange={onPageChange}
              onShowSizeChange={onPageChange}
              data-cy="audit-log-mobile-pagination"
            />
          ) : (
            <CustomPagination
              current={currentPage}
              total={totalItems}
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
        onSave={async (nextRules) => {
          try {
            const saved = await replaceSeverityRules.mutateAsync(nextRules);
            const list = Array.isArray(saved) ? saved : nextRules;
            setSeverityRules(
              list.map((rule: any) => ({
                id: rule.id,
                module: rule.module,
                actionVerb: rule.actionVerb,
                fields: rule.fields || [],
                severity: rule.severity,
              })),
            );
            onSettingsOpenChange?.(false);
            NotificationMessage.success({
              message: 'Severity rules saved',
              description:
                'New create, update, and delete events will use these rules. Existing rows are classified with the current mapping when loaded.',
            });
          } catch {
            NotificationMessage.error({
              message: 'Could not save severity rules',
              description: 'The backend did not accept the severity rules.',
            });
          }
        }}
      />
    </div>
  );
};

export default AuditLogView;
