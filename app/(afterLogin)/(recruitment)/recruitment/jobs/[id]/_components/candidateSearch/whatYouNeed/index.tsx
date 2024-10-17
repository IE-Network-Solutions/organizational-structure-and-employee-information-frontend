import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { useDebounce } from '@/utils/useDebounce';
import { Input } from 'antd';
import React from 'react';

const WhatYouNeed: React.FC = () => {
  const { searchParams, setSearchParams } = useCandidateState();

  const handleSearchCandidate = async (
    value: string | boolean,
    keyValue: keyof typeof searchParams,
  ) => {
    setSearchParams(keyValue, value);
  };

  const onSearchChange = useDebounce(handleSearchCandidate, 2000);

  const handleSearchInput = (
    value: string,
    keyValue: keyof typeof searchParams,
  ) => {
    const trimmedValue = value.trim();
    onSearchChange(trimmedValue, keyValue);
  };

  return (
    <div className="w-full">
      <Input
        id={`inputWhatYouNeed${searchParams.whatYouNeed}`}
        placeholder="Search what you need"
        onChange={(e) => handleSearchInput(e.target.value, 'whatYouNeed')}
        className="w-full h-14"
        allowClear
      />
    </div>
  );
};

export default WhatYouNeed;
