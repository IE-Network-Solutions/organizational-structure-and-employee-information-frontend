import Link from 'next/link';
import React from 'react';

type Props = {
  active: 'types' | 'history';
  historyHref: string;
};

const tabActive =
  '-mb-px border-b-2 border-primary pb-3 text-sm font-semibold text-primary';
const tabInactive =
  '-mb-px border-b-2 border-transparent pb-3 text-sm font-medium text-gray-500 hover:text-gray-700';

export default function RecognitionTabs({ active, historyHref }: Props) {
  return (
    <nav
      className="flex gap-8 border-b border-gray-200 mt-4 mb-4"
      aria-label="Recognition sections"
      data-cy="recognition-section-tabs"
    >
      <Link
        href={historyHref}
        className={active === 'history' ? tabActive : tabInactive}
        data-cy="recognition-tab-history"
      >
        Recognition History
      </Link>
      <Link
        href="/feedback/recognition"
        className={active === 'types' ? tabActive : tabInactive}
        data-cy="recognition-tab-types"
      >
        Recognition Types
      </Link>
    </nav>
  );
}
