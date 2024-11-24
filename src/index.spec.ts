import { vi, describe, it, beforeEach, expect } from 'vitest'
import HolySheets from './index'
import { google } from 'googleapis'

// Mocking the response from Google Sheets API
const usersMock = [
  ['name', 'email'],
  ['John Doe', 'john@doe.com'],
  ['Mary Jane', 'mary@jane.com'],
  ['Jane Doe', 'jane@doe.com'],
  ['Johnny Cash', 'johnny@cash.com']
]

const batchResponse = {
  data: {
    valueRanges: [
      {
        range: 'Users!A2:B2',
        majorDimension: 'ROWS',
        values: [['John Doe', 'john@doe.com']]
      },
      {
        range: 'Users!A5:B5',
        majorDimension: 'ROWS',
        values: [['Johnny Cash', 'johnny@cash.com']]
      }
    ]
  }
}

// Fake Auth Client with necessary methods
const fakeAuthClient = {
  request: vi.fn().mockResolvedValue({ data: {} }),
  getRequestHeaders: vi.fn().mockResolvedValue({})
}

const clearMock = vi.fn().mockResolvedValue({})
const batchClearMock = vi.fn().mockResolvedValue({})
const batchUpdateMock = vi.fn().mockResolvedValue({})

// Define sheetsMock outside vi.mock
const sheetsMock = {
  spreadsheets: {
    values: {
      get: vi.fn().mockImplementation(({ range }) => {
        // Mock responses based on the range
        if (range === 'Users!1:1') {
          // Headers
          return Promise.resolve({ data: { values: [['name', 'email']] } })
        } else if (range === 'Users!A:A') {
          // Column A (names)
          return Promise.resolve({
            data: {
              values: [
                ['name'],
                ['John Doe'],
                ['Mary Jane'],
                ['Jane Doe'],
                ['Johnny Cash']
              ]
            }
          })
        } else if (range === 'Users!A2:B2') {
          // Specific row A2:B2
          return Promise.resolve({
            data: {
              values: [['John Doe', 'john@doe.com']]
            }
          })
        } else if (range === 'Users!A5:B5') {
          // Specific row A5:B5
          return Promise.resolve({
            data: {
              values: [['Johnny Cash', 'johnny@cash.com']]
            }
          })
        } else if (range === 'Users!A:AZ') {
          // Full data for insert
          return Promise.resolve({ data: { values: usersMock } })
        }
        // Default empty response for other ranges
        return Promise.resolve({ data: { values: [] } })
      }),
      batchUpdate: batchUpdateMock,
      batchGet: vi.fn().mockResolvedValue(batchResponse),
      clear: clearMock,
      batchClear: batchClearMock
    },
    get: vi.fn().mockResolvedValue({
      data: {
        sheets: [{ properties: { title: 'Users', sheetId: 12345 } }]
      }
    }),
    batchUpdate: batchUpdateMock,
    batchClear: clearMock
  }
}

// Mock the googleapis module
vi.mock('googleapis', () => {
  return {
    google: {
      auth: {
        // Mock the GoogleAuth class
        GoogleAuth: class {
          getClient() {
            return Promise.resolve(fakeAuthClient)
          }
        },
        JWT: class {
          constructor(
            email: string,
            keyFile: string | null,
            key: string,
            scopes: string[]
          ) {
            // Simulate JWT client initialization
          }
          authorize() {
            return Promise.resolve({ access_token: 'fake-access-token' })
          }
          // Mock methods if necessary
        },
        OAuth2: class {
          constructor(
            clientId: string,
            clientSecret: string,
            redirectUri: string
          ) {
            // Simulate OAuth2 client initialization
          }
          setCredentials(credentials: { access_token: string }) {
            // Simulate setting credentials
          }
          // Mock methods if necessary
        }
      },
      sheets: vi.fn().mockImplementation(options => sheetsMock)
    }
  }
})

