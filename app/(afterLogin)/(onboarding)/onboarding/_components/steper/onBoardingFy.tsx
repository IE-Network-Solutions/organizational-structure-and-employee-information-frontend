'use client';

import { Form, Input, DatePicker, Radio, FormInstance } from 'antd';
import { useState } from 'react';
import dayjs from 'dayjs';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';

export default function FiscalYearForm({ form }: { form: FormInstance }) {
  const [breakdown, setBreakdown] = useState<number | null>(null);
  const { setFiscalYearPayLoad } = useFiscalYearDrawerStore();
  const generateSessions = (
    start: dayjs.Dayjs,
    end: dayjs.Dayjs,
    breakdown: number,
  ) => {
    const periodMonths = 12 / breakdown;
    const newSessions: any[] = [];

    let current = start.clone();

    for (let i = 0; i < breakdown; i++) {
      const sessionStart = current.clone();
      const sessionEnd = current.add(periodMonths, 'month').subtract(1, 'day');

      const sessionMonths = [];
      let monthStart = sessionStart.clone();

      for (let j = 0; j < periodMonths; j++) {
        const monthEnd = monthStart.clone().add(1, 'month').subtract(1, 'day');

        sessionMonths.push({
          name: `Month-${i * periodMonths + j + 1}`,
          startDate: monthStart.toISOString(),
          endDate: monthEnd.toISOString(),
        });

        monthStart = monthEnd.add(1, 'day');
      }

      newSessions.push({
        name: `Session ${i + 1}`,
        description: `This is Session ${i + 1} for the fiscal year.`,
        startDate: sessionStart.toISOString(),
        endDate: sessionEnd.toISOString(),
        months: sessionMonths,
      });

      current = sessionEnd.add(1, 'day');
    }

    return newSessions;
  };
  const onBreakdownChange = (value: number) => {
    setBreakdown(value);

    const values = form.getFieldsValue();
    const { name, startDate, endDate } = values;

    if (startDate && endDate) {
      const generatedSessions = generateSessions(startDate, endDate, value);
      const payload = {
        name,
        startDate: startDate.format?.('YYYY-MM-DD') ?? startDate,
        endDate: endDate.format?.('YYYY-MM-DD') ?? endDate,
        sessions: generatedSessions,
      };

      setFiscalYearPayLoad(payload);
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 p-4 md:p-6 lg:p-8 rounded-lg my-4 md:my-6 lg:my-8 w-full h-full">
      <div className="bg-white p-4 md:p-6 lg:p-8 rounded-lg w-full h-full">
        <div className="flex flex-col md:flex-row justify-start items-center gap-2 md:gap-4 font-bold text-xl md:text-2xl text-black mt-4 md:my-4 ">
          Set up your Fiscal year?
        </div>

        <Form
          initialValues={{
            name: `FY-${dayjs().year()}`,
            startDate: dayjs(),
            endDate: dayjs().add(1, 'year'),
          }}
          layout="vertical"
          form={form}
        >
          <Form.Item
            label="Fiscal year name"
            name="name"
            rules={[
              { required: true, message: 'Please enter fiscal year name' },
            ]}
          >
            <Input className="h-10" placeholder="Enter name" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Fiscal Year Starting Date"
              name="startDate"
              rules={[
                { required: true, message: 'Select fiscal year start date' },
              ]}
            >
              <DatePicker
                onChange={() =>
                  breakdown !== null && onBreakdownChange(breakdown)
                }
                className="w-full h-10"
              />
            </Form.Item>

           <Form.Item
  label="Fiscal Year End Date"
  name="endDate"
  rules={[
    { required: true, message: 'Select fiscal year end date' },
    ({ getFieldValue }) => ({
      validator(_, value) {
        const start = getFieldValue('startDate');
        if (!start || !value) return Promise.resolve();

        const diff = value.diff(start, 'day');

        if (diff === 364 || diff === 365) {
          return Promise.resolve();
        }

        return Promise.reject(
          new Error('The fiscal year must be exactly 12 months (1 year) long.')
        );
      },
    }),
  ]}
>
  <DatePicker
    onChange={() => breakdown !== null && onBreakdownChange(breakdown)}
    className="w-full h-10"
  />
</Form.Item>

          </div>

          <Form.Item
            label="Fiscal Period Breakdown"
            name="breakdown"
            rules={[
              {
                required: true,
                message: 'Please select a fiscal period breakdown',
              },
            ]}
          >
            <Radio.Group
              onChange={(e) => onBreakdownChange(e.target.value)}
              value={breakdown}
              className="flex flex-col gap-2"
            >
              <Radio value={4} className="rounded-md border p-4">
                Quarterly
              </Radio>
              <Radio value={2} className="rounded-md border p-4">
                Semester
              </Radio>
              <Radio value={1} className="rounded-md border p-4">
                Yearly
              </Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
