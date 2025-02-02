import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FindSheetOperation } from '@/operations/FindOperation'
import { SheetsAdapterService } from '@/types/SheetsAdapterService'
import { RecordAdapter } from '@/services/record-adapter/RecordAdapter'
import { DataTypes } from '@/types/RecordSchema.types'

describe('FindSheetOperation', () => {
  const mockSheets = (rows: any[][] = []): SheetsAdapterService =>
    ({
      getMultipleRows: vi.fn().mockResolvedValue(rows)
    }) as unknown as SheetsAdapterService

  const baseParams = {
    sheet: 'TestSheet',
    credentials: { spreadsheetId: 'test-id' },
    headerRow: 1,
    headers: [
      { header: 'name', column: 0 },
      { header: 'age', column: 1 }
    ],
    schema: [
      { key: 'name', type: DataTypes.STRING },
      { key: 'age', type: DataTypes.NUMBER, as: 'userAge' }
    ],
    sheets: mockSheets()
  }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should fetch rows and convert to records with correct parameters', async () => {
    // Arrange
    const testRows = [
      ['John', '30'],
      ['Doe', '25']
    ]
    const sheets = mockSheets(testRows)
    const operation = new FindSheetOperation({ ...baseParams, sheets }, {}, {})

    vi.spyOn(RecordAdapter, 'toRecord').mockImplementation(data => ({
      name: data[0],
      userAge: Number(data[1])
    }))

    // Act
    const result = await (operation as any).performMainAction([0, 1])

    // Assert
    expect(sheets.getMultipleRows).toHaveBeenCalledWith('TestSheet', [1, 2])
    expect(RecordAdapter.toRecord).toHaveBeenCalledTimes(2)
    expect(result).toEqual([
      { name: 'John', userAge: 30 },
      { name: 'Doe', userAge: 25 }
    ])
  })

  it('should handle empty results from sheets service', async () => {
    // Arrange
    const sheets = mockSheets([])
    const operation = new FindSheetOperation({ ...baseParams, sheets }, {}, {})

    // Act
    const result = await (operation as any).performMainAction([0])

    // Assert
    expect(result).toEqual([])
  })

  it('should propagate errors from sheets service', async () => {
    // Arrange
    const sheets = {
      getMultipleRows: vi.fn().mockRejectedValue(new Error('Sheets API error'))
    } as unknown as SheetsAdapterService

    const operation = new FindSheetOperation({ ...baseParams, sheets }, {}, {})

    // Act & Assert
    await expect((operation as any).performMainAction([0])).rejects.toThrow(
      'Sheets API error'
    )
  })

  it('should use schema aliases when converting records', async () => {
    // Arrange
    const testRows = [['John', '30']]
    const sheets = mockSheets(testRows)
    const operation = new FindSheetOperation({ ...baseParams, sheets }, {}, {})

    vi.spyOn(RecordAdapter, 'toRecord').mockReturnValue({
      userAge: 30
    })

    // Act
    const result = await (operation as any).performMainAction([0])

    // Assert
    expect(RecordAdapter.toRecord).toHaveBeenCalledWith(['John', '30'], {
      headerColumns: baseParams.headers,
      schema: baseParams.schema
    })
    expect(result).toEqual([{ userAge: 30 }])
  })

  it('should handle missing schema gracefully', async () => {
    // Arrange
    const testRows = [['John', '30']]
    const sheets = mockSheets(testRows)
    const operation = new FindSheetOperation(
      { ...baseParams, schema: null, sheets },
      {},
      {}
    )

    vi.spyOn(RecordAdapter, 'toRecord').mockReturnValue({
      name: 'John',
      age: '30' // Default to string without schema
    })

    // Act
    const result = await (operation as any).performMainAction([0])

    // Assert
    expect(RecordAdapter.toRecord).toHaveBeenCalledWith(['John', '30'], {
      headerColumns: baseParams.headers,
      schema: []
    })
    expect(result).toEqual([{ name: 'John', age: '30' }])
  })
})
