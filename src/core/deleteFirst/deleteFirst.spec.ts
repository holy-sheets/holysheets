import { describe, it, expect, vi, beforeEach } from 'vitest'
import { deleteFirst } from './deleteFirst'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { findFirst } from '@/core/findFirst/findFirst'
import { OperationResult } from '@/services/metadata/IMetadataService'
import { MetadataService } from '@/services/metadata/MetadataService'
import { ErrorMessages, ErrorCode } from '@/services/errors/errorMessages'
import { WhereClause } from '@/types/where'

// Mock the dependencies
vi.mock('@/core/findFirst/findFirst')
vi.mock('@/services/metadata/MetadataService')

const mockedFindFirst = vi.mocked(findFirst, true)
const mockedMetadataService = vi.mocked(MetadataService, true)

describe('deleteFirst', () => {
  const spreadsheetId = 'spreadsheet-id'
  const sheet = 'Sheet1'
  const mockSheetsService: IGoogleSheetsService = {
    deleteRows: vi.fn()
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

    mockedMetadataService.mockReturnValue(
      metadataInstance as unknown as MetadataService
    )
  })

  it('should delete the first record that matches the where clause and return the deleted record with metadata when includeMetadata is true', async () => {
    const where: WhereClause<{ id: string }> = { id: '123' }
    const mockRecord: OperationResult<{ id: string }> = {
      data: { id: '123' },
      row: 2,
      range: 'Sheet1!A2:B2',
      metadata: {
        operationId: 'find-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '30ms',
        recordsAffected: 1,
        status: 'success',
        operationType: 'find',
        spreadsheetId,
        sheetId: sheet,
        ranges: ['Sheet1!A:A', 'Sheet1!A2:B2']
      }
    }

    // Mock the findFirst function to return a record
    mockedFindFirst.mockResolvedValueOnce(mockRecord)

    // Mock the deleteRows function to resolve
    ;(
      mockSheetsService.deleteRows as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(undefined)

    const result = await deleteFirst<{ id: string }>(
      {
        spreadsheetId,
        sheets: mockSheetsService,
        sheet
      },
      {
        where
      },
      {
        includeMetadata: true
      }
    )

    expect(result).toEqual({
      data: { id: '123' },
      row: 2,
      range: 'Sheet1!2:2',
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 1,
        status: 'success',
        operationType: 'delete',
        spreadsheetId,
        sheetId: sheet,
        ranges: ['Sheet1!2:2'],
        error: undefined,
        userId: undefined
      }
    })

    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where },
      { includeMetadata: true }
    )

    expect(mockSheetsService.deleteRows).toHaveBeenCalledWith(sheet, 1, 2)

    expect(metadataInstance.calculateDuration).toHaveBeenCalledWith(
      expect.any(Number)
    )

    expect(metadataInstance.createMetadata).toHaveBeenCalledWith({
      operationType: 'delete',
      spreadsheetId,
      sheetId: sheet,
      ranges: ['Sheet1!2:2'],
      recordsAffected: 1,
      status: 'success',
      duration: '50ms'
    })
  })

  it('should throw an error if no record is found and includeMetadata is false', async () => {
    const where: WhereClause<{ id: string }> = { id: '456' }

    // Mock the findFirst function to return undefined
    mockedFindFirst.mockResolvedValueOnce({
      data: undefined,
      row: undefined,
      range: undefined
    })

    await expect(
      deleteFirst<{ id: string }>(
        {
          spreadsheetId,
          sheets: mockSheetsService,
          sheet
        },
        {
          where
        },
        {
          includeMetadata: false
        }
      )
    ).rejects.toThrow('No records found matching the criteria.')

    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where },
      { includeMetadata: false }
    )

    expect(mockSheetsService.deleteRows).not.toHaveBeenCalled()
  })

  it('should return failure metadata if no record is found and includeMetadata is true', async () => {
    const where: WhereClause<{ id: string }> = { id: '456' }

    // Mock the findFirst function to return undefined
    mockedFindFirst.mockResolvedValueOnce({
      data: undefined,
      row: undefined,
      range: undefined,
      metadata: {
        operationId: 'find-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '30ms',
        recordsAffected: 0,
        status: 'failure',
        operationType: 'find',
        spreadsheetId,
        sheetId: sheet,
        ranges: ['Sheet1!A:A'],
        error: ErrorMessages[ErrorCode.NoRecordFound]
      }
    })

    const result = await deleteFirst<{ id: string }>(
      {
        spreadsheetId,
        sheets: mockSheetsService,
        sheet
      },
      {
        where
      },
      {
        includeMetadata: true
      }
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
        operationType: 'delete',
        spreadsheetId,
        sheetId: sheet,
        ranges: ['Sheet1!A:A'],
        error: 'No records found matching the criteria.',
        userId: undefined
      }
    })

    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where },
      { includeMetadata: true }
    )

    expect(mockSheetsService.deleteRows).not.toHaveBeenCalled()

    expect(metadataInstance.calculateDuration).toHaveBeenCalledWith(
      expect.any(Number)
    )

    expect(metadataInstance.createMetadata).toHaveBeenCalledWith({
      operationType: 'delete',
      spreadsheetId,
      sheetId: sheet,
      ranges: ['Sheet1!A:A'],
      recordsAffected: 0,
      status: 'failure',
      error: 'No records found matching the criteria.',
      duration: '50ms'
    })
  })

  it('should propagate errors thrown by findFirst when includeMetadata is false', async () => {
    const where: WhereClause<{ id: string }> = { id: '789' }
    const findFirstError = new Error('findFirst error')

    mockedFindFirst.mockRejectedValueOnce(findFirstError)

    await expect(
      deleteFirst<{ id: string }>(
        {
          spreadsheetId,
          sheets: mockSheetsService,
          sheet
        },
        {
          where
        },
        {
          includeMetadata: false
        }
      )
    ).rejects.toThrow('findFirst error')

    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where },
      { includeMetadata: false }
    )

    expect(mockSheetsService.deleteRows).not.toHaveBeenCalled()
  })

  it('should return failure metadata when findFirst throws an error and includeMetadata is true', async () => {
    const where: WhereClause<{ id: string }> = { id: '789' }
    const findFirstError = new Error('findFirst error')

    mockedFindFirst.mockRejectedValueOnce(findFirstError)

    const result = await deleteFirst<{ id: string }>(
      {
        spreadsheetId,
        sheets: mockSheetsService,
        sheet
      },
      {
        where
      },
      {
        includeMetadata: true
      }
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
        operationType: 'delete',
        spreadsheetId,
        sheetId: sheet,
        ranges: [],
        error: 'findFirst error',
        userId: undefined
      }
    })

    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where },
      { includeMetadata: true }
    )

    expect(mockSheetsService.deleteRows).not.toHaveBeenCalled()

    expect(metadataInstance.calculateDuration).toHaveBeenCalledWith(
      expect.any(Number)
    )

    expect(metadataInstance.createMetadata).toHaveBeenCalledWith({
      operationType: 'delete',
      spreadsheetId,
      sheetId: sheet,
      ranges: [],
      recordsAffected: 0,
      status: 'failure',
      error: 'findFirst error',
      duration: '50ms'
    })
  })

  it('should propagate errors thrown by deleteRows when includeMetadata is false', async () => {
    const where: WhereClause<{ id: string }> = { id: '123' }
    const mockRecord: OperationResult<{ id: string }> = {
      data: { id: '123' },
      row: 2,
      range: 'Sheet1!A2:B2'
    }

    // Mock the findFirst function to return a record
    mockedFindFirst.mockResolvedValueOnce(mockRecord)

    // Mock the deleteRows function to throw an error
    const deleteRowsError = new Error('deleteRows error')
    ;(
      mockSheetsService.deleteRows as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(deleteRowsError)

    await expect(
      deleteFirst<{ id: string }>(
        {
          spreadsheetId,
          sheets: mockSheetsService,
          sheet
        },
        {
          where
        },
        {
          includeMetadata: false
        }
      )
    ).rejects.toThrow('deleteRows error')

    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where },
      { includeMetadata: false }
    )

    expect(mockSheetsService.deleteRows).toHaveBeenCalledWith(sheet, 1, 2)

    // expect(metadataInstance.calculateDuration).not.toHaveBeenCalled()
    expect(metadataInstance.createMetadata).not.toHaveBeenCalled()
  })

  it('should return failure metadata when deleteRows throws an error and includeMetadata is true', async () => {
    const where: WhereClause<{ id: string }> = { id: '123' }
    const mockRecord: OperationResult<{ id: string }> = {
      data: { id: '123' },
      row: 2,
      range: 'Sheet1!A2:B2',
      metadata: {
        operationId: 'find-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '30ms',
        recordsAffected: 1,
        status: 'success',
        operationType: 'find',
        spreadsheetId,
        sheetId: sheet,
        ranges: ['Sheet1!A:A', 'Sheet1!A2:B2']
      }
    }

    // Mock the findFirst function to return a record
    mockedFindFirst.mockResolvedValueOnce(mockRecord)

    // Mock the deleteRows function to throw an error
    const deleteRowsError = new Error('deleteRows error')
    ;(
      mockSheetsService.deleteRows as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(deleteRowsError)

    const result = await deleteFirst<{ id: string }>(
      {
        spreadsheetId,
        sheets: mockSheetsService,
        sheet
      },
      {
        where
      },
      {
        includeMetadata: true
      }
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
        operationType: 'delete',
        spreadsheetId,
        sheetId: sheet,
        ranges: [],
        error: 'deleteRows error',
        userId: undefined
      }
    })

    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where },
      { includeMetadata: true }
    )

    expect(mockSheetsService.deleteRows).toHaveBeenCalledWith(sheet, 1, 2)

    expect(metadataInstance.calculateDuration).toHaveBeenCalledWith(
      expect.any(Number)
    )

    expect(metadataInstance.createMetadata).toHaveBeenCalledWith({
      operationType: 'delete',
      spreadsheetId,
      sheetId: sheet,
      ranges: [],
      recordsAffected: 0,
      status: 'failure',
      error: 'deleteRows error',
      duration: '50ms'
    })
  })
})
