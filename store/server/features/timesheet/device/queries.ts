import { requestHeader } from '@/helpers/requestHeader';
import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { AttendanceDevice, DiscoveredAttendanceDevice } from './interface';

const unwrapItems = <T>(response: any): T[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  return [];
};

export const getAttendanceDevices = async (): Promise<AttendanceDevice[]> => {
  const headers = await requestHeader();
  const response = await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/devices`,
    method: 'GET',
    headers,
  });
  return unwrapItems<AttendanceDevice>(response);
};

export const discoverAttendanceDevices = async (): Promise<
  DiscoveredAttendanceDevice[]
> => {
  const headers = await requestHeader();
  const response = await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/devices/discover`,
    method: 'GET',
    headers,
  });
  return unwrapItems<DiscoveredAttendanceDevice>(response);
};

export const useGetAttendanceDevices = () =>
  useQuery<AttendanceDevice[]>(['attendance-devices'], getAttendanceDevices, {
    staleTime: 30 * 1000,
  });

export const useDiscoverAttendanceDevices = () =>
  useQuery<DiscoveredAttendanceDevice[]>(
    ['attendance-devices-discover'],
    discoverAttendanceDevices,
    { staleTime: 30 * 1000 },
  );
