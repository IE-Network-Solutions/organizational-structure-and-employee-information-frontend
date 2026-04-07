import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { useDebounce } from '@/utils/useDebounce';
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

  const containerSizeClass = embeddedInBar
    ? 'w-full flex-1'
    : fullWidth
      ? 'w-full min-w-0 sm:max-w-[299px]'
      : 'w-full sm:w-[299px]';

  const outerRadius = pill
    ? 'rounded-md'
    : embeddedInBar
      ? 'rounded-l-lg rounded-r-none'
      : 'rounded-[4px]';

  const outerBorder = embeddedInBar
    ? 'border-0 shadow-none'
    : 'border border-solid border-[#D9D9D9]';

  return (
    <div
      id="talent-acquisition-what-you-need-div-container"
      data-cy="talent-acquisition-what-you-need-div-container"
      className={`${containerSizeClass} ${className}`.trim()}
    >
      <div
        className={`flex h-8 items-stretch overflow-hidden bg-white ${outerRadius} ${outerBorder}`}
      >
        <input
          id={`inputWhatYouNeed${searchParams.whatYouNeed}`}
          data-cy="talent-acquisition-job-candidate-search-input"
          type="text"
          placeholder={placeholder}
          onChange={(e) => handleSearchInput(e.target.value, 'whatYouNeed')}
          className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 font-['Calibri'] text-[14px] font-normal leading-none text-black outline-none placeholder:text-[14px] placeholder:leading-none placeholder:text-[rgba(0,0,0,0.25)]"
        />
        <span
          className="flex h-full w-8 shrink-0 items-center justify-center border-l border-solid border-[#D9D9D9] bg-[#FAFAFA]"
          data-cy="talent-acquisition-job-candidate-search-input-suffix"
        >
          <AiOutlineSearch className="h-4 w-4 shrink-0 text-[rgba(0,0,0,0.45)]" />
        </span>
      </div>
    </div>
  );
};

export default WhatYouNeed;
