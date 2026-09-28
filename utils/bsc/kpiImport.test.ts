import ExcelJS from 'exceljs';
import { TargetLogic } from '@/types/bsc';
import { KPI_IMPORT_HEADERS, parseKpiImportWorksheet } from './kpiImport';

function sampleSheet(): ExcelJS.Worksheet {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Sample');
  // Mirrors IE-KPIs Sample V.0.1: header on row 2 from column B, extra cols.
  sheet.getRow(2).values = [
    undefined,
    'Role',
    'KPI Name',
    'Period',
    'Weight',
    'Definition / What It Measures',
    'Unit',
    'Target',
    'Target Direction',
  ];
  sheet.getRow(3).values = [
    undefined,
    'Field Engineer',
    'SLA compliance',
    'Monthly',
    0.15,
    'Requests resolved within SLA',
    '%',
    0.9,
    'Higher is Better',
  ];
  sheet.getRow(4).values = [
    undefined,
    'Field Engineer',
    'Recurring issues',
    'Monthly',
    0.2,
    'Repeat incidents',
    '%',
    '< 10%',
    'Lower is Better',
  ];
  sheet.getRow(5).values = [
    undefined,
    'Team Lead',
    'Delivery',
    'Monthly',
    0.2,
    'On-time delivery',
    '%',
    '>=85%',
    'Higher is Better',
  ];
  return sheet;
}

describe('kpiImport', () => {
  it('uses the approved 5 columns', () => {
    expect([...KPI_IMPORT_HEADERS]).toEqual([
      'KPI Name',
      'Definition',
      'Unit',
      'Target',
      'Target Direction',
    ]);
  });

  it('reads only the approved columns from the sample layout', () => {
    const rows = parseKpiImportWorksheet(sampleSheet(), 'Customer');
    expect(rows).toHaveLength(3);
    expect(rows[0].input).toMatchObject({
      name: 'SLA compliance',
      description: 'Requests resolved within SLA',
      measurementUnit: '%',
      defaultTarget: 90,
      targetLogic: TargetLogic.HigherBetter,
      perspective: 'Customer',
    });
    expect(rows[1].input?.defaultTarget).toBe(10);
    expect(rows[1].input?.targetLogic).toBe(TargetLogic.LowerBetter);
    expect(rows[2].input?.defaultTarget).toBe(85);
  });

  it('reports missing columns', () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('KPIs');
    sheet.addRow(['KPI Name', 'Unit']);
    sheet.addRow(['X', '%']);
    expect(parseKpiImportWorksheet(sheet, 'Customer')[0].error).toMatch(
      /Missing column/,
    );
  });

  it('flags Bounded KPIs, which need worst/best case', () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('KPIs');
    sheet.addRow([...KPI_IMPORT_HEADERS]);
    sheet.addRow(['Rating', 'x', 'Score', 4, 'Bounded']);
    expect(parseKpiImportWorksheet(sheet, 'Customer')[0].error).toMatch(
      /Bounded/,
    );
  });
});
