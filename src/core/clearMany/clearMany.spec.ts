import { describe, it, expect, vi, beforeEach } from 'vitest'
import { clearMany } from './clearMany'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { findMany } from '@/core/findMany/findMany'
import { CellValue } from '@/types/cellValue'
import { MetadataService } from '@/services/metadata/MetadataService'
import { ErrorMessages, ErrorCode } from '@/services/errors/errorMessages'

// Mock the findMany function and services
vi.mock('@/core/findMany/findMany')
vi.mock('@/services/metadata/MetadataService')

describe('clearMany', () => {
  const spreadsheetId = 'spreadsheet-id'
  const sheet = 'Sheet1'
  const mockSheetsService: IGoogleSheetsService = {
    batchClearValues: vi.fn()
  } as unknown as IGoogleSheetsService

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
      'No records found to clear.'
    ;(ErrorMessages as any)[ErrorCode.UnknownError] =
      'An unknown error occurred while clearing records.'
  })

  it('should clear multiple records that match the where clause and return metadata', async () => {
    const mockRecords: Record<string, CellValue>[] = [
      { name: 'John Doe' },
      { name: 'Johnny Cash' }
    ]
    const rows = [2, 5]
    const ranges = ['Sheet1!A2:B2', 'Sheet1!A5:B5']

    // Mock the findMany function to return mock records
    ;(findMany as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockRecords,
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

    const whereClause = { name: { contains: 'John' } }

    const result = await clearMany(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where: whereClause },
      { includeMetadata: true }
    )

    expect(result).toEqual({
      data: mockRecords,
      rows,
      ranges,
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 2,
        status: 'success',
        operationType: 'clear',
        spreadsheetId,
        sheetId: sheet,
        ranges,
        error: undefined,
        userId: undefined
      }
    })

    expect(mockSheetsService.batchClearValues).toHaveBeenCalledWith(ranges)
  })

  it('should return empty result with metadata if no records are found', async () => {
    // Mock the findMany function to return no records
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
        error: 'No records found to clear.'
      }
    })

    const whereClause = { name: { contains: 'John' } }

    const result = await clearMany(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where: whereClause },
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
        operationType: 'clear',
        spreadsheetId,
        sheetId: sheet,
        ranges: [],
        error: 'No records found to clear.',
        userId: undefined
      }
    })

    expect(mockSheetsService.batchClearValues).not.toHaveBeenCalled()
  })

  it('should handle errors when clearing records and return metadata', async () => {
    const mockRecords: Record<string, CellValue>[] = [{ name: 'John Doe' }]
    const rows = [2]
    const ranges = ['Sheet1!A2:B2']

    // Mock the findMany function to return mock records
    ;(findMany as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockRecords,
      rows,
      ranges,
      metadata: {
        operationId: 'find-operation-id',
        status: 'success',
        recordsAffected: 1,
        ranges,
        duration: '30ms',
        operationType: 'find',
        spreadsheetId,
        sheetId: sheet,
        timestamp: '2023-01-01T00:00:00.000Z'
      }
    })

    // Mock the batchClearValues method to throw an error
    ;(
      mockSheetsService.batchClearValues as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error('Test error'))

    const whereClause = { name: { contains: 'John' } }

    const result = await clearMany(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where: whereClause },
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
        operationType: 'clear',
        spreadsheetId,
        sheetId: sheet,
        ranges: [],
        error: 'Test error',
        userId: undefined
      }
    })

    expect(mockSheetsService.batchClearValues).toHaveBeenCalledWith(ranges)
  })
})
