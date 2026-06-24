import { Progress } from 'antd';
import { FC } from 'react';
import { MdKey } from 'react-icons/md';
import {
  formatValueForMetric,
  getKeyResultProgressPercent,
  getKeyResultProgressRatioText,
  getMetricTypeName,
  getMilestoneProgressCounts,
  getNumericMetricTargetValue,
} from '@/utils/okrKeyResultProgressDisplay';

interface KPIMetricsProps {
  keyResult?: any;
}

const KeyResultMetrics: FC<KPIMetricsProps> = ({ keyResult }) => {
  const metricName = getMetricTypeName(keyResult);
  const krProgressPercent = getKeyResultProgressPercent(keyResult);
  const krProgressRatioText = getKeyResultProgressRatioText(keyResult);
  const { total: msTotal } = getMilestoneProgressCounts(keyResult);
  const numericTarget = getNumericMetricTargetValue(keyResult);

  return (
    <div
      className="py-3 px-2 sm:px-4 bg-white rounded-lg border"
      data-cy="planning-key-result-metrics-container"
    >
      <div
        className="grid grid-cols-12 sm:justify-between mb-2 items-start"
        data-cy="planning-key-result-metrics-header"
      >
        <div
          className="flex items-start gap-4 col-span-12 sm:col-span-8"
          data-cy="planning-key-result-metrics-title-section"
        >
          <MdKey size={14} className="text-blue text-xs w-10" />
          <h2
            data-cy="planning-and-reporting-components-keyresult-index-tsx-index-h2-23"
            className="text-xs font-semibold"
          >
            {keyResult?.title}
          </h2>
        </div>
        <div
          data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-25"
          className="flex flex-col items-end justify-end col-span-12 sm:col-span-4 mt-3 sm:mt-0"
        >
          <div
            data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-26"
            className="flex flex-col items-center justify-start"
          >
            <div
              data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-27"
              className="flex items-center gap-1 "
            >
              <Progress
                type="circle"
                showInfo={false}
                percent={krProgressPercent}
                size={20}
              />
              <span
                data-cy="planning-and-reporting-components-keyresult-index-tsx-index-span-34"
                className="text-sm"
              >
                {krProgressPercent}%
              </span>
            </div>
            <span
              data-cy="planning-and-reporting-components-keyresult-index-tsx-index-span-36"
              className="text-[8px]"
            >
              KR progress
            </span>
          </div>
        </div>
      </div>

      <div
        data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-41"
        className="mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-end"
      >
        <div
          data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-42"
          className="flex gap-4 ml-0 sm:ml-10"
        >
          <div
            data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-43"
            className="flex items-center gap-2"
          >
            <div
              data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-44"
              className="bg-light_purple text-blue font-semibold text-[10px]   w-16 sm:w-20  text-center p-1  rounded-lg"
            >
              {keyResult?.metricType?.name || '-'}
            </div>
            <div
              data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-47"
              className="flex items-center gap-1"
            >
              <div
                data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-48"
                className="text-blue text-xl"
              >
                &#x2022;
              </div>
              <div
                data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-49"
                className="text-blue mt-1 text-[10px] flex items-center rounded-lg"
              >
                Metric
              </div>
            </div>
          </div>

          <div
            data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-55"
            className="flex items-center gap-2"
          >
            <div
              data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-56"
              className="bg-light_purple text-blue font-semibold text-[10px]   w-16 sm:w-20  text-center p-1 rounded-lg"
            >
              {keyResult?.weight || 0}
            </div>
            <div
              data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-59"
              className="flex items-center gap-1"
            >
              <div
                data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-60"
                className="text-blue text-xl"
              >
                &#x2022;
              </div>
              <div
                data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-61"
                className="text-blue mt-1 text-[10px] flex items-center rounded-lg"
              >
                Weight
              </div>
            </div>
          </div>
        </div>

        <div
          data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-68"
          className="grid gap-4 mt-3 sm:mt-0"
        >
          <div
            data-cy="planning-key-result-metrics-progress-wrap"
            className="flex flex-col gap-2 w-full min-w-0"
          >
            <div
              data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-69"
              className="flex gap-4 flex-wrap"
            >
              <div
                data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-70"
                className="flex items-center gap-2"
              >
                <div
                  data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-71"
                  className="bg-light_purple text-blue font-semibold text-[10px] p-1 min-w-16 sm:min-w-20 text-center rounded-lg"
                >
                  {krProgressRatioText}
                </div>
                <div
                  data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-83"
                  className="flex items-center gap-1"
                >
                  <div
                    data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-84"
                    className="text-blue text-xl"
                  >
                    &#x2022;
                  </div>
                  <div
                    data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-85"
                    className="text-blue mt-1 text-[10px] flex items-center rounded-lg"
                  >
                    Achieved
                  </div>
                </div>
              </div>
              <div
                data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-90"
                className="text-xl"
              >
                |
              </div>
              <div
                data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-91"
                className="flex items-center gap-2"
              >
                <div
                  data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-92"
                  className="bg-light_purple text-blue font-semibold text-[10px] p-1 w-16 sm:w-20 text-center  rounded-lg"
                >
                  {metricName === 'Milestone'
                    ? msTotal
                    : metricName === 'Achieve' || metricName === 'Achieved'
                      ? '100'
                      : formatValueForMetric(metricName, numericTarget)}
                </div>
                <div
                  data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-99"
                  className="flex items-center gap-1"
                >
                  <div
                    data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-100"
                    className="text-blue text-xl"
                  >
                    &#x2022;
                  </div>
                  <div
                    data-cy="planning-and-reporting-components-keyresult-index-tsx-index-div-101"
                    className="text-blue mt-1  text-[10px] flex items-center rounded-lg"
                  >
                    {metricName === 'Milestone' ? 'Milestones' : 'Target'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyResultMetrics;
