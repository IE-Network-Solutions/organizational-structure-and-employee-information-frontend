import React from 'react';
import { DatePicker, Calendar, List, Tooltip, Button } from 'antd';
import dayjs from 'dayjs';
import { useSurveyState } from '@/store/uistate/features/dashboard/survey';
import { useGetSurvey } from '@/store/server/features/dashboard/survey/queries';

const { RangePicker } = DatePicker;

// Define interfaces for delegation items

const Survey: React.FC = () => {
  const { dateRange, setDateRange } = useSurveyState(); // Access the Zustand store
  const { data: survey, isLoading } = useGetSurvey(
    dateRange?.start,
    dateRange?.end,
  );
  const date = new Date();
  const dayjsDate = dayjs(date).format('dddd, MMMM D, YYYY');
  const handleDateChange = (dates: any) => {
    if (dates) {
      const startDate = dates[0]?.format('YYYY-MM-DD'); // Format start date
      const endDate = dates[1]?.format('YYYY-MM-DD'); // Format end date

      // Update the Zustand state with the formatted dates
      setDateRange(startDate, endDate);
    } else {
      setDateRange('', ''); // Handle case where no dates are selected
    }
  };
  return (
    <div className="grid">
      <RangePicker
        id={{
          start: 'startInput',
          end: 'endInput',
        }}
        onChange={handleDateChange}
        className="my-2"
      />
      <Calendar headerRender={() => null} fullscreen={false} />

      <List
        loading={isLoading}
        header={<div>{dayjsDate}</div>}
        dataSource={survey}
        pagination={{ pageSize: 5, size: 'small' }}
        renderItem={(item) => (
          <List.Item className="my-2 flex gap-2 items-center">
            <div className="text-[10px] font-bold">
              {dayjs(item.createdAt).format('hh:mm A')}
            </div>
            <div className="bg-gradient-to-b from-blue to-transparent h-10 w-[3px] rounded inline-block mx-4"></div>{' '}
            <div className="flex flex-col">
              <Tooltip title={item?.name}>
                <div className="text-[12px]">
                  {item?.name?.length >= 70
                    ? item?.name?.slice(0, 70) + '...'
                    : item?.name}
                </div>
              </Tooltip>
              <Tooltip title={item?.formCategory.name}>
                <div className="text-sm font-bold">
                  {item?.formCategory.name?.length >= 70
                    ? item?.formCategory?.name.slice(0, 70) + '...'
                    : item?.formCategory?.name}
                </div>
              </Tooltip>
            </div>
            <Button className="text-[10px]" type="primary" size="small">
              Fill
            </Button>
          </List.Item>
        )}
      />
    </div>
  );
};

export default Survey;
