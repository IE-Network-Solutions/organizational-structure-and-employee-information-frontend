'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  LuExternalLink,
  LuPause,
  LuPlay,
  LuSkipBack,
  LuSkipForward,
  LuVolume2,
  LuVolumeX,
} from 'react-icons/lu';
import { parseYouTubeId, VideoEmbedInfo } from '@/types/tna/growthPlan';

export type SkillVideoSource = 'recommended' | 'material';

export type SkillVideoPlatform = 'youtube' | 'vimeo' | 'video';

export type SkillVideoItem = {
  id: string;
  title: string;
  url?: string | null;
  videoId?: string | null;
  embed: VideoEmbedInfo;
  source: SkillVideoSource;
  platform: SkillVideoPlatform;
};

const BRAND = '#1E40AF';

const sourceLabel: Record<SkillVideoSource, string> = {
  recommended: 'Recommended',
  material: 'My materials',
};

const platformLabel: Record<SkillVideoPlatform, string> = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  video: 'Video',
};

export const resolveVideoPlatform = (
  url?: string | null,
  videoId?: string | null,
): SkillVideoPlatform => {
  if (videoId || (url && parseYouTubeId(url))) return 'youtube';
  if (url) {
    try {
      const host = new URL(url.trim()).hostname.replace(/^www\./, '');
      if (host === 'vimeo.com' || host === 'player.vimeo.com') return 'vimeo';
    } catch {
      /* ignore */
    }
  }
  return 'video';
};

/**
 * Compact video player + Up next queue (brand controls).
 * Includes recommended skill resources and employee video materials.
 */
