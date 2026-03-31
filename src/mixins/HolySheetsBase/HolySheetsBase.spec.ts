import { describe, it, expect, vi } from 'vitest'
import HolySheets from '@/index'
import type { RecordSchema, DataTypes } from '@/types/RecordSchema.types'
import type { HolySheetsCredentials } from '@/services/google-sheets/types/credentials.type'

// Dummy record and credentials for tests
interface DummyRecord {
  id: number
  name?: string
}

const dummyCredentials: HolySheetsCredentials = {
  spreadsheetId: 'dummy-spreadsheet-id',
  auth: {} as any
}

describe('HolySheets Base', () => {
  it('base() should set up the sheet and headerRow correctly', () => {
    const instance = new HolySheets<DummyRecord>(dummyCredentials)
    instance.base('MinhaSheet', { headerRow: 3 })
    expect(instance.sheet).toBe('MinhaSheet')
    expect(instance.headerRow).toBe(3)
  })

  it('defineSchema() should store the schema in the instance', () => {
    const instance = new HolySheets<DummyRecord>(dummyCredentials)
    const dummySchema: RecordSchema<DummyRecord> = [
      { key: 'id', dataType: 'number' as DataTypes },
      { key: 'name', dataType: 'string' as DataTypes }
    ]
    instance.defineSchema(dummySchema)
    expect(instance['schema']).toEqual(dummySchema)
  })

  it('getHeaders() should return the header columns correctly', async () => {
    const instance = new HolySheets<DummyRecord>(dummyCredentials)
    instance.base('MinhaSheet', { headerRow: 2 })
    const dummyHeaders = [
      { name: 'id', column: 'A' },
      { name: 'name', column: 'B' }
    ]
    // Substitute headerService.getHeaders with a fake implementation
    instance['headerService'].getHeaders = vi
      .fn()
      .mockResolvedValue(dummyHeaders)

    const headers = await instance.getHeaders()
    expect(headers).toEqual(dummyHeaders)
    expect(instance['headerService'].getHeaders).toHaveBeenCalledWith(
      dummyCredentials.spreadsheetId,
      'MinhaSheet',
      2
    )
  })
})
