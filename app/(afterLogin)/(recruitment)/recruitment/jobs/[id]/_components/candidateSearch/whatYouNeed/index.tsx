import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { useDebounce } from '@/utils/useDebounce';
import { Input } from 'antd';
import React from 'react';

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
      <Input.Search
        id={`inputWhatYouNeed${searchParams.whatYouNeed}`}
        data-cy="talent-acquisition-job-candidate-search-input"
        placeholder={placeholder}
        onChange={(e) => handleSearchInput(e.target.value, 'whatYouNeed')}
        className={
          pill
            ? 'w-full h-8 rounded-md border border-gray-300 bg-white overflow-hidden [&_.ant-input-affix-wrapper]:!h-full [&_.ant-input-affix-wrapper]:!border-none [&_.ant-input-affix-wrapper]:!shadow-none [&_.ant-input-group-addon]:!h-full [&_.ant-input-group-addon]:!p-0 [&_.ant-input-group-addon]:!border-l [&_.ant-input-group-addon]:!border-l-gray-300 [&_.ant-input-group-addon]:!border-solid [&_.ant-input-group-addon]:!bg-white [&_.ant-input-search-button]:!h-full [&_.ant-input-search-button]:!border-none [&_.ant-input-search-button]:!rounded-none [&_.ant-input-search-button]:!bg-white'
            : 'w-full h-14'
        }
        allowClear
      />
    </div>
  );
};

export default WhatYouNeed;
