import { Col, Input, Row, Select, Table } from 'antd';
import React, { useEffect } from 'react';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import {
  useGetPermissions,
  useSearchPermissions,
} from '@/store/server/features/employees/settings/permission/queries';
import { useGetPermissionGroupsWithOutPagination } from '@/store/server/features/employees/settings/groupPermission/queries';
import { GroupPermissionItem } from '@/store/server/features/employees/settings/groupPermission/interface';
import useDebounce from '@/store/uistate/features/useDebounce';
import { useIsMobile } from '@/components/common/hooks/useIsMobile';
import { LuSettings2 } from 'react-icons/lu';

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
  const { isMobile } = useIsMobile();

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
      render: (text: string) => text ?? 'N/A',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (text: string) => text ?? 'N/A',
    },
  ];
  const { Option } = Select;
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
      <div>
        {isMobile ? (
          <Row gutter={16}>
            <Col xl={14} lg={14} md={14} sm={20} xs={20}>
              <Input
                className="w-full h-10"
                placeholder="Search permission"
                allowClear
                onChange={(e) => handleSearchChange(e.target.value, 'name')}
              />
            </Col>
            <Col xl={10} lg={10} md={10} sm={4} xs={4}>
              <Select
                showSearch
                className=" control m-0 w-[48px] h-10 mx-auto p-0 pl-2"
                placeholder=""
                optionFilterProp="children"
                dropdownStyle={{ left: '50%', transform: 'translateX(-50%)' }}
                dropdownMatchSelectWidth={false}
                allowClear
                onChange={(value) =>
                  handleSearchChange(value, 'permissionGroupId')
                }
                filterOption={(input, option: any) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                suffixIcon={
                  <div className="flex items-center justify-center w-full h-full text-black">
                    <LuSettings2 size={20} />
                  </div>
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
              {/* </div> */}
            </Col>
          </Row>
        ) : (
          <Row gutter={16} justify="space-between">
            <Col xl={14} lg={14} md={14} sm={14} xs={14}>
              <Input
                className="w-full h-10"
                placeholder="Search permission"
                allowClear
                onChange={(e) => handleSearchChange(e.target.value, 'name')}
              />
            </Col>
            <Col xl={10} lg={10} md={10} sm={10} xs={10}>
              <Select
                showSearch
                className="w-full h-10"
                placeholder="Select a group"
                optionFilterProp="children"
                allowClear
                onChange={(value) =>
                  handleSearchChange(value, 'permissionGroupId')
                }
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
              {/* </div> */}
            </Col>
          </Row>
        )}
      </div>
      <div className="mb-4">
        <span className="">
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
