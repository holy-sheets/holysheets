import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateMany } from './updateMany'
import { findMany } from '../findMany'
import { insert } from '../insert'
import { sheets_v4 } from 'googleapis'
import { WhereClause } from '../../types/where'
import { SheetRecord } from '../../types/sheetRecord'

// Mock the dependent modules
vi.mock('../findMany')
vi.mock('../insert')

// Create mocked versions of the imported functions
const mockedFindMany = vi.mocked(findMany)
const mockedInsert = vi.mocked(insert)

describe('updateMany', () => {
  const spreadsheetId = 'test-spreadsheet-id'
  const sheetName = 'TestSheet'
  const mockSheets = {} as sheets_v4.Sheets // Mock Sheets client

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks()
  })

  it('should update multiple matching records successfully', async () => {
    // Define the where clause and data to update
    const where: WhereClause<{ id: string; status: string }> = {
      status: 'active'
    }
    const data: Partial<{ id: string; status: string }> = { status: 'inactive' }

    // Mock findMany to return found records
    const foundRecords: SheetRecord<{ id: string; status: string }>[] = [
      {
        range: 'TestSheet!A2:Z2',
        row: 2,
        fields: { id: '123', status: 'active' }
      },
      {
        range: 'TestSheet!A3:Z3',
        row: 3,
        fields: { id: '124', status: 'active' }
      }
    ]
    mockedFindMany.mockResolvedValue(foundRecords)

    // Mock insert to resolve successfully
    mockedInsert.mockResolvedValue()

    // Call the function under test
    await updateMany(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where, data }
    )

    // Assertions
    expect(mockedFindMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    expect(mockedInsert).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      {
        data: [
          { id: '123', status: 'inactive' },
          { id: '124', status: 'inactive' }
        ]
      }
    )
  })

  it('should throw an error when no matching records are found', async () => {
    const where: WhereClause<{ id: string; status: string }> = {
      status: 'active'
    }
    const data: Partial<{ id: string; status: string }> = { status: 'inactive' }

    // Mock findMany to return an empty array (no records found)
    mockedFindMany.mockResolvedValue([])

    // Expect the function to throw an error
    await expect(
      updateMany(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data }
      )
    ).rejects.toThrow('No records found to update')

    // Assertions
    expect(mockedFindMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    expect(mockedInsert).not.toHaveBeenCalled()
  })

  it('should propagate errors thrown by findMany', async () => {
    const where: WhereClause<{ id: string; status: string }> = {
      status: 'active'
    }
    const data: Partial<{ id: string; status: string }> = { status: 'inactive' }

    const error = new Error('findMany encountered an error')

    // Mock findMany to throw an error
    mockedFindMany.mockRejectedValue(error)

    // Expect the function to propagate the error
    await expect(
      updateMany(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data }
      )
    ).rejects.toThrow('findMany encountered an error')

    // Assertions
    expect(mockedFindMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    expect(mockedInsert).not.toHaveBeenCalled()
  })

  it('should propagate errors thrown by insert', async () => {
    const where: WhereClause<{ id: string; status: string }> = {
      status: 'active'
    }
    const data: Partial<{ id: string; status: string }> = { status: 'inactive' }

    const foundRecords: SheetRecord<{ id: string; status: string }>[] = [
      {
        range: 'TestSheet!A2:Z2',
        row: 2,
        fields: { id: '123', status: 'active' }
      },
      {
        range: 'TestSheet!A3:Z3',
        row: 3,
        fields: { id: '124', status: 'active' }
      }
    ]

    const error = new Error('insert encountered an error')

    // Mock findMany to return found records
    mockedFindMany.mockResolvedValue(foundRecords)

    // Mock insert to throw an error
    mockedInsert.mockRejectedValue(error)

    // Expect the function to propagate the error
    await expect(
      updateMany(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data }
      )
    ).rejects.toThrow('insert encountered an error')

    // Assertions
    expect(mockedFindMany).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    expect(mockedInsert).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      {
        data: [
          { id: '123', status: 'inactive' },
          { id: '124', status: 'inactive' }
        ]
      }
    )
  })
})
