import { Col, Input, Row, Select, Table, Modal, Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import {
  useGetPermissions,
  useSearchPermissions,
} from '@/store/server/features/employees/settings/permission/queries';
import { useGetPermissionGroupsWithOutPagination } from '@/store/server/features/employees/settings/groupPermission/queries';
import { GroupPermissionItem } from '@/store/server/features/employees/settings/groupPermission/interface';
import useDebounce from '@/store/uistate/features/useDebounce';
import { useIsMobile } from '@/hooks/useIsMobile';
import { LuSettings2 } from 'react-icons/lu';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';

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
  const { isMobile, isTablet } = useIsMobile();

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempGroupValue, setTempGroupValue] = useState<string | undefined>(
    searchTerm?.termKey === 'permissionGroupId' &&
      typeof searchTerm?.searchTerm === 'string'
      ? searchTerm?.searchTerm
      : undefined,
  );

  const debouncedTerm = useDebounce(searchTerm?.searchTerm, 2000);
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

  const handleFilterModalOpen = () => {
    setTempGroupValue(
      searchTerm?.termKey === 'permissionGroupId'
        ? typeof searchTerm?.searchTerm === 'string'
          ? searchTerm?.searchTerm
          : undefined
        : undefined,
    );
    setIsFilterModalOpen(true);
  };

  const handleFilterModalOk = () => {
    if (tempGroupValue) {
      handleSearchChange(tempGroupValue, 'permissionGroupId');
    } else {
      handleSearchChange(undefined, 'permissionGroupId');
    }
    setIsFilterModalOpen(false);
  };

  const handleFilterModalCancel = () => {
    setIsFilterModalOpen(false);
  };

  return (
    <div
      id="settings-permission-container"
      data-cy="settings-permission-container"
    >
      <div
        id="settings-permission-filters"
        data-cy="settings-permission-filters"
      >
        {isMobile ? (
          <Row
            gutter={16}
            id="settings-permission-filters-mobile"
            data-cy="settings-permission-filters-mobile"
          >
            <Col
              xl={14}
              lg={14}
              md={14}
              sm={20}
              xs={20}
              id="settings-permission-search-input-wrapper-mobile"
              data-cy="settings-permission-search-input-wrapper-mobile"
            >
              <Input
                className="w-full h-10"
                placeholder="Search permission"
                allowClear
                onChange={(e) => handleSearchChange(e.target.value, 'name')}
                data-cy="settings-permission-search-input-mobile"
              />
            </Col>
            <Col
              xl={10}
              lg={10}
              md={10}
              sm={4}
              xs={4}
              id="settings-permission-group-select-wrapper-mobile"
              data-cy="settings-permission-group-select-wrapper-mobile"
            >
              <Button
                className="w-[48px] h-10 flex items-center justify-center p-0"
                onClick={handleFilterModalOpen}
                icon={<LuSettings2 size={20} />}
              />
            </Col>
          </Row>
        ) : (
          <Row
            gutter={16}
            justify="space-between"
            id="settings-permission-group-select-wrapper-desktop"
            data-cy="settings-permission-group-select-wrapper-desktop"
          >
            <Col
              xl={14}
              lg={14}
              md={14}
              sm={14}
              xs={14}
              id="settings-permission-search-input-wrapper-desktop"
              data-cy="settings-permission-search-input-wrapper-desktop"
            >
              <Input
                className="w-full h-10"
                placeholder="Search permission"
                allowClear
                onChange={(e) => handleSearchChange(e.target.value, 'name')}
                data-cy="settings-permission-search-input"
              />
            </Col>
            <Col
              xl={10}
              lg={10}
              md={10}
              sm={10}
              xs={10}
              id="settings-permission-group-select-wrapper-desktop"
              data-cy="settings-permission-group-select-wrapper-desktop"
            >
              <Select
                showSearch
                className="w-full h-10"
                placeholder="Select a group"
                optionFilterProp="children"
                allowClear
                onChange={(value) =>
                  handleSearchChange(value, 'permissionGroupId')
                }
                data-cy="settings-permission-group-select"
                filterOption={(input, option: any) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
              >
                {groupPermissionDatawithOutPagination?.items?.map(
                  (item: GroupPermissionItem) => (
                    <Option
                      key={item?.id}
                      value={item?.id}
                      id={`settings-permission-group-option-${item?.id}`}
                      data-cy={`settings-permission-group-option-${item?.id}`}
                    >
                      {item?.name}
                    </Option>
                  ),
                )}
              </Select>
            </Col>
          </Row>
        )}
      </div>

      {/* Filter Modal for Mobile/Tablet */}
      <Modal
        title="Filter Options"
        open={isFilterModalOpen}
        onOk={handleFilterModalOk}
        onCancel={handleFilterModalCancel}
        footer={
          <div className="flex justify-center gap-2">
            <Button onClick={handleFilterModalCancel}>Cancel</Button>
            <Button type="primary" onClick={handleFilterModalOk}>
              Filter
            </Button>
          </div>
        }
      >
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">
            Permission Group
          </label>
          <Select
            showSearch
            className="w-full"
            placeholder="Select a group"
            optionFilterProp="children"
            allowClear
            value={tempGroupValue}
            onChange={(value) => setTempGroupValue(value)}
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
        </div>
      </Modal>

      <div
        className="mb-4"
        id="settings-permission-selected-count"
        data-cy="settings-permission-selected-count"
      >
        <span
          className=""
          id="settings-permission-selected-count-text"
          data-cy="settings-permission-selected-count-text"
        >
          {hasSelected ? `Selected ${selectedRowKeys?.length} items` : ''}
        </span>
      </div>
      <Table
        columns={columns}
        dataSource={displayData?.items}
        loading={permissionLoading || isSearching}
        pagination={false}
        id="settings-permission-table"
        data-cy="settings-permission-table"
      />
      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={displayData?.meta?.totalItems ?? 0}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={(pageSize) => {
            setPageSize(pageSize);
            setPermissionCurrentPage(1);
          }}
          data-cy="settings-permission-pagination-mobile"
        />
      ) : (
        <CustomPagination
          current={permissionCurrentPage}
          total={displayData?.meta?.totalItems ?? 0}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={(pageSize) => {
            setPageSize(pageSize);
            setPermissionCurrentPage(1);
          }}
          data-cy="settings-permission-pagination-desktop"
        />
      )}
    </div>
  );
};

export default Permission;
