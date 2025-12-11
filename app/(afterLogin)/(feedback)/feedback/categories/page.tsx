'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import CategorySideDrawer from './_components/categorySideDrawer';
import CategorySearch from './_components/categorySearch';
import CategoriesCard from './_components/categoriesCard';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const Categories: React.FC = () => {
  const { setOpen } = CategoriesManagementStore();

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  return (
    <div className="h-auto w-full p-4 bg-white rounded-md" data-cy="feedback-categories-page-div" id="feedback-categories-page-div">
      <div className="flex flex-wrap justify-between items-center" data-cy="feedback-categories-page-div-container" id="feedback-categories-page-div-container">
        <CustomBreadcrumb
          title="Form Categories"
          subtitle="Manage your form categories"
          data-cy="feedback-categories-page-breadcrumb"
        />
        <div className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8" data-cy="feedback-categories-page-div-actions" id="feedback-categories-page-div-actions">
          <AccessGuard permissions={[Permissions.CreateFormCategory]} data-cy="feedback-categories-page-access-guard-create-form-category" id="feedback-categories-page-access-guard-create-form-category">
            <CustomButton
              title="Create Form Category"
              id="createUserButton"
              data-cy="feedback-categories-page-button-create"
              icon={<FaPlus size={13} className="mr-2" data-cy="feedback-categories-page-icon-plus" id="feedback-categories-page-icon-plus" />}
              onClick={showDrawer}
              className="bg-blue-600 hover:bg-blue-700"
            />
          </AccessGuard>
          <CategorySideDrawer onClose={onClose} data-cy="feedback-categories-side-drawer" />
        </div>
        <div className="w-full h-auto" data-cy="feedback-categories-page-div-content" id="feedback-categories-page-div-content">
          <CategorySearch data-cy="feedback-categories-category-search" />
          <CategoriesCard data-cy="feedback-categories-categories-card" />
        </div>
      </div>
    </div>
  );
};

export default Categories;
