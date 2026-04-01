'use client';
import React, { useMemo, useState } from 'react';
import { Dropdown, Table, Button } from 'antd';
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
import DeleteModal from '@/components/common/deleteConfirmationModal';

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
          className="text-sm font-bold text-[#4b4b4b]"
        >
          Name
        </span>
      ),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: (
        <span
          id="payroll-tax-rule-range-title"
          data-cy="payroll-tax-rule-range-title"
          className="text-sm font-bold text-[#4b4b4b]"
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
          className="text-sm font-bold text-[#4b4b4b]"
        >
          Tax Rate
        </span>
      ),
      dataIndex: 'rate',
      key: 'rate',
    },
    {
      title: (
        <span
          id="payroll-tax-rule-deduction-title"
          data-cy="payroll-tax-rule-deduction-title"
          className="text-sm font-bold text-[#4b4b4b]"
        >
          Deduction
        </span>
      ),
      dataIndex: 'deduction',
      key: 'deduction',
    },
    {
      title: (
        <span
          id="payroll-tax-rule-action-title"
          data-cy="payroll-tax-rule-action-title"
          className="text-sm font-bold text-[#4b4b4b]"
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
            <Dropdown
              menu={{ items: menuItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <button
                id={`payroll-tax-rule-actions-more-button-${record.id}`}
                data-cy={`payroll-tax-rule-actions-more-button-${record.id}`}
                className="px-2 py-1 border border-gray-200 rounded text-gray-800 hover:bg-gray-100 transition-colors flex items-center justify-center"
                type="button"
                aria-label="More actions"
              >
                <MoreHorizIcon
                  data-cy={`payroll-tax-rule-actions-more-icon-${record.id}`}
                  className="text-[20px] text-gray-800"
                />
              </button>
            </Dropdown>
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
    <div
      id="payroll-tax-rule-page-view-container"
      data-cy="payroll-tax-rule-page-view-container"
      className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden"
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
        className="w-full overflow-x-auto scrollbar-hide"
      >
        <div
          id="payroll-tax-rule-table-inner-view-container"
          data-cy="payroll-tax-rule-table-inner-view-container"
          className="w-full"
        >
          <Table
            id="payroll-tax-rule-table-view-table"
            data-cy="payroll-tax-rule-table-view-table"
            dataSource={paginatedData}
            columns={columns}
            pagination={false}
            scroll={{ x: 'max-content' }}
            bordered={false}
            loading={isLoading}
            rowHoverable={false}
            rowClassName={(notUsed, index) =>
              index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
            }
          />
        </div>
      </div>
      <div
        id="payroll-tax-rule-pagination-footer-view-container"
        data-cy="payroll-tax-rule-pagination-footer-view-container"
        className="border-t border-gray-100 p-4"
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
      <Drawer data-cy="payroll-tax-rule-drawer-view-component" />
      <DeleteModal
        open={deleteModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedDeleteId(null);
        }}
        deleteMessage="Delete Tax Rule"
        customMessage="Are you sure you want to delete this tax rule? This action cannot be undone."
        data-cy="payroll-tax-rule-delete-modal"
        id="payroll-tax-rule-delete-modal"
      />
    </div>
  );
};

export default TaxRules;
