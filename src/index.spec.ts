import { describe, it, expect, beforeEach, vi } from 'vitest'
import HolySheets from './index'
import { FindOperation } from '@/operations/find/FindOperation'
import { ClearSheetOperation } from '@/operations/clear/ClearOperation'
import { MultipleRecordsFoundForUniqueError } from '@/errors/MultipleRecordsFoundForUniqueError'
import type {
  OperationOptions,
  OperationConfigs
} from '@/operations/types/BaseOperation.types'
import type { RecordSchema, DataTypes } from '@/types/RecordSchema.types'
import { RecordNotFoundError } from '@/errors/RecordNotFoundError'

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
    FindOperation: vi.fn().mockImplementation(() => ({
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
      ;(FindOperation as vi.Mock).mockImplementation(() => ({
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

describe('HolySheets OrThrow find operations', () => {
  let instance: HolySheets<DummyRecord>
  const dummyOptions: OperationOptions<DummyRecord> = {}
  const dummyConfigs: OperationConfigs = {}

  beforeEach(() => {
    instance = setupTestEnvironment()
  })

  describe('findManyOrThrow', () => {
    let mockExecute: ReturnType<typeof vi.fn>

    beforeEach(() => {
      mockExecute = vi.fn()
      ;(FindOperation as vi.Mock).mockImplementation(() => ({
        executeOperation: mockExecute
      }))
    })

    it('should return an array of records when records are found', async () => {
      mockExecute.mockResolvedValue([{ id: 1 }, { id: 2 }])
      const result = await instance.findManyOrThrow(dummyOptions, dummyConfigs)
      expect(mockExecute).toHaveBeenCalled()
      expect(result).toEqual([{ id: 1 }, { id: 2 }])
    })

    it('should throw RecordNotFoundError when no records are found', async () => {
      mockExecute.mockResolvedValue([])
      await expect(
        instance.findManyOrThrow(dummyOptions, dummyConfigs)
      ).rejects.toBeInstanceOf(RecordNotFoundError)
    })
  })

  describe('findFirstOrThrow', () => {
    let mockExecute: ReturnType<typeof vi.fn>

    beforeEach(() => {
      mockExecute = vi.fn()
      ;(FindOperation as vi.Mock).mockImplementation(() => ({
        executeOperation: mockExecute
      }))
    })

    it('should return the first record when records are found', async () => {
      mockExecute.mockResolvedValue([{ id: 1 }, { id: 2 }])
      const result = await instance.findFirstOrThrow(dummyOptions, dummyConfigs)
      expect(mockExecute).toHaveBeenCalled()
      expect(result).toEqual({ id: 1 })
    })

    it('should throw RecordNotFoundError when no record is found', async () => {
      mockExecute.mockResolvedValue([])
      await expect(
        instance.findFirstOrThrow(dummyOptions, dummyConfigs)
      ).rejects.toBeInstanceOf(RecordNotFoundError)
    })
  })

  describe('findUniqueOrThrow', () => {
    let mockExecute: ReturnType<typeof vi.fn>

    beforeEach(() => {
      mockExecute = vi.fn()
      ;(FindOperation as vi.Mock).mockImplementation(() => ({
        executeOperation: mockExecute
      }))
    })

    it('should return the unique record when exactly one record is found', async () => {
      mockExecute.mockResolvedValue([{ id: 1 }])
      const result = await instance.findUniqueOrThrow(
        dummyOptions,
        dummyConfigs
      )
      expect(mockExecute).toHaveBeenCalled()
      expect(result).toEqual({ id: 1 })
    })

    it('should throw MultipleRecordsFoundForUniqueError when multiple records are found', async () => {
      mockExecute.mockResolvedValue([{ id: 1 }, { id: 2 }])
      await expect(
        instance.findUniqueOrThrow(dummyOptions, dummyConfigs)
      ).rejects.toBeInstanceOf(MultipleRecordsFoundForUniqueError)
    })

    it('should throw RecordNotFoundError when no records are found', async () => {
      mockExecute.mockResolvedValue([])
      await expect(
        instance.findUniqueOrThrow(dummyOptions, dummyConfigs)
      ).rejects.toBeInstanceOf(RecordNotFoundError)
    })
  })

  describe('findAllOrThrow', () => {
    let mockExecute: ReturnType<typeof vi.fn>

    beforeEach(() => {
      mockExecute = vi.fn()
      ;(FindOperation as vi.Mock).mockImplementation(() => ({
        executeOperation: mockExecute
      }))
    })

    it('should return all records when records are found', async () => {
      mockExecute.mockResolvedValue([{ id: 1 }, { id: 2 }])
      const result = await instance.findAllOrThrow(dummyOptions, dummyConfigs)
      expect(mockExecute).toHaveBeenCalled()
      expect(result).toEqual([{ id: 1 }, { id: 2 }])
    })

    it('should throw RecordNotFoundError when no records are found', async () => {
      mockExecute.mockResolvedValue([])
      await expect(
        instance.findAllOrThrow(dummyOptions, dummyConfigs)
      ).rejects.toBeInstanceOf(RecordNotFoundError)
    })
  })

  describe('findLastOrThrow', () => {
    let mockExecute: ReturnType<typeof vi.fn>

    beforeEach(() => {
      mockExecute = vi.fn()
      ;(FindOperation as vi.Mock).mockImplementation(() => ({
        executeOperation: mockExecute
      }))
    })

    it('should return the last record when records are found', async () => {
      mockExecute.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }])
      const result = await instance.findLastOrThrow(dummyOptions, dummyConfigs)
      expect(mockExecute).toHaveBeenCalled()
      expect(result).toEqual({ id: 3 })
    })

    it('should throw RecordNotFoundError when no record is found', async () => {
      mockExecute.mockResolvedValue([])
      await expect(
        instance.findLastOrThrow(dummyOptions, dummyConfigs)
      ).rejects.toBeInstanceOf(RecordNotFoundError)
    })
  })
})
