import { beforeEach, describe, expect, it, vi } from 'vitest'

import HolySheets from '@/index'
import { runReadCommand } from '@/cli/commands/runReadCommand'
import { CliRecord, NormalizedReadCommand } from '@/cli/types'

vi.mock('@/index', () => ({
  default: {
    public: vi.fn()
  }
}))

type MockTable = {
  defineSchema: ReturnType<typeof vi.fn>
  findMany: ReturnType<typeof vi.fn>
  findFirst: ReturnType<typeof vi.fn>
  findUnique: ReturnType<typeof vi.fn>
  findLast: ReturnType<typeof vi.fn>
  findManyOrThrow: ReturnType<typeof vi.fn>
  findFirstOrThrow: ReturnType<typeof vi.fn>
  findUniqueOrThrow: ReturnType<typeof vi.fn>
  findLastOrThrow: ReturnType<typeof vi.fn>
  getHeaders: ReturnType<typeof vi.fn>
}

function createCommand(
  overrides: Partial<NormalizedReadCommand> = {}
): NormalizedReadCommand {
  return {
    source: 'google-sheets',
    operation: 'find-many',
    spreadsheetId: 'spreadsheet-id',
    sheet: 'pokemon',
    headerRow: 1,
    format: 'json',
    pretty: false,
    select: [],
    omit: [],
    where: {},
    ...overrides
  }
}

describe('runReadCommand', () => {
  let table: MockTable
  let publicMock: ReturnType<typeof vi.fn>
  let baseMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    table = {
      defineSchema: vi.fn(),
      findMany: vi.fn().mockResolvedValue([{ id: '1' } satisfies CliRecord]),
      findFirst: vi.fn().mockResolvedValue({ id: '1' } satisfies CliRecord),
      findUnique: vi.fn().mockResolvedValue({ id: '2' } satisfies CliRecord),
      findLast: vi.fn().mockResolvedValue({ id: '3' } satisfies CliRecord),
      findManyOrThrow: vi
        .fn()
        .mockResolvedValue([{ id: '4' } satisfies CliRecord]),
      findFirstOrThrow: vi
        .fn()
        .mockResolvedValue({ id: '5' } satisfies CliRecord),
      findUniqueOrThrow: vi
        .fn()
        .mockResolvedValue({ id: '6' } satisfies CliRecord),
      findLastOrThrow: vi
        .fn()
        .mockResolvedValue({ id: '7' } satisfies CliRecord),
      getHeaders: vi.fn().mockResolvedValue([
        { header: 'name', column: 0 },
        { header: 'type1', column: 1 }
      ])
    }

    baseMock = vi.fn().mockReturnValue(table)
    publicMock = vi.fn().mockReturnValue({
      base: baseMock
    })
    ;(
      HolySheets.public as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation(publicMock)
  })

  it('calls HolySheets.public().base() with sheet and headerRow', async () => {
    await runReadCommand(createCommand())

    expect(publicMock).toHaveBeenCalledWith({
      spreadsheetId: 'spreadsheet-id'
    })
    expect(baseMock).toHaveBeenCalledWith('pokemon', { headerRow: 1 })
  })

  it('calls defineSchema when schema is provided', async () => {
    const schema = [{ key: 'name', type: 'string' as const }]
    await runReadCommand(createCommand({ schema }))

    expect(table.defineSchema).toHaveBeenCalledWith(schema)
  })

  it('runs find-many with where only when select/omit are empty', async () => {
    const result = await runReadCommand(
      createCommand({ operation: 'find-many' })
    )

    expect(table.findMany).toHaveBeenCalledWith({ where: {} })
    expect(result).toEqual([{ id: '1' }])
  })

  it('passes select and omit when provided', async () => {
    await runReadCommand(
      createCommand({
        operation: 'find-many',
        where: { type1: { equals: 'Fire' } },
        select: ['name', 'type1'],
        omit: ['internal_notes']
      })
    )

    expect(table.findMany).toHaveBeenCalledWith({
      where: { type1: { equals: 'Fire' } },
      select: ['name', 'type1'],
      omit: ['internal_notes']
    })
  })

  it('returns null for find-first when no record is found', async () => {
    table.findFirst.mockResolvedValueOnce(undefined)

    const result = await runReadCommand(
      createCommand({ operation: 'find-first' })
    )

    expect(table.findFirst).toHaveBeenCalledWith({ where: {} })
    expect(result).toBeNull()
  })

  it('returns null for find-unique and find-last when no record is found', async () => {
    table.findUnique.mockResolvedValueOnce(undefined)
    table.findLast.mockResolvedValueOnce(undefined)

    const uniqueResult = await runReadCommand(
      createCommand({ operation: 'find-unique' })
    )
    const lastResult = await runReadCommand(
      createCommand({ operation: 'find-last' })
    )

    expect(uniqueResult).toBeNull()
    expect(lastResult).toBeNull()
  })

  it('runs all throw-variants', async () => {
    expect(
      await runReadCommand(createCommand({ operation: 'find-many-or-throw' }))
    ).toEqual([{ id: '4' }])
    expect(
      await runReadCommand(createCommand({ operation: 'find-first-or-throw' }))
    ).toEqual({ id: '5' })
    expect(
      await runReadCommand(createCommand({ operation: 'find-unique-or-throw' }))
    ).toEqual({ id: '6' })
    expect(
      await runReadCommand(createCommand({ operation: 'find-last-or-throw' }))
    ).toEqual({ id: '7' })

    expect(table.findManyOrThrow).toHaveBeenCalledWith({ where: {} })
    expect(table.findFirstOrThrow).toHaveBeenCalledWith({ where: {} })
    expect(table.findUniqueOrThrow).toHaveBeenCalledWith({ where: {} })
    expect(table.findLastOrThrow).toHaveBeenCalledWith({ where: {} })
  })

  it('returns describe metadata with resolved columns and schema fallback', async () => {
    const resultWithoutSchema = await runReadCommand(
      createCommand({ operation: 'describe', schema: undefined })
    )

    expect(resultWithoutSchema).toEqual({
      source: 'google-sheets',
      spreadsheetId: 'spreadsheet-id',
      sheet: 'pokemon',
      headerRow: 1,
      columns: [
        { index: 0, name: 'name' },
        { index: 1, name: 'type1' }
      ],
      schema: []
    })

    const resultWithSchema = await runReadCommand(
      createCommand({
        operation: 'describe',
        schema: [{ key: 'name', type: 'string' as const }]
      })
    )

    expect(resultWithSchema).toEqual({
      source: 'google-sheets',
      spreadsheetId: 'spreadsheet-id',
      sheet: 'pokemon',
      headerRow: 1,
      columns: [
        { index: 0, name: 'name' },
        { index: 1, name: 'type1' }
      ],
      schema: [{ key: 'name', type: 'string' }]
    })
  })
})
