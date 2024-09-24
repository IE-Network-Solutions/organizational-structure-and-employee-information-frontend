'use client';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import { Drawer } from 'antd';
import React from 'react';

const CreateJobs: React.FC = () => {
  const { addNewDrawer, setAddNewDrawer } = useJobState();

  //   const addNewDrawerHeader = {
  //     <div></div>
  //   }

  return (
    addNewDrawer && (
      <Drawer open={addNewDrawer} onClose={() => setAddNewDrawer(false)}>
        index
      </Drawer>
    )
  );
};

export default CreateJobs;
