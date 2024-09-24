'use client';
import { useCandidatesStore } from '@/store/uistate/features/recruitment/candidates';
import { DatePicker } from 'antd';
import { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

export default function DateRangePicker() {
  const setFilters = useCandidatesStore((state) => state.setFilters);

  const onChange = (
    dates: [Dayjs | null, Dayjs | null] | null,
    dateStrings: [string, string],
  ) => {
    if (dates) {
      setFilters({
        dateRange: [dates[0]?.toDate() || null, dates[1]?.toDate() || null],
      });
    } else {
      setFilters({ dateRange: [null, null] });
    }
  };

  return <RangePicker onChange={onChange} className="w-full" />;
}
