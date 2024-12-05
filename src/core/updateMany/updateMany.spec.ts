import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateMany } from '@/core/updateMany/updateMany'
import { findMany } from '@/core/findMany/findMany'
import type { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { WhereClause } from '@/types/where'
import { MetadataService } from '@/services/metadata/MetadataService'
import { ErrorMessages, ErrorCode } from '@/services/errors/errorMessages'

// Mock the findMany function and services
vi.mock('@/core/findMany/findMany')
vi.mock('@/services/metadata/MetadataService')

const mockSheets: IGoogleSheetsService = {
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

const mockedFindMany = vi.mocked(findMany)

describe('updateMany', () => {
  let metadataInstance: {
    calculateDuration: ReturnType<typeof vi.fn>
    createMetadata: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.resetAllMocks()

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
      'No records found to update.'
    ;(ErrorMessages as any)[ErrorCode.UnknownError] =
      'An unknown error occurred while updating records.'
  })

  it('should successfully update multiple matching records and return updated data with metadata', async () => {
    // Input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string; Status: string }> = {
      Status: 'active'
    }
    const dataToUpdate: Partial<{ Name: string; Age: string; Status: string }> =
      {
        Status: 'inactive'
      }

    // Mock the findMany function to return multiple records
    const foundRecords = {
      data: [
        { Name: 'Alice', Age: '30', Status: 'active' },
        { Name: 'Bob', Age: '25', Status: 'active' },
        { Name: 'Charlie', Age: '35', Status: 'active' }
      ],
      rows: [2, 4, 6],
      ranges: ['TestSheet!A2:C2', 'TestSheet!A4:C4', 'TestSheet!A6:C6'],
      metadata: {
        operationId: 'find-operation-id',
        status: 'success',
        recordsAffected: 3,
        ranges: ['TestSheet!A2:C2', 'TestSheet!A4:C4', 'TestSheet!A6:C6'],
        duration: '30ms',
        operationType: 'find',
        spreadsheetId,
        sheetId: sheetName,
        timestamp: '2023-01-01T00:00:00.000Z'
      }
    }
    ;(mockedFindMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      foundRecords
    )

    // Mock batchUpdateValues to resolve
    ;(
      mockSheets.batchUpdateValues as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(undefined)

    // Call the function under test
    const result = await updateMany(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where, data: dataToUpdate },
      { includeMetadata: true }
    )

    // Assertions to ensure dependencies were called correctly
    expect(mockedFindMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where },
      { includeMetadata: true }
    )

    expect(mockSheets.batchUpdateValues).toHaveBeenCalledWith(
      [
        {
          range: 'TestSheet!A2:C2',
          values: [['Alice', '30', 'inactive']]
        },
        {
          range: 'TestSheet!A4:C4',
          values: [['Bob', '25', 'inactive']]
        },
        {
          range: 'TestSheet!A6:C6',
          values: [['Charlie', '35', 'inactive']]
        }
      ],
      'RAW'
    )

    // Assertion to check the return value of the function
    expect(result).toEqual({
      data: [
        { Name: 'Alice', Age: '30', Status: 'inactive' },
        { Name: 'Bob', Age: '25', Status: 'inactive' },
        { Name: 'Charlie', Age: '35', Status: 'inactive' }
      ],
      rows: [2, 4, 6],
      ranges: ['TestSheet!A2:C2', 'TestSheet!A4:C4', 'TestSheet!A6:C6'],
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 3,
        status: 'success',
        operationType: 'update',
        spreadsheetId,
        sheetId: sheetName,
        ranges: ['TestSheet!A2:C2', 'TestSheet!A4:C4', 'TestSheet!A6:C6'],
        error: undefined,
        userId: undefined
      }
    })
  })
})
