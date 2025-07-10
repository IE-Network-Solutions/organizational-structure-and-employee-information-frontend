'use client';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import CustomBreadcrumb from '@/components/common/breadCramp';
import React from 'react';
import TalentPoolPage from '../talent-resource/talent-pool/_components/talentPoolpage';
import { useTalentResourceStore } from '@/store/uistate/features/recruitment/talent-resource';
import TalentRoasterPage from './talent-roaster/page';
import InternPage from './intern/page';

const TalentResourcePage = () => {
  const { setActiveTab, activeTab } = useTalentResourceStore();
  return (
    <div className="h-auto w-full">
      <BlockWrapper className="h-auto w-full">
        <div className="flex flex-wrap justify-between items-center">
          <CustomBreadcrumb
            title="Talent Resource"
            subtitle="Profiles of interested and prospective talent."
          />
          <div className="flex items-center bg-[#f5f5f5] shadow-md rounded-lg w-fit h-8 sm:h-16  gap-4 sm:gap-12 mx-3 sm:mx-0">
            <button
              onClick={() => setActiveTab(1)}
              className={
                activeTab === 1
                  ? ' px-4  h-full bg-white text-black text-sm rounded-md transition-all duration-300 shadow-sm'
                  : ' px-4 h-full bg-transparent text-black text-sm transition-all duration-300'
              }
            >
              <span className="text-xs sm:text-sm text-nowrap">
                Talent Pool
              </span>
            </button>
            <button
              onClick={() => setActiveTab(2)}
              className={
                activeTab === 2
                  ? ' px-4 h-full bg-white text-black text-sm rounded-md transition-all duration-300 shadow-sm'
                  : ' px-4  h-full bg-transparent text-black text-sm transition-all duration-300'
              }
            >
              <span className="text-xs sm:text-sm text-nowrap">
                Talent Roster
              </span>
            </button>
            <button
              onClick={() => setActiveTab(3)}
              className={
                activeTab === 3
                  ? ' px-4 h-full bg-white text-black text-sm rounded-md transition-all duration-300 shadow-sm'
                  : ' px-4  h-full bg-transparent text-black text-sm transition-all duration-300'
              }
            >
              <span className="text-xs sm:text-sm text-nowrap">Intern</span>
            </button>
          </div>
        </div>

        <div className="w-full h-auto bg-white rounded-lg p-6 shadow mt-4">
          {activeTab === 1 && <TalentPoolPage />}
          {activeTab === 2 && <TalentRoasterPage />}
          {activeTab === 3 && <InternPage />}
        </div>
      </BlockWrapper>
    </div>
  );
};

export default TalentResourcePage;
