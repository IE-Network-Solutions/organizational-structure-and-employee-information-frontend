'use client';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import AllowanceTypeCardGrid from './_components/allowanceTypeCardGrid';

const AllowancePage = () => {
  return (
    <BlockWrapper className="h-auto w-full bg-white px-3 pb-6 pt-4 sm:px-4">
      <AllowanceTypeCardGrid data-cy="compensation-allowance-type-card-grid" />
    </BlockWrapper>
  );
};

export default AllowancePage;
