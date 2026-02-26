import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { useDebounce } from '@/utils/useDebounce';
import { Input } from 'antd';
import React from 'react';
import { AiOutlineSearch } from 'react-icons/ai';

interface WhatYouNeedProps {
  placeholder?: string;
  className?: string;
  pill?: boolean;
}

const WhatYouNeed: React.FC<WhatYouNeedProps> = ({
  placeholder = 'Search what you need',
  className = 'w-full',
  pill = false,
}) => {
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
    <div
      id="talent-acquisition-what-you-need-div-container"
      data-cy="talent-acquisition-what-you-need-div-container"
      className={className}
    >
      <Input
        id={`inputWhatYouNeed${searchParams.whatYouNeed}`}
        data-cy="talent-acquisition-job-candidate-search-input"
        placeholder={placeholder}
        onChange={(e) => handleSearchInput(e.target.value, 'whatYouNeed')}
        className={
          pill
            ? 'w-full h-10 rounded-full border-gray-300'
            : 'w-full h-14'
        }
        allowClear
        suffix={<AiOutlineSearch className="text-gray-400" />}
      />
    </div>
  );
};

export default WhatYouNeed;
