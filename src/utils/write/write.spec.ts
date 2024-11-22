import { describe, it, expect, vi, beforeEach } from 'vitest'
import { write } from './write'
import { sheets_v4 } from 'googleapis'

describe('write', () => {
  // Mock sheets.spreadsheets.values.batchUpdate
  const batchUpdateMock = vi.fn().mockResolvedValue({})

  const sheetsMock: sheets_v4.Sheets = {
    spreadsheets: {
      values: {
        batchUpdate: batchUpdateMock
      }
    }
  } as unknown as sheets_v4.Sheets

  const spreadsheetId = 'test-spreadsheet-id'

  // Limpa todos os mocks antes de cada teste
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call batchUpdate with the correct parameters when tableName is provided', async () => {
    const options = {
      range: 'Sheet1!A1:B2',
      spreadsheetId,
      values: [
        ['value1', 'value2'],
        ['value3', 'value4']
      ],
      sheets: sheetsMock
    }

    await write(options)

    expect(batchUpdateMock).toHaveBeenCalledTimes(1)
    expect(batchUpdateMock).toHaveBeenCalledWith({
      spreadsheetId,
      resource: {
        data: [
          {
            range: 'Sheet1!A1:B2',
            values: [
              ['value1', 'value2'],
              ['value3', 'value4']
            ]
          }
        ],
        valueInputOption: 'RAW'
      }
    })
  })

  it('should call batchUpdate with the correct parameters when tableName is not provided', async () => {
    const options = {
      range: 'A1:B2',
      spreadsheetId,
      values: [
        ['value1', 'value2'],
        ['value3', 'value4']
      ],
      sheets: sheetsMock
    }

    await write(options)

    expect(batchUpdateMock).toHaveBeenCalledTimes(1)
    expect(batchUpdateMock).toHaveBeenCalledWith({
      spreadsheetId,
      resource: {
        data: [
          {
            range: 'A1:B2',
            values: [
              ['value1', 'value2'],
              ['value3', 'value4']
            ]
          }
        ],
        valueInputOption: 'RAW'
      }
    })
  })

  it('should log success message when batchUpdate is called successfully', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log')
    const options = {
      tableName: 'Sheet1',
      range: 'A1:B2',
      spreadsheetId,
      values: [
        ['value1', 'value2'],
        ['value3', 'value4']
      ],
      sheets: sheetsMock
    }

    await write(options)

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[INSERT] Row inserted successfully'
    )
  })

  it('should throw an error and log error message when batchUpdate fails', async () => {
    const error = new Error('Batch update failed')
    batchUpdateMock.mockRejectedValueOnce(error)
    const consoleErrorSpy = vi.spyOn(console, 'error')

    const options = {
      tableName: 'Sheet1',
      range: 'A1:B2',
      spreadsheetId,
      values: [
        ['value1', 'value2'],
        ['value3', 'value4']
      ],
      sheets: sheetsMock
    }

    await expect(write(options)).rejects.toThrow('Batch update failed')
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[INSERT] Error: Error: Batch update failed'
    )
  })
})
