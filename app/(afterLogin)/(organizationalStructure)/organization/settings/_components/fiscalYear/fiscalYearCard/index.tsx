import React from 'react';
import { Button, Card, Dropdown, List, Menu } from 'antd';
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';
import { useGetAllFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { FiscalYear } from '@/store/server/features/organizationStructure/fiscalYear/interface';
import dayjs, { Dayjs } from 'dayjs';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

const FiscalYearListCard: React.FC = () => {
  const { data: fiscalYears, isLoading: fiscalYearsFetchLoading } =
    useGetAllFiscalYears();
  const { setEditMode, setSelectedFiscalYear, setDeleteMode } =
    useFiscalYearDrawerStore();
  const formatDate = (date: Dayjs | null) => {
    return date ? dayjs(date).format('DD MMM, YYYY') : 'N/A';
  };

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
      <Menu.Item
        key="edit"
        onClick={() => handleEditFiscalYear(scheduleItem)}
        icon={<FaEdit />}
      >
        Edit
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<FaTrashAlt />}
        onClick={() => handleDeleteFiscalYear(scheduleItem)}
      >
        Delete
      </Menu.Item>
    </Menu>
  );
  return (
    <div className=" mx-auto p-4">
      <Card className="shadow-md rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Fiscal Year</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={openDrawer}>
            Create
          </Button>
        </div>
        <List
          loading={fiscalYearsFetchLoading}
          dataSource={fiscalYears?.items || []}
          renderItem={(item: FiscalYear) => (
            <List.Item className="p-2 border flex justify-between items-center ">
              <div className="flex flex-col">
                <span className="font-semibold">{item.name}</span>
                <span className="text-gray-500">
                  {formatDate(item.startDate)} - {formatDate(item.endDate)}
                </span>
              </div>
              <Dropdown overlay={renderMenu(item)} trigger={['click']}>
                <MoreOutlined className="text-lg cursor-pointer" />
              </Dropdown>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default FiscalYearListCard;
