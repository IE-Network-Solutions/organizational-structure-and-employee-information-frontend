import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
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
    <div className=" flex items-center justify-center text-xl font-extrabold px-2">
      Share to other Media
    </div>
  );

  let tenantId = currentTenantId;
  let jobId = selectedJobId;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/job/${tenantId}/${jobId}`;
      setGeneratedUrl(url);
    }
  }, [selectedJobId]);

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
        title={socialMediaShareModalHeader}
        open={shareModalOpen}
        onCancel={handleClose}
        footer={null}
        centered
      >
        <div className="text-lg font-bold">Share</div>
        <div className="flex items-center justify-start gap-5 p-2 py-2">
          <FaXTwitter size={35} />
          <FaFacebook size={35} color="#0866FF" />
          <FaLinkedin size={35} color="#0A66C2" />
          <FaTelegram size={35} color="#2AABEE" />
          <FaWhatsapp size={35} color="#25D366" />
        </div>
        <div className="flex items-center justify-center gap-3 border-[1px] p-2 rounded-md">
          <div className="font-semibold "> {generatedUrl}</div>
          <Divider type="vertical" />
          <div onClick={handleCopy}>
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
