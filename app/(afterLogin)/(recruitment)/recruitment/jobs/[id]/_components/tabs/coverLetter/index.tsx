import React from 'react';

interface CoverLetterProps {
  selectedCandidate: any;
}

const CoverLetter: React.FC<CoverLetterProps> = ({ selectedCandidate }) => {
  return (
    <div className="text-sm font-normal">
      {selectedCandidate?.jobCandidate?.map(
        (item: any) => item?.coverLetter ?? '....',
      )}
    </div>
  );
};

export default CoverLetter;
