'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
import SubcategoryDrawer from './_components/subcategoryDrawer';
import SubcategorySearch from './_components/subcategorySearch';
import SubcategoriesPage from './_components/subcategoriesPage';

const subCategory: React.FC = () => {
  const { setOpen } = CategoriesManagementStore();

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  return (
    <div className="h-auto w-full p-4">
      <div className="flex flex-wrap justify-between items-center">
        <CustomBreadcrumb title="Survey" subtitle="Manage your survey" />
        <div className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8">
          <CustomButton
            title="Create survey"
            id="createSurveyButton"
            icon={<FaPlus size={13} className="mr-2" />}
            onClick={showDrawer}
            className="bg-blue-600 hover:bg-blue-700"
          />
          <SubcategoryDrawer onClose={onClose} />
        </div>
        <div className="w-full h-auto">
          <SubcategorySearch />
          <SubcategoriesPage />
        </div>
      </div>
    </div>
  );
};

export default subCategory;
