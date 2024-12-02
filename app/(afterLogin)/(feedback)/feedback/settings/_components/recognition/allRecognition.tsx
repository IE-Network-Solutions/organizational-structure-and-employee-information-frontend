import { Button } from 'antd'
import React from 'react'
import { FaPlus } from 'react-icons/fa';
import { ConversationStore } from '@/store/uistate/features/conversation';

function AllRecognition() {
    const { open, setOpen, setSearchField } = ConversationStore();

    const showModal = () => {
      setOpen(true);
    };
  
    const closeModal = () => {
      setOpen(false);
    };
  
  return (
    <div>
        <div className='flex justify-end'>
            <Button className='flex justify-end items-center' icon={<FaPlus/>} type="primary" onClick={showModal}>
              Recognition
            </Button>
        </div>
      
    </div>
  )
}

export default AllRecognition