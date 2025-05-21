import React from 'react';
import { Checkbox } from 'antd';
import type { GetProp } from 'antd';
import { MdOutlineRadioButtonChecked } from 'react-icons/md';

const Daily = ({
  allPlannedTaskForReport,
}: {
  allPlannedTaskForReport: any[];
}) => {
  function groupByKeyResultIdToArray(data: any) {
    const map = new Map();

    data.forEach((item: any) => {
      const key = item.parentTaskId;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(item);
    });

    return Array.from(map.entries()).map(([parentTaskId, parentTask]) => ({
      parentTaskId,
      parentTask,
    }));
  }

  const planTaskArray =
    allPlannedTaskForReport &&
    groupByKeyResultIdToArray(allPlannedTaskForReport);

  const onChange: GetProp<typeof Checkbox.Group, 'onChange'> = (
    checkedValues,
  ) => {
    // console.log('checked = ', checkedValues);
  };

  return (
    <div className="h-[350px] overflow-y-auto scrollbar-track-primary scrollbar-none">
      {planTaskArray?.length > 0 ? (
        planTaskArray?.map((item: any) => (
          <div key={item?.parentTaskId} className="flex flex-col gap-2  p-2">
            <div className="text-sm font-semibold flex gap-3 items-center ">
              <MdOutlineRadioButtonChecked className="text-primary" />
              {item?.parentTask?.[0]?.parentTask?.task}
            </div>
            <div className="">
              {item?.parentTask?.map((item: any) => (
                <Checkbox.Group style={{ width: '100%' }} onChange={onChange}>
                  <Checkbox value={item?.id}>
                    <div
                      className={`text-sm text-gray-500 ${
                        item?.checked ? 'line-through text-gray-400' : ''
                      }`}
                    >
                      {item?.task}
                    </div>
                  </Checkbox>
                </Checkbox.Group>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-sm font-light flex h-full justify-center items-center ">
          Add your plans to view them here
        </div>
      )}
    </div>
  );
};

export default Daily;
