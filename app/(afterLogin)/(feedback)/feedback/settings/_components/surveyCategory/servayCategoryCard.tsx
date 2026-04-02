import { Avatar, Dropdown, Popconfirm, Tag } from 'antd';
import React from 'react';
import DefaultAvatar from '@/public/gender_neutral_avatar.jpg';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { MdOutlineDelete, MdOutlineEdit } from 'react-icons/md';
import { useDeleteFormCategory } from '@/store/server/features/conversation/mutation';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { EmployeeSurveyStore } from '@/store/uistate/features/conversation/survey';
import { BsThreeDots } from 'react-icons/bs';

const ServayCategoryCard = ({ category }: { category: any }) => {
  const { data: userData } = useGetEmployee(category?.createdBy);
  const deleteCategory = useDeleteFormCategory();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { pageSize, current } = EmployeeSurveyStore();
  const {
    setEditModal,
    setEditingCategory,
    setSelectedUsers,
    setDeletedItem,
    setPageSize: setCategoriesPageSize,
    setCurrent: setCategoriesCurrent,
  } = CategoriesManagementStore();

  const handleDelete = () => {
    setDeletedItem(category?.id);
    setCategoriesPageSize(pageSize);
    setCategoriesCurrent(current);
    deleteCategory.mutate(undefined as any);
  };

  const handleEdit = () => {
    const permissions = Array.isArray(category?.permissions)
      ? category.permissions
      : [];

    setSelectedUsers(permissions.map((p: any) => ({ userId: p.userId })));
    setEditingCategory({
      ...category,
      users: permissions.map((p: any) => p.userId),
    });
    setEditModal(true);
  };
  return (
    <div
      className="border border-[#D9D9D9] rounded-md py-2 px-4"
      data-cy={`survey-category-card-${category?.id}`}
      id={`survey-category-card-${category?.id}`}
    >
      <div data-cy={`survey-category-card-content-${category?.id}`}>
        <div
          className="flex justify-between items-center mb-3"
          data-cy={`survey-category-card-header-${category?.id}`}
          id={`surveyCategoryCardHeader${category?.id}`}
        >
          <div
            className="text-sm font-bold"
            data-cy={`survey-category-card-name-${category?.id}`}
          >
            {category.name}
          </div>{' '}
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            arrow
            open={menuOpen}
            onOpenChange={(open) => setMenuOpen(open)}
            menu={{
              onClick: ({ key, domEvent }) => {
                if (key === 'delete') {
                  domEvent.preventDefault();
                  domEvent.stopPropagation();
                  setMenuOpen(true);
                  return;
                }
                setMenuOpen(false);
              },
              items: [
                {
                  key: 'edit',
                  label: 'Edit',
                  icon: <MdOutlineEdit className="w-4 h-4 " />,
                  className: 'text-xs text-gray-600',
                  onClick: () => {
                    handleEdit();
                    setMenuOpen(false);
                  },
                },
                {
                  key: 'delete',
                  className: 'text-xs text-gray-600',
                  label: (
                    <Popconfirm
                      title="Are you sure you want to delete this category?"
                      onConfirm={() => {
                        handleDelete();
                        setMenuOpen(false);
                      }}
                      onCancel={() => {
                        setMenuOpen(false);
                      }}
                      okText="Yes"
                      cancelText="No"
                      okButtonProps={{ loading: deleteCategory.isLoading }}
                      data-cy={`settings-define-meeting-type-card-delete-confirm-${category?.id}`}
                      id={`settingsDefineMeetingTypeCardDeleteConfirm${category?.id}`}
                    >
                      <span
                        className="flex items-center gap-2"
                        data-cy={`survey-category-card-delete-option-${category?.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMenuOpen(true);
                        }}
                      >
                        <MdOutlineDelete className="w-4 h-4" />
                        Delete
                      </span>
                    </Popconfirm>
                  ),
                },
              ],
            }}
          >
            <button
              type="button"
              className="h-6 w-6 cursor-pointer text-gray-500 hover:text-gray-700 p-1.5 border border-[#D9D9D9] rounded-md bg-transparent flex items-center justify-center hover:border-[#D9D9D9]"
              data-cy={`settings-define-meeting-type-card-actions-${category?.id}`}
              id={`settingsDefineMeetingTypeCardActions${category?.id}`}
            >
              <BsThreeDots
                id={`settingsDefineMeetingTypeCardActionsIcon${category?.id}`}
                data-cy={`settings-define-meeting-type-card-actions-icon-${category?.id}`}
                className="text-lg"
              />
            </button>
          </Dropdown>
        </div>

        <div
          className="flex justify-between items-center gap-2"
          data-cy={`survey-category-card-footer-${category?.id}`}
        >
          <div
            data-cy={`survey-category-card-profile-info-${category?.id}`}
            id={`surveyCategoryCardProfileInfo${category?.id}`}
            className="flex items-center  gap-2"
          >
            <Avatar
              size={24}
              src={
                userData?.profileImage ||
                (DefaultAvatar as any).src ||
                (DefaultAvatar as unknown as string)
              }
            />
            <div data-cy="survey-category-card-profile-info">
              <span
                className="text-sm font-bold"
                data-cy="survey-category-card-profile-name"
              >
                {userData?.firstName
                  ? `${userData.firstName} ${userData.middleName} ${userData.lastName}`
                  : ''}
              </span>
            </div>
          </div>
          <Tag key={'green'} color={'green'} className="mr-0">
            Creator{' '}
          </Tag>
        </div>
      </div>
    </div>
  );
};

export default ServayCategoryCard;
