import { beforeEach, describe, expect, it, vi } from 'vitest'
import HolySheets from '@/index'
import { DeleteOperation } from '@/operations/delete/DeleteOperation'
import { MultipleRecordsFoundForUniqueError } from '@/errors/MultipleRecordsFoundForUniqueError'
import { RecordNotFoundError } from '@/errors/RecordNotFoundError'
import type {
  OperationOptions,
  OperationConfigs,
  OperationOptionsWithSlice
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
  const sliceOptions: OperationOptionsWithSlice<DummyRecord> = {
    slice: [2, 4]
  }
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

  it('deleteSlice should use provided slice', async () => {
    const result = await instance.deleteSlice(sliceOptions, dummyConfigs)
    expect(result).toEqual([{ id: 1 }, { id: 2 }])
    expect(DeleteOperation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ slice: [2, 4] }),
      dummyConfigs
    )
  })

  it('deleteSliceOrThrow should use provided slice and throw when empty', async () => {
    ;(DeleteOperation as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      executeOperation: vi.fn().mockResolvedValue([])
    }))

    await expect(
      instance.deleteSliceOrThrow(sliceOptions, dummyConfigs)
    ).rejects.toThrow(RecordNotFoundError)
    expect(DeleteOperation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ slice: [2, 4] }),
      dummyConfigs
    )
  })

  it('deleteManyOrThrow should throw RecordNotFoundError when no records are returned', async () => {
    ;(DeleteOperation as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      executeOperation: vi.fn().mockResolvedValue([])
    }))

    await expect(
      instance.deleteManyOrThrow(dummyOptions, dummyConfigs)
    ).rejects.toThrow(RecordNotFoundError)
  })

  it('deleteFirstOrThrow should return first record when found', async () => {
    const result = await instance.deleteFirstOrThrow(dummyOptions, dummyConfigs)
    expect(result).toEqual({ id: 1 })
  })

  it('deleteFirstOrThrow should throw RecordNotFoundError when empty', async () => {
    ;(DeleteOperation as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      executeOperation: vi.fn().mockResolvedValue([])
    }))

    await expect(
      instance.deleteFirstOrThrow(dummyOptions, dummyConfigs)
    ).rejects.toThrow(RecordNotFoundError)
  })

  it('deleteUniqueOrThrow should throw for multiple results', async () => {
    await expect(
      instance.deleteUniqueOrThrow(dummyOptions, dummyConfigs)
    ).rejects.toThrow(MultipleRecordsFoundForUniqueError)
  })

  it('deleteUniqueOrThrow should throw RecordNotFoundError when empty', async () => {
    ;(DeleteOperation as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      executeOperation: vi.fn().mockResolvedValue([])
    }))

    await expect(
      instance.deleteUniqueOrThrow(dummyOptions, dummyConfigs)
    ).rejects.toThrow(RecordNotFoundError)
  })

  it('deleteLastOrThrow should throw RecordNotFoundError when empty', async () => {
    ;(DeleteOperation as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      executeOperation: vi.fn().mockResolvedValue([])
    }))

    await expect(
      instance.deleteLastOrThrow(dummyOptions, dummyConfigs)
    ).rejects.toThrow(RecordNotFoundError)
  })

  it('deleteAllOrThrow should throw RecordNotFoundError when empty', async () => {
    ;(DeleteOperation as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      executeOperation: vi.fn().mockResolvedValue([])
    }))

    await expect(
      instance.deleteAllOrThrow(dummyOptions, dummyConfigs)
    ).rejects.toThrow(RecordNotFoundError)
  })
})
