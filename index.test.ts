import HollySheets from './index';

const usersMock = [
  ['name', 'email'],
  ['John Doe', 'john@doe.com'],
  ['Mary Jane', ''],
  ['Jane Doe', ''],
  ['John Cash', ''],
];

const bathResponse = {
  "data": {
      "valueRanges": [
          {
              "range": "Users!A2:B2",
              "majorDimension": "ROWS",
              "values": [
                  [
                      "John Doe",
                      "john@doe.com"
                  ]
              ]
          },
          {
              "range": "Users!A4:B4",
              "majorDimension": "ROWS",
              "values": [
                  [
                      "Johnny Cash",
                      "johnny@cash.com"
                  ]
              ]
          }
      ]
  }
}


jest.mock('googleapis', () => {
  const originalModule = jest.requireActual('googleapis');
  return {
    ...originalModule,
    google: {
      ...originalModule.google,
      sheets: jest.fn(() => ({
        spreadsheets: {
          values: {
            get: jest.fn().mockResolvedValue({
              data: {
                values: usersMock
              },
            }),
            batchUpdate: jest.fn(),
            batchGet: jest.fn().mockResolvedValue(bathResponse),
          },
        },
      })),
    },
    JWT: jest.fn().mockImplementation(() => ({
      authorize: jest.fn(),
    })),
  };
});

describe('HollySheets', () => {
  const credentials = {
    clientEmail: 'test@example.com',
    privateKey: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n',
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
    const table = 'TestTable';
    const table2 = 'TestTable2';
    expect(hollySheets.table).not.toBe(table);
    const baseInstance = hollySheets.base(table);
    expect(baseInstance.table).toBe(table);
    expect(hollySheets.table).not.toBe(table);
    const baseInstance2 = hollySheets.base(table2);
    expect(baseInstance2.table).toBe(table2);
  });

  it('testing mockGoogleApis', async () => {
    const hollySheets = new HollySheets(credentials);

    interface User {
      name: string;
      email: string;
    }
    
    const users = hollySheets.base<User>('Users');

    const result = await users.findMany({
      where: {
        name: {
          contains: 'John',
        },
      },
    });

    const expected = [
      {
        range: 'Users!A2:B2',
        fields: { name: 'John Doe', email: 'john@doe.com' }
      },
      {
        range: 'Users!A5:B5',
        fields: { name: 'Johnny Cash', email: 'johnny@cash.com' }
      }
    ]
    expect(result).toEqual(expected);
  });
});
