import { describe, it, expect, beforeEach, vi } from 'vitest'
import HolySheets from '@/index'
import { UpdateOperation } from '@/operations/update/UpdateOperation'
import { MultipleRecordsFoundForUniqueError } from '@/errors/MultipleRecordsFoundForUniqueError'
import { RecordNotFoundError } from '@/errors/RecordNotFoundError'
import type { OperationConfigs } from '@/operations/types/BaseOperation.types'

interface DummyRecord {
  id: number
  name: string
}

const dummyCredentials = {
  spreadsheetId: 'dummy-spreadsheet-id',
  auth: {} as any
}
const dummyHeaders = [
  { header: 'id', column: 0 },
  { header: 'name', column: 1 }
]

vi.mock('@/operations/update/UpdateOperation', () => {
  const mockExecute = vi.fn().mockResolvedValue([{ id: 1, name: 'Updated' }])
  return {
    UpdateOperation: vi.fn().mockImplementation(() => ({
      executeOperation: mockExecute
    }))
  }
})

const setupTestEnvironment = () => {
  const instance = new HolySheets<DummyRecord>(dummyCredentials)
  instance['headerService'].getHeaders = vi.fn().mockResolvedValue(dummyHeaders)
  return instance.base('TestSheet', { headerRow: 1 })
}

describe('WithUpdateOperations', () => {
  let instance: HolySheets<DummyRecord>
  const dummyConfigs: OperationConfigs = {}

  beforeEach(() => {
    instance = setupTestEnvironment()
    vi.clearAllMocks()
    ;(UpdateOperation as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      executeOperation: vi.fn().mockResolvedValue([{ id: 1, name: 'Updated' }])
    }))
  })

  it('updateMany should return updated records', async () => {
    const result = await instance.updateMany(
      { where: { id: 1 }, data: { name: 'Updated' } },
      dummyConfigs
    )
    expect(result).toEqual([{ id: 1, name: 'Updated' }])
  })

  it('updateFirst should return the first updated record', async () => {
    const result = await instance.updateFirst(
      { data: { name: 'Updated' } },
      dummyConfigs
    )
    expect(result).toEqual({ id: 1, name: 'Updated' })
  })

  it('updateUnique should return updated record if exactly one match', async () => {
    const result = await instance.updateUnique(
      { where: { id: 1 }, data: { name: 'Updated' } },
      dummyConfigs
    )
    expect(result).toEqual({ id: 1, name: 'Updated' })
  })

  it('updateUnique should throw if more than one record', async () => {
    ;(UpdateOperation as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      executeOperation: vi.fn().mockResolvedValue([
        { id: 1, name: 'A' },
        { id: 2, name: 'B' }
      ])
    }))
    await expect(
      instance.updateUnique(
        { where: { id: 1 }, data: { name: 'Updated' } },
        dummyConfigs
      )
    ).rejects.toThrow(MultipleRecordsFoundForUniqueError)
  })

  it('updateManyOrThrow should throw if no records found', async () => {
    ;(UpdateOperation as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      executeOperation: vi.fn().mockResolvedValue([])
    }))
    await expect(
      instance.updateManyOrThrow({ data: { name: 'Updated' } }, dummyConfigs)
    ).rejects.toThrow(RecordNotFoundError)
  })

  it('updateLast should return the last updated record', async () => {
    const result = await instance.updateLast(
      { data: { name: 'Updated' } },
      dummyConfigs
    )
    expect(result).toEqual({ id: 1, name: 'Updated' })
  })
})
