'use client';
import React from 'react';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { Form, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import CustomButton from '@/components/common/buttons/customButton';

const CategorySideDrawer: React.FC<any> = (props) => {
  const { open, setOpen } = CategoriesManagementStore();

  const drawerHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Create Category
    </div>
  );
  const handleCloseDrawer = () => {
    setOpen(false);
  };

  return (
    open && (
      <CustomDrawerLayout
        open={open}
        onClose={props?.onClose}
        modalHeader={drawerHeader}
        width="40%"
      >
        <div className="flex flex-col h-full">
          <div className="flex-grow overflow-y-auto">
            <Form layout="vertical">
              <Form.Item
                id="categoryName"
                label={
                  <span className="text-md my-2 font-semibold text-gray-700">
                    Category Name
                  </span>
                }
                name="name"
                rules={[
                  {
                    required: true,
                    message: 'Please input the category name!',
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Enter category name"
                  className="text-sm w-full h-14"
                />
              </Form.Item>
              <Form.Item
                id="categoryDescription"
                label={
                  <span className="text-md my-2 font-semibold text-gray-700">
                    Category Description
                  </span>
                }
                name="description"
                rules={[
                  {
                    required: true,
                    message: 'Please input the category description!',
                  },
                ]}
              >
                <TextArea rows={4} placeholder="Enter category description" />
              </Form.Item>
              <Form.Item
                id="employeeLevel"
                label={
                  <span className="text-md my-2 font-semibold text-gray-700">
                    Employee in the selected level
                  </span>
                }
                name="employeeLevel"
                rules={[
                  {
                    required: true,
                    message: 'Please input the employee level!',
                  },
                ]}
              >
                <TextArea placeholder="Enter employee level" />
              </Form.Item>
            </Form>
            <div className="flex items-center justify-start gap-1 mx-2 mt-0">
              <IoIosInformationCircleOutline size={20} />
              <p className="text-gray-300">
                Select employees inside the level as preferred.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <CustomButton
              title="Cancel"
              type="primary"
              className="bg-white text-black border-[1px] border-gray-300 px-10"
              onClick={handleCloseDrawer}
            />
            <CustomButton title="Submit" className="px-10" />
          </div>
        </div>
      </CustomDrawerLayout>
    )
  );
};

export default CategorySideDrawer;
