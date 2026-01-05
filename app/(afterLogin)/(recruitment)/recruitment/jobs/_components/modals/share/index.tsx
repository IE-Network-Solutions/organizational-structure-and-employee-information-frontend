import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import { PUBLIC_DOMAIN } from '@/utils/constants';
import { Divider, Modal } from 'antd';
import { CheckCheck, Copy } from 'lucide-react';
import React, { useEffect } from 'react';
import { FaFacebook, FaLinkedin, FaTelegram, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const ShareToSocialMedia: React.FC = () => {
  const currentTenantId = useAuthenticationStore.getState().tenantId;

  const {
    isChecked,
    generatedUrl,
    setIsChecked,
    shareModalOpen,
    setShareModalOpen,
    selectedJobId,
    setGeneratedUrl,
  } = useJobState();

  const handleClose = () => {
    setShareModalOpen(false);
  };
  const socialMediaShareModalHeader = (
    <div
      className=" flex items-center justify-center text-xl font-extrabold px-2"
      data-cy="talent-acquisition-share-modal-header"
    >
      <span data-cy="talent-acquisition-share-modal-header-text">
        Share to other Media
      </span>
    </div>
  );

  const tenantId = currentTenantId;
  const jobId = selectedJobId;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${PUBLIC_DOMAIN}/job/${tenantId}/${jobId}`;
      setGeneratedUrl(url);
    }
  }, [selectedJobId, tenantId, jobId, setGeneratedUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUrl).then(() => {
      setIsChecked(true);
      setTimeout(() => {
        setIsChecked(false);
      }, 5000);
    });
  };

  return (
    shareModalOpen && (
      <Modal
        data-cy="talent-acquisition-share-modal"
        title={socialMediaShareModalHeader}
        open={shareModalOpen}
        onCancel={handleClose}
        footer={null}
        centered
      >
        <div
          className="text-lg font-bold"
          data-cy="talent-acquisition-share-modal-title"
        >
          Share
        </div>
        <div className="flex items-center justify-start gap-5 p-2 py-2">
          <FaXTwitter
            id="talent-acquisition-share-icon-twitter"
            data-cy="talent-acquisition-share-icon-twitter"
            size={35}
          />
          <FaFacebook
            id="talent-acquisition-share-icon-facebook"
            data-cy="talent-acquisition-share-icon-facebook"
            size={35}
            color="#0866FF"
          />
          <FaLinkedin
            id="talent-acquisition-share-icon-linkedin"
            data-cy="talent-acquisition-share-icon-linkedin"
            size={35}
            color="#0A66C2"
          />
          <FaTelegram
            id="talent-acquisition-share-icon-telegram"
            data-cy="talent-acquisition-share-icon-telegram"
            size={35}
            color="#2AABEE"
          />
          <FaWhatsapp
            id="talent-acquisition-share-icon-whatsapp"
            data-cy="talent-acquisition-share-icon-whatsapp"
            size={35}
            color="#25D366"
          />
        </div>
        <div className="flex items-center justify-center gap-3 border-[1px] p-2 rounded-md">
          <div className="font-semibold "> {generatedUrl}</div>
          <Divider type="vertical" />
          <div
            id="talent-acquisition-share-button-copy"
            data-cy="talent-acquisition-share-button-copy"
            onClick={handleCopy}
          >
            {isChecked ? (
              <CheckCheck
                size={16}
                strokeWidth={1.75}
                className="text-green-500"
              />
            ) : (
              <Copy color="#BDBDBD" size={20} strokeWidth={2.25} />
            )}
          </div>
        </div>
      </Modal>
    )
  );
};

export default ShareToSocialMedia;
