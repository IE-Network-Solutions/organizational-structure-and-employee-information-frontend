import React from 'react';
import { Avatar } from 'antd';
import { FaBomb } from 'react-icons/fa';
import { LuAward, LuUsers } from 'react-icons/lu';
import { GoArrowDown, GoArrowUp } from 'react-icons/go';
import { Card, Skeleton } from 'antd';

interface FeedbackCardProps {
  appreciationPercentage: string;
  appreciationText?: string;
  total: number;
  contributorCount: number;
  type: string;
  textType: string;
}

export function FeedbackCard({
  appreciationPercentage,
  appreciationText,
  total,
  contributorCount,
  type,
  textType,
}: FeedbackCardProps) {
  return (
    <div data-cy={`feedback-feedback-components-feedbackcard-div-${textType}`} id={`feedback-feedback-components-feedbackcard-div-${textType}`}>
      <Card data-cy={`feedback-feedback-components-feedbackcard-card-${textType}`} id={`feedback-feedback-components-feedbackcard-card-${textType}`}>
        <div className="flex justify-between" data-cy={`feedback-feedback-components-feedbackcard-div-header-${textType}`} id={`feedback-feedback-components-feedbackcard-div-header-${textType}`}>
          <Avatar
            className={`${type === 'appreciation' ? 'text-green-800 bg-gray-300' : 'text-red-400: bg-[#FF782D33]'} -mt-2`}
            data-cy={`feedback-feedback-components-feedbackcard-avatar-${textType}`}
          >
            {type === 'appreciation' ? (
              <LuAward data-cy={`feedback-feedback-components-feedbackcard-icon-award-${textType}`} id={`feedback-feedback-components-feedbackcard-icon-award-${textType}`} />
            ) : (
              <FaBomb className="text-red-600" data-cy={`feedback-feedback-components-feedbackcard-icon-bomb-${textType}`} id={`feedback-feedback-components-feedbackcard-icon-bomb-${textType}`} />
            )}
          </Avatar>
          <div className="flex text-xs text-gray-400" data-cy={`feedback-feedback-components-feedbackcard-div-percentage-${textType}`} id={`feedback-feedback-components-feedbackcard-div-percentage-${textType}`}>
            <span className="flex text-green-800 mx-2" data-cy={`feedback-feedback-components-feedbackcard-span-percentage-${textType}`} id={`feedback-feedback-components-feedbackcard-span-percentage-${textType}`}>
              {!isNaN(Number(appreciationPercentage)) ? (
                Math.floor(Number(appreciationPercentage)) > 0 ? (
                  <>
                    <GoArrowUp data-cy={`feedback-feedback-components-feedbackcard-icon-arrow-up-${textType}`} id={`feedback-feedback-components-feedbackcard-icon-arrow-up-${textType}`} /> {appreciationPercentage}%
                  </>
                ) : (
                  <>
                    <GoArrowDown data-cy={`feedback-feedback-components-feedbackcard-icon-arrow-down-${textType}`} id={`feedback-feedback-components-feedbackcard-icon-arrow-down-${textType}`} /> {appreciationPercentage}%
                  </>
                )
              ) : (
                <>{appreciationPercentage}</>
              )}
            </span>
            Vs Last Week
          </div>
        </div>
        <div className="text-gray-400  my-1" data-cy={`feedback-feedback-components-feedbackcard-div-description-${textType}`} id={`feedback-feedback-components-feedbackcard-div-description-${textType}`}>
          {textType === 'appreciationIssued' && (
            <div data-cy={`feedback-feedback-components-feedbackcard-div-appreciation-issued-${textType}`} id={`feedback-feedback-components-feedbackcard-div-appreciation-issued-${textType}`}>
              <span data-cy={`feedback-feedback-components-feedbackcard-span-appreciation-issued-${textType}`} id={`feedback-feedback-components-feedbackcard-span-appreciation-issued-${textType}`}>Total number of Appreciations Issued</span>
            </div>
          )}
          {textType === 'appreciationReceived' && (
            <div data-cy={`feedback-feedback-components-feedbackcard-div-appreciation-received-${textType}`} id={`feedback-feedback-components-feedbackcard-div-appreciation-received-${textType}`}>
              <span data-cy={`feedback-feedback-components-feedbackcard-span-appreciation-received-${textType}`} id={`feedback-feedback-components-feedbackcard-span-appreciation-received-${textType}`}>Total number of Appreciations Received</span>
            </div>
          )}
          {textType === 'reprimandIssued' && (
            <div data-cy={`feedback-feedback-components-feedbackcard-div-reprimand-issued-${textType}`} id={`feedback-feedback-components-feedbackcard-div-reprimand-issued-${textType}`}>
              <span data-cy={`feedback-feedback-components-feedbackcard-span-reprimand-issued-${textType}`} id={`feedback-feedback-components-feedbackcard-span-reprimand-issued-${textType}`}>Total number of Reprimand Issued</span>
            </div>
          )}
          {textType === 'reprimandReceived' && (
            <div data-cy={`feedback-feedback-components-feedbackcard-div-reprimand-received-${textType}`} id={`feedback-feedback-components-feedbackcard-div-reprimand-received-${textType}`}>
              <span data-cy={`feedback-feedback-components-feedbackcard-span-reprimand-received-${textType}`} id={`feedback-feedback-components-feedbackcard-span-reprimand-received-${textType}`}>Total number of Reprimand Received</span>
            </div>
          )}
          {appreciationText}
        </div>
        <div className="font-bold text-lg" data-cy={`feedback-feedback-components-feedbackcard-div-total-${textType}`} id={`feedback-feedback-components-feedbackcard-div-total-${textType}`}>{total}</div>
        <div className="flex justify-end text-xs text-gray-400 space-x-2" data-cy={`feedback-feedback-components-feedbackcard-div-contributors-${textType}`} id={`feedback-feedback-components-feedbackcard-div-contributors-${textType}`}>
          <LuUsers data-cy={`feedback-feedback-components-feedbackcard-icon-users-${textType}`} id={`feedback-feedback-components-feedbackcard-icon-users-${textType}`} />
          <span data-cy={`feedback-feedback-components-feedbackcard-span-contributors-${textType}`} id={`feedback-feedback-components-feedbackcard-span-contributors-${textType}`}>{contributorCount} employees contributed</span>
        </div>
      </Card>
    </div>
  );
}

