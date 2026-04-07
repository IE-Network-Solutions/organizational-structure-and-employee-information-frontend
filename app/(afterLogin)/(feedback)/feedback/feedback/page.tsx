'use client';
import {
  Avatar,
  Button,
  DatePicker,
  Empty,
  Form,
  Popconfirm,
  Popover,
  Select,
  Spin,
  Table,
  Tooltip,
} from 'antd';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useEffect, useMemo, useState } from 'react';
import {
  useGetAllUsers,
  useEmployeeDepartments,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useFetchAllFeedbackTypes } from '@/store/server/features/feedback/feedbackType/queries';
import CreateFeedbackForm from './_components/createFeedback';
import {
  useFetchAllFeedbackRecord,
  useFetchAllFeedbackRecordForExport,
} from '@/store/server/features/feedback/feedbackRecord/queries';
import dayjs from 'dayjs';
import { MdDeleteOutline } from 'react-icons/md';
import { useDeleteFeedbackRecordById } from '@/store/server/features/feedback/feedbackRecord/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Permissions } from '@/types/commons/permissionEnum';
import AccessGuard from '@/utils/permissionGuard';
import CustomPagination from '@/components/customPagination';
import { useFeedbackExport } from './_components/useFeedbackExport';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  CalendarOutlined,
  CloseOutlined,
  PlusOutlined,
  SwapRightOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { FiSearch } from 'react-icons/fi';
import { MdOutlineFilterAlt } from 'react-icons/md';
import { PiExportLight } from 'react-icons/pi';
import { AiOutlineEye } from 'react-icons/ai';
import { IoCloseOutline } from 'react-icons/io5';

const { RangePicker } = DatePicker;

