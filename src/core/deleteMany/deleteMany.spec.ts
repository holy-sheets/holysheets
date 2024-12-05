import { describe, it, expect, vi, beforeEach } from 'vitest'
import { deleteMany } from './deleteMany'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { WhereClause } from '@/types/where'
import { findMany } from '@/core/findMany/findMany'
import { CellValue } from '@/types/cellValue'
import { MetadataService } from '@/services/metadata/MetadataService'
import { ErrorMessages, ErrorCode } from '@/services/errors/errorMessages'

vi.mock('@/core/findMany/findMany')
vi.mock('@/services/metadata/MetadataService')

const mockSheets: IGoogleSheetsService = {
  batchDeleteRows: vi.fn()
} as unknown as IGoogleSheetsService

describe('deleteMany', () => {
  const spreadsheetId = 'test-spreadsheet-id'
  const sheet = 'Sheet1'
  const where: WhereClause<any> = { status: 'inactive' }

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
      'No records found to delete.'
    ;(ErrorMessages as any)[ErrorCode.UnknownError] =
      'An unknown error occurred while deleting records.'
  })

  it('should delete records that match the where clause and return metadata', async () => {
    const records: Record<string, CellValue>[] = [
      { status: 'inactive' },
      { status: 'inactive' }
    ]
    const rows = [2, 4]
    const ranges = ['Sheet1!A2:B2', 'Sheet1!A4:B4']

    ;(findMany as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: records,
      rows,
      ranges,
      metadata: {
        operationId: 'find-operation-id',
        status: 'success',
        recordsAffected: 2,
        ranges,
        duration: '30ms',
        operationType: 'find',
        spreadsheetId,
        sheetId: sheet,
        timestamp: '2023-01-01T00:00:00.000Z'
      }
    })

    const result = await deleteMany(
      { spreadsheetId, sheets: mockSheets, sheet },
      { where },
      { includeMetadata: true }
    )

    expect(result).toEqual({
      data: records,
      rows,
      ranges,
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 2,
        status: 'success',
        operationType: 'delete',
        spreadsheetId,
        sheetId: sheet,
        ranges,
        error: undefined,
        userId: undefined
      }
    })

    expect(findMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet },
      { where },
      { includeMetadata: true }
    )
    expect(mockSheets.batchDeleteRows).toHaveBeenCalledWith(sheet, [1, 3])
  })

  it('should return empty result with metadata if no records are found', async () => {
    ;(findMany as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      rows: [],
      ranges: [],
      metadata: {
        operationId: 'find-operation-id',
        status: 'failure',
        recordsAffected: 0,
        ranges: [],
        duration: '30ms',
        operationType: 'find',
        spreadsheetId,
        sheetId: sheet,
        timestamp: '2023-01-01T00:00:00.000Z',
        error: 'No records found to delete.'
      }
    })

    const result = await deleteMany(
      { spreadsheetId, sheets: mockSheets, sheet },
      { where },
      { includeMetadata: true }
    )

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
        operationType: 'delete',
        spreadsheetId,
        sheetId: sheet,
        ranges: [],
        error: 'No records found to delete.',
        userId: undefined
      }
    })

    expect(findMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet },
      { where },
      { includeMetadata: true }
    )
    expect(mockSheets.batchDeleteRows).not.toHaveBeenCalled()
  })

  it('should handle errors thrown by findMany and return metadata', async () => {
    const errorMessage = 'Test error'
    ;(findMany as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error(errorMessage)
    )

    const result = await deleteMany(
      { spreadsheetId, sheets: mockSheets, sheet },
      { where },
      { includeMetadata: true }
    )

    expect(result).toEqual({
      data: undefined,
      rows: undefined,
      ranges: undefined,
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 0,
        status: 'failure',
        operationType: 'delete',
        spreadsheetId,
        sheetId: sheet,
        ranges: [],
        error: errorMessage,
        userId: undefined
      }
    })

    expect(findMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet },
      { where },
      { includeMetadata: true }
    )
    expect(mockSheets.batchDeleteRows).not.toHaveBeenCalled()
  })

  it('should handle errors thrown by batchDeleteRows and return metadata', async () => {
    const records: Record<string, CellValue>[] = [
      { status: 'inactive' },
      { status: 'inactive' }
    ]
    const rows = [2, 4]
    const ranges = ['Sheet1!A2:B2', 'Sheet1!A4:B4']
    const errorMessage = 'Test error'

    ;(findMany as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: records,
      rows,
      ranges,
      metadata: {
        operationId: 'find-operation-id',
        status: 'success',
        recordsAffected: 2,
        ranges,
        duration: '30ms',
        operationType: 'find',
        spreadsheetId,
        sheetId: sheet,
        timestamp: '2023-01-01T00:00:00.000Z'
      }
    })

    ;(
      mockSheets.batchDeleteRows as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error(errorMessage))

    const result = await deleteMany(
      { spreadsheetId, sheets: mockSheets, sheet },
      { where },
      { includeMetadata: true }
    )

    expect(result).toEqual({
      data: undefined,
      rows: undefined,
      ranges: undefined,
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 0,
        status: 'failure',
        operationType: 'delete',
        spreadsheetId,
        sheetId: sheet,
        ranges: [],
        error: errorMessage,
        userId: undefined
      }
    })

    expect(findMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet },
      { where },
      { includeMetadata: true }
    )
    expect(mockSheets.batchDeleteRows).toHaveBeenCalledWith(sheet, [1, 3])
  })
})
