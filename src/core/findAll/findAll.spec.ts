import { describe, it, expect, vi, beforeEach } from 'vitest'
import { findAll } from './findAll'
import { IGoogleSheetsService } from '../../services/google-sheets/IGoogleSheetsService'
import { MetadataService } from '../../services/metadata/MetadataService'
import { getHeaders } from '../../utils/headers/headers'
import { combine } from '../../utils/dataUtils/dataUtils'
import { ErrorCode, ErrorMessages } from '../../services/errors/errorMessages'
import { CellValue } from '../../types/cellValue'
import { SheetHeaders } from '../../types/headers'

// Define a RecordType for the tests
type RecordType = {
  id?: string
  name?: string
  email?: string
}

// Mock MetadataService with a factory function
vi.mock('../../services/metadata/MetadataService', () => {
  return {
    MetadataService: vi.fn().mockImplementation(() => {
      return {
        calculateDuration: vi.fn().mockReturnValue(100),
        createMetadata: vi.fn().mockImplementation((options: any) => ({
          operationType: options.operationType,
          spreadsheetId: options.spreadsheetId,
          sheetId: options.sheetId,
          ranges: options.ranges,
          recordsAffected: options.recordsAffected,
          status: options.status,
          error: options.error,
          duration: options.duration
        }))
      }
    })
  }
})

// Mock the getHeaders function
vi.mock('../../utils/headers/headers', () => {
  return {
    getHeaders: vi.fn()
  }
})

// Mock the combine function
vi.mock('../../utils/dataUtils/dataUtils', () => {
  return {
    combine: vi.fn((data, headers) => {
      return headers.reduce((acc, header) => {
        const headerByIndex = headers.find(h => h.index === header.index)
        const key = headerByIndex?.name
        acc[key] = data[header.index]
        return acc
      })
    })
  }
})

// Define a mock for IGoogleSheetsService
const mockGetValues = vi.fn()
const mockSheetsService: IGoogleSheetsService = {
  getValues: mockGetValues,
  batchGetValues: vi.fn(),
  updateValues: vi.fn(),
  batchUpdateValues: vi.fn(),
  clearValues: vi.fn(),
  batchClearValues: vi.fn(),
  deleteRows: vi.fn(),
  batchDeleteRows: vi.fn(),
  getSpreadsheet: vi.fn(),
  getAuth: vi.fn()
} as any // Cast to any to satisfy TypeScript

