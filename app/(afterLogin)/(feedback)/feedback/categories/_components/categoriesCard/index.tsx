'use client';
/* eslint-disable local-rules/data-cy-required, @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars */
import React from 'react';
import { useQueries } from 'react-query';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { useFetchCategories } from '@/store/server/features/feedback/category/queries';
import { fetchSurveyCountForCategory } from '@/store/server/features/feedback/form/queries';
import { useDeleteFormCategory } from '@/store/server/features/feedback/category/mutation';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import CategoryCard from './categoryCard';
import EditCategoryModal from './editCategory';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';

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
  const { isMobile, isTablet } = useIsMobile();

  const { data: categories, isLoading: isCategoriesLoading } =
    useFetchCategories(
      pageSize,
      current,
      searchParams?.category_name || '',
      searchParams?.category_description || '',
      searchParams?.createdBy || '',
    );

  const deleteCategory = useDeleteFormCategory();

  const categoryItems = categories?.items ?? [];

  const surveyCountQueries = useQueries(
    categoryItems.map((cat: { id?: string }) => ({
      queryKey: ['forms', String(cat.id), '__surveyTotal__'],
      queryFn: () => fetchSurveyCountForCategory(String(cat.id)),
      enabled: Boolean(cat.id),
      staleTime: 60_000,
    })),
  );

  const surveyCountByCategoryId = new Map<
    string,
    { count?: number; loading: boolean; error: boolean }
  >();
  categoryItems.forEach((cat: { id?: string }, i: number) => {
    const cid = String(cat.id ?? '');
    if (!cid) return;
    const r = surveyCountQueries[i];
    surveyCountByCategoryId.set(cid, {
      count: typeof r?.data === 'number' ? r.data : undefined,
      loading: Boolean(r?.isLoading),
      error: Boolean(r?.isError),
    });
  });

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

  const handleDelete = () => {
    deleteCategory.mutate(CategoriesManagementStore.getState().deletedItem);
    setDeleteModal(false);
  };

  if (isCategoriesLoading)
    return (
      <div
        className="flex flex-col gap-4"
        data-cy="feedback-categories-components-categoriescard-div-loading"
        id="feedback-categories-components-categoriescard-div-loading"
      >
        {/* Light skeleton shimmer (match page layout without heavy UI) */}
        <div className="animate-pulse">
          <div className="w-[299px] h-8 rounded-md border border-[#E2E8F0] bg-gray-50" />
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4"
          data-cy="feedback-categories-components-categoriescard-skeleton-grid"
          id="feedback-categories-components-categoriescard-skeleton-grid"
        >
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              className="h-[172px] border border-[#E2E8F0] rounded-xl bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-32 rounded bg-gray-100 animate-pulse" />
                <div className="h-9 w-10 rounded-lg border border-[#E5E7EB] bg-gray-50 animate-pulse" />
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div className="h-7 w-28 rounded bg-gray-100 animate-pulse" />
              </div>

              <div className="flex items-center justify-between pt-2 gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="h-4 w-40 rounded bg-gray-100 animate-pulse" />
                  <div className="mt-1 h-3 w-24 rounded bg-gray-50 animate-pulse" />
                </div>
                <div className="h-7 w-16 rounded-md bg-gray-50 border border-[#E2E8F0] animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        <div className="h-8 w-full rounded-md bg-gray-50 border border-[#E2E8F0] animate-pulse" />
      </div>
    );

  const NoData = () => {
    return (
      <div
        className="w-full h-full flex justify-center items-center"
        data-cy="feedback-categories-components-categoriescard-div-no-data"
        id="feedback-categories-components-categoriescard-div-no-data"
      >
        <div
          data-cy="feedback-categories-components-categoriescard-div-no-data-text"
          id="feedback-categories-components-categoriescard-div-no-data-text"
        >
          No Form Category available.
        </div>
      </div>
    );
  };

  return (
    <div
      data-cy="feedback-categories-components-categoriescard-div"
      id="feedback-categories-components-categoriescard-div"
      className="flex flex-col gap-4"
    >
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4"
        data-cy="feedback-categories-components-categoriescard-div-cards"
        id="feedback-categories-components-categoriescard-div-cards"
      >
        {categories?.items && categories?.items?.length >= 1 ? (
          categories?.items.map((category: any) => (
            <CategoryCard
              key={category.id}
              category={category}
              surveyCountState={surveyCountByCategoryId.get(
                String(category.id),
              )}
              onMenuClick={handleMenuClick}
              data-cy="feedback-categories-category-card"
            />
          ))
        ) : (
          <NoData data-cy="feedback-categories-components-categoriescard-div-no-data" />
        )}
      </div>
      <EditCategoryModal
        userOptions={userOptions}
        data-cy="feedback-categories-edit-category-modal"
      />
      <DeleteModal
        open={deleteModal}
        onCancel={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        data-cy="feedback-categories-components-categoriescard-modal-delete"
      />
      {(categories?.meta?.totalItems ?? 0) > pageSize &&
        (isMobile || isTablet ? (
          <div
            className=""
            data-cy="feedback-categories-components-categoriescard-mobile-pagination-container"
            id="feedback-categories-components-categoriescard-mobile-pagination-container"
          >
            <CustomMobilePagination
              totalResults={categories?.meta?.totalItems ?? 0}
              pageSize={pageSize}
              currentPage={current}
              onChange={(page, pageSize) => {
                setCurrent(page);
                setPageSize(pageSize);
              }}
              onShowSizeChange={(page, size) => {
                setCurrent(page);
                setPageSize(size);
              }}
              data-cy="feedback-categories-components-categoriescard-mobile-pagination"
            />
          </div>
        ) : (
          <div
            className=""
            data-cy="feedback-categories-components-categoriescard-pagination-container"
            id="feedback-categories-components-categoriescard-pagination-container"
          >
            <CustomPagination
              current={current}
              total={categories?.meta?.totalItems ?? 0}
              pageSize={pageSize}
              onChange={(page, pageSize) => {
                setCurrent(page);
                setPageSize(pageSize);
              }}
              onShowSizeChange={(size) => {
                setPageSize(size);
                setCurrent(1);
              }}
              showPageSizeChanger={false}
              goToOnRight
              className="py-0"
              data-cy="feedback-categories-components-categoriescard-pagination"
            />
          </div>
        ))}
    </div>
  );
};

export default CategoriesCard;
