import type { SelectProps } from 'antd';

type Options = SelectProps['options'];

export const formatToOptions = <T extends { [key: string]: any }>(
  items: T[],
  labelKey: keyof T,
  valueKey: keyof T,
): Options => {
  return items.map((item) => ({
    value: item[valueKey],
    label: item[labelKey],
  }));
};
