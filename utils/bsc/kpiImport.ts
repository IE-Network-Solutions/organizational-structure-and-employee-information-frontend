import ExcelJS from 'exceljs';
import {
  BscCadence,
  KpiImportRowInput,
  KpiImportRowResult,
  TargetLogic,
} from '@/types/bsc';
import {
  METRIC_UNIT_OPTIONS,
  normalizeMeasurementUnit,
} from '@/utils/bsc/measurementUnit';

export const KPI_IMPORT_HEADERS = [
  'Name',
  'Description',
  'Perspective',
  'Unit of Measure',
  'Weight',
  'Target Logic',
  'Default Target',
  'Cadence',
] as const;

function parseTargetLogic(raw: string): TargetLogic | null {
  const value = raw.trim().toLowerCase();
  if (!value) return TargetLogic.HigherBetter;
  if (value.includes('lower')) return TargetLogic.LowerBetter;
  if (value.includes('bound')) return TargetLogic.Bounded;
  if (value.includes('higher')) return TargetLogic.HigherBetter;
  return null;
}

function parseCadence(raw: string): BscCadence | null {
  const value = raw.trim();
  if (!value) return null;
  const match = Object.values(BscCadence).find(
    (cadence) => cadence.toLowerCase() === value.toLowerCase(),
  );
  return match ?? null;
}

function cellText(value: ExcelJS.CellValue): string {
  if (value == null) return '';
  if (typeof value === 'object' && 'text' in value) {
    return String((value as { text?: string }).text ?? '').trim();
  }
  return String(value).trim();
}

export function parseKpiImportWorksheet(
  worksheet: ExcelJS.Worksheet,
): KpiImportRowResult[] {
  const results: KpiImportRowResult[] = [];
  const headerRow = worksheet.getRow(1);
  const headers = KPI_IMPORT_HEADERS.map((header, index) => {
    const cell = cellText(headerRow.getCell(index + 1).value);
    return cell || header;
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = headers.map((_, index) =>
      cellText(row.getCell(index + 1).value),
    );
    if (values.every((value) => !value)) return;

    const [
      name,
      description,
      perspective,
      measurementUnitRaw,
      weightRaw,
      targetLogicRaw,
      defaultTargetRaw,
      cadenceRaw,
    ] = values;

    if (!name) {
      results.push({ row: rowNumber, error: 'Name is required' });
      return;
    }
    if (!perspective) {
      results.push({ row: rowNumber, error: 'Perspective is required' });
      return;
    }
    const measurementUnit = normalizeMeasurementUnit(measurementUnitRaw);
    if (!measurementUnit) {
      results.push({ row: rowNumber, error: 'Unit of measure is required' });
      return;
    }

    const targetLogic = parseTargetLogic(targetLogicRaw);
    if (!targetLogic) {
      results.push({
        row: rowNumber,
        error: 'Target logic must be Higher is better, Lower is better, or Bounded',
      });
      return;
    }

    const weight = weightRaw ? Number(weightRaw) : 0;
    if (weightRaw && (!Number.isFinite(weight) || weight < 0 || weight > 100)) {
      results.push({ row: rowNumber, error: 'Weight must be between 0 and 100' });
      return;
    }

    const defaultTarget = defaultTargetRaw ? Number(defaultTargetRaw) : null;
    if (defaultTargetRaw && !Number.isFinite(Number(defaultTarget))) {
      results.push({ row: rowNumber, error: 'Default target must be a number' });
      return;
    }

    const cadence = cadenceRaw ? parseCadence(cadenceRaw) : null;
    if (cadenceRaw && !cadence) {
      results.push({ row: rowNumber, error: 'Invalid cadence value' });
      return;
    }

    results.push({
      row: rowNumber,
      input: {
        name: name.trim(),
        description: description?.trim() || null,
        perspective: perspective.trim(),
        measurementUnit,
        weight,
        targetLogic,
        defaultTarget,
        cadence,
      },
    });
  });

  return results;
}

export async function buildKpiImportTemplateBuffer(): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('KPI Import');
  worksheet.columns = KPI_IMPORT_HEADERS.map((header) => ({
    header,
    key: header,
    width: 22,
  }));
  worksheet.addRow([
    'Example KPI Name',
    'What this KPI measures',
    'Customer',
    METRIC_UNIT_OPTIONS[0].value,
    10,
    'Higher is better',
    90,
    BscCadence.Monthly,
  ]);
  return workbook.xlsx.writeBuffer();
}

export async function parseKpiImportFile(
  file: File,
): Promise<KpiImportRowResult[]> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];
  return parseKpiImportWorksheet(worksheet);
}
