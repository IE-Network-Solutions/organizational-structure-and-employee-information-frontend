import React, { useEffect, useState } from 'react';
import { Card, Avatar, List, Tag, Skeleton } from 'antd';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

interface PropsData {
  filteredData?: any[];
  isLoading: boolean;
}

const CollapsibleCardList: React.FC<PropsData> = ({
  filteredData,
  isLoading,
}: PropsData) => {
  const [collapseStates, setCollapseStates] = useState<boolean[]>(
    Array(filteredData?.length ?? 0).fill(true),
  );

  useEffect(() => {
    setCollapseStates(Array(filteredData?.length ?? 0).fill(true));
  }, [filteredData]);

  const handleCollapseChange = (index: number) => {
    setCollapseStates((prevStates) =>
      prevStates.map((state, i) => (i === index ? !state : state)),
    );
  };

  return (
    <div
      className="max-h-[500px] overflow-y-scroll"
      data-cy="collapsable-card-list-container"
    >
      {isLoading
        ? Array(3)
            .fill(null)
            /* eslint-disable @typescript-eslint/naming-convention */
            .map((index) => (
              <Card key={index} className="mb-3">
                <Skeleton active avatar paragraph={{ rows: 2 }} />
              </Card>
            ))
        : /* eslint-enable @typescript-eslint/naming-convention */
          filteredData?.map((question: any, index: number) => (
            <Card
              key={question.id}
              title={`${question?.questionTitle?.question}`}
              extra={
                <div
                  onClick={() => handleCollapseChange(index)}
                  style={{ cursor: 'pointer' }}
                  data-cy={`collapsable-card-toggle-${index}`}
                >
                  {collapseStates[index] ? (
                    <MdKeyboardArrowDown />
                  ) : (
                    <MdKeyboardArrowUp />
                  )}
                </div>
              }
              className="mb-3"
            >
              {!collapseStates[index] && (
                <List.Item>
                  <div
                    className="flex w-full"
                    data-cy={`collapsable-card-content-${index}`}
                  >
                    <div
                      className="w-1/2 flex items-center"
                      data-cy={`collapsable-card-employee-${index}`}
                    >
                      {question?.responseData?.employeeDetail && (
                        <Avatar src={question?.profileImage} />
                      )}
                      <span
                        className="ml-2 font-semibold overflow-hidden text-ellipsis whitespace-nowrap"
                        style={{ maxWidth: '150px' }} // Adjust maxWidth as needed
                        data-cy={`collapsable-card-employee-name-${index}`}
                      >
                        {question?.responseData?.employeeDetail ?? ''}
                      </span>
                    </div>
                    <div
                      className="w-1/2"
                      data-cy={`collapsable-card-responses-${index}`}
                    >
                      {question?.responseData?.response?.map(
                        (response: any, idx: number) => (
                          <Tag key={idx} color="#1E40AF">
                            {response?.value}
                          </Tag>
                        ),
                      )}
                    </div>
                  </div>
                </List.Item>
              )}
            </Card>
          ))}
    </div>
  );
};

export default CollapsibleCardList;
