'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
import SubcategoryDrawer from './_components/subcategoryDrawer';
import SubcategorySearch from './_components/subcategorySearch';
import SubcategoriesPage from './_components/subcategoriesPage';
import { useGetFormCategories } from '@/store/server/features/feedback/category/queries';

interface Params {
  id: string;
}
interface CategoryForms {
  params: Params;
}
function subCategory({ params: { id } }: CategoryForms) {
  const { setOpen } = CategoriesManagementStore();
  const { data: formCategories } = useGetFormCategories(id);

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  return (
    <div className="h-auto w-full p-4 bg-white rounded-md">
      <div className="flex flex-wrap justify-between items-center">
        <CustomBreadcrumb
          title={formCategories?.name ? formCategories?.name : ''}
          subtitle={`Manage your ${formCategories?.name ? formCategories?.name : ''}`}
        />
        <div className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8">
          <CustomButton
            title={`Create ${formCategories?.name ? formCategories?.name : ''}`}
            id="createSurveyButton"
            icon={<FaPlus size={13} className="mr-2" />}
            onClick={showDrawer}
            className="bg-blue-600 hover:bg-blue-700"
          />
          <SubcategoryDrawer onClose={onClose} id={id} />
        </div>
        <div className="w-full h-auto">
          <SubcategorySearch />
          <SubcategoriesPage id={id} />
        </div>
      </div>
    </div>
  );
}

export default subCategory;
