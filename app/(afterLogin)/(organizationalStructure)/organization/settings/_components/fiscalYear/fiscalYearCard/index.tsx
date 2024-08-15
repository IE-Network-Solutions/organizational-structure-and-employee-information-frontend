import React from 'react';
import { Button, Card, List } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useGetAllFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { FiscalYear } from '@/store/server/features/organizationStructure/fiscalYear/interface';
import dayjs from 'dayjs';
import { useDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';

const FiscalYearListCard: React.FC = () => {
  const { data: fiscalYears, isLoading: fiscalYearsFetchLoading } =
    useGetAllFiscalYears();

  const formatDate = (date: Date | null) => {
    return date ? dayjs(date).format('DD MMM, YYYY') : 'N/A';
  };

  const { openDrawer } = useDrawerStore();
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
            <List.Item className="p-2 border ">
              <div className="flex flex-col">
                <span className="font-semibold">{item.name}</span>
                <span className="text-gray-500">
                  {formatDate(item.startDate)} - {formatDate(item.endDate)}
                </span>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default FiscalYearListCard;
