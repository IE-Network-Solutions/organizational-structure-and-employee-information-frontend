import { Card } from 'antd';
import React from 'react';

const IssuedReprimand: React.FC<{ kpi: number; engagement: number }> = ({
  kpi,
  engagement,
}) => {
  return (
    <Card
      className="text-md gap-2 flex flex-col  p-4"
      bodyStyle={{ padding: '0px', margin: '0px' }}
    >
      <div className="flex items-center gap-5 justify-start">
        <svg
          width="40"
          height="41"
          viewBox="0 0 40 41"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            y="0.730957"
            width="40"
            height="40"
            rx="20"
            fill="#FF782D"
            fill-opacity="0.2"
          />
          <g clip-path="url(#clip0_7606_452751)">
            <path
              d="M17.207 29.731C15.4709 29.731 13.9954 29.1165 12.7804 27.8876C11.5654 26.6587 10.9576 25.176 10.957 23.4393C10.9565 21.7026 11.5573 20.2337 12.7595 19.0326C13.9618 17.8315 15.4304 17.231 17.1654 17.231H17.4362L17.9987 16.2518C18.1654 15.9462 18.4154 15.7485 18.7487 15.6585C19.082 15.5685 19.4015 15.6135 19.707 15.7935L20.332 16.1476L20.4362 15.981C20.7556 15.3837 21.2556 14.9948 21.9362 14.8143C22.6168 14.6337 23.2556 14.7171 23.8529 15.0643L24.582 15.481L23.7487 16.9185L23.0195 16.5018C22.8251 16.3907 22.6131 16.3662 22.3837 16.4285C22.1543 16.4907 21.9843 16.6193 21.8737 16.8143L21.7695 16.981L22.6029 17.4601C22.8945 17.6268 23.0856 17.8768 23.1762 18.2101C23.2668 18.5435 23.2284 18.856 23.0612 19.1476L22.4987 20.1476C22.8181 20.6476 23.0579 21.179 23.2179 21.7418C23.3779 22.3046 23.4576 22.8843 23.457 23.481C23.457 25.2171 22.8495 26.6929 21.6345 27.9085C20.4195 29.124 18.9437 29.7315 17.207 29.731ZM17.207 28.0643C18.4709 28.0643 19.5509 27.6165 20.447 26.721C21.3431 25.8254 21.7909 24.7454 21.7904 23.481C21.7904 23.0504 21.7312 22.6268 21.6129 22.2101C21.4945 21.7935 21.3176 21.3976 21.082 21.0226L20.5404 20.1685L21.4154 18.6685L19.2487 17.4185L18.3737 18.9185H17.457C16.1515 18.9185 15.0162 19.3351 14.0512 20.1685C13.0862 21.0018 12.6034 22.0921 12.6029 23.4393C12.6029 24.7171 13.0509 25.8073 13.947 26.7101C14.8431 27.6129 15.9298 28.0643 17.207 28.0643ZM26.6654 18.0643V16.3976H29.1654V18.0643H26.6654ZM22.082 13.481V10.981H23.7487V13.481H22.082ZM26.1445 15.1685L24.9779 14.0018L26.7487 12.231L27.9154 13.3976L26.1445 15.1685Z"
              fill="#E03137"
            />
          </g>
          <defs>
            <clipPath id="clip0_7606_452751">
              <rect
                width="20"
                height="20"
                fill="white"
                transform="translate(10 10.731)"
              />
            </clipPath>
          </defs>
        </svg>
        <div className="flex items-center justify-start text-sm font-medium text-gray-600">
          Issued Reprimand
        </div>
      </div>
      <div className="flex items-center justify-center gap-6 text-primary ">
        <div className="flex items-center justify-center bg-[#E9E9FF] gap-3 py-2 px-4 border rounded-lg">
          <div className="text-2xl font-extrabold">{kpi}</div>
          <div className="text-sm font-bold">KPI</div>
        </div>
        <div className="flex items-center justify-center bg-[#E9E9FF] gap-3 py-2 px-4 border rounded-lg">
          <div className="text-2xl font-extrabold">{engagement}</div>
          <div className="text-sm font-bold">Engagement</div>
        </div>
      </div>
    </Card>
  );
};

export default IssuedReprimand;
