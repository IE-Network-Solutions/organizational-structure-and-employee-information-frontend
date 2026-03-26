'use client';
import React from 'react';
import CreateSurvayCategory from '../_components/surveyCategory/createSurvayCategory';
import { useFetchCategories } from '@/store/server/features/feedback/category/queries';
import { EmployeeSurveyStore } from '@/store/uistate/features/conversation/survey';
import ServayCategoryCard from '../_components/surveyCategory/servayCategoryCard';
import CustomPagination from '@/components/customPagination';

const page = () => {
  const { pageSize, current, setCurrent, setPageSize, searchParams } =
    EmployeeSurveyStore();
  const { data: categories, isLoading: isCategoriesLoading } =
    useFetchCategories(
      pageSize,
      current,
      searchParams?.category_name || '',
      searchParams?.category_description || '',
      searchParams?.createdBy || '',
    );
  return (
    <div data-cy="survey-category-page" id="surveyCategoryPage">
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
    </div>
  );
};

export default page;
