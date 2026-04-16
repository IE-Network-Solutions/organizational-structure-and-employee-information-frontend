'use client';
/* eslint-disable local-rules/data-cy-required, @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars */
import CustomBreadcrumb from '@/components/common/breadCramp';
import React from 'react';
import CategorySearch from './_components/categorySearch';
import CategoriesCard from './_components/categoriesCard';

const Categories: React.FC = () => {
  return (
    <div
      className="h-auto w-full  bg-white rounded-md"
      data-cy="feedback-categories-page-div"
      id="feedback-categories-page-div"
    >
      <div
        className="flex flex-wrap justify-between items-center"
        data-cy="feedback-categories-page-div-container"
        id="feedback-categories-page-div-container"
      >
        <CustomBreadcrumb
          title="Form Categories"
          subtitle={
            <>
              <span className="text-slate-500">CFR / </span>
              <span className="text-[#000000B2]">Form Categories</span>
            </>
          }
          data-cy="feedback-categories-page-breadcrumb"
        />
      </div>

      <div
        className="w-full h-auto"
        data-cy="feedback-categories-page-div-content"
        id="feedback-categories-page-div-content"
      >
        <div
          className="mt-4 bg-white border border-[#E2E8F0] rounded-lg p-4 w-full flex flex-col gap-4"
          data-cy="feedback-categories-page-content-container"
          id="feedback-categories-page-content-container"
        >
          <CategorySearch data-cy="feedback-categories-category-search" />
          <CategoriesCard data-cy="feedback-categories-categories-card" />
        </div>
      </div>
    </div>
  );
};

export default Categories;
