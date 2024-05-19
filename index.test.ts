// import { sheets_v4 } from 'googleapis'
import HollySheets from './index'
// import { JWT } from 'google-auth-library';

function mockGoogleApis(options: {getValue?: string[][], batchGetValue?: string[][], batchUpdateValue?: string[][]}) {
  const { getValue, batchGetValue, batchUpdateValue } = options;
  jest.mock('googleapis', () => {
    return {
      google: {
        sheets: jest.fn(() => ({
          spreadsheets: {
            values: {
              get: jest.fn(() => Promise.resolve(getValue ? {data: {values: getValue}} : {data: {values: [[]]}})),
              batchGet: jest.fn(() => Promise.resolve(batchGetValue ? {
                data: {
                  valueRanges: [
                    {
                      range:"Users!A2:B2",
                      majorDimension:"ROWS",
                      values:batchGetValue
                    }
                  ]
                }
              }: {data: {valueRanges: []}})),
              batchUpdate: jest.fn(() => Promise.resolve(batchUpdateValue ? batchUpdateValue : {data: {}})),
            },
          },
        })),
      },
    };
  });
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('HollySheets', () => {
  const credentials = {
    clientEmail: 'test@example.com',
    privateKey: 'test-private-key',
    spreadsheetId: 'spreadsheet-id',
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize HollySheets with credentials', () => {
    const hollySheets = new HollySheets(credentials);
    expect(hollySheets).toBeTruthy();
  });

  it('should set table with base method', () => {
    const hollySheets = new HollySheets(credentials);
    const table = 'TestTable'
    const table2 = 'TestTable2'
    expect(hollySheets.table).not.toBe(table);
    const baseInstance = hollySheets.base(table);
    expect(baseInstance.table).toBe(table);
    expect(hollySheets.table).not.toBe(table);
    const baseInstance2 = hollySheets.base(table2);
    expect(baseInstance2.table).toBe(table2);
  })

});