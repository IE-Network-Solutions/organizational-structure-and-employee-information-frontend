import React from 'react';

/**
 * Horizontal rule under page headers, flush with the recruitment layout shell.
 * Mirrors payroll settings: outer layout breaks out of `nav-content-inner`
 * padding (`recruitment/layout.tsx`); this cancels that layout’s inner padding
 * like `payroll/settings/layout.tsx` → `payroll-settings-breadcrumb-tabs-divider-bleed`.
 */
type TalentAcquisitionFullBleedHeaderRuleProps = {
  dataCy: string;
  className?: string;
  borderClassName?: string;
};

const TalentAcquisitionFullBleedHeaderRule: React.FC<
  TalentAcquisitionFullBleedHeaderRuleProps
> = ({ dataCy, className = '', borderClassName = 'border-gray-200' }) => (
  <div
    className={`box-border -mx-2 w-[calc(100%+16px)] border-0 border-b border-solid md:-mx-6 md:w-[calc(100%+48px)] ${borderClassName} ${className}`}
    aria-hidden
    data-cy={dataCy}
  />
);

export default TalentAcquisitionFullBleedHeaderRule;
