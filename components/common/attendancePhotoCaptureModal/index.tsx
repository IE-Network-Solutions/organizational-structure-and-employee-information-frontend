'use client';

import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { AiOutlineCamera } from 'react-icons/ai';
import { Button, Modal, Spin } from 'antd';
import Webcam from 'react-webcam';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { fileUpload } from '@/utils/fileUpload';
import { formatBase64ToFile } from '@/helpers/formatTo';
import NotificationMessage from '@/components/common/notification/notificationMessage';

interface AttendancePhotoCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onCaptureComplete: (fileUrl: string) => void;
}

const MODAL_HEIGHT = 'calc(100dvh - 40px)';

const videoConstraints: MediaTrackConstraints = {
  facingMode: 'user',
};

const AttendancePhotoCaptureModal: FC<AttendancePhotoCaptureModalProps> = ({
  open,
  onClose,
  onCaptureComplete,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const handleClose = useCallback(() => {
    if (!isLoading) {
      onClose();
    }
  }, [isLoading, onClose]);

  const capture = useCallback(() => {
    if (!webcamRef.current) {
      NotificationMessage.error({
        message: 'Camera not ready',
        description:
          'Please allow camera access and wait for the preview to load.',
      });
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot({
      width: 1920,
      height: 1080,
    });

    if (!imageSrc) {
      NotificationMessage.error({
        message: 'Could not capture photo',
        description: 'Please try again or check your camera permissions.',
      });
      return;
    }

    setIsLoading(true);
    const file = formatBase64ToFile(imageSrc, `${Date.now()}.webp`);
    fileUpload(file)
      .then((res) => {
        if (!res?.viewImage) {
          NotificationMessage.error({
            message: 'Photo upload failed',
            description:
              'Could not upload your attendance photo. Please try again.',
          });
          return;
        }
        onCaptureComplete(res.viewImage);
        onClose();
      })
      .catch(() => {
        NotificationMessage.error({
          message: 'Photo upload failed',
          description:
            'Could not upload your attendance photo. Please try again.',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [onCaptureComplete, onClose]);

  useEffect(() => {
    if (!open) {
      setIsLoading(false);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      destroyOnClose
      style={{ top: 20, padding: 0, maxWidth: '100vw' }}
      closeIcon={<IoCloseCircleOutline size={24} className="text-white" />}
      styles={{
        content: {
          height: MODAL_HEIGHT,
          padding: 0,
          overflow: 'hidden',
        },
        body: {
          height: MODAL_HEIGHT,
          padding: 0,
          overflow: 'hidden',
        },
      }}
      width="100vw"
      data-cy="attendance-photo-capture-modal"
    >
      <Spin spinning={isLoading}>
        <div
          className="flex flex-col bg-black"
          style={{ height: MODAL_HEIGHT }}
          data-cy="attendance-photo-capture-modal-content"
        >
          <div className="relative flex-1 min-h-0 overflow-hidden">
            {open && (
              <Webcam
                audio={false}
                mirrored
                screenshotFormat="image/webp"
                videoConstraints={videoConstraints}
                className="absolute inset-0 h-full w-full object-cover"
                ref={webcamRef}
              />
            )}
          </div>

          <div
            className="shrink-0 flex flex-col items-center justify-center gap-2 px-4 py-5 bg-black/80 border-t border-white/10 z-10"
            data-cy="attendance-photo-capture-footer"
          >
            <p className="text-white text-sm text-center m-0 opacity-90">
              Position your face in the frame, then tap Capture
            </p>
            <Button
              type="primary"
              size="large"
              icon={<AiOutlineCamera size={24} className="text-white" />}
              onClick={capture}
              disabled={isLoading}
              className="min-w-[200px] h-12 text-base font-medium"
              data-cy="attendance-photo-capture-button"
              id="attendance-photo-capture-button"
            >
              Capture Photo
            </Button>
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default AttendancePhotoCaptureModal;
