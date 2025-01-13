import { Progress } from 'antd';
import { FC } from 'react';
import { MdKey } from 'react-icons/md';
interface KPIMetricsProps {
  keyResult?: any;
}

const KeyResultMetrics: FC<KPIMetricsProps> = ({ keyResult }) => {
  console.log(keyResult, 'jdfdlhfbdsjb');
  return (
    <div className="py-3 px-2 sm:px-4 bg-white shadow-sm rounded-lg border">
      <div className="grid grid-cols-12 sm:justify-between mb-2 items-start">
        <div className="flex items-start gap-4 col-span-12 sm:col-span-8">
          <MdKey size={14} className="text-blue text-xs w-10" />
          <h2 className="text-xs font-semibold">{keyResult?.title}</h2>
        </div>
        <div className="flex flex-col items-end justify-end col-span-12 sm:col-span-4 mt-3 sm:mt-0">
          <div className="flex flex-col items-center justify-start">
            <div className="flex items-center gap-1 ">
              <Progress
                type="circle"
                showInfo={false}
                percent={keyResult?.progress}
                size={20}
              />
              <span className="text-sm">{keyResult?.progress || 0}%</span>
            </div>
            <span className="text-[8px]">KR progress</span>
          </div>
        </div>
      </div>

      {/* <div className="mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-end">
        <div className="flex gap-4 ml-0 sm:ml-10">
          <div className="flex items-center gap-2">
            <div className="bg-light_purple text-blue font-semibold text-[10px]   w-16 sm:w-20  text-center p-1  rounded-lg">
              {keyResult?.metricType?.name || '-'}
            </div>
            <div className="flex items-center gap-1">
              <div className="text-blue text-xl">&#x2022;</div>
              <div className="text-blue mt-1 text-[10px] flex items-center rounded-lg">
                Metric
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-light_purple text-blue font-semibold text-[10px]   w-16 sm:w-20  text-center p-1 rounded-lg">
              {keyResult?.weight || 0}
            </div>
            <div className="flex items-center gap-1">
              <div className="text-blue text-xl">&#x2022;</div>
              <div className="text-blue mt-1 text-[10px] flex items-center rounded-lg">
                Weight
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 mt-3 sm:mt-0">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-light_purple text-blue font-semibold text-[10px] p-1 w-16 sm:w-20 text-center rounded-lg">
                {keyResult?.metricType?.name === 'Milestone'
                  ? keyResult?.milestones?.filter(
                      (e: any) => e.status === 'Completed',
                    )?.length || 0
                  : keyResult?.metricType?.name === 'Achieve'
                    ? keyResult?.progress
                    : keyResult?.currentValue || 0}
              </div>
              <div className="flex items-center gap-1">
                <div className="text-blue text-xl">&#x2022;</div>
                <div className="text-blue mt-1 text-[10px] flex items-center rounded-lg">
                  Achieved
                </div>
              </div>
            </div>
            <div className="text-xl">|</div>
            <div className="flex items-center gap-2">
              <div className="bg-light_purple text-blue font-semibold text-[10px] p-1 w-16 sm:w-20 text-center  rounded-lg">
                {keyResult?.metricType?.name === 'Milestone'
                  ? keyResult?.milestones?.length || 0
                  : keyResult?.metricType?.name === 'Achieve'
                    ? '100'
                    : keyResult?.targetValue || 0}
              </div>
              <div className="flex items-center gap-1">
                <div className="text-blue text-xl">&#x2022;</div>
                <div className="text-blue mt-1  text-[10px] flex items-center rounded-lg">
                  {keyResult?.metricType?.name === 'Milestone'
                    ? 'Milestones'
                    : 'Target'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default KeyResultMetrics;
