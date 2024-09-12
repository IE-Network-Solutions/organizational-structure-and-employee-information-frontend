'use client';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import CustomButton from '@/components/common/buttons/customButton';
import { LuPlus } from 'react-icons/lu';
import React from 'react';
import TnaCategoryCard from './_components/categoryCard';
import TnaCategorySidebar from './_components/categorySidebar';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';

const TnaCategoryPage = () => {
  const { setIsShowTnaCategorySidebar } = useTnaSettingsStore();
  return (
    <>
      <PageHeader title="TNA Category" size="small">
        <CustomButton
          title="New Category"
          icon={<LuPlus size={18} />}
          type="primary"
          size="large"
          onClick={() => {
            setIsShowTnaCategorySidebar(true);
          }}
        />
      </PageHeader>

      <TnaCategoryCard />
      <TnaCategoryCard />

      <TnaCategorySidebar />
    </>
  );
};

export default TnaCategoryPage;
