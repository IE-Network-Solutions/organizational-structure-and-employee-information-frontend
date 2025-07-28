'use client';

import { Pie } from 'react-chartjs-2';
import { Card, Select, Skeleton, Form, Typography, Spin } from 'antd';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { useGetRecruitmentStages } from '@/store/server/features/recruitment/dashboard/queries';
import { useGetStages } from '@/store/server/features/recruitment/candidate/queries';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';
import { useWatch } from 'antd/es/form/Form';
import { useState } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const options: ChartOptions<'pie'> = {
  responsive: false, // required when manually setting width/height

  plugins: {
    legend: {
      position: 'right',
      labels: {
        usePointStyle: true,
        boxWidth: 6, // 👈 smaller width for the color box (default is 40)
        boxHeight: 6, // optional, if you want to set height too
        padding: 10,
      },
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const label = context.label || '';
          const value = context.parsed || 0;
          return `${label}: ${value}`;
        },
      },
    },
    datalabels: {
      color: '#ffffff',
      font: {
        weight: 'bold',
        size: 12,
      },
      formatter: (value: number) => {
        return `${value}`;
      },
    },
  },
};

const ChartFilter = () => {
  const { data: stages, isLoading: stagesLoading } = useGetStages();
  const { data: jobs, isLoading: jobsLoading } = useGetJobs('', 1, 100);

  const stageOptions = stages?.items?.map((stage: any) => ({
    value: stage.title,
    label: stage.title,
  }));

  const jobOptions = jobs?.items?.map((job: any) => ({
    value: job.id,
    label: job.jobTitle,
  }));

  return (
    <div className="flex  items-center mb-4 gap-4">
      <h3 className="font-semibold text-[16px]">Stages</h3>

      <Form.Item name="jobId" noStyle>
        <Select
          placeholder="Job"
          allowClear
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            String(option?.label ?? '')
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          loading={jobsLoading}
          options={jobOptions}
          className='w-full h-10'
        />
      </Form.Item>
      <Form.Item name="stageId" noStyle>
        <Select
          placeholder="Stage"
          allowClear
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            String(option?.label ?? '')
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          loading={stagesLoading}
          options={stageOptions}
          className='w-full h-10'
        />
      </Form.Item>
    </div>
  )
}

export default function StagesChart() {
  const [form] = Form.useForm();
  const jobId = useWatch('jobId', form);
  const stages = useWatch('stageId', form);

  const { data: stagesData, isLoading } = useGetRecruitmentStages({ jobId, stages });

  const chartData = {
    labels: stagesData?.stageList?.map((stage: { name: string }) => stage.name) || [],
    datasets: [
      {
        label: 'Stages',
        data: stagesData?.stageList?.map((stage: { count: number }) => stage.count) || [],
        backgroundColor: [
          '#4A6CF7',
          '#FA916B',
          '#42D29D',
          '#FDBA74',
          '#A78BFA',
          '#34D399',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <Card className="shadow-sm">
      <Form form={form}>
        <ChartFilter />
      </Form>
      <Spin spinning={isLoading} tip="Loading...">

        {!isLoading && stagesData?.stageList?.length > 0 ?
          <div className="flex justify-center">
            <Pie data={chartData} options={options} width={280} height={250} />
          </div>
          :
          <div className="flex justify-center h-[250px] items-center">
            <Typography.Text className='text-gray-500 text-sm font-semibold'>No data found</Typography.Text>
          </div>
        }
      </Spin>
    </Card>
  );
}
