import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateMany } from '@/core/updateMany/updateMany'
import { findMany } from '@/core/findMany'
import { sheets_v4 } from 'googleapis'
import { WhereClause } from '@/types/where'
import { SheetRecord } from '@/types/sheetRecord'

// Mock dependencies
vi.mock('@/core/findMany')

// Import the mocked function
const mockedFindMany = vi.mocked(findMany)

// Mock the Sheets client
const mockSheets = {
  spreadsheets: {
    values: {
      update: vi.fn()
    }
  }
} as unknown as sheets_v4.Sheets

describe('updateMany', () => {
  beforeEach(() => {
    // Reset all mocks before each test to ensure isolation
    vi.resetAllMocks()
  })

  it('should successfully update multiple matching records and return the updated data', async () => {
    // Define the input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string; Status: 'active' }> =
      {
        Status: 'active'
      }
    const dataToUpdate: Partial<{ Name: string; Age: string; Status: string }> =
      { Status: 'inactive' }

    // Mock the findMany function to return multiple records
    const foundRecords: SheetRecord<{
      Name: string
      Age: string
      Status: string
    }>[] = [
      {
        range: 'TestSheet!A2:C2',
        row: 2,
        fields: { Name: 'Alice', Age: '30', Status: 'active' }
      },
      {
        range: 'TestSheet!A3:C3',
        row: 3,
        fields: { Name: 'Bob', Age: '25', Status: 'active' }
      }
    ]
    mockedFindMany.mockResolvedValue(foundRecords)

    // Mock the update operation to resolve successfully for each record
    ;(
      mockSheets.spreadsheets.values.update as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      data: {}
    })

    // Call the function under test
    const result = await updateMany(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where, data: dataToUpdate }
    )

    // Assertions to ensure dependencies were called correctly
    expect(mockedFindMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    // Expect update to be called for each found record
    expect(mockSheets.spreadsheets.values.update).toHaveBeenCalledTimes(2)
    expect(mockSheets.spreadsheets.values.update).toHaveBeenNthCalledWith(1, {
      spreadsheetId: 'test-spreadsheet-id',
      range: 'TestSheet!A2:C2',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Alice', '30', 'inactive']]
      }
    })
    expect(mockSheets.spreadsheets.values.update).toHaveBeenNthCalledWith(2, {
      spreadsheetId: 'test-spreadsheet-id',
      range: 'TestSheet!A3:C3',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Bob', '25', 'inactive']]
      }
    })

    // Assertion to check the function's return value
    expect(result).toEqual([
      { Name: 'Alice', Age: '30', Status: 'inactive' },
      { Name: 'Bob', Age: '25', Status: 'inactive' }
    ])
  })

  it('should throw an error when no matching records are found', async () => {
    // Define the input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string; Status: string }> = {
      Status: 'active'
    }
    const dataToUpdate: Partial<{ Name: string; Age: string; Status: string }> =
      { Status: 'inactive' }

    // Mock the findMany function to return an empty array (no records found)
    mockedFindMany.mockResolvedValue([])

    // Call the function under test and expect an error
    await expect(
      updateMany(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data: dataToUpdate }
      )
    ).rejects.toThrow('No records found to update')

    // Assertions to ensure findMany was called correctly
    expect(mockedFindMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    // Assertion to ensure update was NOT called
    expect(mockSheets.spreadsheets.values.update).not.toHaveBeenCalled()
  })

  it('should propagate errors thrown by the findMany function', async () => {
    // Define the input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string; Status: string }> = {
      Status: 'active'
    }
    const dataToUpdate: Partial<{ Name: string; Age: string; Status: string }> =
      { Status: 'inactive' }

    // Mock the findMany function to throw an error
    const findManyError = new Error('findMany encountered an error')
    mockedFindMany.mockRejectedValue(findManyError)

    // Call the function under test and expect the error to be propagated
    await expect(
      updateMany(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data: dataToUpdate }
      )
    ).rejects.toThrow('findMany encountered an error')

    // Assertions to ensure findMany was called correctly
    expect(mockedFindMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    // Assertion to ensure update was NOT called
    expect(mockSheets.spreadsheets.values.update).not.toHaveBeenCalled()
  })

  it('should propagate errors thrown by the Google Sheets API during the update', async () => {
    // Define the input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string; Status: string }> = {
      Status: 'active'
    }
    const dataToUpdate: Partial<{ Name: string; Age: string; Status: string }> =
      { Status: 'inactive' }

    // Mock the findMany function to return multiple records
    const foundRecords: SheetRecord<{
      Name: string
      Age: string
      Status: string
    }>[] = [
      {
        range: 'TestSheet!A2:C2',
        row: 2,
        fields: { Name: 'Alice', Age: '30', Status: 'active' }
      },
      {
        range: 'TestSheet!A3:C3',
        row: 3,
        fields: { Name: 'Bob', Age: '25', Status: 'active' }
      }
    ]
    mockedFindMany.mockResolvedValue(foundRecords)

    // Mock the update operation to throw an error on the second update
    const updateError = new Error('Google Sheets API Error')
    ;(mockSheets.spreadsheets.values.update as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ data: {} }) // First update succeeds
      .mockRejectedValueOnce(updateError) // Second update fails

    // Call the function under test and expect the error to be propagated
    await expect(
      updateMany(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data: dataToUpdate }
      )
    ).rejects.toThrow('Google Sheets API Error')

    // Assertions to ensure findMany was called correctly
    expect(mockedFindMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    // Assertions to ensure update was called correctly
    expect(mockSheets.spreadsheets.values.update).toHaveBeenCalledTimes(2)
    expect(mockSheets.spreadsheets.values.update).toHaveBeenNthCalledWith(1, {
      spreadsheetId: 'test-spreadsheet-id',
      range: 'TestSheet!A2:C2',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Alice', '30', 'inactive']]
      }
    })
    expect(mockSheets.spreadsheets.values.update).toHaveBeenNthCalledWith(2, {
      spreadsheetId: 'test-spreadsheet-id',
      range: 'TestSheet!A3:C3',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Bob', '25', 'inactive']]
      }
    })
  })
})
