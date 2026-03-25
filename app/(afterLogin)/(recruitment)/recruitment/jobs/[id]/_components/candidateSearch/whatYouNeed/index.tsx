import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { useDebounce } from '@/utils/useDebounce';
import { Input } from 'antd';
import React from 'react';

interface WhatYouNeedProps {
  placeholder?: string;
  /** When true, removes right border and right radius for use in a combined search+filter bar */
  embeddedInBar?: boolean;
}

const WhatYouNeed: React.FC<WhatYouNeedProps> = ({
  placeholder = 'Search what you need',
  embeddedInBar = false,
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
        className={`w-full h-11 ${embeddedInBar ? '!rounded-l-lg !rounded-r-none !border-0 !border-r-0 !shadow-none hover:!border-0 focus:!shadow-none' : 'rounded-lg border-gray-300'}`}
        allowClear
        suffix={
          <span
            className="inline-flex items-center h-full min-h-[1.5rem] border-l border-gray-200 pl-2.5 ml-0"
            data-cy="talent-acquisition-job-candidate-search-input-suffix"
          >
            <AiOutlineSearch className="text-gray-400 w-4 h-4 shrink-0" />
          </span>
        }
      />
    </div>
  );
};

export default WhatYouNeed;