export const FeedbackCardSkeleton = () => {
  return (
    <div data-cy="feedback-feedback-components-feedbackcard-div-skeleton" id="feedback-feedback-components-feedbackcard-div-skeleton">
      <Card className="bg-gray-100 animate-pulse" data-cy="feedback-feedback-components-feedbackcard-card-skeleton" id="feedback-feedback-components-feedbackcard-card-skeleton">
        <div className="flex justify-between" data-cy="feedback-feedback-components-feedbackcard-div-skeleton-header" id="feedback-feedback-components-feedbackcard-div-skeleton-header">
          <Skeleton.Avatar
            active
            size="large"
            className="bg-gray-300"
            shape="circle"
            data-cy="feedback-feedback-components-feedbackcard-skeleton-avatar"
          />
          <Skeleton.Button active size="small" shape="round" className="w-16" data-cy="feedback-feedback-components-feedbackcard-skeleton-button" />
        </div>
        <div className="text-gray-400" data-cy="feedback-feedback-components-feedbackcard-div-skeleton-description" id="feedback-feedback-components-feedbackcard-div-skeleton-description">
          <Skeleton.Input active size="small" className="w-3/4" data-cy="feedback-feedback-components-feedbackcard-skeleton-input-1" />
          <Skeleton.Input active size="small" className="w-full mt-1" data-cy="feedback-feedback-components-feedbackcard-skeleton-input-2" />
        </div>
        <div className="font-bold text-lg" data-cy="feedback-feedback-components-feedbackcard-div-skeleton-total" id="feedback-feedback-components-feedbackcard-div-skeleton-total">
          <Skeleton.Input active size="default" className="w-1/4" data-cy="feedback-feedback-components-feedbackcard-skeleton-input-total" />
        </div>
        <div className="flex justify-end text-xs text-gray-400 space-x-2 mt-1" data-cy="feedback-feedback-components-feedbackcard-div-skeleton-contributors" id="feedback-feedback-components-feedbackcard-div-skeleton-contributors">
          <Skeleton.Avatar active size="small" shape="circle" data-cy="feedback-feedback-components-feedbackcard-skeleton-avatar-small" />
          <Skeleton.Input active size="small" className="w-1/2" data-cy="feedback-feedback-components-feedbackcard-skeleton-input-contributors" />
        </div>
      </Card>
    </div>
  );
};
