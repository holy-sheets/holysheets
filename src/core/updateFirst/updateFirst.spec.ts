import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateFirst } from '@/core/updateFirst/updateFirst'
import { findFirst } from '@/core/findFirst/findFirst'
import type { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { WhereClause } from '@/types/where'
import { SheetRecord } from '@/types/sheetRecord'

// Mock the findFirst function
vi.mock('@/core/findFirst/findFirst')

// Import the mocked function with correct typing
const mockedFindFirst = vi.mocked(findFirst, true)

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

  it('should successfully update the first matching record and return the updated data', async () => {
    // Define input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string }> = { Name: 'Alice' }
    const dataToUpdate: Partial<{ Name: string; Age: string }> = { Age: '31' }

    // Mock the findFirst function to return an existing record
    const foundRecord: SheetRecord<{ Name: string; Age: string }> = {
      range: 'TestSheet!A2:B2',
      row: 2,
      data: { Name: 'Alice', Age: '30' }
    }
    mockedFindFirst.mockResolvedValueOnce(foundRecord)

    // Mock the update operation to resolve successfully
    ;(
      mockSheets.updateValues as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(undefined)

    // Call the function under test
    const result = await updateFirst(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where, data: dataToUpdate }
    )

    // Assertions to ensure dependencies were called correctly
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    expect(mockSheets.updateValues).toHaveBeenCalledWith(
      'TestSheet!A2:B2',
      [['Alice', '31']],
      'RAW'
    )

    // Assertion to check the return value of the function
    expect(result).toEqual({ Name: 'Alice', Age: '31' })
  })

  it('should throw an error when no matching record is found', async () => {
    // Define input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string }> = { Name: 'Bob' }
    const dataToUpdate: Partial<{ Name: string; Age: string }> = { Age: '40' }

    // Mock the findFirst function to return undefined (no record found)
    mockedFindFirst.mockResolvedValueOnce(undefined)

    // Call the function under test and expect an error
    await expect(
      updateFirst(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data: dataToUpdate }
      )
    ).rejects.toThrow('No record found to update')

    // Assertions to ensure findFirst was called correctly
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    // Assertion to ensure updateValues was NOT called
    expect(mockSheets.updateValues).not.toHaveBeenCalled()
  })

  it('should propagate errors thrown by the findFirst function', async () => {
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
        { where, data: dataToUpdate }
      )
    ).rejects.toThrow('findFirst encountered an error')

    // Assertions to ensure findFirst was called correctly
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
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

    // Mock the findFirst function to return an existing record
    const foundRecord: SheetRecord<{ Name: string; Age: string }> = {
      range: 'TestSheet!A3:B3',
      row: 3,
      data: { Name: 'Charlie', Age: '34' }
    }
    mockedFindFirst.mockResolvedValueOnce(foundRecord)

    // Mock the update operation to throw an error
    const updateError = new Error('Google Sheets API Error')
    ;(
      mockSheets.updateValues as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(updateError)

    // Call the function under test and expect the error to be propagated
    await expect(
      updateFirst(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data: dataToUpdate }
      )
    ).rejects.toThrow('Google Sheets API Error')

    // Assertions to ensure findFirst was called correctly
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    // Adjust the expectation to reflect the actual call with multiple arguments
    expect(mockSheets.updateValues).toHaveBeenCalledWith(
      'TestSheet!A3:B3',
      [['Charlie', '35']],
      'RAW'
    )
  })
})
