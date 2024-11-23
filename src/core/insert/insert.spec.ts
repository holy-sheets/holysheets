import { describe, it, expect, vi, beforeEach } from 'vitest'
import { insert, InsertParams } from './insert'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { getHeaders } from '@/utils/headers/headers'
import { write } from '@/utils/write/write'
import {
  addSheetToRange,
  createMultipleRowsRange
} from '@/utils/rangeUtils/rangeUtils'
import { decombine } from '@/utils/dataUtils/dataUtils' // Import decombine
import { CellValue } from '@/types/cellValue'

// Mock the utility modules
vi.mock('@/utils/headers/headers')
vi.mock('@/utils/write/write')
vi.mock('@/utils/rangeUtils/rangeUtils')
vi.mock('@/utils/dataUtils/dataUtils') // Mock decombine

const mockSheetsService = {
  getValues: vi.fn(),
  batchGetValues: vi.fn()
} as unknown as IGoogleSheetsService

describe('insert', () => {
  const params: InsertParams = {
    spreadsheetId: 'test-spreadsheet-id',
    sheets: mockSheetsService,
    sheet: 'Sheet1'
  }

  const options = {
    data: [
      { Name: 'Alice', Age: 30 },
      { Name: 'Bob', Age: 25 }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should insert records into the spreadsheet', async () => {
    // Define current data in the sheet
    const currentData = [
      ['Name', 'Age'],
      ['Charlie', 40]
    ]

    // Define headers
    const headers = ['Name', 'Age']

    // Define expected values from records after decombine
    const valuesFromRecords = [
      ['Alice', 30],
      ['Bob', 25]
    ]

    // Define the expected range for the new data
    const range = 'Sheet1!A3:B4'

    // Mock the getValues method to return current data
    ;(
      mockSheetsService.getValues as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(currentData)

    // Mock the getHeaders function to return headers
    ;(getHeaders as ReturnType<typeof vi.fn>).mockResolvedValueOnce(headers)

    // Mock the createMultipleRowsRange function to return the expected range
    ;(createMultipleRowsRange as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      range
    )

    // Mock the decombine function to transform records into row values
    ;(decombine as ReturnType<typeof vi.fn>).mockImplementation(
      (record: { Name: string; Age: number }) => {
        return [record.Name, record.Age]
      }
    )

    // Mock the write function to resolve successfully
    ;(write as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined)

    // Execute the insert function
    await insert(params, options)

    // Assertions

    // Verify that getValues was called to fetch current data
    expect(mockSheetsService.getValues).toHaveBeenCalledWith(
      addSheetToRange({ sheet: 'Sheet1', range: 'A:Z' })
    )

    // Verify that getHeaders was called to fetch headers
    expect(getHeaders).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      sheets: mockSheetsService,
      spreadsheetId: 'test-spreadsheet-id'
    })

    // Verify that createMultipleRowsRange was called with correct parameters
    expect(createMultipleRowsRange).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      startRow: 3,
      endRow: 4,
      lastColumnIndex: 1
    })

    // Verify that decombine was called for each record
    expect(decombine).toHaveBeenCalledTimes(2)
    expect(decombine).toHaveBeenNthCalledWith(1, options.data[0], headers)
    expect(decombine).toHaveBeenNthCalledWith(2, options.data[1], headers)

    // Verify that write was called with the correct parameters
    expect(write).toHaveBeenCalledWith({
      range,
      values: valuesFromRecords,
      spreadsheetId: 'test-spreadsheet-id',
      sheets: mockSheetsService
    })
  })

  it('should throw an error if no data is found in the sheet', async () => {
    // Mock getValues to return empty data
    ;(
      mockSheetsService.getValues as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce([])

    // Execute the insert function and expect it to throw an error
    await expect(insert(params, options)).rejects.toThrow(
      'No data found in the sheet.'
    )

    // Assertions
    expect(mockSheetsService.getValues).toHaveBeenCalledWith(
      addSheetToRange({ sheet: 'Sheet1', range: 'A:Z' })
    )
    expect(getHeaders).not.toHaveBeenCalled()
    expect(createMultipleRowsRange).not.toHaveBeenCalled()
    expect(write).not.toHaveBeenCalled()
  })

  it('should handle error when getting headers', async () => {
    // Define current data in the sheet
    const currentData = [
      ['Name', 'Age'],
      ['Charlie', 40]
    ]

    const errorMessage = 'Test error'

    // Mock getValues to return current data
    ;(
      mockSheetsService.getValues as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(currentData)

    // Mock getHeaders to throw an error
    ;(getHeaders as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error(errorMessage)
    )

    // Execute the insert function and expect it to throw the error
    await expect(insert(params, options)).rejects.toThrow(errorMessage)

    // Assertions
    expect(mockSheetsService.getValues).toHaveBeenCalledWith(
      addSheetToRange({ sheet: 'Sheet1', range: 'A:Z' })
    )
    expect(getHeaders).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      sheets: mockSheetsService,
      spreadsheetId: 'test-spreadsheet-id'
    })
    expect(createMultipleRowsRange).not.toHaveBeenCalled()
    expect(write).not.toHaveBeenCalled()
  })

  it('should handle error when writing data', async () => {
    // Define current data in the sheet
    const currentData = [
      ['Name', 'Age'],
      ['Charlie', 40]
    ]

    // Define headers
    const headers = ['Name', 'Age']

    // Define the expected range for the new data
    const range = 'Sheet1!A3:B4'

    const errorMessage = 'Test error'

    // Mock getValues to return current data
    ;(
      mockSheetsService.getValues as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(currentData)

    // Mock getHeaders to return headers
    ;(getHeaders as ReturnType<typeof vi.fn>).mockResolvedValueOnce(headers)

    // Mock createMultipleRowsRange to return the expected range
    ;(createMultipleRowsRange as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      range
    )

    // Mock decombine to transform records into row values
    ;(decombine as ReturnType<typeof vi.fn>).mockImplementation(
      (record: { Name: string; Age: number }, headers: string[]) => {
        return [record.Name, record.Age]
      }
    )

    // Mock write to throw an error
    ;(write as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error(errorMessage)
    )

    // Execute the insert function and expect it to throw an error
    await expect(insert(params, options)).rejects.toThrow(errorMessage)

    // Assertions
    expect(mockSheetsService.getValues).toHaveBeenCalledWith(
      addSheetToRange({ sheet: 'Sheet1', range: 'A:Z' })
    )
    expect(getHeaders).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      sheets: mockSheetsService,
      spreadsheetId: 'test-spreadsheet-id'
    })
    expect(createMultipleRowsRange).toHaveBeenCalledWith({
      sheet: 'Sheet1',
      startRow: 3,
      endRow: 4,
      lastColumnIndex: 1
    })
    expect(decombine).toHaveBeenCalledTimes(2)
    expect(decombine).toHaveBeenNthCalledWith(1, options.data[0], headers)
    expect(decombine).toHaveBeenNthCalledWith(2, options.data[1], headers)
    expect(write).toHaveBeenCalledWith({
      range,
      values: [
        ['Alice', 30],
        ['Bob', 25]
      ],
      spreadsheetId: 'test-spreadsheet-id',
      sheets: mockSheetsService
    })
  })
})
