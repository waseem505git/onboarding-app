import { describe, expect, it } from 'vitest';
import ExcelJS from 'exceljs';
import { parseWorkbook } from './workbookParser';

async function buildSampleWorkbook(): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Sheet1');
  sheet.mergeCells('A1:B1');
  sheet.getCell('A1').value = 'Intro to 1274 DM';
  sheet.getCell('D1').value = 'ECD';

  sheet.mergeCells('A2:A3');
  sheet.getCell('A2').value = 'General';
  sheet.getCell('B2').value = 'adding to relavant lists/groups';
  sheet.getCell('F2').value = { text: 'PDL Manager', hyperlink: 'https://pdlmanager.intel.com/SearchPDL' };
  sheet.getCell('B3').value = 'AGS copy';

  // A lone section-header row with no other content, like "Shifts training".
  sheet.getCell('A4').value = 'Shifts training';

  sheet.getCell('A5').value = 'Systems installation & overview';
  sheet.getCell('B5').value = 'ICE';

  // A row that should be dropped entirely: unsafe javascript: hyperlink.
  sheet.getCell('A6').value = 'Systems installation & overview';
  sheet.getCell('B6').value = 'DETS';
  sheet.getCell('F6').value = { text: 'bad link', hyperlink: 'javascript:alert(1)' };

  return (await workbook.xlsx.writeBuffer()) as unknown as ArrayBuffer;
}

describe('parseWorkbook', () => {
  it('imports every meaningful row, including lone section headers, without loss', async () => {
    const buffer = await buildSampleWorkbook();
    const result = await parseWorkbook(buffer, 'sample.xlsx');
    // Rows 2,3 (General x2), 4 (Shifts training header-only), 5,6 (Systems x2) = 5 rows.
    expect(result.rows).toHaveLength(5);
    const titles = result.rows.map((r) => r.title);
    expect(titles).toContain('adding to relavant lists/groups');
    expect(titles).toContain('AGS copy');
    expect(titles).toContain('ICE');
    expect(titles).toContain('DETS');
    expect(titles).toContain('Shifts training');
  });

  it('does not treat the title row (A1=B1) as a task', async () => {
    const buffer = await buildSampleWorkbook();
    const result = await parseWorkbook(buffer, 'sample.xlsx');
    expect(result.rows.some((r) => r.title === 'Intro to 1274 DM')).toBe(false);
  });

  it('carries forward merged category headers to every row in the range', async () => {
    const buffer = await buildSampleWorkbook();
    const result = await parseWorkbook(buffer, 'sample.xlsx');
    const ags = result.rows.find((r) => r.title === 'AGS copy');
    expect(ags?.category).toBe('General');
  });

  it('extracts a sanitized hyperlink from a hyperlink-with-text cell', async () => {
    const buffer = await buildSampleWorkbook();
    const result = await parseWorkbook(buffer, 'sample.xlsx');
    const row = result.rows.find((r) => r.title === 'adding to relavant lists/groups');
    expect(row?.linkUrl).toBe('https://pdlmanager.intel.com/SearchPDL');
  });

  it('treats unsafe link protocols as absent rather than rendering/executing them', async () => {
    const buffer = await buildSampleWorkbook();
    const result = await parseWorkbook(buffer, 'sample.xlsx');
    const row = result.rows.find((r) => r.title === 'DETS');
    expect(row?.linkUrl).toBeUndefined();
  });

  it('produces a stable content hash for identical content', async () => {
    const buffer1 = await buildSampleWorkbook();
    const buffer2 = await buildSampleWorkbook();
    const result1 = await parseWorkbook(buffer1, 'a.xlsx');
    const result2 = await parseWorkbook(buffer2, 'b.xlsx');
    expect(result1.contentHash).toBe(result2.contentHash);
  });
});
