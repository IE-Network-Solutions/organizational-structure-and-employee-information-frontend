import ExcelJS from 'exceljs';
import { KpiImportRowResult, TargetLogic } from '@/types/bsc';
import { normalizeMeasurementUnit } from '@/utils/bsc/measurementUnit';

/**
 * Approved KPI import columns (IE-KPIs Sample V.0.1). Only these are read;
 * any other columns in the sheet (Role, Period, Formula…) are ignored.
 */
export const KPI_IMPORT_HEADERS = [
  'KPI Name',
  'Definition',
  'Unit',
  'Target',
  'Target Direction',
] as const;

type ImportColumn = 'name' | 'definition' | 'unit' | 'target' | 'direction';

/** Header text (lower-case, trimmed) → column; tolerant of older labels. */
const HEADER_ALIASES: Record<string, ImportColumn> = {
  'kpi name': 'name',
  name: 'name',
  definition: 'definition',
  'definition / what it measures': 'definition',
  description: 'definition',
  unit: 'unit',
  'unit of measure': 'unit',
  target: 'target',
  'default target': 'target',
  'target direction': 'direction',
  'target logic': 'direction',
};

/** Template origin, matching the sample: header row 2, table from column B. */
const TEMPLATE_HEADER_ROW = 2;
const TEMPLATE_FIRST_COLUMN = 2;

function cellText(cell: ExcelJS.Cell): string {
  const value = cell.value;
  if (value == null) return '';
  if (typeof value === 'object') {
    if ('richText' in value && Array.isArray(value.richText)) {
      return value.richText
        .map((part) => part.text)
        .join('')
        .trim();
    }
    if ('text' in value) {
      return String((value as { text?: string }).text ?? '').trim();
    }
    if ('result' in value) {
      return String((value as { result?: unknown }).result ?? '').trim();
    }
  }
  return String(value).trim();
}

function parseTargetDirection(raw: string): TargetLogic | null {
  const value = raw.trim().toLowerCase().replace(/[\s_-]/g, '');
  if (!value) return TargetLogic.HigherBetter;
  if (value.includes('lower')) return TargetLogic.LowerBetter;
  if (value.includes('bound')) return TargetLogic.Bounded;
  if (value.includes('higher')) return TargetLogic.HigherBetter;
  return null;
}

/**
 * Target cells in the sample mix formats: `0.9` (Excel %), `100%`, `>=85%`,
 * `< 10%`. Comparison signs are dropped (direction lives in its own column);
 * a bare fraction ≤ 1 in a % KPI (or a %-formatted cell) is scaled to 0–100.
 */
function parseTarget(
  cell: ExcelJS.Cell,
  unit: string,
): { value: number | null; error?: string } {
  const text = cellText(cell);
  if (!text) return { value: null };

  const hasPercentSign = text.includes('%');
  const cleaned = text.replace(/[<>=≤≥%\s,]/g, '');
  const value = Number(cleaned);
  if (!cleaned || !Number.isFinite(value)) {
    return { value: null, error: `Target "${text}" is not a number` };
  }

  const percentFormatted =
    typeof cell.numFmt === 'string' && cell.numFmt.includes('%');
  if (
    !hasPercentSign &&
    (percentFormatted || (unit === '%' && Math.abs(value) <= 1))
  ) {
    return { value: Number((value * 100).toFixed(4)) };
  }
  return { value };
}

/** Find the header row (sample puts it on row 2, column B) → column map. */
function locateHeaders(worksheet: ExcelJS.Worksheet): {
  headerRow: number;
  columns: Partial<Record<ImportColumn, number>>;
} | null {
  const lastRow = Math.min(worksheet.rowCount, 15);
  for (let rowNumber = 1; rowNumber <= lastRow; rowNumber += 1) {
    const columns: Partial<Record<ImportColumn, number>> = {};
    worksheet.getRow(rowNumber).eachCell((cell, colNumber) => {
      const key = HEADER_ALIASES[cellText(cell).toLowerCase()];
      if (key && columns[key] == null) columns[key] = colNumber;
    });
    if (columns.name != null) return { headerRow: rowNumber, columns };
  }
  return null;
}

