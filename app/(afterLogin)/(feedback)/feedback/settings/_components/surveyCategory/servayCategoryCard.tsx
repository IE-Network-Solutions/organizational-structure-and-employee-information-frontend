import { Avatar, Button, Dropdown, Popconfirm, Tag } from 'antd';
import React from 'react';
import DefaultAvatar from '@/public/gender_neutral_avatar.jpg';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { Edit2Icon } from 'lucide-react';
import { MdDeleteOutline } from 'react-icons/md';
import { useDeleteFormCategory } from '@/store/server/features/conversation/mutation';
import { EllipsisOutlined } from '@ant-design/icons';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { EmployeeSurveyStore } from '@/store/uistate/features/conversation/survey';

const ServayCategoryCard = ({ category }: { category: any }) => {
  const { data: userData } = useGetEmployee(category?.createdBy);
  const deleteCategory = useDeleteFormCategory();
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
      className="border border-gray-200 rounded-md py-2 px-4"
      data-cy={`survey-category-card-${category?.id}`}
      id={`survey-category-card-${category?.id}`}
    >
      <div>
        <div
          className="flex justify-between items-center mb-3"
          data-cy={`survey-category-card-header-${category?.id}`}
          id={`surveyCategoryCardHeader${category?.id}`}
        >
          <div className="text-sm font-bold">{category.name}</div>{' '}
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  key: 'edit',
                  label: 'Edit',
                  icon: <Edit2Icon className="w-4 h-4 text-xs" />,
                  onClick: () => {
                    handleEdit();
                  },
                },
                {
                  key: 'delete',
                  label: (
                    <Popconfirm
                      title="Are you sure you want to delete this category?"
                      onConfirm={handleDelete}
                      okText="Yes"
                      cancelText="No"
                      okButtonProps={{ loading: deleteCategory.isLoading }}
                      data-cy={`settings-define-meeting-type-card-delete-confirm-${category?.id}`}
                      id={`settingsDefineMeetingTypeCardDeleteConfirm${category?.id}`}
                    >
                      <span
                        className="flex items-center gap-2"
                        data-cy={`settings-define-meeting-type-card-delete-${category?.id}`}
                      >
                        <MdDeleteOutline className="w-4 h-4" />
                        Delete
                      </span>
                    </Popconfirm>
                  ),
                },
              ],
            }}
          >
            <Button
              type="text"
              size="small"
              aria-label="DefineMeetingType actions"
              icon={<EllipsisOutlined />}
              className="shrink-0 !h-7 !w-7 !p-0 border border-gray-200 rounded-md flex items-center justify-center"
              data-cy={`settings-define-meeting-type-card-actions-${category?.id}`}
              id={`settingsDefineMeetingTypeCardActions${category?.id}`}
            ></Button>
          </Dropdown>
        </div>

        <div className="flex justify-between items-center gap-2">
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
