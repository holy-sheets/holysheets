import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateFirst } from './updateFirst'
import { findFirst } from '../findFirst'
import { insert } from '../insert'
import { sheets_v4 } from 'googleapis'
import { WhereClause } from '../../types/where'
import { SheetRecord } from '../../types/sheetRecord'

// Mock dependencies
vi.mock('../findFirst')
vi.mock('../insert')

// Create mocked versions of imported functions
const mockedFindFirst = vi.mocked(findFirst)
const mockedInsert = vi.mocked(insert)

describe('updateFirst', () => {
  const spreadsheetId = 'test-spreadsheet-id'
  const sheetName = 'TestSheet'
  const mockSheets = {} as sheets_v4.Sheets // Mock Sheets client

  beforeEach(() => {
    // Reset all mocks before each test to ensure isolation
    vi.resetAllMocks()
  })

  it('should successfully update the first matching record and return the updated record', async () => {
    // Define the where clause and data for update
    const where: WhereClause<{ id: string; status: string }> = { id: '123' }
    const data: Partial<{ id: string; status: string }> = { status: 'inactive' }

    // Mock findFirst to return a found record
    const foundRecord: SheetRecord<{ id: string; status: string }> = {
      range: 'TestSheet!A2:Z2',
      row: 2,
      fields: { id: '123', status: 'active' }
    }
    mockedFindFirst.mockResolvedValue(foundRecord)

    // Mock insert to resolve successfully
    mockedInsert.mockResolvedValue()

    // Call the function under test
    const result = await updateFirst(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where, data }
    )

    // Assertions to ensure dependencies were called correctly
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    expect(mockedInsert).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { data: [{ id: '123', status: 'inactive' }] }
    )

    // Assertion to check the function's return value
    expect(result).toEqual({ id: '123', status: 'inactive' })
  })

  it('should throw an error when no matching record is found', async () => {
    const where: WhereClause<{ id: string; status: string }> = { id: '123' }
    const data: Partial<{ id: string; status: string }> = { status: 'inactive' }

    // Mock findFirst to return undefined (no record found)
    mockedFindFirst.mockResolvedValue(undefined)

    // Expectation that the function throws an error
    await expect(
      updateFirst(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data }
      )
    ).rejects.toThrow('No record found to update')

    // Assertions to ensure findFirst was called correctly
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    // Assertion to ensure insert was NOT called
    expect(mockedInsert).not.toHaveBeenCalled()
  })

  it('should propagate errors thrown by findFirst', async () => {
    const where: WhereClause<{ id: string; status: string }> = { id: '123' }
    const data: Partial<{ id: string; status: string }> = { status: 'inactive' }

    const error = new Error('findFirst encountered an error')

    // Mock findFirst to throw an error
    mockedFindFirst.mockRejectedValue(error)

    // Expectation that the function propagates the error
    await expect(
      updateFirst(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data }
      )
    ).rejects.toThrow('findFirst encountered an error')

    // Assertions to ensure findFirst was called correctly
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    // Assertion to ensure insert was NOT called
    expect(mockedInsert).not.toHaveBeenCalled()
  })

  it('should propagate errors thrown by insert', async () => {
    const where: WhereClause<{ id: string; status: string }> = { id: '123' }
    const data: Partial<{ id: string; status: string }> = { status: 'inactive' }

    const foundRecord: SheetRecord<{ id: string; status: string }> = {
      range: 'TestSheet!A2:Z2',
      row: 2,
      fields: { id: '123', status: 'active' }
    }
    const error = new Error('insert encountered an error')

    // Mock findFirst to return a found record
    mockedFindFirst.mockResolvedValue(foundRecord)

    // Mock insert to throw an error
    mockedInsert.mockRejectedValue(error)

    // Expectation that the function propagates the error
    await expect(
      updateFirst(
        { spreadsheetId, sheets: mockSheets, sheet: sheetName },
        { where, data }
      )
    ).rejects.toThrow('insert encountered an error')

    // Assertions to ensure findFirst was called correctly
    expect(mockedFindFirst).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { where }
    )

    // Assertion to ensure insert was called correctly
    expect(mockedInsert).toHaveBeenCalledWith(
      { spreadsheetId, sheets: mockSheets, sheet: sheetName },
      { data: [{ id: '123', status: 'inactive' }] }
    )
  })
})
