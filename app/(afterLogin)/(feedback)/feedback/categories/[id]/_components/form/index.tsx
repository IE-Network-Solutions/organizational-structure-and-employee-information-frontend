'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import React from 'react';
import { useGetFormCategories } from '@/store/server/features/feedback/category/queries';
import { useDynamicFormStore } from '@/store/uistate/features/feedback/dynamicForm';
import FormDrawer from './formDrawer';
import FormSearch from './formSearch';
import FormCard from './formCards';

interface Params {
  id: string;
}
interface CategoryForms {
  params: Params;
}
function Form({ params: { id } }: CategoryForms) {
  const { setIsDrawerOpen } = useDynamicFormStore();
  const { data: formCategories } = useGetFormCategories(id);

  const showDrawer = () => {
    setIsDrawerOpen(true);
  };
  const onClose = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div
      id="category-form-component-container"
      data-cy="category-form-component-container"
      className="h-auto w-full p-4 bg-white rounded-md"
    >
      <div
        id="category-form-component-header"
        data-cy="category-form-component-header"
        className="flex flex-wrap justify-between items-center"
      >
        <CustomBreadcrumb
          title={formCategories?.name ? formCategories?.name : ''}
          subtitle={`Manage your ${formCategories?.name ? formCategories?.name : ''}`}
          data-cy="category-form-component-breadcrumb"
        />
        <div
          id="category-form-component-actions"
          data-cy="category-form-component-actions"
          className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8"
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
            data-cy="category-form-component-form-drawer"
          />
        </div>
        <div
          id="category-form-component-list"
          data-cy="category-form-component-list"
          className="w-full h-auto"
        >
          <FormSearch
            categoryId={id}
            data-cy="category-form-component-form-search"
          />
          <FormCard id={id} data-cy="category-form-component-form-card" />
        </div>
      </div>
    </div>
  );
}

export default Form;
