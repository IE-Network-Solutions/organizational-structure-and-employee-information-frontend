'use client';
import React from 'react';
import { Spin } from 'antd';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { useFetchCategories } from '@/store/server/features/feedback/category/queries';
import {
  useDeleteFormCategory,
  useUpdateFormCategory,
} from '@/store/server/features/feedback/category/mutation';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import CategoryCard from './categoryCard';
import EditCategoryModal from './editCategory';
import FeedbackPagination from '../../../_components/feedbackPagination';

const CategoriesCard: React.FC = () => {
  const {
    pageSize,
    current,
    deleteModal,
    setCurrent,
    setPageSize,
    setDeleteModal,
    setDeletedItem,
    setEditModal,
    setEditingCategory,
    searchParams,
  } = CategoriesManagementStore();

  const { data: categories, isLoading: isCategoriesLoading } =
    useFetchCategories(
      pageSize,
      current,
      searchParams?.category_name || '',
      searchParams?.category_description || '',
      searchParams?.createdBy || '',
    );

  const updateCategory = useUpdateFormCategory();
  const deleteCategory = useDeleteFormCategory();

  const userOptions = React.useMemo(() => {
    if (!categories?.items) return [];

    const uniqueUsers = new Map();
    categories.items.forEach((category: any) => {
      category.users?.forEach((user: any) => {
        if (user && user.id) {
          uniqueUsers.set(user.id, {
            value: user.id,
            label: user.name || user.email || user.id,
          });
        }
      });
    });

    return Array.from(uniqueUsers.values());
  }, [categories]);

  const handleMenuClick = (key: string, category: any) => {
    if (key === 'edit') {
      setEditModal(true);

      setEditingCategory({
        ...category,
        users: Array.isArray(category.permissions)
          ? category.permissions.map((user: any) => user.userId)
          : [],
      });

    } else if (key === 'delete') {
      setDeletedItem(category.id);
      setDeleteModal(true);
    }
  };
  const handleUpdate = (values: any) => {
    const editingCategory =
      CategoriesManagementStore.getState().editingCategory;
    if (editingCategory) {
      updateCategory.mutate({
        id: editingCategory.id,
        data: {
          name: values.name,
          description: values.description,
          users: values.users,
        },
      });
    }
  };

  const handleDelete = () => {
    deleteCategory.mutate(CategoriesManagementStore.getState().deletedItem);
    setDeleteModal(false);
  };

  if (isCategoriesLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );

  const NoData = () => {
    return (
      <div className="w-full h-full flex justify-center items-center my-5">
        <div>No Form Category available.</div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-[80px]">
        {categories?.items && categories?.items?.length >= 1 ? (
          categories?.items.map((category: any) => (
            <CategoryCard
              key={category.id}
              category={category}
              onMenuClick={handleMenuClick}
            />
          ))
        ) : (
          <NoData />
        )}
      </div>
      <EditCategoryModal onConfirm={handleUpdate} userOptions={userOptions} />
      <DeleteModal
        open={deleteModal}
        onCancel={() => setDeleteModal(false)}
        onConfirm={handleDelete}
      />
      <FeedbackPagination
        current={current}
        total={categories?.meta?.totalItems ?? 1}
        pageSize={pageSize}
        onChange={(page, pageSize) => {
          setCurrent(page);
          setPageSize(pageSize);
        }}
        onShowSizeChange={(size) => {
          setPageSize(size);
          setCurrent(1);
        }}
      />
    </div>
  );
};

export default CategoriesCard;
