import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateFirst } from '@/core/updateFirst/updateFirst'
import { findFirst } from '@/core/findFirst/findFirst'
import type { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { WhereClause } from '@/types/where'
import type { OperationResult } from '@/services/metadata/IMetadataService'
import { getHeaders } from '@/utils/headers/headers'

// Mock the findFirst and getHeaders functions
vi.mock('@/core/findFirst/findFirst')
vi.mock('@/utils/headers/headers')

const mockedFindFirst = vi.mocked(findFirst, true)
const mockedGetHeaders = vi.mocked(getHeaders, true)

// Define a mock implementation of IGoogleSheetsService
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
  // Add other methods if necessary
}

describe('updateFirst', () => {
  beforeEach(() => {
    // Reset all mocks before each test to ensure isolation
    vi.resetAllMocks()
  })

  it('should successfully update the first matching record and return the updated data with metadata', async () => {
    // Define input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string }> = { Name: 'Alice' }
    const dataToUpdate: Partial<{ Name: string; Age: string }> = { Age: '31' }

    // Mock the findFirst function to return an existing record with metadata
    const findResult: OperationResult<{ Name: string; Age: string }> = {
      data: { Name: 'Alice', Age: '30' },
      metadata: {
        operationId: 'op-id-123',
        timestamp: '2024-04-27T12:00:00Z',
        duration: '100ms',
        recordsAffected: 1,
        status: 'success',
        operationType: 'find',
        spreadsheetId,
        sheetId: sheetName,
        ranges: ['TestSheet!A2:B2']
      },
      row: 2,
      range: 'TestSheet!A2:B2'
    }
    mockedFindFirst.mockResolvedValueOnce(findResult)

    // Mock the getHeaders function to return headers
    const headers = [
      { name: 'Name', column: 'A' },
      { name: 'Age', column: 'B' }
    ]
    ;(mockedGetHeaders as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      headers
    )

    // Mock the update operation to resolve successfully
    ;(
      mockSheets.updateValues as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(undefined)

    // Call the function under test
    const result = await updateFirst(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where, data: dataToUpdate },
      { includeMetadata: true }
    )

    // Assertions to ensure dependencies were called correctly
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where },
      { includeMetadata: true }
    )

    expect(mockedGetHeaders).toHaveBeenCalledWith({
      sheet: sheetName,
      sheets: mockSheets,
      spreadsheetId
    })

    expect(mockSheets.updateValues).toHaveBeenCalledWith(
      'TestSheet!A2:B2',
      [['Alice', '31']],
      'RAW'
    )

    // Assertion to verify the return value of the function
    expect(result).toEqual({
      data: { Name: 'Alice', Age: '31' },
      metadata: {
        operationId: expect.any(String),
        timestamp: expect.any(String),
        duration: expect.any(String),
        recordsAffected: 1,
        status: 'success',
        operationType: 'update',
        spreadsheetId,
        sheetId: sheetName,
        ranges: ['TestSheet!A2:B2']
      },
      row: 2,
      range: 'TestSheet!A2:B2'
    })
  })

  it('should return undefined and metadata when no matching record is found', async () => {
    // Define input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string }> = { Name: 'Bob' }
    const dataToUpdate: Partial<{ Name: string; Age: string }> = { Age: '40' }

    // Mock the findFirst function to return no record found with metadata
    const findResult: OperationResult<{ Name: string; Age: string }> = {
      data: undefined,
      metadata: {
        operationId: 'op-id-456',
        timestamp: '2024-04-27T12:05:00Z',
        duration: '50ms',
        recordsAffected: 0,
        status: 'failure',
        operationType: 'find',
        spreadsheetId,
        sheetId: sheetName,
        ranges: ['TestSheet!A2:B2'],
        error: 'No records found matching the criteria.'
      },
      row: undefined,
      range: undefined
    }
    mockedFindFirst.mockResolvedValueOnce(findResult)

    // Call the function under test
    const result = await updateFirst(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where, data: dataToUpdate },
      { includeMetadata: true }
    )

    // Assertions to ensure dependencies were called correctly
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where },
      { includeMetadata: true }
    )

    // Assertion to ensure updateValues was NOT called
    expect(mockSheets.updateValues).not.toHaveBeenCalled()

    // Assertion to verify the return value of the function
    expect(result).toEqual({
      data: undefined,
      metadata: findResult.metadata,
      row: undefined,
      range: undefined
    })
  })

  it('should throw an OperationError when findFirst throws an error', async () => {
    // Define input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string }> = { Name: 'Eve' }
    const dataToUpdate: Partial<{ Name: string; Age: string }> = { Age: '31' }

    // Mock the findFirst function to throw an error
    const findFirstError = new Error('findFirst encountered an error')
    mockedFindFirst.mockRejectedValueOnce(findFirstError)

    // Call the function under test and expect the error to be propagated
    await expect(
      updateFirst(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data: dataToUpdate },
        { includeMetadata: false }
      )
    ).rejects.toThrow('Error updating data: findFirst encountered an error')

    // Assertions to ensure findFirst was called correctly
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where },
      { includeMetadata: false }
    )

    // Assertion to ensure updateValues was NOT called
    expect(mockSheets.updateValues).not.toHaveBeenCalled()
  })

  it('should propagate errors thrown by the Google Sheets API during the update', async () => {
    // Define input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string }> = {
      Name: 'Charlie'
    }
    const dataToUpdate: Partial<{ Name: string; Age: string }> = { Age: '35' }

    // Mock the findFirst function to return an existing record with metadata
    const findResult: OperationResult<{ Name: string; Age: string }> = {
      data: { Name: 'Charlie', Age: '34' },
      metadata: {
        operationId: 'op-id-789',
        timestamp: '2024-04-27T12:10:00Z',
        duration: '80ms',
        recordsAffected: 1,
        status: 'success',
        operationType: 'find',
        spreadsheetId,
        sheetId: sheetName,
        ranges: ['TestSheet!A3:B3']
      },
      row: 3,
      range: 'TestSheet!A3:B3'
    }
    mockedFindFirst.mockResolvedValueOnce(findResult)

    // Mock the getHeaders function to return headers
    const headers = [
      { name: 'Name', column: 'A' },
      { name: 'Age', column: 'B' }
    ]
    ;(mockedGetHeaders as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      headers
    )

    // Mock the update operation to throw an error
    const updateError = new Error('Google Sheets API Error')
    ;(
      mockSheets.updateValues as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(updateError)

    // Call the function under test and expect the error to be propagated
    await expect(
      updateFirst(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data: dataToUpdate },
        { includeMetadata: false }
      )
    ).rejects.toThrow('Google Sheets API Error')

    // Assertions to ensure findFirst was called correctly
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where },
      { includeMetadata: false }
    )

    expect(mockedGetHeaders).toHaveBeenCalledWith({
      sheet: sheetName,
      sheets: mockSheets,
      spreadsheetId
    })

    // Assertion to ensure updateValues was called correctly
    expect(mockSheets.updateValues).toHaveBeenCalledWith(
      'TestSheet!A3:B3',
      [['Charlie', '35']],
      'RAW'
    )
  })
})
