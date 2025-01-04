import React from 'react';
import { Button, Card, Dropdown } from 'antd';
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';
import { useGetAllFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { FiscalYear } from '@/store/server/features/organizationStructure/fiscalYear/interface';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import Pagination from '../../pagination';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const FiscalYearListCard: React.FC = () => {
  const {
    setSelectedFiscalYear,
    setDeleteMode,
    pageSize,
    currentPage,
    setCurrentPage,
    setPageSize,
    setEditMode,
  } = useFiscalYearDrawerStore();

  const { data: fiscalYears, isLoading: fiscalYearsFetchLoading } =
    useGetAllFiscalYears(pageSize, currentPage);

  const { openDrawer } = useFiscalYearDrawerStore();

  const handleMenuClick = (key: string, fYear: FiscalYear) => {
    if (key === 'edit') {
      setSelectedFiscalYear(fYear);
      setEditMode(true);
      openDrawer();
    } else if (key === 'delete') {
      setSelectedFiscalYear(fYear);
      setDeleteMode(true);
    }
  };

  if (fiscalYearsFetchLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className=" mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Fiscal Year</h2>
        <AccessGuard permissions={[Permissions.CreateCalendar]}>
          <Button type="primary" icon={<PlusOutlined />} onClick={openDrawer}>
            Create Fiscal Year
          </Button>
        </AccessGuard>
      </div>
      {fiscalYears?.items && fiscalYears?.items.length > 0 ? (
        fiscalYears?.items?.map((fYear: FiscalYear) => (
          <Card key={fYear?.id} className="my-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p className="font-semibold uppercase text-slate-500">
                  {fYear?.name ?? 'Fiscal Year cards'}
                </p>
                <div className="font-normal text-xs">
                  {fYear?.startDate + ' ' + '—' + ' ' + fYear?.endDate}
                </div>
              </div>
              <AccessGuard
                permissions={[
                  Permissions.UpdateCalendar || Permissions.DeleteCalendar,
                ]}
              >
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'edit',
                        label: 'Edit',
                        onClick: () => handleMenuClick('edit', fYear),
                      },
                      {
                        key: 'delete',
                        label: <span className="text-red-500">Delete</span>,
                        onClick: () => handleMenuClick('delete', fYear),
                      },
                    ],
                  }}
                  trigger={['click']}
                >
                  <MoreOutlined className="text-lg cursor-pointer" />
                </Dropdown>
              </AccessGuard>
            </div>
          </Card>
        ))
      ) : (
        <p className="flex text-center">No Fiscal Year found.</p>
      )}
      <Pagination
        current={currentPage}
        total={fiscalYears?.meta?.totalItems ?? 1}
        pageSize={pageSize}
        onChange={(page, pageSize) => {
          setCurrentPage(page);
          setPageSize(pageSize);
        }}
        onShowSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </div>
  );
};

export default FiscalYearListCard;
