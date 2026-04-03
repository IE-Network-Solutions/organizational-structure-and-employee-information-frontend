'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from 'antd';
import type { CSSProperties } from 'react';

export type AttendanceStatCarouselSlide = {
  id?: string;
  value: React.ReactNode;
  footer?: React.ReactNode;
};

type AttendanceStatCardProps = {
  title: string;
  value: any;
  footer?: React.ReactNode;
  /** When set with more than one slide, value/footer area auto-rotates like dashboard OKR header cards. */
  carouselSlides?: AttendanceStatCarouselSlide[];
  carouselIntervalMs?: number;
  icon: React.ReactNode;
  iconBgClassName: string;
  iconStyle?: CSSProperties;
  dataCy?: string;
};

const slidePercent = (index: number, length: number) =>
  length > 0 ? (index * 100) / length : 0;

export default function AttendanceStatCard({
  title,
  value,
  footer,
  carouselSlides,
  carouselIntervalMs = 3000,
  icon,
  iconBgClassName,
  iconStyle,
  dataCy,
}: AttendanceStatCardProps) {
  const cy = dataCy ?? 'attendance-stat-card';

  const slides = useMemo((): AttendanceStatCarouselSlide[] => {
    if (carouselSlides?.length) {
      return carouselSlides;
    }
    return [{ value, footer }];
  }, [carouselSlides, value, footer]);

  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    setSlideIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, carouselIntervalMs);
    return () => clearInterval(interval);
  }, [slides.length, carouselIntervalMs]);

  return (
    <Card
      bordered={false}
      bodyStyle={{ padding: 12 }}
      className="bg-white rounded-lg border border-[#E5E7EB] shadow-none h-[109px]"
      data-cy={dataCy}
    >
      <div className="flex flex-col h-full" data-cy={`${cy}-body`}>
        <div className="flex items-center gap-3" data-cy={`${cy}-header`}>
          <span
            className={`w-[34px] h-[34px] rounded-[4px] ${iconBgClassName} flex items-center justify-center shrink-0`}
            style={iconStyle}
            data-cy={`${cy}-icon`}
          >
            {icon}
          </span>
          <p
            className="text-base text-black/70 font-bold leading-4"
            data-cy={`${cy}-title`}
          >
            {title}
          </p>
        </div>

        <div
          className="mt-3 overflow-hidden min-h-[2.5rem]"
          data-cy={`${cy}-value-row`}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              width: `${slides.length * 100}%`,
              transform: `translateX(-${slidePercent(slideIndex, slides.length)}%)`,
            }}
            data-cy={`${cy}-value-slider`}
          >
            {slides.map((slide, i) => {
              const valueCy =
                slides.length === 1
                  ? `${cy}-value`
                  : `${cy}-value-${slide.id ?? i}`;
              const footerCy =
                slides.length === 1
                  ? `${cy}-footer`
                  : `${cy}-footer-${slide.id ?? i}`;
              return (
                <div
                  key={slide.id ?? `slide-${i}`}
                  className="flex shrink-0 items-center gap-2"
                  style={{ width: `${100 / slides.length}%` }}
                  data-cy={`${cy}-value-slide-${slide.id ?? i}`}
                >
                  <div className="leading-[1.1] tabular-nums" data-cy={valueCy}>
                    {slide.value}
                  </div>
                  {slide.footer ? (
                    <div
                      className="text-gray-500 font-normal text-[12px] mt-1 leading-4"
                      data-cy={footerCy}
                    >
                      {slide.footer}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
