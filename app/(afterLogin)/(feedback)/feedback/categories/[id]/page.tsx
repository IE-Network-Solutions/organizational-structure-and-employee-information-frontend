'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
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
  const { data: formCategories } = useGetFormCategories(id);

  const showDrawer = () => {
    setIsAddOpen(true);
  };
  const onClose = () => {
    setIsAddOpen(false);
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
          <FormDrawer onClose={onClose} id={id} />
        </div>
        <div className="w-full h-auto">
          <FormSearch />
          <FormCard id={id} />
        </div>
      </div>
    </div>
  );
}

export default Form;
