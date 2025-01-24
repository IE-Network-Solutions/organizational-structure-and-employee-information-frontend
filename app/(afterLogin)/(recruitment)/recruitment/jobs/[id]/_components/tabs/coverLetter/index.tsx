import HtmlStringDisplayer from '@/components/HtmlStringDisplayer';
import React from 'react';

interface CoverLetterProps {
  selectedCandidate: any;
}

const CoverLetter: React.FC<CoverLetterProps> = ({ selectedCandidate }) => {
  return (
    <div className="text-sm font-normal">
      <HtmlStringDisplayer
        htmlString={selectedCandidate?.jobCandidate?.[0]?.coverLetter ?? '....'}
      />
    </div>
  );
};

export default CoverLetter;
