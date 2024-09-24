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
  return (
    <Modal open={visible} footer={null} onCancel={onClose} centered>
      <div style={{ textAlign: 'center' }} className="grid ">
        <div className="flex justify-center  items-center">
          <Image
            className=""
            src="/icons/success.svg"
            alt="Success"
            width={200}
            height={200}
          />
        </div>

        <Text className="mt-4 font-bold text-2xl">{text}</Text>
      </div>
      <div style={{ width: '100%', marginTop: 20 }}>
        <div
          style={{
            width: '100%',
            height: 10,
            backgroundColor: '#e0e0e0',
            borderRadius: 5,
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#1890ff',
              borderRadius: 5,
              transition: 'width 0.03s',
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default CustomModal;
