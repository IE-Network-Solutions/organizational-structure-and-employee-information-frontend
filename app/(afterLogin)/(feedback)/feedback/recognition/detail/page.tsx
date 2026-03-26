'use client';

import TabLandingLayout from '@/components/tabLanding';
import {
  useGetAllRecognition,
  useGetAllRecognitionIds,
  useGetRecognitionById,
  useGetAllRecognitionType,
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
  Col,
  Modal,
  Popover,
  Row,
  Select,
  Space,
  Table,
  TableColumnsType,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import RecognitionTypeModal from '../_components/recognitionTypeModal';
import EmployeeRecognitionModal from '../_components/EmployeeRecognitionModal';
import CustomPagination from '@/components/customPagination';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import {
  CloseOutlined,
  DeleteOutlined,
  FilterOutlined,
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
import RecognitionDetail from '../_components/RecognitionDetail';

function DetailPage() {
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
    visible,
    visibleEmployee,
    setVisible,
    setVisibleEmployee,
    selectedRowKeys,
    setSelectedRowKeys,
    showBulkDeleteModal,
    setShowBulkDeleteModal,
  } = useRecongnitionStore();

  const { mutate: deleteRecognition, isLoading: isDeletingSingle } =
    useDeleteRecognition();
  const { mutate: deleteBulkRecognitions, isLoading: isDeleting } =
    useDeleteBulkRecognitions();
  const isSelectingAllRef = useRef(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState<
    Record<string, boolean>
  >({});
  const [filterPopoverOpen, setFilterPopoverOpen] = React.useState(false);
  const [draftFilters, setDraftFilters] = React.useState<Record<string, any>>(
    searchValue ?? {},
  );
  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  const [selectedRecognitionId, setSelectedRecognitionId] = React.useState<
    string | null
  >(null);

  const searchParams = useSearchParams();
  const navigate = useRouter();

  const { refetch: fetchAllIds } = useGetAllRecognitionIds(searchValue, false);
  const { data: allUserData } = useGetAllUsers();
  const { data: recognitionTypes } = useGetAllRecognitionType();
  const { data: getAllRecognition, isLoading } = useGetAllRecognition({
    searchValue,
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
        <span className="text-sm font-normal leading-normal text-black/70 ">
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
          <div className="flex items-center gap-2">
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
            <span className="text-sm font-normal leading-normal text-black/70 ">
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
            <div className="flex items-center gap-2 ">
              <span className="whitespace-nowrap px-2 py-.5 bg-gray-100 rounded-[4px] border border-[#D1D5DB] text-sm font-normal text-black/70">
                {firstCriteria?.name}
              </span>
              {restCount > 0 && (
                <span className="whitespace-nowrap px-2 py-.5 bg-gray-100 rounded-[4px] border border-[#D1D5DB] text-sm font-normal text-black/70">
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
          <div className="flex items-center gap-2">
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
            <span className="text-sm font-normal leading-normal text-black/70 ">
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
        <p className="text-sm font-normal leading-normal text-black/70 ">
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
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteModalOpen((prev) => ({
                    ...prev,
                    [record.id]: true,
                  }));
                }}
                className="bg-white hover:bg-gray-100 text-black border rounded-[4px] border-gray-300 w-7 h-7 flex items-center justify-center"
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

  const handleRowClick = (record: any) => {
    setSelectedRecognitionId(record?.id ?? null);
    setDetailModalOpen(true);
  };

  const handleRecognitionModal = () => {
    setVisible(true);
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
        centered
        className="md:h-[670px] md:w-[1145px]"
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

      <div className="flex items-center justify-between mb-4">
        <PageHeader
          title="Recognition Detail"
          description="Manage Recognition"
        />
        <div className="flex items-center gap-2">
          <Button
            icon={<FaArrowLeft />}
            onClick={() => navigate.push('/feedback/recognition')}
          >
            Back
          </Button>
          <Button
            type="primary"
            onClick={handleRecognitionModal}
            icon={<FaPlus />}
          >
            Recognize
          </Button>
        </div>
      </div>
      <div className="border border-gray-200 rounded-lg p-4">
        <Row gutter={[16, 16]} align="middle" className="mb-5">
          <Col flex="auto" xs={24} sm={24} md={16} lg={16}>
            <Select
              placeholder="Search Employee"
              onChange={(value) => handleSearchChange('userId', value)}
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
                <div className="border-l border-gray-200  flex items-center justify-center h-8 ">
                  {' '}
                  <SearchOutlined className="ml-2" />
                </div>
              }
              className="w-full rounded-md h-8 md:w-[300px] "
              options={allUserData?.items?.map((item: any) => ({
                value: item?.id,
                label: `${item?.firstName} ${item?.middleName} ${item?.lastName}`,
              }))}
            />
          </Col>

          <Col xs={24} sm={24} md={8} lg={8} className="flex justify-end">
            <Popover
              trigger="click"
              placement="bottomRight"
              open={filterPopoverOpen}
              onOpenChange={(open) => {
                setFilterPopoverOpen(open);
                if (open) setDraftFilters(searchValue ?? {});
              }}
              content={
                <div className="w-[570px] max-w-[92vw] py-4 px-5">
                  <div className="flex items-center justify-between mb-3 ">
                    <div className="text-base font-bold text-black/70">
                      Filter
                    </div>
                    <Button
                      type="text"
                      icon={<CloseOutlined />}
                      onClick={() => setFilterPopoverOpen(false)}
                    />
                  </div>

                  <div className="">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-sm font-normal text-black/70 mb-2">
                          Type
                        </div>
                        <Select
                          placeholder="Select"
                          allowClear
                          className="w-full h-10"
                          value={draftFilters?.recognitionTypeId || undefined}
                          onChange={(value) =>
                            setDraftFilters((prev) => ({
                              ...prev,
                              recognitionTypeId: value,
                            }))
                          }
                          options={
                            recognitionTypes?.items?.map((item: any) => ({
                              key: item?.id,
                              value: item?.id,
                              label: item?.name,
                            })) ?? []
                          }
                        />
                      </div>

                      <div>
                        <div className="text-sm font-normal text-black/70 mb-2">
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

                      <div>
                        <div className="text-sm font-normal text-black/70 mb-2">
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

                      <div>
                        <div className="text-sm font-normal text-black/70 mb-2">
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
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
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
                            'recognitionTypeId',
                            draftFilters?.recognitionTypeId,
                          );
                          handleSearchChange(
                            'calendarId',
                            draftFilters?.calendarId,
                          );
                          handleSearchChange(
                            'sessionId',
                            draftFilters?.sessionId,
                          );
                          handleSearchChange('monthId', draftFilters?.monthId);
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
              <Button className="h-8" icon={<MdOutlineFilterAlt />}>
                Filter
              </Button>
            </Popover>
          </Col>
        </Row>

        {hasSelectedRows && (
          <div className=" mb-4 flex justify-end">
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

        <div className="">
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
            rowClassName={(_, index) => (index % 2 === 1 ? 'bg-[#fafafa]' : '')}
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
          />
        </div>
      </div>

      <RecognitionTypeModal
        visible={visible}
        onCancel={() => setVisible(false)}
      />
      <EmployeeRecognitionModal
        visible={visibleEmployee}
        onCancel={() => setVisibleEmployee(false)}
      />
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
