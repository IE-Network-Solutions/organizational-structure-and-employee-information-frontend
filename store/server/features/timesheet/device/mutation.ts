import { requestHeader } from '@/helpers/requestHeader';
import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import { AttendanceDevicePurpose } from './interface';

export interface SaveAttendanceDevicePayload {
  name: string;
  serialNumber: string;
  externalDeviceId?: number | null;
  purpose: AttendanceDevicePurpose;
  acceptUnknownPunches: boolean;
  enabled: boolean;
  areaName?: string | null;
  zktIsAttendance?: boolean | null;
}

const saveAttendanceDevice = async ({
  id,
  payload,
}: {
  id?: string;
  payload: SaveAttendanceDevicePayload;
}) => {
  const headers = await requestHeader();
  return crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/devices${id ? `/${id}` : ''}`,
    method: id ? 'PATCH' : 'POST',
    data: payload,
    headers,
  });
};

const deleteAttendanceDevice = async (id: string) => {
  const headers = await requestHeader();
  return crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/devices/${id}`,
    method: 'DELETE',
    headers,
  });
};

export const useSaveAttendanceDevice = () => {
  const queryClient = useQueryClient();
  return useMutation(saveAttendanceDevice, {
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance-devices']);
      queryClient.invalidateQueries(['attendance-devices-discover']);
    },
  });
};

export const useDeleteAttendanceDevice = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteAttendanceDevice, {
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance-devices']);
      queryClient.invalidateQueries(['attendance-devices-discover']);
    },
  });
};
