'use client';

import Image from 'next/image';

export const EmptyImage = () => (
  <Image
    unoptimized
    src="https://cdn.prod.website-files.com/646218c67da47160c64a84d5/6463461598f456345c3a266b_54.png"
    width={100}
    height={100}
    alt="Empty"
  />
);

export const CustomizeRenderEmpty = () => (
  <div
    data-cy="organizational-structure-and-employee-information-frontend-components-emptyindicator-index-tsx-index-div-15"
    className="flex justify-center"
  >
    <div data-cy="organizational-structure-and-employee-information-frontend-components-emptyindicator-index-tsx-index-div-16">
      {/* {' '}
      <EmptyImage /> */}
      <p
        data-cy="organizational-structure-and-employee-information-frontend-components-emptyindicator-index-tsx-index-p-19"
        className="text-black"
      >
        Data Not Found
      </p>
    </div>
  </div>
);
