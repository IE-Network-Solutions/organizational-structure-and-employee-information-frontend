import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import { PUBLIC_DOMAIN } from '@/utils/constants';
import { Modal } from 'antd';
import { CheckCheck, Link2 } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';
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

  const tenantId = currentTenantId;
  const jobId = selectedJobId;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${PUBLIC_DOMAIN}/job/${tenantId}/${jobId}`;
      setGeneratedUrl(url);
    }
  }, [selectedJobId, tenantId, jobId, setGeneratedUrl]);

  const encodedUrl = useMemo(
    () => encodeURIComponent(generatedUrl || ''),
    [generatedUrl],
  );

  const shareTargets = useMemo(
    () => ({
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodedUrl}`,
    }),
    [encodedUrl],
  );

  const openShare = (url: string) => {
    if (!generatedUrl) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl).then(() => {
      setIsChecked(true);
      setTimeout(() => {
        setIsChecked(false);
      }, 5000);
    });
  };

  const socialButtonClass =
    'inline-flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[6px] border border-solid border-[#D9D9D9] bg-white transition-colors hover:bg-[#FAFAFA]';

  const socialIconColor = 'rgba(0,0,0,0.7)';
  const socialIconSize = 18;

  return (
    <Modal
      data-cy="talent-acquisition-share-modal"
      title={
        <span
          className="text-base font-bold leading-tight text-[rgba(0,0,0,0.7)]"
          data-cy="talent-acquisition-share-modal-header-text"
        >
          Share to other Media
        </span>
      }
      open={shareModalOpen}
      onCancel={handleClose}
      footer={null}
      centered
      width={480}
      style={{ maxWidth: 'calc(100vw - 16px)' }}
      destroyOnClose
      classNames={{
        header: '!mb-0 !px-6 !pb-3 !pt-6 !text-left',
        body: '!px-6 !pb-6 !pt-0',
      }}
      styles={{
        content: { borderRadius: 8, padding: 0 },
        header: { borderBottom: 'none' },
      }}
    >
      <div className="space-y-4" data-cy="talent-acquisition-share-modal-body">
        <div data-cy="talent-acquisition-share-modal-copy-section">
          <div
            className="mb-2 text-sm font-normal leading-normal text-[#030712]"
            data-cy="talent-acquisition-share-modal-copy-label"
          >
            Copy to share link
          </div>
          <div
            className="flex min-h-10 items-center gap-2 rounded-md border border-solid border-[#D9D9D9] bg-white px-3 py-2"
            data-cy="talent-acquisition-share-modal-link-row"
          >
            <span
              className="min-w-0 flex-1 truncate text-sm font-normal leading-normal text-[#4B5563]"
              data-cy="talent-acquisition-share-modal-link-text"
            >
              {generatedUrl}
            </span>
            <button
              type="button"
              id="talent-acquisition-share-button-copy"
              data-cy="talent-acquisition-share-button-copy"
              onClick={handleCopy}
              aria-label={isChecked ? 'Link copied' : 'Copy link'}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-[rgba(0,0,0,0.7)] hover:bg-[#F3F4F6]"
            >
              {isChecked ? (
                <CheckCheck
                  className="h-3.5 w-3.5 text-emerald-600"
                  strokeWidth={2}
                  aria-hidden
                />
              ) : (
                <Link2
                  className="h-3.5 w-3.5 text-[rgba(0,0,0,0.7)]"
                  strokeWidth={2}
                  aria-hidden
                />
              )}
            </button>
          </div>
        </div>

        <p
          className="text-center text-sm font-normal leading-normal text-[rgba(0,0,0,0.45)]"
          data-cy="talent-acquisition-share-modal-social-divider-text"
        >
          Or Share using social media
        </p>

        <div
          className="flex flex-wrap items-center justify-center gap-3"
          data-cy="talent-acquisition-share-modal-social-row"
        >
          <button
            type="button"
            className={socialButtonClass}
            data-cy="talent-acquisition-share-social-twitter"
            aria-label="Share on X"
            onClick={() => openShare(shareTargets.twitter)}
          >
            <FaXTwitter
              id="talent-acquisition-share-icon-twitter"
              data-cy="talent-acquisition-share-icon-twitter"
              size={socialIconSize}
              color={socialIconColor}
            />
          </button>
          <button
            type="button"
            className={socialButtonClass}
            data-cy="talent-acquisition-share-social-facebook"
            aria-label="Share on Facebook"
            onClick={() => openShare(shareTargets.facebook)}
          >
            <FaFacebook
              id="talent-acquisition-share-icon-facebook"
              data-cy="talent-acquisition-share-icon-facebook"
              size={socialIconSize}
              color={socialIconColor}
            />
          </button>
          <button
            type="button"
            className={socialButtonClass}
            data-cy="talent-acquisition-share-social-linkedin"
            aria-label="Share on LinkedIn"
            onClick={() => openShare(shareTargets.linkedin)}
          >
            <FaLinkedin
              id="talent-acquisition-share-icon-linkedin"
              data-cy="talent-acquisition-share-icon-linkedin"
              size={socialIconSize}
              color={socialIconColor}
            />
          </button>
          <button
            type="button"
            className={socialButtonClass}
            data-cy="talent-acquisition-share-social-telegram"
            aria-label="Share on Telegram"
            onClick={() => openShare(shareTargets.telegram)}
          >
            <FaTelegram
              id="talent-acquisition-share-icon-telegram"
              data-cy="talent-acquisition-share-icon-telegram"
              size={socialIconSize}
              color={socialIconColor}
            />
          </button>
          <button
            type="button"
            className={socialButtonClass}
            data-cy="talent-acquisition-share-social-whatsapp"
            aria-label="Share on WhatsApp"
            onClick={() => openShare(shareTargets.whatsapp)}
          >
            <FaWhatsapp
              id="talent-acquisition-share-icon-whatsapp"
              data-cy="talent-acquisition-share-icon-whatsapp"
              size={socialIconSize}
              color={socialIconColor}
            />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareToSocialMedia;
