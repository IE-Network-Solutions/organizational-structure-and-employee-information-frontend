'use client';
import React, { useState, useMemo } from 'react';
import {
  Card,
  Dropdown,
  Pagination,
  Skeleton,
  Switch,
  Menu,
  Popconfirm,
  Tag,
  Row,
  Col,
} from 'antd';
import { useGetAllFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import {
  useActivateMonth,
  useDeleteFiscalYear,
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
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { MdKeyboardArrowUp } from 'react-icons/md';
import { BsThreeDots } from 'react-icons/bs';
import { MdEdit, MdDelete, MdCalendarToday, MdBarChart } from 'react-icons/md';
import CustomWorFiscalYearDrawer from '../customDrawer';
import { CloseOutlined } from '@ant-design/icons';

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
    setCurrent,
    setFiscalYearFormValues,
    setSessionFormValues,
    setSessionData,
    setMonthRangeFormValues,
    setCalendarType,
    setFiscalYearStart,
    setFiscalYearEnd,
    resetFormState,
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

  const {
    data: fiscalYears,
    isLoading: fiscalYearsFetchLoading,
    refetch: refetchFiscalYears,
  } = useGetAllFiscalYears(pageSize, currentPage);
  const { mutate: activateMonth, isLoading: isActivatingMonth } =
    useActivateMonth();
  const { mutate: deleteFiscalYear } = useDeleteFiscalYear();

  const [deletePopconfirmVisible, setDeletePopconfirmVisible] = useState<
    Record<string, boolean>
  >({});
  const [deletingFiscalYearId, setDeletingFiscalYearId] = useState<
    string | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleMenuClick = (key: string, fYear: FiscalYear) => {
    if (key === 'edit') {
      // Clear any stale wizard state from a previous create/edit attempt
      setCurrent(0);
      setFiscalYearFormValues({});
      setSessionFormValues({});
      setSessionData([]);
      setMonthRangeFormValues([]);
      setCalendarType('');
      setFiscalYearStart(null);
      setFiscalYearEnd(null);
      resetFormState();

      setSelectedFiscalYear(fYear);
      setEditMode(true);
      setOpenFiscalYearDrawer(true);
    } else if (key === 'delete') {
      setSelectedFiscalYear(fYear);
      setDeleteMode(true);
    }
  };

  const handleDelete = (fYear: FiscalYear) => {
    if (fYear && fYear.id) {
      const fiscalYearId = String(fYear.id);
      setDeletingFiscalYearId(fiscalYearId);
      setIsDeleting(true);
      deleteFiscalYear(fYear.id, {
        onSuccess: () => {
          refetchFiscalYears();
          setDeletePopconfirmVisible((prev) => ({
            ...prev,
            [fiscalYearId]: false,
          }));
          setDeletingFiscalYearId(null);
          setIsDeleting(false);
        },
        onError: () => {
          setDeletePopconfirmVisible((prev) => ({
            ...prev,
            [fiscalYearId]: false,
          }));
          setDeletingFiscalYearId(null);
          setIsDeleting(false);
        },
      });
    }
  };

  const getCalendarFrequency = (sessions?: Session[]) => {
    if (!sessions || sessions.length === 0) return 'Yearly';
    const sessionCount = sessions.length;
    if (sessionCount === 4) return 'Quarterly';
    if (sessionCount === 2) return 'Bi-annually';
    if (sessionCount === 1) return 'Yearly';
    return `${sessionCount} Sessions`;
  };

  const menu = (fYear: FiscalYear) => {
    const fiscalYearId = fYear?.id || 'fiscal-year';
    return (
      <Menu
        selectable={false}
        className="bg-white"
        theme="light"
        mode="vertical"
        data-cy={`org-settings-fiscal-year-menu-${fiscalYearId}`}
        id={`org-settings-fiscal-year-menu-${fiscalYearId}`}
      >
        {fYear.isActive && (
          <AccessGuard
            permissions={[Permissions.UpdateCalendar]}
            data-cy={`org-settings-fiscal-year-edit-menu-item-${fiscalYearId}`}
            id={`org-settings-fiscal-year-edit-menu-item-${fiscalYearId}`}
          >
            <Menu.Item
              onClick={() => handleMenuClick('edit', fYear)}
              data-cy={`org-settings-fiscal-year-edit-${fiscalYearId}`}
              id={`org-settings-fiscal-year-edit-${fiscalYearId}`}
              className="bg-white hover:bg-gray-100"
              icon={
                <MdEdit
                  data-cy={`org-settings-fiscal-year-edit-icon-${fiscalYearId}`}
                />
              }
            >
              <span
                data-cy={`org-settings-fiscal-year-edit-text-${fiscalYearId}`}
              >
                Edit
              </span>
            </Menu.Item>
          </AccessGuard>
        )}
        <AccessGuard
          permissions={[Permissions.DeleteCalendar]}
          data-cy={`org-settings-fiscal-year-delete-menu-item-${fiscalYearId}`}
          id={`org-settings-fiscal-year-delete-menu-item-${fiscalYearId}`}
        >
          <Menu.Item
            data-cy={`org-settings-fiscal-year-delete-${fiscalYearId}`}
            id={`org-settings-fiscal-year-delete-${fiscalYearId}`}
            className="bg-white hover:bg-gray-100"
            icon={
              <MdDelete
                className="text-gray-600"
                data-cy={`org-settings-fiscal-year-delete-icon-${fiscalYearId}`}
              />
            }
          >
            <Popconfirm
              icon={null}
              title={
                <div
                  className="p-2"
                  data-cy={`org-settings-fiscal-year-delete-popconfirm-content-${fiscalYearId}`}
                >
                  <h3
                    className="text-base font-bold text-gray-800 mb-1"
                    data-cy={`org-settings-fiscal-year-delete-popconfirm-title-${fiscalYearId}`}
                  >
                    Delete Fiscal year
                  </h3>
                  <p
                    className="text-sm text-gray-800 m-0 mb-1"
                    data-cy={`org-settings-fiscal-year-delete-popconfirm-description-${fiscalYearId}`}
                  >
                    Are you Sure you want to Delete this Fiscal year?
                  </p>
                </div>
              }
              open={deletePopconfirmVisible[String(fYear?.id || '')]}
              onOpenChange={(visible) => {
                setDeletePopconfirmVisible((prev) => ({
                  ...prev,
                  [String(fYear?.id || '')]: visible,
                }));
              }}
              onCancel={(e) => {
                e?.stopPropagation();
                setDeletePopconfirmVisible((prev) => ({
                  ...prev,
                  [String(fYear?.id || '')]: false,
                }));
              }}
              onConfirm={() => handleDelete(fYear)}
              okText="Delete"
              okButtonProps={{
                danger: true,
                loading:
                  isDeleting &&
                  deletingFiscalYearId === String(fYear?.id || ''),
                size: 'middle',
              }}
              cancelButtonProps={{ size: 'middle' }}
              cancelText="Cancel"
              overlayStyle={{ padding: '20px', minWidth: '400px' }}
              data-cy={`org-settings-fiscal-year-delete-popconfirm-${fiscalYearId}`}
            >
              <span
                className="cursor-pointer text-gray-600"
                data-cy={`org-settings-fiscal-year-delete-popconfirm-trigger-${fiscalYearId}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!deletePopconfirmVisible[String(fYear?.id || '')]) {
                    setDeletePopconfirmVisible((prev) => ({
                      ...prev,
                      [String(fYear?.id || '')]: true,
                    }));
                  }
                }}
              >
                Delete
              </span>
            </Popconfirm>
          </Menu.Item>
        </AccessGuard>
      </Menu>
    );
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
      className="bg-white h-full"
      data-cy="org-settings-fiscal-year-container"
      id="org-settings-fiscal-year-container"
    >
      {filteredFiscalYears.length > 0 ? (
        <Row
          gutter={[16, 0]}
          data-cy="org-settings-fiscal-year-list"
          id="org-settings-fiscal-year-list"
        >
          {filteredFiscalYears.map((fYear: FiscalYear, index: number) => {
            const fiscalYearId = fYear?.id || `fiscal-year-${index}`;
            const allMonthsForYear =
              fYear.sessions?.flatMap((s: Session) => s.months ?? []) ?? [];
            const activeMonthForYear = allMonthsForYear.find(
              (m: Month) => m.active,
            );
            const nextMonthStartDateStr = activeMonthForYear
              ? dayjs(activeMonthForYear.endDate)
                  .add(1, 'day')
                  .format('YYYY-MM-DD')
              : null;
            const isNextMonthAfterActive = (month: Month) =>
              nextMonthStartDateStr != null &&
              dayjs(month.startDate).format('YYYY-MM-DD') ===
                nextMonthStartDateStr;
            return (
              <Col xs={24} sm={24} md={12} lg={12} xl={12} key={fYear?.id}>
                <Card
                  key={fYear?.id}
                  className="my-3 h-fit"
                  bordered={false}
                  style={{ background: '#F9FAFB' }}
                  bodyStyle={{ padding: '12px 14px', background: '#F9FAFB' }}
                  data-cy={`org-settings-fiscal-year-card-${fiscalYearId}`}
                  id="org-settings-fiscal-year-card"
                >
                  <div
                    className="flex items-center justify-between mb-1"
                    data-cy="org-settings-fiscal-year-card-content"
                    id="org-settings-fiscal-year-card-content"
                  >
                    <div
                      className="flex items-center gap-2 flex-1 min-w-0"
                      onClick={() => toggleExpand(fYear?.id || '', 'year')}
                      data-cy={`org-settings-fiscal-year-header-${fiscalYearId}`}
                      id={`org-settings-fiscal-year-header-${fiscalYearId}`}
                    >
                      <div
                        className="cursor-pointer flex items-center justify-center shrink-0 self-center"
                        data-cy={`org-settings-fiscal-year-toggle-arrow-container-${fiscalYearId}`}
                      >
                        {expandedYears[fYear?.id || ''] ? (
                          <IoIosArrowUp
                            size={16}
                            data-cy="org-settings-fiscalyear-fiscalyearcard-page-mdkeyboardarrowup-1"
                            id="org-settings-fiscalyear-fiscalyearcard-page-mdkeyboardarrowup-1"
                          />
                        ) : (
                          <IoIosArrowDown
                            size={16}
                            data-cy="org-settings-fiscalyear-fiscalyearcard-page-ioiosarrowdown-1"
                            id="org-settings-fiscalyear-fiscalyearcard-page-ioiosarrowdown-1"
                          />
                        )}
                      </div>
                      <div
                        className="flex flex-col gap-0.5 min-w-0 py-0.5"
                        data-cy={`org-settings-fiscal-year-card-content-${fiscalYearId}`}
                      >
                        <div
                          className="flex items-center gap-2 flex-wrap"
                          data-cy={`org-settings-fiscal-year-card-title-row-${fiscalYearId}`}
                        >
                          <h3
                            className="text-base font-semibold text-gray-800 m-0 cursor-pointer"
                            data-cy={`org-settings-fiscal-year-name-${fiscalYearId}`}
                            id={`org-settings-fiscal-year-name-${fiscalYearId}`}
                          >
                            {fYear.name ?? 'Fiscal Year'}
                          </h3>
                          {fYear?.isActive && (
                            <Tag
                              className="!text-[#237804] !border-[#237804] !bg-[rgba(35,120,4,0.1)]"
                              data-cy={`org-settings-fiscal-year-active-badge-${fiscalYearId}`}
                              id={`org-settings-fiscal-year-active-badge-${fiscalYearId}`}
                            >
                              Active
                            </Tag>
                          )}
                        </div>
                        <div
                          className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs"
                          data-cy={`org-settings-fiscal-year-meta-${fiscalYearId}`}
                          id={`org-settings-fiscal-year-meta-${fiscalYearId}`}
                        >
                          <div
                            className="flex items-center gap-2 min-w-0"
                            data-cy={`org-settings-fiscal-year-date-range-${fiscalYearId}`}
                          >
                            <MdCalendarToday
                              className={
                                fYear?.isActive
                                  ? 'text-primary'
                                  : 'text-gray-500'
                              }
                              data-cy={`org-settings-fiscal-year-date-range-icon-${fiscalYearId}`}
                            />
                            <span
                              className="text-sm text-gray-500 truncate"
                              data-cy={`org-settings-fiscal-year-date-range-text-${fiscalYearId}`}
                            >
                              {dayjs(fYear.startDate).format('DD MMM, YYYY')} -{' '}
                              {dayjs(fYear.endDate).format('DD MMM, YYYY')}
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-2 min-w-0"
                            data-cy={`org-settings-fiscal-year-frequency-${fiscalYearId}`}
                          >
                            <MdBarChart
                              className={
                                fYear?.isActive
                                  ? 'text-primary'
                                  : 'text-gray-500'
                              }
                              data-cy={`org-settings-fiscal-year-frequency-icon-${fiscalYearId}`}
                            />
                            <span
                              className="text-sm text-gray-500 truncate"
                              data-cy={`org-settings-fiscal-year-frequency-text-${fiscalYearId}`}
                            >
                              {getCalendarFrequency(fYear.sessions)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex items-center shrink-0 self-center"
                      data-cy={`org-settings-fiscal-year-card-actions-${fiscalYearId}`}
                    >
                      <AccessGuard
                        permissions={[
                          Permissions.UpdateCalendar,
                          Permissions.DeleteCalendar,
                        ]}
                        data-cy="org-settings-fiscal-year-card-dropdown"
                        id="org-settings-fiscal-year-card-dropdown"
                      >
                        <Dropdown
                          overlay={menu(fYear)}
                          trigger={['click']}
                          data-cy={`org-settings-fiscal-year-dropdown-${fiscalYearId}`}
                        >
                          <button
                            type="button"
                            className="cursor-pointer text-black hover:text-black border border-[#D9D9D9] rounded-md bg-transparent flex items-center justify-center hover:border-[#D9D9D9] h-6 w-6 shrink-0"
                            id={`org-settings-fiscal-year-actions-button-${fiscalYearId}`}
                            data-cy={`org-settings-fiscal-year-actions-button-${fiscalYearId}`}
                          >
                            <BsThreeDots
                              id={`org-settings-fiscal-year-actions-${fiscalYearId}`}
                              data-cy={`org-settings-fiscal-year-actions-${fiscalYearId}`}
                              className="text-black"
                              size={16}
                            />
                          </button>
                        </Dropdown>
                      </AccessGuard>
                    </div>
                  </div>
                  <div
                    className="flex flex-col w-full"
                    data-cy="org-settings-fiscal-year-card-content-inner"
                    id="org-settings-fiscal-year-card-content-inner"
                  >
                    {expandedYears[fYear?.id || ''] &&
                      fYear.sessions?.map((session: Session, index: number) => {
                        const sessionId = session.id || `session-${index}`;
                        return (
                          <div
                            key={session.id}
                            className="mt-3 rounded-md"
                            style={{ marginLeft: '0px', background: '#FFFFFF' }}
                            data-cy={`org-settings-fiscal-year-session-${sessionId}`}
                            id={`org-settings-fiscal-year-session-${sessionId}`}
                          >
                            <div
                              className="flex items-center justify-between cursor-pointer px-3 py-2"
                              onClick={() =>
                                toggleExpand(session.id, 'session')
                              }
                              data-cy={`org-settings-fiscal-year-session-header-${sessionId}`}
                              id={`org-settings-fiscal-year-session-header-${sessionId}`}
                            >
                              <div
                                className="flex items-center gap-12 flex-1"
                                data-cy={`org-settings-fiscal-year-session-header-content-${sessionId}`}
                              >
                                <p
                                  className="font-base text-gray-800 m-0"
                                  style={{ fontSize: '14px' }}
                                  data-cy={`org-settings-fiscal-year-session-name-${sessionId}`}
                                  id={`org-settings-fiscal-year-session-name-${sessionId}`}
                                >
                                  {session.name ?? 'Session One'}
                                </p>
                                <div
                                  className="text-gray-500"
                                  style={{ fontSize: '12px' }}
                                  data-cy={`org-settings-fiscal-year-session-dates-${sessionId}`}
                                  id={`org-settings-fiscal-year-session-dates-${sessionId}`}
                                >
                                  {dayjs(session.startDate).format(
                                    'DD MMM, YYYY',
                                  )}{' '}
                                  -{' '}
                                  {dayjs(session.endDate).format(
                                    'DD MMM, YYYY',
                                  )}
                                </div>
                              </div>
                              <div
                                className="flex items-center gap-2 self-center"
                                data-cy={`org-settings-fiscal-year-session-actions-${sessionId}`}
                              >
                                {session?.active && (
                                  <Tag
                                    className="!text-[#237804] !border-[#237804] !bg-[rgba(35,120,4,0.1)]"
                                    data-cy={`org-settings-fiscal-year-session-active-badge-${sessionId}`}
                                    id={`org-settings-fiscal-year-session-active-badge-${sessionId}`}
                                  >
                                    Active
                                  </Tag>
                                )}
                                <div
                                  className="cursor-pointer flex-shrink-0 flex items-center justify-center"
                                  style={{ alignSelf: 'center' }}
                                  data-cy={`org-settings-fiscal-year-session-toggle-arrow-container-${sessionId}`}
                                >
                                  {expandedSessions[session.id] ? (
                                    <MdKeyboardArrowUp
                                      size={14}
                                      data-cy="org-settings-fiscalyear-fiscalyearcard-page-mdkeyboardarrowup-2"
                                      id="org-settings-fiscalyear-fiscalyearcard-page-mdkeyboardarrowup-2"
                                    />
                                  ) : (
                                    <IoIosArrowDown
                                      size={14}
                                      data-cy="org-settings-fiscalyear-fiscalyearcard-page-ioiosarrowdown-2"
                                      id="org-settings-fiscalyear-fiscalyearcard-page-ioiosarrowdown-2"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>

                            {expandedSessions[session.id] && (
                              <div
                                data-cy={`org-settings-fiscal-year-session-months-container-${sessionId}`}
                              >
                                {session.months?.map(
                                  (month: Month, index: number) => {
                                    const monthId =
                                      month.id || `month-${index}`;
                                    return (
                                      <div
                                        key={month.id}
                                        className="mt-1 ml-3"
                                        data-cy={`org-settings-fiscal-year-month-${monthId}`}
                                        id={`org-settings-fiscal-year-month-${monthId}`}
                                      >
                                        <div
                                          className="flex items-center justify-between cursor-pointer px-3 py-1"
                                          onClick={() =>
                                            toggleExpand(month.id, 'month')
                                          }
                                          data-cy={`org-settings-fiscal-year-month-header-${monthId}`}
                                          id={`org-settings-fiscal-year-month-header-${monthId}`}
                                        >
                                          <div
                                            className="flex-1 flex items-center gap-12"
                                            data-cy="org-settings-fiscalyear-fiscalyearcard-page-div-1"
                                            id="org-settings-fiscalyear-fiscalyearcard-page-div-1"
                                          >
                                            <p
                                              className="font-base text-gray-800 m-0"
                                              style={{ fontSize: '14px' }}
                                              data-cy={`org-settings-fiscal-year-month-name-${monthId}`}
                                              id={`org-settings-fiscal-year-month-name-${monthId}`}
                                            >
                                              {month?.name ?? 'Month'}
                                            </p>
                                            <div
                                              className="text-gray-500"
                                              style={{ fontSize: '12px' }}
                                              data-cy={`org-settings-fiscal-year-month-dates-${monthId}`}
                                              id={`org-settings-fiscal-year-month-dates-${monthId}`}
                                            >
                                              {dayjs(month.startDate).format(
                                                'DD MMM, YYYY',
                                              )}{' '}
                                              -{' '}
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
                                              <span
                                                className="text-success text-xs"
                                                data-cy={`org-settings-fiscal-year-month-active-badge-${monthId}`}
                                                id={`org-settings-fiscal-year-month-active-badge-${monthId}`}
                                              >
                                                Active
                                              </span>
                                            )}
                                            {isNextMonthAfterActive(month) && (
                                              <AccessGuard
                                                permissions={[
                                                  Permissions.UpdateCalendar,
                                                ]}
                                                data-cy={`org-settings-fiscal-year-month-toggle-guard-${monthId}`}
                                              >
                                                <Popconfirm
                                                  icon={<></>}
                                                  title={
                                                    <div
                                                      className="flex items-center justify-between mb-3 mx-3"
                                                      data-cy={`org-settings-fiscal-year-activate-month-popconfirm-title-${monthId}`}
                                                    >
                                                      <p
                                                        className="text-lg font-bold text-gray-700 m-0"
                                                        data-cy={`org-settings-fiscal-year-activate-month-popconfirm-title-text-${monthId}`}
                                                      >
                                                        Change active month
                                                      </p>
                                                      <CloseOutlined
                                                        className="text-gray-400 m-0 cursor-pointer hover:text-gray-600"
                                                        onClick={(
                                                          e: React.MouseEvent<HTMLDivElement>,
                                                        ) => {
                                                          e.stopPropagation();
                                                        }}
                                                      />
                                                    </div>
                                                  }
                                                  description={
                                                    <p
                                                      className="text-sm text-gray-500 m-0 my-1  mb-4 mx-3"
                                                      data-cy={`org-settings-fiscal-year-activate-month-popconfirm-description-${monthId}`}
                                                    >
                                                      Are you sure you want to
                                                      activate this month?
                                                    </p>
                                                  }
                                                  okText="Ok"
                                                  okButtonProps={{
                                                    type: 'primary',
                                                    className:
                                                      'font-normal p-2 px-4 mr-3 mb-2 rounded-md',
                                                    'data-cy': `org-settings-fiscal-year-activate-month-popconfirm-ok-${monthId}`,
                                                  }}
                                                  cancelButtonProps={{
                                                    'data-cy': `org-settings-fiscal-year-activate-month-popconfirm-cancel-${monthId}`,
                                                    className:
                                                      'font-normal m-0 p-2 mb-2 rounded-md border-gray-400',
                                                  }}
                                                  cancelText={
                                                    <div
                                                      className="border-gray-400 font-normal m-0"
                                                      data-cy={`org-settings-fiscal-year-activate-month-popconfirm-cancel-text-${monthId}`}
                                                    >
                                                      Cancel
                                                    </div>
                                                  }
                                                  onConfirm={() => {
                                                    activateMonth(month.id, {
                                                      onSuccess: () =>
                                                        refetchFiscalYears(),
                                                    });
                                                  }}
                                                  data-cy={`org-settings-fiscal-year-activate-month-popconfirm-${monthId}`}
                                                >
                                                  <span
                                                    onClick={(e) =>
                                                      e.stopPropagation()
                                                    }
                                                    data-cy={`org-settings-fiscal-year-activate-month-popconfirm-trigger-${monthId}`}
                                                  >
                                                    <Switch
                                                      data-cy={`org-settings-fiscal-year-month-toggle-${monthId}`}
                                                      id={`org-settings-fiscal-year-month-toggle-${monthId}`}
                                                      checked={!!month?.active}
                                                      loading={
                                                        isActivatingMonth
                                                      }
                                                    />
                                                  </span>
                                                </Popconfirm>
                                              </AccessGuard>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  },
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
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
      {fiscalYears?.meta?.totalItems > 0 && (
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
      )}
      <CustomWorFiscalYearDrawer data-cy="org-settings-fiscal-year-drawer" />
    </div>
  );
};

export default FiscalYearListCard;
