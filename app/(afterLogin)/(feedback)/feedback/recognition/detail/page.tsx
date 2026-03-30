'use client';

import {
  useGetAllRecognitionIds,
  useGetRecognitionById,
  useGetRecognitionsByParentRecognitionType,
  useGetRecognitionTypeParentChildById,
} from '@/store/server/features/CFR/recognition/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  FiscalYear,
  Month,
  Session,
} from '@/store/server/features/organizationStructure/fiscalYear/interface';
import {
  useGetActiveFiscalYears,
  useGetAllFiscalYears,
} from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useRecongnitionStore } from '@/store/uistate/features/conversation/recognition';
import {
  Avatar,
  Button,
  Modal,
  Popover,
  Select,
  Space,
  Table,
  TableColumnsType,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import CustomPagination from '@/components/customPagination';
import {
  CloseOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import {
  useDeleteBulkRecognitions,
  useDeleteRecognition,
} from '@/store/server/features/CFR/recognition/mutation';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import DeleteConfirmationPopover from '@/components/common/deleteConfirmationPopover';
import { MdDeleteOutline, MdOutlineFilterAlt } from 'react-icons/md';
import { useMediaQuery } from 'react-responsive';
import RecognitionDetail from '../_components/RecognitionDetail';

function DetailPage() {
  const isDetailModalFullWidth = useMediaQuery({ maxWidth: 767 });
  const {
    updateSearchValue,
    searchValue,
    setSelectedRecognitionType,
    setActiveSession,
    setActiveMonthId,
    setFiscalActiveYearId,
    current,
    pageSize,
    setCurrent,
    setPageSize,
    selectedRowKeys,
    setSelectedRowKeys,
    showBulkDeleteModal,
    setShowBulkDeleteModal,
    deleteModalOpen,
    setDeleteModalOpen,
    filterPopoverOpen,
    setFilterPopoverOpen,
    draftFilters,
    setDraftFilters,
    detailModalOpen,
    setDetailModalOpen,
    selectedRecognitionId,
    setSelectedRecognitionId,
  } = useRecongnitionStore();

  const { mutate: deleteRecognition, isLoading: isDeletingSingle } =
    useDeleteRecognition();
  const { mutate: deleteBulkRecognitions, isLoading: isDeleting } =
    useDeleteBulkRecognitions();
  const isSelectingAllRef = useRef(false);

  const searchParams = useSearchParams();

  const { refetch: fetchAllIds } = useGetAllRecognitionIds(searchValue, false);
  const { data: allUserData } = useGetAllUsers();
  const { data: recognitionTypes } = useGetRecognitionTypeParentChildById(
    searchValue?.recognitionTypeId ?? '',
  );
  const { data: getAllRecognition, isLoading } =
    useGetRecognitionsByParentRecognitionType({
      parentRecognitionTypeId: searchValue?.recognitionTypeId ?? '',
      calendarId: searchValue?.calendarId ?? '',
      sessionId: searchValue?.sessionId ?? '',
      monthId: searchValue?.monthId ?? '',
      recognitionTypeId: searchValue?.childRecognitionTypeId ?? '',
      userId: searchValue?.userId ?? '',
      current,
      pageSize,
    });
  const { data: selectedRecognition, isLoading: isSelectedRecognitionLoading } =
    useGetRecognitionById(selectedRecognitionId ?? '');
  const { data: getActiveFisicalYear } = useGetActiveFiscalYears();
  const { data: getAllFisicalYear } = useGetAllFiscalYears();

  useEffect(() => {
    const typeId = searchParams.get('recognitionTypeId') ?? '';
    setSelectedRecognitionType(typeId || '1');
    updateSearchValue('recognitionTypeId', typeId);
    setCurrent(1);
  }, [searchParams, setCurrent, setSelectedRecognitionType, updateSearchValue]);

  useEffect(() => {
    if (getActiveFisicalYear) {
      const fiscalActiveYearId = getActiveFisicalYear?.id;
      const activeSession = getActiveFisicalYear?.sessions?.find(
        (item: Session) => item.active,
      );

      let activeMonthId = '';
      if (activeSession) {
        const activeMonth = activeSession.months?.find(
          (item: Month) => item.active,
        );
        activeMonthId = activeMonth?.id ?? '';
      }

      setFiscalActiveYearId(fiscalActiveYearId ?? '');
      setActiveMonthId(activeMonthId);
      setActiveSession(activeSession?.id ?? '');
    }
  }, [
    getActiveFisicalYear,
    setActiveMonthId,
    setActiveSession,
    setFiscalActiveYearId,
  ]);

  const getEmployeeData = (employeeId: string) => {
    const employeeDataDetail = allUserData?.items?.find(
      (emp: any) => emp?.id === employeeId,
    );
    return employeeDataDetail || {};
  };

  const handleDeleteConfirm = (id: string) => {
    deleteRecognition(id, {
      onSuccess: () => {
        setDeleteModalOpen((prev) => ({ ...prev, [id]: false }));
      },
    });
  };

  const handleDeleteCancel = (id: string) => {
    setDeleteModalOpen((prev) => ({ ...prev, [id]: false }));
  };

  const handleBulkDelete = () => {
    if (selectedRowKeys && selectedRowKeys.length > 0) {
      deleteBulkRecognitions(
        { ids: selectedRowKeys as string[] },
        {
          onSuccess: () => {
            setSelectedRowKeys([]);
            setShowBulkDeleteModal(false);
          },
        },
      );
    }
  };

  const hasSelectedRows = selectedRowKeys && selectedRowKeys.length > 0;

  const columns: TableColumnsType<any> = [
    {
      title: 'Recognition',
      dataIndex: 'recognition',
      render: (notused, record) => (
        <span
          className="text-sm font-normal leading-normal text-black/70 "
          data-cy={`recognition-history-col-type-${record.id}`}
        >
          {record.recognitionType?.name ?? '-'}
        </span>
      ),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Employees',
      dataIndex: 'employee',
      render: (notused, record) => {
        const employee = record.recipientId
          ? getEmployeeData(record.recipientId)
          : null;
        const name = employee
          ? `${employee.firstName ?? '-'} ${employee.middleName ?? '-'} `
          : '-';
        const avatarUrl = employee?.profileImage; // update property name if it's different, e.g., employee?.avatar
        return record.recipientId ? (
          <div
            className="flex items-center gap-2"
            data-cy={`recognition-history-col-employee-${record.id}`}
          >
            {avatarUrl ? (
              // Avatar image if exists
              <Avatar
                src={avatarUrl}
                alt={name}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              // Fallback icon if no image
              <Avatar
                icon={<UserOutlined />}
                className="w-7 h-7 rounded-full object-cover"
              />
            )}
            <span
              className="text-sm font-normal leading-normal text-black/70 "
              data-cy={`recognition-history-col-employee-name-${record.id}`}
            >
              {name}
            </span>
          </div>
        ) : (
          '-'
        );
      },
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Criteria',
      dataIndex: 'criteriaScore',
      render: (unused, record) => {
        // Only show if there is at least one criteria
        if (record?.criteriaScore?.length > 0) {
          // Show the first criteria, and if more than one, show "+N"
          const firstCriteria = record.criteriaScore[0];
          const restCount = record.criteriaScore.length - 1;
          return (
            <div
              className="flex items-center gap-2 "
              data-cy={`recognition-history-col-criteria-${record.id}`}
            >
              <span
                className="whitespace-nowrap px-2 py-.5 bg-gray-100 rounded-[4px] border border-[#D1D5DB] text-sm font-normal text-black/70"
                data-cy={`recognition-history-col-criteria-first-${record.id}`}
              >
                {firstCriteria?.name}
              </span>
              {restCount > 0 && (
                <span
                  className="whitespace-nowrap px-2 py-.5 bg-gray-100 rounded-[4px] border border-[#D1D5DB] text-sm font-normal text-black/70"
                  data-cy={`recognition-history-col-criteria-more-${record.id}`}
                >
                  +{restCount}
                </span>
              )}
            </div>
          );
        } else {
          return '-';
        }
      },
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Date Issued',
      dataIndex: 'dateIssued',
      render: (notused, record) =>
        record?.dateIssued
          ? (dayjs(record?.dateIssued).format('MMMM DD YYYY') ?? '-')
          : '-',
    },
    {
      title: 'Issued By',
      dataIndex: 'createdBy',
      render: (notused, record) => {
        const employee = record.issuerId
          ? getEmployeeData(record.issuerId)
          : null;
        const name = employee
          ? `${employee.firstName ?? '-'} ${employee.middleName ?? '-'} `
          : '-';
        const avatarUrl = employee?.profileImage; // update property name if it's different, e.g., employee?.avatar
        return record.issuerId ? (
          <div
            className="flex items-center gap-2"
            data-cy={`recognition-history-col-issuer-${record.id}`}
          >
            {avatarUrl ? (
              <Avatar
                src={avatarUrl}
                alt={name}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <Avatar
                icon={<UserOutlined />}
                className="w-7 h-7 rounded-full object-cover"
              />
            )}
            <span
              className="text-sm font-normal leading-normal text-black/70 "
              data-cy={`recognition-history-col-issuer-name-${record.id}`}
            >
              {name}
            </span>
          </div>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Details',
      dataIndex: 'description',
      render: (notused, record) => (
        <p
          className="text-sm font-normal leading-normal text-black/70 "
          data-cy={`recognition-history-col-details-${record.id}`}
        >
          {record?.recognitionType?.description ?? '-'}
        </p>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (unused: any, record: any) => (
        <Space size="middle" onClick={(e) => e.stopPropagation()}>
          <AccessGuard permissions={[Permissions.DeleteRecognition]}>
            <DeleteConfirmationPopover
              open={deleteModalOpen[record.id] || false}
              onCancel={() => handleDeleteCancel(record.id)}
              onConfirm={() => handleDeleteConfirm(record.id)}
              message="Are you sure you want to permanently delete this record?"
              loading={isDeletingSingle}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteModalOpen((prev) => ({
                    ...prev,
                    [record.id]: true,
                  }));
                }}
                className="bg-white hover:bg-gray-100 text-black border rounded-[4px] border-gray-300 w-7 h-7 flex items-center justify-center"
                data-cy={`recognition-history-delete-trigger-${record.id}`}
              >
                <MdDeleteOutline />
              </button>
            </DeleteConfirmationPopover>
          </AccessGuard>
        </Space>
      ),
    },
  ];

  const currentPageIds = (getAllRecognition?.items || []).map((item: any) =>
    String(item.id),
  );
  const currentPageSelectedKeys = (selectedRowKeys || []).filter((key) =>
    currentPageIds.includes(String(key)),
  );

  const rowSelection = {
    selectedRowKeys: currentPageSelectedKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      if (isSelectingAllRef.current) return;

      const existingSelected = (selectedRowKeys || []).map(String);
      const otherPagesSelected = existingSelected.filter(
        (key) => !currentPageIds.includes(key),
      );
      const newSelectedStrings = newSelectedRowKeys.map(String);
      setSelectedRowKeys([...otherPagesSelected, ...newSelectedStrings]);
    },
    onSelectAll: (selected: boolean) => {
      isSelectingAllRef.current = true;

      if (selected) {
        fetchAllIds()
          .then((response) => {
            if (response.data?.items) {
              const allIds = response.data.items.map((item: any) =>
                String(item.id),
              );
              const existingSelected = (selectedRowKeys || []).map(String);
              const allSelected =
                allIds.length > 0 &&
                allIds.every((id: string) => existingSelected.includes(id)) &&
                existingSelected.length === allIds.length;

              setSelectedRowKeys(allSelected ? [] : allIds);
            }
            setTimeout(() => {
              isSelectingAllRef.current = false;
            }, 100);
          })
          .catch(() => {
            const existingSelected = (selectedRowKeys || []).map(String);
            const allCurrentPageSelected =
              currentPageIds.length > 0 &&
              currentPageIds.every((id: string) =>
                existingSelected.includes(id),
              );

            const otherPagesSelected = existingSelected.filter(
              (key) => !currentPageIds.includes(key),
            );
            setSelectedRowKeys(
              allCurrentPageSelected
                ? otherPagesSelected
                : [...otherPagesSelected, ...currentPageIds],
            );
            setTimeout(() => {
              isSelectingAllRef.current = false;
            }, 100);
          });
      } else {
        setSelectedRowKeys([]);
        setTimeout(() => {
          isSelectingAllRef.current = false;
        }, 100);
      }
    },
  };

  const handleSearchChange = (key: string, value: string) => {
    updateSearchValue(key, value);
  };

  const activeFilterChips = useMemo(() => {
    const chips: {
      id: string;
      label: string;
      onRemove: () => void;
    }[] = [];
    const sv = searchValue ?? {};

    if (sv.childRecognitionTypeId) {
      const name =
        recognitionTypes?.find((t: any) => t.id === sv.childRecognitionTypeId)
          ?.name ?? 'Type';
      chips.push({
        id: 'type',
        label: name,
        onRemove: () => {
          updateSearchValue('childRecognitionTypeId', '');
          setCurrent(1);
        },
      });
    }
    if (sv.calendarId) {
      const year = getAllFisicalYear?.items?.find(
        (y: FiscalYear) => y.id === sv.calendarId,
      );
      chips.push({
        id: 'year',
        label: year?.name ?? 'Year',
        onRemove: () => {
          updateSearchValue('calendarId', '');
          updateSearchValue('sessionId', '');
          updateSearchValue('monthId', '');
          setCurrent(1);
        },
      });
    }
    if (sv.sessionId) {
      const cal = getAllFisicalYear?.items?.find(
        (y: FiscalYear) => y.id === sv.calendarId,
      );
      const session = cal?.sessions?.find(
        (s: Session) => s.id === sv.sessionId,
      );
      chips.push({
        id: 'session',
        label: session?.name ?? 'Session',
        onRemove: () => {
          updateSearchValue('sessionId', '');
          updateSearchValue('monthId', '');
          setCurrent(1);
        },
      });
    }
    if (sv.monthId) {
      const cal = getAllFisicalYear?.items?.find(
        (y: FiscalYear) => y.id === sv.calendarId,
      );
      const sess = cal?.sessions?.find((s: Session) => s.id === sv.sessionId);
      const month = sess?.months?.find((m: Month) => m.id === sv.monthId);
      chips.push({
        id: 'month',
        label: month?.name ?? 'Month',
        onRemove: () => {
          updateSearchValue('monthId', '');
          setCurrent(1);
        },
      });
    }
    return chips;
  }, [
    searchValue,
    recognitionTypes,
    getAllFisicalYear,
    updateSearchValue,
    setCurrent,
  ]);

  const handleRowClick = (record: any) => {
    setSelectedRecognitionId(record?.id ?? null);
    setDetailModalOpen(true);
  };

  return (
    <div className="" data-cy="recognition-detail-page">
      <Modal
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedRecognitionId(null);
        }}
        footer={null}
        centered={false}
        width={isDetailModalFullWidth ? '100%' : 1145}
        wrapClassName={isDetailModalFullWidth ? '!p-0' : undefined}
        styles={
          isDetailModalFullWidth
            ? {
                content: {
                  margin: 0,
                  maxWidth: '100vw',
                  width: '100%',
                  borderRadius: 16,
                },
              }
            : undefined
        }
        className={
          isDetailModalFullWidth
            ? '!w-full !max-w-full h-[min(670px,90dvh)] max-h-[90dvh] overflow-y-auto scrollbar-none !rounded-none'
            : '!w-[1145px] !max-w-[calc(100vw-2rem)] h-[670px] overflow-y-auto scrollbar-none'
        }
        destroyOnClose
        closeIcon={null}
      >
        <RecognitionDetail
          loading={isSelectedRecognitionLoading}
          recognition={selectedRecognition}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedRecognitionId(null);
          }}
        />
      </Modal>

      <div
        className="border border-gray-200 rounded-lg p-4"
        data-cy="recognition-history-filters-card"
      >
        <div
          className="flex items-center justify-between gap-4 mb-4"
          data-cy="recognition-history-filters-row"
        >
          <div
            data-cy="recognition-history-employee-search-container"
            className="min-w-0 w-full md:flex-1 md:max-w-xl lg:max-w-2xl"
          >
            <Select
              placeholder="Search Employee"
              value={searchValue?.userId || undefined}
              onChange={(value) => {
                handleSearchChange('userId', value ?? '');
                setCurrent(1);
              }}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              size="large"
              suffixIcon={
                <div
                  className="flex h-8 items-center justify-center border-l border-gray-200 pl-2"
                  data-cy="recognition-history-employee-search-suffix"
                >
                  <SearchOutlined className="ml-1" />
                </div>
              }
              className="md:w-[300px] w-full  h-8"
              options={allUserData?.items?.map((item: any) => ({
                value: item?.id,
                label: `${item?.firstName} ${item?.middleName} ${item?.lastName}`,
              }))}
              data-cy="recognition-history-employee-search"
            />
          </div>

          <div
            data-cy="recognition-history-filters-actions-container"
            className="flex flex-wrap items-center justify-start gap-2 md:justify-end"
          >
            <div
              data-cy="recognition-history-filters-actions-chips-container"
              className="md:flex gap-2  hidden"
            >
              {activeFilterChips.map((chip) => (
                <div
                  key={chip.id}
                  className="inline-flex max-w-full items-center gap-0.5 rounded-lg border border-gray-200 bg-white py-1 pl-2.5 pr-1 text-sm font-normal text-black/70"
                  data-cy={`recognition-history-filter-chip-${chip.id}`}
                >
                  <span
                    data-cy="recognition-history-filter-chip-label"
                    className="truncate"
                  >
                    {chip.label}
                  </span>
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-black/45 hover:bg-gray-100 hover:text-black/70"
                    aria-label={`Remove ${chip.label}`}
                    data-cy={`recognition-history-filter-chip-remove-${chip.id}`}
                  >
                    <CloseOutlined className="text-[10px]" />
                  </button>
                </div>
              ))}
            </div>
            <Popover
              trigger="click"
              placement="bottomRight"
              open={filterPopoverOpen}
              onOpenChange={(open) => {
                setFilterPopoverOpen(open);
                if (open) setDraftFilters(searchValue ?? {});
              }}
              content={
                <div
                  className="md:w-[570px] w-[320px] py-4 px-5"
                  data-cy="recognition-history-filter-popover"
                >
                  <div
                    className="flex items-center justify-between mb-3 "
                    data-cy="recognition-history-filter-popover-header"
                  >
                    <div
                      className="text-base font-bold text-black/70"
                      data-cy="recognition-history-filter-popover-title"
                    >
                      Filter
                    </div>
                    <Button
                      type="text"
                      icon={<CloseOutlined />}
                      onClick={() => setFilterPopoverOpen(false)}
                    />
                  </div>

                  <div
                    className=""
                    data-cy="recognition-history-filter-popover-body"
                  >
                    <div
                      className="grid grid-cols-1 md:grid-cols-2 gap-3"
                      data-cy="recognition-history-filter-grid"
                    >
                      <div data-cy="recognition-history-filter-type-field">
                        <div
                          className="text-sm font-normal text-black/70 mb-2"
                          data-cy="recognition-history-filter-type-label"
                        >
                          Type
                        </div>
                        <Select
                          placeholder="Select"
                          allowClear
                          className="w-full h-10"
                          value={
                            draftFilters?.childRecognitionTypeId || undefined
                          }
                          onChange={(value) =>
                            setDraftFilters((prev) => ({
                              ...prev,
                              childRecognitionTypeId: value,
                            }))
                          }
                          options={
                            recognitionTypes?.map((item: any) => ({
                              key: item?.id,
                              value: item?.id,
                              label: item?.name,
                            })) ?? []
                          }
                        />
                      </div>
                      <div data-cy="recognition-history-filter-year-field">
                        <div
                          className="text-sm font-normal text-black/70 mb-2"
                          data-cy="recognition-history-filter-year-label"
                        >
                          Year
                        </div>
                        <Select
                          placeholder="Select"
                          allowClear
                          className="w-full h-10"
                          value={draftFilters?.calendarId || undefined}
                          onChange={(value) =>
                            setDraftFilters((prev) => ({
                              ...prev,
                              calendarId: value,
                              sessionId: undefined,
                              monthId: undefined,
                            }))
                          }
                          options={
                            getAllFisicalYear?.items?.map((item: any) => ({
                              key: item?.id,
                              value: item?.id,
                              label: item?.name,
                            })) ?? []
                          }
                        />
                      </div>

                      <div data-cy="recognition-history-filter-session-field">
                        <div
                          className="text-sm font-normal text-black/70 mb-2"
                          data-cy="recognition-history-filter-session-label"
                        >
                          Session
                        </div>
                        <Select
                          placeholder="Select"
                          allowClear
                          className="w-full h-10"
                          value={draftFilters?.sessionId || undefined}
                          onChange={(value) =>
                            setDraftFilters((prev) => ({
                              ...prev,
                              sessionId: value,
                              monthId: undefined,
                            }))
                          }
                          options={
                            getAllFisicalYear?.items
                              ?.find(
                                (item: FiscalYear) =>
                                  item?.id === draftFilters?.calendarId,
                              )
                              ?.sessions?.map((session: Session) => ({
                                key: session?.id,
                                value: session?.id,
                                label: session?.name,
                              })) ?? []
                          }
                        />
                      </div>
                      <div data-cy="recognition-history-filter-month-field">
                        <div
                          className="text-sm font-normal text-black/70 mb-2"
                          data-cy="recognition-history-filter-month-label"
                        >
                          Month
                        </div>
                        <Select
                          placeholder="Select"
                          allowClear
                          className="w-full h-10"
                          value={draftFilters?.monthId || undefined}
                          onChange={(value) =>
                            setDraftFilters((prev) => ({
                              ...prev,
                              monthId: value,
                            }))
                          }
                          options={
                            getAllFisicalYear?.items
                              ?.find(
                                (item: FiscalYear) =>
                                  item?.id === draftFilters?.calendarId,
                              )
                              ?.sessions?.find(
                                (item: Session) =>
                                  item?.id === draftFilters?.sessionId,
                              )
                              ?.months?.map((month: Month) => ({
                                key: month?.id,
                                value: month?.id,
                                label: month?.name,
                              })) ?? []
                          }
                        />
                      </div>
                    </div>

                    <div
                      className="flex items-center justify-end gap-3 pt-4"
                      data-cy="recognition-history-filter-actions"
                    >
                      <Button
                        onClick={() => {
                          setDraftFilters(searchValue ?? {});
                          setFilterPopoverOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => {
                          handleSearchChange(
                            'childRecognitionTypeId',
                            (draftFilters?.childRecognitionTypeId as string) ??
                              '',
                          );
                          handleSearchChange(
                            'calendarId',
                            (draftFilters?.calendarId as string) ?? '',
                          );
                          handleSearchChange(
                            'sessionId',
                            (draftFilters?.sessionId as string) ?? '',
                          );
                          handleSearchChange(
                            'monthId',
                            (draftFilters?.monthId as string) ?? '',
                          );
                          setCurrent(1);
                          setFilterPopoverOpen(false);
                        }}
                      >
                        Filter
                      </Button>
                    </div>
                  </div>
                </div>
              }
            >
              <button
                type="button"
                className="inline-flex h-8 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-normal text-black/70 hover:border-gray-300 hover:bg-gray-50"
                data-cy="recognition-history-filter-trigger"
              >
                <MdOutlineFilterAlt className="text-lg text-black/55" />
                Filter
              </button>
            </Popover>
          </div>
        </div>

        {hasSelectedRows && (
          <div
            className=" mb-4 flex justify-end"
            data-cy="recognition-history-bulk-delete-row"
          >
            <AccessGuard permissions={[Permissions.DeleteRecognition]}>
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={() => setShowBulkDeleteModal(true)}
                loading={isDeleting}
              >
                Delete Selected ({selectedRowKeys.length})
              </Button>
            </AccessGuard>
          </div>
        )}

        <div className="" data-cy="recognition-history-table-section">
          <Table<any>
            rowSelection={{ type: 'checkbox', ...rowSelection }}
            rowKey="id"
            columns={columns}
            dataSource={getAllRecognition?.items ?? []}
            pagination={false}
            scroll={{ x: 1200 }}
            className="cursor-pointer"
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
            loading={isLoading}
            rowClassName={(unusedRecord, rowIndex) => {
              void unusedRecord;
              return rowIndex % 2 === 1 ? 'bg-[#fafafa]' : '';
            }}
          />
          <CustomPagination
            current={getAllRecognition?.meta?.currentPage || 1}
            total={getAllRecognition?.meta?.totalItems || 1}
            pageSize={pageSize}
            onChange={(page, size) => {
              setCurrent(page);
              setPageSize(size);
            }}
            onShowSizeChange={(size) => {
              setPageSize(size);
              setCurrent(1);
            }}
            data-cy="recognition-history-pagination"
          />
        </div>
      </div>

      <DeleteModal
        open={showBulkDeleteModal}
        onCancel={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        deleteMessage={`Are you sure you want to permanently delete ${selectedRowKeys?.length || 0} selected record(s)? This action cannot be undone.`}
        loading={isDeleting}
      />
    </div>
  );
}

export default DetailPage;
