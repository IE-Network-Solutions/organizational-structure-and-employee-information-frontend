'use client';
/* eslint-disable local-rules/data-cy-required, @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars */
import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import React from 'react';
import Link from 'next/link';
import { useGetFormCategories } from '@/store/server/features/feedback/category/queries';
import { useDynamicFormStore } from '@/store/uistate/features/feedback/dynamicForm';
import FormDrawer from './_components/form/formDrawer';
import FormSearch from './_components/form/formSearch';
import FormCard from './_components/form/formCards';

interface Params {
  id: string;
}
interface CategoryForms {
  params: Params;
}
function Form({ params: { id } }: CategoryForms) {
  const { setIsAddOpen } = useDynamicFormStore();
  const { data: formCategories, isLoading: isCategoryLoading } =
    useGetFormCategories(id);

  const categoryHref = id
    ? `/feedback/categories/${id}`
    : '/feedback/categories';

  const showDrawer = () => {
    setIsAddOpen(true);
  };
  const onClose = () => {
    setIsAddOpen(false);
  };

  return (
    <div
      id="category-form-page-container"
      data-cy="category-form-page-container"
      className="h-auto w-full bg-white rounded-md"
    >
      <div
        id="category-form-page-header"
        data-cy="category-form-page-header"
        className="flex w-full min-w-0 flex-col"
      >
        <div
          className="mb-4 w-full min-w-0 shrink-0 bg-white md:mb-6"
          data-cy="category-form-page-header-block"
        >
          <CustomBreadcrumb
            data-cy="category-form-page-breadcrumb"
            
            title="Survey"
            subtitle={
              <>
                <Link
                  href="/feedback/categories"
                  className="text-slate-500 transition-colors hover:text-[#2D5BFF]"
                  data-cy="category-form-page-breadcrumb-cfr"
                >
                  CFR
                </Link>
                <span
                  className="text-slate-500"
                  data-cy="category-form-page-breadcrumb-sep-1"
                >
                  {' '}
                  /{' '}
                </span>
                <Link
                  href="/feedback/conversation"
                  className="text-slate-500 transition-colors hover:text-[#2D5BFF]"
                  data-cy="category-form-page-breadcrumb-conversation"
                >
                  Conversation
                </Link>
                <span
                  className="text-slate-500"
                  data-cy="category-form-page-breadcrumb-sep-2"
                >
                  {' '}
                  /{' '}
                </span>
                <Link
                  href={categoryHref}
                  className="text-slate-500 transition-colors hover:text-[#2D5BFF]"
                  data-cy="category-form-page-breadcrumb-survey-link"
                >
                  Survey
                </Link>
                <span
                  className="text-slate-500"
                  data-cy="category-form-page-breadcrumb-sep-3"
                >
                  {' '}
                  /{' '}
                </span>
                {isCategoryLoading ? (
                  <span
                    className="inline-block align-middle h-5 w-36 max-w-[40vw] animate-pulse rounded-md bg-gray-100"
                    aria-hidden
                    data-cy="category-form-page-breadcrumb-name-skeleton"
                  />
                ) : (
                  <span
                    className="font-medium text-[#000000B2]"
                    data-cy="category-form-page-breadcrumb-category-name"
                  >
                    {formCategories?.name ?? '—'}
                  </span>
                )}
              </>
            }
          />
        </div>
        <div
          id="category-form-page-list"
          data-cy="category-form-page-list"
          className="h-auto w-full"
        >
          <div
            className="flex min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
            data-cy="category-form-page-content-panel"
          >
            <div className="flex w-full min-w-0 shrink-0 flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
              <FormSearch
                categoryId={id}
                data-cy="category-form-page-form-search"
              />
              <div
                id="category-form-page-actions"
                data-cy="category-form-page-actions"
                className="flex shrink-0 flex-wrap items-center justify-end gap-2"
              >
                <CustomButton
                  title="Add new survey"
                  id="createSurveyButton"
                  data-cy="createSurveyButton"
                  onClick={showDrawer}
                  className="bg-blue-600 hover:bg-blue-700"
                />
                <FormDrawer
                  onClose={onClose}
                  id={id}
                  data-cy="category-form-page-form-drawer"
                />
              </div>
            </div>
            <FormCard id={id} data-cy="category-form-page-form-card" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Form;