const SkillVideoQueue = ({
  videos,
  skillId,
}: {
  videos: SkillVideoItem[];
  skillId: string;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prevLen = useRef(videos.length);

  useEffect(() => {
    if (videos.length > prevLen.current) {
      // Newly appended video (usually a material) → jump to it
      setActiveIndex(videos.length - 1);
    } else if (activeIndex >= videos.length && videos.length > 0) {
      setActiveIndex(videos.length - 1);
    } else if (videos.length === 0) {
      setActiveIndex(0);
    }
    prevLen.current = videos.length;
  }, [videos.length, activeIndex, videos]);

  const active = videos[Math.min(activeIndex, Math.max(videos.length - 1, 0))];
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < videos.length - 1;

  useEffect(() => {
    setPlaying(false);
    setMuted(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [active?.id]);

  if (!active) return null;

  const openUrl = active.url || undefined;
  const iframeSrc = buildIframeSrc(active.embed.src, playing, muted);

  const togglePlay = async () => {
    if (active.embed.kind === 'video' && videoRef.current) {
      if (videoRef.current.paused) {
        await videoRef.current.play().catch(() => undefined);
        setPlaying(true);
      } else {
        videoRef.current.pause();
        setPlaying(false);
      }
      return;
    }
    setPlaying((p) => !p);
  };

  const toggleMute = () => {
    if (active.embed.kind === 'video' && videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
      return;
    }
    setMuted((m) => !m);
  };

  return (
    <div
      className="overflow-hidden rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB]"
      data-cy={`pgp-skill-video-queue-${skillId}`}
    >
      <div
        data-cy="tna-planning-skillvideoqueue-index-div-133"
        className="flex flex-col lg:flex-row"
      >
        <div
          data-cy="tna-planning-skillvideoqueue-index-div-134"
          className="min-w-0 w-full p-3 lg:w-1/2 lg:max-w-[50%]"
        >
          <div
            data-cy="tna-planning-skillvideoqueue-index-div-135"
            className="relative aspect-video w-full overflow-hidden rounded-[4px] border border-[#E5E7EB] bg-[#111827]"
          >
            {active.embed.kind === 'iframe' ? (
              <iframe
                data-cy="tna-planning-skillvideoqueue-index-iframe-137"
                key={`${active.id}-${playing}-${muted}`}
                title={active.title}
                src={iframeSrc}
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                data-cy="tna-planning-skillvideoqueue-index-video-146"
                ref={videoRef}
                key={active.id}
                title={active.title}
                src={active.embed.src}
                className="absolute inset-0 h-full w-full bg-black object-contain"
                muted={muted}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => {
                  setPlaying(false);
                  if (hasNext) setActiveIndex((i) => i + 1);
                }}
              />
            )}
          </div>

          <div
            data-cy="tna-planning-skillvideoqueue-index-div-163"
            className="mt-2"
          >
            <div
              data-cy="tna-planning-skillvideoqueue-index-div-164"
              className="flex flex-wrap items-center gap-1.5"
            >
              <div
                data-cy="tna-planning-skillvideoqueue-index-div-165"
                className="text-sm font-medium text-[#262626]"
              >
                {active.title}
              </div>
              <span
                data-cy="tna-planning-skillvideoqueue-index-span-168"
                className={`rounded-[4px] px-1.5 py-0.5 text-[10px] font-medium ${
                  active.source === 'material'
                    ? 'bg-[#EFF6FF] text-[#1E40AF]'
                    : 'bg-[#DBEAFE] text-blue-700'
                }`}
              >
                {sourceLabel[active.source]}
              </span>
              <span
                data-cy="tna-planning-skillvideoqueue-index-span-177"
                className="rounded-[4px] bg-[#F0F2F5] px-1.5 py-0.5 text-[10px] font-medium text-[#595959]"
              >
                {platformLabel[active.platform]}
              </span>
            </div>
            <div
              data-cy="tna-planning-skillvideoqueue-index-div-181"
              className="mt-0.5 text-[11px] text-[#8c8c8c]"
            >
              {activeIndex + 1} / {videos.length}
            </div>
          </div>

          <div
            data-cy="tna-planning-skillvideoqueue-index-div-186"
            className="mt-2 flex flex-wrap items-center gap-1.5"
          >
            <ControlButton
              label="Previous"
              disabled={!hasPrev}
              onClick={() => hasPrev && setActiveIndex((i) => i - 1)}
              dataCy="pgp-video-prev"
            >
              <LuSkipBack className="text-sm" />
            </ControlButton>
            <ControlButton
              label={playing ? 'Pause' : 'Play'}
              onClick={togglePlay}
              primary
              dataCy="pgp-video-play"
            >
              {playing ? (
                <LuPause className="text-sm" />
              ) : (
                <LuPlay className="text-sm" />
              )}
            </ControlButton>
            <ControlButton
              label="Next"
              disabled={!hasNext}
              onClick={() => hasNext && setActiveIndex((i) => i + 1)}
              dataCy="pgp-video-next"
            >
              <LuSkipForward className="text-sm" />
            </ControlButton>
            <ControlButton
              label={muted ? 'Unmute' : 'Mute'}
              onClick={toggleMute}
              dataCy="pgp-video-mute"
            >
              {muted ? (
                <LuVolumeX className="text-sm" />
              ) : (
                <LuVolume2 className="text-sm" />
              )}
            </ControlButton>
            {openUrl ? (
              <a
                data-cy="tna-planning-skillvideoqueue-index-a-227"
                href={openUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-auto inline-flex h-8 items-center gap-1 rounded-[4px] border border-[#E5E7EB] bg-white px-2.5 text-xs font-medium text-[#1E40AF] no-underline hover:border-[#1E40AF]/40"
              >
                <LuExternalLink className="text-xs" />
                Open
              </a>
            ) : null}
          </div>
        </div>

        <aside
          data-cy="tna-planning-skillvideoqueue-index-aside-240"
          className="min-w-0 flex-1 border-t border-[#E5E7EB] lg:border-l lg:border-t-0"
        >
          <div
            data-cy="tna-planning-skillvideoqueue-index-div-241"
            className="border-b border-[#E5E7EB] px-3 py-2"
          >
            <div
              data-cy="tna-planning-skillvideoqueue-index-div-242"
              className="text-[12px] font-semibold text-gray-900"
            >
              Up next
            </div>
            <div
              data-cy="tna-planning-skillvideoqueue-index-div-245"
              className="text-[11px] text-[#8c8c8c]"
            >
              {videos.length} video{videos.length === 1 ? '' : 's'} ·
              recommended + my materials
            </div>
          </div>
          <ul
            data-cy="tna-planning-skillvideoqueue-index-ul-250"
            className="m-0 max-h-[320px] list-none space-y-0 overflow-y-auto p-0 scrollbar-hide"
          >
            {videos.map((item, index) => {
              const isActive = index === activeIndex;
              const thumb = youtubeThumb(item.url, item.videoId);
              return (
                <li
                  data-cy="tna-planning-skillvideoqueue-index-li-255"
                  key={item.id}
                >
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`flex w-full cursor-pointer gap-2.5 border-none px-2.5 py-2 text-left transition-colors ${
                      isActive
                        ? 'bg-[#EFF6FF]'
                        : 'bg-transparent hover:bg-white'
                    }`}
                    data-cy={`pgp-skill-queue-item-${item.id}`}
                  >
                    <div
                      data-cy="tna-planning-skillvideoqueue-index-div-266"
                      className="relative h-[54px] w-[96px] shrink-0 overflow-hidden rounded-[4px] bg-[#E5E7EB]"
                    >
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          data-cy="tna-planning-skillvideoqueue-index-img-269"
                          src={thumb}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          data-cy="tna-planning-skillvideoqueue-index-div-275"
                          className="flex h-full w-full items-center justify-center text-[#8c8c8c]"
                        >
                          <LuPlay className="text-base" />
                        </div>
                      )}
                      <span
                        data-cy="tna-planning-skillvideoqueue-index-span-279"
                        className="absolute bottom-0.5 left-0.5 rounded-[2px] bg-[#1E40AF] px-1 text-[9px] font-medium text-white"
                      >
                        {index + 1}
                      </span>
                      {isActive ? (
                        <span
                          data-cy="tna-planning-skillvideoqueue-index-span-283"
                          className="absolute inset-0 flex items-center justify-center bg-[#1E40AF]/25"
                        >
                          <LuPlay className="text-white" />
                        </span>
                      ) : null}
                    </div>
                    <div
                      data-cy="tna-planning-skillvideoqueue-index-div-288"
                      className="min-w-0 flex-1 py-0.5"
                    >
                      <div
                        data-cy="tna-planning-skillvideoqueue-index-div-289"
                        className={`line-clamp-2 text-[12px] font-medium leading-snug ${
                          isActive ? 'text-[#1E40AF]' : 'text-[#262626]'
                        }`}
                      >
                        {item.title}
                      </div>
                      <div
                        data-cy="tna-planning-skillvideoqueue-index-div-296"
                        className="mt-0.5 flex flex-wrap items-center gap-1"
                      >
                        <span
                          data-cy="tna-planning-skillvideoqueue-index-span-297"
                          className={`rounded-[2px] px-1 py-0.5 text-[9px] font-medium ${
                            item.source === 'material'
                              ? 'bg-[#EFF6FF] text-[#1E40AF]'
                              : 'bg-[#DBEAFE] text-blue-700'
                          }`}
                        >
                          {sourceLabel[item.source]}
                        </span>
                        <span
                          data-cy="tna-planning-skillvideoqueue-index-span-306"
                          className="rounded-[2px] bg-[#F0F2F5] px-1 py-0.5 text-[9px] font-medium text-[#595959]"
                        >
                          {platformLabel[item.platform]}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
};

const ControlButton = ({
  children,
  label,
  onClick,
  disabled,
  primary,
  dataCy,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  dataCy: string;
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
    data-cy={dataCy}
    className={`inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[4px] border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
      primary
        ? 'border-transparent bg-[#1E40AF] text-white hover:bg-[#1E3A8A]'
        : 'border-[#E5E7EB] bg-white text-[#1E40AF] hover:border-[#1E40AF]/40 hover:bg-[#EFF6FF]'
    }`}
    style={primary ? { backgroundColor: BRAND } : undefined}
  >
    {children}
  </button>
);

const youtubeThumb = (
  url?: string | null,
  videoId?: string | null,
): string | null => {
  const id = videoId || (url ? parseYouTubeId(url) : null);
  return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null;
};

const buildIframeSrc = (base: string, playing: boolean, muted: boolean) => {
  try {
    const u = new URL(base);
    if (playing) u.searchParams.set('autoplay', '1');
    else u.searchParams.delete('autoplay');
    u.searchParams.set('mute', muted ? '1' : '0');
    u.searchParams.set('controls', '1');
    u.searchParams.set('rel', '0');
    u.searchParams.set('modestbranding', '1');
    return u.toString();
  } catch {
    return base;
  }
};

export default SkillVideoQueue;
