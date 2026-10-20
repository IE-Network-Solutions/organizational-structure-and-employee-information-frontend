import { useGetActiveSession } from '@/store/server/features/okrplanning/okr/target/queries';
import { useGetVPScore } from './queries';

/** MONTH = monthly performance pay, SESSION = quarterly (the active session). */
export type VpTrack = 'MONTH' | 'SESSION';

/** Reads a `track` URL value; anything but SESSION is the monthly track. */
export const parseVpTrack = (value?: string | null): VpTrack =>
  value === 'SESSION' ? 'SESSION' : 'MONTH';

export const vpTrackLabel = (track: VpTrack) =>
  track === 'SESSION' ? 'Quarterly Performance Pay' : 'Monthly Performance Pay';

/**
 * The signed-in user's performance pay score for one track: the active month
 * for MONTH (optionally a chosen `monthId`), the active session for SESSION.
 */
export const useVpTrackScore = (
  userId: string,
  track: VpTrack,
  options?: { monthId?: string },
) => {
  const isQuarterly = track === 'SESSION';
  const { data: activeSession, isLoading: sessionLoading } =
    useGetActiveSession();
  const sessionId = activeSession?.id ?? activeSession?.data?.id;

  const query = useGetVPScore(
    userId,
    isQuarterly
      ? { sessionId, scoreBy: 'SESSION', enabled: Boolean(userId && sessionId) }
      : {
          monthId: options?.monthId,
          scoreBy: 'MONTH',
          enabled: Boolean(userId),
        },
  );

  return {
    ...query,
    isLoading: isQuarterly
      ? sessionLoading || query.isLoading
      : query.isLoading,
  };
};
