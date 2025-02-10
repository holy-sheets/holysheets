import { describe, it, expect, beforeEach, vi } from 'vitest'
import HolySheets from '@/index'
import { FindOperation } from '@/operations/find/FindOperation'
import { MultipleRecordsFoundForUniqueError } from '@/errors/MultipleRecordsFoundForUniqueError'
import { RecordNotFoundError } from '@/errors/RecordNotFoundError'
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

vi.mock('@/operations/find/FindOperation', () => {
  const mockExecute = vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }])
  return {
    FindOperation: vi.fn().mockImplementation(() => ({
      executeOperation: mockExecute
    }))
  }
})

const setupTestEnvironment = () => {
  const instance = new HolySheets<DummyRecord>(dummyCredentials)
  instance['headerService'].getHeaders = vi.fn().mockResolvedValue(dummyHeaders)
  return instance.base('TestSheet', { headerRow: 2 })
}

describe('WithFindOperations OrThrow', () => {
  let instance: HolySheets<DummyRecord>
  const dummyOptions: OperationOptions<DummyRecord> = {}
  const dummyConfigs: OperationConfigs = {}

  beforeEach(() => {
    instance = setupTestEnvironment()
  })

  it('findManyOrThrow should return records if found', async () => {
    const result = await instance.findManyOrThrow(dummyOptions, dummyConfigs)
    expect(result).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('findManyOrThrow should throw RecordNotFoundError if no record is found', async () => {
    ;(FindOperation as vi.Mock).mockImplementationOnce(() => ({
      executeOperation: vi.fn().mockResolvedValue([])
    }))
    await expect(
      instance.findManyOrThrow(dummyOptions, dummyConfigs)
    ).rejects.toBeInstanceOf(RecordNotFoundError)
  })

  it('findFirstOrThrow should return the first record if found', async () => {
    const result = await instance.findFirstOrThrow(dummyOptions, dummyConfigs)
    expect(result).toEqual({ id: 1 })
  })

  it('findFirstOrThrow should throw RecordNotFoundError if no record is found', async () => {
    ;(FindOperation as vi.Mock).mockImplementationOnce(() => ({
      executeOperation: vi.fn().mockResolvedValue([])
    }))
    await expect(
      instance.findFirstOrThrow(dummyOptions, dummyConfigs)
    ).rejects.toBeInstanceOf(RecordNotFoundError)
  })

  it('findUniqueOrThrow should throw MultipleRecordsFoundForUniqueError if more than one record is found', async () => {
    await expect(
      instance.findUniqueOrThrow(dummyOptions, dummyConfigs)
    ).rejects.toBeInstanceOf(MultipleRecordsFoundForUniqueError)
  })

  it('findUniqueOrThrow should throw RecordNotFoundError if no record is found', async () => {
    ;(FindOperation as vi.Mock).mockImplementationOnce(() => ({
      executeOperation: vi.fn().mockResolvedValue([])
    }))
    await expect(
      instance.findUniqueOrThrow(dummyOptions, dummyConfigs)
    ).rejects.toBeInstanceOf(RecordNotFoundError)
  })

  it('findLastOrThrow should return the last record if found', async () => {
    ;(FindOperation as vi.Mock).mockImplementationOnce(() => ({
      executeOperation: vi
        .fn()
        .mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }])
    }))
    const result = await instance.findLastOrThrow(dummyOptions, dummyConfigs)
    expect(result).toEqual({ id: 3 })
  })

  it('findLastOrThrow should throw RecordNotFoundError if no record is found', async () => {
    ;(FindOperation as vi.Mock).mockImplementationOnce(() => ({
      executeOperation: vi.fn().mockResolvedValue([])
    }))
    await expect(
      instance.findLastOrThrow(dummyOptions, dummyConfigs)
    ).rejects.toBeInstanceOf(RecordNotFoundError)
  })
})
