import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CliError } from '@/cli/errors/CliError'
import { runCli } from '@/cli/runCli'
import { parseReadFlags } from '@/cli/parse/parseReadFlags'
import { readCliConfig } from '@/cli/config/readCliConfig'
import { normalizeReadCommand } from '@/cli/normalize/normalizeReadCommand'
import { runReadCommand } from '@/cli/commands/runReadCommand'
import { serializeOutput } from '@/cli/output/serializeOutput'
import { writeOutput } from '@/cli/output/writeOutput'

vi.mock('@/cli/parse/parseReadFlags', () => ({
  parseReadFlags: vi.fn()
}))

vi.mock('@/cli/config/readCliConfig', () => ({
  readCliConfig: vi.fn()
}))

vi.mock('@/cli/normalize/normalizeReadCommand', () => ({
  normalizeReadCommand: vi.fn()
}))

vi.mock('@/cli/commands/runReadCommand', () => ({
  runReadCommand: vi.fn()
}))

vi.mock('@/cli/output/serializeOutput', () => ({
  serializeOutput: vi.fn()
}))

vi.mock('@/cli/output/writeOutput', () => ({
  writeOutput: vi.fn()
}))

function flushActions() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

describe('runCli', () => {
  const defaultParsedFlags = {
    skipSheetValidation: false,
    pretty: false,
    select: [],
    omit: [],
    schemaBlocks: [],
    whereBlocks: []
  }

  const defaultNormalizedCommand = {
    source: 'google-sheets' as const,
    operation: 'find-many' as const,
    spreadsheetId: 'id',
    sheet: 'pokemon',
    headerRow: 1,
    skipSheetValidation: false,
    format: 'json' as const,
    output: './out.json',
    pretty: false,
    select: [],
    omit: [],
    where: {}
  }

  let stderrSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    process.exitCode = undefined

    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true)

    vi.mocked(parseReadFlags).mockReturnValue(defaultParsedFlags)
    vi.mocked(readCliConfig).mockReturnValue({})
    vi.mocked(normalizeReadCommand).mockReturnValue(defaultNormalizedCommand)
    vi.mocked(runReadCommand).mockResolvedValue([{ name: 'Bulbasaur' }])
    vi.mocked(serializeOutput).mockReturnValue('SERIALIZED')
    vi.mocked(writeOutput).mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('runs implicit source command and pipelines parse -> normalize -> run -> output', async () => {
    runCli(['read', 'find-many', '--sheet', 'pokemon'])
    await flushActions()

    expect(parseReadFlags).toHaveBeenCalledWith(['--sheet', 'pokemon'])
    expect(readCliConfig).toHaveBeenCalledWith(undefined)
    expect(normalizeReadCommand).toHaveBeenCalledWith({
      operation: 'find-many',
      flags: defaultParsedFlags,
      config: {}
    })
    expect(runReadCommand).toHaveBeenCalledWith(defaultNormalizedCommand)
    expect(serializeOutput).toHaveBeenCalledWith(defaultNormalizedCommand, [
      { name: 'Bulbasaur' }
    ])
    expect(writeOutput).toHaveBeenCalledWith('SERIALIZED', './out.json')
  })

  it('runs explicit source command with group=read', async () => {
    runCli(['google-sheets', 'read', 'find-first', '--sheet', 'pokemon'])
    await flushActions()

    expect(parseReadFlags).toHaveBeenCalledWith(['--sheet', 'pokemon'])
    expect(normalizeReadCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: 'find-first'
      })
    )
  })

  it('reports invalid command group for explicit source', async () => {
    runCli(['google-sheets', 'write', 'find-many'])
    await flushActions()

    expect(stderrSpy).toHaveBeenCalledWith(
      'Invalid command group "write" for source "google-sheets". Use "read".\n'
    )
    expect(process.exitCode).toBe(1)
  })

  it('reports invalid operation', async () => {
    runCli(['read', 'invalid-op'])
    await flushActions()

    expect(stderrSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid read command "invalid-op".')
    )
    expect(process.exitCode).toBe(1)
  })

  it('handles CliError inside command execution', async () => {
    vi.mocked(parseReadFlags).mockImplementationOnce(() => {
      throw new CliError('bad flags', 2)
    })

    runCli(['read', 'find-many', '--sheet', 'pokemon'])
    await flushActions()

    expect(stderrSpy).toHaveBeenCalledWith('bad flags\n')
    expect(process.exitCode).toBe(2)
  })

  it('handles regular Error inside command execution', async () => {
    vi.mocked(runReadCommand).mockRejectedValueOnce(
      new Error('unexpected boom')
    )

    runCli(['read', 'find-many', '--sheet', 'pokemon'])
    await flushActions()

    expect(stderrSpy).toHaveBeenCalledWith('unexpected boom\n')
    expect(process.exitCode).toBe(1)
  })

  it('handles unknown thrown values inside command execution', async () => {
    vi.mocked(runReadCommand).mockRejectedValueOnce('boom')

    runCli(['read', 'find-many', '--sheet', 'pokemon'])
    await flushActions()

    expect(stderrSpy).toHaveBeenCalledWith('Unexpected CLI error.\n')
    expect(process.exitCode).toBe(1)
  })
})
