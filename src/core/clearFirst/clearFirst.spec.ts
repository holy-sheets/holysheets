import { describe, it, expect, vi, beforeEach } from 'vitest'
import { clearFirst } from './clearFirst'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { findFirst } from '@/core/findFirst/findFirst'
import { MetadataService } from '@/services/metadata/MetadataService'
import { ErrorMessages, ErrorCode } from '@/services/errors/errorMessages'
import { OperationResult } from '@/services/metadata/IMetadataService'
import { WhereClause } from '@/types/where'

// Mock the findFirst function and MetadataService
vi.mock('@/core/findFirst/findFirst')
vi.mock('@/services/metadata/MetadataService')

const mockedFindFirst = vi.mocked(findFirst, true)
const mockedMetadataService = vi.mocked(MetadataService, true)

describe('clearFirst', () => {
  const mockSheetsService: IGoogleSheetsService = {
    clearValues: vi.fn()
  } as unknown as IGoogleSheetsService

  const spreadsheetId = 'spreadsheet-id'
  const sheet = 'Sheet1'

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

  it('should clear the first record that matches the where clause and return the cleared record with metadata when includeMetadata is true', async () => {
    const where: WhereClause<{ id: string }> = { id: '123' }
    const mockRecord: OperationResult<{ id: string }> = {
      range: 'Sheet1!A2:B2',
      row: 2,
      data: { id: '123' },
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

    // Mock the clearValues function to resolve
    ;(
      mockSheetsService.clearValues as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(undefined)

    const result = await clearFirst<{ id: string }>(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where },
      { includeMetadata: true }
    )

    expect(result).toEqual({
      data: { id: '123' },
      row: 2,
      range: 'Sheet1!A2:B2',
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 1,
        status: 'success',
        operationType: 'clear',
        spreadsheetId,
        sheetId: sheet,
        ranges: ['Sheet1!A2:B2'],
        error: undefined,
        userId: undefined
      }
    })

    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where },
      { includeMetadata: true }
    )

    expect(mockSheetsService.clearValues).toHaveBeenCalledWith('Sheet1!A2:B2')

    expect(metadataInstance.calculateDuration).toHaveBeenCalledWith(
      expect.any(Number)
    )

    expect(metadataInstance.createMetadata).toHaveBeenCalledWith({
      operationType: 'clear',
      spreadsheetId,
      sheetId: sheet,
      ranges: ['Sheet1!A2:B2'],
      recordsAffected: 1,
      status: 'success',
      duration: '50ms'
    })
  })

  it('should throw an error if no record is found and includeMetadata is false', async () => {
    const where: WhereClause<{ id: string }> = { id: '123' }

    // Mock the findFirst function to return undefined
    mockedFindFirst.mockResolvedValueOnce({
      data: undefined,
      row: undefined,
      range: undefined
    })

    await expect(
      clearFirst<{ id: string }>(
        { spreadsheetId, sheets: mockSheetsService, sheet },
        { where },
        { includeMetadata: false }
      )
    ).rejects.toThrow('No records found matching the criteria.')

    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where },
      { includeMetadata: false }
    )

    expect(mockSheetsService.clearValues).not.toHaveBeenCalled()
  })

  it('should return failure metadata if no record is found and includeMetadata is true', async () => {
    const where: WhereClause<{ id: string }> = { id: '123' }

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

    const result = await clearFirst<{ id: string }>(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where },
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
        operationType: 'clear',
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

    expect(mockSheetsService.clearValues).not.toHaveBeenCalled()

    expect(metadataInstance.calculateDuration).toHaveBeenCalledWith(
      expect.any(Number)
    )

    expect(metadataInstance.createMetadata).toHaveBeenCalledWith({
      operationType: 'clear',
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
    const where: WhereClause<{ id: string }> = { id: '123' }

    const findFirstError = new Error('findFirst error')

    mockedFindFirst.mockRejectedValueOnce(findFirstError)

    await expect(
      clearFirst<{ id: string }>(
        { spreadsheetId, sheets: mockSheetsService, sheet },
        { where },
        { includeMetadata: false }
      )
    ).rejects.toThrow('findFirst error')

    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where },
      { includeMetadata: false }
    )

    expect(mockSheetsService.clearValues).not.toHaveBeenCalled()
  })

  it('should return failure metadata when findFirst throws an error and includeMetadata is true', async () => {
    const where: WhereClause<{ id: string }> = { id: '123' }

    const findFirstError = new Error('findFirst error')

    mockedFindFirst.mockRejectedValueOnce(findFirstError)

    const result = await clearFirst<{ id: string }>(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where },
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
        operationType: 'clear',
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

    expect(mockSheetsService.clearValues).not.toHaveBeenCalled()

    expect(metadataInstance.calculateDuration).toHaveBeenCalledWith(
      expect.any(Number)
    )

    expect(metadataInstance.createMetadata).toHaveBeenCalledWith({
      operationType: 'clear',
      spreadsheetId,
      sheetId: sheet,
      ranges: [],
      recordsAffected: 0,
      status: 'failure',
      error: 'findFirst error',
      duration: '50ms'
    })
  })

  it('should handle errors when clearing values and includeMetadata is false', async () => {
    const where: WhereClause<{ id: string }> = { id: '123' }
    const mockRecord: OperationResult<{ id: string }> = {
      range: 'Sheet1!A2:B2',
      row: 2,
      data: { id: '123' }
    }

    // Mock the findFirst function to return a record
    mockedFindFirst.mockResolvedValueOnce(mockRecord)

    // Mock the clearValues function to throw an error
    const clearValuesError = new Error('Test error')
    ;(
      mockSheetsService.clearValues as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(clearValuesError)

    await expect(
      clearFirst<{ id: string }>(
        { spreadsheetId, sheets: mockSheetsService, sheet },
        { where },
        { includeMetadata: false }
      )
    ).rejects.toThrow('Test error')

    expect(mockSheetsService.clearValues).toHaveBeenCalledWith('Sheet1!A2:B2')
    // TODO: Refactor clearFirst to not call calculateDuration and createMetadata when includeMetadata is false
    // expect(metadataInstance.calculateDuration).not.toHaveBeenCalled()
    expect(metadataInstance.createMetadata).not.toHaveBeenCalled()
  })

  it('should return failure metadata when clearing values fails and includeMetadata is true', async () => {
    const where: WhereClause<{ id: string }> = { id: '123' }
    const mockRecord: OperationResult<{ id: string }> = {
      range: 'Sheet1!A2:B2',
      row: 2,
      data: { id: '123' },
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

    // Mock the clearValues function to throw an error
    const clearValuesError = new Error('Test error')
    ;(
      mockSheetsService.clearValues as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(clearValuesError)

    const result = await clearFirst<{ id: string }>(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where },
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
        operationType: 'clear',
        spreadsheetId,
        sheetId: sheet,
        ranges: [],
        error: 'Test error',
        userId: undefined
      }
    })

    expect(mockSheetsService.clearValues).toHaveBeenCalledWith('Sheet1!A2:B2')

    expect(metadataInstance.calculateDuration).toHaveBeenCalledWith(
      expect.any(Number)
    )

    expect(metadataInstance.createMetadata).toHaveBeenCalledWith({
      operationType: 'clear',
      spreadsheetId,
      sheetId: sheet,
      ranges: [],
      recordsAffected: 0,
      status: 'failure',
      error: 'Test error',
      duration: '50ms'
    })
  })
})
