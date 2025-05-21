import React from 'react';
import { DatePicker, Calendar, List, Tooltip, Button, Popconfirm } from 'antd';
import dayjs from 'dayjs';
import { FaArrowRightLong } from 'react-icons/fa6';
import { useDelegationState } from '@/store/uistate/features/dashboard/delegation';
import { useGetDelegation } from '@/store/server/features/dashboard/delegation/queries';
import { useResolveActionPlanById } from '@/store/server/features/organization-development/categories/mutation';

const { RangePicker } = DatePicker;

// Define interfaces for delegation items

const Survey: React.FC = () => {
  const { dateRange, setDateRange } = useDelegationState(); // Access the Zustand store
  const { mutate: resolveActionPlan } = useResolveActionPlanById();
  function handleSolve(id: string) {
    resolveActionPlan({ status: 'solved', id: id });
  }
  const { data: delegations, isLoading } = useGetDelegation(
    dateRange?.start,
    dateRange?.end,
  );
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
        dataSource={delegations}
        renderItem={(item) => (
          <List.Item className=" flex gap-2 items-center mt-[10px]">
            <div className="text-[10px] font-bold">
              {dayjs(item.createdAt).format('hh:mm A')}
            </div>
            <div className="bg-gradient-to-b from-blue to-transparent h-8 w-[3px] rounded inline-block "></div>
            <Tooltip title={item.actionToBeTaken}>
              <div className="text-[12px]">
                {item.actionToBeTaken?.length >= 55
                  ? item.actionToBeTaken.slice(0, 55) + '...'
                  : item.actionToBeTaken}
              </div>
            </Tooltip>

            <Popconfirm
              title="Are you sure you want to delete this item?"
              onConfirm={() => handleSolve(item.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button className="text-[10px]" type="primary" size="small">
                Solve
              </Button>
            </Popconfirm>
          </List.Item>
        )}
      />
      {delegations?.length ? (
        <a className="text-xs flex justify-end items-center gap-3">
          View More
          <FaArrowRightLong />
        </a>
      ) : (
        ''
      )}
    </div>
  );
};

export default Survey;
