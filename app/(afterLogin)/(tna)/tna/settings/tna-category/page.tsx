'use client';
import React, { useEffect } from 'react';
import TnaCategoryCard from './_components/categoryCard';
import TnaCategorySidebar from './_components/categorySidebar';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';
import { useGetTnaCategory } from '@/store/server/features/tna/category/queries';
import { Button, Spin } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { FaPlus } from 'react-icons/fa';

const TnaCategoryPage = () => {
  const { isShowTnaCategorySidebar, setIsShowTnaCategorySidebar } =
    useTnaSettingsStore();
  const { data, isFetching, refetch } = useGetTnaCategory({});

  useEffect(() => {
    if (!isShowTnaCategorySidebar) {
      refetch();
    }
  }, [isShowTnaCategorySidebar]);

  return (
    <div className="p-5 rounded-2xl bg-white h-full">
      <div className="flex justify-between mb-4">
        <h1 className="text-lg text-bold">TNA Category</h1>
        <AccessGuard permissions={[Permissions.CreateTnaCategory]}>
          <Button
            id="tnaNewCategoryButtonId"
            icon={<FaPlus />}
            type="primary"
            size="large"
            onClick={() => {
              setIsShowTnaCategorySidebar(true);
            }}
          >
            <span className="hidden lg:inline">New Category</span>
          </Button>
        </AccessGuard>
      </div>

      <Spin spinning={isFetching}>
        {data?.items ? (
          data.items.map((item) => (
            <TnaCategoryCard key={item.id} item={item} />
          ))
        ) : (
          <div className="p-5"></div>
        )}
      </Spin>

      <TnaCategorySidebar />
    </div>
  );
};

export default TnaCategoryPage;
