'use client';
import React, { useMemo, useState } from 'react';
import { Dropdown, Table, Button, Popconfirm } from 'antd';
import type { MenuProps } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Drawer from './_components/drawer';
import { useGetTaxRule } from '@/store/server/features/payroll/setting/tax-rule/queries';
import { useDeleteTaxRule } from '@/store/server/features/payroll/setting/tax-rule/mutation';
import useDrawerStore from '@/store/uistate/features/payroll/settings/taxRules/taxRulesStore';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import CustomPagination from '@/components/customPagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { TableSkeleton } from '@/components/tableSkeleton';

interface TaxRule {
  id: string;
  key: string;
  name: string;
  range: string;
  minIncome: number;
  maxIncome: number;
  rate: number;
  deduction: number;
}

const TaxRules = () => {
  const { openDrawer, setCurrentTaxRule } = useDrawerStore();

  const { data, isLoading } = useGetTaxRule();
  const { mutate: deleteTaxRule } = useDeleteTaxRule();
  const { isMobile, isTablet } = useIsMobile();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const dataSource = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return dataSource.slice(start, start + pageSize);
  }, [currentPage, pageSize, dataSource]);

  const columns: Array<{
    title: React.ReactNode;
    dataIndex?: keyof TaxRule;
    key: string;
    sorter?: (a: TaxRule, b: TaxRule) => number;
    render?: (text: any, record: TaxRule) => React.ReactNode;
  }> = [
    {
      title: (
        <span
          id="payroll-tax-rule-name-title"
          data-cy="payroll-tax-rule-name-title"
          className="text-base font-bold text-black/70"
        >
          Name
        </span>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: TaxRule) => (
        <span
          id={`payroll-tax-rule-name-cell-${record.id}`}
          data-cy={`payroll-tax-rule-name-cell-${record.id}`}
          className="text-sm text-gray-700"
        >
          {text}
        </span>
      ),
    },
    {
      title: (
        <span
          id="payroll-tax-rule-range-title"
          data-cy="payroll-tax-rule-range-title"
          className="text-base font-bold text-black/70"
        >
          Range
        </span>
      ),
      key: 'range',

      render: (notused: any, record: TaxRule) => {
        const { minIncome, maxIncome } = record;
        return (
          <span
            id={`payroll-tax-rule-range-view-text-${record.id}`}
            data-cy={`payroll-tax-rule-range-view-text-${record.id}`}
            className="text-sm text-gray-700"
          >
            {minIncome} - {maxIncome}
          </span>
        );
      },
    },
    {
      title: (
        <span
          id="payroll-tax-rule-tax-rate-title"
          data-cy="payroll-tax-rule-tax-rate-title"
          className="text-base font-bold text-black/70"
        >
          Tax Rate
        </span>
      ),
      dataIndex: 'rate',
      key: 'rate',
      render: (text: number, record: TaxRule) => (
        <span
          id={`payroll-tax-rule-rate-cell-${record.id}`}
          data-cy={`payroll-tax-rule-rate-cell-${record.id}`}
          className="text-sm text-gray-700"
        >
          {text}
        </span>
      ),
    },
    {
      title: (
        <span
          id="payroll-tax-rule-deduction-title"
          data-cy="payroll-tax-rule-deduction-title"
          className="text-base font-bold text-black/70"
        >
          Deduction
        </span>
      ),
      dataIndex: 'deduction',
      key: 'deduction',
      render: (text: number, record: TaxRule) => (
        <span
          id={`payroll-tax-rule-deduction-cell-${record.id}`}
          data-cy={`payroll-tax-rule-deduction-cell-${record.id}`}
          className="text-sm text-gray-700"
        >
          {text}
        </span>
      ),
    },
    {
      title: (
        <span
          id="payroll-tax-rule-action-title"
          data-cy="payroll-tax-rule-action-title"
          className="text-base font-bold text-black/70"
        >
          Action
        </span>
      ),
      key: 'action',
      render: (text: any, record: any) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'edit',
            label: (
              <span
                id={`payroll-tax-rule-actions-menu-edit-text-${record.id}`}
                data-cy={`payroll-tax-rule-actions-menu-edit-text-${record.id}`}
              >
                Edit
              </span>
            ),
            icon: (
              <EditOutlined
                style={{ fontSize: 14, color: '#595959' }}
                data-cy={`payroll-tax-rule-actions-menu-edit-icon-${record.id}`}
              />
            ),
            onClick: () => handleEdit(record),
          },
          {
            key: 'delete',
            label: (
              <span
                id={`payroll-tax-rule-actions-menu-delete-text-${record.id}`}
                data-cy={`payroll-tax-rule-actions-menu-delete-text-${record.id}`}
              >
                Delete
              </span>
            ),
            icon: (
              <DeleteOutlined
                style={{ fontSize: 14, color: '#595959' }}
                data-cy={`payroll-tax-rule-actions-menu-delete-icon-${record.id}`}
              />
            ),
            onClick: () => handleDelete(record.id),
          },
        ];

        return (
          <div
            id={`payroll-tax-rule-actions-view-container-${record.id}`}
            data-cy={`payroll-tax-rule-actions-view-container-${record.id}`}
            className="flex items-center"
          >
            <Popconfirm
              title={
                <span
                  className="text-base font-semibold text-gray-900"
                  data-cy="payroll-tax-rule-delete-popconfirm-title"
                >
                  Delete Tax Rule
                </span>
              }
              description="Are you sure you want to delete this tax rule? This action cannot be undone."
              open={deleteModalOpen && selectedDeleteId === record.id}
              onConfirm={handleConfirmDelete}
              onCancel={() => {
                setDeleteModalOpen(false);
                setSelectedDeleteId(null);
              }}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{
                danger: true,
                className: 'px-5 h-9 text-sm font-medium',
              }}
              cancelButtonProps={{
                className: 'px-5 h-9 text-sm font-medium border-gray-300',
              }}
              placement={isMobile ? 'bottom' : 'bottomLeft'}
              icon={null}
              overlayStyle={{
                width: isMobile ? 'calc(100vw - 32px)' : 420,
                maxWidth: 420,
              }}
              id={`payroll-tax-rule-delete-popconfirm-${record.id}`}
              data-cy={`payroll-tax-rule-delete-popconfirm-${record.id}`}
            >
              <Dropdown
                menu={{ items: menuItems }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button
                  type="default"
                  className="w-8 h-8 border border-[#D9D9D9]"
                  id={`payroll-tax-rule-actions-more-button-${record.id}`}
                  data-cy={`payroll-tax-rule-actions-more-button-${record.id}`}
                  aria-label="More actions"
                >
                  <MoreHorizIcon
                    data-cy={`payroll-tax-rule-actions-more-icon-${record.id}`}
                  />
                </Button>
              </Dropdown>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const handleEdit = (record: any) => {
    setCurrentTaxRule(record);
    openDrawer();
  };

  const handleDelete = (recordId: string) => {
    setSelectedDeleteId(recordId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedDeleteId) return;
    deleteTaxRule(selectedDeleteId, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setSelectedDeleteId(null);
      },
    });
  };

  const handleAddRule = () => {
    openDrawer();
  };

  const onPageChange = (page: number, newPageSize?: number) => {
    setCurrentPage(page);
    if (newPageSize) setPageSize(newPageSize);
  };

  const onPageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const onMobilePaginationChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <BlockWrapper className="h-auto w-full bg-white px-3 pb-6 pt-3">
      <div
        id="payroll-tax-rule-page-view-container"
        data-cy="payroll-tax-rule-page-view-container"
        className="overflow-hidden"
      >
        <div
          className="overflow-hidden rounded-lg border border-gray-100 bg-white"
          data-cy="payroll-tax-rule-page-view-container-div-1"
        >
          <div
            id="payroll-tax-rule-header-view-container"
            data-cy="payroll-tax-rule-header-view-container"
            className="hidden"
          />
          <div
            id="payroll-tax-rule-hidden-primary-action-target"
            data-cy="payroll-tax-rule-hidden-primary-action-target"
            className="hidden"
          >
            <Button
              id="payroll-tax-rule-add-click-button"
              data-cy="payroll-tax-rule-add-click-button"
              type="primary"
              onClick={handleAddRule}
            >
              <span
                id="payroll-tax-rule-add-click-button-text"
                data-cy="payroll-tax-rule-add-click-button-text"
              >
                Add Tax Rule
              </span>
            </Button>
          </div>
          <div
            id="payroll-tax-rule-table-wrapper-view-container"
            data-cy="payroll-tax-rule-table-wrapper-view-container"
            className="w-full overflow-x-auto scrollbar-hide px-4 pt-4 pb-2"
          >
            <div
              id="payroll-tax-rule-table-inner-view-container"
              data-cy="payroll-tax-rule-table-inner-view-container"
              className="w-full bg-white"
            >
              {isLoading ? (
                <TableSkeleton columns={columns} />
              ) : (
                <Table
                  id="payroll-tax-rule-table-view-table"
                  data-cy="payroll-tax-rule-table-view-table"
                  className="w-full [&_.ant-table-thead_.ant-table-cell]:font-semibold [&_.ant-table]:!rounded-none [&_.ant-table-container]:!rounded-none [&_.ant-table-wrapper]:!rounded-none [&_.ant-table-content]:!rounded-none [&_.ant-table-thead>tr>th:first-child]:!rounded-tl-none [&_.ant-table-thead>tr>th:last-child]:!rounded-tr-none [&_.ant-table-thead_.ant-table-cell:first-child]:!rounded-tl-none [&_.ant-table-thead_.ant-table-cell:last-child]:!rounded-tr-none"
                  dataSource={paginatedData}
                  columns={columns}
                  pagination={false}
                  scroll={{ x: 'max-content' }}
                  bordered={false}
                  rowHoverable={false}
                  // eslint-disable-next-line
                rowClassName={(_notUsed, index) =>
                    `h-[60px]${index % 2 === 1 ? ' bg-gray-50' : ''}`
                  }
                />
              )}
            </div>
          </div>
          <div
            id="payroll-tax-rule-pagination-footer-view-container"
            data-cy="payroll-tax-rule-pagination-footer-view-container"
            className="p-4"
          >
            {isMobile || isTablet ? (
              <CustomMobilePagination
                id="payroll-tax-rule-table-mobile-pagination"
                data-cy="payroll-tax-rule-mobile-pagination-view-component"
                totalResults={dataSource.length}
                pageSize={pageSize}
                currentPage={currentPage}
                onChange={onMobilePaginationChange}
                onShowSizeChange={onMobilePaginationChange}
              />
            ) : (
              <CustomPagination
                id="payroll-tax-rule-table-pagination"
                data-cy="payroll-tax-rule-desktop-pagination-view-component"
                current={currentPage}
                total={dataSource.length}
                pageSize={pageSize}
                onChange={onPageChange}
                onShowSizeChange={onPageSizeChange}
              />
            )}
          </div>
        </div>
        <Drawer data-cy="payroll-tax-rule-drawer-view-component" />
      </div>
    </BlockWrapper>
  );
};

export default TaxRules;
