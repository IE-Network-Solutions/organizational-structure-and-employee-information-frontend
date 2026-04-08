import { Skeleton } from 'antd';

/** Shimmer placeholder for compact meeting detail panel sections (~81px body). */
export default function MeetingPanelBlockSkeleton({
  'data-cy': dataCy,
}: {
  'data-cy'?: string;
}) {
  return (
    <div
      className="flex min-h-0 w-full flex-1 flex-col justify-center gap-2 py-0.5"
      data-cy={dataCy}
    >
      <Skeleton active title={false} paragraph={{ rows: 1 }} className="!m-0" />
    </div>
  );
}