const Page = () => {
  const {
    setOpen,
    setVariantType,
    variantType,
    setUserId,
    userId,
    setActiveTab,
    activeTab,
    empId,
    setEmpId,
    givenDate,
    setGivenDate,
    feedbackListTypeId,
    setFeedbackListTypeId,
    pageSize,
    setPageSize,
    page,
    setPage,
  } = ConversationStore();
  const userIdData = useAuthenticationStore.getState().userId;

  const { data: getAllUsersData } = useGetAllUsers();
  const { data: getAllFeedbackTypes } = useFetchAllFeedbackTypes();
  const { data: getAllFeedbackRecord, isLoading: getFeedbackRecordLoading } =
    useFetchAllFeedbackRecord({
      variantType,
      feedbackTypeId: feedbackListTypeId,
      feedbackPerspective: null,
      userId,
      pageSize,
      empId,
      page,
      givenDate,
    });

  const [form] = Form.useForm();

  const { mutate: deleteFeedbackRecord } = useDeleteFeedbackRecordById();
  const { data: EmployeeDepartment } = useEmployeeDepartments();
  const { data: getAllUsers } = useGetAllUsers();

  const [isExporting, setIsExporting] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [isFilterPopoverNarrow, setIsFilterPopoverNarrow] = useState(false);

  // Local draft state for the filter modal
  const [filterDraftDate, setFilterDraftDate] = useState<
    [string, string] | null
  >(null);
  const [filterDraftType, setFilterDraftType] = useState<string | undefined>(
    undefined,
  );
  const { exportFeedbackData } = useFeedbackExport();

  const employeeSelectOptions = useMemo(() => {
    const items = getAllUsersData?.items ?? [];
    return items
      .map((item: any) => {
        const label =
          `${item?.firstName || ''} ${item?.middleName || ''} ${item?.lastName || ''}`
            .trim()
            .replace(/\s+/g, ' ') || 'Unknown';
        return { value: item.id as string, label };
      })
      .sort((a: { label: string }, b: { label: string }) =>
        a.label.localeCompare(b.label),
      );
  }, [getAllUsersData?.items]);
  const { refetch: refetchExportData, isLoading: isExportDataLoading } =
    useFetchAllFeedbackRecordForExport({
      variantType,
      feedbackTypeId: feedbackListTypeId,
      feedbackPerspective: null,
      userId: 'all',
      empId,
      givenDate,
    });

  const isAllEmployees = userId === 'all';
  const viewToggleLabel = isAllEmployees
    ? 'View Personal Feedback'
    : 'View All Employee Feedback';

  const appliedFilterChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];

    if (
      Array.isArray(givenDate) &&
      givenDate.length === 2 &&
      givenDate[0] &&
      givenDate[1]
    ) {
      const start = dayjs(givenDate[0]);
      const end = dayjs(givenDate[1]);
      if (start.isValid() && end.isValid()) {
        const a = start.format('D MMM YYYY');
        const b = end.format('D MMM YYYY');
        chips.push({
          key: 'date',
          label: a === b ? a : `${a} – ${b}`,
          onRemove: () => {
            setGivenDate([]);
            setPage(1);
          },
        });
      }
    }

    if (feedbackListTypeId) {
      const typeItem = getAllFeedbackTypes?.items?.find(
        (item: { id: string }) => item.id === feedbackListTypeId,
      );
      chips.push({
        key: 'type',
        label: typeItem?.category ?? 'Type',
        onRemove: () => {
          setFeedbackListTypeId(undefined);
          setPage(1);
        },
      });
    }

    return chips;
  }, [
    feedbackListTypeId,
    givenDate,
    getAllFeedbackTypes?.items,
    setFeedbackListTypeId,
    setGivenDate,
    setPage,
  ]);

  const handleDelete = (id: string) => {
    deleteFeedbackRecord(id, {
      onSuccess: () => {},
    });
  };

  const handleToggleView = () => {
    if (isAllEmployees) {
      setUserId(userIdData);
    } else {
      setUserId('all');
    }
  };

  useEffect(() => {
    setUserId(userIdData);
    // Default feedback type (Engagement/KPI) for Add Feedback modal only — table is not filtered by this.
    if (getAllFeedbackTypes?.items?.length > 0) {
      setActiveTab(getAllFeedbackTypes.items[0].id);
    }
  }, [getAllFeedbackTypes, userIdData, setUserId, setActiveTab]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsFilterPopoverNarrow(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const handleExport = async () => {
    if (userId !== 'all') return;

    setIsExporting(true);
    try {
      const exportResponse = await refetchExportData();
      const exportData = exportResponse.data;

      if (exportData?.items && exportData.items.length > 0) {
        await exportFeedbackData(
          exportData.items,
          getAllUsers,
          getAllFeedbackTypes,
          EmployeeDepartment,
          variantType,
          `AllTypes_${variantType}`,
        );
      } else {
        NotificationMessage.warning({
          message: 'No Data to Export',
          description:
            'There is no feedback data available to export with the current filters.',
        });
      }
    } catch (error) {
      NotificationMessage.error({
        message: 'Export Failed',
        description:
          'An error occurred while exporting feedback data. Please try again.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getUserInfo = (id: string) => {
    const user = getAllUsers?.items?.find((item: any) => item.id === id);
    return user
      ? {
          name: `${user?.firstName} ${user?.middleName || ''} ${user?.lastName || ''}`.trim(),
          avatar: user?.profileImage,
        }
      : { name: 'Unknown', avatar: null };
  };

  const columns = [
    {
      title: 'Issued to',
      dataIndex: 'recipientId',
      key: 'recipientId',
      align: 'left' as const,
      render: (value: any, record: any) => {
        const user = getUserInfo(record.recipientId);
        return (
          <div
            className="flex items-center gap-2"
            data-cy={`feedback-table-issued-to-${record?.id}`}
          >
            <Avatar
              size={36}
              src={user.avatar}
              icon={<UserOutlined />}
              className="flex-shrink-0 border border-[#d1d5db] bg-[#e5e7eb] [&_.anticon]:text-[#4b5563]"
            />
            <span
              data-cy={`feedback-table-issued-to-name-${record?.id}`}
              className="text-[14px] font-normal text-[#4b5563]"
            >
              {user.name}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'feedbackTypeId',
      key: 'feedbackTypeId',
      align: 'left' as const,
      render: (value: any, record: any) => {
        const feedbackType = getAllFeedbackTypes?.items?.find(
          (item: any) => item.id === record.feedbackTypeId,
        );
        return (
          <span
            data-cy={`feedback-table-type-${record?.id}`}
            className="text-[14px] font-normal text-[#4b5563]"
          >
            {feedbackType?.category || 'Unknown'}
          </span>
        );
      },
    },
    {
      title: 'Given by',
      dataIndex: 'issuerId',
      key: 'issuerId',
      align: 'left' as const,
      render: (value: any, record: any) => {
        const user = getUserInfo(record.issuerId);
        return (
          <div
            className="flex items-center gap-2"
            data-cy={`feedback-table-given-by-${record?.id}`}
          >
            <Avatar
              size={36}
              src={user.avatar}
              icon={<UserOutlined />}
              className="flex-shrink-0 border border-[#d1d5db] bg-[#e5e7eb] [&_.anticon]:text-[#4b5563]"
            />
            <span
              data-cy={`feedback-table-given-by-name-${record?.id}`}
              className="text-[14px] font-normal text-[#4b5563]"
            >
              {user.name}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      align: 'left' as const,
      render: (value: any, record: any) => {
        return record.reason ? (
          <Tooltip title={record?.reason}>
            <span
              data-cy={`feedback-table-reason-${record?.id}`}
              className="text-[14px] font-normal text-[#4b5563]"
            >
              {record?.reason?.length >= 40
                ? record?.reason?.slice(0, 40) + '...'
                : record?.reason}
            </span>
          </Tooltip>
        ) : (
          <span
            data-cy={`feedback-table-reason-na-${record?.id}`}
            className="text-[14px] text-gray-400"
          >
            N/A
          </span>
        );
      },
    },
    {
      title: 'Objective',
      dataIndex: 'objective',
      key: 'objective',
      align: 'left' as const,
      render: (value: any, record: any) => {
        return record?.feedbackVariant?.name ? (
          <Tooltip title={record?.feedbackVariant.name}>
            <span
              data-cy={`feedback-table-objective-${record?.id}`}
              className="text-[14px] font-normal text-[#4b5563]"
            >
              {record?.feedbackVariant.name?.length >= 40
                ? record?.feedbackVariant.name?.slice(0, 40) + '...'
                : record?.feedbackVariant.name}
            </span>
          </Tooltip>
        ) : (
          <span
            data-cy={`feedback-table-objective-na-${record?.id}`}
            className="text-[14px] text-gray-400"
          >
            N/A
          </span>
        );
      },
    },
    {
      title: 'Given Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'left' as const,
      render: (value: any, record: any) => {
        return (
          <span
            data-cy={`feedback-table-given-date-${record?.id}`}
            className="text-[14px] font-normal text-[#4b5563]"
          >
            {record.createdAt
              ? dayjs(record.createdAt).format('DD MMM YYYY')
              : 'N/A'}
          </span>
        );
      },
    },
    {
      title: 'Action',
      key: 'actionButtons',
      align: 'center' as const,
      width: 96,
      render: (value: any, record: any) => {
        return (
          <div
            className="flex justify-center"
            data-cy={`feedback-table-action-${record?.id}`}
          >
            <Popconfirm
              title="Are you sure you want to delete?"
              onConfirm={() => handleDelete(record?.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                disabled={record.issuerId !== userIdData}
                type="default"
                icon={<MdDeleteOutline className="text-lg text-[#4b5563]" />}
                className="feedback-table-action-delete !inline-flex !h-9 !w-9 !min-w-9 !items-center !justify-center !rounded-md !border !border-[#e5e7eb] !bg-white !p-0 !text-[#4b5563] shadow-none hover:!border-[#d1d5db] hover:!text-red-500 disabled:!opacity-40"
              />
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <div
      className="feedback-page-mobile-root min-h-screen h-auto w-full bg-white py-1 md:py-4"
      data-cy="feedback-page"
    >
      {/*
        Single header region: title + breadcrumb + view control share one wrapper; desktop button
        is items-center aligned with the stacked title + breadcrumb column.
      */}
      <div
        className="feedback-page-header mb-4 -mx-9 border-b border-solid border-[#E5E7EB] px-9 pb-4 pt-0 text-left md:-mx-7 md:mb-8 md:px-7 md:pb-5"
        data-cy="feedback-page-header"
      >
        <div
          className="flex w-full flex-row flex-nowrap items-center justify-between gap-3"
          data-cy="feedback-page-header-layout"
        >
          <div
            className="flex min-w-0 flex-1 flex-col gap-1 md:gap-2"
            data-cy="feedback-page-header-title-container"
          >
            <div
              className="flex flex-row flex-nowrap items-center justify-between gap-3 md:justify-start md:gap-0"
              data-cy="feedback-page-header-title-row"
            >
              <h1
                className="m-0 min-w-0 shrink-0 text-2xl font-bold leading-8 tracking-tight text-black md:text-[28px] md:leading-tight md:text-gray-900"
                data-cy="feedback-page-title"
              >
                Feedback
              </h1>
              <AccessGuard
                permissions={[Permissions.ViewAllEmployeeFeedback]}
                data-cy="feedback-page-toggle-guard"
              >
                <div
                  className="shrink-0 md:hidden"
                  data-cy="feedback-page-toggle-mobile-wrap"
                >
                  <Tooltip title={viewToggleLabel} placement="bottom">
                    <Button
                      onClick={handleToggleView}
                      type="default"
                      icon={
                        <AiOutlineEye
                          className="block text-[18px] leading-none text-gray-700"
                          aria-hidden
                        />
                      }
                      aria-label={viewToggleLabel}
                      className="feedback-header-view-toggle !flex !h-8 !w-8 !min-h-8 !min-w-8 !items-center !justify-center !rounded-lg !border !border-gray-300 !bg-white !p-0 !leading-[0] !text-gray-900 shadow-none hover:!border-gray-400 [&_.ant-btn-icon]:!mr-0 [&_.ant-btn-icon]:!flex [&_.ant-btn-icon]:!h-full [&_.ant-btn-icon]:!w-full [&_.ant-btn-icon]:!items-center [&_.ant-btn-icon]:!justify-center [&_.ant-btn-icon]:!leading-[0]"
                      data-cy="feedback-page-toggle-view-btn"
                    />
                  </Tooltip>
                </div>
              </AccessGuard>
            </div>
            <p
              className="m-0 text-sm leading-[22px] text-black/[0.45] md:text-gray-400"
              data-cy="feedback-page-breadcrumb"
            >
              CFR / Feedback
            </p>
          </div>
          <AccessGuard
            permissions={[Permissions.ViewAllEmployeeFeedback]}
            data-cy="feedback-page-toggle-guard-desktop"
          >
            <div
              className="hidden shrink-0 md:block"
              data-cy="feedback-page-toggle-desktop-wrap"
            >
              <Button
                onClick={handleToggleView}
                type="default"
                className="m-0 !inline-flex !h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 text-sm font-medium !leading-[22px] !text-gray-900 shadow-none hover:!border-gray-400 hover:!text-gray-900"
                data-cy="feedback-page-toggle-view-btn"
              >
                <AiOutlineEye
                  className="size-[18px] shrink-0 text-gray-700"
                  aria-hidden
                />
                <span
                  className="leading-[22px]"
                  data-cy="feedback-page-toggle-view-label"
                >
                  {viewToggleLabel}
                </span>
              </Button>
            </div>
          </AccessGuard>
        </div>
      </div>

      {/* Variant Tabs + actions — single row (Frame 3992: 64px bar, #9CA3AF border) */}
      <div
        className="feedback-top-actions-bar -mx-3 mb-0 box-border border-b border-[#9CA3AF] bg-white px-3 md:mx-0 md:mb-6 md:border-[#e5e7eb] md:px-0"
        data-cy="feedback-page-top-actions-bar"
      >
        <div
          className="flex min-h-[64px] flex-row flex-nowrap items-end justify-between gap-2 md:min-h-[56px] md:gap-4"
          data-cy="feedback-page-top-actions-row"
        >
          <div
            className="-mb-px flex min-h-[34px] min-w-0 flex-1 items-end gap-4 overflow-x-auto scrollbar-none md:gap-8"
            data-cy="feedback-page-variant-tabs"
          >
            <button
              type="button"
              onClick={() => setVariantType('appreciation')}
              className={`shrink-0 cursor-pointer border-0 border-b-2 border-solid bg-transparent px-0 pb-3 pt-1 text-base leading-6 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 md:border-b-[3px] md:text-sm ${
                variantType === 'appreciation'
                  ? 'border-b-[#1E40AF] font-bold text-[#1E40AF] md:border-b-[#2563eb] md:text-[#2563eb]'
                  : 'border-b-transparent font-normal text-black/[0.7] hover:text-gray-900 md:text-[#374151]'
              }`}
              data-cy="feedback-page-tab-appreciation"
            >
              Appriciation
            </button>
            <button
              type="button"
              onClick={() => setVariantType('reprimand')}
              className={`shrink-0 cursor-pointer border-0 border-b-2 border-solid bg-transparent px-0 pb-3 pt-1 text-base leading-6 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 md:border-b-[3px] md:text-sm ${
                variantType === 'reprimand'
                  ? 'border-b-[#1E40AF] font-bold text-[#1E40AF] md:border-b-[#2563eb] md:text-[#2563eb]'
                  : 'border-b-transparent font-normal text-black/[0.7] hover:text-gray-900 md:text-[#374151]'
              }`}
              data-cy="feedback-page-tab-reprimand"
            >
              Reprimand
            </button>
          </div>

          <div
            className="flex shrink-0 items-center gap-2 pb-3 md:gap-3"
            data-cy="feedback-page-action-buttons"
          >
            <AccessGuard
              permissions={[Permissions.CreateFeedback]}
              data-cy="feedback-page-add-btn-guard"
            >
              <Button
                type="primary"
                onClick={() => setOpen(true)}
                disabled={activeTab === ''}
                className="flex !h-9 !min-w-9 !w-9 !items-center !justify-center !rounded-lg !border-0 !bg-[#1E40AF] !p-0 !text-white shadow-none hover:!bg-[#1d4ed8] md:!h-10 md:!min-w-0 md:!w-auto md:!gap-3 md:!px-5 md:!bg-[#2563eb]"
                data-cy="feedback-page-add-btn"
                aria-label={
                  variantType === 'appreciation'
                    ? 'Add Appriciation'
                    : 'Add Reprimand'
                }
              >
                <PlusOutlined className="!flex text-[16px] leading-none md:!inline-flex md:!text-[16px] [&_svg]:!h-[1em] [&_svg]:!w-[1em]" />
                <span
                  className="hidden text-sm font-semibold md:inline"
                  data-cy="feedback-page-add-btn-label"
                >
                  {variantType === 'appreciation'
                    ? 'Add Appriciation'
                    : 'Add Reprimand'}
                </span>
              </Button>
            </AccessGuard>

            {isAllEmployees && (
              <AccessGuard
                permissions={[Permissions.ViewAllEmployeeFeedback]}
                data-cy="feedback-page-export-guard"
              >
                <Button
                  type="default"
                  icon={<PiExportLight size={18} />}
                  onClick={handleExport}
                  loading={isExporting || isExportDataLoading}
                  aria-label="Export"
                  className="flex items-center gap-1 !h-9 rounded-lg border border-gray-300 bg-white px-2 font-medium shadow-none max-md:!min-w-9 max-md:!px-0 md:!h-10 md:px-4 md:text-sm"
                  data-cy="feedback-page-export-btn"
                >
                  <span
                    className="hidden md:inline"
                    data-cy="feedback-page-export-btn-label"
                  >
                    Export
                  </span>
                </Button>
              </AccessGuard>
            )}
          </div>
        </div>
      </div>

      {/* Content Card — 8px horizontal inset from page content area */}
      <div
        className="mx-1 mt-4 overflow-hidden rounded-lg border border-[#D9D9D9] bg-white shadow-none md:mt-0 md:rounded-xl md:border-[#e5e7eb] md:shadow-sm"
        data-cy="feedback-page-content-card"
      >
        {/* Search & Date Filters */}
        <div
          className="feedback-page-search-filters flex flex-row flex-wrap items-center justify-between gap-0 px-2 pb-4 pt-5 md:gap-3 md:px-6 md:pb-6 md:pt-6"
          data-cy="feedback-page-search-filters"
        >
          <div
            className="relative h-8 min-w-0 max-w-[299px] flex-1 basis-0 shrink md:h-auto md:w-[299px] md:flex-none md:basis-auto"
            data-cy="feedback-page-employee-select-wrap"
          >
            <div
              className="feedback-search-composite flex h-full min-h-8 w-full min-w-0 items-stretch overflow-hidden rounded-[6px] border border-[#D9D9D9] bg-white transition-colors focus-within:border-[#2563eb] focus-within:ring-1 focus-within:ring-[#2563eb]/20 md:border-[#e5e7eb] md:rounded-md"
              data-cy="feedback-page-search-wrapper"
            >
              <Select
                showSearch
                allowClear
                placeholder="Search Employee"
                value={empId || undefined}
                onChange={(id) => setEmpId(id ?? '')}
                options={employeeSelectOptions}
                variant="borderless"
                suffixIcon={null}
                popupMatchSelectWidth
                listHeight={280}
                optionFilterProp="label"
                filterOption={(input, option) =>
                  String(option?.label ?? '')
                    .toLowerCase()
                    .includes(input.trim().toLowerCase())
                }
                className="feedback-employee-select !m-0 min-w-0 flex-1"
                popupClassName="feedback-employee-search-dropdown"
                data-cy="feedback-page-search-input"
              />
              <span
                className="w-px shrink-0 self-stretch bg-[#D9D9D9]"
                aria-hidden
                data-cy="feedback-page-search-divider"
              />
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center bg-white"
                aria-hidden
                data-cy="feedback-page-search-icon"
              >
                <FiSearch className="text-base text-[#4b5563]" />
              </div>
            </div>
          </div>

          <div
            className="flex h-8 min-w-0 shrink-0 flex-row flex-wrap items-center justify-end gap-2 md:h-auto md:flex-none"
            data-cy="feedback-page-filter-chips-wrap"
          >
            {appliedFilterChips.map((chip) => (
              <div
                key={chip.key}
                className="feedback-applied-filter-chip inline-flex h-8 max-w-full shrink-0 items-center gap-1.5 rounded-md border border-[#D9D9D9] bg-white px-2.5 pl-3 shadow-[0px_2px_0px_rgba(0,0,0,0.02)]"
                data-cy={`feedback-page-filter-chip-${chip.key}`}
              >
                <span
                  className="min-w-0 truncate text-sm font-normal leading-[22px] text-[#374151]"
                  data-cy={`feedback-page-filter-chip-label-${chip.key}`}
                >
                  {chip.label}
                </span>
                <button
                  type="button"
                  onClick={chip.onRemove}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-0 bg-transparent p-0 text-[#374151] hover:bg-black/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blue-500"
                  aria-label={`Remove ${chip.label} filter`}
                  data-cy={`feedback-page-filter-chip-remove-${chip.key}`}
                >
                  <CloseOutlined className="text-xs leading-none" />
                </button>
              </div>
            ))}
            <Popover
              open={filterModalOpen}
              onOpenChange={(open) => {
                if (open) {
                  setFilterDraftDate(
                    Array.isArray(givenDate) &&
                      givenDate.length === 2 &&
                      givenDate[0] &&
                      givenDate[1]
                      ? [givenDate[0], givenDate[1]]
                      : null,
                  );
                  setFilterDraftType(feedbackListTypeId);
                }
                setFilterModalOpen(open);
              }}
              placement={isFilterPopoverNarrow ? 'bottom' : 'bottomRight'}
              trigger="click"
              arrow={false}
              destroyTooltipOnHide
              autoAdjustOverflow
              getPopupContainer={() => document.body}
              overlayClassName="feedback-filter-popover"
              overlayStyle={
                isFilterPopoverNarrow
                  ? {
                      boxSizing: 'border-box',
                    }
                  : undefined
              }
              overlayInnerStyle={{
                padding: 0,
                boxSizing: 'border-box',
                width: isFilterPopoverNarrow ? '100%' : 509,
                maxWidth: isFilterPopoverNarrow
                  ? '100%'
                  : 'min(509px, calc(100vw - 24px))',
                borderRadius: 8,
                boxShadow:
                  '0px 6px 16px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12), 0px 9px 28px 8px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
              }}
              data-cy="feedback-filter-popover"
              content={
                <div
                  className="feedback-filter-modal-root flex max-h-[min(346px,calc(100dvh-120px))] max-w-full flex-col items-stretch overflow-x-hidden bg-white font-[Calibri,Candara,'Segoe_UI',sans-serif] md:max-h-[min(346px,90vh)]"
                  data-cy="feedback-filter-modal-root"
                >
                  <div
                    className="relative flex shrink-0 flex-row items-center gap-[10px] px-6 pb-2 pt-5"
                    data-cy="feedback-filter-modal-header"
                  >
                    <h3
                      className="m-0 flex-1 text-base font-bold leading-6 text-black/[0.7]"
                      data-cy="feedback-filter-modal-title"
                    >
                      Filter
                    </h3>
                    <button
                      type="button"
                      onClick={() => setFilterModalOpen(false)}
                      className="absolute right-5 top-4 flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0 text-black/[0.45] transition-colors hover:bg-black/[0.04]"
                      aria-label="Close"
                      data-cy="feedback-filter-modal-close"
                    >
                      <IoCloseOutline className="text-base" />
                    </button>
                  </div>

                  <div
                    className="feedback-filter-modal-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-6 py-3"
                    data-cy="feedback-filter-modal-scroll"
                  >
                    <div
                      className="flex w-full max-w-full flex-col md:max-w-[461px]"
                      data-cy="feedback-filter-modal-issue-date-section"
                    >
                      <div
                        className="flex flex-row items-center pb-2"
                        data-cy="feedback-filter-modal-issue-date-label-row"
                      >
                        <span
                          className="text-sm font-normal leading-[22px] text-[#030712]"
                          data-cy="feedback-filter-modal-issue-date-label"
                        >
                          Issue Date
                        </span>
                      </div>
                      <RangePicker
                        allowClear
                        placeholder={['Start date', 'End date']}
                        suffixIcon={
                          <CalendarOutlined className="text-[18px] text-black/[0.25]" />
                        }
                        separator={
                          <SwapRightOutlined className="text-[18px] text-black/[0.25]" />
                        }
                        value={
                          filterDraftDate
                            ? [
                                dayjs(filterDraftDate[0]),
                                dayjs(filterDraftDate[1]),
                              ]
                            : null
                        }
                        onChange={(dates, dateStrings) => {
                          if (!dates) {
                            setFilterDraftDate(null);
                            return;
                          }
                          if (dates[0] && dates[1]) {
                            setFilterDraftDate([
                              dateStrings[0],
                              dateStrings[1],
                            ]);
                          }
                        }}
                        className="feedback-modal-range-picker w-full max-w-full md:max-w-[461px]"
                        getPopupContainer={() => document.body}
                        data-cy="feedback-filter-modal-date-range"
                      />
                    </div>

                    <div
                      className="flex w-full max-w-full flex-col md:max-w-[461px]"
                      data-cy="feedback-filter-modal-type-section"
                    >
                      <div
                        className="flex flex-row items-center pb-2"
                        data-cy="feedback-filter-modal-type-label-row"
                      >
                        <span
                          className="text-sm font-normal leading-[22px] text-[#030712]"
                          data-cy="feedback-filter-modal-type-label"
                        >
                          Type
                        </span>
                      </div>
                      <Select
                        allowClear
                        placeholder="Select"
                        value={filterDraftType}
                        onChange={(val) => setFilterDraftType(val)}
                        options={(getAllFeedbackTypes?.items ?? []).map(
                          (item: any) => ({
                            value: item.id,
                            label: item.category,
                          }),
                        )}
                        className="feedback-modal-type-select w-full max-w-full md:max-w-[461px]"
                        popupClassName="feedback-modal-type-dropdown"
                        getPopupContainer={() => document.body}
                        data-cy="feedback-filter-modal-type"
                      />
                    </div>
                  </div>

                  <div
                    className="mt-1 flex shrink-0 flex-row items-center justify-end gap-2 px-6 pb-5 pt-0"
                    data-cy="feedback-filter-modal-footer"
                  >
                    <Button
                      type="default"
                      onClick={() => {
                        setFilterDraftDate(null);
                        setFilterDraftType(undefined);
                        setGivenDate([]);
                        setFeedbackListTypeId(undefined);
                        setFilterModalOpen(false);
                      }}
                      className="feedback-filter-modal-btn-cancel !m-0 !h-8 !min-w-[68px] !rounded-md !border !border-solid !border-[#D9D9D9] !bg-white !px-[15px] !text-sm !font-normal !leading-[22px] !text-black/[0.7] !shadow-[0px_2px_0px_rgba(0,0,0,0.02)] hover:!border-[#D9D9D9] hover:!text-black/[0.7]"
                      data-cy="feedback-filter-modal-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => {
                        if (filterDraftDate) {
                          setGivenDate(filterDraftDate);
                        } else {
                          setGivenDate([]);
                        }
                        setFeedbackListTypeId(
                          filterDraftType === null ||
                            filterDraftType === undefined
                            ? undefined
                            : filterDraftType,
                        );
                        setPage(1);
                        setFilterModalOpen(false);
                      }}
                      className="feedback-filter-modal-btn-primary !m-0 !h-8 !min-w-[62px] !rounded-lg !border !border-solid !border-[#1E40AF] !bg-[#1E40AF] !px-4 !text-sm !font-normal !leading-[22px] !text-white !shadow-[0px_2px_0px_rgba(5,145,255,0.1)] hover:!border-[#1E40AF] hover:!bg-[#1E40AF]"
                      data-cy="feedback-filter-modal-apply"
                    >
                      Filter
                    </Button>
                  </div>
                </div>
              }
            >
              <Button
                type="default"
                aria-label="Filter"
                icon={
                  <MdOutlineFilterAlt
                    className="text-base text-[#374151]"
                    aria-hidden
                  />
                }
                className="flex !h-8 !min-h-8 shrink-0 items-center justify-center gap-2 !rounded-[6px] !border !border-[#D9D9D9] !bg-white !px-3 !text-sm !font-normal !text-[#374151] !shadow-[0px_2px_0px_rgba(0,0,0,0.02)] hover:!border-[#d1d5db] max-md:!h-8 max-md:!w-8 max-md:!min-w-8 max-md:!max-w-8 max-md:!gap-0 max-md:!p-0 md:!w-auto md:!max-w-none md:!justify-start md:!border-[#e5e7eb] md:!px-3"
                data-cy="feedback-page-date-filter-btn"
              >
                <span
                  className="hidden md:inline"
                  data-cy="feedback-page-date-filter-btn-label"
                >
                  Filter
                </span>
              </Button>
            </Popover>
          </div>
        </div>

        {/* Table — full bleed horizontally inside card */}
        <div
          className="feedback-table-panel border-t border-[#F0F0F0] bg-white md:border-[#e5e7eb]"
          data-cy="feedback-page-table-container"
        >
          <div
            className="scrollbar-none w-full overflow-x-auto"
            data-cy="feedback-page-table-scroll-container"
          >
            <Table
              dataSource={getAllFeedbackRecord?.items}
              columns={columns}
              locale={{
                emptyText: getFeedbackRecordLoading ? (
                  <div
                    className="flex min-h-[220px] items-center justify-center"
                    data-cy="feedback-page-table-loading"
                  >
                    <Spin size="large" />
                  </div>
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ),
              }}
              rowClassName={(row, index) =>
                `feedback-table-row ${index % 2 === 1 ? 'feedback-table-row--alt' : 'feedback-table-row--base'}`
              }
              scroll={{ x: 'max-content' }}
              className="w-full feedback-table"
              pagination={false}
              rowKey={(record: any) => record?.id}
              data-cy="feedback-page-table"
            />
          </div>
        </div>

        <div
          className="border-t border-[#e5e7eb] px-3 pb-4 pt-3 md:px-6 md:pb-6 md:pt-4"
          data-cy="feedback-page-pagination-wrap"
        >
          <div
            className="feedback-mobile-pagination w-full md:contents"
            data-cy="feedback-page-pagination-mobile"
          >
            <CustomPagination
              current={page}
              total={getAllFeedbackRecord?.meta?.totalItems || 0}
              pageSize={pageSize}
              onChange={(page, pageSize) => {
                setPage(page);
                setPageSize(pageSize);
              }}
              onShowSizeChange={(size: number) => {
                setPageSize(size);
                setPage(1);
              }}
              data-cy="feedback-page-pagination"
            />
          </div>
        </div>
      </div>

      {/* Create Feedback Drawer */}
      <CreateFeedbackForm form={form} data-cy="feedback-page-create-form" />

      <style jsx global data-cy="feedback-page-style">{`
        @media (max-width: 767px) {
          .feedback-filter-popover.ant-popover {
            /*
              Equal horizontal inset + stretch between edges so the panel
              stays in the viewport (avoids right-edge spill from trigger align).
            */
            box-sizing: border-box !important;
            left: max(12px, env(safe-area-inset-left, 0px)) !important;
            right: max(12px, env(safe-area-inset-right, 0px)) !important;
            width: auto !important;
            max-width: none !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          .feedback-filter-popover.ant-popover .ant-popover-inner {
            box-sizing: border-box !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }
        .feedback-filter-popover.ant-popover .ant-popover-inner {
          padding: 0 !important;
        }
        /* DatePicker / Outlined — spec */
        .feedback-modal-range-picker.ant-picker-range {
          box-sizing: border-box !important;
          height: 40px !important;
          min-height: 40px !important;
          padding: 0 11px !important;
          gap: 8px !important;
          border-radius: 6px !important;
          border: 1px solid #d9d9d9 !important;
          background: #ffffff !important;
          box-shadow: none !important;
          align-items: center !important;
        }
        .feedback-modal-range-picker.ant-picker-range:hover {
          border-color: #d9d9d9 !important;
        }
        .feedback-modal-range-picker.ant-picker-outlined {
          box-shadow: none !important;
        }
        .feedback-modal-range-picker.ant-picker-range.ant-picker-focused,
        .feedback-modal-range-picker.ant-picker-range.ant-picker-focused:hover {
          border-color: #1e40af !important;
          box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.12) !important;
        }
        .feedback-modal-range-picker.ant-picker-range .ant-picker-input {
          flex: 1 1 0% !important;
          min-width: 0 !important;
        }
        .feedback-modal-range-picker.ant-picker-range
          .ant-picker-input
          > input {
          height: 24px !important;
          min-height: 24px !important;
          padding: 0 !important;
          font-size: 16px !important;
          line-height: 24px !important;
          font-family: Calibri, Candara, 'Segoe UI', sans-serif !important;
          color: rgba(0, 0, 0, 0.7) !important;
        }
        .feedback-modal-range-picker.ant-picker-range
          .ant-picker-input
          > input::placeholder {
          color: rgba(0, 0, 0, 0.25) !important;
        }
        .feedback-modal-range-picker.ant-picker-range
          .ant-picker-range-separator {
          padding: 0 !important;
          line-height: 24px !important;
        }
        .feedback-modal-range-picker.ant-picker-range
          .ant-picker-range-separator
          .anticon {
          font-size: 18px !important;
          color: rgba(0, 0, 0, 0.25) !important;
        }
        .feedback-modal-range-picker.ant-picker-range .ant-picker-suffix {
          margin-left: 0 !important;
          padding-left: 0 !important;
        }
        .feedback-modal-range-picker.ant-picker-range
          .ant-picker-suffix
          .anticon {
          font-size: 18px !important;
          color: rgba(0, 0, 0, 0.25) !important;
        }
        /* Select — spec */
        .feedback-modal-type-select.ant-select {
          width: 100% !important;
        }
        .feedback-modal-type-select .ant-select-selector {
          box-sizing: border-box !important;
          height: 40px !important;
          min-height: 40px !important;
          border-radius: 8px !important;
          border: 1px solid #d9d9d9 !important;
          padding: 0 12px !important;
          padding-inline-end: 36px !important;
          box-shadow: none !important;
          background: #ffffff !important;
          display: flex !important;
          align-items: center !important;
        }
        .feedback-modal-type-select .ant-select-selector:hover {
          border-color: #d9d9d9 !important;
        }
        .feedback-modal-type-select.ant-select-focused .ant-select-selector {
          border-color: #1e40af !important;
          box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.12) !important;
        }
        .feedback-modal-type-select .ant-select-selection-placeholder {
          color: rgba(0, 0, 0, 0.25) !important;
          font-size: 16px !important;
          line-height: 24px !important;
          font-family: Calibri, Candara, 'Segoe UI', sans-serif !important;
        }
        .feedback-modal-type-select .ant-select-selection-item {
          font-size: 16px !important;
          line-height: 24px !important;
          font-family: Calibri, Candara, 'Segoe UI', sans-serif !important;
          color: rgba(0, 0, 0, 0.7) !important;
        }
        .feedback-modal-type-select .ant-select-arrow {
          color: rgba(0, 0, 0, 0.25) !important;
          font-size: 12px !important;
        }
        .feedback-modal-type-dropdown.ant-select-dropdown {
          border-radius: 8px !important;
          padding: 4px !important;
          box-shadow:
            0 6px 16px rgba(0, 0, 0, 0.08),
            0 3px 6px -4px rgba(0, 0, 0, 0.12) !important;
        }
        .feedback-modal-type-dropdown .ant-select-item {
          border-radius: 6px !important;
          padding: 8px 12px !important;
          font-size: 14px !important;
          line-height: 22px !important;
          color: rgba(0, 0, 0, 0.7) !important;
        }
        .feedback-modal-type-dropdown
          .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
          background: rgba(0, 0, 0, 0.04) !important;
        }
        .feedback-modal-type-dropdown
          .ant-select-item-option-selected:not(
            .ant-select-item-option-disabled
          ) {
          background: rgba(30, 64, 175, 0.08) !important;
          font-weight: 400 !important;
          color: rgba(0, 0, 0, 0.7) !important;
        }
        .feedback-filter-modal-btn-cancel.ant-btn-default:not(:disabled) {
          font-family: Calibri, Candara, 'Segoe UI', sans-serif !important;
        }
        .feedback-filter-modal-btn-primary.ant-btn-primary:not(:disabled) {
          font-family: Calibri, Candara, 'Segoe UI', sans-serif !important;
          background: #1e40af !important;
          border-color: #1e40af !important;
        }
        .feedback-filter-modal-btn-primary.ant-btn-primary:not(
            :disabled
          ):hover {
          background: #1d3d99 !important;
          border-color: #1d3d99 !important;
        }
        .feedback-search-composite .ant-input-affix-wrapper,
        .feedback-search-composite .ant-input {
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
        }
        .feedback-search-composite .ant-input-affix-wrapper {
          flex: 1 1 0% !important;
          min-width: 0 !important;
          height: 100% !important;
          align-items: center !important;
        }
        .feedback-search-composite .ant-input-affix-wrapper-focused {
          box-shadow: none !important;
        }
        .feedback-search-composite .ant-input {
          height: auto !important;
        }
        .feedback-search-composite .feedback-employee-select {
          flex: 1 1 0% !important;
          min-width: 0 !important;
        }
        .feedback-search-composite
          .feedback-employee-select
          .ant-select-selector {
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
          height: 32px !important;
          min-height: 32px !important;
          padding-inline: 10px !important;
          padding-block: 0 !important;
        }
        .feedback-search-composite
          .feedback-employee-select.ant-select-focused
          .ant-select-selector,
        .feedback-search-composite
          .feedback-employee-select.ant-select-open
          .ant-select-selector {
          box-shadow: none !important;
        }
        .feedback-search-composite
          .feedback-employee-select
          .ant-select-selection-search-input,
        .feedback-search-composite
          .feedback-employee-select
          .ant-select-selection-item {
          font-size: 13px !important;
          line-height: 30px !important;
          color: #374151 !important;
        }
        .feedback-search-composite
          .feedback-employee-select
          .ant-select-selection-placeholder {
          font-size: 13px !important;
          line-height: 30px !important;
          color: #9ca3af !important;
        }
        .feedback-employee-search-dropdown.ant-select-dropdown {
          border-radius: 10px !important;
          padding: 8px !important;
          background: #ffffff !important;
          box-shadow:
            0 4px 24px rgba(15, 23, 42, 0.08),
            0 0 0 1px rgba(15, 23, 42, 0.04) !important;
        }
        .feedback-employee-search-dropdown .ant-select-item {
          border-radius: 8px !important;
          padding: 10px 16px !important;
          margin: 0 !important;
          min-height: auto !important;
          line-height: 1.45 !important;
          font-size: 14px !important;
          font-weight: 400 !important;
          color: #374151 !important;
        }
        .feedback-employee-search-dropdown
          .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
          background: #f3f4f6 !important;
        }
        .feedback-employee-search-dropdown
          .ant-select-item-option-selected:not(
            .ant-select-item-option-disabled
          ) {
          background: #f3f4f6 !important;
          font-weight: 400 !important;
          color: #374151 !important;
        }
        .feedback-employee-search-dropdown .rc-virtual-list-scrollbar {
          width: 6px !important;
        }
        .feedback-employee-search-dropdown .rc-virtual-list-scrollbar-thumb {
          background: #6b7280 !important;
          border-radius: 3px !important;
        }
        .feedback-table-panel .feedback-table .ant-table {
          border-spacing: 0 !important;
        }
        .feedback-table-panel .feedback-table .ant-table-thead > tr > th,
        .feedback-table-panel .feedback-table .ant-table-thead > tr > td,
        .feedback-table-panel .feedback-table .ant-table-thead .ant-table-cell {
          background: #f9fafb !important;
          background-color: #f9fafb !important;
          border-bottom: 1px solid #e5e7eb !important;
          border-top: none !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          color: #374151 !important;
          height: 56px !important;
          padding: 10px 16px !important;
          white-space: nowrap !important;
          line-height: 22px !important;
        }
        .feedback-table-panel
          .feedback-table
          .ant-table-thead
          > tr
          > th:not(:last-child),
        .feedback-table-panel
          .feedback-table
          .ant-table-thead
          .ant-table-cell:not(:last-child) {
          text-align: left !important;
        }
        .feedback-table-panel
          .feedback-table
          .ant-table-thead
          > tr
          > th:last-child,
        .feedback-table-panel
          .feedback-table
          .ant-table-thead
          .ant-table-cell:last-child {
          text-align: center !important;
        }
        .feedback-table-panel
          .feedback-table
          .ant-table-thead
          > tr
          > th::before,
        .feedback-table-panel
          .feedback-table
          .ant-table-thead
          .ant-table-cell::before {
          display: none !important;
        }
        .feedback-table-panel
          .feedback-table
          .ant-table-tbody
          > tr.feedback-table-row--base
          > td,
        .feedback-table-panel
          .feedback-table
          .ant-table-tbody
          > tr.feedback-table-row--base
          .ant-table-cell {
          border-bottom: 1px solid #e5e7eb !important;
          border-top: none !important;
          height: 56px !important;
          padding: 0 16px !important;
          color: #4b5563 !important;
          font-size: 14px !important;
          background: #ffffff !important;
          vertical-align: middle !important;
          line-height: 22px !important;
        }
        .feedback-table-panel
          .feedback-table
          .ant-table-tbody
          > tr.feedback-table-row--alt
          > td,
        .feedback-table-panel
          .feedback-table
          .ant-table-tbody
          > tr.feedback-table-row--alt
          .ant-table-cell {
          border-bottom: 1px solid #e5e7eb !important;
          border-top: none !important;
          height: 56px !important;
          padding: 0 16px !important;
          color: #4b5563 !important;
          font-size: 14px !important;
          background: #f9fafb !important;
          vertical-align: middle !important;
          line-height: 22px !important;
        }
        .feedback-table-panel
          .feedback-table
          .ant-table-tbody
          > tr.feedback-table-row--base:hover
          > td,
        .feedback-table-panel
          .feedback-table
          .ant-table-tbody
          > tr.feedback-table-row--base:hover
          .ant-table-cell {
          background: #f3f4f6 !important;
        }
        .feedback-table-panel
          .feedback-table
          .ant-table-tbody
          > tr.feedback-table-row--alt:hover
          > td,
        .feedback-table-panel
          .feedback-table
          .ant-table-tbody
          > tr.feedback-table-row--alt:hover
          .ant-table-cell {
          background: #f3f4f6 !important;
        }
        .feedback-table-panel .feedback-table .ant-table-container {
          border: none !important;
          border-radius: 0 !important;
        }
        .feedback-table-panel .feedback-table .ant-table-content {
          border: none !important;
        }
        .feedback-table-panel .feedback-table .ant-table-header {
          margin-bottom: 0 !important;
        }
        .feedback-table-panel .feedback-table .ant-table-body {
          margin-top: 0 !important;
        }
        .feedback-table-panel .feedback-table .ant-table-wrapper {
          border: none !important;
        }
        .feedback-table-panel .feedback-table .ant-spin-nested-loading,
        .feedback-table-panel .feedback-table .ant-spin-container {
          gap: 0 !important;
        }

        @media (max-width: 767px) {
          .feedback-page-mobile-root
            .feedback-search-composite
            .feedback-employee-select
            .ant-select-selection-search-input,
          .feedback-page-mobile-root
            .feedback-search-composite
            .feedback-employee-select
            .ant-select-selection-item {
            font-size: 14px !important;
            line-height: 22px !important;
          }
          .feedback-page-mobile-root
            .feedback-search-composite
            .feedback-employee-select
            .ant-select-selection-placeholder {
            font-size: 14px !important;
            line-height: 22px !important;
            color: rgba(0, 0, 0, 0.25) !important;
          }

          .feedback-page-mobile-root
            .feedback-table-panel
            .feedback-table
            .ant-table-thead
            > tr
            > th,
          .feedback-page-mobile-root
            .feedback-table-panel
            .feedback-table
            .ant-table-thead
            .ant-table-cell {
            background: rgba(0, 0, 0, 0.02) !important;
            border-bottom: 1px solid #f0f0f0 !important;
            font-size: 16px !important;
            font-weight: 700 !important;
            color: rgba(0, 0, 0, 0.7) !important;
            height: 56px !important;
            padding: 0 8px !important;
            line-height: 22px !important;
          }
          .feedback-page-mobile-root
            .feedback-table-panel
            .feedback-table
            .ant-table-tbody
            > tr.feedback-table-row--base
            > td,
          .feedback-page-mobile-root
            .feedback-table-panel
            .feedback-table
            .ant-table-tbody
            > tr.feedback-table-row--base
            .ant-table-cell {
            border-bottom: 1px solid #f0f0f0 !important;
            height: 56px !important;
            padding: 0 8px !important;
            color: rgba(0, 0, 0, 0.7) !important;
            font-size: 14px !important;
            line-height: 22px !important;
            background: #ffffff !important;
          }
          .feedback-page-mobile-root
            .feedback-table-panel
            .feedback-table
            .ant-table-tbody
            > tr.feedback-table-row--alt
            > td,
          .feedback-page-mobile-root
            .feedback-table-panel
            .feedback-table
            .ant-table-tbody
            > tr.feedback-table-row--alt
            .ant-table-cell {
            border-bottom: 1px solid #f0f0f0 !important;
            height: 56px !important;
            padding: 0 8px !important;
            color: rgba(0, 0, 0, 0.7) !important;
            font-size: 14px !important;
            line-height: 22px !important;
            background: #fafafa !important;
          }
          .feedback-page-mobile-root
            .feedback-table-panel
            .feedback-table
            .ant-table-tbody
            > tr.feedback-table-row--base:hover
            > td,
          .feedback-page-mobile-root
            .feedback-table-panel
            .feedback-table
            .ant-table-tbody
            > tr.feedback-table-row--base:hover
            .ant-table-cell,
          .feedback-page-mobile-root
            .feedback-table-panel
            .feedback-table
            .ant-table-tbody
            > tr.feedback-table-row--alt:hover
            > td,
          .feedback-page-mobile-root
            .feedback-table-panel
            .feedback-table
            .ant-table-tbody
            > tr.feedback-table-row--alt:hover
            .ant-table-cell {
            background: #f3f4f6 !important;
          }

          .feedback-page-mobile-root .feedback-table-action-delete.ant-btn {
            width: 24px !important;
            height: 24px !important;
            min-width: 24px !important;
            padding: 0 !important;
            border-radius: 4px !important;
            border-color: #d9d9d9 !important;
          }

          .feedback-page-mobile-root .feedback-mobile-pagination > div {
            flex-wrap: wrap !important;
            row-gap: 8px !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          .feedback-page-mobile-root
            .feedback-mobile-pagination
            [data-cy='pagination-prev-button'],
          .feedback-page-mobile-root
            .feedback-mobile-pagination
            [data-cy='pagination-next-button'] {
            width: 32px !important;
            height: 32px !important;
            min-width: 32px !important;
            border-radius: 6px !important;
            border-color: transparent !important;
          }
          .feedback-page-mobile-root
            .feedback-mobile-pagination
            [data-cy='pagination-next-button']:not(:disabled)
            svg {
            color: rgba(0, 0, 0, 0.7) !important;
          }
          .feedback-page-mobile-root
            .feedback-mobile-pagination
            [data-cy='pagination-prev-button']:disabled
            svg,
          .feedback-page-mobile-root
            .feedback-mobile-pagination
            [data-cy='pagination-next-button']:disabled
            svg {
            color: rgba(0, 0, 0, 0.25) !important;
          }
          .feedback-page-mobile-root
            .feedback-mobile-pagination
            [data-cy='pagination-page-button'] {
            width: 32px !important;
            height: 32px !important;
            min-width: 32px !important;
            border-radius: 6px !important;
            font-size: 14px !important;
            line-height: 22px !important;
            font-family: Calibri, Candara, 'Segoe UI', sans-serif !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Page;
