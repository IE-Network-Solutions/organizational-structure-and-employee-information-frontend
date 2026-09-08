export const bscFilterButtonClassName =
  'border border-[#D9D9D9] font-normal text-[#4d4d4d]';

export const bscToolbarRowClassName =
  'flex justify-between items-center gap-4 mb-2 pt-3';

export const bscTableHeaderClassName =
  'whitespace-nowrap text-[#4d4d4d] text-base font-bold';

export const bscTableCellClassName = 'text-[#4d4d4d] text-sm font-normal';

export const bscTableClassName =
  'w-full [&_.ant-table]:!border-[#D9D9D9] [&_.ant-table-thead_.ant-table-cell]:!border-[#D9D9D9] [&_.ant-table-tbody_.ant-table-cell]:!border-[#D9D9D9] [&_.ant-table-thead>tr>th]:whitespace-nowrap [&_.ant-table-thead>tr>th]:before:!bg-transparent [&_.bsc-table-row-odd>td]:!bg-white [&_.bsc-table-row-even>td]:!bg-[#FAFAFA] [&_.bsc-table-row-odd_.ant-table-cell-fix-right]:!bg-white [&_.bsc-table-row-even_.ant-table-cell-fix-right]:!bg-[#FAFAFA] [&_.bsc-table-row-odd:hover>td]:!bg-[#f5f5f5] [&_.bsc-table-row-even:hover>td]:!bg-[#f5f5f5] [&_.bsc-table-row-odd:hover_.ant-table-cell-fix-right]:!bg-[#f5f5f5] [&_.bsc-table-row-even:hover_.ant-table-cell-fix-right]:!bg-[#f5f5f5]';

export function bscTableRowClassName(index: number, extra = ''): string {
  const stripe =
    index % 2 === 0 ? 'bsc-table-row-odd' : 'bsc-table-row-even';
  return extra ? `${stripe} ${extra}` : stripe;
}
