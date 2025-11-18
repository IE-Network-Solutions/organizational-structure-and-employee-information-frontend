import HtmlStringDisplayer from '@/components/HtmlStringDisplayer';
import React from 'react';

interface CoverLetterProps {
  selectedCandidate: any;
}

const CoverLetter: React.FC<CoverLetterProps> = ({ selectedCandidate }) => {
  return (
    <div
      className="text-sm font-normal"
      id="talent-acquisition-candidate-tab-cover-letter-container"
      data-cy="talent-acquisition-candidate-tab-cover-letter-container"
    >
      <div
        id="talent-acquisition-candidate-tab-cover-letter-content"
        data-cy="talent-acquisition-candidate-tab-cover-letter-content"
      >
        <HtmlStringDisplayer
          htmlString={
            selectedCandidate?.jobCandidate?.[0]?.coverLetter ?? '....'
          }
        />
      </div>
    </div>
  );
};

export default CoverLetter;
