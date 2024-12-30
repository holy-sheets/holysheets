import { describe, it, expect, vi, beforeEach } from 'vitest'
import { findFirst } from './findFirst'
import type { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import type { WhereClause } from '@/types/where'
import type { SelectClause } from '@/types/select'
import { getHeaders } from '@/utils/headers/headers'
import { checkWhereFilter } from '@/utils/where/where'
import { combine } from '@/utils/dataUtils/dataUtils'
import { indexToColumn } from '@/utils/columnUtils/columnUtils'
import {
  createFullRange,
  createSingleColumnRange
} from '@/utils/rangeUtils/rangeUtils'
import type { CellValue } from '@/types/cellValue'
import { SheetColumn } from '@/types/headers'
import { MetadataService } from '@/services/metadata/MetadataService'
import { ErrorCode, ErrorMessages } from '@/services/errors/errorMessages'

// Mock the utility modules
vi.mock('@/utils/headers/headers')
vi.mock('@/utils/where/where')
vi.mock('@/utils/dataUtils/dataUtils')
vi.mock('@/utils/columnUtils/columnUtils')
vi.mock('@/utils/rangeUtils/rangeUtils')
vi.mock('@/services/metadata/MetadataService')

const mockSheets: IGoogleSheetsService = {
  getValues: vi.fn()
} as unknown as IGoogleSheetsService

const mockedGetHeaders = vi.mocked(getHeaders, true)
const mockedCheckWhereFilter = vi.mocked(checkWhereFilter, true)
const mockedCombine = vi.mocked(combine, true)
const mockedIndexToColumn = vi.mocked(indexToColumn, true)
const mockedCreateSingleColumnRange = vi.mocked(createSingleColumnRange, true)
const mockedCreateFullRange = vi.mocked(createFullRange, true)
const mockedMetadataService = vi.mocked(MetadataService, true)

describe('findFirst', () => {
  const spreadsheetId = 'test-spreadsheet-id'
  const sheet = 'Sheet1'
  const where: WhereClause<{ status: string }> = { status: 'inactive' }
  const select: SelectClause<{ status: string }> = { status: true }

  let metadataInstance: {
    calculateDuration: ReturnType<typeof vi.fn>
    createMetadata: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock implementations
    mockedIndexToColumn.mockImplementation(index => {
      const columns = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      return columns[index] as SheetColumn
    })

    mockedCreateSingleColumnRange.mockImplementation(({ sheet, column }) => {
      return `${sheet}!${column}:${column}`
    })

    mockedCreateFullRange.mockImplementation(
      ({ sheet, startColumn, endColumn, startRow, endRow }) => {
        return `${sheet}!${startColumn}${startRow}:${endColumn}${endRow}`
      }
    )

    // Mocking MetadataService instance
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

    mockedMetadataService.mockReturnValue(
      metadataInstance as unknown as MetadataService
    )
  })

  it('should return the first matching record with metadata when includeMetadata is true', async () => {
    const headers = [{ name: 'status', column: 'A' as SheetColumn, index: 0 }]
    const values: CellValue[][] = [['inactive'], ['active']]
    const rowValues: CellValue[][] = [['inactive']]

    mockedGetHeaders.mockResolvedValueOnce(headers)
    ;(mockSheets.getValues as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      values
    )
    ;(mockSheets.getValues as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      rowValues
    )
    mockedCheckWhereFilter.mockReturnValueOnce(true)
    mockedCombine.mockReturnValueOnce({ status: 'inactive' })
    mockedCreateFullRange.mockReturnValueOnce(`${sheet}!A1:A1`)

    const result = await findFirst<{ status: string }>(
      { spreadsheetId, sheets: mockSheets, sheet },
      { where, select },
      { includeMetadata: true }
    )

    expect(result).toEqual({
      data: { status: 'inactive' },
      row: 1,
      range: `${sheet}!A1:A1`,
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 1,
        status: 'success',
        operationType: 'find',
        spreadsheetId,
        sheetId: sheet,
        ranges: [`${sheet}!A:A`, `${sheet}!A1:A1`],
        error: undefined,
        userId: undefined
      }
    })

    expect(mockedGetHeaders).toHaveBeenCalledWith({
      sheet,
      sheets: mockSheets,
      spreadsheetId
    })
    expect(mockSheets.getValues).toHaveBeenCalledWith(`${sheet}!A:A`)
    expect(mockSheets.getValues).toHaveBeenCalledWith(`${sheet}!A1:A1`)
    expect(metadataInstance.calculateDuration).toHaveBeenCalledWith(
      expect.any(Number)
    )
    expect(metadataInstance.createMetadata).toHaveBeenCalledWith({
      operationType: 'find',
      spreadsheetId,
      sheetId: sheet,
      ranges: [`${sheet}!A:A`, `${sheet}!A1:A1`],
      recordsAffected: 1,
      status: 'success',
      duration: '50ms'
    })
  })

  it('should return undefined data and metadata when no matching record is found and includeMetadata is true', async () => {
    const headers = [{ name: 'status', column: 'A' as SheetColumn, index: 0 }]
    const values: CellValue[][] = [['active']]

    mockedGetHeaders.mockResolvedValueOnce(headers)
    ;(mockSheets.getValues as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      values
    )
    mockedCheckWhereFilter.mockReturnValueOnce(false)

    const result = await findFirst<{ status: string }>(
      { spreadsheetId, sheets: mockSheets, sheet },
      { where, select },
      { includeMetadata: true }
    )

    expect(result).toEqual({
      data: undefined,
      row: undefined,
      range: undefined,
      metadata: {
        operationType: 'find',
        operationId: 'test-operation-id',
        spreadsheetId,
        sheetId: sheet,
        ranges: [`${sheet}!A:A`],
        recordsAffected: 0,
        status: 'failure',
        duration: '50ms',
        timestamp: '2023-01-01T00:00:00.000Z',
        error: ErrorMessages[ErrorCode.NoRecordFound]
      }
    })

    expect(mockedGetHeaders).toHaveBeenCalledWith({
      sheet,
      sheets: mockSheets,
      spreadsheetId
    })
    expect(mockSheets.getValues).toHaveBeenCalledWith(`${sheet}!A:A`)
    expect(metadataInstance.calculateDuration).toHaveBeenCalledWith(
      expect.any(Number)
    )
  })

  it('should throw an error if header is not found and includeMetadata is false', async () => {
    const headers: { name: string; column: SheetColumn; index: number }[] = []

    mockedGetHeaders.mockResolvedValueOnce(headers)

    await expect(
      findFirst<{ status: string }>(
        { spreadsheetId, sheets: mockSheets, sheet },
        { where, select },
        { includeMetadata: false }
      )
    ).rejects.toThrow('Error finding data: Header not found for column status')

    expect(mockedGetHeaders).toHaveBeenCalledWith({
      sheet,
      sheets: mockSheets,
      spreadsheetId
    })
  })

  it('should return failure metadata when header is not found and includeMetadata is true', async () => {
    const headers: { name: string; column: SheetColumn; index: number }[] = []

    mockedGetHeaders.mockResolvedValueOnce(headers)

    const result = await findFirst<{ status: string }>(
      { spreadsheetId, sheets: mockSheets, sheet },
      { where, select },
      { includeMetadata: true }
    )

    expect(result).toEqual({
      data: undefined,
      row: undefined,
      range: undefined,
      metadata: {
        operationType: 'find',
        spreadsheetId,
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        sheetId: sheet,
        ranges: [],
        recordsAffected: 0,
        status: 'failure',
        duration: '50ms',
        error: expect.stringContaining('not found')
      }
    })

    expect(mockedGetHeaders).toHaveBeenCalledWith({
      sheet,
      sheets: mockSheets,
      spreadsheetId
    })
    expect(metadataInstance.calculateDuration).toHaveBeenCalledWith(
      expect.any(Number)
    )
  })

  it('should throw an error if getValues throws an error and includeMetadata is false', async () => {
    const headers = [{ name: 'status', column: 'A' as SheetColumn, index: 0 }]
    const errorMessage = 'Test error'

    mockedGetHeaders.mockResolvedValueOnce(headers)
    ;(mockSheets.getValues as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error(errorMessage)
    )

    await expect(
      findFirst<{ status: string }>(
        { spreadsheetId, sheets: mockSheets, sheet },
        { where, select },
        { includeMetadata: false }
      )
    ).rejects.toThrow(`Error finding data: ${errorMessage}`)

    expect(mockedGetHeaders).toHaveBeenCalledWith({
      sheet,
      sheets: mockSheets,
      spreadsheetId
    })
    expect(mockSheets.getValues).toHaveBeenCalledWith(`${sheet}!A:A`)
  })

  it('should return failure metadata if getValues throws an error and includeMetadata is true', async () => {
    const headers = [{ name: 'status', column: 'A' as SheetColumn, index: 0 }]
    const errorMessage = 'Test error'

    mockedGetHeaders.mockResolvedValueOnce(headers)
    ;(mockSheets.getValues as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error(errorMessage)
    )

    const result = await findFirst<{ status: string }>(
      { spreadsheetId, sheets: mockSheets, sheet },
      { where, select },
      { includeMetadata: true }
    )

    expect(result).toEqual({
      data: undefined,
      row: undefined,
      range: undefined,
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
        error: expect.any(String),
        userId: undefined
      }
    })

    expect(mockedGetHeaders).toHaveBeenCalledWith({
      sheet,
      sheets: mockSheets,
      spreadsheetId
    })
    expect(mockSheets.getValues).toHaveBeenCalledWith(`${sheet}!A:A`)
    expect(metadataInstance.calculateDuration).toHaveBeenCalledWith(
      expect.any(Number)
    )
  })

  it('should throw an error when both select and omit are provided', async () => {
    // Arrange
    const select = { status: true }
    const omit = { status: true }

    // Act & Assert
    await expect(
      findFirst<Record<string, CellValue>>(
        {
          spreadsheetId: 'test-spreadsheet-id',
          sheets: mockSheets,
          sheet: 'Sheet1'
        },
        {
          where: { status: 'inactive' },
          select,
          omit
        },
        {
          includeMetadata: true
        }
      )
    ).rejects.toThrow(ErrorMessages.SELECT_AND_OMIT_FORBIDDEN)

    await expect(
      findFirst<Record<string, CellValue>>(
        {
          spreadsheetId: 'test-spreadsheet-id',
          sheets: mockSheets,
          sheet: 'Sheet1'
        },
        {
          where: { status: 'inactive' },
          select,
          omit
        },
        {
          includeMetadata: true
        }
      )
    ).rejects.toThrowError(ErrorMessages.SELECT_AND_OMIT_FORBIDDEN)

    // Ensure that no further processing occurs
    expect(mockedGetHeaders).not.toHaveBeenCalled()
    expect(mockSheets.getValues).not.toHaveBeenCalled()
    expect(combine).not.toHaveBeenCalled()
  })

  it('should retrieve the first matching record with omitted fields when omit is provided without select', async () => {
    // Arrange
    const omit = { status: true }

    const headers = [
      { name: 'status', column: 'A' as SheetColumn, index: 0 },
      { name: 'age', column: 'B' as SheetColumn, index: 1 }
    ]

    const values: CellValue[][] = [['inactive'], ['active']]
    const rowValues: CellValue[][] = [['inactive', 30]]

    mockedGetHeaders.mockResolvedValueOnce(headers)
    ;(mockSheets.getValues as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      values
    )
    ;(mockSheets.getValues as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      rowValues
    )
    mockedCheckWhereFilter.mockReturnValueOnce(true)
    mockedCombine.mockReturnValueOnce({ age: 30 }) // 'status' is omitted

    mockedCreateFullRange.mockReturnValueOnce(`${sheet}!A1:B1`)

    // Act
    const result = await findFirst<{ status: string; age: number }>(
      {
        spreadsheetId: 'test-spreadsheet-id',
        sheets: mockSheets,
        sheet: 'Sheet1'
      },
      {
        where: { status: 'inactive' },
        omit
      },
      {
        includeMetadata: true
      }
    )
    console.log({ result })
    // Assert
    expect(result).toEqual({
      data: { age: 30 }, // 'status' omitted
      row: 1,
      range: `${sheet}!A1:B1`,
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 1,
        status: 'success',
        operationType: 'find',
        spreadsheetId: 'test-spreadsheet-id',
        sheetId: sheet,
        ranges: [`${sheet}!A:A`, `${sheet}!A1:B1`],
        error: undefined,
        userId: undefined
      }
    })

    expect(mockedGetHeaders).toHaveBeenCalledWith({
      sheet,
      sheets: mockSheets,
      spreadsheetId: 'test-spreadsheet-id'
    })
    expect(mockSheets.getValues).toHaveBeenCalledWith(`${sheet}!A:A`)
    expect(mockSheets.getValues).toHaveBeenCalledWith(`${sheet}!A1:B1`)
    expect(metadataInstance.calculateDuration).toHaveBeenCalledWith(
      expect.any(Number)
    )
    expect(metadataInstance.createMetadata).toHaveBeenCalledWith({
      operationType: 'find',
      spreadsheetId: 'test-spreadsheet-id',
      sheetId: sheet,
      ranges: [`${sheet}!A:A`, `${sheet}!A1:B1`],
      recordsAffected: 1,
      status: 'success',
      duration: '50ms'
    })
  })
})
