import { describe, it, expect } from 'vitest'
import { parseRecords } from './parseRecords'
import { RecordAdapter } from '@/services/record-adapter/RecordAdapter'
import type { HeaderColumn } from '@/services/header/HeaderService.types'
import type { RecordSchema } from '@/types/RecordSchema.types'

// Mock the RecordAdapter
vi.mock('@/services/record-adapter/RecordAdapter', () => ({
  RecordAdapter: {
    toRecord: vi.fn()
  }
}))

describe('parseRecords', () => {
  it('should convert rows to records using the provided headers and schema', () => {
    const rows = [
      ['value1', 'value2'],
      ['value3', 'value4']
    ]
    const headers: HeaderColumn[] = [
      { name: 'column1', index: 0 },
      { name: 'column2', index: 1 }
    ]
    const schema: RecordSchema<{ column1: string; column2: string }> = [
      { name: 'column1', type: 'string' },
      { name: 'column2', type: 'string' }
    ]

    const expectedRecords = [
      { column1: 'value1', column2: 'value2' },
      { column1: 'value3', column2: 'value4' }
    ]

    // Mock the toRecord method to return the expected records
    RecordAdapter.toRecord.mockImplementation((row, { headerColumns }) => {
      const record: any = {}
      headerColumns.forEach((header, index) => {
        record[header.name] = row[index]
      })
      return record
    })

    const result = parseRecords(rows, headers, schema)
    expect(result).toEqual(expectedRecords)
  })

  it('should handle empty rows array', () => {
    const rows: string[][] = []
    const headers: HeaderColumn[] = [
      { name: 'column1', index: 0 },
      { name: 'column2', index: 1 }
    ]
    const schema: RecordSchema<{ column1: string; column2: string }> = [
      { name: 'column1', type: 'string' },
      { name: 'column2', type: 'string' }
    ]

    const result = parseRecords(rows, headers, schema)
    expect(result).toEqual([])
  })

  it('should handle empty schema', () => {
    const rows = [
      ['value1', 'value2'],
      ['value3', 'value4']
    ]
    const headers: HeaderColumn[] = [
      { name: 'column1', index: 0 },
      { name: 'column2', index: 1 }
    ]

    const expectedRecords = [
      { column1: 'value1', column2: 'value2' },
      { column1: 'value3', column2: 'value4' }
    ]

    // Mock the toRecord method to return the expected records
    RecordAdapter.toRecord.mockImplementation((row, { headerColumns }) => {
      const record: any = {}
      headerColumns.forEach((header, index) => {
        record[header.name] = row[index]
      })
      return record
    })

    const result = parseRecords(rows, headers)
    expect(result).toEqual(expectedRecords)
  })
})
