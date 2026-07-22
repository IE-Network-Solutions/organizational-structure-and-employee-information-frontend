'use client';
import {
  useAllChildrenRecognition,
  useParentRecognition,
} from '@/store/server/features/incentive/other/queries';
import {
  Button,
  Card,
  Dropdown,
  Empty,
  Input,
  Select,
  Skeleton,
  Tag,
} from 'antd';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import DynamicIncentive from './compensation/dynamicRecoginition';
import ExportModal from './compensation/all/export';
import ConfirmModal from '@/components/common/confirmModal';
import { useSendIncentiveToPayroll } from '@/store/server/features/incentive/all/mutation';
import { useExportIncentiveData } from '@/store/server/features/incentive/all/mutation';
import SendIcon from '@mui/icons-material/Send';
import { SearchOutlined } from '@ant-design/icons';
import { MdOutlineEmojiEvents } from 'react-icons/md';
import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomPagination from '@/components/customPagination';
import IncentiveStatusCards from './compensation/cards/IncentiveStatusCards';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { useGetAllIncentiveData } from '@/store/server/features/incentive/other/queries';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import GenerateModal from './payroll-detail/generateModal';
function normalizeRecognitionList(raw: unknown): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.items)) return obj.items as any[];
  if (Array.isArray(obj.data)) return obj.data as any[];
  return [];
}

function parentIdOfChild(child: any): string | undefined {
  const pid =
    child?.parentTypeId ?? child?.parentId ?? child?.parentRecognitionTypeId;
  return pid != null && pid !== '' ? String(pid) : undefined;
}

