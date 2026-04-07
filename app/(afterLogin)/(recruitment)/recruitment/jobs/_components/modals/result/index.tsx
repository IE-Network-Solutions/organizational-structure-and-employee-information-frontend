import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import { Button, Modal, Result } from 'antd';
import React from 'react';
import { SUCCESS_RESULT_IMAGE_URL } from '@/constants/publicImageUrls';
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
      <Modal
        data-cy="talent-acquisition-job-result-modal"
        centered
        open={addJobModalResult}
        onCancel={handleClose}
        footer={null}
      >
        <Result
          icon={
            <div
              data-cy="-components-modals-result-index-tsx-index-div-29"
              className="flex items-center justify-center"
            >
              <Image
                src={SUCCESS_RESULT_IMAGE_URL}
                alt="Success result Image"
                width={120}
                height={120}
              />
            </div>
          }
          title={
            <div
              data-cy="-components-modals-result-index-tsx-index-div-38"
              className="font-bold"
            >
              Job Added Successfully!
            </div>
          }
          subTitle={
            <div
              data-cy="-components-modals-result-index-tsx-index-div-40"
              className="text-gray-600"
            >
              New Job have been successfully added, stay tuned!
            </div>
          }
          extra={[
            <Button
              id="talent-acquisition-job-result-button-check-now"
              data-cy="talent-acquisition-job-result-button-check-now"
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
