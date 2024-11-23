import { describe, it, expect, vi, beforeEach } from 'vitest'
import { write } from './write'
import { IGoogleSheetsService } from '@/services/google-sheets/IGoogleSheetsService'
import { CellValue } from '@/types/cellValue'

/**
 * Mock implementation of IGoogleSheetsService for testing purposes.
 */
const mockSheets: IGoogleSheetsService = {
  getValues: vi.fn(),
  updateValues: vi.fn(),
  batchUpdateValues: vi.fn(),
  clearValues: vi.fn(),
  deleteRows: vi.fn()
}

describe('write', () => {
  const spreadsheetId = 'test-spreadsheet-id'

  // Reset all mocks before each test to ensure isolation
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should call batchUpdateValues with the correct parameters', async () => {
    const options = {
      range: 'Sheet1!A1:B2',
      spreadsheetId,
      values: [
        ['value1', 'value2'],
        ['value3', 'value4']
      ] as CellValue[][],
      sheets: mockSheets
    }

    await write(options)

    expect(mockSheets.batchUpdateValues).toHaveBeenCalledTimes(1)
    expect(mockSheets.batchUpdateValues).toHaveBeenCalledWith(
      [
        {
          range: 'Sheet1!A1:B2',
          values: [
            ['value1', 'value2'],
            ['value3', 'value4']
          ]
        }
      ],
      'RAW'
    )
  })

  it('should log success message when batchUpdateValues is called successfully', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const options = {
      range: 'Sheet1!A1:B2',
      spreadsheetId,
      values: [
        ['value1', 'value2'],
        ['value3', 'value4']
      ] as CellValue[][],
      sheets: mockSheets
    }

    await write(options)

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[INSERT] Row inserted successfully'
    )

    // Restore the original console.log implementation
    consoleLogSpy.mockRestore()
  })

  it('should throw an error and log error message when batchUpdateValues fails', async () => {
    const error = new Error('Batch update failed')
    ;(
      mockSheets.batchUpdateValues as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(error)

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    const options = {
      range: 'Sheet1!A1:B2',
      spreadsheetId,
      values: [
        ['value1', 'value2'],
        ['value3', 'value4']
      ] as CellValue[][],
      sheets: mockSheets
    }

    await expect(write(options)).rejects.toThrow('Batch update failed')
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `[INSERT] Error: ${error.message}`
    )

    // Restore the original console.error implementation
    consoleErrorSpy.mockRestore()
  })
})
