'use client'
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { Button, Input, DatePicker, Select } from 'antd';
import React from 'react';
import { FaPlus, FaCopy } from 'react-icons/fa';
import TalentPoolPage from '../talent-resource/talent-pool/_components/talentPoolpage'
import { useTalentResourceStore } from '@/store/uistate/features/recruitment/talent-resource';
import TalentRoasterPage from './talent-roaster/page';
import InternPage from './intern/page';

const { RangePicker } = DatePicker;

const TalentResourcePage = () => {
  const {
    setActiveTab,
    activeTab,
   
  } = useTalentResourceStore();
  return (
    <div className="h-auto w-full">
      <BlockWrapper className="h-auto w-full">
        <div className="flex flex-wrap justify-between items-center">
          <CustomBreadcrumb
            title="Talent Resource"
            subtitle="Profiles of interested and prospective talent."
          />
          <div className="flex items-center bg-gray-50 shadow-md rounded-lg w-fit h-16 px-3 p-1 gap-12">
            <button
              onClick={() => setActiveTab(1)}
              className={
                activeTab === 1
                  ? ' px-4  h-full bg-white text-black text-sm rounded-md transition-all duration-300 shadow-sm'
                  : ' px-4 h-full bg-transparent text-black text-sm transition-all duration-300'
              }
            >
              Talent Pool
            </button>
            <button
              onClick={() => setActiveTab(2)}
              className={
                activeTab === 2
                  ? ' px-4 h-full bg-white text-black text-sm rounded-md transition-all duration-300 shadow-sm'
                  : ' px-4  h-full bg-transparent text-black text-sm transition-all duration-300'
              }
            >
              Talent Roaster
            </button>
            <button
              onClick={() => setActiveTab(3)}
              className={
                activeTab === 3
                  ? ' px-4 h-full bg-white text-black text-sm rounded-md transition-all duration-300 shadow-sm'
                  : ' px-4  h-full bg-transparent text-black text-sm transition-all duration-300'
              }
            >
              Intern
            </button>
          </div>
        </div>

        <div className="w-full h-auto bg-white rounded-lg p-6 shadow mt-4">
         {activeTab === 1 && <TalentPoolPage/>}
         {activeTab === 2 && <TalentRoasterPage/>}
         {activeTab === 3 && <InternPage/>}
        </div>
      </BlockWrapper>
    </div>
  );
};

export default TalentResourcePage;
