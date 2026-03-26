'use client';

import PageHeader from '@/components/common/pageHeader/pageHeader';
import {
  useGetAllRecognitionData,
  useGetTotalRecognition,
} from '@/store/server/features/CFR/recognition/queries';
import { Card, Input } from 'antd';
import React, { useMemo, useState } from 'react';
import { CiMedal } from 'react-icons/ci';
import { FiAward, FiFolder, FiGrid, FiList } from 'react-icons/fi';
import { IoSearchOutline } from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import {
  MdCategory,
  MdFolder,
  MdOutlineBallot,
  MdOutlineEmojiEvents,
  MdOutlineFolder,
} from 'react-icons/md';
import { MdEmojiEvents } from 'react-icons/md';

function Page() {
  const navigate = useRouter();
  const { data: recognitionType } = useGetAllRecognitionData();
  const { data: totalRecogniion } = useGetTotalRecognition();
  const [searchText, setSearchText] = useState('');
  console.log(recognitionType, 'recognitionType');

  const filteredRecognitionTypes = useMemo(() => {
    const lowerSearch = searchText.trim().toLowerCase();
    const items = recognitionType?.items ?? [];
    if (!lowerSearch) return items;

    return items.filter((item: any) =>
      String(item?.name ?? '')
        .toLowerCase()
        .includes(lowerSearch),
    );
  }, [recognitionType?.items, searchText]);

  return (
    <div className="s" data-cy="recognition-page" id="recognitionPage">
      <PageHeader title="Recognition" description="Manage Recognition" />

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6"
        data-cy="recognition-stats-cards"
      >
        <Card
          className="bg-white w-full border border-[#E5E7EB] rounded-lg p-3"
          bordered
          bodyStyle={{ padding: 0 }}
          data-cy="recognition-stats-card-categories"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-lightblue text-primary">
                <MdOutlineFolder size={24} className="text-base" />
              </span>
              <p
                className="text-base font-normal leading-normal text-black"
                data-cy="recognition-stats-label-categories"
              >
                Categories
              </p>
            </div>
            <p
              className="pl-9 text-[24px] leading-none font-bold   text-black"
              data-cy="recognition-stats-value-categories"
            >
              {recognitionType?.items?.length ?? 0}
            </p>
          </div>
        </Card>
        <Card
          className="bg-white w-full border border-[#E5E7EB] rounded-lg p-3"
          bordered
          bodyStyle={{ padding: 0 }}
          data-cy="recognition-stats-card-total-recognitions"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-lightblue text-primary">
                <MdOutlineEmojiEvents size={24} className="text-base" />
              </span>
              <p
                className="text-base font-normal leading-normal text-black"
                data-cy="recognition-stats-label-total-recognitions"
              >
                Total Recognitions
              </p>
            </div>
            <p
              className="pl-9 text-[24px] leading-none font-bold text-black"
              data-cy="recognition-stats-value-total-recognitions"
            >
              {totalRecogniion?.totalRecognitions ?? 0}
            </p>
          </div>
        </Card>
        <Card
          className="bg-white w-full border border-[#E5E7EB] rounded-lg p-3"
          bordered
          bodyStyle={{ padding: 0 }}
          data-cy="recognition-stats-card-total-criteria"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-lightblue text-primary">
                <MdOutlineBallot size={24} className="text-base" />
              </span>
              <p
                className="text-base font-normal leading-normal text-black"
                data-cy="recognition-stats-label-total-criteria"
              >
                Total Criteria
              </p>
            </div>
            <p
              className="pl-9 text-[24px] leading-none font-bold text-black"
              data-cy="recognition-stats-value-total-criteria"
            >
              {totalRecogniion?.totalCriteria ?? 0}
            </p>
          </div>
        </Card>
        <Card
          className="bg-white w-full border border-[#E5E7EB] rounded-lg p-3"
          bordered
          bodyStyle={{ padding: 0 }}
          data-cy="recognition-stats-card-total-types"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-lightblue text-primary">
                <MdCategory size={24} className="text-base" />
              </span>
              <p
                className="text-base font-normal leading-normal text-black"
                data-cy="recognition-stats-label-total-types"
              >
                Total Recognition Types
              </p>
            </div>
            <p
              className="pl-9 text-[24px] leading-none font-bold text-black"
              data-cy="recognition-stats-value-total-types"
            >
              {recognitionType?.items?.length ?? 0}
            </p>
          </div>
        </Card>
      </div>

      <Card
        bordered
        className="rounded-lg p-3"
        data-cy="recognition-categories-card-wrapper"
        bodyStyle={{ padding: 0 }}
      >
        <Input
          placeholder="Search Category"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<IoSearchOutline className="text-gray-400" />}
          className="max-w-[320px] mb-4"
          data-cy="recognition-category-search"
          id="recognitionCategorySearch"
        />

        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          data-cy="recognition-categories-grid"
        >
          {filteredRecognitionTypes.map((item: any) => (
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
                    {(item?.totalTypes ??
                      item?.typesCount ??
                      item?.typeCount ??
                      0) + ' Types'}
                  </span>
                  <span
                    className="inline-flex rounded-[4px] border border-[#91CAFF] bg-[#E6F4FF] px-3 py-1 text-xs leading-none font-normal text-[#1677FF]"
                    data-cy={`recognition-card-recognitions-pill-${item.id}`}
                  >
                    {(item?.totalRecognitions ??
                      item?.recognitionsCount ??
                      item?.recognitionCount ??
                      0) + ' Recognitions'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default Page;
