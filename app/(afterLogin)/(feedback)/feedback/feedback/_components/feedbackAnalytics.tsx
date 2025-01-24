import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import dayjs from 'dayjs';

interface FeedbackRecord {
  created_at: string;
  [key: string]: any; // To allow for additional fields
}

interface FeedbackStats {
  received: string;
  totalReceived: number;
  issued: string;
  totalIssued: number;
}

interface FeedbackStatResponse {
  appreciationStats: FeedbackStats;
  reprimandStats: FeedbackStats;
}

export class FeedbackService {
  // Utility to calculate percentage change
  static calculatePercentageChange(current: number, previous: number): string {
    if (previous === 0) {
      return current > 0 ? '100% increase' : 'No change';
    }

    const change = ((current - previous) / previous) * 100;
    const roundedChange = Math.round(change);

    return change > 0
      ? `${roundedChange}% increase`
      : `${Math.abs(roundedChange)}% decrease`;
  }

  // Utility to filter feedback data by type, user, and time range
  static filterFeedbackData(
    feedbackData: FeedbackRecord[],
    variant: string,
    userId: string,
    key: 'issuerId' | 'recipientId',
    startOfWeek: dayjs.Dayjs,
    endOfWeek: dayjs.Dayjs,
  ): FeedbackRecord[] {
    return feedbackData?.filter(
      (record) =>
        record.feedbackVariant.varient === variant &&
        record[key] === userId &&
        dayjs(record.created_at).isBetween(startOfWeek, endOfWeek, null, '[]'),
    );
  }

  // Core method to calculate feedback stats
  static getFeedbackStats(
    feedbackRecordData: FeedbackRecord[],
  ): FeedbackStatResponse {
    const userId = useAuthenticationStore.getState().userId;

    const thisWeekRange = {
      start: dayjs().startOf('week'),
      end: dayjs().endOf('week'),
    };

    const lastWeekRange = {
      start: thisWeekRange.start.subtract(1, 'week'),
      end: thisWeekRange.end.subtract(1, 'week'),
    };

    // Helper function to calculate stats for a feedback type
    const calculateFeedbackStats = (
      variant: string,
    ): {
      received: string;
      totalReceived: number;
      issued: string;
      totalIssued: number;
    } => {
      const thisWeekReceived = this.filterFeedbackData(
        feedbackRecordData,
        variant,
        userId,
        'recipientId',
        thisWeekRange.start,
        thisWeekRange.end,
      )?.length;

      const lastWeekReceived = this.filterFeedbackData(
        feedbackRecordData,
        variant,
        userId,
        'recipientId',
        lastWeekRange.start,
        lastWeekRange.end,
      )?.length;

      const thisWeekIssued = this.filterFeedbackData(
        feedbackRecordData,
        variant,
        userId,
        'issuerId',
        thisWeekRange.start,
        thisWeekRange.end,
      )?.length;

      const lastWeekIssued = this.filterFeedbackData(
        feedbackRecordData,
        variant,
        userId,
        'issuerId',
        lastWeekRange.start,
        lastWeekRange.end,
      )?.length;

      return {
        received: this.calculatePercentageChange(
          thisWeekReceived,
          lastWeekReceived,
        ),
        totalReceived: thisWeekReceived,
        issued: this.calculatePercentageChange(thisWeekIssued, lastWeekIssued),
        totalIssued: thisWeekIssued,
      };
    };

    return {
      appreciationStats: calculateFeedbackStats('appreciation'),
      reprimandStats: calculateFeedbackStats('reprimand'),
    };
  }
}
