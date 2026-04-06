import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { useDebounce } from '@/utils/useDebounce';
import { Input } from 'antd';
import React from 'react';
import { AiOutlineSearch } from 'react-icons/ai';

interface WhatYouNeedProps {
  placeholder?: string;
  /** When true, removes right border and right radius for use in a combined search+filter bar */
  embeddedInBar?: boolean;
  /** Backward-compatible styling flag used by candidate page */
  pill?: boolean;
  /** Optional wrapper className used by parent layouts */
  className?: string;
  /** Stretch to parent width (e.g. job details toolbar) */
  fullWidth?: boolean;
}

const WhatYouNeed: React.FC<WhatYouNeedProps> = ({
  placeholder = 'Search what you need',
  embeddedInBar = false,
  pill = false,
  className = '',
  fullWidth = false,
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

  const containerClassName = embeddedInBar
    ? 'w-full flex-1'
    : fullWidth
      ? 'w-full min-w-0'
      : 'w-full sm:w-[360px]';
  const wrapperClassName = `${containerClassName} ${className}`.trim();
  const inputShapeClass = pill
    ? 'rounded-md'
    : 'rounded-[6px] !border-[#D9D9D9] hover:!border-[#D9D9D9]';

  return (
    <div
      id="talent-acquisition-what-you-need-div-container"
      data-cy="talent-acquisition-what-you-need-div-container"
      className={wrapperClassName}
    >
      <Input.Search
        id={`inputWhatYouNeed${searchParams.whatYouNeed}`}
        data-cy="talent-acquisition-job-candidate-search-input"
        placeholder={placeholder}
        onChange={(e) => handleSearchInput(e.target.value, 'whatYouNeed')}
        className={`ta-candidate-search-input w-full !h-10 [&_.ant-input]:!h-10 [&_.ant-input]:!text-[14px] [&_.ant-input]:placeholder:!text-[rgba(0,0,0,0.25)] ${embeddedInBar ? '!rounded-l-lg !rounded-r-none !border-0 !border-r-0 !shadow-none hover:!border-0 focus:!shadow-none' : inputShapeClass}`}
        allowClear
        suffix={
          <span
            className="inline-flex h-10 items-center border-l border-[#D9D9D9] pl-2.5 pr-0.5"
            data-cy="talent-acquisition-job-candidate-search-input-suffix"
          >
            <AiOutlineSearch className="h-4 w-4 shrink-0 text-[rgba(0,0,0,0.45)]" />
          </span>
        }
      />
    </div>
  );
};

export default WhatYouNeed;
