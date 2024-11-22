import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateFirst } from '@/core/updateFirst/updateFirst'
import { findFirst } from '@/core/findFirst/findFirst'
import { sheets_v4 } from 'googleapis'
import { WhereClause } from '@/types/where'
import { SheetRecord } from '@/types/sheetRecord'

// Mock dependencies
vi.mock('@/core/findFirst/findFirst')

// Import the mocked function
const mockedFindFirst = vi.mocked(findFirst)

// Mock the Sheets client
const mockSheets = {
  spreadsheets: {
    values: {
      update: vi.fn()
    }
  }
} as unknown as sheets_v4.Sheets

describe('updateFirst', () => {
  beforeEach(() => {
    // Reset all mocks before each test to ensure isolation
    vi.resetAllMocks()
  })

  it('should successfully update the first matching record and return the updated data', async () => {
    // Define the input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string }> = { Name: 'Alice' }
    const dataToUpdate: Partial<{ Name: string; Age: string }> = { Age: '31' }

    // Mock the findFirst function to return an existing record
    const foundRecord: SheetRecord<{ Name: string; Age: string }> = {
      range: 'TestSheet!A2:B2',
      row: 2,
      fields: { Name: 'Alice', Age: '30' }
    }
    mockedFindFirst.mockResolvedValue(foundRecord)

    // Mock the update operation to resolve successfully
    ;(
      mockSheets.spreadsheets.values.update as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      data: {}
    })

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

    expect(mockSheets.spreadsheets.values.update).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      range: 'TestSheet!A2:B2',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Alice', '31']]
      }
    })

    // Assertion to check the function's return value
    expect(result).toEqual({ Name: 'Alice', Age: '31' })
  })

  it('should throw an error when no matching record is found', async () => {
    // Define the input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string }> = { Name: 'Bob' }
    const dataToUpdate: Partial<{ Name: string; Age: string }> = { Age: '40' }

    // Mock the findFirst function to return undefined (no record found)
    mockedFindFirst.mockResolvedValue(undefined)

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

    // Assertion to ensure update was NOT called
    expect(mockSheets.spreadsheets.values.update).not.toHaveBeenCalled()
  })

  it('should propagate errors thrown by the findFirst function', async () => {
    // Define the input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string }> = { Name: 'Eve' }
    const dataToUpdate: Partial<{ Name: string; Age: string }> = { Age: '31' }

    // Mock the findFirst function to throw an error
    const findFirstError = new Error('findFirst encountered an error')
    mockedFindFirst.mockRejectedValue(findFirstError)

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

    // Assertion to ensure update was NOT called
    expect(mockSheets.spreadsheets.values.update).not.toHaveBeenCalled()
  })

  it('should propagate errors thrown by the Google Sheets API during the update', async () => {
    // Define the input parameters
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
      fields: { Name: 'Charlie', Age: '34' }
    }
    mockedFindFirst.mockResolvedValue(foundRecord)

    // Mock the update operation to throw an error
    const updateError = new Error('Google Sheets API Error')
    ;(
      mockSheets.spreadsheets.values.update as ReturnType<typeof vi.fn>
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

    // Assertion to ensure update was called correctly
    expect(mockSheets.spreadsheets.values.update).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      range: 'TestSheet!A3:B3',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Charlie', '35']]
      }
    })
  })
})
