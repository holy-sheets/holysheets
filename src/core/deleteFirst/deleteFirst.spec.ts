import { describe, it, expect, vi, beforeEach } from 'vitest'
import { deleteFirst } from '@/core/deleteFirst/deleteFirst'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { getSheetId } from '@/core/getSheetId/getSheetId'
import { findFirst } from '@/core/findFirst/findFirst'
import { WhereClause } from '@/types/where'
import { OperationResult } from '@/services/metadata/IMetadataService'
import { OperationError } from '@/services/errors/errors'

// Mock the dependencies
vi.mock('@/core/getSheetId/getSheetId')
vi.mock('@/core/findFirst/findFirst')

const mockedGetSheetId = vi.mocked(getSheetId, true)
const mockedFindFirst = vi.mocked(findFirst, true)

describe('deleteFirst', () => {
  const spreadsheetId = 'spreadsheet-id'
  const sheet = 'Sheet1'
  const mockSheetsService: IGoogleSheetsService = {
    deleteRows: vi.fn()
  } as unknown as IGoogleSheetsService

  const mockRecord: OperationResult<{ id: string }> = {
    data: { id: '123' },
    metadata: undefined,
    row: 2,
    range: 'Sheet1!A2:B2'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete the first record that matches the where clause and return data with metadata', async () => {
    // Mock the getSheetId and findFirst functions
    mockedGetSheetId.mockResolvedValue(12345)
    mockedFindFirst.mockResolvedValue({
      data: { id: '123' },
      metadata: {
        operationId: expect.any(String),
        timestamp: expect.any(String),
        duration: expect.any(String),
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

    // Mock the deleteRows function to resolve successfully
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
        where: { id: '123' }
      },
      { includeMetadata: true }
    )

    expect(result).toEqual({
      data: { id: '123' },
      metadata: expect.objectContaining({
        operationType: 'delete',
        status: 'success'
      }),
      row: 2,
      range: 'Sheet1!A2:B2'
    })

    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where: { id: '123' } },
      { includeMetadata: true }
    )

    expect(mockSheetsService.deleteRows).toHaveBeenCalledWith('Sheet1', 2, 2)
  })

  it('should return undefined and metadata when no record is found', async () => {
    // Mock the getSheetId and findFirst functions
    mockedGetSheetId.mockResolvedValue(12345)
    mockedFindFirst.mockResolvedValue({
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
    })

    const result = await deleteFirst<{ id: string }>(
      {
        spreadsheetId,
        sheets: mockSheetsService,
        sheet
      },
      {
        where: { id: '123' }
      },
      { includeMetadata: true }
    )

    expect(result).toEqual({
      data: undefined,
      metadata: expect.objectContaining({
        operationType: 'find',
        status: 'failure'
      }),
      row: undefined,
      range: undefined
    })

    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where: { id: '123' } },
      { includeMetadata: true }
    )

    expect(mockedGetSheetId).not.toHaveBeenCalled()
    expect(mockSheetsService.deleteRows).not.toHaveBeenCalled()
  })

  it('should throw an OperationError when deleteRows throws an error and includeMetadata is false', async () => {
    // Mock the getSheetId and findFirst functions
    mockedGetSheetId.mockResolvedValue(12345)
    mockedFindFirst.mockResolvedValue({
      data: { id: '123' },
      metadata: undefined,
      row: 2,
      range: 'Sheet1!A2:B2'
    })

    // Mock the deleteRows function to throw an error
    const deleteError = new Error('Test error')
    ;(
      mockSheetsService.deleteRows as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(deleteError)

    await expect(
      deleteFirst<{ id: string }>(
        {
          spreadsheetId,
          sheets: mockSheetsService,
          sheet
        },
        {
          where: { id: '123' }
        },
        { includeMetadata: false }
      )
    ).rejects.toThrow('Error deleting record: Test error')

    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheetsService, sheet },
      { where: { id: '123' } },
      { includeMetadata: false }
    )

    expect(mockSheetsService.deleteRows).toHaveBeenCalledWith(12345, 2, 2)
  })
})
