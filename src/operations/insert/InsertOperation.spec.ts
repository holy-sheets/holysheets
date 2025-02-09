import { describe, it, expect, vi, beforeEach } from 'vitest'
import InsertOperation from './InsertOperation'
import { RecordAdapter } from '@/services/record-adapter/RecordAdapter'

describe('InsertOperation', () => {
  const sheet = 'TestSheet'
  const spreadsheetId = 'spreadsheet123'
  const headers = [{ name: 'field', key: 'field' }]
  const data = [{ field: 'value1' }, { field: 'value2' }]
  const dummySchema = null

  const sheetsAdapterMock = {
    appendMultipleRows: vi.fn().mockResolvedValue(undefined)
  }

  const params = {
    sheet,
    credentials: { spreadsheetId },
    schema: dummySchema,
    headers,
    sheets: sheetsAdapterMock
  }

  const options = { data }

  beforeEach(() => {
    vi.restoreAllMocks()
    sheetsAdapterMock.appendMultipleRows.mockClear()
  })

  it('should transform records and call sheets.appendMultipleRows with transformed rows', async () => {
    const transformedRows = data.map((record, index) => ({
      transformed: record.field,
      index
    }))
    const fromRecordSpy = vi
      .spyOn(RecordAdapter, 'fromRecord')
      .mockImplementation((record, opts) => {
        const index = data.indexOf(record)
        return transformedRows[index]
      })

    const insertOperation = new InsertOperation(params, options)
    await insertOperation.executeOperation()

    // Ensure RecordAdapter.fromRecord is called once per record with the proper parameters
    expect(fromRecordSpy).toHaveBeenCalledTimes(data.length)
    data.forEach(record => {
      expect(fromRecordSpy).toHaveBeenCalledWith(record, {
        schema: dummySchema,
        headerColumns: headers
      })
    })

    // Ensure sheets.appendMultipleRows is called with the correct sheet name and transformed rows
    expect(sheetsAdapterMock.appendMultipleRows).toHaveBeenCalledWith(
      sheet,
      transformedRows
    )
  })
})
