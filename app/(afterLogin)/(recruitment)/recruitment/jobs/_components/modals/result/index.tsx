import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import { Button, Modal, Result } from 'antd';
import React from 'react';
import SuccessResult from '@/public/image/successResult.png';
import Image from 'next/image';

const AddFormResult: React.FC = () => {
  const { addJobModalResult, setAddJobModalResult, setShareModalOpen } =
    useJobState();
  const handleClose = () => {
    setAddJobModalResult(false);
  };

  const handleShareModal = () => {
    setAddJobModalResult(false);
    setShareModalOpen(true);
  };
  return (
    addJobModalResult && (
      <Modal open={addJobModalResult} onCancel={handleClose} footer={null}>
        <Result
          icon={
            <div className="flex items-center justify-center">
              <Image
                src={SuccessResult}
                alt="Success result Image"
                width={120}
                height={120}
              />
            </div>
          }
          title={<div className="font-bold">Job Added Successfully!</div>}
          subTitle={
            <div className="text-gray-600">
              New Job have been successfully added, stay tuned!
            </div>
          }
          extra={[
            <Button
              type="primary"
              key="CheckNow"
              className="w-full p-5"
              onClick={handleShareModal}
            >
              Check Now
            </Button>,
          ]}
        />
      </Modal>
    )
  );
};

export default AddFormResult;
