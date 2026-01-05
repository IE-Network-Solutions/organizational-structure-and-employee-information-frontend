'use client';
import TabLandingLayout from '@/components/tabLanding';
import {
  useGetAllRecognition,
  useGetAllRecognitionData,
  useGetTotalRecognition,
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
  Button,
  Card,
  Col,
  Row,
  Select,
  Table,
  TableColumnsType,
  Tabs,
  Space,
} from 'antd';
import { TabsProps } from 'antd/lib';
import dayjs from 'dayjs';
import React, { useEffect, useRef } from 'react';
import { CiMedal } from 'react-icons/ci';
import { useRouter } from 'next/navigation';
import RecognitionTypeModal from './_components/recognitionTypeModal';
import EmployeeRecognitionModal from './_components/EmployeeRecognitionModal';
import CustomPagination from '@/components/customPagination';
import { FaPlus } from 'react-icons/fa';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { DeleteOutlined } from '@ant-design/icons';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import {
  useDeleteRecognition,
  useDeleteBulkRecognitions,
} from '@/store/server/features/CFR/recognition/mutation';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import DeleteConfirmationPopover from '@/components/common/deleteConfirmationPopover';
import { useGetAllRecognitionIds } from '@/store/server/features/CFR/recognition/queries';
function Page() {
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

  const { refetch: fetchAllIds } = useGetAllRecognitionIds(
    searchValue,
    false, // Always disabled, we'll use refetch manually
  );
  const { data: allUserData } = useGetAllUsers();
  const { data: recognitionType } = useGetAllRecognitionData();
  const { data: totalRecogniion } = useGetTotalRecognition();
  const { data: getAllRecognition, isLoading } = useGetAllRecognition({
    searchValue,
    current,
    pageSize,
  });
  const { data: getActiveFisicalYear } = useGetActiveFiscalYears();
  const { data: getAllFisicalYear } = useGetAllFiscalYears();
  const navigate = useRouter();
  useEffect(() => {
    if (getActiveFisicalYear) {
      const fiscalActiveYearId = getActiveFisicalYear?.id;
      const activeSession = getActiveFisicalYear?.sessions?.find(
        (item: Session) => item.active,
      );

      let activeMonthId = ''; // Default value in case no active month is found
      if (activeSession) {
        const activeMonth = activeSession.months?.find(
          (item: Month) => item.active,
        );
        activeMonthId = activeMonth?.id ?? '';
      }

      // Update state values
      setFiscalActiveYearId(fiscalActiveYearId ?? '');
      setActiveMonthId(activeMonthId);
      setActiveSession(activeSession?.id ?? '');
    }
  }, [getActiveFisicalYear]);

  const getEmployeeData = (employeeId: string) => {
    const employeeDataDetail = allUserData?.items?.find(
      (emp: any) => emp?.id === employeeId,
    );
    return employeeDataDetail || {}; // Return an empty object if employeeDataDetail is undefined
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
      render: (notused, record) => record.recognitionType?.name ?? '-',
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Employees',
      dataIndex: 'employee',
      render: (notused, record) =>
        record.recipientId
          ? `${getEmployeeData(record.recipientId)?.firstName ?? '-'} ${getEmployeeData(record.recipientId)?.middleName ?? '-'} ${getEmployeeData(record.recipientId)?.lastName ?? '-'}`
          : '-',
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Criteria',
      dataIndex: 'criteriaScore',
      render: (unused, record) =>
        record?.criteriaScore?.length ? (
          <div
            className="flex gap-2 max-w-[400px] overflow-x-auto scrollbar-hide"
            data-cy={`recognition-criteria-container-${record.id}`}
          >
            {record.criteriaScore.map((criteria: any, index: number) => (
              <span
                key={index}
                className="whitespace-nowrap px-2 py-1 bg-gray-100 rounded text-sm flex-shrink-0"
                data-cy={`recognition-criteria-item-${record.id}-${index}`}
              >
                {criteria?.name}
              </span>
            ))}
          </div>
        ) : (
          '-'
        ),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      width: 450,
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
      render: (notused, record) =>
        record.issuerId
          ? `${getEmployeeData(record.issuerId)?.firstName ?? '-'} ${getEmployeeData(record.issuerId)?.middleName ?? '-'} ${getEmployeeData(record.issuerId)?.lastName ?? '-'}`
          : 'system',
    },
    {
      title: 'Details',
      dataIndex: 'description',
      render: (notused, record) => (
        <p data-cy={`recognition-details-${record.id}`}>
          {record?.recognitionType?.description ?? '-'}
        </p>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 100,
      render: (unused: any, record: any) => (
        <Space
          size="middle"
          onClick={(e) => e.stopPropagation()}
          id={`recognition-table-actions-${record.id}`}
          data-cy={`recognition-table-actions-${record.id}`}
        >
          <AccessGuard
            permissions={[Permissions.DeleteRecognition]}
            id={`recognition-table-delete-guard-${record.id}`}
            data-cy={`recognition-table-delete-guard-${record.id}`}
          >
            <DeleteConfirmationPopover
              open={deleteModalOpen[record.id] || false}
              onCancel={() => handleDeleteCancel(record.id)}
              onConfirm={() => handleDeleteConfirm(record.id)}
              message="Are you sure you want to permanently delete this record?"
              loading={isDeletingSingle}
              id={`recognition-delete-modal-${record.id}`}
              data-cy={`recognition-delete-modal-${record.id}`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteModalOpen((prev) => ({
                    ...prev,
                    [record.id]: true,
                  }));
                }}
                className="bg-red-600 hover:bg-red-700 text-white rounded w-8 h-8 flex items-center justify-center"
                id={`recognition-table-delete-button-${record.id}`}
                data-cy={`recognition-table-delete-button-${record.id}`}
              >
                <DeleteOutlined className="text-white" />
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
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'All',
      children: (
        <>
          <div
            className="flex justify-between items-center mb-4"
            data-cy="recognition-header-container"
            id="recognitionHeaderContainer"
          >
            <PageHeader
              title="Recognition"
              description="Manage Recognition"
              data-cy="recognition-header-page-header"
            />

            <div
              className="flex items-center space-x-2"
              data-cy="recognition-actions-container"
              id="recognitionActionsContainer"
            >
              <Button
                type="primary"
                onClick={handleRecognitionModal}
                icon={<FaPlus />}
                className="h-10 w-10 sm:w-auto"
                data-cy="recognition-recognize-button"
                id="recognitionRecognizeButton"
              >
                <span
                  className="hidden sm:inline"
                  data-cy="recognition-recognize-button-text"
                  id="recognitionRecognizeButtonText"
                >
                  Recognize
                </span>
              </Button>
            </div>
          </div>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            data-cy="recognition-stats-container"
            id="recognitionStatsContainer"
          >
            <Card
              className="bg-[#fafafa] font-bold"
              key={`all-card-${1}`}
              style={{ width: '100%' }}
              data-cy="recognition-total-employees-card"
              id="recognitionTotalEmployeesCard"
            >
              <div
                className="bg-[#f3f1f9] h-8 w-8 rounded-full flex justify-center items-center"
                data-cy="recognition-total-employees-icon"
                id="recognitionTotalEmployeesIcon"
              >
                <CiMedal fill="#0BA259" />
              </div>
              <p
                className="text-gray-400 text-xs font-normal  mt-4"
                data-cy="recognition-total-employees-label"
                id="recognitionTotalEmployeesLabel"
              >
                Total number of recognized employees
              </p>
              <p
                className="text-3xl"
                data-cy="recognition-total-employees-value"
                id="recognitionTotalEmployeesValue"
              >{`0${totalRecogniion?.totalRecognitions ?? 0}`}</p>
            </Card>
            <Card
              className="bg-[#fafafa] font-bold"
              key={`all-card-${2}`}
              style={{ width: '100%' }}
              data-cy="recognition-total-criteria-card"
              id="recognitionTotalCriteriaCard"
            >
              <div
                className="bg-[#f3f1f9] h-8 w-8 rounded-full flex justify-center items-center"
                data-cy="recognition-total-criteria-icon-wrapper"
                id="recognitionTotalCriteriaIconWrapper"
              >
                <CiMedal
                  fill="#0BA259"
                  data-cy="recognition-total-criteria-icon"
                  id="recognitionTotalCriteriaIcon"
                />
              </div>
              <p
                className="text-gray-400 text-xs font-normal mt-4"
                data-cy="recognition-total-criteria-label"
                id="recognitionTotalCriteriaLabel"
              >
                Total number of Criteria
              </p>
              <p
                className="text-3xl"
                data-cy="recognition-total-criteria-value"
                id="recognitionTotalCriteriaValue"
              >{`0${totalRecogniion?.totalCriteria ?? 0}`}</p>
            </Card>
          </div>
        </>
      ),
    },
    ...(recognitionType?.items?.map((item: any) => ({
      key: item.id,
      label: item.name,
      children: (
        <PageHeader
          title="Recognition"
          description="Manage Recognition"
          data-cy="recognition-type-header"
        />
      ),
    })) || []), // Fallback to an empty array if recognitionType?.items is undefined
  ];

  const handleSearchChange = (key: string, value: string) => {
    updateSearchValue(key, value);
  };
  const handleRowClick = (record: any) => {
    navigate.push(`/feedback/recognition/${record.id}`);
  };
  function handleRecognitionModal() {
    setVisible(true);
  }
  return (
    <div data-cy="recognition-page" id="recognitionPage">
      <Tabs
        className="ml-[3%] max-w-[90%]"
        defaultActiveKey="1"
        items={items}
        onChange={(key) => {
          setSelectedRecognitionType(key);
          // Update search value with recognition type ID for filtering
          if (key !== '1') {
            updateSearchValue('recognitionTypeId', key);
          } else {
            // Remove recognition type filter for "All" tab
            updateSearchValue('recognitionTypeId', '');
          }
        }}
        data-cy="recognition-tabs"
        id="recognitionTabs"
      />
      <>
        <TabLandingLayout
          id="conversationLayoutId"
          data-cy="conversation-layout"
          // onClickHandler={() => {
          //   const recognitionTypeId = selectedRecognitionType;
          //   // Correcting how the object is passed
          //   fiscalActiveYearId &&
          //     activeMonthId &&
          //     createRecognition({
          //       recognitionTypeId,
          //       calendarId: fiscalActiveYearId,
          //       sessionId: activeSessionId, // Assigning directly
          //       monthId: activeMonthId, // Assigning directly
          //     });
          // }}

          // buttonDisabled={
          //   !fiscalActiveYearId || !activeMonthId || !activeSessionId
          // }
          // disabledMessage={'make sure you have active session'}
          // buttonTitle={
          //   selectedRecognitionType !== '1' ? 'Generate Recognition' : false
          // }
          // buttonIcon={<PlusIcon />}
        >
          <Row
            gutter={[16, 24]}
            justify="space-between"
            align="middle"
            className="mb-5 px-6"
            data-cy="recognition-filters-row"
            id="recognitionFiltersRow"
          >
            <Col
              lg={9}
              md={9}
              xs={20}
              sm={20}
              flex="auto"
              data-cy="recognition-employee-filter-col"
              id="recognitionEmployeeFilterCol"
            >
              <Select
                placeholder="Search by Employee"
                onChange={(value) => handleSearchChange('userId', value)}
                allowClear
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                className="w-full h-14 rounded-lg"
                options={allUserData?.items?.map((item: any) => ({
                  value: item?.id,
                  label: `${item?.firstName} ${item?.middleName} ${item?.lastName}`,
                }))}
                data-cy="recognition-employee-filter-select"
                id="recognitionEmployeeFilterSelect"
              />
            </Col>

            <Col
              lg={5}
              md={5}
              xs={20}
              sm={20}
              flex="auto"
              data-cy="recognition-year-filter-col"
              id="recognitionYearFilterCol"
            >
              <Select
                placeholder="filter by year"
                onChange={(value) => handleSearchChange('calendarId', value)}
                allowClear
                className="w-full h-14 rounded-lg"
                options={
                  getAllFisicalYear?.items?.map((item: any) => ({
                    key: item?.id,
                    value: item?.id,
                    label: item?.name,
                  })) ?? []
                }
                data-cy="recognition-year-filter-select"
                id="recognitionYearFilterSelect"
              />
            </Col>

            <Col
              lg={5}
              md={5}
              xs={20}
              sm={20}
              flex="auto"
              data-cy="recognition-session-filter-col"
              id="recognitionSessionFilterCol"
            >
              <Select
                placeholder="Select by session"
                onChange={(value) => handleSearchChange('sessionId', value)}
                allowClear
                className="w-full h-14 rounded-lg"
                options={
                  getAllFisicalYear?.items
                    ?.find(
                      (item: FiscalYear) =>
                        item?.id === searchValue?.calendarId,
                    )
                    ?.sessions?.map((session: Session) => ({
                      key: session?.id,
                      value: session?.id,
                      label: session?.name,
                    })) ?? []
                }
                data-cy="recognition-session-filter-select"
                id="recognitionSessionFilterSelect"
              />
            </Col>

            <Col
              lg={5}
              md={5}
              xs={20}
              sm={20}
              flex="auto"
              data-cy="recognition-month-filter-col"
              id="recognitionMonthFilterCol"
            >
              <Select
                placeholder="filter by month"
                onChange={(value) => handleSearchChange('monthId', value)}
                allowClear
                className="w-full h-14 rounded-lg"
                options={
                  getAllFisicalYear?.items
                    ?.find(
                      (item: FiscalYear) =>
                        item?.id === searchValue?.calendarId,
                    )
                    ?.sessions?.find(
                      (item: Session) => item?.id === searchValue?.sessionId,
                    )
                    ?.months?.map((month: Month) => ({
                      key: month?.id,
                      value: month?.id,
                      label: month?.name,
                    })) ?? []
                }
                data-cy="recognition-month-filter-select"
                id="recognitionMonthFilterSelect"
              />
            </Col>
          </Row>
          {hasSelectedRows && (
            <div
              id="recognition-bulk-delete-container"
              data-cy="recognition-bulk-delete-container"
              className="px-6 mb-4 flex justify-end"
            >
              <AccessGuard
                permissions={[Permissions.DeleteRecognition]}
                id="recognition-bulk-delete-guard"
                data-cy="recognition-bulk-delete-guard"
              >
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => setShowBulkDeleteModal(true)}
                  loading={isDeleting}
                  id="recognition-bulk-delete-button"
                  data-cy="recognition-bulk-delete-button"
                >
                  Delete Selected ({selectedRowKeys.length})
                </Button>
              </AccessGuard>
            </div>
          )}
          <div className="px-6">
            <Table<any>
              rowSelection={{ type: 'checkbox', ...rowSelection }}
              rowKey="id"
              columns={columns}
              dataSource={getAllRecognition?.items ?? []}
              pagination={false}
              scroll={{ x: 1200 }}
              className="cursor-pointer"
              onRow={(record) => ({
                onClick: () => handleRowClick(record), // Add click handler
              })}
              loading={isLoading}
              data-cy="recognition-table"
              id="recognitionTable"
            />
            <CustomPagination
              current={getAllRecognition?.meta?.currentPage || 1}
              total={getAllRecognition?.meta?.totalItems || 1}
              pageSize={pageSize}
              onChange={(page, pageSize) => {
                setCurrent(page);
                setPageSize(pageSize);
              }}
              onShowSizeChange={(size) => {
                setPageSize(size);
                setCurrent(1);
              }}
              data-cy="recognition-pagination"
            />
          </div>
        </TabLandingLayout>
        <RecognitionTypeModal
          visible={visible}
          onCancel={() => setVisible(false)}
          data-cy="recognition-type-modal"
        />
        <EmployeeRecognitionModal
          visible={visibleEmployee}
          onCancel={() => setVisibleEmployee(false)}
          data-cy="employee-recognition-modal"
        />
        <DeleteModal
          open={showBulkDeleteModal}
          onCancel={() => setShowBulkDeleteModal(false)}
          onConfirm={handleBulkDelete}
          deleteMessage={`Are you sure you want to permanently delete ${selectedRowKeys?.length || 0} selected record(s)? This action cannot be undone.`}
          loading={isDeleting}
          id="recognition-bulk-delete-modal"
          data-cy="recognition-bulk-delete-modal"
        />
      </>
    </div>
  );
}

export default Page;