export function parseKpiImportWorksheet(
  worksheet: ExcelJS.Worksheet,
  perspective: string,
): KpiImportRowResult[] {
  const located = locateHeaders(worksheet);
  if (!located) {
    return [
      {
        row: 1,
        error: `Header row not found. Expected columns: ${KPI_IMPORT_HEADERS.join(', ')}`,
      },
    ];
  }
  const { headerRow, columns } = located;
  const missing = KPI_IMPORT_HEADERS.filter((header) => {
    const key = HEADER_ALIASES[header.toLowerCase()];
    return columns[key] == null;
  });
  if (missing.length) {
    return [
      {
        row: headerRow,
        error: `Missing column(s): ${missing.join(', ')}`,
      },
    ];
  }

  const results: KpiImportRowResult[] = [];
  const cell = (row: ExcelJS.Row, key: ImportColumn) =>
    row.getCell(columns[key] as number);

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRow) return;

    const name = cellText(cell(row, 'name'));
    const definition = cellText(cell(row, 'definition'));
    const unitRaw = cellText(cell(row, 'unit'));
    const directionRaw = cellText(cell(row, 'direction'));
    const targetText = cellText(cell(row, 'target'));
    if (!name && !definition && !unitRaw && !directionRaw && !targetText) {
      return; // blank line
    }

    if (!name) {
      results.push({ row: rowNumber, error: 'KPI Name is required' });
      return;
    }
    const measurementUnit = normalizeMeasurementUnit(unitRaw);
    if (!measurementUnit) {
      results.push({ row: rowNumber, error: 'Unit is required' });
      return;
    }
    const targetLogic = parseTargetDirection(directionRaw);
    if (!targetLogic) {
      results.push({
        row: rowNumber,
        error:
          'Target Direction must be Higher is Better, Lower is Better, or Bounded',
      });
      return;
    }
    if (targetLogic === TargetLogic.Bounded) {
      // BE import cannot create Bounded KPIs (needs worst/best case values).
      results.push({
        row: rowNumber,
        error:
          'Bounded KPIs need worst/best case values — add them from the KPI form',
      });
      return;
    }
    const target = parseTarget(cell(row, 'target'), measurementUnit);
    if (target.error) {
      results.push({ row: rowNumber, error: target.error });
      return;
    }

    results.push({
      row: rowNumber,
      input: {
        name,
        description: definition || null,
        perspective,
        measurementUnit,
        targetLogic,
        defaultTarget: target.value,
      },
    });
  });

  return results;
}

/** Download template in the approved sample layout (header row 2, from B). */
export async function buildKpiImportTemplateBuffer(): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('KPIs');

  worksheet.getColumn(1).width = 4.33;
  [40, 46, 10, 12, 18].forEach((width, index) => {
    worksheet.getColumn(TEMPLATE_FIRST_COLUMN + index).width = width;
  });

  worksheet.addTable({
    name: 'KPI_Table',
    ref: `B${TEMPLATE_HEADER_ROW}`,
    headerRow: true,
    style: { theme: 'TableStyleMedium2', showRowStripes: true },
    columns: KPI_IMPORT_HEADERS.map((header) => ({
      name: header,
      filterButton: true,
    })),
    rows: [
      [
        'Services meeting SLA for specific solution',
        'Number of support activities and service requests resolved within the agreed SLA time. It measures SLA compliance in terms of time',
        '%',
        '90%',
        'Higher is Better',
      ],
      [
        'Minimize recurring technical problems',
        'Number of technical issues that occurred without a previously identified related risk or issue',
        '%',
        '< 10%',
        'Lower is Better',
      ],
    ],
  });

  const headerCells = worksheet.getRow(TEMPLATE_HEADER_ROW);
  headerCells.font = { bold: true };
  worksheet.eachRow((row) => {
    row.alignment = { vertical: 'top', wrapText: true };
  });

  return workbook.xlsx.writeBuffer();
}

export async function parseKpiImportFile(
  file: File,
  perspective: string,
): Promise<KpiImportRowResult[]> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];
  return parseKpiImportWorksheet(worksheet, perspective);
}
