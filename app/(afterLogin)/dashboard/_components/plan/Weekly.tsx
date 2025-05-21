import React from 'react';
import { BsKey } from 'react-icons/bs';
import { MdOutlineRadioButtonChecked } from 'react-icons/md';

const Weekly = ({
  allPlannedTaskForReport,
}: {
  allPlannedTaskForReport: any[];
}) => {
  function groupByKeyResultIdToArray(data: any) {
    const map = new Map();

    data.forEach((item: any) => {
      const key = item.keyResultId;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(item);
    });

    return Array.from(map.entries()).map(([keyResultId, task]) => ({
      keyResultId,
      task,
    }));
  }

  const planTaskArray =
    allPlannedTaskForReport &&
    groupByKeyResultIdToArray(allPlannedTaskForReport);

  return (
    <div className="h-[350px] overflow-y-auto scrollbar-track-primary scrollbar-none">
      {planTaskArray?.length > 0 ? (
        planTaskArray?.map((item: any) => (
          <div key={item?.keyResultId} className="flex flex-col gap-2  p-2">
            <div className="text-sm font-semibold flex gap-3 items-center ">
              <BsKey className="text-primary" />
              {item?.task?.[0]?.keyResult?.title}
            </div>
            <div className="">
              {item?.task?.map((item: any) => (
                <div className=" flex gap-2">
                  <MdOutlineRadioButtonChecked className="text-primary" />

                  <div
                    className={`text-sm text-gray-500 ${
                      item?.checked ? 'line-through text-gray-400' : ''
                    }`}
                  >
                    {item?.task}
                  </div>
                </div>
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

export default Weekly;
