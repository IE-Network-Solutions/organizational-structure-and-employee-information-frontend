'use client';

import PageHeader from '@/components/common/pageHeader/pageHeader';
import {
  useGetRecognitionTypeDashboardStats,
  useGetRecognitionTypeParentWithChildren,
} from '@/store/server/features/CFR/recognition/queries';
import CustomPagination from '@/components/customPagination';
import RecognitionStatsCards from './_components/RecognitionStatsCards';
import { Card, Input, Select } from 'antd';
import React, { useMemo, useState } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import { MdOutlineEmojiEvents } from 'react-icons/md';

function Page() {
  const navigate = useRouter();
  const [searchCategory, setSearchCategory] = useState<string | null>(null);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const { data: recognitionType } = useGetRecognitionTypeParentWithChildren(
    searchCategory,
    current,
    pageSize,
  );
  const { data: recognitionTypeDashboardStats, isLoading: isStatsLoading } =
    useGetRecognitionTypeDashboardStats();
  console.log(recognitionType, 'recognitionType');

  return (
    <div className="s" data-cy="recognition-page" id="recognitionPage">
      <PageHeader title="Recognition" description="Manage Recognition" />

      <RecognitionStatsCards
        recognitionTypeDashboardStats={recognitionTypeDashboardStats}
        isLoading={isStatsLoading}
      />

      <Card
        bordered
        className="rounded-lg p-3"
        data-cy="recognition-categories-card-wrapper"
        bodyStyle={{ padding: 0 }}
      >
        <Input.Group compact className="max-w-[320px] mb-4">
          <Select
            placeholder="Search Category"
            onChange={(value: string | null) => setSearchCategory(value)}
            value={searchCategory}
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
                <IoSearchOutline className="ml-2" />
              </div>
            }
            className="w-full rounded-md h-8 md:w-[300px] "
            options={recognitionType?.items?.map((item: any) => ({
              value: item?.id,
              label: `${item?.name}`,
            }))}
          />
        </Input.Group>

        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          data-cy="recognition-categories-grid"
        >
          {recognitionType?.items?.map((item: any) => (
            <Card
              key={item.id}
              className="cursor-pointer rounded-lg border border-[#D1D5DB] bg-white p-3"
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
                className="flex flex-col gap-1"
                data-cy={`recognition-card-content-${item.id}`}
              >
                <div
                  className="flex items-center gap-3"
                  data-cy={`recognition-card-header-${item.id}`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-lightblue text-primary">
                    <MdOutlineEmojiEvents size={24} className="text-base" />
                  </span>
                  <p
                    className="min-w-0 truncate text-sm font-normal leading-normal text-black"
                    data-cy={`recognition-card-title-${item.id}`}
                  >
                    {item?.name ?? '-'}
                  </p>
                </div>
                <div
                  className="min-w-0"
                  data-cy={`recognition-card-text-${item.id}`}
                >
                  <p
                    className="text-[#6B7280] font-normal text-sm leading-[22px]  line-clamp-2"
                    data-cy={`recognition-card-description-${item.id}`}
                  >
                    {item?.description ?? 'Recognition category'}m
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="inline-flex rounded-[4px] border border-[#91CAFF] bg-[#E6F4FF] px-3 py-1 text-xs leading-none font-normal text-[#1677FF]"
                    data-cy={`recognition-card-types-pill-${item.id}`}
                  >
                    {(item?.children?.length ?? 0) + ' Types'}
                  </span>
                  <span
                    className="inline-flex rounded-[4px] border border-[#91CAFF] bg-[#E6F4FF] px-3 py-1 text-xs leading-none font-normal text-[#1677FF]"
                    data-cy={`recognition-card-recognitions-pill-${item.id}`}
                  >
                    {(item?.recognitionCount ?? 0) + ' Recognitions'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <CustomPagination
          current={current}
          total={recognitionType?.meta?.totalItems ?? 0}
          pageSize={pageSize}
          onChange={(page, size) => {
            setCurrent(page);
            setPageSize(size);
          }}
          onShowSizeChange={(size: number) => {
            setPageSize(size);
            setCurrent(1);
          }}
          data-cy="recognition-categories-pagination"
        />
      </Card>
    </div>
  );
}

export default Page;
