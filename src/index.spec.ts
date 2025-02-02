import { describe, it, expect, beforeEach, vi } from 'vitest'
import HolySheets from './index'
import { FindSheetOperation } from '@/operations/find/FindOperation'
import { ClearSheetOperation } from '@/operations/clear/ClearOperation'
import { MultipleRecordsFoundForUniqueError } from '@/errors/MultipleRecordsFoundForUniqueError'
import type {
  OperationOptions,
  OperationConfigs
} from '@/operations/types/BaseOperation.types'
import type { RecordSchema, DataTypes } from '@/types/RecordSchema.types'

// Test record type
interface DummyRecord {
  id: number
  name?: string
}

// Dummy credentials and auth
const dummyAuth = {} as any
const dummyCredentials = {
  spreadsheetId: 'dummy-spreadsheet-id',
  auth: dummyAuth
}

// Dummy headers returned by HeaderService
const dummyHeaders = [{ header: 'A', column: 0 }]

// Mock operations
vi.mock('@/operations/find/FindOperation', () => {
  const mockExecute = vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }])
  return {
    FindSheetOperation: vi.fn().mockImplementation(() => ({
      executeOperation: mockExecute
    }))
  }
})

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
  instance['headerService'].getHeaders = vi.fn().mockResolvedValue(dummyHeaders)
  return instance.base('TestSheet', { headerRow: 2 })
}

describe('HolySheets', () => {
  let instance: HolySheets<DummyRecord>
  const dummyOptions: OperationOptions<DummyRecord> = {}
  const dummyConfigs: OperationConfigs = {}

  beforeEach(() => {
    instance = setupTestEnvironment()
  })

  describe('base()', () => {
    it('should create new instance with provided table and headerRow', () => {
      const newInstance = instance.base('NewSheet', { headerRow: 5 })
      expect(newInstance).toBeInstanceOf(HolySheets)
      expect(newInstance.sheet).toBe('NewSheet')
    })
  })

  describe('defineSchema()', () => {
    it('should set and store schema in instance', () => {
      const dummySchema: RecordSchema<DummyRecord> = [
        { key: 'id', dataType: 'number' as DataTypes },
        { key: 'name', dataType: 'string' as DataTypes }
      ]
      const result = instance.defineSchema(dummySchema)
      expect(result).toBe(instance)
      expect(instance['schema']).toEqual(dummySchema)
    })
  })

  describe('find operations', () => {
    let mockExecute: ReturnType<typeof vi.fn>

    beforeEach(() => {
      mockExecute = vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }])
      ;(FindSheetOperation as vi.Mock).mockImplementation(() => ({
        executeOperation: mockExecute
      }))
    })

    it('findMany should return array of records', async () => {
      const result = await instance.findMany(dummyOptions, dummyConfigs)
      expect(mockExecute).toHaveBeenCalled()
      expect(result).toEqual([{ id: 1 }, { id: 2 }])
    })

    it('findFirst should return first record from array', async () => {
      const result = await instance.findFirst(dummyOptions, dummyConfigs)
      expect(mockExecute).toHaveBeenCalled()
      expect(result).toEqual({ id: 1 })
    })

    it('findUnique should return single record when only one found', async () => {
      mockExecute.mockResolvedValueOnce([{ id: 1 }])
      const result = await instance.findUnique(dummyOptions, dummyConfigs)
      expect(mockExecute).toHaveBeenCalled()
      expect(result).toEqual({ id: 1 })
    })

    it('findUnique should throw MultipleRecordsFoundForUniqueError when multiple records found', async () => {
      await expect(
        instance.findUnique(dummyOptions, dummyConfigs)
      ).rejects.toBeInstanceOf(MultipleRecordsFoundForUniqueError)
    })

    it('findAll should return all found records', async () => {
      const result = await instance.findAll(dummyOptions, dummyConfigs)
      expect(mockExecute).toHaveBeenCalled()
      expect(result).toEqual([{ id: 1 }, { id: 2 }])
    })

    it('findLast should return last record from array', async () => {
      mockExecute.mockResolvedValueOnce([{ id: 1 }, { id: 2 }, { id: 3 }])
      const result = await instance.findLast(dummyOptions, dummyConfigs)
      expect(mockExecute).toHaveBeenCalled()
      expect(result).toEqual({ id: 3 })
    })
  })

  describe('clear operations', () => {
    let mockExecute: ReturnType<typeof vi.fn>

    beforeEach(() => {
      mockExecute = vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }])
      ;(ClearSheetOperation as vi.Mock).mockImplementation(() => ({
        executeOperation: mockExecute
      }))
    })

    it('clearMany should return records after clear operation', async () => {
      const result = await instance.clearMany(dummyOptions, dummyConfigs)
      expect(mockExecute).toHaveBeenCalled()
      expect(result).toEqual([{ id: 1 }, { id: 2 }])
    })
  })
})
