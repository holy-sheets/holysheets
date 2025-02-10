import { describe, it, expect, beforeEach, vi } from 'vitest'
import HolySheets from '@/index'
import type { InsertOperationOptions } from '@/operations/types/BaseOperation.types'

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

// Mock InsertOperation
vi.mock('@/operations/insert/InsertOperation', () => {
  const mockExecute = vi.fn().mockResolvedValue(undefined)
  return {
    default: vi.fn().mockImplementation(() => ({
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

describe('Insert Operations', () => {
  let instance: HolySheets<DummyRecord>
  const dummyInsertOptions: InsertOperationOptions<Partial<DummyRecord>> = {}

  beforeEach(() => {
    instance = setupTestEnvironment()
  })

  it('insert should call executeOperation and return an empty array', async () => {
    const result = await instance.insert(dummyInsertOptions)
    expect(result).toEqual([])
  })
})
