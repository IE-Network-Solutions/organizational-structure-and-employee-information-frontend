'use client';
import { Button } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Custom404() {
  const router = useRouter();
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gray-100"
      data-cy="not-found-page"
    >
      <Image
        unoptimized
        width={200}
        height={200}
        src="/icons/404.svg"
        alt="404 Not Found"
        className="w-1/2 max-w-xs"
      />

      <Button onClick={() => router.back()} data-cy="not-found-back-button">
        Back
      </Button>
      <h1
        className="text-4xl font-bold text-gray-800 mt-4"
        data-cy="not-found-title"
      >
        404 - Page Not Found
      </h1>
    </div>
  );
}
