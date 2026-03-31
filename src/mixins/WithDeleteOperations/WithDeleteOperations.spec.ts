import { describe, it, expect, beforeEach, vi } from 'vitest'
import HolySheets from '@/index'
import { DeleteOperation } from '@/operations/delete/DeleteOperation'
import { MultipleRecordsFoundForUniqueError } from '@/errors/MultipleRecordsFoundForUniqueError'
import type {
  OperationOptions,
  OperationConfigs
} from '@/operations/types/BaseOperation.types'

interface DummyRecord {
  id: number
  name?: string
}

const dummyCredentials = {
  spreadsheetId: 'dummy-spreadsheet-id',
  auth: {} as any
}
const dummyHeaders = [{ header: 'id', column: 0 }]

vi.mock('@/operations/delete/DeleteOperation', () => {
  const mockExecute = vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }])
  return {
    DeleteOperation: vi.fn().mockImplementation(() => ({
      executeOperation: mockExecute
    }))
  }
})

const setupTestEnvironment = () => {
  const instance = new HolySheets<DummyRecord>(dummyCredentials)
  instance['headerService'].getHeaders = vi.fn().mockResolvedValue(dummyHeaders)
  return instance.base('TestSheet', { headerRow: 2 })
}

describe('WithDeleteOperations', () => {
  let instance: HolySheets<DummyRecord>
  const dummyOptions: OperationOptions<DummyRecord> = {}
  const dummyConfigs: OperationConfigs = { returnRecords: true }

  beforeEach(() => {
    instance = setupTestEnvironment()
    vi.clearAllMocks()
    ;(DeleteOperation as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      executeOperation: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }])
    }))
  })

  it('deleteMany should return an array of records', async () => {
    const result = await instance.deleteMany(dummyOptions, dummyConfigs)
    expect(result).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('deleteFirst should return the first record', async () => {
    const result = await instance.deleteFirst(dummyOptions, dummyConfigs)
    expect(result).toEqual({ id: 1 })
  })

  it('deleteUnique should throw if more than one record returned', async () => {
    await expect(
      instance.deleteUnique(dummyOptions, dummyConfigs)
    ).rejects.toThrow(MultipleRecordsFoundForUniqueError)
  })

  it('deleteUnique should return a single record', async () => {
    ;(DeleteOperation as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      executeOperation: vi.fn().mockResolvedValue([{ id: 1 }])
    }))
    const result = await instance.deleteUnique(dummyOptions, dummyConfigs)
    expect(result).toEqual({ id: 1 })
  })

  it('deleteLast should return the last record', async () => {
    const result = await instance.deleteLast(dummyOptions, dummyConfigs)
    expect(result).toEqual({ id: 1 })
  })

  it('deleteAll should return all records', async () => {
    const result = await instance.deleteAll(dummyOptions, dummyConfigs)
    expect(result).toEqual([{ id: 1 }, { id: 2 }])
  })
})
