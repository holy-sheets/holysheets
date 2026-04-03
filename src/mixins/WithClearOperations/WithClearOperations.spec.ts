import { beforeEach, describe, expect, it, vi } from 'vitest'
import HolySheets from '@/index'
import { ClearOperation } from '@/operations/clear/ClearOperation'
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

const dummyAuth = {} as any
const dummyCredentials = {
  spreadsheetId: 'dummy-spreadsheet-id',
  auth: dummyAuth
}

const dummyHeaders = [{ header: 'A', column: 0 }]

vi.mock('@/operations/clear/ClearOperation', () => {
  const mockExecute = vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }])
  return {
    ClearOperation: vi.fn().mockImplementation(() => ({
      executeOperation: mockExecute
    }))
  }
})

const setupTestEnvironment = () => {
  const instance = new HolySheets<DummyRecord>(dummyCredentials)
  instance['headerService'].getHeaders = vi.fn().mockResolvedValue(dummyHeaders)
  return instance.base('TestSheet', { headerRow: 2 })
}

describe('Clear Operations', () => {
  let instance: HolySheets<DummyRecord>
  const dummyOptions: OperationOptions<DummyRecord> = {}
  const sliceOptions: OperationOptionsWithSlice<DummyRecord> = {
    slice: [3, 5]
  }
  const dummyConfigs: OperationConfigs = { returnRecords: true }

  beforeEach(() => {
    instance = setupTestEnvironment()
    vi.clearAllMocks()
    ;(ClearOperation as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      executeOperation: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }])
    }))
  })

  it('clearMany should return records after clear operation', async () => {
    const result = await instance.clearMany(dummyOptions, dummyConfigs)
    expect(result).toEqual([{ id: 1 }, { id: 2 }])
    expect(ClearOperation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ slice: [0] }),
      dummyConfigs
    )
  })

  it('clearSlice should use provided slice', async () => {
    const result = await instance.clearSlice(sliceOptions, dummyConfigs)
    expect(result).toEqual([{ id: 1 }, { id: 2 }])
    expect(ClearOperation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ slice: [3, 5] }),
      dummyConfigs
    )
  })

  it('clearFirst should return first item and use [0, 1] slice', async () => {
    const result = await instance.clearFirst(dummyOptions, dummyConfigs)
    expect(result).toEqual({ id: 1 })
    expect(ClearOperation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ slice: [0, 1] }),
      dummyConfigs
    )
  })

  it('clearUnique should throw if more than one record is returned', async () => {
    await expect(
      instance.clearUnique(dummyOptions, dummyConfigs)
    ).rejects.toThrow(MultipleRecordsFoundForUniqueError)
  })

  it('clearUnique should return a single record when only one is returned', async () => {
    ;(ClearOperation as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      executeOperation: vi.fn().mockResolvedValue([{ id: 1 }])
    }))

    const result = await instance.clearUnique(dummyOptions, dummyConfigs)
    expect(result).toEqual({ id: 1 })
    expect(ClearOperation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ slice: [0, 2] }),
      dummyConfigs
    )
  })

  it('clearLast should return first item from [-1] slice result', async () => {
    ;(ClearOperation as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      executeOperation: vi.fn().mockResolvedValue([{ id: 99 }])
    }))

    const result = await instance.clearLast(dummyOptions, dummyConfigs)
    expect(result).toEqual({ id: 99 })
    expect(ClearOperation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ slice: [-1] }),
      dummyConfigs
    )
  })

  it('clearAll should behave like clearMany', async () => {
    const result = await instance.clearAll(dummyOptions, dummyConfigs)
    expect(result).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('clearSliceOrThrow should throw RecordNotFoundError when operation returns no records', async () => {
    ;(ClearOperation as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      executeOperation: vi.fn().mockResolvedValue([])
    }))

    await expect(
      instance.clearSliceOrThrow(sliceOptions, dummyConfigs)
    ).rejects.toThrow(RecordNotFoundError)
  })

  it('clearManyOrThrow should throw RecordNotFoundError when operation returns no records', async () => {
    ;(ClearOperation as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      executeOperation: vi.fn().mockResolvedValue([])
    }))

    await expect(
      instance.clearManyOrThrow(dummyOptions, dummyConfigs)
    ).rejects.toThrow(RecordNotFoundError)
  })

  it('clearFirstOrThrow should return first record when found', async () => {
    const result = await instance.clearFirstOrThrow(dummyOptions, dummyConfigs)
    expect(result).toEqual({ id: 1 })
  })

  it('clearFirstOrThrow should throw RecordNotFoundError when no record exists', async () => {
    ;(ClearOperation as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      executeOperation: vi.fn().mockResolvedValue([])
    }))

    await expect(
      instance.clearFirstOrThrow(dummyOptions, dummyConfigs)
    ).rejects.toThrow(RecordNotFoundError)
  })

  it('clearUniqueOrThrow should throw MultipleRecordsFoundForUniqueError for multiple results', async () => {
    await expect(
      instance.clearUniqueOrThrow(dummyOptions, dummyConfigs)
    ).rejects.toThrow(MultipleRecordsFoundForUniqueError)
  })

  it('clearUniqueOrThrow should throw RecordNotFoundError for no results', async () => {
    ;(ClearOperation as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      executeOperation: vi.fn().mockResolvedValue([])
    }))

    await expect(
      instance.clearUniqueOrThrow(dummyOptions, dummyConfigs)
    ).rejects.toThrow(RecordNotFoundError)
  })

  it('clearLastOrThrow should throw RecordNotFoundError when operation returns no records', async () => {
    ;(ClearOperation as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      executeOperation: vi.fn().mockResolvedValue([])
    }))

    await expect(
      instance.clearLastOrThrow(dummyOptions, dummyConfigs)
    ).rejects.toThrow(RecordNotFoundError)
  })

  it('clearAllOrThrow should throw RecordNotFoundError when operation returns no records', async () => {
    ;(ClearOperation as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
      executeOperation: vi.fn().mockResolvedValue([])
    }))

    await expect(
      instance.clearAllOrThrow(dummyOptions, dummyConfigs)
    ).rejects.toThrow(RecordNotFoundError)
  })
})
