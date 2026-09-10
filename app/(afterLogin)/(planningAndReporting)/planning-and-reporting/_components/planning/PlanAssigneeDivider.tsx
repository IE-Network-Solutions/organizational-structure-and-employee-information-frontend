'use client';

type PlanAssigneeDividerProps = {
  name: string;
  role?: string;
};

export default function PlanAssigneeDivider({
  name,
  role,
}: PlanAssigneeDividerProps) {
  return (
    <div
      className="flex items-center gap-3 pt-2"
      data-cy={`plan-assignee-divider-${name.replace(/\s+/g, '-')}`}
    >
      <div
        data-cy="planning-and-reporting-components-planning-planassigneedivider-tsx-planassigneedivider-div-17"
        className="h-px min-w-0 flex-1 bg-[#E5E7EB]"
        aria-hidden
      />
      <span
        data-cy="planning-and-reporting-components-planning-planassigneedivider-tsx-planassigneedivider-span-18"
        className="shrink-0 text-xs font-medium text-[#8F94A3]"
      >
        {name}
        {role && role !== 'N/A' && role !== 'Plan' ? (
          <span
            data-cy="planning-and-reporting-components-planning-planassigneedivider-tsx-planassigneedivider-span-21"
            className="font-normal text-[#B0B3C0]"
          >
            {' '}
            · {role}
          </span>
        ) : null}
      </span>
      <div
        data-cy="planning-and-reporting-components-planning-planassigneedivider-tsx-planassigneedivider-div-24"
        className="h-px min-w-0 flex-1 bg-[#E5E7EB]"
        aria-hidden
      />
    </div>
  );
}
