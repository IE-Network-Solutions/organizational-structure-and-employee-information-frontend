'use client';

import Image from 'next/image';

export const customizeRenderEmpty = () => (
  <div className="flex justify-center">
    <div>
      {' '}
      <Image
        src="/icons/datanotfound.svg"
        width={100}
        height={100}
        alt="Empty"
      />
      <p className="text-black">Data Not Found</p>
    </div>
  </div>
);
