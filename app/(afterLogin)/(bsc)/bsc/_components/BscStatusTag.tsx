'use client';

import { Tag } from 'antd';
import { ScorecardStatus } from '@/types/bsc';
import {
  SCORECARD_STATUS_COLOR,
  SCORECARD_STATUS_LABEL,
} from '@/utils/bsc/stateMachine';

export default function BscStatusTag({ status }: { status: ScorecardStatus }) {
  return (
    <Tag color={SCORECARD_STATUS_COLOR[status]}>
      {SCORECARD_STATUS_LABEL[status]}
    </Tag>
  );
}
