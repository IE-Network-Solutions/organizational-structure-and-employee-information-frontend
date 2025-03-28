import { Button, Card, Typography } from 'antd';
import React from 'react';
import { FaEdit, FaPlus, FaTrashAlt } from 'react-icons/fa';
import { PlusOutlined } from '@ant-design/icons';
import { useTalentPoolSettingsStore } from '@/store/uistate/features/recruitment/settings/talentPoolCategory';
import { useGetTalentPoolCategory } from '@/store/server/features/recruitment/tallentPoolCategory/query';
import CustomDeleteTalentPool from '../deleteModal';
import SkeletonLoading from '@/components/common/loadings/skeletonLoading';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import CustomButton from '@/components/common/buttons/customButton';
import { Pencil, Trash2 } from 'lucide-react';

const { Title } = Typography;

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
        <Title level={5}>Talent Pool Category</Title>
        <AccessGuard permissions={[Permissions.CreateTalentPool]}>
          <CustomButton
            title=" New Talent Pool Category"
            id="createTalentPoolButton"
            icon={<FaPlus size={13} className="mr-2" />}
            onClick={openDrawer}
            className="bg-blue-600 hover:bg-blue-700 h-12 py-5 text-medium font-semibold"
          />
        </AccessGuard>
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
            <div
              key={index}
              className="flex items-center justify-between gap-3 my-5 mx-2 border-gray-100 border-[1px] rounded-md px-2 py-4"
            >
              <div className="text-medium font-medium">{talentPool?.title}</div>

              <div className="flex items-center justify-center gap-2">
                <AccessGuard
                  permissions={[Permissions.UpdateTalentPoolCategory]}
                >
                  <div className="bg-[#2f78ee] w-7 h-7 rounded-md flex items-center justify-center">
                    <Pencil
                      size={15}
                      className="text-white cursor-pointer"
                      onClick={() => handleEditTalentPoolCategory(talentPool)}
                    />
                  </div>
                </AccessGuard>
                <AccessGuard
                  permissions={[Permissions.DeleteTalentPoolCategory]}
                >
                  <div className="bg-[#e03137] w-7 h-7 rounded-md flex items-center justify-center">
                    <Trash2
                      size={15}
                      className="text-white cursor-pointer"
                      onClick={() => handleDeleteTalentPoolCategory(talentPool)}
                    />
                  </div>
                </AccessGuard>
              </div>
            </div>
          ))
        )}
      </div>

      <CustomDeleteTalentPool />
    </div>
  );
}

export default TalentPoolCategoryTab;
