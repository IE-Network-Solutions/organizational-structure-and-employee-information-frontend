'use client';
import React, { useState, useMemo } from 'react';
import {
  Button,
  Card,
  Dropdown,
  Input,
  Pagination,
  Skeleton,
  Switch,
} from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useGetAllFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import {
  useActivateMonth,
} from '@/store/server/features/organizationStructure/fiscalYear/mutation';
import {
  FiscalYear,
  Session,
  Month,
} from '@/store/server/features/organizationStructure/fiscalYear/interface';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import dayjs from 'dayjs';
import { IoIosArrowDown } from 'react-icons/io';
import { MdKeyboardArrowUp } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa';
import CustomDeleteFiscalYears from '../deleteModal';
import CustomWorFiscalYearDrawer from '../customDrawer';

const FiscalYearListCard: React.FC = () => {
  const {
    setSelectedFiscalYear,
    setDeleteMode,
    pageSize,
    currentPage,
    setCurrentPage,
    setPageSize,
    setEditMode,
    setOpenFiscalYearDrawer,
    searchQuery,
    setSearchQuery,
  } = useFiscalYearDrawerStore();

  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>(
    {},
  );
  const [expandedSessions, setExpandedSessions] = useState<
    Record<string, boolean>
  >({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>(
    {},
  );
  /* eslint-enable @typescript-eslint/naming-convention */

  const toggleExpand = (id: string, type: 'year' | 'session' | 'month') => {
    if (type === 'year') {
      setExpandedYears((prev) => ({ ...prev, [id]: !prev[id] }));
    } else if (type === 'session') {
      setExpandedSessions((prev) => ({ ...prev, [id]: !prev[id] }));
    } else if (type === 'month') {
      setExpandedMonths((prev) => ({ ...prev, [id]: !prev[id] }));
    }
  };

  const { data: fiscalYears, isLoading: fiscalYearsFetchLoading } =
    useGetAllFiscalYears(pageSize, currentPage);
  const { mutate: activateMonth, isLoading: isActivatingMonth } =
    useActivateMonth();

  const handleMenuClick = (key: string, fYear: FiscalYear) => {
    if (key === 'edit') {
      setSelectedFiscalYear(fYear);
      setEditMode(true);
      setOpenFiscalYearDrawer(true);
    } else if (key === 'delete') {
      setSelectedFiscalYear(fYear);
      setDeleteMode(true);
    }
  };

  const handelDrawerOpen = () => {
    // Reset form state for create mode
    setEditMode(false);
    setSelectedFiscalYear(null);
    setOpenFiscalYearDrawer(true);
  };

  const filteredFiscalYears = useMemo(() => {
    if (!fiscalYears?.items) return [];
    if (!searchQuery.trim()) return fiscalYears.items;

    const query = searchQuery.toLowerCase().trim();
    return fiscalYears.items.filter((fYear: FiscalYear) => {
      const name = fYear.name?.toLowerCase() || '';
      return name.includes(query);
    });
  }, [fiscalYears?.items, searchQuery]);

  if (fiscalYearsFetchLoading) {
    return (
      <Skeleton
        active
        paragraph={{ rows: 4 }}
        data-cy="org-settings-fiscalyear-fiscalyearcard-page-skeleton-1"
      />
    );
  }

  return (
    <div
      className="p-5 rounded-2xl bg-white h-full"
      data-cy="org-settings-fiscal-year-container"
      id="org-settings-fiscal-year-container"
    >
      <div
        className="flex justify-between items-center mb-4"
        data-cy="org-settings-fiscal-year-header"
        id="org-settings-fiscal-year-header"
      >
        <h2
          className="text-xl font-bold"
          data-cy="org-settings-fiscal-year-title"
          id="org-settings-fiscal-year-title"
        >
          Fiscal Year
        </h2>
        <AccessGuard
          permissions={[Permissions.CreateCalendar]}
          data-cy="org-settings-fiscal-year-create-btn-access-guard"
          id="org-settings-fiscal-year-create-btn-access-guard"
        >
          <Button
            className="h-10 w-10 sm:w-auto"
            type="primary"
            icon={
              <FaPlus
                data-cy="org-settings-fiscalyear-fiscalyearcard-page-faplus-1"
                id="org-settings-fiscalyear-fiscalyearcard-page-faplus-1"
              />
            }
            onClick={handelDrawerOpen}
            data-cy="org-settings-fiscal-year-create-btn"
            id="org-settings-fiscal-year-create-btn"
          >
            <span
              className="hidden lg:inline"
              data-cy="org-settings-fiscal-year-create-btn-text"
              id="org-settings-fiscal-year-create-btn-text"
            >
              Create Fiscal Year
            </span>
          </Button>
        </AccessGuard>
      </div>
      <Input
        placeholder="Search fiscal year"
        className="flex-1 h-12 rounded-lg border-gray-200"
        allowClear
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        id="org-settings-fiscal-year-search-input"
        data-cy="org-settings-fiscal-year-search-input"
      />

      {filteredFiscalYears.length > 0 ? (
        filteredFiscalYears.map((fYear: FiscalYear, index: number) => {
          const fiscalYearId = fYear?.id || `fiscal-year-${index}`;
          const allMonthsForYear =
            fYear.sessions?.flatMap((s: Session) => s.months ?? []) ?? [];
          const activeMonthForYear = allMonthsForYear.find(
            (m: Month) => m.active,
          );
          const nextMonthStartDateStr = activeMonthForYear
            ? dayjs(activeMonthForYear.endDate).add(1, 'day').format('YYYY-MM-DD')
            : null;
          const isNextMonthAfterActive = (month: Month) =>
            nextMonthStartDateStr != null &&
            dayjs(month.startDate).format('YYYY-MM-DD') === nextMonthStartDateStr;
          return (
            <Card
              key={fYear?.id}
              className="my-3"
              bodyStyle={{ padding: 0, margin: 0 }}
              data-cy={`org-settings-fiscal-year-card-${fiscalYearId}`}
              id="org-settings-fiscal-year-card"
            >
              <div
                className="flex items-center justify-between"
                data-cy="org-settings-fiscal-year-card-content"
                id="org-settings-fiscal-year-card-content"
              >
                <div
                  className="flex flex-col w-full "
                  data-cy="org-settings-fiscal-year-card-content-inner"
                  id="org-settings-fiscal-year-card-content-inner"
                >
                  <div
                    className={`flex items-center justify-between gap-x-4 cursor-pointer p-2 rounded-lg ${
                      expandedYears[fYear?.id || ''] ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => toggleExpand(fYear?.id || '', 'year')}
                    data-cy={`org-settings-fiscal-year-header-${fiscalYearId}`}
                    id={`org-settings-fiscal-year-header-${fiscalYearId}`}
                  >
                    <div
                      className="flex items-center justify-center"
                      data-cy="org-settings-fiscal-year-card-content-inner-header"
                      id="org-settings-fiscal-year-card-content-inner-header"
                    >
                      <div
                        className="font-light"
                        data-cy="org-settings-fiscal-year-card-content-inner-header-icon"
                        id="org-settings-fiscal-year-card-content-inner-header-icon"
                      >
                        {expandedYears[fYear?.id || ''] ? (
                          <MdKeyboardArrowUp
                            size={20}
                            data-cy="org-settings-fiscalyear-fiscalyearcard-page-mdkeyboardarrowup-1"
                            id="org-settings-fiscalyear-fiscalyearcard-page-mdkeyboardarrowup-1"
                          />
                        ) : (
                          <IoIosArrowDown
                            data-cy="org-settings-fiscalyear-fiscalyearcard-page-ioiosarrowdown-1"
                            id="org-settings-fiscalyear-fiscalyearcard-page-ioiosarrowdown-1"
                          />
                        )}
                      </div>
                      <div
                        className="m-3"
                        data-cy="org-settings-fiscal-year-card-content-inner-header-content"
                        id="org-settings-fiscal-year-card-content-inner-header-content"
                      >
                        <p
                          className="font-semibold uppercase text-slate-500"
                          data-cy={`org-settings-fiscal-year-name-${fiscalYearId}`}
                          id={`org-settings-fiscal-year-name-${fiscalYearId}`}
                        >
                          {fYear.name ?? 'Fiscal Year'}
                        </p>
                        <div
                          className="font-normal text-xs"
                          data-cy={`org-settings-fiscal-year-dates-${fiscalYearId}`}
                          id={`org-settings-fiscal-year-dates-${fiscalYearId}`}
                        >
                          {dayjs(fYear.startDate).format('DD MMM, YYYY')} —{' '}
                          {dayjs(fYear.endDate).format('DD MMM, YYYY')}
                        </div>
                      </div>
                    </div>
                    {fYear?.isActive && (
                      <div
                        className="flex items-center justify-end rounded-lg bg-[#55C79033] py-1 px-3 text"
                        data-cy={`org-settings-fiscal-year-active-badge-${fiscalYearId}`}
                        id={`org-settings-fiscal-year-active-badge-${fiscalYearId}`}
                      >
                        <span
                          className="text-[#0BA259]"
                          data-cy="org-settings-fiscal-year-active-badge-text"
                          id="org-settings-fiscal-year-active-badge-text"
                        >
                          Active
                        </span>
                      </div>
                    )}
                  </div>

                  {expandedYears[fYear?.id || ''] &&
                    fYear.sessions?.map((session: Session, index: number) => {
                      const sessionId = session.id || `session-${index}`;
                      return (
                        <div
                          key={session.id}
                          className="mt-2 ml-7"
                          data-cy={`org-settings-fiscal-year-session-${sessionId}`}
                          id={`org-settings-fiscal-year-session-${sessionId}`}
                        >
                          <div
                            className={`flex items-center justify-start gap-x-4 cursor-pointer p-2 rounded-lg ${
                              expandedSessions[session.id] ? 'bg-gray-100' : ''
                            }`}
                            onClick={() => toggleExpand(session.id, 'session')}
                            data-cy={`org-settings-fiscal-year-session-header-${sessionId}`}
                            id={`org-settings-fiscal-year-session-header-${sessionId}`}
                          >
                            <div
                              className="font-light"
                              data-cy="org-settings-fiscal-year-session-header-icon"
                              id="org-settings-fiscal-year-session-header-icon"
                            >
                              {expandedSessions[session.id] ? (
                                <MdKeyboardArrowUp
                                  size={20}
                                  data-cy="org-settings-fiscalyear-fiscalyearcard-page-mdkeyboardarrowup-2"
                                  id="org-settings-fiscalyear-fiscalyearcard-page-mdkeyboardarrowup-2"
                                />
                              ) : (
                                <IoIosArrowDown
                                  data-cy="org-settings-fiscalyear-fiscalyearcard-page-ioiosarrowdown-2"
                                  id="org-settings-fiscalyear-fiscalyearcard-page-ioiosarrowdown-2"
                                />
                              )}
                            </div>
                            <div
                              data-cy="org-settings-fiscal-year-session-header-content"
                              id="org-settings-fiscal-year-session-header-content"
                            >
                              <p
                                className="font-semibold uppercase text-slate-500"
                                data-cy={`org-settings-fiscal-year-session-name-${sessionId}`}
                                id={`org-settings-fiscal-year-session-name-${sessionId}`}
                              >
                                {session.name ?? 'Session One'}
                              </p>
                              <div
                                className="font-normal text-xs"
                                data-cy={`org-settings-fiscal-year-session-dates-${sessionId}`}
                                id={`org-settings-fiscal-year-session-dates-${sessionId}`}
                              >
                                {dayjs(session.startDate).format(
                                  'DD MMM, YYYY',
                                )}{' '}
                                —{' '}
                                {dayjs(session.endDate).format('DD MMM, YYYY')}
                              </div>
                            </div>
                            {session?.active && (
                              <div
                                className="flex items-center justify-end rounded-lg bg-[#55C79033] py-1 px-3 text"
                                data-cy={`org-settings-fiscal-year-session-active-badge-${sessionId}`}
                                id={`org-settings-fiscal-year-session-active-badge-${sessionId}`}
                              >
                                <span
                                  className="text-[#0BA259]"
                                  data-cy="org-settings-fiscal-year-session-active-badge-text"
                                  id="org-settings-fiscal-year-session-active-badge-text"
                                >
                                  Active
                                </span>
                              </div>
                            )}
                          </div>

                          {expandedSessions[session.id] &&
                            session.months?.map(
                              (month: Month, index: number) => {
                                const monthId = month.id || `month-${index}`;
                                return (
                                  <div
                                    key={month.id}
                                    className="mt-2 ml-10"
                                    data-cy={`org-settings-fiscal-year-month-${monthId}`}
                                    id={`org-settings-fiscal-year-month-${monthId}`}
                                  >
                                    <div
                                      className="flex items-center justify-between gap-3 cursor-pointer gap-x-4 p-2"
                                      onClick={() =>
                                        toggleExpand(month.id, 'month')
                                      }
                                      data-cy={`org-settings-fiscal-year-month-header-${monthId}`}
                                      id={`org-settings-fiscal-year-month-header-${monthId}`}
                                    >
                                      <div
                                        data-cy="org-settings-fiscalyear-fiscalyearcard-page-div-1"
                                        id="org-settings-fiscalyear-fiscalyearcard-page-div-1"
                                      >
                                        <p
                                          className="font-semibold uppercase text-slate-500"
                                          data-cy={`org-settings-fiscal-year-month-name-${monthId}`}
                                          id={`org-settings-fiscal-year-month-name-${monthId}`}
                                        >
                                          {month?.name ?? 'Month'}
                                        </p>
                                        <div
                                          className="font-normal text-xs"
                                          data-cy={`org-settings-fiscal-year-month-dates-${monthId}`}
                                          id={`org-settings-fiscal-year-month-dates-${monthId}`}
                                        >
                                          {dayjs(month.startDate).format(
                                            'DD MMM, YYYY',
                                          )}{' '}
                                          —{' '}
                                          {dayjs(month.endDate).format(
                                            'DD MMM, YYYY',
                                          )}
                                        </div>
                                      </div>
                                      <div
                                        className="flex items-center gap-2"
                                        onClick={(e) => e.stopPropagation()}
                                        data-cy={`org-settings-fiscal-year-month-activation-${monthId}`}
                                      >
                                        {month?.active && (
                                          <div
                                            className="flex items-center justify-end rounded-lg bg-[#55C79033] py-1 px-3 text"
                                            data-cy={`org-settings-fiscal-year-month-active-badge-${monthId}`}
                                            id={`org-settings-fiscal-year-month-active-badge-${monthId}`}
                                          >
                                            <span
                                              className="text-[#0BA259]"
                                              data-cy="org-settings-fiscal-year-month-active-badge-text"
                                              id="org-settings-fiscal-year-month-active-badge-text"
                                            >
                                              Active
                                            </span>
                                          </div>
                                        )}
                                        {isNextMonthAfterActive(month) && (
                                          <AccessGuard
                                            permissions={[
                                              Permissions.UpdateCalendar,
                                            ]}
                                            data-cy={`org-settings-fiscal-year-month-toggle-guard-${monthId}`}
                                          >
                                            <Switch
                                              data-cy={`org-settings-fiscal-year-month-toggle-${monthId}`}
                                              id={`org-settings-fiscal-year-month-toggle-${monthId}`}
                                              checked={!!month?.active}
                                              loading={isActivatingMonth}
                                              onChange={(checked) => {
                                                if (checked) {
                                                  activateMonth(month.id);
                                                }
                                              }}
                                            />
                                          </AccessGuard>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              },
                            )}
                        </div>
                      );
                    })}
                </div>
                {/* Dropdown for edit/delete actions */}
                <AccessGuard
                  permissions={[
                    Permissions.UpdateCalendar,
                    Permissions.DeleteCalendar,
                  ]}
                  data-cy="org-settings-fiscal-year-card-dropdown"
                  id="org-settings-fiscal-year-card-dropdown"
                >
                  <Dropdown
                    menu={{
                      items: [
                        ...(fYear.isActive
                          ? [
                              {
                                key: 'edit',
                                label: 'Edit',
                                onClick: () => handleMenuClick('edit', fYear),
                              },
                            ]
                          : []),
                        {
                          key: 'delete',
                          label: (
                            <span
                              className="text-red-500"
                              data-cy="org-settings-fiscalyear-fiscalyearcard-page-span-1"
                              id="org-settings-fiscalyear-fiscalyearcard-page-span-1"
                            >
                              Delete
                            </span>
                          ),
                          onClick: () => handleMenuClick('delete', fYear),
                        },
                      ],
                    }}
                    trigger={['click']}
                    data-cy={`org-settings-fiscal-year-dropdown-${fiscalYearId}`}
                  >
                    <MoreOutlined
                      className="text-lg cursor-pointer"
                      data-cy={`org-settings-fiscal-year-actions-${fiscalYearId}`}
                      id={`org-settings-fiscal-year-actions-${fiscalYearId}`}
                    />
                  </Dropdown>
                </AccessGuard>
              </div>
            </Card>
          );
        })
      ) : (
        <div
          className="mx-auto p-4 text-center"
          data-cy="org-settings-fiscal-year-empty"
          id="org-settings-fiscal-year-empty"
        >
          <p
            data-cy="org-settings-fiscal-year-empty-text"
            id="org-settings-fiscal-year-empty-text"
          >
            No Fiscal Year found.
          </p>
        </div>
      )}
      <Pagination
        current={currentPage}
        total={fiscalYears?.meta?.totalItems ?? 1}
        pageSize={pageSize}
        onChange={(page, pageSize) => {
          setCurrentPage(page);
          setPageSize(pageSize);
        }}
        onShowSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        data-cy="org-settings-fiscal-year-pagination"
      />
      <CustomWorFiscalYearDrawer data-cy="org-settings-fiscal-year-drawer" />
      <CustomDeleteFiscalYears data-cy="org-settings-fiscal-year-delete-modal" />
    </div>
  );
};

export default FiscalYearListCard;
