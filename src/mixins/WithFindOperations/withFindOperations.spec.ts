import { describe, it, expect, beforeEach, vi } from 'vitest'
import HolySheets from '@/index'
import { FindOperation } from '@/operations/find/FindOperation'
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
const dummyHeaders = [{ header: 'A', column: 0 }]

// Mock of the find operation
vi.mock('@/operations/find/FindOperation', () => {
  const mockExecute = vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }])
  return {
    FindOperation: vi.fn().mockImplementation(() => ({
      executeOperation: mockExecute
    }))
  }
})

// Helper function to set up the test environment
const setupTestEnvironment = () => {
  const instance = new HolySheets<DummyRecord>(dummyCredentials)
  // Mock the getHeaders method to return dummyHeaders
  instance['headerService'].getHeaders = vi.fn().mockResolvedValue(dummyHeaders)
  return instance.base('TestSheet', { headerRow: 2 })
}

describe('WithFindOperations', () => {
  let instance: HolySheets<DummyRecord>
  const dummyOptions: OperationOptions<DummyRecord> = {}
  const dummyConfigs: OperationConfigs = {}

  beforeEach(() => {
    instance = setupTestEnvironment()
  })

  it('findMany should return an array of records', async () => {
    const result = await instance.findMany(dummyOptions, dummyConfigs)
    expect(result).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('findFirst should return the first record', async () => {
    const result = await instance.findFirst(dummyOptions, dummyConfigs)
    expect(result).toEqual({ id: 1 })
  })

  it('findUnique should return a unique record if there is only one', async () => {
    // Change the mock to return only one record
    ;(FindOperation as vi.Mock).mockImplementationOnce(() => ({
      executeOperation: vi.fn().mockResolvedValue([{ id: 1 }])
    }))
    const result = await instance.findUnique(dummyOptions, dummyConfigs)
    expect(result).toEqual({ id: 1 })
  })

  it('findUnique should throw MultipleRecordsFoundForUniqueError if there is more than one record', async () => {
    await expect(
      instance.findUnique(dummyOptions, dummyConfigs)
    ).rejects.toBeInstanceOf(MultipleRecordsFoundForUniqueError)
  })

  it('findLast should return the last record', async () => {
    ;(FindOperation as vi.Mock).mockImplementationOnce(() => ({
      executeOperation: vi
        .fn()
        .mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }])
    }))
    const result = await instance.findLast(dummyOptions, dummyConfigs)
    expect(result).toEqual({ id: 3 })
  })
})
