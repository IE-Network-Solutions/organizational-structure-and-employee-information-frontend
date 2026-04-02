'use client';
import { useParentRecognition } from '@/store/server/features/incentive/other/queries';
import { Button, Card, Divider, Empty, Input, Skeleton, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import DynamicIncentive from './compensation/dynamicRecoginition';
import ExportModal from './compensation/all/export';
import ConfirmModal from '@/components/common/confirmModal';
import { useSendIncentiveToPayroll } from '@/store/server/features/incentive/all/mutation';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useExportIncentiveData } from '@/store/server/features/incentive/all/mutation';
import SendIcon from '@mui/icons-material/Send';
import { SearchOutlined, LeftOutlined } from '@ant-design/icons';
import { MdOutlineEmojiEvents } from 'react-icons/md';
import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomPagination from '@/components/customPagination';
import IncentiveStatusCards from './compensation/cards/IncentiveStatusCards';
import { useAllIncentiveCards } from '@/store/server/features/incentive/all/queries';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { useGetAllIncentiveData } from '@/store/server/features/incentive/other/queries';
import { useGetRecognitionTypeDashboardStats } from '@/store/server/features/CFR/recognition/queries';

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
  const { mutate: exportIncentiveData, isLoading: exportIncentiveLoading } =
    useExportIncentiveData();

  const { searchParams } = useIncentiveStore();
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
  const { data: parentRecognition, isLoading: parentResponseLoading } =
    useParentRecognition();
  const { data: recognitionTypeDashboardStats } =
    useGetRecognitionTypeDashboardStats();

  const { data: incentiveData } = useGetAllIncentiveData(
    searchParams?.employee_name || '',
    searchParams?.byYear || ' ',
    searchParams?.bySession,
    searchParams?.byMonth || '',
    pageSize,
    currentPage,
  );

  const { mutate: sendIncentiveToPayroll, isLoading } =
    useSendIncentiveToPayroll();

  const { isMobile, isTablet } = useIsMobile();
  const { data: allIncentiveCards } = useAllIncentiveCards();
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

  const handleCardSelect = (key: string) => {
    setCategoryPage(1);
    setActiveKey(key);

    const foundRecognition = (parentRecognition || []).find(
      (rec: any) => rec?.id === key,
    );
    setSelectedRecognition(foundRecognition || null);
  };

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

  const formattedTotalRecognitionTypes = (
    recognitionTypeDashboardStats?.totalRecognitionTypes || 0
  ).toString();

  const filteredRecognition = useMemo(() => {
    if (!searchCategory.trim()) return parentRecognition || [];

    const query = searchCategory.toLowerCase().trim();
    return (parentRecognition || []).filter((item: any) => {
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
    const categories = parentRecognition?.length || 0;

    return {
      categories,
      totalCriteria: formattedCriteria,
      totalIncentive: formattedAmount,
      totalRecognitionTypes: formattedTotalRecognitionTypes,
    };
  }, [allIncentiveCards, parentRecognition]);

  const operationSlot = (
    <div
      id="incentives-page-operations-slot-card-detail"
      data-cy="incentives-page-operations-slot-card-detail"
      className="flex items-center justify-center gap-3"
    >
      <Button
        type="primary"
        data-cy="incentives-page-send-to-payroll-button-other"
        icon={
          <SendIcon
            className="pt-1"
            id="incentives-page-send-to-payroll-icon-other"
            data-cy="incentives-page-send-to-payroll-icon-other"
          />
        }
        onClick={() => handleSendToPayrollClick()}
        className="h-10 w-10 sm:w-full font-normal text-base"
      >
        {!isMobile && 'Send to Payroll'}
      </Button>
      <Button
        type="default"
        data-cy="incentives-page-export-button-other"
        icon={
          <SaveAltIcon
            id="incentives-page-export-icon-other"
            data-cy="incentives-page-export-icon-other"
          />
        }
        onClick={() => handleExport(searchParams, false)}
        className="h-10 w-10 sm:w-full border border-[#D9D9D9] font-normal text-base"
        loading={exportIncentiveLoading}
        disabled={exportIncentiveLoading}
      >
        {!(isMobile || isTablet) && (
          <span
            id="incentives-page-export-text-other"
            data-cy="incentives-page-export-text-other"
            className="hidden sm:inline"
          >
            Export
          </span>
        )}
      </Button>
    </div>
  );

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
          className="rounded-lg border border-[#D1D5DB] bg-white p-3"
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
        className="cursor-pointer rounded-lg border border-[#D1D5DB] bg-white p-3"
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
            className="flex flex-wrap items-center gap-3"
            data-cy={`incentive-card-pills-${item?.id}`}
          >
            <Tag
              className="inline-flex rounded-[4px] border border-[#91CAFF] bg-[#E6F4FF] px-3 py-1 text-xs leading-none font-normal text-[#1677FF]"
              data-cy={`incentive-card-types-pill-${item?.id}`}
            >
              {(item?.children?.length ?? 0) + ' Types'}
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
          <Divider className="full-bleed-header-divider" />

          <IncentiveStatusCards
            recognitionTypeDashboardStats={recognitionStats}
            isLoading={parentResponseLoading}
          />

          <Card
            bordered
            className="rounded-lg p-3"
            data-cy="incentive-categories-card-wrapper"
            bodyStyle={{ padding: 0 }}
          >
            <Input.Group
              compact
              className="max-w-[320px] mb-4"
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
          className="mx-3 mt-4"
          data-cy="incentives-page-selected-recognition-view"
        >
          <div
            data-cy="incentives-page-selected-recognition-view-container"
            className="flex items-start justify-between gap-4 border-b pb-4 mb-4"
          >
            <div
              data-cy="incentives-page-selected-recognition-view-container-content"
              className="flex items-start gap-3"
            >
              <button
                type="button"
                onClick={handleBackToCards}
                className="mt-1 h-8 w-8 rounded border border-gray-200 hover:bg-gray-50"
                data-cy="incentives-page-back-to-cards-button"
              >
                <LeftOutlined />
              </button>
              <div data-cy="incentives-page-selected-recognition-view-container-content-title">
                <h2
                  className="text-2xl font-semibold text-[#111827]"
                  data-cy="incentives-page-selected-title"
                >
                  {selectedRecognition?.name || 'Incentive'}
                </h2>
                <p
                  className="text-sm text-[#6B7280] mt-1"
                  data-cy="incentives-page-selected-subtitle"
                >
                  Incentive
                </p>
              </div>
            </div>
            <div data-cy="incentives-page-selected-recognition-view-container-content-operations">
              {operationSlot}
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
        description={'You want to send to payroll'}
      />
    </div>
  );
};

export default Page;
