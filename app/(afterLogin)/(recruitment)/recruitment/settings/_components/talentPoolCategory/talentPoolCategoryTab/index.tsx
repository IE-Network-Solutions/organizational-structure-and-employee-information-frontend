import { Button, Card } from 'antd';
import React from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { PlusOutlined } from '@ant-design/icons';
import { useTalentPoolSettingsStore } from '@/store/uistate/features/recruitment/settings/talentPoolCategory';
import { useGetTalentPoolCategory } from '@/store/server/features/recruitment/tallentPoolCategory/query';
import CustomDeleteTalentPool from '../deleteModal';
import SkeletonLoading from '@/components/common/loadings/skeletonLoading';

function TalentPoolCategoryTab() {
  const { data: talentPoolCateories, isLoading: fetchLoading } =
    useGetTalentPoolCategory();
  const { openDrawer, setEditMode, setDeleteMode, setSelectedTalentPool } =
    useTalentPoolSettingsStore();

  const handleEditTalentPoolCategory = (data: any) => {
    openDrawer();
    setEditMode(true);
    setSelectedTalentPool(data);
  };

  const handleDeleteTalentPoolCategory = (data: any) => {
    setSelectedTalentPool(data);
    setDeleteMode(true);
  };

  return (
    <div className="p-6">
      {/* Header section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Talent Pool Category</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openDrawer}
          className="bg-purple-600 h-16 font-bold"
        >
          New Talent Pool Category
        </Button>
      </div>

      <div className="space-y-4 w-full">
        {fetchLoading ? (
          <>
            <SkeletonLoading
              alignment="vertical"
              componentType="card"
              count={3}
              type="default"
            />
          </>
        ) : (
          talentPoolCateories?.items?.map((talentPool: any, index: number) => (
            <Card key={index} className="shadow-sm rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">
                  {talentPool.title}
                </span>

                <div>
                  <Button
                    icon={<FaEdit />}
                    onClick={() => handleEditTalentPoolCategory(talentPool)}
                    type="default"
                    size={'large'}
                    className="border-none text-blue-600 mr-2"
                  />
                  <Button
                    icon={<FaTrashAlt />}
                    onClick={() => handleDeleteTalentPoolCategory(talentPool)}
                    type="default"
                    size={'large'}
                    className="border-none text-red-600"
                  />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <CustomDeleteTalentPool />
    </div>
  );
}

export default TalentPoolCategoryTab;
