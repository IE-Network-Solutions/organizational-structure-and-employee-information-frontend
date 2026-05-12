'use client';

import CustomBreadcrumb from '@/components/common/breadCramp';
import {
  useGetRecognitionTypeDashboardStats,
  useGetRecognitionTypeParentWithChildren,
} from '@/store/server/features/CFR/recognition/queries';
import CustomPagination from '@/components/customPagination';
import RecognitionStatsCards from './_components/RecognitionStatsCards';
import { Breadcrumb, Card, Input, Skeleton, Tag } from 'antd';
import React from 'react';
import { useRecongnitionStore } from '@/store/uistate/features/conversation/recognition';
import { IoSearchOutline } from 'react-icons/io5';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MdOutlineEmojiEvents } from 'react-icons/md';
import EmptyState from '@/components/empty';

function Page() {
  const navigate = useRouter();
  const {
    searchCategory,
    setSearchCategory,
    current,
    pageSize,
    setCurrent,
    setPageSize,
  } = useRecongnitionStore();
  const { data: recognitionType, isLoading } =
    useGetRecognitionTypeParentWithChildren(searchCategory, pageSize, current);
  const { data: recognitionTypeDashboardStats, isLoading: isStatsLoading } =
    useGetRecognitionTypeDashboardStats();

  return (
    <div
      className="min-h-full py-4"
      data-cy="recognition-page"
      id="recognitionPage"
    >
      <div className="mb-2" data-cy="recognition-page-header-block">
        <CustomBreadcrumb
          title="Recognition"
          subtitle={
            <Breadcrumb
              className="mt-1 text-sm"
              data-cy="recognition-page-breadcrumb"
              items={[
                {
                  title: (
                    <Link
                      href="/feedback/conversation"
                      className="text-gray-500 hover:text-gray-700"
                      data-cy="recognition-page-breadcrumb-cfr"
                    >
                      CFR
                    </Link>
                  ),
                },
                {
                  title: (
                    <span
                      className="text-gray-700 font-medium"
                      data-cy="recognition-page-breadcrumb-recognition"
                    >
                      Recognition
                    </span>
                  ),
                },
              ]}
            />
          }
        />
      </div>

      <RecognitionStatsCards
        recognitionTypeDashboardStats={recognitionTypeDashboardStats}
        isLoading={isStatsLoading}
      />

      <div
        className="w-full pl-2 md:pl-3"
        data-cy="recognition-categories-card-wrapper"
      >
        <Input.Group
          compact
          className="mb-4 max-w-[320px]"
          data-cy="recognition-search-group"
        >
          <Input
            placeholder="Search Category"
            value={searchCategory || ''}
            onChange={(e) => {
              setSearchCategory(e.target.value || null);
            }}
            allowClear
            size="large"
            styles={{
              affixWrapper: {
                alignItems: 'stretch',
              },
              suffix: {
                display: 'flex',
                alignItems: 'stretch',
                marginInlineEnd: 0,
              },
            }}
            suffix={
              <span
                className="flex items-stretch text-[#6B7280]"
                data-cy="recognition-search-icon-wrap"
              >
                <span
                  className="shrink-0 self-stretch w-px bg-[#E5E7EB]"
                  aria-hidden
                />
                <span className="flex items-center pl-2">
                  <IoSearchOutline />
                </span>
              </span>
            }
            className="h-8 w-full rounded-md md:w-[300px]"
            data-cy="recognition-search-category-input"
          />
        </Input.Group>
        {recognitionType?.items?.length == 0 && (
          <div
            className="flex justify-center items-center h-full"
            data-cy="recognition-categories-empty-wrap"
          >
            <EmptyState />
          </div>
        )}
        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          data-cy="recognition-categories-grid"
        >
          {isLoading
            ? [...Array(6).keys()].map((index) => (
                <Card
                  key={`recognition-skeleton-${index}`}
                  bordered={false}
                  className="rounded-lg border border-transparent bg-[#F9FAFB] px-5 py-4 shadow-none transition-all hover:border-[1.5px] hover:border-[#D1D5DB] sm:px-6"
                  bodyStyle={{ padding: 0 }}
                  data-cy={`recognition-type-card-skeleton-${index}`}
                >
                  <Skeleton active avatar paragraph={{ rows: 2 }} />
                </Card>
              ))
            : recognitionType?.items?.map((item: any) => (
                <Card
                  key={item.id}
                  bordered={false}
                  className="cursor-pointer rounded-lg border border-transparent bg-[#F9FAFB] px-4 py-4 shadow-none transition-all hover:border-[1.5px] hover:border-[#D1D5DB] sm:px-5"
                  onClick={() =>
                    navigate.push(
                      `/feedback/recognition/detail?recognitionTypeId=${item.id}`,
                    )
                  }
                  bodyStyle={{ padding: 0 }}
                  data-cy={`recognition-type-card-${item.id}`}
                  id={`recognitionTypeCard-${item.id}`}
                >
                  <div
                    className="flex flex-col gap-3"
                    data-cy={`recognition-card-content-${item.id}`}
                  >
                    <div
                      className="flex items-center justify-between gap-3"
                      data-cy={`recognition-card-row-${item.id}`}
                    >
                      <div
                        className="flex min-w-0 flex-1 items-center gap-3"
                        data-cy={`recognition-card-header-${item.id}`}
                      >
                        <span
                          className="inline-flex shrink-0 items-center"
                          data-cy={`recognition-card-icon-${item.id}`}
                        >
                          <MdOutlineEmojiEvents
                            size={12}
                            className="text-[#3636F0]"
                            aria-hidden
                          />
                        </span>
                        <p
                          className="min-w-0 flex-1 truncate text-[15px] font-medium leading-normal text-[#111827]"
                          data-cy={`recognition-card-title-${item.id}`}
                        >
                          {item?.name ?? '-'}
                        </p>
                      </div>
                      <div
                        className="flex shrink-0 flex-nowrap items-center"
                        data-cy={`recognition-card-pills-${item.id}`}
                      >
                        <Tag
                          color="blue"
                          className="m-0 rounded-[4px] px-2 py-1 text-xs font-medium leading-none"
                          data-cy={`recognition-card-types-pill-${item.id}`}
                        >
                          {(item?.children?.length ?? 0) + ' Types'}
                        </Tag>
                      </div>
                    </div>
                    <div
                      className="min-w-0"
                      data-cy={`recognition-card-text-${item.id}`}
                    >
                      <p
                        className="line-clamp-2 text-sm font-normal leading-[22px] text-[#6B7280]"
                        data-cy={`recognition-card-description-${item.id}`}
                      >
                        {item?.description ?? 'Recognition category'}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
        </div>
        {!isLoading && recognitionType?.items?.length > 0 && (
          <CustomPagination
            current={current}
            total={recognitionType?.meta?.totalItems ?? 0}
            pageSize={pageSize}
            pageSizeOptions={[6, 12, 24, 36, 50, 100]}
            showPageSizeChanger={false}
            goToOnRight
            goToInputPlaceholder="Input"
            onChange={(page, size) => {
              setCurrent(page);
              setPageSize(size);
            }}
            onShowSizeChange={(size: number) => {
              setCurrent(1);
              setPageSize(size);
            }}
            data-cy="recognition-categories-pagination"
          />
        )}
      </div>
    </div>
  );
}

export default Page;
