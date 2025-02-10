import { describe, it, expect, beforeEach, vi } from 'vitest'
import HolySheets from '@/index'
import type {
  OperationOptions,
  OperationConfigs
} from '@/operations/types/BaseOperation.types'

interface DummyRecord {
  id: number
  name?: string
}

const dummyAuth = {} as any
const dummyCredentials = {
  spreadsheetId: 'dummy-spreadsheet-id',
  auth: dummyAuth
}

// Dummy headers returned by HeaderService
const dummyHeaders = [{ header: 'A', column: 0 }]

// Mock ClearSheetOperation
vi.mock('@/operations/clear/ClearOperation', () => {
  const mockExecute = vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }])
  return {
    ClearSheetOperation: vi.fn().mockImplementation(() => ({
      executeOperation: mockExecute
    }))
  }
})

// Test setup utility
const setupTestEnvironment = () => {
  const instance = new HolySheets<DummyRecord>(dummyCredentials)
  // Override getHeaders to return dummyHeaders
  instance['headerService'].getHeaders = vi.fn().mockResolvedValue(dummyHeaders)
  return instance.base('TestSheet', { headerRow: 2 })
}

describe('Clear Operations', () => {
  let instance: HolySheets<DummyRecord>
  const dummyOptions: OperationOptions<DummyRecord> = {}
  const dummyConfigs: OperationConfigs = {}

  beforeEach(() => {
    instance = setupTestEnvironment()
  })

  it('clearMany should return records after clear operation', async () => {
    const result = await instance.clearMany(dummyOptions, dummyConfigs)
    expect(result).toEqual([{ id: 1 }, { id: 2 }])
  })
})
