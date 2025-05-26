import React, { useState } from 'react';
import {  Form, Pagination,  Tag, Skeleton, Select } from 'antd';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import { useFetchedAllIndividualResponsesByFormId } from '@/store/server/features/organization-development/categories/queries';
import { EmptyImage } from '@/components/emptyIndicator';
import { FieldType } from '@/types/enumTypes';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  ChartTooltip,
  Legend,
);

interface Params {
  id: string;
}

const FIELD_TYPE_COLORS: Record<string, string> = {
  [FieldType.MULTIPLE_CHOICE]: 'blue',
  [FieldType.CHECKBOX]: 'green',
  [FieldType.SHORT_TEXT]: 'gold',
  [FieldType.PARAGRAPH]: 'orange',
  [FieldType.TIME]: 'purple',
  [FieldType.DROPDOWN]: 'cyan',
  [FieldType.RADIO]: 'magenta',
};

function getBarData(question: any, responses: any[]) {
  // Gather all response values (map by id if possible, else use value)
  const allValues = responses.flat().map((r: any) => {
    const opt = question.field.find((f: any) => f.id === r.value);
    return opt ? opt.value : r.value;
  });
  // Count all unique values
  const counts: Record<string, number> = {};
  allValues.forEach((val: string) => {
    counts[val] = (counts[val] || 0) + 1;
  });
  return {
    labels: Object.keys(counts),
    datasets: [
      {
        label: 'Responses',
        data: Object.values(counts),
        backgroundColor: [
          '#36A2EB',
          '#FF6384',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };
}

const IndividualResponses = ({ id }: Params) => {
  const { setCurrent, current, pageSize, selectedUser, setPageSize } =
    useOrganizationalDevelopment();
  const { data: individualResponses, isLoading } =
  useFetchedAllIndividualResponsesByFormId(id);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const onPageChange = (page: number, pageSize?: number) => {
    setCurrent(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  // Group responses by question
  const grouped: Record<string, { question: any; responses: any[] }> = {};
  if (individualResponses && Array.isArray(individualResponses)) {
    individualResponses.forEach((resp: any) => {
      const qid = resp.question.id;
      if (!grouped[qid]) {
        grouped[qid] = {
          question: resp.question,
          responses: [],
        };
      }
      grouped[qid].responses.push(resp.responseDetail);
    });
  }
  return (
    <div>
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="vertical"
        style={{ width: '100%' }}
      >
        <>
          {isLoading ? (
            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 bg-white shadow-md border border-gray-200 rounded-lg mb-5"
                >
                  <Skeleton active title paragraph={{ rows: 2 }} />
                  <div className="mt-4 flex justify-center">
                    <Skeleton.Input
                      style={{ width: 120, height: 120, borderRadius: '50%' }}
                      active
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : individualResponses && individualResponses.length !== 0 ? (
            <>
              {Object.values(grouped).map(({ question, responses }) => (
                <div
                  key={question.id}
                  className="mb-5 p-4 bg-white shadow-md border border-gray-200 rounded-lg"
                >
                  <div className="font-bold text-xl mb-2">
                    {question.question}
                  </div>
                  <div className="mb-5">
                    <Tag
                      color={FIELD_TYPE_COLORS[question.fieldType] || 'default'}
                    >
                      {question.fieldType}
                    </Tag>
                  </div>
                  {!(
                    question.fieldType === FieldType.MULTIPLE_CHOICE ||
                    question.fieldType === FieldType.CHECKBOX
                  ) && (
                    <div className="mb-2 bg-gray-100 p-2 rounded-md max-h-40 overflow-y-auto">
                      {responses.map((resp, idx) => (
                        <div key={idx} className="mb-1">
                          {resp.map((r: any) => (
                            <span
                              key={r.id}
                              className="inline-block bg-gray-100 px-2 py-1 rounded mr-2"
                            >
                              {r.value}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                  {(question.fieldType === FieldType.MULTIPLE_CHOICE ||
                    question.fieldType === FieldType.CHECKBOX) && (
                    <div className="w-full max-w-[800px]">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          Chart type:
                        </span>
                        <Select
                          size="small"
                          value={chartType}
                          onChange={setChartType}
                          style={{ width: 90 }}
                          options={[
                            { value: 'pie', label: 'Pie' },
                            { value: 'bar', label: 'Bar' },
                          ]}
                        />
                      </div>
                      {(() => {
                        const chartData = getBarData(question, responses);
                        const hasChartData = chartData.datasets[0].data.some(
                          (count: number) => count > 0,
                        );
                        return hasChartData ? (
                          <div className="w-full max-w-[600px]">
                            {chartType === 'pie' ? (
                              <Pie
                                data={chartData}
                                width={200}
                                height={200}
                                options={{ maintainAspectRatio: false }}
                              />
                            ) : (
                              <Bar
                                data={chartData}
                                width={200}
                                height={200}
                                options={{
                                  maintainAspectRatio: false,
                                  indexAxis: 'y',
                                  plugins: { legend: { display: false } },
                                  scales: { x: { beginAtZero: true } },
                                }}
                              />
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm mt-2">
                            No valid responses for chart
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))}
              <Pagination
                className="flex justify-end"
                total={individualResponses?.meta?.totalItems}
                current={current}
                pageSize={pageSize}
                showSizeChanger={true}
                onChange={onPageChange}
                onShowSizeChange={onPageChange}
              />
            </>
          ) : (
            <div className="flex justify-start">
              <EmptyImage />
            </div>
          )}
        </>
      </Form>
    </div>
  );
};

export default IndividualResponses;
