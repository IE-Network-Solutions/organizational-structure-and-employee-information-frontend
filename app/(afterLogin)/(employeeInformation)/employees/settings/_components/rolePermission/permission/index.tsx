import { Card, Input, Select, Table } from 'antd';
import React, { useEffect } from 'react';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import {
  useGetPermissions,
  useSearchPermissions,
} from '@/store/server/features/employees/settings/permission/queries';
import { useGetPermissionGroupsWithOutPagination } from '@/store/server/features/employees/settings/groupPermission/queries';
import { GroupPermissionItem } from '@/store/server/features/employees/settings/groupPermission/interface';
import useDebounce from '@/store/uistate/features/useDebounce';

const Permission: React.FC<any> = () => {
  const {
    permissionCurrentPage,
    pageSize,
    setPermissionCurrentPage,
    setPageSize,
    selectedRowKeys,
    searchTerm,
    setSearchTerm,
  } = useSettingStore();

  const { data: permissionData, isLoading: permissionLoading } =
    useGetPermissions(permissionCurrentPage, pageSize);
  const { data: groupPermissionDatawithOutPagination } =
    useGetPermissionGroupsWithOutPagination();

  const debouncedTerm = useDebounce(searchTerm?.searchTerm, 2000); // returns true and false
  const {
    data: searchUserData,
    isLoading: isSearching,
    refetch,
  } = useSearchPermissions(searchTerm);

  const displayData =
    searchTerm?.searchTerm === null ||
    searchTerm?.searchTerm === '' ||
    searchTerm?.searchTerm === undefined
      ? permissionData
      : searchUserData;

  useEffect(() => {
    if (debouncedTerm) {
      refetch();
    }
  }, [debouncedTerm, refetch]);

  const onPageChange = (page: number, pageSize: number) => {
    setPermissionCurrentPage(page);
    setPageSize(pageSize);
  };
  const hasSelected = selectedRowKeys?.length > 0;
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text:string) => text ?? 'N/A',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (text:string) => text ?? 'N/A',
    },
  ];
  const { Option } = Select;
  const { Search } = Input;
  const handleSearchChange = (e: any, termKey: string) => {
    if (e === undefined || e === '') {
      setSearchTerm({
        termKey: null,
        searchTerm: null,
      });
    } else {
      setSearchTerm({ termKey: termKey, searchTerm: e });
    }
  };

  return (
    <div>
      <Card>
        <div className="flex flex-col lg:flex-row justify-start gap-4">
          <Select
            showSearch
            className="w-full lg:w-1/2"
            placeholder="Select a group"
            optionFilterProp="children"
            allowClear
            onChange={(value) => handleSearchChange(value, 'permissionGroupId')}
            filterOption={(input, option: any) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
          >
            {groupPermissionDatawithOutPagination?.items?.map(
              (item: GroupPermissionItem) => (
                <Option key={item?.id} value={item?.id}>
                  {item?.name}
                </Option>
              ),
            )}
          </Select>
          <Search
            className="w-full lg:w-1/2"
            placeholder="Search permission"
            allowClear
            onChange={(value) => handleSearchChange(value.target.value, 'name')}
          />
        </div>
      </Card>
      <div className="mt-4 mb-4">
        <span className="ml-6">
          {hasSelected ? `Selected ${selectedRowKeys?.length} items` : ''}
        </span>
      </div>
      <Table
        columns={columns}
        dataSource={displayData?.items}
        loading={permissionLoading || isSearching}
        pagination={{
          current: permissionCurrentPage,
          pageSize: pageSize,
          total: displayData?.meta?.totalItems,
          onChange: (page, pageSize) => onPageChange(page, pageSize),
          showSizeChanger: true,
          onShowSizeChange: (page, pageSize) => onPageChange(page, pageSize),
        }}
      />
    </div>
  );
};

export default Permission;
