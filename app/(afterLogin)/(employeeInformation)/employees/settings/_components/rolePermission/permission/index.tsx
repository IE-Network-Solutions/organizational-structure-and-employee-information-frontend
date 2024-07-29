import { GroupPermissionkey } from '@/types/dashboard/adminManagement';
import { Card, Input, Select, Table } from 'antd';
import React, { useState } from 'react';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import { useGetPermissions } from '@/store/server/features/employees/settings/permission/queries';
import { useGetPermissionGroups } from '@/store/server/features/employees/settings/groupPermission/queries';

const Permission: React.FC<any> = () => {
  const {
    permissionCurrentPage,
    pageSize,
    setPermissionCurrentPage,
    setPageSize,
    selectedRowKeys,
  } = useSettingStore();
  const [searchTerm, setSearchTerm] = useState<{
    termKey: string | null;
    searchTerm: string | null;
  }>({ termKey: null, searchTerm: null });

  const { data: permissionData, isLoading: permissionLoading } = useGetPermissions();
  const { data: groupPermissionDatawithOutPagination } = useGetPermissionGroups();
  // const debouncedTerm = useDebouncedSearch(searchTerm?.searchTerm, 2000);
  const { data: searchUserData, isLoading: isSearching } =useGetPermissions();
  // const { data: searchUserData, isValidating: isSearching } = useSWR(
  //   searchTerm?.searchTerm !== 'All' && debouncedTerm
  //     ? `${BASE_URL}/permissions?columnName=${searchTerm?.termKey}&query=${searchTerm?.searchTerm}`
  //     : null,
  // );
  const displayData =
    searchTerm?.searchTerm === null ||
    searchTerm?.searchTerm === '' ||
    searchTerm?.searchTerm === undefined
      ? permissionData
      : searchUserData;
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
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
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
            {groupPermissionDatawithOutPagination?.map(
              (item: GroupPermissionkey) => (
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
        dataSource={displayData}
        loading={permissionLoading || isSearching}
        pagination={{
          current: 1,
          pageSize: pageSize,
          total: 4,
          onChange: (page, pageSize) => onPageChange(page, pageSize),
          showSizeChanger: true,
          onShowSizeChange: (page, pageSize) => onPageChange(page, pageSize),
        }}
      />
    </div>
  );
};

export default Permission;
