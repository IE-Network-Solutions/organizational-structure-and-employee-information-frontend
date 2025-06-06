import React from 'react';
import { Card, Col, Progress, Row, Skeleton } from 'antd';
import { BiAward } from 'react-icons/bi';
import {
  GoArrowUp,
  GoArrowDown,
  GoChevronLeft,
  GoChevronRight,
} from 'react-icons/go';
import { useVariablePayStore } from '@/store/uistate/features/okrplanning/VP';
import { useGetVPScore } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

interface CriteriaCardProps {
  id?: string;
}
const CriteriaCard: React.FC<CriteriaCardProps> = ({ id }) => {
  const { cardsPerPage, visibleIndex, setVisibleIndex } = useVariablePayStore();

  const userId = useAuthenticationStore.getState().userId;
  const identifier = id ?? userId;

  const { data: criteriaCardData, isLoading: isResponseLoading } =
    useGetVPScore(identifier);

  const scrollNext = () => {
    if (visibleIndex + cardsPerPage < criteriaCardData?.criteria?.length) {
      setVisibleIndex(visibleIndex + cardsPerPage);
    }
  };

  const scrollPrev = () => {
    if (visibleIndex > 0) {
      setVisibleIndex(visibleIndex - cardsPerPage);
    }
  };

  return (
    <div className="relative mt-10">
      {isResponseLoading || !criteriaCardData ? (
        <Skeleton active />
      ) : (
        <div>
          <Row className="mx-12" gutter={[16, 10]}>
            {criteriaCardData?.criteria
              .slice(visibleIndex, visibleIndex + cardsPerPage)
              .map((item: any, index: any) => {
                const change =
                  item?.score.toFixed(2) - item?.previousScore.toFixed(2);
                const achievedPercentage = Number(
                  ((item?.score / item?.weight) * 100).toFixed(1),
                );
                return (
                  <Col key={index} xs={24} sm={12} md={8}>
                    <Card className="mt-10 bg-[#FAFAFA]" bordered={false}>
                      <div className="mb-8">
                        {item?.isDeduction === true ? (
                          <div className="flex flex-col ">
                            <div className="font-sm text-sm text-[#d0342c] text-end">
                              Deductible
                            </div>
                            <div className="flex items-end justify-start gap-2">
                              <div className="w-10 h-10 rounded-full bg-[#FFEDEC] flex justify-center items-center">
                                <div>
                                  <BiAward size={25} fill="#d0342c" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-8 flex flex-col">
                            <div className="font-sm text-sm text-[#FAFAFA] text-end">
                              t
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[#7152F30D] flex justify-center items-center">
                              <BiAward size={25} fill="#0BA259" />
                            </div>
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        {item?.name}
                      </h3>
                      <div className="relative ">
                        <div className="flex flex-wrap items-center justify-between">
                          <p className="text-3xl font-bold text-gray-900">
                            {Number(item?.score?.toFixed(2))}%
                          </p>
                          <div className="flex flex-wrap flex-col">
                            <p className="text-sm text-end text-gray-500">
                              {`${Number(item?.score) ? Number(item?.score).toFixed(1) : 0} % achieved out of ${item?.weight || 0}%`}
                            </p>
                            <Progress
                              percent={achievedPercentage}
                              showInfo={false}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center mt-2 text-sm text-gray-500 justify-end">
                        <span
                          className={`font-medium flex items-center ${
                            change >= 0 ? 'text-[#0BA259]' : 'text-red-500'
                          }`}
                        >
                          {change}
                          {change >= 0 ? <GoArrowUp /> : <GoArrowDown />}
                        </span>
                        <span className="ml-2 text-sm font-light">
                          vs last month
                        </span>
                      </div>
                    </Card>
                  </Col>
                );
              })}
          </Row>
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 flex justify-between w-full  z-10">
            {criteriaCardData?.criteria.length > 3 && (
              <>
                <button
                  onClick={scrollPrev}
                  className="bg-gray-400 bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-80 transition"
                  aria-label="Previous"
                  disabled={visibleIndex === 0}
                >
                  <GoChevronLeft size={24} />
                </button>
                <button
                  onClick={scrollNext}
                  className="bg-gray-400 bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-80 transition"
                  aria-label="Next"
                  disabled={
                    visibleIndex + cardsPerPage >=
                    criteriaCardData?.criteria?.length
                  }
                >
                  <GoChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CriteriaCard;
