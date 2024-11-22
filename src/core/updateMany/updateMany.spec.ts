// src/__tests__/updateMany.test.ts

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
      batchUpdate: vi.fn()
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
        range: 'TestSheet!A4:C4',
        row: 4,
        fields: { Name: 'Bob', Age: '25', Status: 'active' }
      },
      {
        range: 'TestSheet!A6:C6',
        row: 6,
        fields: { Name: 'Charlie', Age: '35', Status: 'active' }
      }
    ]
    mockedFindMany.mockResolvedValue(foundRecords)

    // Mock the batchUpdate operation to resolve successfully
    ;(
      mockSheets.spreadsheets.values.batchUpdate as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
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

    expect(mockSheets.spreadsheets.values.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        valueInputOption: 'RAW',
        data: [
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
        ]
      }
    })

    // Assertion to check the function's return value
    expect(result).toEqual([
      { Name: 'Alice', Age: '30', Status: 'inactive' },
      { Name: 'Bob', Age: '25', Status: 'inactive' },
      { Name: 'Charlie', Age: '35', Status: 'inactive' }
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

    // Assertion to ensure batchUpdate was NOT called
    expect(mockSheets.spreadsheets.values.batchUpdate).not.toHaveBeenCalled()
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

    // Assertion to ensure batchUpdate was NOT called
    expect(mockSheets.spreadsheets.values.batchUpdate).not.toHaveBeenCalled()
  })

  it('should propagate errors thrown by the Google Sheets API during the batch update', async () => {
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
        range: 'TestSheet!A4:C4',
        row: 4,
        fields: { Name: 'Bob', Age: '25', Status: 'active' }
      },
      {
        range: 'TestSheet!A6:C6',
        row: 6,
        fields: { Name: 'Charlie', Age: '35', Status: 'active' }
      }
    ]
    mockedFindMany.mockResolvedValue(foundRecords)

    // Mock the batchUpdate operation to throw an error
    const batchUpdateError = new Error('Google Sheets API Error')
    ;(
      mockSheets.spreadsheets.values.batchUpdate as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(batchUpdateError)

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

    // Assertions to ensure batchUpdate was called correctly
    expect(mockSheets.spreadsheets.values.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        valueInputOption: 'RAW',
        data: [
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
        ]
      }
    })
  })

  it('should update only matching records without affecting others', async () => {
    // Define the input parameters
    const spreadsheetId = 'test-spreadsheet-id'
    const sheetName = 'TestSheet'
    const where: WhereClause<{ Name: string; Age: string }> = { Name: 'Alice' }
    const dataToUpdate: Partial<{ Name: string; Age: string }> = { Age: '25' }

    // Mock the findMany function to return only Alice's records
    const foundRecords: SheetRecord<{ Name: string; Age: string }>[] = [
      {
        range: 'TestSheet!A2:B2',
        row: 2,
        fields: { Name: 'Alice', Age: '20' }
      },
      {
        range: 'TestSheet!A4:B4',
        row: 4,
        fields: { Name: 'Alice', Age: '23' }
      }
    ]
    mockedFindMany.mockResolvedValue(foundRecords)

    // Mock the batchUpdate operation to resolve successfully
    ;(
      mockSheets.spreadsheets.values.batchUpdate as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
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

    expect(mockSheets.spreadsheets.values.batchUpdate).toHaveBeenCalledWith({
      spreadsheetId: 'test-spreadsheet-id',
      requestBody: {
        valueInputOption: 'RAW',
        data: [
          {
            range: 'TestSheet!A2:B2',
            values: [['Alice', '25']]
          },
          {
            range: 'TestSheet!A4:B4',
            values: [['Alice', '25']]
          }
        ]
      }
    })

    // Assertion to check the function's return value
    expect(result).toEqual([
      { Name: 'Alice', Age: '25' },
      { Name: 'Alice', Age: '25' }
    ])
  })
})
