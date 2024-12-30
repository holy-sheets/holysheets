import { describe, it, expect, vi, beforeEach } from 'vitest'
import { findMany } from './findMany'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { getHeaders } from '@/utils/headers/headers'
import { checkWhereFilter } from '@/utils/where/where'
import { combine } from '@/utils/dataUtils/dataUtils'
import {
  createSingleColumnRange,
  createSingleRowRange
} from '@/utils/rangeUtils/rangeUtils'
import { CellValue } from '@/types/cellValue'
import { MetadataService } from '@/services/metadata/MetadataService'
import { ErrorMessages, ErrorCode } from '@/services/errors/errorMessages'

// Mock the utility modules and services
vi.mock('@/utils/headers/headers')
vi.mock('@/utils/where/where')
vi.mock('@/utils/dataUtils/dataUtils')
vi.mock('@/utils/rangeUtils/rangeUtils')
vi.mock('@/services/metadata/MetadataService')

const mockSheetsService = {
  getValues: vi.fn(),
  batchGetValues: vi.fn()
} as unknown as IGoogleSheetsService

describe('findMany', () => {
  const params = {
    spreadsheetId: 'test-spreadsheet-id',
    sheets: mockSheetsService,
    sheet: 'Sheet1'
  }

  const options = {
    where: { Name: 'Alice' },
    select: { Name: true, Age: true }
  }

  let metadataInstance: {
    calculateDuration: ReturnType<typeof vi.fn>
    createMetadata: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock the MetadataService instance
    metadataInstance = {
      calculateDuration: vi.fn().mockReturnValue('50ms'),
      createMetadata: vi.fn().mockImplementation(options => ({
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: options.duration || '50ms',
        recordsAffected: options.recordsAffected,
        status: options.status,
        operationType: options.operationType,
        spreadsheetId: options.spreadsheetId,
        sheetId: options.sheetId,
        ranges: options.ranges,
        error: options.error,
        userId: options.userId
      }))
    }
    ;(MetadataService as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      metadataInstance as unknown as MetadataService
    )

    // Mock ErrorMessages
    ;(ErrorMessages as any)[ErrorCode.NoRecordFound] =
      'No records found matching the criteria.'
    ;(ErrorMessages as any)[ErrorCode.UnknownError] =
      'An unknown error occurred while finding data.'
  })

  it('should find multiple records that match the where clause with metadata', async () => {
    const headers = [
      { name: 'Name', column: 'A' },
      { name: 'Age', column: 'B' }
    ]

    const values = [['Alice'], ['Bob'], ['Alice']]
    const rowIndexes = [0, 2] // índices baseados em zero
    const ranges = ['Sheet1!A1:B1', 'Sheet1!A3:B3']
    const batchGetResponse = {
      valueRanges: [{ values: [['Alice', 30]] }, { values: [['Alice', 25]] }]
    }

    // Mocks
    ;(getHeaders as ReturnType<typeof vi.fn>).mockResolvedValueOnce(headers)
    ;(createSingleColumnRange as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      'Sheet1!A:A'
    )
    ;(
      mockSheetsService.getValues as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(values)
    ;(checkWhereFilter as ReturnType<typeof vi.fn>).mockImplementation(
      (filter, value) => value === 'Alice'
    )
    ;(createSingleRowRange as ReturnType<typeof vi.fn>).mockImplementation(
      ({ row }) => ranges[rowIndexes.indexOf(row - 1)]
    )
    ;(
      mockSheetsService.batchGetValues as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(batchGetResponse)
    ;(combine as ReturnType<typeof vi.fn>).mockImplementation(
      (values, headers) => {
        const record: Record<string, any> = {}
        headers.forEach((header: { name: string }, index: number) => {
          record[header.name] = values[index]
        })
        return record
      }
    )

    const result = await findMany<Record<string, CellValue>>(params, options, {
      includeMetadata: true
    })

    expect(getHeaders).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      sheets: mockSheetsService,
      spreadsheetId: 'test-spreadsheet-id'
    })
    expect(createSingleColumnRange).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      column: 'A'
    })
    expect(mockSheetsService.getValues).toHaveBeenCalledWith('Sheet1!A:A')
    expect(checkWhereFilter).toHaveBeenCalledTimes(3)
    expect(createSingleRowRange).toHaveBeenCalledTimes(2)
    expect(mockSheetsService.batchGetValues).toHaveBeenCalledWith(ranges)
    expect(combine).toHaveBeenCalledTimes(2)

    expect(result).toEqual({
      data: [
        { Name: 'Alice', Age: 30 },
        { Name: 'Alice', Age: 25 }
      ],
      rows: [1, 3],
      ranges: ['Sheet1!A1:B1', 'Sheet1!A3:B3'],
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 2,
        status: 'success',
        operationType: 'find',
        spreadsheetId: 'test-spreadsheet-id',
        sheetId: 'Sheet1',
        ranges: ranges,
        error: undefined,
        userId: undefined
      }
    })
  })

  it('should return an empty array with metadata if no records match the where clause', async () => {
    const headers = [{ name: 'Name', column: 'A' }]
    const values = [['Bob'], ['Charlie']]

    ;(getHeaders as ReturnType<typeof vi.fn>).mockResolvedValueOnce(headers)
    ;(createSingleColumnRange as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      'Sheet1!A:A'
    )
    ;(
      mockSheetsService.getValues as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(values)
    ;(checkWhereFilter as ReturnType<typeof vi.fn>).mockImplementation(
      (filter, value) => value === 'Alice'
    )

    const result = await findMany(params, options, { includeMetadata: true })

    expect(getHeaders).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      sheets: mockSheetsService,
      spreadsheetId: 'test-spreadsheet-id'
    })
    expect(createSingleColumnRange).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      column: 'A'
    })
    expect(mockSheetsService.getValues).toHaveBeenCalledWith('Sheet1!A:A')
    expect(checkWhereFilter).toHaveBeenCalledTimes(2)

    expect(result).toEqual({
      data: [],
      rows: [],
      ranges: [],
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 0,
        status: 'failure',
        operationType: 'find',
        spreadsheetId: 'test-spreadsheet-id',
        sheetId: 'Sheet1',
        ranges: ['Sheet1!A:A'],
        error: 'No records found matching the criteria.',
        userId: undefined
      }
    })
  })

  it('should throw an error if header is not found for the where clause column', async () => {
    const headers = [{ name: 'Age', column: 'B' }]

    ;(getHeaders as ReturnType<typeof vi.fn>).mockResolvedValueOnce(headers)

    await expect(findMany(params, options)).rejects.toThrow(
      'Header not found for column Name'
    )

    expect(getHeaders).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      sheets: mockSheetsService,
      spreadsheetId: 'test-spreadsheet-id'
    })
  })

  it('should handle error when getting headers', async () => {
    const errorMessage = 'Test error'

    ;(getHeaders as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error(errorMessage)
    )

    await expect(
      findMany(params, options, { includeMetadata: true })
    ).resolves.toEqual({
      data: undefined,
      rows: undefined,
      ranges: undefined,
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 0,
        status: 'failure',
        operationType: 'find',
        spreadsheetId: 'test-spreadsheet-id',
        sheetId: 'Sheet1',
        ranges: [],
        error: errorMessage,
        userId: undefined
      }
    })

    expect(getHeaders).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      sheets: mockSheetsService,
      spreadsheetId: 'test-spreadsheet-id'
    })
  })

  it('should handle error when getting values', async () => {
    const headers = [{ name: 'Name', column: 'A' }]
    const errorMessage = 'Test error'

    ;(getHeaders as ReturnType<typeof vi.fn>).mockResolvedValueOnce(headers)
    ;(createSingleColumnRange as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      'Sheet1!A:A'
    )
    ;(
      mockSheetsService.getValues as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error(errorMessage))

    await expect(
      findMany(params, options, { includeMetadata: true })
    ).resolves.toEqual({
      data: undefined,
      rows: undefined,
      ranges: undefined,
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 0,
        status: 'failure',
        operationType: 'find',
        spreadsheetId: 'test-spreadsheet-id',
        sheetId: 'Sheet1',
        ranges: [],
        error: errorMessage,
        userId: undefined
      }
    })

    expect(getHeaders).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      sheets: mockSheetsService,
      spreadsheetId: 'test-spreadsheet-id'
    })
    expect(createSingleColumnRange).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      column: 'A'
    })
    expect(mockSheetsService.getValues).toHaveBeenCalledWith('Sheet1!A:A')
  })

  it('should throw an error when both select and omit are provided', async () => {
    // Arrange
    const select = { Name: true, Age: true }
    const omit = { Email: true }

    // Act & Assert
    await expect(
      findMany<Record<string, CellValue>>(
        {
          spreadsheetId: 'test-spreadsheet-id',
          sheets: mockSheetsService,
          sheet: 'Sheet1'
        },
        {
          where: { Name: 'Alice' },
          select,
          omit
        },
        {
          includeMetadata: true
        }
      )
    ).rejects.toThrow(ErrorMessages.SELECT_AND_OMIT_FORBIDDEN)

    await expect(
      findMany<Record<string, CellValue>>(
        {
          spreadsheetId: 'test-spreadsheet-id',
          sheets: mockSheetsService,
          sheet: 'Sheet1'
        },
        {
          where: { Name: 'Alice' },
          select,
          omit
        },
        {
          includeMetadata: true
        }
      )
    ).rejects.toThrowError(ErrorMessages.SELECT_AND_OMIT_FORBIDDEN)

    // Ensure that no further processing occurs
    expect(getHeaders).not.toHaveBeenCalled()
    expect(mockSheetsService.getValues).not.toHaveBeenCalled()
    expect(combine).not.toHaveBeenCalled()
  })

  it('should retrieve records with omitted fields when omit is provided without select', async () => {
    // Arrange
    const omit = { Email: true }

    const headers = [
      { name: 'Name', column: 'A', index: 0 },
      { name: 'Age', column: 'B', index: 1 },
      { name: 'Email', column: 'C', index: 2 }
    ]

    const allValues: CellValue[][] = [
      ['Alice', 30, 'alice@example.com'],
      ['Bob', 25, 'bob@example.com']
    ]

    const rowIndexes = [0, 1] // indices based on zero

    const ranges = ['Sheet1!A1:C1', 'Sheet1!A2:C2']

    const batchGetResponse = {
      valueRanges: [
        { values: [['Alice', 30, 'alice@example.com']] },
        { values: [['Bob', 25, 'bob@example.com']] }
      ]
    }

    // Mock the utility functions
    ;(getHeaders as ReturnType<typeof vi.fn>).mockResolvedValueOnce(headers)
    ;(createSingleColumnRange as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      'Sheet1!A:A'
    )
    ;(
      mockSheetsService.getValues as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(allValues)
    ;(checkWhereFilter as ReturnType<typeof vi.fn>).mockImplementation(
      (filter, value) => value === 'Alice' || value === 'Bob'
    )
    ;(createSingleRowRange as ReturnType<typeof vi.fn>).mockImplementation(
      ({ row }) => ranges[row - 1]
    )
    ;(
      mockSheetsService.batchGetValues as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(batchGetResponse)
    ;(combine as ReturnType<typeof vi.fn>).mockImplementation(
      (values, headers) => {
        const record = {}
        headers.forEach(header => {
          record[header.name] = values[header.index]
        })
        return record
      }
    )

    // Act
    const result = await findMany(
      {
        spreadsheetId: 'test-spreadsheet-id',
        sheets: mockSheetsService,
        sheet: 'Sheet1'
      },
      {
        where: { Name: 'Alice' },
        omit
      },
      {
        includeMetadata: true
      }
    )

    // Assert
    expect(getHeaders).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      sheets: mockSheetsService,
      spreadsheetId: 'test-spreadsheet-id'
    })

    expect(createSingleColumnRange).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      column: 'A'
    })

    expect(mockSheetsService.getValues).toHaveBeenCalledWith('Sheet1!A:A')
    expect(checkWhereFilter).toHaveBeenCalledTimes(2)
    expect(createSingleRowRange).toHaveBeenCalledTimes(2)
    expect(mockSheetsService.batchGetValues).toHaveBeenCalledWith(ranges)
    expect(combine).toHaveBeenCalledTimes(2)

    expect(result).toEqual({
      data: [
        { Name: 'Alice', Age: 30 }, // 'Email' omitted
        { Name: 'Bob', Age: 25 } // 'Email' omitted
      ],
      rows: [1, 2],
      ranges: ['Sheet1!A1:C1', 'Sheet1!A2:C2'],
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 2,
        status: 'success',
        operationType: 'find',
        spreadsheetId: 'test-spreadsheet-id',
        sheetId: 'Sheet1',
        ranges: ranges,
        error: undefined,
        userId: undefined
      }
    })
  })
})
