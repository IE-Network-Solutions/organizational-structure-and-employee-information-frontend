'use client';
import React from 'react';
import CreateSurvayCategory from '../_components/surveyCategory/createSurvayCategory';
import { useFetchCategories } from '@/store/server/features/feedback/category/queries';
import { EmployeeSurveyStore } from '@/store/uistate/features/conversation/survey';
import ServayCategoryCard from '../_components/surveyCategory/servayCategoryCard';
import CustomPagination from '@/components/customPagination';
import EditCategoryModal from '../../categories/_components/categoriesCard/editCategory';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
const Page = () => {
  const {
    pageSize,
    current,
    setCurrent,
    setPageSize,
    searchParams,
    setSearchParams,
  } = EmployeeSurveyStore();
  const { data: categories } = useFetchCategories(
    pageSize,
    searchParams?.category_name ? 1 : current,
    searchParams?.category_name || '',
    searchParams?.category_description || '',
    searchParams?.createdBy || '',
  );
  return (
    <div
      data-cy="survey-category-page"
      id="surveyCategoryPage"
      className="rounded-lg border border-[#D9D9D9] p-4"
    >
      <div
        className="flex justify-between text-xs mx-2 overflow-x-auto "
        data-cy={`survey-category-page-actions`}
        id={`surveyCategoryPageActions`}
      >
        <div
          style={{ marginBottom: 16 }}
          data-cy={`survey-category-page-search-container`}
          id={`surveyCategoryPageSearchContainer`}
        >
          <Input
            placeholder="Search categories..."
            addonAfter={<SearchOutlined className="text-gray-400" />}
            allowClear
            className="w-full max-w-[280px] h-10 rounded-md text-sm [&_.ant-input]:!text-sm [&_.ant-input]:!leading-tight [&_.ant-input-affix-wrapper]:!items-center [&_.ant-input-group-addon]:!px-3 [&_.ant-input-group-addon]:!bg-white"
            onChange={(e) => {
              setSearchParams('category_name', e.target.value);
            }}
            data-cy={`survey-category-page-search`}
            id={`surveyCategoryPageSearch`}
          />
        </div>
      </div>
      <div
        className="grid grid-cols-12 flex-col-reverse justify-between"
        data-cy="survey-category-page-grid"
        id="surveyCategoryPageGrid"
      >
        <div
          className="col-span-12 "
          data-cy="survey-category-page-tabs-container"
          id="surveyCategoryPageTabsContainer"
        >
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            data-cy="survey-category-page-grid"
          >
            {categories
              ? categories.items.map((item: any) => (
                  <ServayCategoryCard key={item.id} category={item} />
                ))
              : '-'}
          </div>
        </div>
      </div>

      {categories?.meta && categories?.items?.length > 0 && (
        <CustomPagination
          current={current}
          total={categories?.meta?.totalItems}
          pageSize={pageSize}
          onChange={(page, size) => {
            setCurrent(page);
            setPageSize(size);
          }}
          onShowSizeChange={(newSize: number) => {
            setPageSize(newSize);
            setCurrent(1);
          }}
          data-cy="settings-define-meeting-type-pagination"
        />
      )}
      <CreateSurvayCategory />
      <EditCategoryModal userOptions={[]} />
    </div>
  );
};

export default Page;
