'use client';
import { Modal, Typography } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const { Text } = Typography;

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  text: string;
  route: string;
}

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  text,
  route,
}) => {
  const router = useRouter();

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (visible) {
      let start = 0;
      const interval = 30;
      const duration = 3000;

      const timer = setInterval(() => {
        start += interval;
        setProgress((start / duration) * 100);

        if (start >= duration) {
          clearInterval(timer);
          router.push(route);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [visible, router, route]);
  const modalSlug = toSlug(text || route || 'success-modal');
  return (
    <Modal
      open={visible}
      footer={null}
      onCancel={onClose}
      centered
      data-cy={`success-modal-${modalSlug}`}
    >
      <div
        style={{ textAlign: 'center' }}
        className="grid "
        id={`success-modal-content-${modalSlug}`}
        data-cy={`success-modal-content-${modalSlug}`}
      >
        <div
          className="flex justify-center  items-center"
          id={`success-modal-image-wrapper-${modalSlug}`}
          data-cy={`success-modal-image-wrapper-${modalSlug}`}
        >
          <Image
            unoptimized
            className=""
            src="/icons/success.svg"
            alt="Success"
            width={200}
            height={200}
            id={`success-modal-image-${modalSlug}`}
            data-cy={`success-modal-image-${modalSlug}`}
          />
        </div>

        <Text
          className="mt-4 font-bold text-2xl"
          id={`success-modal-text-${modalSlug}`}
          data-cy={`success-modal-text-${modalSlug}`}
        >
          {text}
        </Text>
      </div>
      <div
        style={{ width: '100%', marginTop: 20 }}
        id={`success-modal-progress-wrapper-${modalSlug}`}
        data-cy={`success-modal-progress-wrapper-${modalSlug}`}
      >
        <div
          style={{
            width: '100%',
            height: 10,
            backgroundColor: '#e0e0e0',
            borderRadius: 5,
          }}
          id={`success-modal-progress-track-${modalSlug}`}
          data-cy={`success-modal-progress-track-${modalSlug}`}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#1890ff',
              borderRadius: 5,
              transition: 'width 0.03s',
            }}
            id={`success-modal-progress-bar-${modalSlug}`}
            data-cy={`success-modal-progress-bar-${modalSlug}`}
          />
        </div>
      </div>
    </Modal>
  );
};

export default CustomModal;