const Page = () => {
  const {
    activeKey,
    setActiveKey,
    setShowGenerateModal,
    setSelectedRecognition,
    selectedRecognition,
    setParentResponseIsLoading,
    selectedRowKeys,
    setSelectedRowKeys,
    confirmationModal,
    setConfirmationModal,
    pageSize,
    currentPage,
  } = useIncentiveStore();

  const { mutate: exportIncentiveData } = useExportIncentiveData();

  const { searchParams, setSearchParams } = useIncentiveStore();
  const { data: payPeriodData } = useGetPayPeriod();
  const handleExport = (values: any, generateAll: boolean) => {
    const formattedValues = {
      parentRecognitionTypeId: selectedRecognition?.id || '',
      generateAll: generateAll,
      sessionId: values?.bySession || [],
      userId: values?.employee_name || '',
      monthId: values?.byMonth || '',
    };
    exportIncentiveData(formattedValues);
  };
  const { data: parentRecognitionRaw, isLoading: parentResponseLoading } =
    useParentRecognition();
  const { data: allChildrenRaw } = useAllChildrenRecognition();

  const parentRecognition = useMemo(
    () => normalizeRecognitionList(parentRecognitionRaw),
    [parentRecognitionRaw],
  );

  const allChildTypes = useMemo(
    () => normalizeRecognitionList(allChildrenRaw),
    [allChildrenRaw],
  );

  const childTypeCountByParentId = useMemo(() => {
    const map = new Map<string, number>();
    for (const child of allChildTypes) {
      const pid = parentIdOfChild(child);
      if (!pid) continue;
      map.set(pid, (map.get(pid) ?? 0) + 1);
    }
    return map;
  }, [allChildTypes]);

  const { data: incentiveData, isFetching: incentiveDataFetching } =
    useGetAllIncentiveData(
      searchParams?.employee_name || '',
      searchParams?.byYear || ' ',
      searchParams?.bySession,
      searchParams?.byMonth || '',
      pageSize,
      currentPage,
      searchParams?.payPeriodId || '',
    );

  // Per-card category bonus totals stay pay-period-independent, unlike the KPI cards.
  const { data: categoryBonusData } = useGetAllIncentiveData(
    searchParams?.employee_name || '',
    searchParams?.byYear || ' ',
    searchParams?.bySession,
    searchParams?.byMonth || '',
    pageSize,
    currentPage,
    '',
  );

  const handlePayPeriodChange = useCallback(
    (value: string) => {
      setSearchParams('payPeriodId', value || '');
    },
    [setSearchParams],
  );

  const { mutate: sendIncentiveToPayroll, isLoading } =
    useSendIncentiveToPayroll();

  const [searchCategory, setSearchCategory] = useState('');
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryPageSize, setCategoryPageSize] = useState(9);

  useEffect(() => {
    setActiveKey('1');
    setSelectedRecognition(null);
    setSelectedRowKeys([]);
  }, [setActiveKey, setSelectedRecognition, setSelectedRowKeys]);

  useEffect(() => {
    setParentResponseIsLoading(parentResponseLoading);
  }, [parentResponseLoading, setParentResponseIsLoading]);

  const handleSendToPayrollClick = () => {
    setConfirmationModal(true);
  };
  const handleGenerateIncentiveClick = () => {
    setShowGenerateModal(true);
  };
  const handleYesSendToPayroll = () => {
    setConfirmationModal(false);
    setShowGenerateModal(true);
    sendIncentiveToPayroll(
      { data: selectedRowKeys },
      {
        onSuccess: () => {
          setShowGenerateModal(false);
          setSelectedRowKeys([]);
        },
      },
    );
  };

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [activeKey, setSelectedRowKeys]);

  const handleCardSelect = useCallback(
    (key: string) => {
      setCategoryPage(1);
      setActiveKey(key);

      const foundRecognition = parentRecognition.find(
        (rec: any) => rec?.id === key,
      );
      if (!foundRecognition) {
        setSelectedRecognition(null);
        return;
      }
      const children = allChildTypes.filter(
        (c: any) => parentIdOfChild(c) === key,
      );
      setSelectedRecognition({
        ...foundRecognition,
        children:
          children.length > 0
            ? children
            : Array.isArray(foundRecognition.children)
              ? foundRecognition.children
              : [],
      });
    },
    [
      allChildTypes,
      parentRecognition,
      setActiveKey,
      setCategoryPage,
      setSelectedRecognition,
    ],
  );

  useEffect(() => {
    const id = selectedRecognition?.id;
    if (!id) return;

    // Parent was cascade-deleted — leave the stale detail view.
    const parentStillExists = parentRecognition.some(
      (p: any) => p && String(p.id) === String(id),
    );
    if (parentRecognition.length > 0 && !parentStillExists) {
      setSelectedRecognition(null);
      setActiveKey('1');
      setSelectedRowKeys([]);
      return;
    }

    // Keep child list in sync after child-type cascade deletes.
    const children = allChildTypes.filter(
      (c: any) => parentIdOfChild(c) === id,
    );
    const prev = useIncentiveStore.getState().selectedRecognition;
    if (!prev || prev.id !== id) return;

    const prevChildren = Array.isArray(prev.children) ? prev.children : [];
    const sameLength = prevChildren.length === children.length;
    const sameIds =
      sameLength &&
      prevChildren.every(
        (c: any, i: number) => String(c?.id) === String(children[i]?.id),
      );
    if (sameIds) return;

    setSelectedRecognition({ ...prev, children });
  }, [
    allChildTypes,
    parentRecognition,
    selectedRecognition?.id,
    setSelectedRecognition,
    setActiveKey,
    setSelectedRowKeys,
  ]);

  const handleBackToCards = () => {
    setActiveKey('1');
    setSelectedRecognition(null);
    setSelectedRowKeys([]);
  };

  const formattedAmount = (incentiveData?.data?.totalAmount || 0)
    .toString()
    .padStart(3, '0')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const formattedCriteria = (incentiveData?.data?.totalCriteria || 0)
    .toString()
    .padStart(3, '0')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Prefer live parent/child lists for type counts so top KPI cards match the
  // recognition category cards immediately after cascade deletes.
  const liveCategoryCount = parentRecognition.length;
  const liveRecognitionTypeCount = allChildTypes.length;
  const apiCategoryCount = Number(incentiveData?.data?.totalCategories || 0);
  const apiRecognitionTypeCount = Number(
    incentiveData?.data?.totalRecognitionTypes || 0,
  );

  const formattedCategories = String(
    liveCategoryCount > 0 ? liveCategoryCount : apiCategoryCount,
  );

  const formattedTotalRecognitionTypes = String(
    liveRecognitionTypeCount > 0
      ? liveRecognitionTypeCount
      : apiRecognitionTypeCount,
  );

  const filteredRecognition = useMemo(() => {
    if (!searchCategory.trim()) return parentRecognition;

    const query = searchCategory.toLowerCase().trim();
    return parentRecognition.filter((item: any) => {
      const name = String(item?.name || '').toLowerCase();
      const description = String(item?.description || '').toLowerCase();
      return name.includes(query) || description.includes(query);
    });
  }, [parentRecognition, searchCategory]);

  const totalCategoryPages = Math.ceil(
    (filteredRecognition?.length || 0) / categoryPageSize,
  );

  const paginatedRecognition = useMemo(() => {
    const safePage = Math.min(
      Math.max(categoryPage, 1),
      totalCategoryPages || 1,
    );
    const startIndex = (safePage - 1) * categoryPageSize;
    return filteredRecognition.slice(startIndex, startIndex + categoryPageSize);
  }, [categoryPage, categoryPageSize, filteredRecognition, totalCategoryPages]);

  const recognitionStats = useMemo(() => {
    return {
      categories: formattedCategories,
      totalCriteria: formattedCriteria,
      totalIncentive: formattedAmount,
      totalRecognitionTypes: formattedTotalRecognitionTypes,
    };
  }, [
    formattedCategories,
    formattedCriteria,
    formattedAmount,
    formattedTotalRecognitionTypes,
  ]);

  const dropdownMenuItems: MenuProps['items'] = [
    {
      key: 'send',
      label: (
        <div
          data-cy="incentives-page-send-to-payroll-button"
          className="flex items-center gap-2"
        >
          <SendIcon className="text-[#2E3137] text-base" />
          <span
            data-cy="incentives-page-send-to-payroll-button-text"
            className="text-base font-normal text-black opacity-70"
          >
            Send to Payroll
          </span>
        </div>
      ),
    },
    {
      key: 'export',
      label: (
        <div
          data-cy="incentives-page-export-button"
          className="flex items-center gap-3 py-1"
        >
          <SaveAltIcon className="text-[#2E3137] text-base" />
          <span
            data-cy="incentives-page-export-button-text"
            className="text-base font-normal text-black opacity-70"
          >
            Export
          </span>
        </div>
      ),
    },
    {
      key: 'generate',
      label: (
        <div
          data-cy="incentives-page-generate-incentive-button"
          className="flex items-center gap-3 py-1"
        >
          <PublishedWithChangesIcon className="text-[#2E3137] text-base" />
          <span
            data-cy="incentives-page-generate-incentive-button-text"
            className="text-base font-normal text-black opacity-70"
          >
            Generate Incentive
          </span>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (categoryPage > totalCategoryPages && totalCategoryPages > 0) {
      setCategoryPage(totalCategoryPages);
    }
  }, [categoryPage, totalCategoryPages]);

  useEffect(() => {
    setCategoryPage(1);
  }, [searchCategory]);

  const renderRecognitionCards = () => {
    if (parentResponseLoading) {
      return [...Array(6).keys()].map((index) => (
        <Card
          key={`recognition-skeleton-${index}`}
          className="rounded-lg bg-[#f9fafb] p-3"
          bodyStyle={{ padding: 0 }}
          data-cy={`incentive-recognition-type-card-skeleton-${index}`}
        >
          <Skeleton active avatar paragraph={{ rows: 2 }} />
        </Card>
      ));
    }

    if (paginatedRecognition?.length === 0) {
      return (
        <div
          className="col-span-3 py-8"
          data-cy="incentive-recognition-empty-wrap"
        >
          <Empty />
        </div>
      );
    }

    return paginatedRecognition?.map((item: any) => (
      <Card
        key={item?.id}
        className="cursor-pointer rounded-lg bg-[#f9fafb] p-3"
        onClick={() => handleCardSelect(item?.id)}
        bodyStyle={{ padding: 0 }}
        data-cy={`incentive-recognition-type-card-${item?.id}`}
      >
        <div
          className="flex flex-col gap-1"
          data-cy={`incentive-card-content-${item?.id}`}
        >
          <div
            className="flex items-center gap-3"
            data-cy={`incentive-card-header-${item?.id}`}
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-md bg-lightblue text-primary"
              data-cy={`incentive-card-icon-${item?.id}`}
            >
              <MdOutlineEmojiEvents size={24} className="text-base" />
            </span>
            <p
              className="min-w-0 truncate text-sm font-normal leading-normal text-black"
              data-cy={`incentive-card-title-${item?.id}`}
            >
              {item?.name ?? '-'}
            </p>
          </div>
          <div className="min-w-0" data-cy={`incentive-card-text-${item?.id}`}>
            <p
              className="text-[#6B7280] font-normal text-sm leading-[22px] line-clamp-2"
              data-cy={`incentive-card-description-${item?.id}`}
            >
              {item?.description ?? 'Recognition for employee of the quarter'}
            </p>
          </div>
          <div
            className="flex flex-wrap items-center justify-between gap-3"
            data-cy={`incentive-card-pills-${item?.id}`}
          >
            <Tag
              className="inline-flex rounded-[4px] border border-[#91CAFF] bg-[#E6F4FF] px-3 py-1 text-xs leading-none font-normal text-[#1677FF]"
              data-cy={`incentive-card-types-pill-${item?.id}`}
            >
              {(childTypeCountByParentId.get(item?.id) ??
                item?.children?.length ??
                0) + ' Types'}
            </Tag>
            <Tag
              className="inline-flex rounded-[4px] border border-[#91CAFF] bg-[#E6F4FF] px-3 py-1 text-xs leading-none font-normal text-[#1677FF]"
              data-cy={`incentive-card-bonus-pill-${item?.id}`}
            >
              Total Bonus:{' '}
              {(
                categoryBonusData?.data?.categoryAmounts?.[item?.id] || 0
              ).toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </Tag>
          </div>
        </div>
      </Card>
    ));
  };

  return (
    <div id="incentives-page-container" data-cy="incentives-page-container">
      <style data-cy="incentives-page-styles">{`
        @media (min-width: 640px) {
     .full-bleed-header-divider {
          width: calc(100% + 48px) !important;
          margin-left: -24px !important;
          margin-right: -24px !important;
          min-width: calc(100% + 48px) !important;
        }
        @media (max-width: 768px) {
          .full-bleed-header-divider {
            width: calc(100% + 48px) !important;
            margin-left: -24px !important;
            margin-right: -24px !important;
          }
          }
        }
        .incentives-actions-dropdown .ant-dropdown-menu {
          min-width: 300px;
          border-radius: 6px;
          background: #ffffff;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
          padding: 10px;
        }
        .incentives-actions-dropdown .ant-dropdown-menu-item {
          padding: 8px 10px;
          border-radius: 6px;
          margin: 2px 0;
        }
        .incentives-actions-dropdown .ant-dropdown-menu-item:hover {
          background: #ffffff;
        }
      `}</style>
      {!selectedRecognition ? (
        <>
          <CustomBreadcrumb
            title="Incentive"
            subtitle={
              <span
                data-cy="incentives-page-breadcrumb-subtitle"
                className="px-1 text-sm text-black opacity-45"
              >
                Incentive
              </span>
            }
            data-cy="incentives-page-breadcrumb"
          />

          <IncentiveStatusCards
            recognitionTypeDashboardStats={recognitionStats}
            isLoading={parentResponseLoading || incentiveDataFetching}
          />

          <Card
            bordered={false}
            className="rounded-lg p-3 shadow-none"
            data-cy="incentive-categories-card-wrapper"
            bodyStyle={{ padding: 0 }}
          >
            <div
              className="flex flex-wrap items-center justify-between gap-3 mb-4"
              data-cy="incentive-search-and-filters-row"
            >
              <Input.Group
                compact
                className="max-w-[320px]"
                data-cy="incentive-search-group"
              >
                <Input
                  placeholder="Search Category"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  allowClear
                  size="large"
                  suffix={
                    <div
                      data-cy="incentive-search-category-input-suffix"
                      className="border-l border-gray-200 flex items-center justify-center h-8"
                    >
                      <SearchOutlined
                        data-cy="incentive-search-category-input-suffix-icon"
                        className="text-gray-400 ml-3"
                      />
                    </div>
                  }
                  className="w-full rounded-md h-8 md:w-[300px]"
                  data-cy="incentive-search-category-input"
                />
              </Input.Group>

              <Select
                id="incentives-page-payperiod-select"
                data-cy="incentives-page-payperiod-select"
                placeholder="Pay Period"
                onChange={handlePayPeriodChange}
                value={searchParams?.payPeriodId || undefined}
                allowClear
                size="large"
                style={{ width: 260 }}
              >
                {payPeriodData?.map((period: any) => (
                  <Select.Option
                    key={period.id}
                    value={period.id}
                    data-cy={`incentives-page-payperiod-option-${period.id}`}
                  >
                    {dayjs(period.startDate).format('MMM DD, YYYY')} --{' '}
                    {dayjs(period.endDate).format('MMM DD, YYYY')}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              data-cy="incentive-categories-grid"
            >
              {renderRecognitionCards()}
            </div>

            {!parentResponseLoading && filteredRecognition?.length > 0 && (
              <CustomPagination
                current={categoryPage}
                total={filteredRecognition?.length ?? 0}
                pageSize={categoryPageSize}
                pageSizeOptions={[6, 9, 12, 24, 36]}
                onChange={(page, size) => {
                  setCategoryPage(page);
                  setCategoryPageSize(size);
                }}
                onShowSizeChange={(size: number) => {
                  setCategoryPage(1);
                  setCategoryPageSize(size);
                }}
                data-cy="incentive-categories-pagination"
              />
            )}
          </Card>
        </>
      ) : (
        <div
          className="mx-0 mt-4"
          data-cy="incentives-page-selected-recognition-view"
        >
          <div data-cy="incentives-page-selected-recognition-view-container">
            <div
              data-cy="incentives-page-selected-recognition-view-container-content"
              className="w-full min-w-0"
            >
              <CustomBreadcrumb
                onBack={handleBackToCards}
                backControlDataCy="incentives-page-back-to-cards-button"
                title={
                  <div
                    data-cy="incentives-page-selected-recognition-view-container-content-title"
                    className="min-w-0"
                  >
                    <span
                      className="block truncate"
                      data-cy="incentives-page-selected-title"
                    >
                      {selectedRecognition?.name || 'Incentive'}
                    </span>
                  </div>
                }
                subtitle={
                  <span
                    className="mt-1 block text-sm text-[#6B7280]"
                    data-cy="incentives-page-selected-subtitle"
                  >
                    Incentive
                  </span>
                }
                titleExtra={
                  <div
                    data-cy="incentives-page-selected-recognition-view-container-content-operations"
                    className="shrink-0"
                  >
                    <Dropdown
                      trigger={['click']}
                      placement="bottomRight"
                      overlayClassName="incentives-actions-dropdown"
                      menu={{
                        items: dropdownMenuItems,
                        onClick: ({ key }) => {
                          if (key === 'send') {
                            handleSendToPayrollClick();
                            return;
                          }
                          if (key === 'export') {
                            handleExport(searchParams, false);
                            return;
                          }
                          if (key === 'generate') {
                            handleGenerateIncentiveClick();
                          }
                        },
                      }}
                    >
                      <Button
                        type="default"
                        className="border border-[#D9D9D9] h-8 w-8"
                      >
                        <MoreHorizIcon />
                      </Button>
                    </Dropdown>
                  </div>
                }
              />
            </div>
          </div>

          <DynamicIncentive
            parentRecognitionId={selectedRecognition?.id || activeKey}
          />
        </div>
      )}

      <ExportModal
        data-cy="incentives-page-export-modal"
        selectedRecognition={selectedRecognition?.id}
      />

      <ConfirmModal
        data-cy="incentives-page-confirm-modal"
        open={confirmationModal}
        onConfirm={handleYesSendToPayroll}
        onCancel={() => setConfirmationModal(false)}
        loading={isLoading}
        description={'Are You sure you want to send to payroll ?'}
      />
      <GenerateModal />
    </div>
  );
};

export default Page;
