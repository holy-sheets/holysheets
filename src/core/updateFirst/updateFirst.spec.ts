import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateFirst } from './updateFirst'
import { findFirst } from '../findFirst'
import { insert } from '../insert'
import { sheets_v4 } from 'googleapis'
import { WhereClause } from '../../types/where'

// Mock the dependent modules
vi.mock('../findFirst')
vi.mock('../insert')

// Create mocked versions of the imported functions
const mockedFindFirst = vi.mocked(findFirst)
const mockedInsert = vi.mocked(insert)

describe('updateFirst', () => {
  const spreadsheetId = 'test-spreadsheet-id'
  const sheetName = 'TestSheet'
  const mockSheets = {} as sheets_v4.Sheets // Mock Sheets client

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks()
  })

  it('should update the first matching record successfully', async () => {
    // Define the where clause and data to update
    const where: WhereClause<{ id: string; status: string }> = { id: '123' }
    const data: Partial<{ id: string; status: string }> = { status: 'inactive' }

    // Mock findFirst to return a found record
    const foundRecord = {
      range: 'TestSheet!A2:Z2',
      row: 2,
      fields: { id: '123', status: 'active' }
    }
    mockedFindFirst.mockResolvedValue(foundRecord)

    // Mock insert to resolve successfully
    mockedInsert.mockResolvedValue()

    // Call the function under test
    await updateFirst(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where, data }
    )

    // Assertions
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    expect(mockedInsert).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { data: [{ id: '123', status: 'inactive' }] }
    )
  })

  it('should throw an error when no matching record is found', async () => {
    const where: WhereClause<{ id: string; status: string }> = { id: '123' }
    const data: Partial<{ id: string; status: string }> = { status: 'inactive' }

    // Mock findFirst to return undefined (no record found)
    mockedFindFirst.mockResolvedValue(undefined)

    // Expect the function to throw an error
    await expect(
      updateFirst(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data }
      )
    ).rejects.toThrow('No record found to update')

    // Assertions
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    expect(mockedInsert).not.toHaveBeenCalled()
  })

  it('should propagate errors thrown by findFirst', async () => {
    const where: WhereClause<{ id: string; status: string }> = { id: '123' }
    const data: Partial<{ id: string; status: string }> = { status: 'inactive' }

    const error = new Error('findFirst encountered an error')

    // Mock findFirst to throw an error
    mockedFindFirst.mockRejectedValue(error)

    // Expect the function to propagate the error
    await expect(
      updateFirst(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data }
      )
    ).rejects.toThrow('findFirst encountered an error')

    // Assertions
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    expect(mockedInsert).not.toHaveBeenCalled()
  })

  it('should propagate errors thrown by insert', async () => {
    const where: WhereClause<{ id: string; status: string }> = { id: '123' }
    const data: Partial<{ id: string; status: string }> = { status: 'inactive' }

    const foundRecord = {
      range: 'TestSheet!A2:Z2',
      row: 2,
      fields: { id: '123', status: 'active' }
    }
    const error = new Error('insert encountered an error')

    // Mock findFirst to return a found record
    mockedFindFirst.mockResolvedValue(foundRecord)

    // Mock insert to throw an error
    mockedInsert.mockRejectedValue(error)

    // Expect the function to propagate the error
    await expect(
      updateFirst(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data }
      )
    ).rejects.toThrow('insert encountered an error')

    // Assertions
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    expect(mockedInsert).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { data: [{ id: '123', status: 'inactive' }] }
    )
  })
})
