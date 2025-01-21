import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);


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
      ? `${roundedChange ?? 0}% increase`
      : `${Math.abs(roundedChange ?? 0)}% decrease`;
  }

  // Utility to filter feedback data by type, user, and time range
  static filterFeedbackData(
    feedbackData: FeedbackRecord[]=[],
    variant: string,
    userId: string,
    key: 'issuerId' | 'recipientId',
    startOfWeek: dayjs.Dayjs,
    endOfWeek: dayjs.Dayjs,
    user:string
  ): FeedbackRecord[] {


    console.log( startOfWeek,endOfWeek,"PPPPPPPPPPPPPPPP")
    let filteredData: FeedbackRecord[];

    if (user === 'all') {
      // Filter when `user` is 'all'
      filteredData = feedbackData.filter((item) => {
        const createdAt = dayjs(item.createdAt); // Convert to a Day.js instance
        return (
          item.feedbackVariant.variant === variant &&
          createdAt.isBetween(startOfWeek, endOfWeek, null, '[]') // Inclusive range
        );
      });
    } else {
      filteredData = feedbackData.filter((item) => {
        const createdAt = dayjs(item.createdAt); // Use dayjs for date comparisons
        return (
          item.feedbackVariant.variant === variant &&
          item[key] === userId &&
          createdAt.isBetween(startOfWeek, endOfWeek, null, '[]') // Inclusive range
        );
      });
    }
  
    return filteredData || []; // Return an empty array if nothing is filtered
  }

  // Core method to calculate feedback stats
  static getFeedbackStats(
    feedbackRecordData: FeedbackRecord[],
    user:string
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


    console.log({
      feedbackRecordData:feedbackRecordData,
      lastWeekRange:lastWeekRange,
      thisWeekRange:thisWeekRange
    },"1**************************")
    // Helper function to calculate stats for a feedback type
    const calculateFeedbackStats = (
      variant: string,
    ): {
      received: string;
      totalReceived: number;
      issued: string;
      totalIssued: number;
    } => {


      const thisWeekRangeStart = dayjs(thisWeekRange.start);
      const thisWeekRangeEnd = dayjs(thisWeekRange.end);

      const lastWeekRangeStart = dayjs(lastWeekRange.start);
      const lastWeekRangeEnd = dayjs(lastWeekRange.end);

      const thisWeekReceived = this.filterFeedbackData(
        feedbackRecordData,
        variant,
        userId,
        'recipientId',
        thisWeekRangeStart,
        thisWeekRangeEnd,
        user
      )?.length;

      const lastWeekReceived = this.filterFeedbackData(
        feedbackRecordData,
        variant,
        userId,
        'recipientId',
        lastWeekRangeStart,
        lastWeekRangeEnd,
        user
      )?.length;

      const thisWeekIssued = this.filterFeedbackData(
        feedbackRecordData,
        variant,
        userId,
        'issuerId',
        thisWeekRangeStart,
        thisWeekRangeEnd,
        user
      )?.length;

      const lastWeekIssued = this.filterFeedbackData(
        feedbackRecordData,
        variant,
        userId,
        'issuerId',
        lastWeekRangeStart,
        lastWeekRangeEnd,
        user
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