describe('findAll', () => {
  let metadataInstance: {
    calculateDuration: ReturnType<typeof vi.fn>
    createMetadata: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    // Reset all mocks before each test to ensure isolation
    vi.resetAllMocks()

    // Mock the instance of MetadataService
    metadataInstance = {
      calculateDuration: vi.fn().mockReturnValue(100),
      createMetadata: vi.fn().mockImplementation((options: any) => ({
        operationType: options.operationType,
        spreadsheetId: options.spreadsheetId,
        sheetId: options.sheetId,
        ranges: options.ranges,
        recordsAffected: options.recordsAffected,
        status: options.status,
        error: options.error,
        duration: options.duration
      }))
    }

    // Mock the constructor of MetadataService to return the mocked instance
    ;(MetadataService as any).mockImplementation(() => metadataInstance)
  })

  it('should retrieve all records without selection options', async () => {
    // Arrange
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'Sheet1'
    const headers: SheetHeaders[] = [
      { name: 'id', column: 'A', index: 0 },
      { name: 'name', column: 'B', index: 1 },
      { name: 'email', column: 'C', index: 2 }
    ]
    // const values = [['Alice'], ['Bob'], ['Alice']]
    const allValues: CellValue[][] = [
      ['1', 'John Doe', 'john@example.com'],
      ['2', 'Jane Smith', 'jane@example.com']
    ]

    // Mock the getHeaders function to return headers
    ;(getHeaders as any).mockResolvedValue(headers)

    // Mock the sheets.getValues function to return allValues
    mockGetValues.mockResolvedValue(allValues)
    ;(combine as ReturnType<typeof vi.fn>).mockImplementation(
      (values, headers) => {
        const record: Record<string, any> = {}
        headers.forEach((header: { name: string }, index: number) => {
          record[header.name] = values[index]
        })
        return record
      }
    )
    // Act
    const result = await findAll<RecordType>(
      {
        spreadsheetId,
        sheets: mockSheetsService,
        sheet: sheetName
      },
      {}, // No selection options
      {
        includeMetadata: true
      }
    )

    // Assert
    expect(getHeaders).toHaveBeenCalledWith({
      sheet: sheetName,
      sheets: mockSheetsService,
      spreadsheetId
    })

    expect(mockGetValues).toHaveBeenCalledWith(`${sheetName}!A2:C`)
    expect(combine).toHaveBeenCalledTimes(2)
    expect(combine).toHaveBeenNthCalledWith(
      1,
      ['1', 'John Doe', 'john@example.com'],
      headers
    )
    expect(combine).toHaveBeenNthCalledWith(
      2,
      ['2', 'Jane Smith', 'jane@example.com'],
      headers
    )
    expect(true).toBe(true)
    expect(result).toEqual({
      data: [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
      ],
      rows: [2, 3],
      ranges: [`${sheetName}!A2:C`],
      metadata: {
        operationType: 'find',
        spreadsheetId,
        sheetId: sheetName,
        ranges: [`${sheetName}!A2:C`],
        recordsAffected: 2,
        status: 'success',
        duration: 100
      }
    })
  })

  it('should retrieve selected fields when selection options are provided', async () => {
    // Arrange
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'Sheet1'
    const headers: SheetHeaders[] = [
      { name: 'id', column: 'A', index: 0 },
      { name: 'name', column: 'B', index: 1 },
      { name: 'email', column: 'C', index: 2 }
    ]

    const allValues: CellValue[][] = [
      ['1', 'John Doe', 'john@example.com'],
      ['2', 'Jane Smith', 'jane@example.com']
    ]

    const select = { name: true, email: true }

    // Mock the getHeaders function to return headers
    ;(getHeaders as any).mockResolvedValue(headers)

    // Mock the sheets.getValues function to return allValues
    mockGetValues.mockResolvedValue(allValues)
    ;(combine as ReturnType<typeof vi.fn>).mockImplementation(
      (data, headers) => {
        return headers.reduce((acc: RecordType, header) => {
          const headerByIndex = headers.find(h => h.index === header.index)
          const key = headerByIndex?.name as keyof RecordType
          acc[key] = data[header.index] as RecordType[keyof RecordType]
          return acc
        }, {} as RecordType)
      }
    )
    // Act
    const result = await findAll<RecordType>(
      {
        spreadsheetId,
        sheets: mockSheetsService,
        sheet: sheetName
      },
      {
        select
      },
      {
        includeMetadata: true
      }
    )

    // Assert
    expect(getHeaders).toHaveBeenCalledWith({
      sheet: sheetName,
      sheets: mockSheetsService,
      spreadsheetId
    })

    expect(mockGetValues).toHaveBeenCalledWith(`${sheetName}!A2:C`)

    expect(combine).toHaveBeenCalledTimes(2)

    expect(result).toEqual({
      data: [
        { name: 'John Doe', email: 'john@example.com' },
        { name: 'Jane Smith', email: 'jane@example.com' }
      ],
      rows: [2, 3],
      ranges: [`${sheetName}!A2:C`],
      metadata: {
        operationType: 'find',
        spreadsheetId,
        sheetId: sheetName,
        ranges: [`${sheetName}!A2:C`],
        recordsAffected: 2,
        status: 'success',
        duration: 100
      }
    })
  })

  it('should include metadata when includeMetadata is true', async () => {
    // Arrange
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'Sheet1'
    const headers: SheetHeaders[] = [
      { name: 'id', column: 'A', index: 0 },
      { name: 'name', column: 'B', index: 1 },
      { name: 'email', column: 'C', index: 2 }
    ]

    const allValues: CellValue[][] = [['1', 'John Doe', 'john@example.com']]

    // Mock the getHeaders function to return headers
    ;(getHeaders as any).mockResolvedValue(headers)

    // Mock the sheets.getValues function to return allValues
    mockGetValues.mockResolvedValue(allValues)
    ;(combine as ReturnType<typeof vi.fn>).mockImplementation(
      (data, headers) => {
        return headers.reduce((acc: RecordType, header) => {
          const headerByIndex = headers.find(h => h.index === header.index)
          const key = headerByIndex?.name as keyof RecordType
          acc[key] = data[header.index] as RecordType[keyof RecordType]
          return acc
        }, {} as RecordType)
      }
    )
    // Act
    const result = await findAll<RecordType>(
      {
        spreadsheetId,
        sheets: mockSheetsService,
        sheet: sheetName
      },
      undefined, // No selection options
      {
        includeMetadata: true
      }
    )

    // Assert
    expect(getHeaders).toHaveBeenCalledWith({
      sheet: sheetName,
      sheets: mockSheetsService,
      spreadsheetId
    })

    expect(mockGetValues).toHaveBeenCalledWith(`${sheetName}!A2:C`)

    expect(combine).toHaveBeenCalledTimes(1)
    expect(combine).toHaveBeenCalledWith(
      ['1', 'John Doe', 'john@example.com'],
      headers
    )

    expect(result).toEqual({
      data: [{ id: '1', name: 'John Doe', email: 'john@example.com' }],
      rows: [2],
      ranges: [`${sheetName}!A2:C`],
      metadata: {
        operationType: 'find',
        spreadsheetId,
        sheetId: sheetName,
        ranges: [`${sheetName}!A2:C`],
        recordsAffected: 1,
        status: 'success',
        duration: 100
      }
    })
  })

  it('should return empty data when there are no records in the sheet', async () => {
    // Arrange
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'Sheet1'
    const headers = [
      { name: 'id', column: 'A' },
      { name: 'name', column: 'B' },
      { name: 'email', column: 'C' }
    ]

    const allValues: CellValue[][] = [] // No data

    // Mock the getHeaders function to return headers
    ;(getHeaders as any).mockResolvedValue(headers)

    // Mock the sheets.getValues function to return an empty array
    mockGetValues.mockResolvedValue(allValues)

    // Act
    const result = await findAll<RecordType>(
      {
        spreadsheetId,
        sheets: mockSheetsService,
        sheet: sheetName
      },
      undefined,
      {
        includeMetadata: true
      }
    )

    // Assert
    expect(getHeaders).toHaveBeenCalledWith({
      sheet: sheetName,
      sheets: mockSheetsService,
      spreadsheetId
    })

    expect(mockGetValues).toHaveBeenCalledWith(`${sheetName}!A2:C`)

    expect(combine).not.toHaveBeenCalled() // No data to combine

    expect(result).toEqual({
      data: [],
      rows: [],
      ranges: [`${sheetName}!A2:C`],
      metadata: {
        operationType: 'find',
        spreadsheetId,
        sheetId: sheetName,
        ranges: [`${sheetName}!A2:C`],
        recordsAffected: 0,
        status: 'success',
        duration: 100
      }
    })
  })

  it('should handle errors when getHeaders fails', async () => {
    // Arrange
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'Sheet1'

    const errorMessage = 'Failed to get headers'

    // Mock the getHeaders function to throw an error
    ;(getHeaders as any).mockRejectedValue(new Error(errorMessage))

    // Act
    const result = await findAll<RecordType>(
      {
        spreadsheetId,
        sheets: mockSheetsService,
        sheet: sheetName
      },
      undefined,
      {
        includeMetadata: true
      }
    )

    // Assert
    expect(getHeaders).toHaveBeenCalledWith({
      sheet: sheetName,
      sheets: mockSheetsService,
      spreadsheetId
    })

    expect(mockGetValues).not.toHaveBeenCalled()

    expect(combine).not.toHaveBeenCalled()

    expect(result).toEqual({
      data: undefined,
      rows: undefined,
      ranges: undefined,
      metadata: {
        operationType: 'find',
        spreadsheetId,
        sheetId: sheetName,
        ranges: [],
        recordsAffected: 0,
        status: 'failure',
        error: errorMessage,
        duration: 100
      }
    })
  })

  it('should handle errors when sheets.getValues fails', async () => {
    // Arrange
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'Sheet1'
    const headers = [
      { name: 'id', column: 'A' },
      { name: 'name', column: 'B' },
      { name: 'email', column: 'C' }
    ]

    const errorMessage = 'Failed to get values'

    // Mock the getHeaders function to return headers
    ;(getHeaders as any).mockResolvedValue(headers)

    // Mock the sheets.getValues function to throw an error
    mockGetValues.mockRejectedValue(new Error(errorMessage))

    // Act
    const result = await findAll<RecordType>(
      {
        spreadsheetId,
        sheets: mockSheetsService,
        sheet: sheetName
      },
      undefined,
      {
        includeMetadata: true
      }
    )

    // Assert
    expect(getHeaders).toHaveBeenCalledWith({
      sheet: sheetName,
      sheets: mockSheetsService,
      spreadsheetId
    })

    expect(mockGetValues).toHaveBeenCalledWith(`${sheetName}!A2:C`)

    expect(combine).not.toHaveBeenCalled()

    expect(result).toEqual({
      data: undefined,
      rows: undefined,
      ranges: undefined,
      metadata: {
        operationType: 'find',
        spreadsheetId,
        sheetId: sheetName,
        ranges: [],
        recordsAffected: 0,
        status: 'failure',
        error: errorMessage,
        duration: 100
      }
    })
  })

  it('should handle unexpected errors gracefully', async () => {
    // Arrange
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'Sheet1'

    const error = 'Unexpected error'

    // Mock the getHeaders function to throw an unexpected error
    ;(getHeaders as any).mockRejectedValue(error)

    // Act
    const result = await findAll<RecordType>(
      {
        spreadsheetId,
        sheets: mockSheetsService,
        sheet: sheetName
      },
      undefined,
      {
        includeMetadata: true
      }
    )

    // Assert
    expect(getHeaders).toHaveBeenCalledWith({
      sheet: sheetName,
      sheets: mockSheetsService,
      spreadsheetId
    })

    expect(mockGetValues).not.toHaveBeenCalled()

    expect(combine).not.toHaveBeenCalled()

    expect(result).toEqual({
      data: undefined,
      rows: undefined,
      ranges: undefined,
      metadata: {
        operationType: 'find',
        spreadsheetId,
        sheetId: sheetName,
        ranges: [],
        recordsAffected: 0,
        status: 'failure',
        error: ErrorMessages[ErrorCode.UnknownError],
        duration: 100
      }
    })
  })

  it('should return empty objects when all fields are omitted via select', async () => {
    // Arrange
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'Sheet1'
    const select = { id: false, name: false, email: false }
    const headers: SheetHeaders[] = [
      { name: 'id', column: 'A', index: 0 },
      { name: 'name', column: 'B', index: 1 },
      { name: 'email', column: 'C', index: 2 }
    ]

    const allValues: CellValue[][] = [
      ['1', 'John Doe', 'john@example.com'],
      ['2', 'Jane Smith', 'jane@example.com']
    ]

    // Mock the getHeaders function to return headers
    ;(getHeaders as any).mockResolvedValue(headers)

    // Mock the sheets.getValues function to return allValues
    mockGetValues.mockResolvedValue(allValues)

    // Mock the combine function to handle empty headers
    ;(combine as ReturnType<typeof vi.fn>).mockImplementation(
      (data, headers) => {
        return headers.reduce((acc: RecordType, header) => {
          const headerByIndex = headers.find(h => h.index === header.index)
          const key = headerByIndex?.name as keyof RecordType
          acc[key] = data[header.index] as RecordType[keyof RecordType]
          return acc
        }, {} as RecordType)
      }
    )

    // Act
    const result = await findAll<RecordType>(
      {
        spreadsheetId,
        sheets: mockSheetsService,
        sheet: sheetName
      },
      {
        select
      },
      {
        includeMetadata: true
      }
    )

    // Assert
    expect(getHeaders).toHaveBeenCalledWith({
      sheet: sheetName,
      sheets: mockSheetsService,
      spreadsheetId
    })

    expect(mockGetValues).toHaveBeenCalledWith(`${sheetName}!A2:C`)

    expect(combine).toHaveBeenCalledTimes(2)
    expect(combine).toHaveBeenNthCalledWith(
      1,
      ['1', 'John Doe', 'john@example.com'],
      []
    )
    expect(combine).toHaveBeenNthCalledWith(
      2,
      ['2', 'Jane Smith', 'jane@example.com'],
      []
    )

    expect(result).toEqual({
      data: [
        {}, // All fields omitted
        {}
      ],
      rows: [2, 3],
      ranges: [`${sheetName}!A2:C`],
      metadata: {
        operationType: 'find',
        spreadsheetId,
        sheetId: sheetName,
        ranges: [`${sheetName}!A2:C`],
        recordsAffected: 2,
        status: 'success',
        duration: 100
      }
    })
  })
  it('should not include empty rows from the result', async () => {
    // Arrange
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'Sheet1'
    const headers: SheetHeaders[] = [
      { name: 'id', column: 'A', index: 0 },
      { name: 'name', column: 'B', index: 1 },
      { name: 'email', column: 'C', index: 2 }
    ]

    // Simulating data with an empty row in the middle
    const allValues: CellValue[][] = [
      ['1', 'John Doe', 'john@example.com'],
      ['2', 'Jane Smith', 'jane@example.com'],
      [], // Linha vazia
      ['3', 'Alice Johnson', 'alice@example.com']
    ]

    ;(getHeaders as any).mockResolvedValue(headers)

    mockGetValues.mockResolvedValue(allValues)
    ;(combine as ReturnType<typeof vi.fn>).mockImplementation(
      (data, headers) => {
        if (headers.length === 0) {
          return {}
        }
        return headers.reduce((acc: RecordType, header) => {
          const key = header.name as keyof RecordType
          acc[key] = data[header.index] as RecordType[keyof RecordType]
          return acc
        }, {} as RecordType)
      }
    )

    // Act
    const result = await findAll<RecordType>(
      {
        spreadsheetId,
        sheets: mockSheetsService,
        sheet: sheetName
      },
      {},
      {
        includeMetadata: true
      }
    )

    // Assert
    expect(getHeaders).toHaveBeenCalledWith({
      sheet: sheetName,
      sheets: mockSheetsService,
      spreadsheetId
    })

    expect(mockGetValues).toHaveBeenCalledWith(`${sheetName}!A2:C`)

    expect(combine).toHaveBeenCalledTimes(3) // Total lines excluding the empty one

    // Verify combine function calls
    expect(combine).toHaveBeenNthCalledWith(
      1,
      ['1', 'John Doe', 'john@example.com'],
      headers
    )
    expect(combine).toHaveBeenNthCalledWith(
      2,
      ['2', 'Jane Smith', 'jane@example.com'],
      headers
    )
    expect(combine).toHaveBeenNthCalledWith(
      3,
      ['3', 'Alice Johnson', 'alice@example.com'],
      headers
    )

    // Result should not contain the empty row
    expect(result).toEqual({
      data: [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
        { id: '3', name: 'Alice Johnson', email: 'alice@example.com' }
      ],
      rows: [2, 3, 5], // Considering that the empty row is 4
      ranges: [`${sheetName}!A2:C`],
      metadata: {
        operationType: 'find',
        spreadsheetId,
        sheetId: sheetName,
        ranges: [`${sheetName}!A2:C`],
        recordsAffected: 3, // Excluding the empty row
        status: 'success',
        duration: 100
      }
    })
  })

  it('should include empty rows when includeEmptyRows is true from the result', async () => {
    // Arrange
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'Sheet1'
    const headers: SheetHeaders[] = [
      { name: 'id', column: 'A', index: 0 },
      { name: 'name', column: 'B', index: 1 },
      { name: 'email', column: 'C', index: 2 }
    ]

    const allValues: CellValue[][] = [
      ['1', 'John Doe', 'john@example.com'],
      ['2', 'Jane Smith', 'jane@example.com'],
      [], // Empty row
      ['3', 'Alice Johnson', 'alice@example.com']
    ]

    ;(getHeaders as any).mockResolvedValue(headers)

    mockGetValues.mockResolvedValue(allValues)
    ;(combine as ReturnType<typeof vi.fn>).mockImplementation(
      (data, headers) => {
        if (headers.length === 0) {
          return {}
        }
        return headers.reduce((acc: RecordType, header) => {
          const key = header.name as keyof RecordType
          acc[key] = data[header.index] as RecordType[keyof RecordType]
          return acc
        }, {} as RecordType)
      }
    )

    // Act
    const result = await findAll<RecordType>(
      {
        spreadsheetId,
        sheets: mockSheetsService,
        sheet: sheetName
      },
      {
        includeEmptyRows: true
      },
      {
        includeMetadata: true
      }
    )

    // Assert
    expect(getHeaders).toHaveBeenCalledWith({
      sheet: sheetName,
      sheets: mockSheetsService,
      spreadsheetId
    })

    expect(mockGetValues).toHaveBeenCalledWith(`${sheetName}!A2:C`)

    expect(combine).toHaveBeenCalledTimes(4) // Total lines including the empty one

    // Verify combine function calls
    expect(combine).toHaveBeenNthCalledWith(
      1,
      ['1', 'John Doe', 'john@example.com'],
      headers
    )
    expect(combine).toHaveBeenNthCalledWith(
      2,
      ['2', 'Jane Smith', 'jane@example.com'],
      headers
    )
    expect(combine).toHaveBeenNthCalledWith(3, [], headers)
    expect(combine).toHaveBeenNthCalledWith(
      4,
      ['3', 'Alice Johnson', 'alice@example.com'],
      headers
    )

    // Result should contain all rows, including the empty one
    expect(result).toEqual({
      data: [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
        { id: undefined, name: undefined, email: undefined },
        { id: '3', name: 'Alice Johnson', email: 'alice@example.com' }
      ],
      rows: [2, 3, 5], // Considering that the empty row is 4
      ranges: [`${sheetName}!A2:C`],
      metadata: {
        operationType: 'find',
        spreadsheetId,
        sheetId: sheetName,
        ranges: [`${sheetName}!A2:C`],
        recordsAffected: 4,
        status: 'success',
        duration: 100
      }
    })
  })
})
