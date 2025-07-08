import { Card } from 'antd';
import React from 'react';
import { FaArrowUp } from 'react-icons/fa';

const ReceivedReprimand: React.FC = () => {
  return (
    <Card>
      <div className="text-md gap-4 flex justify-start mb-2">
        <svg
          width="40"
          height="41"
          viewBox="0 0 40 41"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="40"
            y="40.731"
            width="40"
            height="40"
            rx="20"
            transform="rotate(-180 40 40.731)"
            fill="#FF782D"
            fill-opacity="0.2"
          />
          <g clip-path="url(#clip0_7606_452788)">
            <path
              d="M22.793 11.731C24.5291 11.731 26.0046 12.3454 27.2196 13.5743C28.4346 14.8032 29.0424 16.286 29.043 18.0226C29.0435 19.7593 28.4427 21.2282 27.2405 22.4293C26.0382 23.6304 24.5696 24.231 22.8346 24.231H22.5638L22.0013 25.2101C21.8346 25.5157 21.5846 25.7135 21.2513 25.8035C20.918 25.8935 20.5985 25.8485 20.293 25.6685L19.668 25.3143L19.5638 25.481C19.2444 26.0782 18.7444 26.4671 18.0638 26.6476C17.3832 26.8282 16.7444 26.7448 16.1471 26.3976L15.418 25.981L16.2513 24.5435L16.9805 24.9601C17.1749 25.0712 17.3869 25.0957 17.6163 25.0335C17.8457 24.9712 18.0157 24.8426 18.1263 24.6476L18.2305 24.481L17.3971 24.0018C17.1055 23.8351 16.9144 23.5851 16.8238 23.2518C16.7332 22.9185 16.7716 22.606 16.9388 22.3143L17.5013 21.3143C17.1819 20.8143 16.9421 20.2829 16.7821 19.7201C16.6221 19.1573 16.5424 18.5776 16.543 17.981C16.543 16.2448 17.1505 14.769 18.3655 13.5535C19.5805 12.3379 21.0563 11.7304 22.793 11.731ZM22.793 13.3976C21.5291 13.3976 20.4491 13.8454 19.553 14.741C18.6569 15.6365 18.2091 16.7165 18.2096 17.981C18.2096 18.4115 18.2688 18.8351 18.3871 19.2518C18.5055 19.6685 18.6824 20.0643 18.918 20.4393L19.4596 21.2935L18.5846 22.7935L20.7513 24.0435L21.6263 22.5435H22.543C23.8485 22.5435 24.9838 22.1268 25.9488 21.2935C26.9138 20.4601 27.3966 19.3698 27.3971 18.0226C27.3971 16.7448 26.9491 15.6546 26.053 14.7518C25.1569 13.849 24.0702 13.3976 22.793 13.3976ZM13.3346 23.3976V25.0643L10.8346 25.0643V23.3976L13.3346 23.3976ZM17.918 27.981V30.481H16.2513V27.981H17.918ZM13.8555 26.2935L15.0221 27.4601L13.2513 29.231L12.0846 28.0643L13.8555 26.2935Z"
              fill="#E03137"
            />
          </g>
          <defs>
            <clipPath id="clip0_7606_452788">
              <rect
                width="20"
                height="20"
                fill="white"
                transform="matrix(-1 0 0 -1 30 30.731)"
              />
            </clipPath>
          </defs>
        </svg>
        <div className="flex flex-col items-start justify-start">
          <div className="flex items-center justify-start">
            Received Reprimand
          </div>
          <div className="flex gap-1 items-center justify-end">
            <h3>56.02</h3>
            <h5>%</h5>
          </div>
        </div>
        <div className="flex flex-col justify-between ">
          <div className="flex items-center justify-end gap-[2px]">
            <span className="text-green-500 font-light">12.7</span>
            <FaArrowUp className="text-green-500 font-light" />
          </div>
          <span className="text-xs font-normal">
            Updated: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ReceivedReprimand;
