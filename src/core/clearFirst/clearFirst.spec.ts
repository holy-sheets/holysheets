import { describe, it, expect, vi, beforeEach } from 'vitest'
import { clearFirst } from '@/core/clearFirst/clearFirst'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { findFirst } from '@/core/findFirst/findFirst'
import { OperationResult } from '@/services/metadata/IMetadataService'

// Mock the findFirst function
vi.mock('@/core/findFirst/findFirst')

// Import the mocked function with correct typing
const mockedFindFirst = vi.mocked(findFirst, true)

describe('clearFirst', () => {
  const mockSheetsService: IGoogleSheetsService = {
    getValues: vi.fn(),
    batchGetValues: vi.fn(),
    updateValues: vi.fn(),
    batchUpdateValues: vi.fn(),
    clearValues: vi.fn(),
    batchClearValues: vi.fn(),
    deleteRows: vi.fn(),
    batchDeleteRows: vi.fn(),
    getSpreadsheet: vi.fn(),
    getAuth: vi.fn()
  }

  const spreadsheetId = 'spreadsheet-id'
  const sheet = 'Sheet1'

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should clear the first record that matches the where clause and return data with metadata', async () => {
    const mockRecord: OperationResult<{ id: string }> = {
      data: { id: '123' },
      metadata: {
        operationId: expect.any(String),
        timestamp: expect.any(String),
        duration: expect.any(String),
        recordsAffected: 1,
        status: 'success',
        operationType: 'clear',
        spreadsheetId,
        sheetId: sheet,
        ranges: ['Sheet1!A2:B2']
      },
      row: 2,
      range: 'Sheet1!A2:B2'
    }

    // Mock the findFirst function to return a record
    mockedFindFirst.mockResolvedValueOnce({
      data: { id: '123' },
      metadata: {
        operationId: 'op-id-001',
        timestamp: '2024-04-27T12:00:00Z',
        duration: '50ms',
        recordsAffected: 1,
        status: 'success',
        operationType: 'find',
        spreadsheetId,
        sheetId: sheet,
        ranges: ['Sheet1!A2:B2']
      },
      row: 2,
      range: 'Sheet1!A2:B2'
    })

    // Mock the clearValues function to resolve successfully
    ;(
      mockSheetsService.clearValues as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(undefined)

    const result = await clearFirst<{ id: string }>(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where: { id: '123' } },
      { includeMetadata: true }
    )

    expect(result).toEqual(mockRecord)

    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where: { id: '123' } },
      { includeMetadata: true }
    )

    expect(mockSheetsService.clearValues).toHaveBeenCalledWith('Sheet1!A2:B2')
  })

  it('should return undefined and metadata when no record is found', async () => {
    // Mock the findFirst function to return undefined
    const mockResult: OperationResult<{ id: string }> = {
      data: undefined,
      metadata: {
        operationId: 'op-id-002',
        timestamp: '2024-04-27T12:01:00Z',
        duration: '50ms',
        recordsAffected: 0,
        status: 'failure',
        operationType: 'find',
        spreadsheetId,
        sheetId: sheet,
        ranges: [],
        error: 'No records found matching the criteria.'
      },
      row: undefined,
      range: undefined
    }
    mockedFindFirst.mockResolvedValueOnce(mockResult)

    const result = await clearFirst<{ id: string }>(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where: { id: '123' } },
      { includeMetadata: true }
    )

    expect(result).toEqual(mockResult)

    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where: { id: '123' } },
      { includeMetadata: true }
    )

    expect(mockSheetsService.clearValues).not.toHaveBeenCalled()
  })

  it('should throw an OperationError when clearValues throws an error and includeMetadata is false', async () => {
    const mockRecord: OperationResult<{ id: string }> = {
      data: { id: '123' },
      metadata: undefined,
      row: 2,
      range: 'Sheet1!A2:B2'
    }

    // Mock the findFirst function to return a record
    mockedFindFirst.mockResolvedValueOnce(mockRecord)

    // Mock the clearValues function to throw an error
    const clearError = new Error('Test error')
    ;(
      mockSheetsService.clearValues as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(clearError)

    await expect(
      clearFirst<{ id: string }>(
        { spreadsheetId, sheets: mockSheetsService, sheet },
        { where: { id: '123' } },
        { includeMetadata: false }
      )
    ).rejects.toThrow('Error clearing record: Test error')

    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where: { id: '123' } },
      { includeMetadata: false }
    )

    expect(mockSheetsService.clearValues).toHaveBeenCalledWith('Sheet1!A2:B2')
  })
})
