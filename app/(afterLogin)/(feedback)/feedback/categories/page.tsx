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
    <div className="h-auto w-full p-4 bg-white rounded-md">
      <div className="flex flex-wrap justify-between items-center">
        <CustomBreadcrumb
          title="Categories"
          subtitle="Manage your categories"
        />
        <div className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8">
          <AccessGuard permissions={[Permissions.CreateCfrFormCategory]}>
            <CustomButton
              title="Create Category"
              id="createUserButton"
              icon={<FaPlus size={13} className="mr-2" />}
              onClick={showDrawer}
              className="bg-blue-600 hover:bg-blue-700"
            />
          </AccessGuard>
          <CategorySideDrawer onClose={onClose} />
        </div>
        <div className="w-full h-auto">
          <CategorySearch />
          <CategoriesCard />
        </div>
      </div>
    </div>
  );
};

export default Categories;
