import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { TimeZoneDataType } from './interface';

const getTimeZone = async () => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/time-zone`,
    method: 'GET',
    headers: requestHeader(),
  });
};

export const useGetTimeZone = () => {
  return useQuery<TimeZoneDataType>('time-zone', () => getTimeZone(), {
    keepPreviousData: true,
    enabled: true,
  });
};