describe('HolySheets', () => {
  const credentials = {
    spreadsheetId: 'spreadsheet-id',
    auth: new google.auth.GoogleAuth({
      credentials: {
        client_email: 'test@example.com',
        private_key: `-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n`
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize HolySheets with credentials', () => {
    const holySheets = new HolySheets(credentials)
    expect(holySheets).toBeTruthy()
  })

  it('should initialize HolySheets with JWT authentication', () => {
    const jwtClient = new google.auth.JWT(
      'test@example.com', // email
      undefined, // keyFile
      '-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n', // key
      ['https://www.googleapis.com/auth/spreadsheets'] // scopes
    )

    const credentials = {
      spreadsheetId: 'spreadsheet-id',
      auth: jwtClient
    }

    const holySheets = new HolySheets(credentials)
    expect(holySheets).toBeTruthy()
  })

  it('should initialize HolySheets with OAuth2 authentication', () => {
    const oauth2Client = new google.auth.OAuth2(
      'YOUR_CLIENT_ID',
      'YOUR_CLIENT_SECRET',
      'YOUR_REDIRECT_URI'
    )

    // Simulate setting an access token
    oauth2Client.setCredentials({
      access_token: 'YOUR_ACCESS_TOKEN'
    })

    const credentials = {
      spreadsheetId: 'spreadsheet-id',
      auth: oauth2Client
    }

    const holySheets = new HolySheets(credentials)
    expect(holySheets).toBeTruthy()
  })

  it('should set table with base method', () => {
    const holySheets = new HolySheets(credentials)
    const table = 'TestTable'
    const table2 = 'TestTable2'
    expect(holySheets.sheet).not.toBe(table)
    const baseInstance = holySheets.base(table)
    expect(baseInstance.sheet).toBe(table)
    expect(holySheets.sheet).not.toBe(table)
    const baseInstance2 = holySheets.base(table2)
    expect(baseInstance2.sheet).toBe(table2)
  })

  it('should fetch multiple records that match the where condition', async () => {
    const holySheets = new HolySheets(credentials)

    interface User {
      name: string
      email: string
    }

    const users = holySheets.base<User>('Users')

    const result = await users.findMany({
      where: {
        name: {
          contains: 'John'
        }
      }
    })

    const expected = [
      {
        range: 'Users!A2:B2',
        row: 2,
        data: { name: 'John Doe', email: 'john@doe.com' }
      },
      {
        range: 'Users!A5:B5',
        row: 5,
        data: { name: 'Johnny Cash', email: 'johnny@cash.com' }
      }
    ]

    expect(result).toEqual(expected)
  })

  it.skip('should insert data into the sheet', async () => {
    const holySheets = new HolySheets(credentials)
    const users = holySheets.base<{ name: string; email: string }>('Users')

    const dataToInsert = [
      { name: 'Alice Wonderland', email: 'alice@wonderland.com' }
    ]

    await users.insert({
      data: dataToInsert
    })

    expect(
      google.sheets({ version: 'v4' }).spreadsheets.values.batchUpdate
    ).toHaveBeenCalledTimes(1)
  })

  it('should handle errors when fetching headers', async () => {
    const sheetsInstance = google.sheets({ version: 'v4' })
    const getFn = sheetsInstance.spreadsheets.values
      .get as unknown as ReturnType<typeof vi.fn>

    getFn.mockImplementationOnce(({ range }: { range: string }) => {
      if (range === 'Users!1:1') {
        return Promise.reject(new Error('Test error'))
      }
      // For other ranges, use the default mock implementation
      return Promise.resolve({ data: { values: usersMock } })
    })

    const holySheets = new HolySheets(credentials)

    await expect(
      holySheets.base<{ name: string; email: string }>('Users').findMany({
        where: { name: 'John' }
      })
    ).rejects.toThrow('Test error')
  })

  it('should clear the first record that matches the where condition', async () => {
    const holySheets = new HolySheets(credentials)

    interface User {
      name: string
      email: string
    }

    const users = holySheets.base<User>('Users')

    const result = await users.clearFirst({
      where: {
        name: {
          contains: 'John'
        }
      }
    })

    const expected = {
      range: 'Users!A2:B2',
      row: 2,
      data: { name: 'John Doe', email: 'john@doe.com' }
    }

    expect(result).toEqual(expected)
    expect(clearMock).toHaveBeenCalledTimes(1)
  })

  it('should clear multiple records that match the where condition', async () => {
    const holySheets = new HolySheets(credentials)

    interface User {
      name: string
      email: string
    }

    const users = holySheets.base<User>('Users')

    const result = await users.clearMany({
      where: {
        name: {
          contains: 'John'
        }
      }
    })

    const expected = [
      {
        range: 'Users!A2:B2',
        row: 2,
        data: { name: 'John Doe', email: 'john@doe.com' }
      },
      {
        range: 'Users!A5:B5',
        row: 5,
        data: { name: 'Johnny Cash', email: 'johnny@cash.com' }
      }
    ]

    expect(result).toEqual(expected)
    expect(batchClearMock).toHaveBeenCalledTimes(1)
  })

  it('should delete the first record that matches the where condition', async () => {
    const holySheets = new HolySheets(credentials)

    interface User {
      name: string
      email: string
    }

    const users = holySheets.base<User>('Users')

    const result = await users.deleteFirst({
      where: {
        name: {
          contains: 'John'
        }
      }
    })

    const expected = {
      range: 'Users!A2:B2',
      row: 2,
      data: { name: 'John Doe', email: 'john@doe.com' }
    }

    expect(result).toEqual(expected)
    expect(batchUpdateMock).toHaveBeenCalledTimes(1)
  })

  it('should delete multiple records that match the where condition', async () => {
    const holySheets = new HolySheets(credentials)

    interface User {
      name: string
      email: string
    }

    const users = holySheets.base<User>('Users')

    const result = await users.deleteMany({
      where: {
        name: {
          contains: 'John'
        }
      }
    })

    const expected = [
      {
        range: 'Users!A2:B2',
        row: 2,
        data: { name: 'John Doe', email: 'john@doe.com' }
      },
      {
        range: 'Users!A5:B5',
        row: 5,
        data: { name: 'Johnny Cash', email: 'johnny@cash.com' }
      }
    ]

    expect(result).toEqual(expect.arrayContaining(expected))
    expect(result).toHaveLength(expected.length)
    expect(batchUpdateMock).toHaveBeenCalledTimes(1)
  })
})
