import React from 'react';
import { Button, Card, Dropdown } from 'antd';
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';
import { useGetAllFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { FiscalYear } from '@/store/server/features/organizationStructure/fiscalYear/interface';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
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

  const handleEditFiscalYear = (data: any) => {
    openDrawer();
    setEditMode(true);
    setSelectedFiscalYear(data);
  };
  const handleMenuClick = () => {};
  const handleDeleteFiscalYear = (data: any) => {
    setSelectedFiscalYear(data);
    setDeleteMode(true);
  };
  const renderMenu = (scheduleItem: any) => (
    <Menu onClick={handleMenuClick}>
      <AccessGuard permissions={[Permissions.UpdateCalendar]}>
        <Menu.Item
          key="edit"
          onClick={() => handleEditFiscalYear(scheduleItem)}
          icon={<FaEdit />}
        >
          Edit
        </Menu.Item>
      </AccessGuard>
      <AccessGuard permissions={[Permissions.DeleteCalendar]}>
        <Menu.Item
          key="delete"
          icon={<FaTrashAlt />}
          onClick={() => handleDeleteFiscalYear(scheduleItem)}
        >
          Delete
        </Menu.Item>
      </AccessGuard>
    </Menu>
  );
  return (
    <div className=" mx-auto p-4">
      <Card className="shadow-md rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Fiscal Year</h2>
          <AccessGuard permissions={[Permissions.CreateCalendar]}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openDrawer}>
              Create
            </Button>
          </AccessGuard>
        </div>
        <List
          loading={fiscalYearsFetchLoading}
          dataSource={fiscalYears?.items || []}
          renderItem={(item: FiscalYear) => (
            <List.Item className="p-2 border flex justify-between items-center ">
              <div className="flex flex-col">
                <p className="font-semibold uppercase text-slate-500">
                  {fYear?.name ?? 'Fiscal Year cards'}
                </p>
                <div className="font-normal text-xs">
                  {fYear?.startDate + ' ' + '—' + ' ' + fYear?.endDate}
                </div>
              </div>
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
