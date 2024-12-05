import { describe, it, expect, vi, beforeEach } from 'vitest'
import { insert, InsertParams } from './insert'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { getHeaders } from '@/utils/headers/headers'
import { write } from '@/utils/write/write'
import {
  addSheetToRange,
  createMultipleRowsRange
} from '@/utils/rangeUtils/rangeUtils'
import { decombine } from '@/utils/dataUtils/dataUtils'
import { CellValue } from '@/types/cellValue'
import { MetadataService } from '@/services/metadata/MetadataService'
import { IMetadataService } from '@/services/metadata/IMetadataService'

// Mock the utility modules and services
vi.mock('@/utils/headers/headers')
vi.mock('@/utils/write/write')
vi.mock('@/utils/rangeUtils/rangeUtils')
vi.mock('@/utils/dataUtils/dataUtils')
vi.mock('@/services/metadata/MetadataService')

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

  let metadataInstance: {
    calculateDuration: ReturnType<typeof vi.fn>
    createMetadata: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()

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
  })

  it('should insert records into the spreadsheet and return metadata when includeMetadata is true', async () => {
    // Define current data in the sheet
    const currentData = [
      ['Name', 'Age'],
      ['Charlie', 40]
    ]

    // Define headers
    const headers = [
      { name: 'Name', column: 'A' },
      { name: 'Age', column: 'B' }
    ]

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

    // Execute the insert function with includeMetadata = true
    const result = await insert(params, options, { includeMetadata: true })

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

    // Verify the result
    expect(result).toEqual({
      data: options.data,
      row: [3, 4],
      range: range,
      metadata: {
        operationId: 'test-operation-id',
        timestamp: '2023-01-01T00:00:00.000Z',
        duration: '50ms',
        recordsAffected: 2,
        status: 'success',
        operationType: 'insert',
        spreadsheetId: 'test-spreadsheet-id',
        sheetId: 'Sheet1',
        ranges: [range],
        error: undefined,
        userId: undefined
      }
    })
  })
})
